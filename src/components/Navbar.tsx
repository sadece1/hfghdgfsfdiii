import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiSearch, FiX, FiMenu, FiFilter, FiChevronDown } from 'react-icons/fi';
import { useAppStore } from '../store';
import Fuse from 'fuse.js';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser, graders, parts } = useAppStore();
  const searchRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Gelişmiş arama state'leri
  const [searchType, setSearchType] = useState<'all' | 'partNumber' | 'model' | 'description'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState<string[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Clean search functions
  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      const input = searchRef.current?.querySelector('input');
      if (input) input.focus();
    }, 100);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedIndex(-1);
    setShowFilters(false);
    setSearchType('all');
    setStockFilter('all');
    setBrandFilter([]);
    setCountryFilter([]);
  };

  // Fuse.js konfigürasyonu
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.3 },
      { name: 'partNumber', weight: 0.4 },
      { name: 'model', weight: 0.3 },
      { name: 'description', weight: 0.2 },
      { name: 'brand', weight: 0.2 },
      { name: 'category', weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
  };

  // Filtrelenmiş sonuçlar
  const filteredResults = useMemo(() => {
    let filtered = [...graders.map(grader => ({ ...grader, type: 'grader' })), ...parts.map(part => ({ ...part, type: 'part' }))];

    // Stok filtresi (sadece parçalar için)
    if (stockFilter === 'low') {
      filtered = filtered.filter(item => item.type !== 'part' || (item as any).stockQuantity <= 5);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(item => item.type !== 'part' || (item as any).stockQuantity === 0);
    }

    // Marka filtresi
    if (brandFilter.length > 0) {
      filtered = filtered.filter(item => brandFilter.includes(item.brand));
    }

    // Ülke filtresi (sadece parçalar için)
    if (countryFilter.length > 0) {
      filtered = filtered.filter(item => item.type !== 'part' || brandFilter.includes((item as any).stockCountry));
    }

    return filtered;
  }, [graders, parts, stockFilter, brandFilter, countryFilter]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedIndex(-1);

    if (query.trim()) {
      const queryLower = query.toLowerCase();
      
      let results = filteredResults;

      // Arama tipine göre filtreleme
      if (searchType === 'partNumber') {
        // Parça numarası için çok esnek arama
        const normalizedQuery = queryLower.replace(/[\s\-_\.]/g, '');
        results = results.filter(item => {
          if (item.type !== 'part') return false;
          const normalizedPartNumber = (item as any).partNumber.toLowerCase().replace(/[\s\-_\.]/g, '');
          
          // 1. Tam eşleşme kontrolü
          if (normalizedPartNumber.includes(normalizedQuery) || 
              normalizedQuery.includes(normalizedPartNumber)) {
          return true;
        }
        
          // 2. Orijinal arama terimi ile kontrol
          if ((item as any).partNumber.toLowerCase().includes(queryLower)) {
          return true;
        }
        
          // 3. Karakter karakter kontrolü (1r 0 -> 1r0742)
          const queryChars = normalizedQuery.split('');
          const partChars = normalizedPartNumber.split('');
          
          let queryIndex = 0;
          for (let i = 0; i < partChars.length && queryIndex < queryChars.length; i++) {
            if (partChars[i] === queryChars[queryIndex]) {
              queryIndex++;
            }
          }
          
          return queryIndex === queryChars.length;
        });
      } else if (searchType === 'model') {
        results = results.filter(item => {
          if (item.type === 'grader') {
            return (item as any).model?.toLowerCase().includes(queryLower);
          } else if (item.type === 'part') {
            return (item as any).compatibleModels?.some((model: string) => 
              model.toLowerCase().includes(queryLower)
            );
          }
          return false;
        });
      } else if (searchType === 'description') {
        results = results.filter(item => 
          item.description?.toLowerCase().includes(queryLower)
        );
      } else {
        // Tam metin arama - Fuse.js kullan
        const fuse = new Fuse(results, fuseOptions);
        const fuseResults = fuse.search(query);
        results = fuseResults.map(result => result.item);
      }

      // Sonuçları sırala ve sınırla
      const sortedResults = results.sort((a, b) => {
        // Exact part number matches first
        const aIsExactPartNumber = a.type === 'part' && (a as any).partNumber?.toLowerCase() === queryLower;
        const bIsExactPartNumber = b.type === 'part' && (b as any).partNumber?.toLowerCase() === queryLower;
        
        if (aIsExactPartNumber && !bIsExactPartNumber) return -1;
        if (!aIsExactPartNumber && bIsExactPartNumber) return 1;
        
        // Then partial part number matches
        const aIsPartialPartNumber = a.type === 'part' && (a as any).partNumber?.toLowerCase().includes(queryLower);
        const bIsPartialPartNumber = b.type === 'part' && (b as any).partNumber?.toLowerCase().includes(queryLower);
        
        if (aIsPartialPartNumber && !bIsPartialPartNumber) return -1;
        if (!aIsPartialPartNumber && bIsPartialPartNumber) return 1;
        
        return 0;
      }).slice(0, 8);

      setSearchResults(sortedResults);
    } else {
      setSearchResults([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeSearch();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev < searchResults.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        const result = searchResults[selectedIndex];
        navigate(result.type === 'grader' ? `/grader/${result.id}` : `/part/${result.id}`);
        closeSearch();
      } else {
        performSearch();
      }
    }
  };

  const handleResultClick = (result: any) => {
    navigate(result.type === 'grader' ? `/grader/${result.id}` : `/part/${result.id}`);
    closeSearch();
  };

  const performSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
      closeSearch();
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav 
        className={`navbar-content fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
            : 'bg-white shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-lg">G</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">GraderMarket</span>
            </Link>

            {/* Center Navigation Links */}
            <div className="hidden lg:flex items-center space-x-12 mx-12">
              <Link 
                to="/" 
                className="relative text-gray-700 hover:text-orange-600 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-gray-50 group"
              >
                <span>Ana Sayfa</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></div>
              </Link>
              <Link 
                to="/gallery" 
                className="relative text-gray-700 hover:text-orange-600 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-gray-50 group"
              >
                <span>Galeri</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></div>
              </Link>
              <Link 
                to="/parts" 
                className="relative text-gray-700 hover:text-orange-600 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-gray-50 group"
              >
                <span>Parçalar</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></div>
              </Link>
              <Link 
                to="/sales-map" 
                className="relative text-gray-700 hover:text-orange-600 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-gray-50 group"
              >
                <span>Sattığımız Makineler</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></div>
              </Link>
              <Link 
                to="/about" 
                className="relative text-gray-700 hover:text-orange-600 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-gray-50 group"
              >
                <span>Hakkımızda</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></div>
              </Link>
              <Link 
                to="/contact" 
                className="relative text-gray-700 hover:text-orange-600 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-gray-50 group"
              >
                <span>İletişim</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></div>
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center space-x-2">
                {/* Search Button */}
                <button
                  onClick={openSearch}
                  className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-orange-600 px-6 py-3 rounded-xl transition-all duration-200 border border-gray-200 hover:border-orange-600/30 hover:shadow-md min-w-[200px]"
                >
                  <FiSearch className="w-5 h-5" />
                  <span className="text-base font-medium">Gelişmiş Arama...</span>
                </button>

                {/* User Menu */}
                {user && (
                  <div className="relative group">
                    <button className="flex items-center space-x-3 p-3 text-gray-600 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-base">{user.username}</span>
                    </button>
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        {user.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">A</span>
                            </div>
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <FiLogOut className="w-4 h-4 text-red-600" />
                          </div>
                          <span>Çıkış Yap</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Actions */}
              <div className="lg:hidden flex items-center space-x-1 sm:space-x-2">
                {/* Mobile Search Button */}
                <button 
                  onClick={openSearch}
                  className="p-2 sm:p-3 text-gray-600 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <FiSearch className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Mobile User Avatar (if logged in) */}
                {user && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.username}</span>
                  </div>
                )}

                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 sm:p-3 text-gray-600 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <FiMenu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden">
          <div className="absolute top-16 sm:top-20 left-0 right-0 bg-white shadow-xl border-t border-gray-200 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 sm:py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-1">
                <Link 
                  to="/" 
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  Ana Sayfa
                </Link>
                <Link 
                  to="/gallery" 
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  Galeri
                </Link>
                <Link 
                  to="/parts" 
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  Parçalar
                </Link>
                <Link 
                  to="/sales-map" 
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  Sattığımız Makineler
                </Link>
                <Link 
                  to="/about" 
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  Hakkımızda
                </Link>
                <Link 
                  to="/contact" 
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  İletişim
                </Link>
              </div>

              {/* Mobile User Section - Only show if user is logged in */}
              {user && (
              <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    {/* User Info */}
                    <div className="px-3 py-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-white" />
                        </div>
                        <div>
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Admin Panel Link */}
                    {user.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          onClick={closeMobileMenu}
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xs">A</span>
                          </div>
                        <span className="text-sm sm:text-base">Admin Panel</span>
                        </Link>
                      )}

                    {/* Logout Button */}
                      <button
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <FiLogOut className="w-4 h-4 text-red-600" />
                        </div>
                      <span className="text-sm sm:text-base">Çıkış Yap</span>
                      </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
          <div 
            ref={searchRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-6 border-b border-gray-200">
              <div className="space-y-4">
                {/* Ana Arama Input */}
              <div className="relative">
                <input
                  type="text"
                    placeholder="Parça numarası, model, marka veya açıklama ara..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyDown={handleKeyPress}
                  className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  autoFocus
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  onClick={closeSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
                </div>

                {/* Arama Tipi ve Filtreler */}
                <div className="flex items-center gap-4">
                  {/* Arama Tipi */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Arama:</label>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value as any)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                    >
                      <option value="all">Hepsi</option>
                      <option value="partNumber">Parça No</option>
                      <option value="model">Model</option>
                      <option value="description">Açıklama</option>
                    </select>
                  </div>

                  {/* Filtre Butonu */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      showFilters || stockFilter !== 'all' || brandFilter.length > 0 || countryFilter.length > 0
                        ? 'bg-orange-100 text-orange-700 border border-orange-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FiFilter className="w-4 h-4" />
                    <span>Filtreler</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Gelişmiş Filtreler */}
                {showFilters && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    {/* Stok Filtresi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stok Durumu</label>
                      <div className="flex gap-2">
                        {[
                          { value: 'all', label: 'Hepsi' },
                          { value: 'low', label: 'Düşük Stok (≤5)' },
                          { value: 'out', label: 'Stok Yok' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setStockFilter(option.value as any)}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                              stockFilter === option.value
                                ? 'bg-orange-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Marka Filtresi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marka</label>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set([...graders.map(g => g.brand), ...parts.map(p => p.brand)].filter(Boolean))).map(brand => (
                          <button
                            key={brand}
                            onClick={() => {
                              setBrandFilter(prev => 
                                prev.includes(brand) 
                                  ? prev.filter(b => b !== brand)
                                  : [...prev, brand]
                              );
                            }}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                              brandFilter.includes(brand)
                                ? 'bg-orange-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                            }`}
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ülke Filtresi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stok Ülkesi</label>
                      <div className="flex gap-2">
                        {['EU', 'Kenya', 'US'].map(country => (
                          <button
                            key={country}
                            onClick={() => {
                              setCountryFilter(prev => 
                                prev.includes(country) 
                                  ? prev.filter(c => c !== country)
                                  : [...prev, country]
                              );
                            }}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                              countryFilter.includes(country)
                                ? 'bg-orange-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                            }`}
                          >
                            {country}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-[500px] overflow-y-auto">
              {searchQuery.length > 0 && searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedIndex === index
                          ? 'bg-orange-600/10 border border-orange-600/20'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={result.images[0]}
                          alt={result.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{result.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              result.type === 'grader' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {result.type === 'grader' ? 'Grader' : 'Parça'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {result.type === 'grader' 
                              ? `${result.year} • ${result.operatingHours ? result.operatingHours.toLocaleString('tr-TR') : 'N/A'} saat • ${result.fuel}`
                              : `${result.brand} • ${result.category}`
                            }
                          </p>
                          {result.type === 'part' && (
                            <div className="mt-1 space-y-1">
                              <p className="text-xs text-orange-600 font-medium">
                              Parça No: {result.partNumber}
                            </p>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  result.stockQuantity > 0
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  Stok: {result.stockQuantity}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {result.stockCountry}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-orange-600">
                            {new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              minimumFractionDigits: 0,
                            }).format(result.price)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length > 0 && searchResults.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FiSearch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No results found</p>
                  <p className="text-sm">Try searching with different keywords</p>
                </div>
              ) : searchQuery.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FiSearch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Parça numarası ile ara</p>
                  <p className="text-sm">Parça numarası, marka, model veya herhangi bir anahtar kelime yazın</p>
                </div>
              ) : null}
            </div>

            {/* Search Actions */}
            {searchQuery.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={performSearch}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  "{searchQuery}" için ara
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
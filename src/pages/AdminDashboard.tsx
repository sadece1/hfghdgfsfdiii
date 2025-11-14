import { useState, useEffect, useMemo } from 'react';
import { FiEye, FiEdit, FiTrash2, FiPlus, FiTruck, FiSettings, FiCalendar, FiArrowUp, FiArrowDown, FiX, FiSearch, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { SecurityUtils } from '../utils/security';
import Fuse from 'fuse.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { 
    graders, 
    parts, 
    homepageSlider,
    deleteGrader, 
    deletePart,
    updateGrader,
    updatePart,
    setHomepageSlider,
    addHomepageSliderItem,
    updateHomepageSliderItem,
    deleteHomepageSliderItem,
    saveHomepageSlider
  } = useAppStore();
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'graders' | 'parts' | 'homepage' | 'analytics'>('graders');
  const [showProductSelectionModal, setShowProductSelectionModal] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<'grader' | 'part' | null>(null);
  
  // Arama ve filtreleme state'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'partNumber' | 'model' | 'description'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState<string[]>([]);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

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

  // Filtrelenmiş parçalar
  const filteredParts = useMemo(() => {
    let filtered = parts;

    // Stok filtresi
    if (stockFilter === 'low') {
      filtered = filtered.filter(part => part.stockQuantity <= 5);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(part => part.stockQuantity === 0);
    }

    // Marka filtresi
    if (brandFilter.length > 0) {
      filtered = filtered.filter(part => brandFilter.includes(part.brand));
    }

    // Ülke filtresi
    if (countryFilter.length > 0) {
      filtered = filtered.filter(part => countryFilter.includes(part.stockCountry));
    }

    // Arama filtresi
    if (searchQuery.trim()) {
      if (searchType === 'partNumber') {
        // Parça numarası için çok esnek arama
        const normalizedQuery = searchQuery.toLowerCase().replace(/[\s\-_\.]/g, '');
        filtered = filtered.filter(part => {
          const normalizedPartNumber = part.partNumber.toLowerCase().replace(/[\s\-_\.]/g, '');
          
          // 1. Tam eşleşme kontrolü
          if (normalizedPartNumber.includes(normalizedQuery) || 
              normalizedQuery.includes(normalizedPartNumber)) {
            return true;
          }
          
          // 2. Orijinal arama terimi ile kontrol
          if (part.partNumber.toLowerCase().includes(searchQuery.toLowerCase())) {
            return true;
          }
          
          // 3. Karakter karakter kontrolü (1r 0 -> 1r0742)
          const queryChars = normalizedQuery.split('');
          const partChars = normalizedPartNumber.split('');
          
          // Arama terimindeki karakterlerin sırasıyla parça numarasında olup olmadığını kontrol et
          let queryIndex = 0;
          for (let i = 0; i < partChars.length && queryIndex < queryChars.length; i++) {
            if (partChars[i] === queryChars[queryIndex]) {
              queryIndex++;
            }
          }
          
          // Eğer arama terimindeki tüm karakterler sırasıyla bulunduysa
          if (queryIndex === queryChars.length) {
            return true;
          }
          
          return false;
        });
      } else if (searchType === 'model') {
        filtered = filtered.filter(part => 
          part.compatibleModels.some(model => 
            model.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else if (searchType === 'description') {
        filtered = filtered.filter(part => 
          part.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        // Tam metin arama - Fuse.js kullan
        const fuse = new Fuse(filtered, fuseOptions);
        const results = fuse.search(searchQuery);
        filtered = results.map(result => result.item);
      }
    }

    return filtered;
  }, [parts, searchQuery, searchType, stockFilter, brandFilter, countryFilter]);

  // Filtrelenmiş graderlar
  const filteredGraders = useMemo(() => {
    let filtered = graders;

    // Marka filtresi
    if (brandFilter.length > 0) {
      filtered = filtered.filter(grader => brandFilter.includes(grader.brand || ''));
    }

    // Ülke filtresi
    if (countryFilter.length > 0) {
      filtered = filtered.filter(grader => countryFilter.includes(grader.stockCountry));
    }

    // Arama filtresi
    if (searchQuery.trim()) {
      if (searchType === 'model') {
        // Model numarası için çok esnek arama
        const normalizedQuery = searchQuery.toLowerCase().replace(/[\s\-_\.]/g, '');
        filtered = filtered.filter(grader => {
          const normalizedModel = grader.model?.toLowerCase().replace(/[\s\-_\.]/g, '') || '';
          
          // 1. Tam eşleşme kontrolü
          if (normalizedModel.includes(normalizedQuery) || 
              normalizedQuery.includes(normalizedModel)) {
            return true;
          }
          
          // 2. Orijinal arama terimi ile kontrol
          if (grader.model?.toLowerCase().includes(searchQuery.toLowerCase())) {
            return true;
          }
          
          // 3. Karakter karakter kontrolü (140 -> 140M)
          const queryChars = normalizedQuery.split('');
          const modelChars = normalizedModel.split('');
          
          // Arama terimindeki karakterlerin sırasıyla model numarasında olup olmadığını kontrol et
          let queryIndex = 0;
          for (let i = 0; i < modelChars.length && queryIndex < queryChars.length; i++) {
            if (modelChars[i] === queryChars[queryIndex]) {
              queryIndex++;
            }
          }
          
          // Eğer arama terimindeki tüm karakterler sırasıyla bulunduysa
          if (queryIndex === queryChars.length) {
            return true;
          }
          
          return false;
        });
      } else if (searchType === 'description') {
        filtered = filtered.filter(grader => 
          grader.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        // Tam metin arama - Fuse.js kullan
        const fuse = new Fuse(filtered, fuseOptions);
        const results = fuse.search(searchQuery);
        filtered = results.map(result => result.item);
      }
    }

    return filtered;
  }, [graders, searchQuery, searchType, brandFilter, countryFilter]);

  // Benzersiz markalar ve ülkeler
  const uniqueBrands = useMemo(() => {
    const brands = new Set<string>();
    graders.forEach(grader => grader.brand && brands.add(grader.brand));
    parts.forEach(part => brands.add(part.brand));
    return Array.from(brands).sort();
  }, [graders, parts]);

  const uniqueCountries = useMemo(() => {
    const countries = new Set<string>();
    graders.forEach(grader => countries.add(grader.stockCountry));
    parts.forEach(part => countries.add(part.stockCountry));
    return Array.from(countries).sort();
  }, [graders, parts]);

  const handleDeleteGrader = async (graderId: string) => {
    setIsDeleting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      deleteGrader(graderId);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting grader:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeletePart = async (partId: string) => {
    setIsDeleting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      deletePart(partId);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting part:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getCountryFlag = (countryCode: string) => {
    switch (countryCode) {
      case 'EU': return '🇪🇺';
      case 'Kenya': return '🇰🇪';
      case 'US': return '🇺🇸';
      default: return '🌍';
    }
  };

  // Arama sonuçlarında vurgulama için yardımcı fonksiyon
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  const toggleSaleStatus = (type: 'grader' | 'part', id: string) => {
    if (type === 'grader') {
      const grader = graders.find(g => g.id === id);
      if (grader) {
        updateGrader({
          ...grader,
          isSold: !grader.isSold
        });
      }
    } else {
      const part = parts.find(p => p.id === id);
      if (part) {
        updatePart({
          ...part,
          isSold: !part.isSold
        });
      }
    }
  };

  // Homepage Slider Functions
  const addToSlider = (type: 'grader' | 'part', id: string) => {
    // Find the next available order number (1-4)
    const usedOrders = homepageSlider.map(item => item.order);
    let nextOrder = 1;
    while (usedOrders.includes(nextOrder) && nextOrder <= 4) {
      nextOrder++;
    }
    
    // If all 4 slots are full, don't add
    if (nextOrder > 4) {
      alert('Maksimum 4 nokta eklenebilir!');
      return;
    }
    
    const newItem = {
      id: `slider-${Date.now()}`,
      type,
      graderId: type === 'grader' ? id : undefined,
      partId: type === 'part' ? id : undefined,
      order: nextOrder,
      isActive: true,
    };
    addHomepageSliderItem(newItem);
  };

  const removeFromSlider = (sliderId: string) => {
    deleteHomepageSliderItem(sliderId);
  };

  const toggleSliderItem = (sliderId: string) => {
    const item = homepageSlider.find(i => i.id === sliderId);
    if (item) {
      updateHomepageSliderItem({
        ...item,
        isActive: !item.isActive
      });
    }
  };

  const reorderSliderItems = (fromIndex: number, toIndex: number) => {
    const newSlider = [...homepageSlider];
    const [removed] = newSlider.splice(fromIndex, 1);
    newSlider.splice(toIndex, 0, removed);
    
    // Update order numbers
    const updatedSlider = newSlider.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setHomepageSlider(updatedSlider);
  };

  const moveSliderItemUp = (itemId: string) => {
    const sortedSlider = [...homepageSlider].sort((a, b) => a.order - b.order);
    const currentIndex = sortedSlider.findIndex(item => item.id === itemId);
    
    if (currentIndex > 0) {
      reorderSliderItems(currentIndex, currentIndex - 1);
    }
  };

  const moveSliderItemDown = (itemId: string) => {
    const sortedSlider = [...homepageSlider].sort((a, b) => a.order - b.order);
    const currentIndex = sortedSlider.findIndex(item => item.id === itemId);
    
    if (currentIndex < sortedSlider.length - 1) {
      reorderSliderItems(currentIndex, currentIndex + 1);
    }
  };

  const openProductSelectionModal = (type: 'grader' | 'part') => {
    setSelectedProductType(type);
    setShowProductSelectionModal(true);
  };

  const closeProductSelectionModal = () => {
    setShowProductSelectionModal(false);
    setSelectedProductType(null);
  };

  const selectProductForSlider = (productId: string) => {
    if (selectedProductType) {
      addToSlider(selectedProductType, productId);
      closeProductSelectionModal();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Grader ve parça yönetimi
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/admin/add-grader')}
            className="btn-primary flex items-center space-x-2"
          >
            <FiTruck className="w-4 h-4" />
            <span>Grader Ekle</span>
          </button>
          <button
            onClick={() => navigate('/admin/add-part')}
            className="btn-primary flex items-center space-x-2"
          >
            <FiSettings className="w-4 h-4" />
            <span>Parça Ekle</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Toplam Grader</h3>
          <p className="text-3xl font-bold text-orange-600">{graders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Toplam Parça</h3>
          <p className="text-3xl font-bold text-orange-600">{parts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Toplam Ürün</h3>
          <p className="text-3xl font-bold text-orange-600">{graders.length + parts.length}</p>
        </div>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Arama Kutusu */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={
                  searchType === 'partNumber' ? 'Parça numarası (örn: 1R-0742, 1r0742, 1r 0, 1r)' :
                  searchType === 'model' ? 'Model numarası (örn: 140M, 140m, 140, 14)' :
                  searchType === 'description' ? 'Açıklama içinde ara...' :
                  'Tam metin arama...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Arama Tipi Seçici */}
          <div className="lg:w-48">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tam Metin Arama</option>
              <option value="partNumber">Parça Numarası</option>
              <option value="model">Model Numarası</option>
              <option value="description">Açıklama</option>
            </select>
          </div>
          
          {/* Filtre Butonu */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors ${
              showFilters 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiFilter className="w-5 h-5" />
            <span>Filtreler</span>
          </button>
        </div>
        
        {/* Filtreler */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stok Filtresi (Sadece Parçalar için) */}
              {activeTab === 'parts' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stok Durumu</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Tümü</option>
                    <option value="low">Düşük Stok (≤5)</option>
                    <option value="out">Stok Yok (0)</option>
                  </select>
                </div>
              )}
              
              {/* Marka Filtresi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marka</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueBrands.map(brand => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={brandFilter.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBrandFilter([...brandFilter, brand]);
                          } else {
                            setBrandFilter(brandFilter.filter(b => b !== brand));
                          }
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Ülke Filtresi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stok Ülkesi</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueCountries.map(country => (
                    <label key={country} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={countryFilter.includes(country)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCountryFilter([...countryFilter, country]);
                          } else {
                            setCountryFilter(countryFilter.filter(c => c !== country));
                          }
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                        <span className="mr-1">{getCountryFlag(country)}</span>
                        {country}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Filtreleri Temizle */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStockFilter('all');
                  setBrandFilter([]);
                  setCountryFilter([]);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('graders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'graders'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Graders ({filteredGraders.length}/{graders.length})
          </button>
          <button
            onClick={() => setActiveTab('parts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'parts'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Parçalar ({filteredParts.length}/{parts.length})
          </button>
          <button
            onClick={() => setActiveTab('homepage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'homepage'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ana Sayfa Slider ({homepageSlider.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'graders' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Graders</h2>
              {searchQuery && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{filteredGraders.length}</span> sonuç bulundu
                  {searchType !== 'all' && (
                    <span className="ml-2 text-orange-600">
                      ({searchType === 'partNumber' ? 'Parça Numarası' : 
                        searchType === 'model' ? 'Model' : 
                        searchType === 'description' ? 'Açıklama' : 'Tam Metin'} araması)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grader
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yıl
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok Ülkesi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İlan Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satış Durumu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGraders.map((grader) => (
                  <tr key={grader.id} className="hover:bg-gray-50 group relative">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-16">
                          <img
                            className="h-12 w-16 rounded object-cover"
                            src={grader.images[0]}
                            alt={SecurityUtils.sanitizeHtml(grader.title)}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {SecurityUtils.sanitizeHtml(grader.title)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {SecurityUtils.sanitizeHtml(grader.location)}
                            {grader.model && (
                              <span className="ml-2 text-orange-600 font-medium">
                                <span 
                                  dangerouslySetInnerHTML={{
                                    __html: highlightSearchTerm(
                                      SecurityUtils.sanitizeHtml(grader.model || ''), 
                                      searchQuery
                                    )
                                  }}
                                />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute left-0 top-0 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none min-w-80">
                        <div className="space-y-2">
                          <div>
                            <span className="font-semibold">Marka:</span>
                            <span className="text-gray-300 ml-2">{SecurityUtils.sanitizeHtml(grader.brand || '')}</span>
                          </div>
                          <div>
                            <span className="font-semibold">Model:</span>
                            <span className="text-gray-300 ml-2">{SecurityUtils.sanitizeHtml(grader.model || '')}</span>
                          </div>
                          <div>
                            <span className="font-semibold">Lokasyon:</span>
                            <span className="text-gray-300 ml-2">{SecurityUtils.sanitizeHtml(grader.location)}</span>
                          </div>
                          {grader.description && (
                            <div>
                              <span className="font-semibold">Açıklama:</span>
                              <p className="text-gray-300">{SecurityUtils.sanitizeHtml(grader.description)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(grader.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grader.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <span>{getCountryFlag(grader.stockCountry)}</span>
                        <span>{grader.stockCountry}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-3 h-3 text-gray-400" />
                        <span>{formatDate(grader.listingDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleSaleStatus('grader', grader.id)}
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                          grader.isSold 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {grader.isSold ? 'Satıldı' : 'Satışta'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        grader.isNew 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {grader.isNew ? 'Yeni' : 'İkinci El'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/grader/${grader.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/edit-grader/${grader.id}`)}
                          className="text-orange-600 hover:text-orange-900 p-1"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addToSlider('grader', grader.id)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Slider'a Ekle"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(grader.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'parts' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Parçalar</h2>
              {searchQuery && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{filteredParts.length}</span> sonuç bulundu
                  {searchType !== 'all' && (
                    <span className="ml-2 text-orange-600">
                      ({searchType === 'partNumber' ? 'Parça Numarası' : 
                        searchType === 'model' ? 'Model' : 
                        searchType === 'description' ? 'Açıklama' : 'Tam Metin'} araması)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parça
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok Ülkesi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok Miktarı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İlan Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satış Durumu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50 group relative">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-16">
                          <img
                            className="h-12 w-16 rounded object-cover"
                            src={part.images[0]}
                            alt={SecurityUtils.sanitizeHtml(part.title)}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {SecurityUtils.sanitizeHtml(part.title)}
                          </div>
                          <div className="text-sm text-gray-500">
                            <span 
                              dangerouslySetInnerHTML={{
                                __html: highlightSearchTerm(
                                  SecurityUtils.sanitizeHtml(part.partNumber), 
                                  searchQuery
                                )
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute left-0 top-0 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none min-w-80">
                        <div className="space-y-2">
                          <div>
                            <span className="font-semibold">Açıklama:</span>
                            <p className="text-gray-300">{SecurityUtils.sanitizeHtml(part.description)}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Uyumlu Modeller:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {part.compatibleModels.slice(0, 5).map(model => (
                                <span key={model} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                                  {model}
                                </span>
                              ))}
                              {part.compatibleModels.length > 5 && (
                                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                                  +{part.compatibleModels.length - 5} daha
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="font-semibold">Özellikler:</span>
                            <div className="text-gray-300 text-xs space-y-1">
                              <div>Malzeme: {part.specifications.material}</div>
                              <div>Ağırlık: {part.specifications.weight}</div>
                              <div>Garanti: {part.specifications.warranty}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(part.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {SecurityUtils.sanitizeHtml(part.brand)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {SecurityUtils.sanitizeHtml(part.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <span>{getCountryFlag(part.stockCountry)}</span>
                        <span>{part.stockCountry}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          part.stockQuantity === 0 
                            ? 'bg-red-100 text-red-800' 
                            : part.stockQuantity <= 5 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {part.stockQuantity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {part.stockQuantity === 0 ? 'Stok Yok' : 
                           part.stockQuantity <= 5 ? 'Düşük Stok' : 'Stokta'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-3 h-3 text-gray-400" />
                        <span>{formatDate(part.listingDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleSaleStatus('part', part.id)}
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                          part.isSold 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {part.isSold ? 'Satıldı' : 'Satışta'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        part.isNew 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {part.isNew ? 'Yeni' : 'İkinci El'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/part/${part.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/edit-part/${part.id}`)}
                          className="text-orange-600 hover:text-orange-900 p-1"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addToSlider('part', part.id)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Slider'a Ekle"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(part.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'homepage' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ana Sayfa Slider Yönetimi</h2>
                <p className="text-gray-600 mt-1">Ana sayfada gösterilecek ürünleri düzenleyin</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => openProductSelectionModal('grader')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FiTruck className="w-4 h-4" />
                  <span>Grader Seç</span>
                </button>
                <button
                  onClick={() => openProductSelectionModal('part')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FiSettings className="w-4 h-4" />
                  <span>Parça Seç</span>
                </button>
                <button
                  onClick={() => navigate('/admin/add-grader')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Yeni Grader</span>
                </button>
                <button
                  onClick={() => navigate('/admin/add-part')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Yeni Parça</span>
                </button>
                <button
                  onClick={() => {
                    // Force save homepage slider
                    saveHomepageSlider();
                    // Force page refresh to update home page
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                    alert('Ana sayfa slider\'ı kaydedildi ve sayfa güncellendi!');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FiSettings className="w-4 h-4" />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* 4 Dot Slider Management */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Slider Noktaları (4 Adet)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((dotNumber) => {
                  const item = homepageSlider.find(item => item.order === dotNumber);
                  const data = item ? (item.type === 'grader' 
                    ? graders.find(g => g.id === item.graderId)
                    : parts.find(p => p.id === item.partId)) : null;
                  
                  return (
                    <div key={dotNumber} className="border border-gray-200 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">
                          {dotNumber}
                        </div>
                        <h4 className="font-medium text-gray-900">Nokta {dotNumber}</h4>
                      </div>
                      
                      {item && data ? (
                        <div className="space-y-3">
                          <div className="w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={data.images[0]} 
                              alt={data.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 truncate">{data.title}</p>
                            <p className="text-xs text-gray-600">
                              {item.type === 'grader' ? '🚜 Grader' : '🔧 Parça'}
                            </p>
                            <p className="text-xs text-gray-500">₺{data.price.toLocaleString('tr-TR')}</p>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => toggleSliderItem(item.id)}
                              className={`flex-1 px-2 py-1 rounded text-xs font-medium ${
                                item.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.isActive ? 'Aktif' : 'Pasif'}
                            </button>
                            <button
                              onClick={() => removeFromSlider(item.id)}
                              className="px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded text-xs"
                              title="Sil"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 mb-3">Boş Nokta</p>
                          <div className="space-y-2">
                            <button
                              onClick={() => openProductSelectionModal('grader')}
                              className="w-full px-3 py-2 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                            >
                              Grader Ekle
                            </button>
                            <button
                              onClick={() => openProductSelectionModal('part')}
                              className="w-full px-3 py-2 bg-green-100 text-green-800 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                            >
                              Parça Ekle
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Current Slider Items List */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mevcut Slider Öğeleri</h3>
              <div className="space-y-4">
                {homepageSlider
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => {
                    const data = item.type === 'grader' 
                      ? graders.find(g => g.id === item.graderId)
                      : parts.find(p => p.id === item.partId);
                    
                    if (!data) return null;

                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {item.order}
                          </div>
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={data.images[0]} 
                              alt={data.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{data.title}</h3>
                            <p className="text-sm text-gray-600">
                              {item.type === 'grader' ? '🚜 Grader' : '🔧 Parça'} • 
                              {data.brand} • 
                              ₺{data.price.toLocaleString('tr-TR')}
                            </p>
                            <p className="text-xs text-gray-500">Sıra: {item.order}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => moveSliderItemUp(item.id)}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Yukarı Taşı"
                            >
                              <FiArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveSliderItemDown(item.id)}
                              disabled={index === homepageSlider.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Aşağı Taşı"
                            >
                              <FiArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => toggleSliderItem(item.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.isActive ? 'Aktif' : 'Pasif'}
                          </button>
                          <button
                            onClick={() => removeFromSlider(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Slider'dan Kaldır"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              
                {homepageSlider.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiPlus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz slider'a ürün eklenmemiş</h3>
                    <p className="text-gray-500 mb-6">Ana sayfada gösterilecek ürünleri eklemek için aşağıdaki butonları kullanın</p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => openProductSelectionModal('grader')}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <FiTruck className="w-4 h-4" />
                        <span>Grader Seç</span>
                      </button>
                      <button
                        onClick={() => openProductSelectionModal('part')}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>Parça Seç</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Selection Modal */}
      {showProductSelectionModal && selectedProductType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedProductType === 'grader' ? 'Grader Seç' : 'Parça Seç'}
                </h3>
                <button
                  onClick={closeProductSelectionModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">
                Ana sayfa slider'ına eklemek için {selectedProductType === 'grader' ? 'grader' : 'parça'} seçin
              </p>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedProductType === 'grader' ? graders : parts).map((product) => {
                  const isAlreadyInSlider = homepageSlider.some(item => 
                    (selectedProductType === 'grader' && item.graderId === product.id) ||
                    (selectedProductType === 'part' && item.partId === product.id)
                  );
                  
                  return (
                    <div 
                      key={product.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isAlreadyInSlider 
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' 
                          : 'border-gray-200 hover:border-orange-500 hover:shadow-md'
                      }`}
                      onClick={() => !isAlreadyInSlider && selectProductForSlider(product.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={product.images[0]} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{product.title}</h4>
                          <p className="text-sm text-gray-600">
                            {selectedProductType === 'grader' 
                              ? `${(product as any).year} • ${product.brand}` 
                              : `${product.brand} • ${(product as any).category}`
                            }
                          </p>
                          <p className="text-sm font-semibold text-orange-600">
                            {formatPrice(product.price)}
                          </p>
                          {isAlreadyInSlider && (
                            <p className="text-xs text-gray-500 mt-1">✓ Zaten slider'da</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {(selectedProductType === 'grader' ? graders : parts).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Henüz {selectedProductType === 'grader' ? 'grader' : 'parça'} eklenmemiş</p>
                  <button
                    onClick={() => {
                      closeProductSelectionModal();
                      navigate(selectedProductType === 'grader' ? '/admin/add-grader' : '/admin/add-part');
                    }}
                    className="mt-4 btn-primary"
                  >
                    {selectedProductType === 'grader' ? 'Yeni Grader Ekle' : 'Yeni Parça Ekle'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Silme Onayı
            </h3>
            <p className="text-gray-600 mb-6">
              Bu öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                İptal
              </button>
              <button
                onClick={() => {
                  if (graders.find(g => g.id === showDeleteModal)) {
                    handleDeleteGrader(showDeleteModal);
                  } else if (parts.find(p => p.id === showDeleteModal)) {
                    handleDeletePart(showDeleteModal);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
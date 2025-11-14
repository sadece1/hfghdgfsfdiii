import { useState, useEffect, useRef } from 'react';
import { FiGrid, FiList } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FilterSidebar from '../components/FilterSidebar';
import Footer from '../components/Footer';
import { useAppStore } from '../store';

gsap.registerPlugin(ScrollTrigger);

const Parts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { graders, parts, filters } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const searchQuery = searchParams.get('search') || '';

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

  const getCountryFlag = (country: string) => {
    switch (country) {
      case 'EU': return '🇪🇺';
      case 'Kenya': return '🇰🇪';
      case 'US': return '🇺🇸';
      default: return '🌍';
    }
  };

  // Filter parts based on current filters and search
  const filteredParts = parts.filter(part => {
    // Search filter - check both graders and parts
    if (searchQuery) {
      const partMatches = part.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.partNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Check if search query matches any graders
      const hasGraderMatch = graders.some(grader => 
        grader.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grader.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grader.model?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // If graders match, show all parts; otherwise only show matching parts
      if (!partMatches && !hasGraderMatch) {
        return false;
      }
    }

    const matchesBrand = filters.brand.length === 0 || filters.brand.includes(part.brand);
    const matchesPrice = part.price >= filters.price.min && part.price <= filters.price.max;
    const matchesCategory = filters.category.length === 0 || filters.category.includes(part.category);
    const matchesStockCountry = filters.stockCountry.length === 0 || filters.stockCountry.includes(part.stockCountry);
    const matchesSaleStatus = filters.saleStatus.length === 0 || filters.saleStatus.includes(part.isSold ? 'Satılmış' : 'Satılık');
    
    return matchesBrand && matchesPrice && matchesCategory && matchesStockCountry && matchesSaleStatus;
  });

  useEffect(() => {
    if (headerRef.current && statsRef.current) {
      gsap.fromTo(headerRef.current, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );

      gsap.fromTo(statsRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div ref={headerRef} className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Premium Parçalar
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cat ve Komatsu markalarının orijinal grader parçalarını keşfedin.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-lg">
              {searchQuery ? `"${searchQuery}" için ` : ''}<span className="font-bold">{filteredParts.length}</span> parça bulundu
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <FilterSidebar />
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-end mb-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Parts Grid */}
            {filteredParts.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                      {filteredParts.map(part => (
                        <div 
                          key={part.id} 
                          onClick={() => navigate(`/part/${part.id}`)}
                          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                        >
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={part.images[0]}
                        alt={part.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {part.isNew && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Yeni İlan
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium shadow-sm">
                        {getCountryFlag(part.stockCountry)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-hidden">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1 break-words">
                            {part.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {part.brand} • {part.category}
                          </p>
                          <p className="text-xs text-gray-500">
                            Parça No: {part.partNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-orange-600 mb-2">
                            {formatPrice(part.price)}
                          </div>
                          <div className="space-y-1">
                            {part.isNew && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Yeni
                              </span>
                            )}
                            <div>
                              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                                part.stockQuantity > 0 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                Stok: {part.stockQuantity}
                              </span>
                            </div>
                            <div>
                              <span className={`text-sm px-3 py-2 rounded-lg font-bold shadow-md ${
                                part.isSold 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-green-500 text-white'
                              }`}>
                                {part.isSold ? 'SATILDI' : 'SATIŞTA'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2 break-words overflow-hidden">
                        {part.description}
                      </p>

                      {/* Compatible Models */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Uyumlu Modeller:</p>
                        <div className="flex flex-wrap gap-1">
                          {part.compatibleModels.slice(0, 3).map(model => (
                            <span key={model} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {model}
                            </span>
                          ))}
                          {part.compatibleModels.length > 3 && (
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              +{part.compatibleModels.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {formatDate(part.listingDate)}
                          </span>
                        </div>
                      </div>

                      {/* Specifications */}
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Malzeme:</span>
                          <span className="text-gray-700">{part.specifications.material}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Ağırlık:</span>
                          <span className="text-gray-700">{part.specifications.weight}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Garanti:</span>
                          <span className="text-gray-700">{part.specifications.warranty}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/part/${part.id}`);
                          }}
                          className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                        >
                          Detayları Gör
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.636M15 6.708A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.636" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aradığınız kriterlere uygun parça bulunamadı
                </h3>
                <p className="text-gray-600 mb-4">
                  Filtreleri değiştirerek tekrar deneyin veya farklı kriterler arayın.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Parts;

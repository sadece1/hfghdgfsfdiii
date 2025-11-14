import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const HomePage = () => {
  const { graders, parts, homepageSlider } = useAppStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [, setCurrentX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const getSliderData = (item: any) => {
    if (item.type === 'grader') {
      return graders.find(g => g.id === item.graderId);
    } else {
      return parts.find(p => p.id === item.partId);
    }
  };

  // Admin'deki 4 nokta mantığına göre slider items
  const getSliderItemsForDisplay = () => {
    const items = [];
    for (let i = 1; i <= 4; i++) {
      const item = homepageSlider.find(item => item.order === i && item.isActive);
      if (item) {
        const data = getSliderData(item);
        if (data) {
          items.push({ ...item, data });
        }
      }
    }
    return items;
  };

  const displaySliderItems = getSliderItemsForDisplay();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Force re-render when homepageSlider changes
  useEffect(() => {
    // This will trigger a re-render when homepageSlider changes
    console.log('HomePage - Slider updated:', homepageSlider.length, 'items');
  }, [homepageSlider]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || displaySliderItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySliderItems.length);
    }, 4000); // 4 saniyede bir değişsin

    return () => clearInterval(interval);
  }, [isAutoPlaying, displaySliderItems.length]);

  // Pause auto-play when user interacts
  useEffect(() => {
    if (isDragging) {
      setIsAutoPlaying(false);
    }
  }, [isDragging]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displaySliderItems.length);
    setIsAutoPlaying(true); // Restart auto-play after manual navigation
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + displaySliderItems.length) % displaySliderItems.length);
    setIsAutoPlaying(true); // Restart auto-play after manual navigation
  };

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startX;
    setCurrentX(clientX);
    setDragOffset(deltaX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const threshold = 50;
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    } else {
      // If no significant drag, restart auto-play after a delay
      setTimeout(() => {
        setIsAutoPlaying(true);
      }, 2000);
    }
    
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    handleDragEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setCurrentX(touch.clientY); // Store Y for vertical detection
    handleDragStart(touch.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = Math.abs(touch.clientY - (currentX as number));
    
    // Only handle horizontal swipes, allow vertical scrolling
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      e.preventDefault(); // Prevent scrolling only for horizontal swipes
      handleDragMove(touch.clientX);
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const benefits = [
    {
      icon: "🛡️",
      title: "Güvenli Alışveriş",
      description: "Tüm grader ve parçalarımız detaylı kontrol edilir ve kalite sertifikalarına sahiptir."
    },
    {
      icon: "💰",
      title: "En İyi Fiyatlar",
      description: "Piyasadaki en rekabetçi fiyatlarla premium grader ve parçaları keşfedin."
    },
    {
      icon: "🚜",
      title: "Geniş Seçenek",
      description: "Cat ve Komatsu markalarından binlerce grader ve parça arasından ihtiyacınıza uygun olanı bulun."
    },
    {
      icon: "⚡",
      title: "Hızlı Teslimat",
      description: "Stoktan hızlı teslimat ile işinizi aksatmadan grader ve parçalarınızı alın."
    }
  ];

  const brands = [
    { name: "Caterpillar", logo: "🚜" },
    { name: "Komatsu", logo: "🔧" },
    { name: "John Deere", logo: "🌾" },
    { name: "Volvo", logo: "🏗️" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/rsm/Grader_2.jpg")'
            }}
          />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Grader & Parça Merkezi
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Cat ve Komatsu markalarının en kaliteli grader ve parçalarını keşfedin. 
            Yol yapımında güvenilir çözümler için doğru adres.
          </p>
          <Link 
            to="/gallery"
            className="inline-block bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors duration-300"
          >
            Ürünleri Keşfet
          </Link>
        </div>
      </section>

      {/* Featured Products Slider */}
      {displaySliderItems.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Öne Çıkan Ürünler
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                En popüler grader ve parçalarımızı keşfedin
              </p>
            </div>

            <div className="relative">
              <div 
                className="overflow-hidden rounded-xl cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => {
                  handleMouseLeave();
                  setIsAutoPlaying(true);
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'pan-y pinch-zoom' }}
              >
                <div 
                  className="flex transition-transform duration-300 ease-out"
                  style={{ 
                    transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                  }}
                >
                  {displaySliderItems.map((item) => {
                    return (
                      <div key={item.id} className="w-full flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                            {/* Image */}
                            <div className="relative">
                              <img
                                src={item.data.images[0]}
                                alt={item.data.title}
                                className="w-full h-80 object-cover rounded-lg"
                              />
                              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full">
                                {item.type === 'grader' ? '🚜 Grader' : '🔧 Parça'}
                              </div>
                              {item.data.isSold && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold">
                                  SATILDI
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col justify-center">
                              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                {item.data.title}
                              </h3>
                              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                {item.data.description}
                              </p>
                              
                              <div className="space-y-3 mb-6">
                                <div className="flex items-center">
                                  <span className="font-semibold text-gray-700 w-24">Marka:</span>
                                  <span className="text-gray-900">{item.data.brand}</span>
                                </div>
                                {item.type === 'grader' && (
                                  <>
                                    <div className="flex items-center">
                                      <span className="font-semibold text-gray-700 w-24">Model:</span>
                                      <span className="text-gray-900">{(item.data as any).model}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="font-semibold text-gray-700 w-24">Yıl:</span>
                                      <span className="text-gray-900">{(item.data as any).year}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="font-semibold text-gray-700 w-24">Saat:</span>
                                      <span className="text-gray-900">{(item.data as any).hours?.toLocaleString()} saat</span>
                                    </div>
                                  </>
                                )}
                                {item.type === 'part' && (
                                  <>
                                    <div className="flex items-center">
                                      <span className="font-semibold text-gray-700 w-24">Parça No:</span>
                                      <span className="text-gray-900">{(item.data as any).partNumber}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="font-semibold text-gray-700 w-24">Kategori:</span>
                                      <span className="text-gray-900">{(item.data as any).category}</span>
                                    </div>
                                  </>
                                )}
                                <div className="flex items-center">
                                  <span className="font-semibold text-gray-700 w-24">Stok:</span>
                                  <span className="text-gray-900">
                                    {item.data.stockCountry === 'EU' ? '🇪🇺' : item.data.stockCountry === 'Kenya' ? '🇰🇪' : '🇺🇸'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold text-orange-600">
                                  ₺{item.data.price?.toLocaleString()}
                                </div>
                                <Link
                                  to={item.type === 'grader' ? `/grader/${item.data.id}` : `/part/${item.data.id}`}
                                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-300"
                                >
                                  Detayları Gör
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              {displaySliderItems.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300"
                  >
                    <FiChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300"
                  >
                    <FiChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Dots */}
              {displaySliderItems.length > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {displaySliderItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide ? 'bg-orange-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-20 bg-white mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Neden Bizi Seçmelisiniz?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Grader ve parça deneyiminizi bir üst seviyeye taşıyacak avantajlarımızı keşfedin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-6xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Güvenilir Markalar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dünya çapında tanınan markalardan en kaliteli grader ve parçaları
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {brands.map((brand, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-6xl mb-4">{brand.logo}</div>
                <h3 className="text-xl font-bold text-gray-900">{brand.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Hemen Başlayın
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            İhtiyacınız olan grader veya parçayı bulun ve işinizi büyütün
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/gallery"
              className="bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              Ürünleri Görüntüle
            </Link>
            <Link 
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors duration-300"
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

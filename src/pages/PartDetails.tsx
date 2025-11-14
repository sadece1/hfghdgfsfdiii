import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShare2, FiTruck, FiSettings, FiCheckCircle } from 'react-icons/fi';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAppStore } from '../store';
import { SecurityUtils } from '../utils/security';

gsap.registerPlugin(ScrollTrigger);

const PartDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { parts } = useAppStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);

  const part = parts.find(p => p.id === id);

  useEffect(() => {
    if (headerRef.current && specsRef.current) {
      gsap.fromTo(headerRef.current, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );

      gsap.fromTo(specsRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: "power2.out" }
      );
    }
  }, []);

  if (!part) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Parça Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız parça mevcut değil.</p>
          <button
            onClick={() => navigate('/parts')}
            className="btn-primary"
          >
            Parçalara Dön
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: part.title,
          text: part.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div ref={headerRef} className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/parts')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {SecurityUtils.sanitizeHtml(part.title)}
                </h1>
                <p className="text-gray-600">
                  {SecurityUtils.sanitizeHtml(part.brand)} • {SecurityUtils.sanitizeHtml(part.category)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiShare2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
              <img
                src={part.images[currentImageIndex]}
                alt={SecurityUtils.sanitizeHtml(part.title)}
                className="w-full h-full object-cover"
              />
            </div>
            
            {part.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {part.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-lg ${
                      currentImageIndex === index 
                        ? 'ring-2 ring-orange-600' 
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${SecurityUtils.sanitizeHtml(part.title)} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Price and Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {formatPrice(part.price)}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      • İlan: {formatDate(part.listingDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      part.isNew 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {part.isNew ? 'Yeni' : 'İkinci El'}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      part.stockQuantity > 0 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Stok: {part.stockQuantity} adet
                    </span>
                    <span className="text-sm text-gray-500">
                      Parça No: {SecurityUtils.sanitizeHtml(part.partNumber)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => window.open(`tel:+905551234567`, '_self')}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  📞 Telefon Et
                </button>
                <button 
                  onClick={() => window.open(`https://wa.me/905551234567?text=Merhaba, ${part.title} hakkında bilgi almak istiyorum.`, '_blank')}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>

            {/* Compatible Models */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiTruck className="w-5 h-5 text-orange-600 mr-2" />
                Uyumlu Modeller
              </h3>
              <div className="flex flex-wrap gap-2">
                {part.compatibleModels.map((model, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {SecurityUtils.sanitizeHtml(model)}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Açıklama</h3>
              <p className="text-gray-700 leading-relaxed">
                {SecurityUtils.sanitizeHtml(part.description)}
              </p>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div ref={specsRef} className="mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FiSettings className="w-6 h-6 text-orange-600 mr-3" />
              Teknik Özellikler
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {SecurityUtils.sanitizeHtml(part.specifications.material)}
                </div>
                <div className="text-sm text-gray-600">Malzeme</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {SecurityUtils.sanitizeHtml(part.specifications.dimensions)}
                </div>
                <div className="text-sm text-gray-600">Boyutlar</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {SecurityUtils.sanitizeHtml(part.specifications.weight)}
                </div>
                <div className="text-sm text-gray-600">Ağırlık</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {SecurityUtils.sanitizeHtml(part.specifications.warranty)}
                </div>
                <div className="text-sm text-gray-600">Garanti</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FiCheckCircle className="w-6 h-6 text-orange-600 mr-3" />
              Özellikler
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Orijinal parça</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Hızlı teslimat</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Garantili ürün</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Teknik destek</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartDetails;

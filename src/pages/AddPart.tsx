import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import { useAppStore } from '../store';
import { Part } from '../types';
import { SecurityUtils } from '../utils/security';

const AddPart = () => {
  const navigate = useNavigate();
  const { addPart } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: '',
    price: '',
    partNumber: '',
    compatibleModels: [''],
    description: '',
    images: [''],
    specifications: {
      material: '',
      dimensions: '',
      weight: '',
      warranty: ''
    },
    stockQuantity: '',
    isNew: true,
    isSold: false,
    listingDate: new Date().toISOString().split('T')[0], // Bugünün tarihi
    stockCountry: 'EU' as Part['stockCountry']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Başlık gereklidir';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Marka gereklidir';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Kategori gereklidir';
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Geçerli bir fiyat giriniz';
    }
    if (!formData.partNumber.trim()) {
      newErrors.partNumber = 'Parça numarası gereklidir';
    }
    if (!formData.stockQuantity || isNaN(Number(formData.stockQuantity)) || Number(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Geçerli bir stok miktarı giriniz (0 veya daha büyük)';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Sanitize all text inputs
      const sanitizedFormData = {
        ...formData,
        title: SecurityUtils.sanitizeHtml(formData.title.trim()),
        brand: SecurityUtils.sanitizeHtml(formData.brand.trim()),
        category: SecurityUtils.sanitizeHtml(formData.category.trim()),
        partNumber: SecurityUtils.sanitizeHtml(formData.partNumber.trim()),
        description: SecurityUtils.sanitizeHtml(formData.description.trim()),
        specifications: {
          ...formData.specifications,
          material: SecurityUtils.sanitizeHtml(formData.specifications.material),
          dimensions: SecurityUtils.sanitizeHtml(formData.specifications.dimensions),
          weight: SecurityUtils.sanitizeHtml(formData.specifications.weight),
          warranty: SecurityUtils.sanitizeHtml(formData.specifications.warranty),
        },
        compatibleModels: formData.compatibleModels.map(m => SecurityUtils.sanitizeHtml(m.trim())).filter(m => m !== ''),
        images: formData.images.filter(img => img.trim() !== '')
      };
      
      const newPart: Part = {
        id: SecurityUtils.generateSecureToken(16),
        title: sanitizedFormData.title,
        brand: sanitizedFormData.brand,
        category: sanitizedFormData.category,
        price: Number(formData.price),
        partNumber: sanitizedFormData.partNumber,
        compatibleModels: sanitizedFormData.compatibleModels,
        description: sanitizedFormData.description,
        images: sanitizedFormData.images,
        specifications: sanitizedFormData.specifications,
        stockQuantity: Number(formData.stockQuantity),
        isNew: formData.isNew,
        isSold: formData.isSold,
        createdAt: new Date().toISOString(),
        listingDate: new Date().toISOString(),
        stockCountry: formData.stockCountry
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      addPart(newPart);
      navigate('/admin');
    } catch (error) {
      console.error('Error adding part:', error);
      setErrors({ general: 'An error occurred while adding the part. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCompatibleModel = () => {
    setFormData(prev => ({
      ...prev,
      compatibleModels: [...prev.compatibleModels, '']
    }));
  };

  const removeCompatibleModel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      compatibleModels: prev.compatibleModels.filter((_, i) => i !== index)
    }));
  };

  const updateCompatibleModel = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      compatibleModels: prev.compatibleModels.map((m, i) => i === index ? value : m)
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yeni Parça Ekle</h1>
                <p className="text-gray-600">Yeni bir parça ilanı oluşturun</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin')}
                className="btn-secondary"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`btn-primary flex items-center space-x-2 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiSave className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Temel Bilgiler</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parça Adı *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Caterpillar Blade Edge"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marka *
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                    errors.brand ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Marka Seçin</option>
                  <option value="Cat">Cat</option>
                  <option value="Komatsu">Komatsu</option>
                </select>
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Blade Parts"
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlana Koyma Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.listingDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, listingDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                    errors.listingDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.listingDate && <p className="text-red-500 text-sm mt-1">{errors.listingDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok Ülkesi *
                </label>
                <select
                  value={formData.stockCountry}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockCountry: e.target.value as Part['stockCountry'] }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                    errors.stockCountry ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="EU">🇪🇺 Avrupa Stok</option>
                  <option value="Kenya">🇰🇪 Kenya Stok</option>
                  <option value="US">🇺🇸 ABD Stok</option>
                </select>
                {errors.stockCountry && <p className="text-red-500 text-sm mt-1">{errors.stockCountry}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="15000"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parça Numarası *
                </label>
                <input
                  type="text"
                  value={formData.partNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                    errors.partNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1R-0742"
                />
                {errors.partNumber && <p className="text-red-500 text-sm mt-1">{errors.partNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok Miktarı *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                    errors.stockQuantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="15"
                />
                {errors.stockQuantity && <p className="text-red-500 text-sm mt-1">{errors.stockQuantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  value={formData.isNew ? 'new' : 'used'}
                  onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.value === 'new' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                >
                  <option value="new">Yeni</option>
                  <option value="used">İkinci El</option>
                </select>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isSold}
                    onChange={(e) => setFormData(prev => ({ ...prev, isSold: e.target.checked }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Satıldı</span>
                </label>
              </div>
            </div>
          </div>

          {/* Compatible Models */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Uyumlu Modeller</h2>
            
            <div className="space-y-4">
              {formData.compatibleModels.map((model, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => updateCompatibleModel(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                    placeholder="140M"
                  />
                  <button
                    type="button"
                    onClick={() => removeCompatibleModel(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addCompatibleModel}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-600 hover:text-orange-600 transition-colors"
              >
                + Model Ekle
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resimler</h2>
            
            <div className="space-y-4">
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => updateImage(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addImage}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-600 hover:text-orange-600 transition-colors"
              >
                + Resim Ekle
              </button>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Teknik Özellikler</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Malzeme</label>
                <input
                  type="text"
                  value={formData.specifications.material}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specifications: { ...prev.specifications, material: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="Hardened Steel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Boyutlar</label>
                <input
                  type="text"
                  value={formData.specifications.dimensions}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specifications: { ...prev.specifications, dimensions: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="3.7m x 0.3m x 0.05m"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ağırlık</label>
                <input
                  type="text"
                  value={formData.specifications.weight}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specifications: { ...prev.specifications, weight: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="45 kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Garanti</label>
                <input
                  type="text"
                  value={formData.specifications.warranty}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specifications: { ...prev.specifications, warranty: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="12 months"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Açıklama</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parça Açıklaması *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Parça hakkında detaylı bilgi..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errors.general}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddPart;

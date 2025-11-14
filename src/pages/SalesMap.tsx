import { useState, useEffect } from 'react';
import { FiMapPin, FiInfo, FiTruck, FiPackage, FiX, FiFlag } from 'react-icons/fi';

interface SalesLocation {
  id: string;
  name: string;
  x: number; // X koordinatı (harita üzerinde yüzde olarak)
  y: number; // Y koordinatı (harita üzerinde yüzde olarak)
  products: string[];
  contact: string;
}

const SalesMap = () => {
  const [selectedLocation, setSelectedLocation] = useState<SalesLocation | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Satış lokasyonları verisi - Sadece makine adları ve numaralar
  const salesLocations: SalesLocation[] = [
    {
      id: '1',
      name: 'Caterpillar 160M',
      x: 45,
      y: 55,
      products: ['Caterpillar 160M', 'Komatsu GD655-7', 'Blade Parts'],
      contact: '+254 700 001 001'
    },
    {
      id: '2',
      name: 'Caterpillar 160M',
      x: 65,
      y: 75,
      products: ['Caterpillar 160M', 'Port Machinery'],
      contact: '+254 700 001 002'
    },
    {
      id: '3',
      name: 'Komatsu GD655-7',
      x: 25,
      y: 50,
      products: ['Caterpillar Parts', 'Komatsu Components'],
      contact: '+254 700 001 003'
    },
    {
      id: '4',
      name: 'Caterpillar 140M',
      x: 35,
      y: 45,
      products: ['Caterpillar 140M', 'Hydraulic Pumps'],
      contact: '+254 700 001 004'
    },
    {
      id: '5',
      name: 'Motor Graders',
      x: 30,
      y: 40,
      products: ['Motor Graders', 'Spare Parts'],
      contact: '+254 700 001 005'
    },
    {
      id: '6',
      name: 'Caterpillar 140M',
      x: 70,
      y: 65,
      products: ['Caterpillar 140M', 'Port Equipment'],
      contact: '+254 700 001 006'
    },
    {
      id: '7',
      name: 'Komatsu GD675-7',
      x: 50,
      y: 50,
      products: ['Komatsu GD675-7', 'Industrial Equipment'],
      contact: '+254 700 001 007'
    },
    {
      id: '8',
      name: 'Caterpillar Parts',
      x: 40,
      y: 50,
      products: ['Caterpillar Parts', 'Agricultural Graders'],
      contact: '+254 700 001 008'
    },
    {
      id: '9',
      name: 'Motor Graders',
      x: 25,
      y: 35,
      products: ['Motor Graders', 'Farm Equipment'],
      contact: '+254 700 001 009'
    },
    {
      id: '10',
      name: 'Caterpillar 140M',
      x: 60,
      y: 40,
      products: ['Caterpillar 140M', 'Desert Equipment'],
      contact: '+254 700 001 010'
    },
    {
      id: '11',
      name: 'Caterpillar 160M',
      x: 15,
      y: 35,
      products: ['Caterpillar 160M', 'Komatsu GD675-7'],
      contact: '+256 700 001 011'
    },
    {
      id: '12',
      name: 'Port Equipment',
      x: 12,
      y: 40,
      products: ['Port Equipment', 'Hydraulic Parts'],
      contact: '+256 700 001 012'
    },
    {
      id: '13',
      name: 'Komatsu GD655-7',
      x: 45,
      y: 85,
      products: ['Komatsu GD655-7', 'Agricultural Graders'],
      contact: '+255 700 001 013'
    },
    {
      id: '14',
      name: 'Caterpillar Parts',
      x: 25,
      y: 60,
      products: ['Caterpillar Parts', 'Lake Equipment'],
      contact: '+255 700 001 014'
    },
    {
      id: '15',
      name: 'Caterpillar 160M',
      x: 55,
      y: 15,
      products: ['Caterpillar 160M', 'Komatsu GD675-7'],
      contact: '+251 700 001 015'
    },
    {
      id: '16',
      name: 'Motor Graders',
      x: 65,
      y: 25,
      products: ['Motor Graders', 'Desert Equipment'],
      contact: '+251 700 001 016'
    },
    {
      id: '17',
      name: 'Caterpillar 140M',
      x: 80,
      y: 45,
      products: ['Caterpillar 140M', 'Coastal Equipment'],
      contact: '+252 700 001 017'
    },
    {
      id: '18',
      name: 'Caterpillar 160M',
      x: 25,
      y: 15,
      products: ['Caterpillar 160M', 'Construction Equipment'],
      contact: '+211 700 001 018'
    }
  ];

  useEffect(() => {
    // Harita yüklendiğinde
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleLocationClick = (location: SalesLocation) => {
    setSelectedLocation(location);
  };

  const closeLocationDetails = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <FiMapPin className="mr-2 sm:mr-3 text-green-600" />
                <span className="break-words">Kenya Satış Haritası</span>
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                Sattığımız makineler ve parçalar
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-600">Sattığımız Makineler</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Map Container */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-3 sm:p-4 border-b">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                  <FiMapPin className="mr-2 text-green-600" />
                  Kenya Haritası
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Yeşil ışıklar sattığımız makineleri gösterir
                </p>
              </div>
              
              {/* Map */}
              <div className="relative">
                <img
                  src="/rsm/kenyareal.jpg"
                  alt="Kenya Haritası"
                  className="w-full h-auto"
                  onLoad={() => setMapLoaded(true)}
                />
                
                {/* Sales Location Markers */}
                {mapLoaded && salesLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationClick(location)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 active:scale-95 text-green-500 hover:text-green-600 touch-manipulation"
                    style={{
                      left: `${location.x}%`,
                      top: `${location.y}%`
                    }}
                    title={location.name}
                  >
                    <div className="relative animate-pulse">
                      <FiMapPin size={24} className="sm:w-8 sm:h-8 text-green-500" />
                      <div className="absolute inset-0 rounded-full bg-green-500 opacity-30 animate-ping"></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location List */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-3 sm:p-4 border-b">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <FiTruck className="mr-2 text-blue-600" />
                  Sattığımız Makineler
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {salesLocations.length} makine lokasyonu
                </p>
              </div>
              
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                {salesLocations.map((location) => (
                    <div
                      key={location.id}
                      onClick={() => handleLocationClick(location)}
                      className="p-2 sm:p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:shadow-lg border-green-200 bg-green-50 hover:bg-green-100 active:bg-green-200 touch-manipulation"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-lg truncate">{location.name}</h4>
                        </div>
                        <FiMapPin className="text-sm sm:text-lg text-green-500 flex-shrink-0 ml-2" />
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Details Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center min-w-0">
                  <FiMapPin className="mr-2 text-green-600 flex-shrink-0" />
                  <span className="truncate">{selectedLocation.name}</span>
                </h3>
                <button
                  onClick={closeLocationDetails}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2 p-1"
                >
                  <FiX size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg sm:text-xl mb-2 break-words">
                    {selectedLocation.name}
                  </h4>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
                <button
                  onClick={closeLocationDetails}
                  className="w-full bg-green-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors touch-manipulation text-sm sm:text-base font-medium"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesMap;

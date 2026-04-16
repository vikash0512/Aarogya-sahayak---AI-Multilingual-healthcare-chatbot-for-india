import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Menu, MapPin, Search, Navigation, Phone, Clock, Star, AlertCircle } from 'lucide-react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { LayoutContextType } from '../components/Layout';

// We'll fetch dynamic placeholder data or real data from Places API below
const fallbackPHCData = [
  {
    id: 1,
    name: 'City Central PHC',
    address: 'Fetching nearby... please wait or check your API key.',
    distance: '-',
    time: '-',
    rating: 0,
    status: 'Unknown',
    phone: '',
    type: 'Clinic',
    lat: 28.6139,
    lng: 77.2090
  }
];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

export default function NearbyPHC() {
  const { toggleSidebar } = useOutletContext<LayoutContextType>();
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [selectedPHC, setSelectedPHC] = useState<any>(null);
  const [phcData, setPhcData] = useState<any[]>(fallbackPHCData);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ['places']
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log("Geolocation permission denied or unavailable.");
        }
      );
    }
  }, []);

  useEffect(() => {
    if (mapRef && isLoaded && userLocation) {
      searchNearbyPlaces(userLocation);
    }
  }, [mapRef, isLoaded, userLocation]);

  const searchNearbyPlaces = (location: any) => {
    if (!window.google) return;
    const service = new google.maps.places.PlacesService(mapRef!);
    const request = {
      location: location,
      radius: 8000, // 8km radius
      keyword: 'hospital clinic health' // Broader search
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setSearchError(null);
        if (results.length === 0) {
           setSearchError("No hospitals found within 8km of your location.");
           return;
        }
        const places = results.map((place, index) => ({
          id: place.place_id || index,
          name: place.name,
          address: place.vicinity || 'Unknown Location',
          distance: 'Nearby',
          time: 'Local',
          rating: place.rating || 4.0,
          status: place.opening_hours?.isOpen() ? 'Open Now' : 'Closed or Unknown',
          phone: '',
          type: 'Health Care Facility',
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng()
        }));
        setPhcData(places);
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        setSearchError("No hospitals found nearby.");
      } else {
        setSearchError(`Google Places API Error: ${status}. Ensure Places API is enabled and billed.`);
      }
    });
  };

  const handleGetDirections = (phc: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${phc.lat},${phc.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-background-light dark:bg-background-dark">
        {/* Header */}
        <header className="flex-none px-6 md:px-8 py-6 md:py-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 z-10 sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Nearby PHC</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">Find and navigate to the nearest Primary Health Centers and clinics.</p>
            </div>
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={toggleSidebar}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden px-4 md:px-8 pb-8 pt-4 gap-8 flex-col lg:flex-row">
          {/* Left Column (List) */}
          <div className="flex-1 flex flex-col overflow-y-auto pr-2 scroll-smooth">
            <div className="relative mb-6">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input 
                className="w-full py-3 pl-12 pr-4 text-sm text-slate-900 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400 transition-all shadow-sm" 
                placeholder="Search by name or location..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-4 pb-12">
              {searchError && (
                 <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
                    {searchError}
                 </div>
              )}
              {phcData.filter(phc => phc.name.toLowerCase().includes(searchQuery.toLowerCase()) || phc.address.toLowerCase().includes(searchQuery.toLowerCase())).map((phc) => (
                <div key={phc.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-primary/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{phc.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {phc.address}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold">
                      <Star className="w-3 h-3 fill-current" /> {phc.rating}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Navigation className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{phc.distance}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{phc.time} away</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span>{phc.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={() => handleGetDirections(phc)} className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                      <Navigation className="w-4 h-4" /> Get Directions
                    </button>
                    <button className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-primary dark:text-blue-400 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" /> Call Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (Map) */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative min-h-[400px] lg:min-h-0">
            {!apiKey ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 border border-orange-200 dark:border-orange-900 m-4 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-orange-500" />
                <p className="font-bold text-orange-600 dark:text-orange-400">Google Maps API Key Missing</p>
                <p className="text-sm">Please set VITE_GOOGLE_MAPS_API_KEY in your .env file or the Admin Panel configuration.</p>
              </div>
            ) : loadError ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 border border-red-200 dark:border-red-900 m-4 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="font-bold text-red-600 dark:text-red-400">Failed to load Google Maps</p>
                <p className="text-sm">Please check your API Key and internet connection or ensure you own this website's mapped key.</p>
              </div>
            ) : !isLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={13}
                center={userLocation}
                onLoad={(map) => setMapRef(map)}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true
                }}
              >
                {/* User Location Marker */}
                <Marker 
                  position={userLocation} 
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  }}
                />

                {/* PHC Markers */}
                {phcData.map((phc) => (
                  <Marker
                    key={phc.id}
                    position={{ lat: phc.lat, lng: phc.lng }}
                    onClick={() => setSelectedPHC(phc)}
                    icon={{
                      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#10b981"/><path d="M11 11V13H13V11H15V9H13V7H11V9H9V11H11Z" fill="white"/></svg>'),
                      scaledSize: new google.maps.Size(32, 32)
                    }}
                  />
                ))}

                {/* Info Window */}
                {selectedPHC && (
                  <InfoWindow
                    position={{ lat: selectedPHC.lat, lng: selectedPHC.lng }}
                    onCloseClick={() => setSelectedPHC(null)}
                  >
                    <div className="p-2 max-w-xs text-slate-800">
                      <h3 className="font-bold text-sm mb-1">{selectedPHC.name}</h3>
                      <p className="text-xs mb-2">{selectedPHC.address}</p>
                      <button onClick={() => handleGetDirections(selectedPHC)} className="bg-primary text-white px-3 py-1.5 rounded text-xs font-bold w-full hover:bg-primary-dark">
                        Get Directions
                      </button>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

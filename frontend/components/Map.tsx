'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const pickupIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const dropIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Smoothly re-center map whenever the center prop changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 })
  }, [center, zoom, map])
  return null
}

interface BaseMapProps {
  pickup?: [number, number]
  dropoff?: [number, number]
  route?: [number, number][]
  userLocation?: [number, number]
}

export default function BaseMap({ pickup, dropoff, route, userLocation }: BaseMapProps) {
  const defaultCenter: [number, number] = [28.6139, 77.2090] // New Delhi
  const center = pickup || userLocation || defaultCenter
  const zoom = pickup && dropoff ? 12 : 14

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <MapController center={center} zoom={zoom} />

      {/* Current user position – pulsing blue dot */}
      {userLocation && (
        <>
          <Circle
            center={userLocation}
            radius={80}
            pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.25, weight: 2 }}
          />
          <Circle
            center={userLocation}
            radius={18}
            pathOptions={{ color: '#fff', fillColor: '#2563eb', fillOpacity: 1, weight: 3 }}
          />
        </>
      )}

      {pickup && (
        <Marker position={pickup} icon={pickupIcon}>
          <Popup>📍 Pickup</Popup>
        </Marker>
      )}
      {dropoff && (
        <Marker position={dropoff} icon={dropIcon}>
          <Popup>🏁 Drop-off</Popup>
        </Marker>
      )}
      {route && route.length > 1 && (
        <Polyline positions={route} color="#2563eb" weight={4} opacity={0.85} />
      )}
    </MapContainer>
  )
}

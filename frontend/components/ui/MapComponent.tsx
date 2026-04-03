'use client'

import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface MapProps {
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
}

export default function MapComponent({ 
  center = { lat: 28.6139, lng: 77.2090 }, // Default to New Delhi
  zoom = 12,
  className = "h-full w-full rounded-2xl overflow-hidden"
}: MapProps) {
  const position: [number, number] = [center.lat, center.lng];

  return (
    <div className={className}>
        <MapContainer 
            center={position} 
            zoom={zoom} 
            style={{ height: '100%', width: '100%' }} 
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
        </MapContainer>
    </div>
  )
}

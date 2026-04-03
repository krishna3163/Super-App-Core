'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icons
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function BaseMap({ pickup, dropoff, route }: { pickup?: [number, number], dropoff?: [number, number], route?: [number, number][] }) {
    const defaultCenter: [number, number] = [28.6139, 77.2090]; // New Delhi

    return (
        <MapContainer center={pickup || defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {pickup && <Marker position={pickup} icon={icon}><Popup>Pickup</Popup></Marker>}
            {dropoff && <Marker position={dropoff} icon={icon}><Popup>Dropoff</Popup></Marker>}
            {route && <Polyline positions={route} color="#2563eb" weight={4} />}
        </MapContainer>
    )
}

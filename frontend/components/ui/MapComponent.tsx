'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

interface MapProps {
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
}

export default function MapComponent({ 
  center = { lat: 28.6139, lng: 77.2090 }, // Default to New Delhi
  zoom = 12,
  className = "h-full w-full rounded-2xl"
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  const initMap = () => {
    if (mapRef.current && (window as any).google) {
      new (window as any).google.maps.Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: true,
        styles: [
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#ffffff" }]
            },
            // ... typical dark mode or custom styles can go here
        ]
      })
    }
  }

  return (
    <>
      <div ref={mapRef} className={className} />
      <Script 
        src="https://cdn.jsdelivr.net/gh/somanchiu/Keyless-Google-Maps-API@v7.1/mapsJavaScriptAPI.js"
        onLoad={initMap}
      />
    </>
  )
}

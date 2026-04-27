'use client';

import { useEffect, useRef } from 'react';

interface MapDisplayProps {
  lat: number;
  lng: number;
  interactive?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  className?: string;
}

export function MapDisplay({
  lat,
  lng,
  interactive = false,
  onLocationChange,
  className = '',
}: MapDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let L: any;
    let map: any;

    (async () => {
      L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Fix default icon path issue in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!containerRef.current) return;

      map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
        doubleClickZoom: interactive,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM',
        maxZoom: 19,
      }).addTo(map);

      // Custom blue marker
      const blueIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:20px;height:20px;
            background:#3b82f6;
            border:3px solid #fff;
            border-radius:50%;
            box-shadow:0 0 12px rgba(59,130,246,0.8);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      markerRef.current = L.marker([lat, lng], { icon: blueIcon }).addTo(map);

      if (interactive && onLocationChange) {
        map.on('click', (e: any) => {
          const { lat: newLat, lng: newLng } = e.latlng;
          markerRef.current.setLatLng([newLat, newLng]);
          onLocationChange(newLat, newLng);
        });
      }

      mapRef.current = map;
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker when lat/lng change externally
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], 15);
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ minHeight: 200 }}
    />
  );
}

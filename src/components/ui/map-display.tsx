'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface MapDisplayProps {
  lat: number;
  lng: number;
  interactive?: boolean;
  darkTiles?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  className?: string;
}

export function MapDisplay({
  lat,
  lng,
  interactive = false,
  darkTiles = false,
  onLocationChange,
  className = '',
}: MapDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let L: any;

    (async () => {
      L = (await import('leaflet')).default;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
        doubleClickZoom: interactive,
        attributionControl: true,
      });

      const tileUrl = darkTiles
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      const tileAttrib = '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>';

      L.tileLayer(tileUrl, { attribution: tileAttrib, maxZoom: 19 }).addTo(map);

      const markerIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:18px;height:18px;
            background:#e31837;
            border:3px solid #fff;
            border-radius:50%;
            box-shadow:0 0 0 2px rgba(227,24,55,0.35), 0 0 16px rgba(227,24,55,0.7);
          "></div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      markerRef.current = L.marker([lat, lng], { icon: markerIcon, draggable: interactive }).addTo(map);

      if (interactive && onLocationChange) {
        map.on('click', (e: any) => {
          const { lat: newLat, lng: newLng } = e.latlng;
          markerRef.current.setLatLng([newLat, newLng]);
          onLocationChange(newLat, newLng);
        });

        markerRef.current.on('dragend', (e: any) => {
          const { lat: newLat, lng: newLng } = e.target.getLatLng();
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

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
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

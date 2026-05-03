"use client";

import { useEffect, useRef } from "react";
import type { Nursery } from "@/types";

interface Props {
  nurseries: Nursery[];
  onEnquire: (nursery: Nursery) => void;
}

export function NurseryMap({ nurseries, onEnquire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const onEnquireRef = useRef(onEnquire);

  useEffect(() => { onEnquireRef.current = onEnquire; }, [onEnquire]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      // Fix default marker icons broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!).setView([55.9533, -3.1883], 12);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      const greenIcon = L.divIcon({
        className: "",
        html: `<div style="
          width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
          background: #1a7a4a; border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          transform: rotate(-45deg);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -36],
      });

      nurseries.forEach((nursery) => {
        if (!nursery.lat || !nursery.lng) return;

        const popup = L.popup({ maxWidth: 280, closeButton: false }).setContent(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <strong style="font-size: 14px; color: #0f172a;">${nursery.name}</strong>
              <span style="font-size: 11px; padding: 2px 7px; border-radius: 20px; background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; margin-left: 8px; white-space: nowrap;">${nursery.ofsted}</span>
            </div>
            <p style="font-size: 12px; color: #64748b; margin: 0 0 6px;">${nursery.area} · £${nursery.price}/day</p>
            <p style="font-size: 12px; color: #64748b; margin: 0 0 10px;">★ ${nursery.rating} · ${nursery.spaces > 0 ? `${nursery.spaces} spaces` : "Waitlist only"}</p>
            <button
              onclick="window.nvvriEnquire('${nursery.id}')"
              style="background: #1a7a4a; color: white; border: none; border-radius: 7px; padding: 7px 14px; font-size: 13px; cursor: pointer; font-weight: 500; width: 100%;"
            >
              Enquire
            </button>
          </div>
        `);

        L.marker([nursery.lat, nursery.lng], { icon: greenIcon })
          .bindPopup(popup)
          .addTo(map);
      });

      (window as Window & { nvvriEnquire?: (id: string) => void }).nvvriEnquire = (id: string) => {
        const nursery = nurseries.find((n) => String(n.id) === id);
        if (nursery) onEnquireRef.current(nursery);
      };
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [nurseries]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} style={{ width: "100%", height: "100%", borderRadius: 12 }} />
    </>
  );
}
// components/MapComponent.tsx
import React, { useEffect, useRef } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";

const MapComponent = ({
  onMapLoad,
  jsApiKey,
  securityJsCode,
}: {
  onMapLoad?: (mapInstance: any) => void;
  jsApiKey: string;
  securityJsCode: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window._AMapSecurityConfig = { securityJsCode };

    AMapLoader.load({
      key: jsApiKey,
      version: "2.0",
    })
      .then((AMap) => {
        const map = new AMap.Map(containerRef.current!, {
          viewMode: "3D",
          zoom: 13,
          center: [116.46, 39.99],
        });

        onMapLoad?.(map); // ✅ 把 AMap.Map 实例传出
      })
      .catch((err) => console.error("地图加载失败", err));
  }, [jsApiKey, securityJsCode]);

  return <div ref={containerRef} style={{ width: "100%", height: "650px" }} />;
};

export default MapComponent;

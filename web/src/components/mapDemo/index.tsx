import React, { useEffect, useState } from "react";
import { Button } from "antd";
import AMapLoader from "@amap/amap-jsapi-loader";
import "./index.css";

type LocationLabel = {
  position: [number, number];
  nodeType: number;
  orderId: number;
};

type Props = {
  // locs: LocationLabel[];
  // trajectories: number[][];
  jsApiKey: string;
  webServiceKey: string;
  securityJsCode: string;
  fetchUrl: string;
  buttonText?: string;
  height?: string;
};

const colorList = [
  "#3366FF",
  "#FF5733",
  "#33CC99",
  "#FF33B5",
  "#9933FF",
  "#00CCFF",
  "#FFCC00",
];

const MapRouteViewer: React.FC<Props> = ({
  // locs,
  // trajectories,
  jsApiKey,
  webServiceKey,
  securityJsCode,
  height = "500px",
  fetchUrl,
  buttonText = "获取路径",
}) => {
  const [loading, setLoading] = useState(false);
  const [locs, setLocs] = useState<LocationLabel[]>([]);
  const [trajectories, setTrajectories] = useState<number[][]>([]);

  const fetchAndRenderRoutes = async () => {
    setLoading(true);
    try {
      const response = await fetch(fetchUrl);
      const data = await response.json();
      if (data && data.locs && data.trajectories) {
        setLocs(data.locs);
        setTrajectories(data.trajectories);
        await renderMap(data.locs, data.trajectories);
      } else {
        console.error("格式错误", data);
      }
    } catch (error) {
      console.error("路径请求失败", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   let map: any;
  //   let infoWindow: any;

  //   const timeout = setTimeout(() => {
  //     console.warn("地图初始化可能未触发 complete，强制取消 loading");
  //     setLoading(false);
  //   }, 3000);

  //   window._AMapSecurityConfig = {
  //     securityJsCode: securityJsCode,
  //   };

  //   AMapLoader.load({
  //     key: jsApiKey,
  //     version: "2.0",
  //     plugins: ["AMap.LabelsLayer", "AMap.Polyline", "AMap.InfoWindow"],
  //   })
  //     .then(async (AMap) => {
  //       const allPoints: [number, number][] = trajectories.flatMap((traj) =>
  //         traj.map((index) => locs[index].position)
  //       );
  //       const lngs = allPoints.map((p) => p[0]);
  //       const lats = allPoints.map((p) => p[1]);
  //       const minLng = Math.min(...lngs);
  //       const maxLng = Math.max(...lngs);
  //       const minLat = Math.min(...lats);
  //       const maxLat = Math.max(...lats);

  //       // const defaultLayer = AMap.createDefaultLayer();

  //       map = new AMap.Map("container", {
  //         viewMode: "3D",
  //         layers: [new AMap.TileLayer()],
  //         zoom: 12,
  //         center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
  //         mapStyle: "amap://styles/whitesmoke",
  //         // layers: [defaultLayer],
  //       });

  //       map.on("complete", () => {
  //         console.log("地图初始化完成");
  //       });

  //       infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -20) });

  //       const icon = {
  //         type: "image",
  //         image:
  //           "https://a.amap.com/jsapi_demos/static/demo-center/marker/express2.png",
  //         size: [64, 30],
  //         anchor: "center",
  //       };
  //       const textStyle = {
  //         fontSize: 12,
  //         fontWeight: "normal",
  //         fillColor: "#22886f",
  //         strokeColor: "#fff",
  //         strokeWidth: 2,
  //         fold: true,
  //         padding: "2, 5",
  //       };

  //       const getContent = (nodeType: number, orderId: number) => {
  //         if (nodeType === 0) return "仓库";
  //         if (nodeType === 1) return `取货点${orderId + 1}`;
  //         if (nodeType === 2) return `送货点${orderId + 1}`;
  //         return "未知";
  //       };

  //       if (AMap.LabelsLayer) {
  //         const labelLayer = new AMap.LabelsLayer({ zIndex: 1000 });
  //         const markers = locs.map(
  //           (loc) =>
  //             new AMap.LabelMarker({
  //               position: loc.position,
  //               icon,
  //               text: {
  //                 content: getContent(loc.nodeType, loc.orderId),
  //                 direction: "right",
  //                 offset: [-20, -5],
  //                 style: textStyle,
  //               },
  //             })
  //         );
  //         labelLayer.add(markers);
  //         if (map) map.add(labelLayer);
  //       } else {
  //         console.warn("AMap.LabelsLayer 插件未加载成功，标注图层未显示");
  //       }

  //       const originPairs: {
  //         origin: [number, number];
  //         destination: [number, number];
  //       }[] = [];

  //       for (let t = 0; t < trajectories.length; t++) {
  //         const trajectory = trajectories[t];
  //         for (let i = 0; i < trajectory.length - 1; i++) {
  //           const origin = locs[trajectory[i]].position;
  //           const destination = locs[trajectory[i + 1]].position;
  //           originPairs.push({ origin, destination });
  //         }
  //       }

  //       const allPaths = await strictSequentialRequests(
  //         originPairs,
  //         webServiceKey,
  //         600
  //       );

  //       let pathIndex = 0;
  //       for (let t = 0; t < trajectories.length; t++) {
  //         const trajectory = trajectories[t];
  //         const color = colorList[t % colorList.length];

  //         for (let i = 0; i < trajectory.length - 1; i++) {
  //           const { origin, destination } = originPairs[pathIndex];
  //           const path = allPaths[pathIndex++];

  //           if (!Array.isArray(path) || path.length === 0) {
  //             console.warn("无效路径，跳过绘制", origin, destination);
  //             continue;
  //           }

  //           const polyline = new AMap.Polyline({
  //             path,
  //             showDir: true,
  //             strokeColor: color,
  //             strokeWeight: 5,
  //             zIndex: 50,
  //             lineJoin: "round",
  //             lineCap: "round",
  //           });

  //           polyline.on("mouseover", (e: any) => {
  //             const dist = getDistance(origin, destination);
  //             infoWindow.setContent(`距离约：${dist.toFixed(2)} km`);
  //             infoWindow.open(map, e.lnglat);
  //           });

  //           polyline.on("mouseout", () => infoWindow.close());
  //           if (map && polyline) map.add(polyline);
  //         }
  //       }

  //       map.on("complete", () => {
  //         try {
  //           map.setBounds(new AMap.Bounds([minLng, minLat], [maxLng, maxLat]));
  //         } catch (e) {
  //           console.warn("setBounds失败：", e);
  //         }
  //         setLoading(false);
  //         clearTimeout(timeout);
  //       });
  //     })
  //     .catch((e) => {
  //       console.error("地图加载失败：", e);
  //       setLoading(false);
  //       clearTimeout(timeout);
  //     });

  //   return () => map?.destroy?.();
  // }, [locs, trajectories, jsApiKey, webServiceKey, securityJsCode]);

  const renderMap = async (locs: LocationLabel[], trajectories: number[][]) => {
    let map: any;
    let infoWindow: any;

    window._AMapSecurityConfig = { securityJsCode };

    AMapLoader.load({
      key: jsApiKey,
      version: "2.0",
      plugins: ["AMap.LabelsLayer", "AMap.Polyline", "AMap.InfoWindow"],
    })
      .then(async (AMap) => {
        const allPoints: [number, number][] = trajectories.flatMap((traj) =>
          traj.map((index) => locs[index].position)
        );
        const lngs = allPoints.map((p) => p[0]);
        const lats = allPoints.map((p) => p[1]);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        map = new AMap.Map("container", {
          viewMode: "3D",
          zoom: 12,
          center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
          mapStyle: "amap://styles/whitesmoke",
          layers: [new AMap.TileLayer()],
        });

        infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -20) });

        const icon = {
          type: "image",
          image:
            "https://a.amap.com/jsapi_demos/static/demo-center/marker/express2.png",
          size: [64, 30],
          anchor: "center",
        };
        const textStyle = {
          fontSize: 12,
          fillColor: "#22886f",
          strokeColor: "#fff",
          strokeWidth: 2,
        };

        const getContent = (nodeType: number, orderId: number) => {
          if (nodeType === 0) return "仓库";
          if (nodeType === 1) return `取货点${orderId + 1}`;
          if (nodeType === 2) return `送货点${orderId + 1}`;
          return "未知";
        };

        const labelLayer = new AMap.LabelsLayer({ zIndex: 1000 });
        const markers = locs.map(
          (loc) =>
            new AMap.LabelMarker({
              position: loc.position,
              icon,
              text: {
                content: getContent(loc.nodeType, loc.orderId),
                direction: "right",
                offset: [-20, -5],
                style: textStyle,
              },
            })
        );
        labelLayer.add(markers);
        map.add(labelLayer);

        const originPairs = [];
        for (let t = 0; t < trajectories.length; t++) {
          const trajectory = trajectories[t];
          for (let i = 0; i < trajectory.length - 1; i++) {
            const origin = locs[trajectory[i]].position;
            const destination = locs[trajectory[i + 1]].position;
            originPairs.push({ origin, destination });
          }
        }

        const allPaths = await strictSequentialRequests(
          originPairs,
          webServiceKey,
          600
        );

        let pathIndex = 0;
        for (let t = 0; t < trajectories.length; t++) {
          const trajectory = trajectories[t];
          const color = colorList[t % colorList.length];

          for (let i = 0; i < trajectory.length - 1; i++) {
            const path = allPaths[pathIndex++];
            if (!Array.isArray(path) || path.length === 0) continue;

            const polyline = new AMap.Polyline({
              path,
              showDir: true,
              strokeColor: color,
              strokeWeight: 5,
              zIndex: 50,
              lineJoin: "round",
              lineCap: "round",
            });

            polyline.on("mouseover", (e: any) => {
              const dist = getDistance(
                locs[trajectory[i]].position,
                locs[trajectory[i + 1]].position
              );
              infoWindow.setContent(`距离约：${dist.toFixed(2)} km`);
              infoWindow.open(map, e.lnglat);
            });

            polyline.on("mouseout", () => infoWindow.close());
            map.add(polyline);
          }
        }

        map.setBounds(new AMap.Bounds([minLng, minLat], [maxLng, maxLat]));
        setLoading(false);
      })
      .catch((e) => {
        console.error("地图加载失败：", e);
        setLoading(false);
      });
  };

  return (
    <div className="map-wrapper">
      <Button onClick={fetchAndRenderRoutes} disabled={loading}>
        {buttonText}
      </Button>
      {loading && <div className="loading-overlay">正在加载路径...</div>}
      <div
        id="container"
        className="container"
        style={{ width: "100%", height: height }}
      />
    </div>
  );
};

export default MapRouteViewer;

async function getDrivingPath(
  origin: [number, number],
  destination: [number, number],
  key: string
): Promise<[number, number][]> {
  const url = `https://restapi.amap.com/v5/direction/driving`;
  const params = new URLSearchParams({
    origin: `${origin[0]},${origin[1]}`,
    destination: `${destination[0]},${destination[1]}`,
    key,
    strategy: "32",
    output: "json",
    show_fields: "polyline",
  });

  try {
    const res = await fetch(`${url}?${params}`);
    const json = await res.json();
    const steps = json?.route?.paths?.[0]?.steps || [];
    const path: [number, number][] = [];
    if (!steps.length) {
      console.warn("高德返回空路径：", json);
    }
    for (const step of steps) {
      if (!step.polyline) continue;
      const polyline = step.polyline.split(";").map((p: string) => {
        const [lng, lat] = p.split(",").map(parseFloat);
        return [lng, lat] as [number, number];
      });
      path.push(...polyline);
    }
    return path;
  } catch (e) {
    console.warn("路径请求失败", e);
    return [];
  }
}

async function strictSequentialRequests(
  pairs: { origin: [number, number]; destination: [number, number] }[],
  key: string,
  delayMs = 600
): Promise<[number, number][]> {
  const results: [number, number][][] = [];
  for (const { origin, destination } of pairs) {
    const path = await getDrivingPath(origin, destination, key);
    results.push(path);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return results;
}

function getDistance(p1: [number, number], p2: [number, number]) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(p2[1] - p1[1]);
  const dLon = toRad(p2[0] - p1[0]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1[1])) * Math.cos(toRad(p2[1])) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

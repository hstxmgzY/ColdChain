import React, { useState } from "react";
// import MapRouteViewer from "../../components/mapviewer";
// import MapComponent from "../../components/map";
import MapRouteViewer from "../../components/mapDemo";

const Map = () => {
  // const [mapInstance, setMapInstance] = useState<any>(null); //

  return (
    <div>
      <MapRouteViewer
        jsApiKey="447824cbde7391ff5c3971e8d7e24a69"
        securityJsCode="dbaa66b505e327b4abedfe9a5a603a5a"
        webServiceKey="c0a17ac02b090604b4f6ba42f23db2e4"
        // locs={[
        //   { position: [121.636, 29.92], nodeType: 0, orderId: -1 },
        //   { position: [121.636, 29.909], nodeType: 1, orderId: 0 },
        //   { position: [121.631, 29.916], nodeType: 2, orderId: 0 },
        //   { position: [121.627, 29.921], nodeType: 1, orderId: 1 },
        //   { position: [121.622, 29.919], nodeType: 2, orderId: 1 },
        // ]}
        // trajectories={[
        //   [0, 1, 2],
        //   [2, 3, 4],
        // ]}
        fetchUrl="http://127.0.0.1:8000/routes/all"
        buttonText="查看配送路径"
        height="600px"
      />

      {/* <MapComponent
        jsApiKey="bc7a516a5ffa5e4869a3fd16367d05f4"
        securityJsCode="797c8ec621379363b489cd13e16e37c2"
        onMapLoad={setMapInstance}
      />
      {mapInstance && (
        <MapRouteViewer
          map={mapInstance}
          jsApiKey="bc7a516a5ffa5e4869a3fd16367d05f4"
          webServiceKey="15807c9291055bcaaa80372f695f0ed0"
          securityJsCode="797c8ec621379363b489cd13e16e37c2"
          locs={[
            { position: [116.46, 39.99], nodeType: 0, orderId: -1 },
            { position: [116.47, 39.98], nodeType: 1, orderId: 0 },
            { position: [116.48, 39.97], nodeType: 2, orderId: 0 },
            { position: [116.45, 39.96], nodeType: 1, orderId: 1 },
            { position: [116.44, 39.95], nodeType: 2, orderId: 1 },
          ]}
          trajectories={[
            [0, 1, 2, 0],
            [0, 3, 4, 0],
          ]}
        />
      )} */}
    </div>
  );
};

export default Map;

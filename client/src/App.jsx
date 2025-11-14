import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import MapCanvas from "./MapCanvas.jsx";
import VideoFeed from "./VideoFeed.jsx";
import Dashboard from "./Dashboard.jsx";

const socket = io("http://localhost:4000");

export default function App() {
  const [sim, setSim] = useState(null);

  useEffect(() => {
    socket.on("sim:init", data => setSim(data));
    socket.on("sim:update", data => setSim(data));
    // ask server for init (some servers emit on connect)
    socket.emit("client:hello");
    return () => { socket.off(); };
  }, []);

  if (!sim) return <div className="centered">Connecting to simulation server...</div>;

  return (
    <div className="app">
      <div className="left">
        <div className="top-left">
          <VideoFeed />
        </div>
        <div className="map-wrapper">
          <MapCanvas sim={sim} />
        </div>
      </div>
      <div className="right">
        <Dashboard sim={sim} socket={socket} />
      </div>
    </div>
  );
}

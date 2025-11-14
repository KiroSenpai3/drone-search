import React from "react";

/*
  This component shows a simulated FPV video feed.
  Place a sample MP4 file at: client/public/sample-fpv.mp4
  The video plays looped and muted to simulate an FPV feed.
*/

export default function VideoFeed() {
  return (
    <div className="video-card">
      <h3>FPV Camera (simulated)</h3>
      <video
        src="/sample-fpv.mp4"
        width="420"
        height="240"
        controls
        autoPlay
        loop
        muted
        style={{ borderRadius: 6, border: "2px solid #222" }}
      />
      <div className="video-meta">
        <span>Resolution: 640×360</span>
        <span>Latency: simulated</span>
      </div>
    </div>
  );
}

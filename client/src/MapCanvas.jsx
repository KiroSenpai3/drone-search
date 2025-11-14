import React, { useRef, useEffect } from "react";

/*
  MapCanvas draws:
   - light grid (to look like a map)
   - lawnmower path (optional faint polyline)
   - victims (hidden until found; when found shows red)
   - drones with trace and scan radius
   - event overlay (recent logs)
*/

export default function MapCanvas({ sim }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = sim.area.width;
    canvas.height = sim.area.height;

    // draw every update
    function draw() {
      // background
      ctx.fillStyle = "#eef6ff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // grid lines
      ctx.strokeStyle = "#d6e6f8";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // draw victims (hidden until found)
      sim.victims.forEach(v => {
        if (v.found) {
          // show found victim
          ctx.fillStyle = "#ff3b30";
          ctx.beginPath();
          ctx.arc(v.x, v.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#7a1a12"; ctx.stroke();
        } else {
          // show faint hint (very translucent)
          ctx.fillStyle = "rgba(200,20,30,0.06)";
          ctx.beginPath(); ctx.arc(v.x, v.y, 6, 0, Math.PI * 2); ctx.fill();
        }
      });

      // draw drones
      sim.drones.forEach(d => {
        // trail
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 2;
        for (let i = d.trace.length - 1; i >= 0; i--) {
          const p = d.trace[i];
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        // scan radius
        ctx.beginPath();
        ctx.strokeStyle = "rgba(14,165,233,0.12)"; ctx.lineWidth = 2;
        ctx.arc(d.x, d.y, 28, 0, Math.PI *
           2);
        ctx.stroke();

        // drone body
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.fillStyle = d.status === "found" ? "#16a34a" : "#0ea5e9";
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "10px Arial"; ctx.textAlign = "center";
        ctx.fillText(d.id, 0, 4);
        ctx.restore();
      });

      // logs overlay - last 6
      const logs = sim.logs.slice(-6);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.font = "12px Arial";
      for (let i = 0; i < logs.length; i++) {
        const l = logs[logs.length - 1 - i];
        ctx.fillText(l.event, 10, canvas.height - 10 - i * 16);
      }
    }

    draw();
  }, [sim]);

  return <canvas ref={canvasRef} className="map-canvas" />;
}

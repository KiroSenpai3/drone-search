import React from "react";

export default function Dashboard({ sim, socket }) {
  const found = sim.victims.filter(v => v.found).length;
  const total = sim.victims.length;

  return (
    <div className="right-panel">
      <h2>Mission Control</h2>

      <div className="controls">
        <button onClick={() => socket.emit('sim:start')} className="btn start">Start</button>
        <button onClick={() => socket.emit('sim:pause')} className="btn pause">Pause</button>
        <button onClick={() => socket.emit('sim:reset')} className="btn reset">Reset</button>
      </div>

      <div className="summary">
        <p><b>Victims found:</b> {found} / {total}</p>
        <p><b>Running:</b> {sim.running ? 'Yes' : 'No'}</p>
      </div>

      <h3>Drones</h3>
      <div className="drone-list">
        {sim.drones.map(d => (
          <div key={d.id} className="drone-card">
            <div className="drone-row"><b>{d.id}</b> <span className={d.status === 'low-battery' ? 'warning' : ''}>{d.status}</span></div>
            <div>Pos: {Math.round(d.x)},{Math.round(d.y)}</div>
            <div>Battery: {Math.round(d.battery)}%</div>
          </div>
        ))}
      </div>

      <h3>Event Log</h3>
      <div className="log-box">
        {sim.logs.slice().reverse().map((l,i) => (
          <div key={i} className="log-line">[{l.time.split('T')[1].slice(0,8)}] {l.event}</div>
        ))}
      </div>
    </div>
  );
}

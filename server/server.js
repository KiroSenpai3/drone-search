const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { generateVictims, buildLawnmowerGrid } = require('./utils');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 4000;

// Simulation parameters
const AREA = { width: 900, height: 600 };
const NUM_DRONES = 2;         // you asked 2
const NUM_VICTIMS = 6;
const GRID_SPACING = 120;     // lawnmower spacing (pixels)
const TICK_MS = 120;          // simulation tick interval
const DRONE_SPEED = 2.5;      // pixels per tick
const SCAN_RADIUS = 28;       // detection radius (pixels)

let state = {
  area: AREA,
  drones: [],
  victims: [],
  logs: [],
  running: false
};

function initSim() {
  const grid = buildLawnmowerGrid(AREA, GRID_SPACING);
  state.victims = generateVictims(NUM_VICTIMS, AREA);
  state.drones = [];

  // Partition grid among drones by offsetting start index
  for (let i = 0; i < NUM_DRONES; i++) {
    const offset = i * Math.floor(grid.length / NUM_DRONES);
    const path = grid.slice(offset).concat(grid.slice(0, offset));
    const start = path[0] || { x: AREA.width / 2, y: AREA.height / 2 };
    state.drones.push({
      id: `D${i+1}`,
      x: start.x,
      y: start.y,
      path,
      pathIndex: 0,
      status: 'idle',
      battery: 100,
      trace: [] // keep recent positions for trail
    });
  }
  state.logs = [{ time: new Date().toISOString(), event: 'Simulation initialized' }];
  state.running = false;
}

initSim();

function stepSim() {
  state.drones.forEach(drone => {
    const target = drone.path[drone.pathIndex];
    if (!target) return;
    const dx = target.x - drone.x;
    const dy = target.y - drone.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist <= DRONE_SPEED) {
      drone.x = target.x;
      drone.y = target.y;
      drone.pathIndex = (drone.pathIndex + 1) % drone.path.length;
    } else {
      drone.x += (dx / dist) * DRONE_SPEED;
      drone.y += (dy / dist) * DRONE_SPEED;
    }

    // update trace (recent positions)
    drone.trace.push({ x: drone.x, y: drone.y });
    if (drone.trace.length > 40) drone.trace.shift();

    // battery consumption
    drone.battery = Math.max(0, drone.battery - 0.01);

    // detection
    state.victims.forEach(v => {
      if (!v.found) {
        const dd = Math.sqrt((v.x - drone.x)**2 + (v.y - drone.y)**2);
        if (dd <= SCAN_RADIUS) {
          v.found = true;
          v.foundBy = drone.id;
          v.foundAt = new Date().toISOString();
          drone.status = 'found';
          state.logs.push({ time: new Date().toISOString(), event: `Victim ${v.id} found by ${drone.id}` });
        }
      }
    });

    if (drone.status !== 'found') drone.status = 'searching';
    // if battery very low, set status
    if (drone.battery <= 5) drone.status = 'low-battery';
  });
}

// Simulation loop emits updates
setInterval(() => {
  if (state.running) {
    stepSim();
    io.emit('sim:update', state);
  }
}, TICK_MS);

// Socket handlers
io.on('connection', socket => {
  console.log('client connected', socket.id);
  // send initial state
  socket.emit('sim:init', state);

  socket.on('sim:start', () => {
    state.running = true;
    state.logs.push({ time: new Date().toISOString(), event: 'Simulation started' });
    io.emit('sim:update', state);
  });
  socket.on('sim:pause', () => {
    state.running = false;
    state.logs.push({ time: new Date().toISOString(), event: 'Simulation paused' });
    io.emit('sim:update', state);
  });
  socket.on('sim:reset', () => {
    initSim();
    io.emit('sim:init', state);
  });
  socket.on('disconnect', () => console.log('client disconnected', socket.id));
});

app.get('/', (req, res) => res.send('Drone SAR Simulation server running'));

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));

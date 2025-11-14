// Utilities for simulation: victims generator + lawnmower grid builder

function randBetweenInt(a, b) {
  return Math.floor(a + Math.random() * (b - a + 1));
}

function generateVictims(n, area) {
  const victims = [];
  for (let i = 0; i < n; i++) {
    victims.push({
      id: `V${i+1}`,
      x: randBetweenInt(30, area.width - 30),
      y: randBetweenInt(30, area.height - 30),
      found: false
    });
  }
  return victims;
}

// Build lawnmower grid of waypoints across the rectangle.
// spacing - distance between adjacent strips (pixels).
function buildLawnmowerGrid(area, spacing) {
  const pts = [];
  const cols = Math.max(1, Math.ceil((area.width - 40) / spacing));
  const rows = Math.max(1, Math.ceil((area.height - 40) / spacing));
  for (let r = 0; r < rows; r++) {
    const y = Math.min(area.height - 20, 20 + r * spacing);
    if (r % 2 === 0) {
      for (let c = 0; c < cols; c++) {
        const x = Math.min(area.width - 20, 20 + c * spacing);
        pts.push({ x, y });
      }
    } else {
      for (let c = cols - 1; c >= 0; c--) {
        const x = Math.min(area.width - 20, 20 + c * spacing);
        pts.push({ x, y });
      }
    }
  }
  return pts;
}

module.exports = { generateVictims, buildLawnmowerGrid };

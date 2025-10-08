const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

let width, height;
let gridSizeX = 20;
let gridSizeY = 20;
let points = [];
let triangles = [];

let scrollY = 0;
let scrollTime = 0;

let BACKGROUND_COLOR = '#0b07f3ff'; // default, overridden by theme
let METAL_BASE_COLOR = { r: 180, g: 0, b: 0 };
let LIGHT_COLOR = { r: 255, g: 255, b: 255 };
let SHADOW_COLOR = { r: 80, g: 80, b: 90 };

function resize() {
  width = window.innerWidth;
  
  if (/Mobi|Android/i.test(navigator.userAgent) && window.visualViewport) {
    height = window.visualViewport.height;
  } else {
    height = window.innerHeight;
  }

  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;

  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(devicePixelRatio, devicePixelRatio);

  createGrid();
}


window.addEventListener('resize', resize);

window.addEventListener('scroll', () => {
  scrollY = window.scrollY || window.pageYOffset;
  // Map scrollY to a scrollTime controlling animation progress
  scrollTime = scrollY / 1000; // Adjust divisor to tweak animation speed/sensitivity
});

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function loadThemeColors() {
  return fetch('assets/data/theme.json').then(res => res.json()).then(data => {
    BACKGROUND_COLOR = data.colors.background || BACKGROUND_COLOR;
    METAL_BASE_COLOR = hexToRgb(data.colors.primaryLight || '#B4B4C8');
  }).catch(() => {});
}

// Generate grid points with some height "z" values for bumps
function createGrid() {
  points = [];
  const spacingX = width / gridSizeX;
  const spacingY = height / gridSizeY;

  for(let y = 0; y <= gridSizeY; y++) {
    for(let x = 0; x <= gridSizeX; x++) {
      let baseX = x * spacingX;
      let baseY = y * spacingY;

      const jitterAmount = Math.min(spacingX, spacingY) * 0.4;
      let jitterX = (Math.random() - 0.5) * jitterAmount;
      let jitterY = (Math.random() - 0.5) * jitterAmount;

      let posX = baseX + jitterX;
      let posY = baseY + jitterY;

      // Each point remembers its base position for morphing
      // Also add a random offset for animation phase
      let offset = Math.random() * 2 * Math.PI;

      // Base z can be zero since we animate it later
      let z = 0;

      points.push({ baseX: posX, baseY: posY, x: posX, y: posY, z, offset });
    }
  }
  createTriangles();
}

// Create triangles from grid points (two triangles per quad)
function createTriangles() {
  triangles = [];
  for(let y = 0; y < gridSizeY; y++) {
    for(let x = 0; x < gridSizeX; x++) {
      let i = y * (gridSizeX + 1) + x;
      // triangle 1
      triangles.push([points[i], points[i + 1], points[i + gridSizeX + 1]]);
      // triangle 2
      triangles.push([points[i + 1], points[i + gridSizeX + 2], points[i + gridSizeX + 1]]);
    }
  }
}

// Calculate normal vector of triangle in 3D
function calcNormal(p1, p2, p3) {
  const v1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
  const v2 = { x: p3.x - p1.x, y: p3.y - p1.y, z: p3.z - p1.z };
  const nx = v1.y * v2.z - v1.z * v2.y;
  const ny = v1.z * v2.x - v1.x * v2.z;
  const nz = v1.x * v2.y - v1.y * v2.x;
  const length = Math.sqrt(nx*nx + ny*ny + nz*nz);
  return { x: nx / length, y: ny / length, z: nz / length };
}

// Dot product of two vectors
function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Linear interpolate between two colors
function lerpColor(c1, c2, t) {
  return {
    r: c1.r + (c2.r - c1.r) * t,
    g: c1.g + (c2.g - c1.g) * t,
    b: c1.b + (c2.b - c1.b) * t,
  };
}

// Convert rgb color to CSS string
function rgbToCss(c) {
  return `rgb(${c.r|0}, ${c.g|0}, ${c.b|0})`;
}

function drawTriangle(p1, p2, p3, color) {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.closePath();

  let gradient = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
  gradient.addColorStop(0, rgbToCss(color));
  gradient.addColorStop(1, rgbToCss(lerpColor(color, LIGHT_COLOR, 0.3)));

  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

function animate() {
  // Animate points shifting shape based on scrollTime
  for(let i = 0; i < points.length; i++) {
    const p = points[i];
    p.x = p.baseX + 5 * Math.sin(scrollTime * 1.5 + p.offset) + 3 * Math.cos(scrollTime * 0.8 + p.offset * 2);
    p.y = p.baseY + 5 * Math.cos(scrollTime * 1.3 + p.offset) + 3 * Math.sin(scrollTime * 0.7 + p.offset * 2);
    p.z = 10 * Math.sin(p.x * 0.05 + scrollTime) * Math.cos(p.y * 0.05 + scrollTime * 1.2) +
          5 * Math.sin(scrollTime * 2 + i);
  }

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, width, height);

  // Fixed light direction (not affected by scroll)
  const lightDir = { x: 0, y: -0.5, z: 1 };
  const len = Math.sqrt(lightDir.x*lightDir.x + lightDir.y*lightDir.y + lightDir.z*lightDir.z);
  lightDir.x /= len;
  lightDir.y /= len;
  lightDir.z /= len;

  for(let tri of triangles) {
    const [p1, p2, p3] = tri;
    const normal = calcNormal(p1, p2, p3);
    let intensity = dot(normal, lightDir);

    const ambient = 0.2;
    intensity = Math.min(1, Math.max(ambient, intensity));

    const deepShadow = { r: 40, g: 40, b: 50 };
    const brightMetal = { r: 230, g: 230, b: 240 };

    const variance = (Math.sin(p1.x * 0.1) + Math.cos(p1.y * 0.1)) * 0.05;
    const shadowVar = {
      r: deepShadow.r * (1 - variance),
      g: deepShadow.g * (1 - variance),
      b: deepShadow.b * (1 - variance),
    };
    const metalVar = {
      r: brightMetal.r * (1 + variance),
      g: brightMetal.g * (1 + variance),
      b: brightMetal.b * (1 + variance),
    };

    const color = lerpColor(shadowVar, metalVar, intensity);

    drawTriangle(p1, p2, p3, color);
  }

  requestAnimationFrame(animate);
}

loadThemeColors().then(() => {
  resize();
  animate();
});

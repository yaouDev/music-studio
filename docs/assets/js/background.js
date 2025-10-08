const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

let width, height;
let gridSizeX = 20;
let gridSizeY = 20;
let points = [];
let triangles = [];

let scrollY = 0;
let scrollTime = 0;

let BACKGROUND_COLOR = '#FDFBF8'; // fallback
let LIGHT_COLOR = { r: 244, g: 240, b: 235 };  // fallback
let SHADOW_COLOR = { r: 138, g: 133, b: 125 }; // fallback
let GOLD_EDGE_COLOR = { r: 138, g: 125, b: 112 }; // fallback


function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: (bigint >> 0) & 255,
  };
}

function loadThemeColors() {
  return fetch('assets/data/theme.json')
    .then(res => res.json())
    .then(data => {
      const colors = data.colors || {};

      BACKGROUND_COLOR = colors.backgroundMeshBase || colors.background || '#FDFBF8';
      LIGHT_COLOR = hexToRgb(colors.backgroundMeshHighlight || colors.primaryLight || '#F0EAE4');
      SHADOW_COLOR = hexToRgb(colors.backgroundMeshShadow || colors.muted || '#8A857D');
      GOLD_EDGE_COLOR = hexToRgb(colors.backgroundMeshEdge || colors['button-bg'] || '#8A7D70');
    }).catch(() => {});
}

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
  scrollTime = scrollY / 1000;
});

function createGrid() {
  points = [];
  const spacingX = width / gridSizeX;
  const spacingY = height / gridSizeY;

  for (let y = 0; y <= gridSizeY; y++) {
    for (let x = 0; x <= gridSizeX; x++) {
      const baseX = x * spacingX;
      const baseY = y * spacingY;

      const jitterAmount = Math.min(spacingX, spacingY) * 0.4;
      const jitterX = (Math.random() - 0.5) * jitterAmount;
      const jitterY = (Math.random() - 0.5) * jitterAmount;

      const posX = baseX + jitterX;
      const posY = baseY + jitterY;

      const offset = Math.random() * 2 * Math.PI;
      const z = 0;

      points.push({ baseX: posX, baseY: posY, x: posX, y: posY, z, offset });
    }
  }
  createTriangles();
}

function createTriangles() {
  triangles = [];
  for (let y = 0; y < gridSizeY; y++) {
    for (let x = 0; x < gridSizeX; x++) {
      const i = y * (gridSizeX + 1) + x;
      triangles.push([points[i], points[i + 1], points[i + gridSizeX + 1]]);
      triangles.push([points[i + 1], points[i + gridSizeX + 2], points[i + gridSizeX + 1]]);
    }
  }
}

function calcNormal(p1, p2, p3) {
  const v1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
  const v2 = { x: p3.x - p1.x, y: p3.y - p1.y, z: p3.z - p1.z };
  const nx = v1.y * v2.z - v1.z * v2.y;
  const ny = v1.z * v2.x - v1.x * v2.z;
  const nz = v1.x * v2.y - v1.y * v2.x;
  const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
  return { x: nx / length, y: ny / length, z: nz / length };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function lerpColor(c1, c2, t) {
  return {
    r: c1.r + (c2.r - c1.r) * t,
    g: c1.g + (c2.g - c1.g) * t,
    b: c1.b + (c2.b - c1.b) * t,
  };
}

function rgbToCss(c) {
  return `rgb(${c.r | 0}, ${c.g | 0}, ${c.b | 0})`;
}

function drawTriangle(p1, p2, p3, color, edgeColor) {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
  gradient.addColorStop(0, rgbToCss(color));
  gradient.addColorStop(1, rgbToCss(lerpColor(color, LIGHT_COLOR, 0.2)));

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = rgbToCss(edgeColor);
  ctx.lineWidth = 0.3;
  ctx.stroke();
}

function animate() {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    p.x = p.baseX + 5 * Math.sin(scrollTime * 1.2 + p.offset) + 3 * Math.cos(scrollTime * 0.8 + p.offset * 2);
    p.y = p.baseY + 5 * Math.cos(scrollTime * 1.1 + p.offset) + 3 * Math.sin(scrollTime * 0.6 + p.offset * 2);
    p.z = 5 * Math.sin(p.baseX * 0.02 + scrollTime * 1.2) * Math.cos(p.baseY * 0.02 + scrollTime * 1.3) +
          2 * Math.sin(scrollTime * 0.5 + i);
  }

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, width, height);

  const lightDir = { x: 0, y: -0.5, z: 1 };
  const len = Math.sqrt(lightDir.x * lightDir.x + lightDir.y * lightDir.y + lightDir.z * lightDir.z);
  lightDir.x /= len;
  lightDir.y /= len;
  lightDir.z /= len;

  for (const tri of triangles) {
    const [p1, p2, p3] = tri;
    const normal = calcNormal(p1, p2, p3);
    let intensity = dot(normal, lightDir);
    const ambient = 0.25;
    intensity = Math.min(1, Math.max(ambient, intensity));

    const color = lerpColor(SHADOW_COLOR, LIGHT_COLOR, intensity);

    drawTriangle(p1, p2, p3, color, GOLD_EDGE_COLOR);
  }

  requestAnimationFrame(animate);
}

loadThemeColors().then(() => {
  resize();
  animate();
});

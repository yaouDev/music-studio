const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

let width, height;
let lines = [];
const lineCount = 30;
let scrollY = 0;

let BACKGROUND_COLOR = '#FFFFFF';
let LINE_COLOR = '0, 0, 0'; // fallback black

async function loadThemeColors() {
  try {
    const res = await fetch('assets/data/theme.json');
    const data = await res.json();

    BACKGROUND_COLOR = data.colors.background || BACKGROUND_COLOR;
    const accent = data.colors.accent || '#000000';
    LINE_COLOR = hexToRgbString(accent);
  } catch (e) {
    console.error('Failed to load theme colors:', e);
  }
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(h => h + h).join('');
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function hexToRgbString(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(devicePixelRatio, devicePixelRatio);
}

window.addEventListener('resize', resize);
resize();

window.addEventListener('scroll', () => {
  scrollY = window.scrollY || window.pageYOffset;
});

function createLines() {
  lines = [];
  for (let i = 0; i < lineCount; i++) {
    lines.push({
      x: Math.random() * width,
      speed: 0.1 + Math.random() * 0.3,
      opacity: 0.1 + Math.random() * 0.15,
      height: height * (0.8 + Math.random() * 0.2)
    });
  }
}

function drawLines(time) {
  const offset = scrollY * 0.1;

  lines.forEach(line => {
    line.x += line.speed;
    if (line.x > width + 50) line.x = -50;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${LINE_COLOR}, ${line.opacity})`;
    ctx.lineWidth = 1;
    ctx.moveTo(line.x, height - line.height + offset);
    ctx.lineTo(line.x, height + offset);
    ctx.stroke();
  });
}

function animate(time = 0) {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, width, height);

  drawLines(time);
  requestAnimationFrame(animate);
}

loadThemeColors().then(() => {
  createLines();
  requestAnimationFrame(animate);
});

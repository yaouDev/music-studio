const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 40;

let parallax = { x: 0, y: 0 };
let scrollY = 0;

// Colors to be set from theme.json
let PARTICLE_COLOR = { r: 30, g: 30, b: 47 };
let LINE_BASE_COLOR = '136, 146, 255'; // fallback to blue-ish if no theme loaded
let BACKGROUND_COLOR = '#121212';      // fallback dark background

async function loadThemeColors() {
  try {
    const res = await fetch('assets/data/theme.json');
    const data = await res.json();

    // Parse background color (assumed hex)
    BACKGROUND_COLOR = data.colors.background || BACKGROUND_COLOR;

    // Parse accent color for lines, convert hex to rgb string
    const accent = data.colors.accent || '#8892FF';
    LINE_BASE_COLOR = hexToRgbString(accent);

    // Particle color: maybe use primaryDark or a darker version of accent or background?
    // Let's use primaryDark or fallback:
    const primaryDark = data.colors.primaryDark || '#1E1E2F';
    PARTICLE_COLOR = hexToRgb(primaryDark);

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

function createParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: 3 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function drawParticles(time) {
  particles.forEach(p => {
    const pulseRadius = p.radius * (0.9 + 0.1 * Math.sin(time * 0.001 + p.phase));
    const px = p.x + parallax.x;
    const py = p.y + parallax.y;

    ctx.beginPath();
    ctx.fillStyle = `rgba(${PARTICLE_COLOR.r}, ${PARTICLE_COLOR.g}, ${PARTICLE_COLOR.b}, 0.9)`;
    ctx.arc(px, py, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawLines(time) {
  const maxDist = 140;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const pA = particles[i];
      const pB = particles[j];
      const dx = pA.x - pB.x;
      const dy = pA.y - pB.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist) {
        const baseAlpha = (1 - dist / maxDist) * 0.25;
        const pulse = 0.6 + 0.4 * Math.sin(time * 0.0003 + i);
        const alpha = baseAlpha * pulse;

        const lineColor = `rgba(${LINE_BASE_COLOR}, ${alpha.toFixed(3)})`;

        const ax = pA.x + parallax.x;
        const ay = pA.y + parallax.y;
        const bx = pB.x + parallax.x;
        const by = pB.y + parallax.y;

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1.4 + 0.4 * pulse;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = 12 * pulse;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();

        ctx.shadowBlur = 0;
      }
    }
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;
  });
}

function animate(time = 0) {
  const maxOffset = 40;
  const scrollFactor = scrollY / height;
  parallax.y = scrollFactor * maxOffset;
  parallax.x = (scrollFactor - 0.5) * maxOffset * 0.3;

  // Clear canvas with background color from theme
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, width, height);

  updateParticles();
  drawLines(time);
  drawParticles(time);
  requestAnimationFrame(animate);
}

// Load theme colors then start animation
loadThemeColors().then(() => {
  createParticles();
  requestAnimationFrame(animate);
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('theme.json');
    const { theme } = await res.json();

    if (!theme || typeof theme !== 'object') throw new Error('Invalid theme format.');

    const root = document.documentElement;

    // Apply Dark Mode
    applyDarkMode(theme.darkMode);

    // Apply all theme sections
    applyFontVariables(theme.fonts);
    applyColorVariables(theme.colors);
    applySpacingVariables(theme.spacing);

    // Set mobile browser theme color
    updateMetaThemeColor(theme.colors?.primary);

    // Prevent flash of unstyled content
    document.body.classList.remove('loading');

  } catch (err) {
    console.error('Error loading theme:', err);
    document.body.classList.remove('loading');
  }
});

function applyDarkMode(enabled) {
  if (enabled) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function applyFontVariables(fonts = {}) {
  const root = document.documentElement;
  root.style.setProperty('--font-body', fonts.body || 'Inter, sans-serif');
  root.style.setProperty('--font-heading', fonts.heading || 'Poppins, sans-serif');
  root.style.setProperty('--font-size-base', fonts.baseSize || '16px');

  const headingSizes = fonts.headingSizes || {};
  Object.entries(headingSizes).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value);
  });
}

function applyColorVariables(colors = {}) {
  applyCssVariables('color', colors);
}

function applySpacingVariables(spacing = {}) {
  applyCssVariables('spacing', spacing);
}

function applyCssVariables(prefix, variables) {
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(`--${prefix}-${key}`, value);
  });
}

function updateMetaThemeColor(color) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && color) {
    meta.setAttribute('content', color);
  }
}

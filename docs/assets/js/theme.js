document.addEventListener('DOMContentLoaded', async () => {
  try {
    // If theme is inside config
    const themeRes = await fetch('../../theme.json');
    const theme = await themeRes.json();

    if (!theme) return;

    const root = document.documentElement;

    // Dark mode toggle
    if (theme.darkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }

    // Set font families
    root.style.setProperty('--font-body', theme.fonts.body || 'Inter, sans-serif');
    root.style.setProperty('--font-heading', theme.fonts.heading || 'Inter, sans-serif');

    // Set heading sizes
    root.style.setProperty('--font-size-h1', theme.fonts.headingSizes.h1);
    root.style.setProperty('--font-size-h2', theme.fonts.headingSizes.h2);
    root.style.setProperty('--font-size-h3', theme.fonts.headingSizes.h3);

    // Set colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Optionally set base size
    if (theme.fonts.baseSize) {
      root.style.setProperty('--font-size-base', theme.fonts.baseSize);
    }

  } catch (err) {
    console.error('Failed to load theme config:', err);
  }
});

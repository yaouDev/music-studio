(async () => {
  try {
    const res = await fetch('assets/data/theme.json');
    const data = await res.json();
    const root = document.documentElement.style;

    // Set colors
    Object.entries(data.colors).forEach(([key, value]) => {
      root.setProperty(`--color-${key}`, value);
    });

    // Set spacing
    Object.entries(data.spacing).forEach(([key, value]) => {
      root.setProperty(`--spacing-${key}`, value);
    });

    // Set fonts (sizes and weights only)
    root.setProperty('--font-base-size', data.fonts.baseSize);
    root.setProperty('--font-weight-body', data.fonts.fontWeights.body);
    root.setProperty('--font-weight-heading', data.fonts.fontWeights.heading);
    root.setProperty('--heading-h1-size', data.fonts.headingSizes.h1);
    root.setProperty('--heading-h2-size', data.fonts.headingSizes.h2);
    root.setProperty('--heading-h3-size', data.fonts.headingSizes.h3);
  } catch (e) {
    console.error('Failed to load theme:', e);
  }
})();

(async () => {
  try {
    const res = await fetch('assets/theme.json');
    const data = await res.json();
    const theme = data.theme;
    const root = document.documentElement.style;

    // Update color variables (optional)
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.setProperty(`--color-${key.toLowerCase()}`, value);
    });

    // Update font variables
    const fonts = theme.fonts;
    root.setProperty('--font-body', fonts.body);
    root.setProperty('--font-heading', fonts.heading);
    root.setProperty('--font-base-size', fonts.baseSize);
    root.setProperty('--font-weight-body', fonts.fontWeights.body);
    root.setProperty('--font-weight-heading', fonts.fontWeights.heading);
    root.setProperty('--heading-h1-size', fonts.headingSizes.h1);
    root.setProperty('--heading-h2-size', fonts.headingSizes.h2);
    root.setProperty('--heading-h3-size', fonts.headingSizes.h3);

    // Dynamically load Google Fonts
    const extractFontNames = (fontString) =>
      fontString
        .split(',')
        .map(f => f.trim())
        .filter(f => !['sans-serif', 'serif', 'monospace'].includes(f.toLowerCase()))
        .map(f => f.replace(/['"]/g, ''));

    const fontsToLoad = new Set([
      ...extractFontNames(fonts.body),
      ...extractFontNames(fonts.heading),
    ]);

    if (fontsToLoad.size > 0) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?' +
        [...fontsToLoad].map(f => `family=${encodeURIComponent(f)}`).join('&') +
        '&display=swap';
      document.head.appendChild(link);
    }

    // Optional: set body font-family immediately to avoid flash
    document.body.style.fontFamily = fonts.body;

  } catch (error) {
    console.error('Error loading theme:', error);
  }
})();

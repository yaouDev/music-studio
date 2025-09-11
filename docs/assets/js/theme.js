(async () => {
  try {
    const res = await fetch('/theme.json'); // adjust path as needed
    const data = await res.json();
    const theme = data.theme;
    const root = document.documentElement.style;

    // Set colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.setProperty(`--color-${key.toLowerCase()}`, value);
    });

    // Set fonts info
    const fonts = theme.fonts;
    root.setProperty('--font-body', fonts.body);
    root.setProperty('--font-heading', fonts.heading);
    root.setProperty('--font-base-size', fonts.baseSize);
    root.setProperty('--font-weight-body', fonts.fontWeights.body);
    root.setProperty('--font-weight-heading', fonts.fontWeights.heading);
    root.setProperty('--heading-h1-size', fonts.headingSizes.h1);
    root.setProperty('--heading-h2-size', fonts.headingSizes.h2);
    root.setProperty('--heading-h3-size', fonts.headingSizes.h3);

    // Extract just the font family names (remove quotes and fallback fonts)
    const extractFontNames = (fontString) =>
      fontString
        .split(',')
        .map(f => f.trim().replace(/['"]/g, ''))
        .filter(f => !['system-ui', 'sans-serif', 'serif', 'monospace'].includes(f.toLowerCase()));

    const fontsToLoad = new Set([
      ...extractFontNames(fonts.body),
      ...extractFontNames(fonts.heading),
    ]);

    // Compose Google Fonts URL with weights
    if (fontsToLoad.size > 0) {
      // Get unique weights from JSON, convert to string, e.g. '500;700'
      const weights = new Set([
        theme.fonts.fontWeights.body,
        theme.fonts.fontWeights.heading
      ]);
      const weightString = Array.from(weights).sort().join(';');

      const fontFamiliesParam = Array.from(fontsToLoad)
        .map(f => `family=${encodeURIComponent(f)}:wght@${weightString}`)
        .join('&');

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?${fontFamiliesParam}&display=swap`;
      document.head.appendChild(link);
    }

    // Apply the body font-family immediately to reduce flash
    document.body.style.fontFamily = fonts.body;

  } catch (error) {
    console.error('Error loading theme:', error);
  }
})();

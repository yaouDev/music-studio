document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('theme.json');
    const { theme } = await res.json();
    const root = document.documentElement;

    // Font families
    if (theme.fonts?.body)
      root.style.setProperty('--font-body', theme.fonts.body);
    if (theme.fonts?.heading)
      root.style.setProperty('--font-heading', theme.fonts.heading);

    // Font sizes
    if (theme.fonts?.baseSize)
      root.style.setProperty('--font-size-base', theme.fonts.baseSize);
    if (theme.fonts?.headingSizes) {
      Object.entries(theme.fonts.headingSizes).forEach(([key, value]) => {
        root.style.setProperty(`--font-size-${key}`, value);
      });
    }

    // Colors
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }

    // Spacing
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value);
      });
    }

  } catch (err) {
    console.error('Error loading theme:', err);
  }
});

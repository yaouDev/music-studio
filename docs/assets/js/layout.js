// assets/js/layout.js
export async function loadLayout(lang) {
  const configFile = lang === 'jp' ? 'config_jp.json' : 'config.json';
  const res = await fetch(`assets/data/${configFile}`);
  const config = await res.json();

  // Determine if we are on index.html or project.html to set base href for nav links
  const path = window.location.pathname;
  const isOnIndex = path.endsWith('index.html') || path === '/' || path === '';
  const baseHref = isOnIndex ? '' : 'index.html';

  // Create nav links
  const navLinksHtml = config.nav.map(link => {
    return `<a href="${baseHref}#${link.section}" class="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">${link.label}</a>`;
  }).join('');

  // Build header
  const header = document.createElement('header');
  header.className = "sticky top-0 z-50 shadow-md bg-theme-primary";
  header.innerHTML = `
    <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <a href="index.html" class="text-xl font-bold text-theme-text" id="nav-name">${config.name}</a>
        <div class="lang-toggle space-x-2">
          <button onclick="setLanguage('en')" class="text-sm underline">EN</button>
          <button onclick="setLanguage('jp')" class="text-sm underline">JP</button>
        </div>
      </div>
      <div class="space-x-4 hidden md:flex" id="nav-links">
        ${navLinksHtml}
      </div>
    </nav>
  `;
  document.body.prepend(header);

  // Build footer
  const footer = document.createElement('footer');
  footer.className = "py-6 text-center mt-16";
  footer.innerHTML = `
    <div class="container mx-auto px-4" style="color: var(--color-footer-text); background-color: var(--color-footer-bg);">
      <p>&copy; 2025 <span id="footer-name">${config.name}</span>. <span id="footer-text">${config.footerText}</span></p>
    </div>
  `;
  document.body.appendChild(footer);
}

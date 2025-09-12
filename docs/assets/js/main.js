document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get language from localStorage or default to English
    const lang = localStorage.getItem('lang') || 'en';

    // Choose JSON files based on language
    const configFile = lang === 'jp' ? 'config_jp.json' : 'config.json';
    const projectsFile = lang === 'jp' ? 'projects_jp.json' : 'projects.json';

    // Fetch config and projects in parallel
    const [configRes, projectsRes] = await Promise.all([
      fetch(configFile),
      fetch(projectsFile)
    ]);

    if (!configRes.ok || !projectsRes.ok) {
      throw new Error('Failed to load JSON files');
    }

    const config = await configRes.json();
    const projects = await projectsRes.json();

    // Apply fonts based on language
    applyFontTheme(lang);

    // Set page metadata
    document.getElementById('site-title').textContent = config.siteTitle;
    document.getElementById('meta-description').content = config.meta.description;
    document.getElementById('og-title').content = config.meta.ogTitle;
    document.getElementById('og-description').content = config.meta.ogDescription;
    document.getElementById('og-image').content = config.meta.ogImage;

    // Update header
    document.getElementById('nav-name').textContent = config.name;
    const navLinks = document.getElementById('nav-links');
    navLinks.innerHTML = ''; // Clear existing links
    config.nav.forEach(link => {
      const a = document.createElement('a');
      a.href = `#${link.section}`;
      a.textContent = link.label;
      a.className = "text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400";
      navLinks.appendChild(a);
    });

    // Toggle sections based on config.showSections and fill content
    toggleSection('hero', config.showSections.hero, () => {
      document.getElementById('hero-title').textContent = config.hero.title;
      document.getElementById('hero-description').textContent = config.hero.description;
      document.getElementById('hero-button').textContent = config.hero.buttonText;
    });

    toggleSection('about', config.showSections.about, () => {
      document.getElementById('about-title').textContent = config.about.title;
      document.getElementById('about-description').textContent = config.about.description;
    });

    toggleSection('portfolio', config.showSections.portfolio, () => {
      document.getElementById('portfolio-title').textContent = config.portfolio.title;
      const container = document.getElementById('portfolio-container');
      container.innerHTML = '';
      projects.forEach(project => {
        container.innerHTML += createProjectCard(project);
      });
    });

    toggleSection('contact', config.showSections.contact, () => {
      document.getElementById('contact-title').textContent = config.contact.title;
      document.getElementById('contact-description').textContent = config.contact.description;
      const contactBtn = document.getElementById('contact-button');
      contactBtn.textContent = config.contact.buttonText;
      contactBtn.href = `mailto:${config.contact.email}`;
      document.getElementById('contact-fallback').innerHTML =
        `${config.contact.fallbackText} <a href="mailto:${config.contact.email}" class="underline text-indigo-600 dark:text-indigo-400">${config.contact.email}</a>`;
    });

    // Footer
    document.getElementById('footer-name').textContent = config.name;
    document.getElementById('footer-text').textContent = config.footerText;

  } catch (error) {
    console.error('Error loading config or projects:', error);
    document.body.innerHTML = `
      <div class="text-center text-red-500 p-10 text-xl">
        Error loading configuration or project data. Check your JSON files.
      </div>`;
  }
});

// Function to switch fonts via CSS variables based on language
function applyFontTheme(lang) {
  const root = document.documentElement.style;
  if (lang === 'jp') {
    root.setProperty('--font-body', getComputedStyle(document.documentElement).getPropertyValue('--font-body-jp'));
    root.setProperty('--font-heading', getComputedStyle(document.documentElement).getPropertyValue('--font-heading-jp'));
  } else {
    root.setProperty('--font-body', getComputedStyle(document.documentElement).getPropertyValue('--font-body-en'));
    root.setProperty('--font-heading', getComputedStyle(document.documentElement).getPropertyValue('--font-heading-en'));
  }
}

// Language switcher function
function setLanguage(lang) {
  localStorage.setItem('lang', lang);
  location.reload();
}

// Helper to create project cards dynamically
function createProjectCard(project) {
  let mediaHtml = '';

  if (project.type === 'video') {
    mediaHtml = `
      <div class="aspect-video w-full">
        <video controls class="w-full h-full object-cover rounded-t-xl">
          <source src="${project.media_url}" type="video/mp4" />
        </video>
      </div>`;
  } else if (project.type === 'audio') {
    mediaHtml = `
      <div class="p-6">
        <audio controls class="w-full">
          <source src="${project.media_url}" type="audio/mpeg" />
        </audio>
      </div>`;
  } else {
    mediaHtml = `
      <img src="${project.media_url}" alt="${project.title}" class="w-full rounded-t-xl" />`;
  }

  return `
    <a
      href="${project.id}"
      class="block rounded-xl shadow-lg card-theme transform transition-transform duration-300 hover:scale-105 cursor-pointer"
    >
      ${mediaHtml}
      <div class="p-6">
        <h3 class="text-xl font-bold text-theme-text">${project.title}</h3>
        <p class="mt-2 text-sm text-theme-muted">${project.description}</p>
      </div>
    </a>
    `;
}

// Utility function to show/hide sections and optionally run a callback to fill content
function toggleSection(id, show, callback) {
  const section = document.getElementById(id);
  if (!section) return;

  if (show) {
    if (callback) callback();
  } else {
    section.remove();
  }
}

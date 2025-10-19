// assets/js/main.js
import { loadLayout } from './layout.js';

document.addEventListener('DOMContentLoaded', async () => {
  let lang;

  const userLang = navigator.language || navigator.userLanguage || 'en';
  if (!localStorage.getItem('lang')) {
    lang = userLang.startsWith('ja') ? 'jp' : 'en';
    localStorage.setItem('lang', lang);
  } else {
    lang = localStorage.getItem('lang');
  }
  
  try {

    // Load header/footer layout with nav & language switching
    await loadLayout(lang);

    // Choose config & projects files based on language
    const configFile = lang === 'jp' ? 'config_jp.json' : 'config.json';
    const projectsFile = lang === 'jp' ? 'projects_jp.json' : 'projects.json';

    // Fetch config and projects in parallel
    const [configRes, projectsRes] = await Promise.all([
      fetch(`assets/data/${configFile}`),
      fetch(`assets/data/${projectsFile}`)
    ]);

    if (!configRes.ok) throw new Error(`Failed to load ${configFile}`);
    if (!projectsRes.ok) throw new Error(`Failed to load ${projectsFile}`);

    const config = await configRes.json();
    const projects = await projectsRes.json();

    applyFontTheme(lang);

    // Update meta tags & page title from config
    document.title = config.siteTitle || config.name || 'Site';
    document.getElementById('site-title').textContent = config.siteTitle || config.name || 'Site';
    document.getElementById('meta-description').setAttribute('content', config.meta.description || '');
    document.getElementById('og-title').setAttribute('content', config.meta.ogTitle || '');
    document.getElementById('og-description').setAttribute('content', config.meta.ogDescription || '');
    document.getElementById('og-image').setAttribute('content', config.meta.ogImage || '');

    // Hero Section
    toggleSection('hero', config.showSections.hero, () => {
      document.getElementById('hero-title').textContent = config.hero.title || '';
      document.getElementById('hero-description').textContent = config.hero.description || '';
      const heroBtn = document.getElementById('hero-button');
      heroBtn.textContent = config.hero.buttonText || '';
      heroBtn.href = config.hero.buttonLink || '#portfolio';
    });

    // About Section
    toggleSection('about', config.showSections.about, () => {
      document.getElementById('about-title').textContent = config.about.title || '';
      document.getElementById('about-description').textContent = config.about.description || '';
    });

    // Portfolio Section
    toggleSection('portfolio', config.showSections.portfolio, () => {
      document.getElementById('portfolio-title').textContent = config.portfolio.title || '';
      const container = document.getElementById('portfolio-container');
      container.innerHTML = '';

      if (!projects.length) {
        container.innerHTML = `<p class="text-center text-theme-muted">No projects found.</p>`;
        return;
      }

      projects.forEach(project => {
        container.insertAdjacentHTML('beforeend', createProjectCard(project));
      });
    });

    // Contact Section
    toggleSection('contact', config.showSections.contact, () => {
      document.getElementById('contact-title').textContent = config.contact.title || '';
      document.getElementById('contact-description').textContent = config.contact.description || '';

      const contactBtn = document.getElementById('contact-button');
      contactBtn.textContent = config.contact.buttonText || '';
      contactBtn.href = `mailto:${config.contact.email || ''}`;

      document.getElementById('contact-fallback').innerHTML = `
        ${config.contact.fallbackText || ''} 
        <a href="mailto:${config.contact.email || ''}" class="underline text-indigo-600 dark:text-indigo-400">
          ${config.contact.email || ''}
        </a>`;
    });

  } catch (error) {
    console.error('Error loading main.js:', error);
    document.body.innerHTML = `
      <div class="text-center text-red-500 p-10 text-xl">
        Error loading content. Please check your JSON files and console.
      </div>
    `;
  }
});

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

function createProjectCard(project) {
  let mediaHtml = '';
  if (project.type === 'video') {
    mediaHtml = `
      <div class="aspect-video w-full">
        <video controls class="w-full h-full object-cover rounded-t-xl">
          <source src="${project.media_url}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>`;
  } else if (project.type === 'audio') {
    mediaHtml = `
      <div class="p-6">
        <audio controls class="w-full" preload="none">
          <source src="${project.media_url}" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>`;
  } else if (project.type === 'youtube') {
    return `
      <iframe width="394.67" height="222" src="${project.media_url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
  } else {
    mediaHtml = `<img src="${project.media_url}" alt="${project.title}" class="w-full rounded-t-xl object-cover" />`;
  }

  return `
    <a href="project.html?id=${encodeURIComponent(project.id)}" class="block rounded-xl shadow-lg card-theme transform transition-transform duration-300 hover:scale-105 cursor-pointer">
      ${mediaHtml}
      <div class="p-6">
        <h3 class="text-xl font-bold text-theme-text">${project.title}</h3>
        <p class="mt-2 text-sm text-theme-muted">${project.description}</p>
      </div>
    </a>
  `;
}

function toggleSection(id, show, callback) {
  const section = document.getElementById(id);
  if (!section) return;
  if (show) {
    if (callback) callback();
  } else {
    section.remove();
  }
}

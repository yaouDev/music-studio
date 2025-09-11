document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [configRes, projectsRes] = await Promise.all([
      fetch('config.json'),
      fetch('projects.json')
    ]);

    const config = await configRes.json();
    const projects = await projectsRes.json();

    // Set page metadata
    document.getElementById('site-title').textContent = config.siteTitle;
    document.getElementById('meta-description').content = config.meta.description;
    document.getElementById('og-title').content = config.meta.ogTitle;
    document.getElementById('og-description').content = config.meta.ogDescription;
    document.getElementById('og-image').content = config.meta.ogImage;

    // Header
    document.getElementById('nav-name').textContent = config.name;
    const navLinks = document.getElementById('nav-links');
    config.nav.forEach(link => {
      const a = document.createElement('a');
      a.href = `#${link.section}`;
      a.textContent = link.label;
      a.className = "text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400";
      navLinks.appendChild(a);
    });

    // Hero Section
    if (!config.showSections.hero) {
      document.getElementById('hero').remove();
    } else {
      document.getElementById('hero-title').textContent = config.hero.title;
      document.getElementById('hero-description').textContent = config.hero.description;
      document.getElementById('hero-button').textContent = config.hero.buttonText;
    }

    // About Section
    if (!config.showSections.about) {
      document.getElementById('about').remove();
    } else {
      document.getElementById('about-title').textContent = config.about.title;
      document.getElementById('about-description').textContent = config.about.description;
    }

    // Portfolio Section
    if (!config.showSections.portfolio) {
      document.getElementById('portfolio').remove();
    } else {
      document.getElementById('portfolio-title').textContent = config.portfolio.title;
      const container = document.getElementById('portfolio-container');
      projects.forEach(project => {
        container.innerHTML += createProjectCard(project);
      });
    }

    // Contact Section
    if (!config.showSections.contact) {
      document.getElementById('contact').remove();
    } else {
      document.getElementById('contact-title').textContent = config.contact.title;
      document.getElementById('contact-description').textContent = config.contact.description;
      document.getElementById('contact-button').textContent = config.contact.buttonText;
      document.getElementById('contact-button').href = `mailto:${config.contact.email}`;
      document.getElementById('contact-fallback').innerHTML =
        `Or email us directly at <a href="mailto:${config.contact.email}" class="underline text-indigo-600 dark:text-indigo-400">${config.contact.email}</a>`;
    }

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

// Helper: Build project cards
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
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform">
      ${mediaHtml}
      <div class="p-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${project.title}</h3>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">${project.description}</p>
      </div>
    </div>`;
}

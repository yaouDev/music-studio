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
    mediaHtml = `<img src="${project.media_url}" alt="${project.title}" class="w-full rounded-t-xl" />`;
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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [configRes, projectsRes] = await Promise.all([
      fetch('config.json'),
      fetch('projects.json')
    ]);

    const config = await configRes.json();
    const projects = await projectsRes.json();

    // Meta
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

    // Hero
    if (!config.showSections.hero) {
      document.getElementById('hero').remove();
    } else {
      document.getElementById('hero-title').textContent = config.hero.title;
      document.getElementById('hero-description').textContent = config.hero.description;
      document.getElementById('hero-button').textContent = config.hero.buttonText;
    }

    // About
    if (!config.showSections.about) {
      document.getElementById('about').remove();
    } else {
      document.getElementById('about-title').textContent = config.about.title;
      document.getElementById('about-description').textContent = config.about.description;
    }

    // Portfolio
    if (!config.showSections.portfolio) {
      document.getElementById('portfolio').remove();
    } else {
      document.getElementById('portfolio-title').textContent = config.portfolio.title;
      const portfolioContainer = document.getElementById('portfolio-container');
      projects.forEach(project => {
        portfolioContainer.innerHTML += createProjectCard(project);
      });
    }

    // Contact
    document.getElementById('contact-name').placeholder = config.contact.placeholders.name;
    document.getElementById('contact-email').placeholder = config.contact.placeholders.email;
    document.getElementById('contact-message').placeholder = config.contact.placeholders.message;
    document.getElementById('contact-button').textContent = config.contact.buttonText;

    // Show fallback mailto link
    const fallback = document.getElementById('contact-fallback');
    fallback.innerHTML = `Or email me directly at <a href="mailto:${config.contact.email}" class="underline text-indigo-600 dark:text-indigo-400">${config.contact.email}</a>`;

    // Handle mailto submission
    document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    const subject = encodeURIComponent("New Contact From Portfolio");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

    window.location.href = `mailto:${config.contact.email}?subject=${subject}&body=${body}`;
    });


    // Footer
    document.getElementById('footer-name').textContent = config.name;
    document.getElementById('footer-text').textContent = config.footerText;

  } catch (error) {
    console.error('Error loading configuration:', error);
    document.body.innerHTML = `<div class="text-center text-red-500 p-10 text-xl">Error loading config or projects. Check your JSON files.</div>`;
  }
});

// assets/js/project.js
import { loadLayout } from './layout.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const lang = localStorage.getItem('lang') || 'en';

    // Load header/footer with nav links
    await loadLayout(lang);

    // Apply fonts based on language
    applyFontTheme(lang);

    // Parse project ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    if (!projectId) {
      throw new Error('No project ID specified in URL');
    }

    // Load config and projects JSON based on lang
    const configFile = lang === 'jp' ? 'config_jp.json' : 'config.json';
    const projectsFile = lang === 'jp' ? 'projects_jp.json' : 'projects.json';

    const [configRes, projectsRes] = await Promise.all([
      fetch(`assets/data/${configFile}`),
      fetch(`assets/data/${projectsFile}`)
    ]);
    if (!configRes.ok || !projectsRes.ok) {
      throw new Error('Failed to load JSON data');
    }

    const config = await configRes.json();
    const projects = await projectsRes.json();

    // Find project by ID
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error(`Project with ID "${projectId}" not found`);
    }

    // Set page title and metadata
    document.title = project.title + ' | ' + (config.siteTitle || config.name);
    document.getElementById('page-title').textContent = project.title;
    document.getElementById('meta-description').setAttribute('content', project.description || '');
    document.getElementById('og-title').setAttribute('content', project.title);
    document.getElementById('og-description').setAttribute('content', project.description || '');
    document.getElementById('og-image').setAttribute('content', project.media_url || '');

    // Load project media
    const mediaContainer = document.getElementById('project-media');
    mediaContainer.innerHTML = getMediaHtml(project);

    // Load and render markdown content
    if (project.content) {
      const mdRes = await fetch(project.content);
      if (!mdRes.ok) {
        throw new Error('Failed to load project markdown content');
      }
      const mdText = await mdRes.text();
      const converter = new showdown.Converter({ tables: true, simplifiedAutoLink: true, strikethrough: true });
      const htmlContent = converter.makeHtml(mdText);
      document.getElementById('project-content').innerHTML = htmlContent;
    } else {
      document.getElementById('project-content').innerHTML = '';
    }
  } catch (error) {
    console.error('Error in project.js:', error);
    document.body.innerHTML = `
      <div class="text-center text-red-500 p-10 text-xl">
        Error loading project content.<br />
        ${error.message}
      </div>
    `;
  }
});

// Helper: Convert standard YouTube URLs to embed format
function getYouTubeEmbedUrl(url) {
  const standardUrl = /youtube\.com\/watch\?v=([^&]+)/;
  const shortUrl = /youtu\.be\/([^?&]+)/;

  let match = url.match(standardUrl) || url.match(shortUrl);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  // Fallback to raw URL (may not work as embed)
  return url;
}

// Helper: Return media HTML based on type
function getMediaHtml(project) {
  if (!project.media_url) return '';

  if (project.type === 'video') {
    return `
      <div class="aspect-video w-full rounded-lg overflow-hidden mb-6">
        <video controls class="w-full h-full object-cover">
          <source src="${project.media_url}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    `;
  } else if (project.type === 'audio') {
    return `
      <div class="mb-6">
        <audio controls class="w-full">
          <source src="${project.media_url}" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    `;
  } else if (project.type === 'youtube') {
    const embedUrl = getYouTubeEmbedUrl(project.media_url);
    return `
      <div class="aspect-video w-full rounded-lg overflow-hidden mb-6">
        <iframe class="w-full h-full" src="${embedUrl}" title="YouTube video player" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
        </iframe>
      </div>
    `;
  } else {
    // default to image
    return `<img src="${project.media_url}" alt="${project.title}" class="w-full rounded-lg mb-6" />`;
  }
}


// Apply font theme based on language
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

// Language switch preserving current project ID and switching lang param
window.setLanguage = function(lang) {
  localStorage.setItem('lang', lang);
  const urlParams = new URLSearchParams(window.location.search);
  const currentId = urlParams.get('id');
  if (currentId) {
    // Reload page with same project id, just switching lang
    // The projects file loaded depends on localStorage, so just reload is fine
    location.reload();
  } else {
    location.href = 'index.html';
  }
};

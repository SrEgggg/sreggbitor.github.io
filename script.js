const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});
window.matchMedia('(min-width: 851px)').addEventListener('change', closeMenu);
document.querySelector('#year').textContent = new Date().getFullYear();

const themeButton = document.querySelector('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let chosenTheme = false;
try { chosenTheme = ['light', 'dark'].includes(localStorage.getItem('bitor-theme')); } catch (_) {}
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const next = theme === 'dark' ? 'light' : 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${next} mode`);
  themeButton.title = `Switch to ${next} mode`;
  themeButton.querySelector('.theme-label').textContent = next === 'dark' ? 'Dark' : 'Light';
  themeButton.querySelector('.theme-icon').textContent = next === 'dark' ? '☾' : '☀';
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#191c19' : '#f5f3ec';
}
applyTheme(document.documentElement.dataset.theme || 'light');
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  chosenTheme = true;
  applyTheme(theme);
  try { localStorage.setItem('bitor-theme', theme); } catch (_) {}
});
systemTheme.addEventListener('change', event => {
  if (!chosenTheme) applyTheme(event.matches ? 'dark' : 'light');
});

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('arrived');
      reveal.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.section-heading, .project-card, .education-entry, .achievement-card, .creator-art, .skills-grid article').forEach(el => reveal.observe(el));
}

const pageSections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...navigation.querySelectorAll('a')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    const active = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!active) return;
    navLinks.forEach(link => {
      if (link.getAttribute('href') === '#' + active.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-80px 0px -55% 0px', threshold: 0 });
  pageSections.forEach(section => sectionObserver.observe(section));
}

const copyButton = document.querySelector('.copy-email');
const copyStatus = document.querySelector('.copy-status');
let copyReset;
copyButton.addEventListener('click', async () => {
  clearTimeout(copyReset);
  try {
    await navigator.clipboard.writeText('sreggg99@gmail.com');
    copyStatus.textContent = 'Email copied!';
  } catch (_) {
    copyStatus.textContent = 'Please select and copy the email address above.';
  }
  copyReset = setTimeout(() => { copyStatus.textContent = ''; }, 5000);
});


// Project gallery: native touch/trackpad scrolling, buttons, and keyboard navigation.
const gallery = document.querySelector('.project-gallery');
const projectCards = [...gallery.querySelectorAll('.project-card')];
const previousProject = document.querySelector('.gallery-prev');
const nextProject = document.querySelector('.gallery-next');
const galleryStatus = document.querySelector('.gallery-status');
document.querySelector('.gallery-buttons').hidden = projectCards.length < 2;
const galleryDots = projectCards.map((card, index) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.textContent = card.dataset.galleryLabel || card.querySelector('h3').textContent;
  dot.setAttribute('aria-label', 'Show ' + card.querySelector('h3').textContent.replace(/[\[\]]/g, ''));
  dot.setAttribute('aria-controls', 'project-gallery');
  dot.addEventListener('click', () => showProject(index));
  document.querySelector('.gallery-dots').append(dot);
  return dot;
});
function projectPosition(card) {
  return card.getBoundingClientRect().left - gallery.getBoundingClientRect().left + gallery.scrollLeft;
}
function currentProjectIndex() {
  let closest = 0;
  projectCards.forEach((card, index) => {
    if (Math.abs(projectPosition(card) - gallery.scrollLeft) < Math.abs(projectPosition(projectCards[closest]) - gallery.scrollLeft)) closest = index;
  });
  return closest;
}
function updateGallery() {
  const index = currentProjectIndex();
  previousProject.disabled = index === 0;
  nextProject.disabled = index === projectCards.length - 1;
  galleryStatus.textContent = projectCards[index].querySelector('h3').textContent;
  galleryDots.forEach((dot, dotIndex) => dot.setAttribute('aria-pressed', String(dotIndex === index)));
}
function showProject(index) {
  index = Math.max(0, Math.min(projectCards.length - 1, index));
  gallery.scrollTo({ left: projectPosition(projectCards[index]), behavior: motionPreference.matches ? 'instant' : 'smooth' });
}
previousProject.addEventListener('click', () => showProject(currentProjectIndex() - 1));
nextProject.addEventListener('click', () => showProject(currentProjectIndex() + 1));
gallery.addEventListener('keydown', event => {
  if (event.target !== gallery) return;
  const keys = { ArrowRight: currentProjectIndex() + 1, ArrowLeft: currentProjectIndex() - 1, Home: 0, End: projectCards.length - 1 };
  if (!(event.key in keys)) return;
  event.preventDefault();
  showProject(keys[event.key]);
});
let galleryScrollTimer;
gallery.addEventListener('scroll', () => {
  clearTimeout(galleryScrollTimer);
  galleryScrollTimer = setTimeout(updateGallery, 120);
}, { passive: true });
window.addEventListener('resize', updateGallery);
updateGallery();

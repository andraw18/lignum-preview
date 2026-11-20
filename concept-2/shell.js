function setupConceptShell(hero, onMenuChange = () => {}) {
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('#site-menu');
  const menuButton = header.querySelector('.menu-button');

  function syncHeader() {
    header.classList.toggle('is-over-hero', hero.getBoundingClientRect().bottom > header.offsetHeight);
  }

  header.classList.add('is-sticky');
  window.addEventListener('scroll', syncHeader, { passive: true });
  window.addEventListener('resize', syncHeader);
  syncHeader();

  if (typeof menu.showModal !== 'function') return;
  menuButton.hidden = false;
  menuButton.addEventListener('click', () => {
    menu.showModal();
    menu.scrollTop = 0;
    menuButton.setAttribute('aria-expanded', 'true');
    onMenuChange();
  });
  menu.querySelector('[data-menu-close]').addEventListener('click', () => menu.close());
  menu.addEventListener('click', event => {
    if (event.target.closest('a[href]')) menu.close();
  });
  menu.addEventListener('close', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    onMenuChange();
  });
}

const projectHero = document.querySelector('.project-hero');
if (projectHero) setupConceptShell(projectHero);

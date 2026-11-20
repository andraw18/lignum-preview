const menuDialog = document.querySelector('#site-menu');
const menuTrigger = document.querySelector('.site-menu-trigger');

if (typeof menuDialog?.showModal === 'function' && menuTrigger) {
  const closeMenu = menuDialog.querySelector('.site-menu-close');
  const pagePath = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
  const currentLink = [...menuDialog.querySelectorAll('nav a')].find(link => link.pathname === pagePath && !link.hash);
  currentLink?.setAttribute('aria-current', 'page');

  menuTrigger.hidden = false;
  document.documentElement.classList.add('site-menu-ready');
  menuTrigger.addEventListener('click', () => {
    menuDialog.showModal();
    menuDialog.scrollTop = 0;
    menuTrigger.setAttribute('aria-expanded', 'true');
  });
  closeMenu.addEventListener('click', () => menuDialog.close());
  menuDialog.addEventListener('close', () => menuTrigger.setAttribute('aria-expanded', 'false'));
  menuDialog.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      menuDialog.close();
      if (link.pathname === location.pathname && link.hash === location.hash) openProductFromHash();
    }
  });
}

function openProductFromHash() {
  const product = document.getElementById(location.hash.slice(1));
  if (!product?.matches('details.product')) return;
  const openProduct = document.querySelector('.product[open]');
  if (openProduct && openProduct !== product) openProduct.open = false;
  product.open = true;
}

const productLink = document.querySelector('.header-nav > a[href="#products"], .masthead .nav > a[href="/lignum-preview/concept-1/products/"]');
const productLinks = menuDialog?.querySelector('.site-menu-detail-links:has([data-product-tab], a[href="/lignum-preview/concept-1/products/#furniture"])');

if (productLink && productLinks) {
  const dropdown = document.createElement('div');
  dropdown.className = 'product-nav';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'product-nav-toggle';
  toggle.setAttribute('aria-label', 'Продуктовые направления');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'product-nav-panel');

  const panel = document.createElement('div');
  panel.id = 'product-nav-panel';
  panel.className = 'product-nav-panel';
  panel.hidden = true;
  const links = productLinks.cloneNode(true);
  links.className = 'product-nav-list';
  panel.append(links);
  productLink.before(dropdown);
  dropdown.append(productLink, toggle, panel);

  function setDropdownOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => setDropdownOpen(panel.hidden));
  dropdown.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') setDropdownOpen(true);
  });
  dropdown.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && !panel.contains(document.activeElement)) setDropdownOpen(false);
  });
  dropdown.addEventListener('focusout', event => {
    if (!dropdown.contains(event.relatedTarget)) setDropdownOpen(false);
  });
  document.addEventListener('pointerdown', event => {
    if (!dropdown.contains(event.target)) setDropdownOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || panel.hidden) return;
    if (panel.contains(document.activeElement)) toggle.focus();
    setDropdownOpen(false);
  });
  panel.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    setDropdownOpen(false);
    if (link.pathname === location.pathname && link.hash === location.hash) openProductFromHash();
  });
}

openProductFromHash();
window.addEventListener('hashchange', openProductFromHash);

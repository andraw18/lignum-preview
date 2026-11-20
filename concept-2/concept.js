const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('#site-menu');

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: .12 });
  document.documentElement.classList.add('motion');
  for (const element of document.querySelectorAll('[data-reveal]')) revealObserver.observe(element);
}

const heroSlides = [
  ['media/capital-kitchen-wide.webp', 'Кухня из орехового шпона, эмали и камня в ЖК «Капитал Тауэрс»', 'ЖК «Капитал Тауэрс»', 'Кухня · расширенный кадр', ['54% 49%', '55% 52%']],
  ['/lignum-preview/assets/reka-living-retouched.webp', 'Деревянный стеллаж и стеклянные конструкции в гостиной ЖК «Река»', 'ЖК «Река»', 'Стеллаж и деревянные панели', ['49% 55%', '39% 53%']],
  ['/lignum-preview/assets/reka.webp', 'Дубовые панели и рифлёное стекло в ЖК «Река»', 'ЖК «Река»', 'Панели и стеклянные перегородки', ['48% 54%', '43% 52%']],
];
const hero = document.querySelector('.hero');
const heroImage = document.querySelector('.hero-image');
const heroControls = document.querySelector('.hero-controls');
const heroName = document.querySelector('[data-hero-name]');
const heroType = document.querySelector('[data-hero-type]');
const heroNumber = document.querySelector('[data-slide-number]');
const heroPause = document.querySelector('[data-hero-pause]');
const swapHero = imageSwitcher(heroImage, {
  duration: 1120,
  keyframes: [{ opacity: 0 }, { opacity: 1 }]
});
let heroIndex = 0;
let heroTimer;
let heroInView = true;
let heroPaused = false;

function showHero(index) {
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  const [file, alt, project, type, crops] = heroSlides[heroIndex];
  const slideNumber = String(heroIndex + 1).padStart(2, '0');
  swapHero(file, alt, crops, () => {
    heroName.textContent = project;
    heroType.textContent = type;
    heroNumber.textContent = slideNumber;
  });
  scheduleHero();
}

function scheduleHero() {
  clearTimeout(heroTimer);
  heroPause.hidden = reducedMotion.matches;
  const canPlay = heroInView && !heroPaused && !document.hidden && !reducedMotion.matches && !menu.open;
  heroImage.classList.toggle('is-playing', canPlay);
  heroNumber.parentElement.setAttribute('aria-live', canPlay ? 'off' : 'polite');
  if (canPlay) heroTimer = setTimeout(() => showHero(heroIndex + 1), 5600);
}

heroControls.hidden = false;
document.querySelector('[data-hero-previous]').addEventListener('click', () => showHero(heroIndex - 1));
document.querySelector('[data-hero-next]').addEventListener('click', () => showHero(heroIndex + 1));
heroPause.addEventListener('click', () => {
  heroPaused = !heroPaused;
  heroPause.textContent = heroPaused ? '▷' : 'Ⅱ';
  heroPause.setAttribute('aria-label', heroPaused ? 'Продолжить смену фото' : 'Приостановить смену фото');
  scheduleHero();
});
document.addEventListener('visibilitychange', scheduleHero);
reducedMotion.addEventListener('change', scheduleHero);
if ('IntersectionObserver' in window) {
  const heroObserver = new IntersectionObserver(([entry]) => {
    heroInView = entry.intersectionRatio >= .3;
    scheduleHero();
  }, { threshold: .3 });
  heroObserver.observe(hero);
}
scheduleHero();

setupConceptShell(hero, scheduleHero);

const workGallery = document.querySelector('.work-gallery');
const workStage = workGallery.querySelector('.work-stage');
const workRail = workGallery.querySelector('.work-rail');
const workTrack = workRail.querySelector('.work-track');
const workCards = [...workTrack.querySelectorAll('.work')];
const workControls = workGallery.querySelector('.work-controls');
const workCurrent = workControls.querySelector('[data-work-current]');
const workPrevious = workControls.querySelector('[data-work-previous]');
const workNext = workControls.querySelector('[data-work-next]');
let workStops = [];
let workPositions = [];
let workWidth = 0;
let workDistance = 0;
let workTravel = 0;
let workPinTop = 0;
let workRenderFrame = 0;
let renderedWorkOffset = -1;

function workScrollOffset() {
  if (!workTravel) return 0;
  const progress = (workPinTop - workGallery.getBoundingClientRect().top) / workTravel;
  return workDistance * Math.max(0, Math.min(1, progress));
}

function renderWorkGallery() {
  workRenderFrame = 0;
  const offset = workScrollOffset();
  if (offset === renderedWorkOffset) return;
  renderedWorkOffset = offset;
  const progress = workDistance ? offset / workDistance : 0;
  const reduce = reducedMotion.matches;
  const workIndex = workStops.reduce((nearest, stop, index) =>
    Math.abs(offset - stop) < Math.abs(offset - workStops[nearest]) ? index : nearest, 0);
  const displayOffset = reduce ? workStops[workIndex] : offset;
  const center = displayOffset + workWidth / 2;
  workTrack.style.setProperty('--work-offset', displayOffset + 'px');
  workCurrent.textContent = String(workIndex + 1).padStart(2, '0');
  workPrevious.setAttribute('aria-disabled', String(offset <= 1));
  workNext.setAttribute('aria-disabled', String(offset >= workDistance - 1));
  workControls.style.setProperty('--work-progress', (1 + progress * (workCards.length - 1)) / workCards.length);
  for (const [index, { card, left, width }] of workPositions.entries()) {
    const stop = workStops[index];
    const neighbor = workStops[offset < stop ? index - 1 : index + 1] ?? stop;
    const focus = Math.max(0, 1 - Math.abs(offset - stop) / Math.max(1, Math.abs(neighbor - stop)));
    const opacity = reduce ? Number(index === workIndex) : Math.max(0, Math.min(1, focus * 3.5 - .1));
    const limit = width * .025;
    const drift = (center - left - width / 2) * .033;
    const shift = reduce ? 0 : Math.max(-limit, Math.min(limit, drift));
    card.style.setProperty('--work-scale', .72 + .28 * focus);
    card.style.setProperty('--work-opacity', opacity);
    card.style.setProperty('--work-shift', shift + 'px');
    card.classList.toggle('is-offstage', opacity === 0);
  }
}

function queueWorkRender() {
  if (!workRenderFrame) workRenderFrame = requestAnimationFrame(renderWorkGallery);
}

function measureWorkGallery() {
  workWidth = workRail.clientWidth;
  workPositions = workCards.map(card => ({ card, left: card.offsetLeft, width: card.offsetWidth }));
  const firstCenter = workPositions[0].left + workPositions[0].width / 2;
  workStops = workPositions.map(({ left, width }) => left + width / 2 - firstCenter);
  workDistance = workStops[workStops.length - 1];
  workTravel = workDistance * .9;
  workGallery.style.setProperty('--work-travel', (workTravel ? workTravel + 96 : 0) + 'px');
  workPinTop = parseFloat(getComputedStyle(workStage).top);
  renderedWorkOffset = -1;
  queueWorkRender();
}

function goToWorkOffset(offset, behavior) {
  if (!workTravel) return;
  const start = scrollY + workGallery.getBoundingClientRect().top - workPinTop;
  window.scrollTo({ top: start + offset / workDistance * workTravel, behavior });
}

function stepWork(direction) {
  const offset = workScrollOffset();
  const target = direction > 0
    ? workStops.find(stop => stop > offset + 1)
    : workStops.findLast(stop => stop < offset - 1);
  if (target !== undefined) goToWorkOffset(target, reducedMotion.matches ? 'instant' : 'smooth');
}

workControls.querySelector('[data-work-total]').textContent = String(workCards.length).padStart(2, '0');
workControls.hidden = false;
workGallery.classList.add('is-pinned');
workPrevious.addEventListener('click', () => stepWork(-1));
workNext.addEventListener('click', () => stepWork(1));
workRail.addEventListener('keydown', event => {
  if (event.target !== workRail || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  stepWork(event.key === 'ArrowRight' ? 1 : -1);
});
menu.addEventListener('click', event => {
  const link = event.target.closest('a[data-project-link]');
  if (!link || !workTravel || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const index = workCards.findIndex(card => card.dataset.project === link.dataset.projectLink);
  if (index < 0) return;
  event.preventDefault();
  workRail.focus({ preventScroll: true });
  goToWorkOffset(workStops[index], reducedMotion.matches ? 'instant' : 'smooth');
});
window.addEventListener('scroll', queueWorkRender, { passive: true });
window.addEventListener('resize', measureWorkGallery);
reducedMotion.addEventListener('change', measureWorkGallery);
document.fonts.ready.then(measureWorkGallery);
measureWorkGallery();

const directions = [
  ['Мебель', 'furniture', 'Кухни, гардеробные и встроенные системы хранения по индивидуальным чертежам.', 'Фото проекта ЖК «Капитал Тауэрс»'],
  ['Остекление', 'glazing', 'Окна, порталы, зимние сады и входные группы из дерева, дерево-алюминия и алюминия.', 'По материалам презентации · визуализация'],
  ['Двери и стеновые панели', 'doors', 'Межкомнатные двери и стеновые панели в общей плоскости и единой отделке.', 'Фото проекта ЖК «Река»'],
  ['Мягкая мебель', 'upholstery', 'Диваны, кресла, кровати и пуфы. Форма, габариты и обивка под ваш проект.', 'Мягкая мебель · визуализация'],
  ['Паркетная доска', 'parquet', 'Натуральная древесина. Подбираем оттенок, сортировку и рисунок укладки.', 'Паркетная доска · визуализация'],
  ['Перегородки и ограждения', 'partitions', 'Стационарные и раздвижные перегородки, стеклянные ограждения. Подбираем профиль и стекло под задачу.', 'По фото проекта ЖК «Вишнёвый сад»'],
];
const productPhotos = {
  furniture: ['media/capital-walnut-cabinet.webp', 'Встроенный шкаф из орехового шпона со стеклянными фасадами в ЖК «Капитал Тауэрс»', ['50% 78%']],
  doors: ['media/reka-oak-door.webp', 'Скрытая дверь в стеновых панелях из дубового шпона', ['50% 68%']],
};
const productTabs = document.querySelector('.product-tabs');
const productButtons = [...productTabs.querySelectorAll('button')];
const productPanel = document.querySelector('.product-panel');
const productTitle = document.querySelector('[data-product-title]');
const productDescription = document.querySelector('[data-product-description]');
const productCredit = document.querySelector('[data-product-credit]');
const swapProduct = imageSwitcher(document.querySelector('.product-image'));

function selectProduct(index) {
  const item = (index + directions.length) % directions.length;
  const [title, id, description, credit] = directions[item];
  for (const [i, button] of productButtons.entries()) {
    button.setAttribute('aria-selected', String(i === item));
    button.tabIndex = i === item ? 0 : -1;
  }
  productPanel.setAttribute('aria-labelledby', productButtons[item].id);
  productTitle.textContent = title;
  productDescription.textContent = description;
  const [photo, alt, crops] = productPhotos[id] ?? ['/lignum-preview/assets/product-' + id + '.webp', title];
  swapProduct(photo, alt, crops, () => {
    productCredit.textContent = credit;
  });
  return item;
}

productTabs.hidden = false;
menu.addEventListener('click', event => {
  const link = event.target.closest('a[data-product-tab]');
  if (link) selectProduct(Number(link.dataset.productTab));
});
for (const [i, button] of productButtons.entries()) {
  button.addEventListener('click', () => selectProduct(i));
  button.addEventListener('keydown', event => {
    const targets = { ArrowUp: i - 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowRight: i + 1, Home: 0, End: productButtons.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    productButtons[selectProduct(targets[event.key])].focus();
  });
}

const scenes = [
  ['entry', 'Визуализация входа в шоурум с травертином и деревом', ['48% 50%', '46% 50%']],
  ['materials', 'Визуализация зоны с образцами дерева, стекла и камня', ['56% 50%', '57% 50%']],
  ['meeting', 'Визуализация зоны встреч с дубовым столом', ['52% 50%', '53% 50%']],
];
const showroomControls = document.querySelector('.showroom-controls');
const sceneButtons = [...showroomControls.querySelectorAll('button')];
const swapScene = imageSwitcher(document.querySelector('.showroom-image'));
showroomControls.hidden = false;
for (const [i, button] of sceneButtons.entries()) {
  button.addEventListener('click', () => {
    const [file, alt, crops] = scenes[i];
    swapScene('media/showroom-' + file + '-large.webp', alt, crops, () => {
      for (const [j, option] of sceneButtons.entries()) option.setAttribute('aria-pressed', String(i === j));
    });
  });
}
document.querySelector('.materials-visit').addEventListener('click', () => {
  showroomControls.querySelector('[data-scene="1"]').click();
});

const comparisonInput = document.querySelector('.comparison-input');
const comparisonImage = document.querySelector('.comparison-image');
comparisonInput.hidden = false;
comparisonInput.addEventListener('input', () => {
  comparisonImage.style.setProperty('--reveal', comparisonInput.value + '%');
  comparisonInput.setAttribute('aria-valuetext', 'Эскиз ' + comparisonInput.value + ' процентов');
});


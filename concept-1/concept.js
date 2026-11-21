const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('pending');
      observer.unobserve(entry.target);
    }
  }, {threshold: .08});
  for (const element of document.querySelectorAll('.reveal, .reveal-image')) {
    if (element.getBoundingClientRect().top < innerHeight) continue;
    element.classList.add('pending');
    observer.observe(element);
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      for (const element of document.querySelectorAll('.pending')) element.classList.remove('pending');
    }
  });
}

const directions = [
  ['Мебель', 'furniture', 'Ореховый шпон и стекло в ЖК «Капитал Тауэрс»', 'Кухни, гардеробные и встроенные системы хранения по индивидуальным чертежам.', 'По фото проекта ЖК «Капитал Тауэрс»'],
  ['Остекление', 'glazing', 'Остекление зимнего сада', 'Окна, порталы, зимние сады и входные группы из дерева, дерево-алюминия и алюминия.', 'По материалам презентации · визуализация'],
  ['Двери и панели', 'doors', 'Скрытая дверь и деревянные стеновые панели', 'Межкомнатные двери и стеновые панели в общей плоскости и единой отделке.', 'По фото проекта ЖК «Река»'],
  ['Мягкая мебель', 'upholstery', 'Мягкая мебель в нейтральном интерьере', 'Диваны, кресла, кровати и пуфы. Форма, габариты и обивка под проект.', 'Мягкая мебель · визуализация'],
  ['Паркетная доска', 'parquet', 'Натуральная паркетная доска', 'Натуральная древесина. Подбираем оттенок, сортировку и рисунок укладки.', 'Паркетная доска · визуализация'],
  ['Перегородки', 'partitions', 'Стеклянные перегородки в ЖК «Вишнёвый сад»', 'Стационарные и раздвижные перегородки, стеклянные ограждения. Профиль и стекло под задачу.', 'По фото проекта ЖК «Вишнёвый сад»']
];
const tabs = [...document.querySelectorAll('[role="tab"]')];
const directionTitle = document.querySelector('#product-title');
const directionDescription = document.querySelector('#product-description');
const directionCredit = document.querySelector('#product-credit');
const directionPanel = document.querySelector('#product-panel');
const swapDirectionPhoto = imageSwitcher(document.querySelector('.product-photo'), {
  duration: 530,
  keyframes: [{ opacity: 0, transform: 'scale(1.035)' }, { opacity: 1, transform: 'scale(1)' }],
});

function selectDirection(index) {
  const selected = (index + directions.length) % directions.length;
  const [title, id, alt, description, credit] = directions[selected];
  swapDirectionPhoto('/lignum-preview/assets/product-' + id + '.webp', alt, undefined, () => {
    directionTitle.textContent = title;
    directionDescription.textContent = description;
    directionCredit.textContent = credit;
    directionPanel.setAttribute('aria-labelledby', tabs[selected].id);
    for (const [i, tab] of tabs.entries()) {
      tab.setAttribute('aria-selected', String(i === selected));
      tab.tabIndex = i === selected ? 0 : -1;
    }
  });
  return selected;
}
document.querySelector('.product-tabs').hidden = false;
document.addEventListener('click', event => {
  const link = event.target.closest('a[data-product-tab]');
  if (link) selectDirection(Number(link.dataset.productTab));
});
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectDirection(index));
  tab.addEventListener('keydown', event => {
    const keys = {ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1};
    if (!(event.key in keys)) return;
    event.preventDefault();
    tabs[selectDirection(keys[event.key])].focus();
  });
}

const photo = document.querySelector('.hero-photo');
const heroSlides = [...photo.querySelectorAll('.hero-slide')];
const picture = heroSlides[0];
const slideButton = document.querySelector('.film');
const siteMenu = document.querySelector('#site-menu');
let activeHeroSlide = 0;
let slideTimer;
let slidePaused = false;
let heroVisible = true;

function advanceHeroSlide() {
  const next = (activeHeroSlide + 1) % heroSlides.length;
  const nextSlide = heroSlides[next];
  if (!nextSlide.complete || !nextSlide.naturalWidth) return;

  const currentSlide = heroSlides[activeHeroSlide];
  currentSlide.classList.remove('active');
  currentSlide.setAttribute('aria-hidden', 'true');
  for (const slide of heroSlides) {
    slide.classList.toggle('zooming', slide === currentSlide || slide === nextSlide);
  }
  nextSlide.classList.add('active');
  nextSlide.removeAttribute('aria-hidden');
  activeHeroSlide = next;
}

function syncHeroSlides() {
  clearInterval(slideTimer);
  slideButton.hidden = reducedMotion.matches;
  const canPlay = !slidePaused && !reducedMotion.matches && !document.hidden && heroVisible && !siteMenu.open && !document.body.classList.contains('intro-playing');
  photo.classList.toggle('playing', canPlay);
  if (!canPlay) return;
  heroSlides[activeHeroSlide].classList.add('zooming');
  slideTimer = setInterval(advanceHeroSlide, 4200);
}

slideButton.addEventListener('click', () => {
  slidePaused = !slidePaused;
  slideButton.setAttribute('aria-label', slidePaused ? 'Продолжить смену фотографий' : 'Приостановить смену фотографий');
  slideButton.innerHTML = slidePaused ? 'Продолжить <span aria-hidden="true">▷</span>' : 'Пауза <span aria-hidden="true">Ⅱ</span>';
  syncHeroSlides();
});
document.addEventListener('visibilitychange', syncHeroSlides);
siteMenu.addEventListener('toggle', syncHeroSlides);
reducedMotion.addEventListener('change', syncHeroSlides);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    syncHeroSlides();
  }, {threshold: .15});
  observer.observe(photo.closest('.hero'));
}

async function playIntro() {
  let seen = false;
  try { seen = sessionStorage.getItem('lignum-concept-2-intro') === 'seen'; } catch {}
  const canPlay = () => !reducedMotion.matches && !location.hash && scrollY <= 30;
  if (seen || !canPlay() || !picture.decode || !photo.animate) return;

  const ready = await Promise.race([
    picture.decode().then(() => true, () => false),
    new Promise(resolve => setTimeout(resolve, 550, false))
  ]);
  if (!ready || !canPlay()) return;

  let animation;
  try {
    animation = photo.animate([
      {clipPath: 'inset(37% 39%)', opacity: 0},
      {clipPath: 'inset(37% 39%)', opacity: 1, offset: .24},
      {clipPath: 'inset(0% 0%)', opacity: 1}
    ], {duration: 2400, easing: 'cubic-bezier(.65,0,.2,1)'});
    document.body.classList.add('intro-playing');
    await Promise.race([animation.finished, new Promise(resolve => setTimeout(resolve, 2700))]);
  } finally {
    animation?.cancel();
    document.body.classList.remove('intro-playing');
    try {sessionStorage.setItem('lignum-concept-2-intro', 'seen');} catch {}
  }
}
playIntro().catch(() => {}).finally(syncHeroSlides);

const tour = document.querySelector('.showroom-tour');
const tourFrames = [...tour.querySelectorAll('.tour-frame')];
const tourSteps = [...tour.querySelectorAll('[data-tour-step]')];
const tourProgress = tour.querySelector('.tour-progress span');
const tourTitle = tour.querySelector('#tour-title');
const tourDescription = tour.querySelector('#tour-description');
const tourScenes = [
  ['Знакомство.', 'Дерево, камень и стекло. Первое впечатление от пространства.'],
  ['Материалы.', 'Фактуры и оттенки, которые можно увидеть рядом и сравнить.'],
  ['Диалог.', 'Место, где образцы и чертежи складываются в решения для проекта.']
];
let tourFrameRequested = false;
let activeTourScene = 0;

function updateTour() {
  tourFrameRequested = false;
  const viewport = tour.querySelector('.tour-viewport');
  const distance = Math.max(1, tour.offsetHeight - viewport.offsetHeight);
  const progress = reducedMotion.matches ? 0 : Math.max(0, Math.min(1, -tour.getBoundingClientRect().top / distance));
  const position = progress * (tourFrames.length - 1);
  for (const [index, image] of tourFrames.entries()) {
    const entering = Math.max(0, Math.min(1, position - index + 1));
    const reveal = entering * entering * (3 - 2 * entering);
    const leaving = Math.max(0, Math.min(1, position - index));
    const inset = image.complete && image.naturalWidth > 0 ? (1 - reveal) * 50 : 50;
    image.style.clipPath = `inset(${inset}%)`;
    image.style.transform = `scale(${1.18 - reveal * .18 + leaving * .12})`;
    const focus = [12, 50, 82][index] + (progress - index / 2) * 10;
    image.style.objectPosition = `${focus}% center`;
  }
  tourProgress.style.transform = `scaleX(${progress})`;
  const scene = Math.round(position);
  if (scene === activeTourScene) return;
  activeTourScene = scene;
  tourTitle.textContent = tourScenes[scene][0];
  tourDescription.textContent = tourScenes[scene][1];
  for (const [index, step] of tourSteps.entries()) {
    if (index === scene) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  }
}

function requestTourUpdate() {
  if (tourFrameRequested) return;
  tourFrameRequested = true;
  requestAnimationFrame(updateTour);
}

for (const [index, step] of tourSteps.entries()) {
  step.addEventListener('click', () => {
    const viewport = tour.querySelector('.tour-viewport');
    const distance = tour.offsetHeight - viewport.offsetHeight;
    const top = scrollY + tour.getBoundingClientRect().top + distance * index / (tourSteps.length - 1);
    window.scrollTo({top, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  });
}
window.addEventListener('scroll', requestTourUpdate, {passive: true});
window.addEventListener('resize', requestTourUpdate);
for (const image of tourFrames) image.addEventListener('load', requestTourUpdate);
reducedMotion.addEventListener('change', () => {
  for (const image of tourFrames) {
    image.style.removeProperty('clip-path');
    image.style.removeProperty('transform');
    image.style.removeProperty('object-position');
  }
  requestTourUpdate();
});
if ('IntersectionObserver' in window) {
  const preloadTour = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    for (const image of tourFrames) image.loading = 'eager';
    preloadTour.disconnect();
  }, {rootMargin: '1200px'});
  preloadTour.observe(tour);
}
requestTourUpdate();

const designStory = document.querySelector('.design-story');
const designStage = designStory.querySelector('.design-stage');
const designPhoto = designStory.querySelector('.design-photo');
const designScan = designStory.querySelector('.design-scan');
let designFrameRequested = false;

function updateDesignStory() {
  designFrameRequested = false;
  const distance = Math.max(1, designStory.offsetHeight - designStage.offsetHeight);
  const progress = Math.max(0, Math.min(1, -designStory.getBoundingClientRect().top / distance));
  const reveal = reducedMotion.matches ? 1 : Math.max(0, Math.min(1, (progress - .12) / .76));
  const percentage = reveal * 100;
  designPhoto.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
  designScan.style.left = `${percentage}%`;
  designScan.style.opacity = reveal > 0 && reveal < 1 ? '1' : '0';
}

function requestDesignUpdate() {
  if (designFrameRequested) return;
  designFrameRequested = true;
  requestAnimationFrame(updateDesignStory);
}

window.addEventListener('scroll', requestDesignUpdate, {passive: true});
window.addEventListener('resize', requestDesignUpdate);
reducedMotion.addEventListener('change', requestDesignUpdate);
requestDesignUpdate();

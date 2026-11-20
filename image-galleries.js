function imageSwitcher(frame, { duration = 690, keyframes = [
  { clipPath: 'inset(0 0 0 100%)', transform: 'scale(1.045)' },
  { clipPath: 'inset(0 0 0 0)', transform: 'scale(1)' }
] } = {}) {
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let current = frame.querySelector('img');
  let previous;
  let animation;
  let request = 0;

  return async (src, alt, crops, onShow) => {
    const version = ++request;
    const incoming = new Image();
    incoming.decoding = 'async';
    incoming.alt = alt;
    incoming.src = src;
    if (crops) {
      const [wide, narrow] = crops;
      incoming.style.setProperty('--crop', wide);
      if (narrow) incoming.style.setProperty('--crop-small', narrow);
    }
    try {
      await incoming.decode();
    } catch {
      return;
    }
    if (version !== request) return;

    animation?.cancel();
    previous?.remove();
    const outgoing = current;
    previous = outgoing;
    outgoing.setAttribute('aria-hidden', 'true');
    frame.append(incoming);
    current = incoming;
    onShow();

    if (motionPreference.matches) {
      outgoing.remove();
      return;
    }
    animation = incoming.animate(keyframes, { duration, easing: 'cubic-bezier(.22,.72,.22,1)' });
    animation.finished.catch(() => {}).finally(() => outgoing.remove());
  };
}

const materialExamples = [
  {
    photo: '/lignum-preview/concept-2/media/materials-reka.webp',
    alt: 'Крупный план стыка дубовой панели, тёмного профиля и рифлёного стекла',
    project: 'ЖК «Река»',
    caption: 'Рядом с гладкими дубовыми панелями рифлёное стекло рассеивает свет и скрывает детали за перегородкой.',
  },
  {
    photo: '/lignum-preview/concept-2/media/materials-capital.webp',
    alt: 'Крупный план каменной столешницы у фасада из орехового шпона и рифлёной эмали',
    project: 'ЖК «Капитал Тауэрс»',
    caption: 'Ореховый шпон обрамляет светлые фасады в эмали, а рисунок камня объединяет фартук и столешницу.',
    crops: ['50% 50%', '64% 50%'],
  },
  {
    photo: '/lignum-preview/concept-2/media/materials-vishnevy.webp',
    alt: 'Крупный план прозрачного стекла и тёмного профиля с деревянными полками за перегородкой',
    project: 'ЖК «Вишнёвый сад»',
    caption: 'Тёмный профиль подчёркивает геометрию перегородки. Через прозрачное стекло видны полки гардеробной.',
  },
];
const materialOptions = document.querySelector('.materials-options');
const materialButtons = [...materialOptions.querySelectorAll('button')];
const materialProject = document.querySelector('[data-material-project]');
const materialCaption = document.querySelector('[data-material-caption]');
const swapMaterial = imageSwitcher(document.querySelector('.materials-image'));
materialOptions.hidden = false;
for (const [index, button] of materialButtons.entries()) {
  button.addEventListener('click', () => {
    const { photo, alt, crops, project, caption } = materialExamples[index];
    swapMaterial(photo, alt, crops, () => {
      for (const option of materialButtons) option.setAttribute('aria-pressed', String(option === button));
      materialProject.textContent = project;
      materialCaption.textContent = caption;
    });
  });
}

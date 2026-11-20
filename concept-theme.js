(() => {
  const root = document.documentElement;
  const storageKey = 'lignum-theme';
  try {
    root.dataset.theme = localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light';
  } catch {
    root.dataset.theme = 'light';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.concept-theme-toggle');
    if (!toggle) return;

    function setTheme(dark) {
      root.dataset.theme = dark ? 'dark' : 'light';
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.title = dark ? 'Включить светлую тему' : 'Включить тёмную тему';
    }

    setTheme(root.dataset.theme === 'dark');
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      setTheme(root.dataset.theme !== 'dark');
      try {
        localStorage.setItem(storageKey, root.dataset.theme);
      } catch {
        // The theme still applies when storage is disabled.
      }
    });

    window.addEventListener('storage', event => {
      if (event.key === storageKey) setTheme(event.newValue === 'dark');
    });
  });
})();

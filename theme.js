// Apply the saved preference before painting to avoid a flash of the wrong theme.
(() => {
  let preference;
  try { preference = localStorage.getItem('bitor-theme'); } catch (_) { /* Storage is optional. */ }
  const dark = preference === 'dark' || (preference !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();

(function () {
  'use strict';

  var THEME_KEY = 'alseraj-theme';
  var LANGUAGE_KEY = 'alseraj-language';
  var DEFAULT_LANGUAGE = 'en';
  var supportedLanguages = ['ar', 'en'];

  function readStorage(key) {
    try { return window.localStorage.getItem(key); } catch (error) { return null; }
  }

  function writeStorage(key, value) {
    try { window.localStorage.setItem(key, value); } catch (error) { /* graceful degradation */ }
  }

  function pageLanguage() {
    return document.documentElement.lang === 'en' ? 'en' : 'ar';
  }

  function resolveLanguage(code) {
    var normalized = String(code || '').trim().toLowerCase();
    if (normalized === 'ar' || normalized.indexOf('ar-') === 0) return 'ar';
    if (normalized === 'en' || normalized.indexOf('en-') === 0) return 'en';
    return null;
  }

  function browserLanguage() {
    var candidates = [];
    if (Array.isArray(navigator.languages)) candidates = navigator.languages.slice();
    if (navigator.language) candidates.push(navigator.language);
    for (var i = 0; i < candidates.length; i += 1) {
      var resolved = resolveLanguage(candidates[i]);
      if (resolved) return resolved;
    }
    return DEFAULT_LANGUAGE;
  }

  function currentTheme() {
    var saved = readStorage(THEME_KEY);
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  }

  function systemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    var resolved = theme === 'system' ? systemTheme() : theme;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = theme;
    document.documentElement.style.colorScheme = resolved;
  }

  // Apply the theme before body paint to reduce a visible flash.
  applyTheme(currentTheme());

  var KNOWN_LANGUAGE_FILES = ['about.html', 'article-fire-safety.html', 'article-gmp-standards.html', 'article-turnkey-projects.html', 'articles.html', 'capabilities.html', 'contact.html', 'index.html', 'industries.html', 'pharmaceutical-manufacturing.html', 'privacy-policy.html', 'projects.html', 'service-consulting.html', 'service-engineering-design.html', 'service-maintenance.html', 'service-pharma-setup.html', 'service-safety-systems.html', 'service-training.html', 'services.html', 'solution-cleanrooms.html', 'solution-electrical-engineering.html', 'solution-engineering-consultancy.html', 'solution-hvac-systems.html', 'solution-industrial-automation.html', 'solution-industrial-equipment.html', 'solution-pharmaceutical-facilities.html', 'solution-turnkey-industrial-projects.html', 'solutions.html'];

  function currentRouteFile() {
    var path = window.location.pathname;
    var marker = '/al-seraj/';
    var markerIndex = path.indexOf(marker);
    var relative = markerIndex >= 0 ? path.slice(markerIndex + marker.length) : '';
    var isEnglish = relative.indexOf('en/') === 0;
    var file = isEnglish ? relative.slice(3) : relative;
    return { marker: marker, file: file || 'index.html' };
  }

  function correspondingLanguagePath(target) {
    var current = currentRouteFile();
    if (KNOWN_LANGUAGE_FILES.indexOf(current.file) === -1) return null;
    return current.marker + (target === 'en' ? 'en/' : '') + current.file;
  }

  function targetLanguageURL(target) {
    var path = correspondingLanguagePath(target);
    if (!path) return null;
    var url = new URL(path, window.location.href);
    url.search = window.location.search;
    url.hash = '';
    return url;
  }

  function validHash(hash) {
    return hash && /^#[A-Za-z][A-Za-z0-9:_-]*$/.test(hash) ? hash : '';
  }

  function navigateToLanguage(target) {
    var url = targetLanguageURL(target);
    if (!url) return;
    var hash = validHash(window.location.hash);
    if (!hash || !window.fetch || !window.DOMParser) {
      window.location.replace(url.href);
      return;
    }
    window.fetch(url.pathname, { credentials: 'same-origin' }).then(function (response) {
      if (!response.ok) throw new Error('Equivalent language page unavailable');
      return response.text();
    }).then(function (markup) {
      var targetDocument = new DOMParser().parseFromString(markup, 'text/html');
      if (targetDocument.getElementById(hash.slice(1))) url.hash = hash;
      window.location.replace(url.href);
    }).catch(function () {
      window.location.replace(url.href);
    });
  }

  function maybeDetectLanguage() {
    // Auto-selection is limited to the site root so explicit deep links remain authoritative.
    if (window.location.pathname !== '/al-seraj/') return;
    var saved = resolveLanguage(readStorage(LANGUAGE_KEY));
    var selected = saved || browserLanguage();
    if (selected === pageLanguage()) return;
    navigateToLanguage(selected);
  }

  // Detection happens only before a saved preference exists, so manual choice wins.
  maybeDetectLanguage();

  function labelForTheme(theme, language) {
    var labels = language === 'en' ? { light: 'Light', dark: 'Dark', system: 'System' } : { light: 'الوضع الفاتح', dark: 'الوضع الداكن', system: 'النظام' };
    return labels[theme];
  }

  function updateThemeControl(button, theme) {
    var language = pageLanguage();
    button.textContent = labelForTheme(theme, language);
    button.setAttribute('aria-label', language === 'en' ? 'Theme: ' + labelForTheme(theme, language) : 'المظهر: ' + labelForTheme(theme, language));
    button.setAttribute('aria-pressed', theme !== 'system' ? 'true' : 'false');
    button.dataset.themePreference = theme;
  }

  function mountThemeControl() {
    var nav = document.querySelector('nav');
    if (!nav || document.querySelector('[data-theme-control]')) return;
    var language = pageLanguage();
    var button = document.createElement('button');
    button.type = 'button';
    button.className = nav.classList.contains('content-nav') ? 'theme-control content-theme-control' : 'theme-control';
    button.setAttribute('data-theme-control', 'true');
    button.setAttribute('aria-live', 'polite');
    var theme = currentTheme();
    updateThemeControl(button, theme);
    button.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : currentTheme() === 'dark' ? 'system' : 'light';
      writeStorage(THEME_KEY, next);
      applyTheme(next);
      updateThemeControl(button, next);
    });
    var languageLink = Array.prototype.find.call(nav.querySelectorAll('a'), function (a) { return /English|العربية/.test(a.textContent); });
    if (languageLink && languageLink.parentElement && languageLink.parentElement.parentElement === nav.querySelector('ul')) {
      var li = document.createElement('li');
      li.appendChild(button);
      languageLink.parentElement.parentElement.insertBefore(li, languageLink.parentElement);
    } else {
      nav.appendChild(button);
    }
  }

  function mountLanguagePersistence() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var languageLink = Array.prototype.find.call(nav.querySelectorAll('a'), function (a) { return /English|العربية/.test(a.textContent); });
    if (!languageLink || languageLink.dataset.languageBound) return;
    languageLink.dataset.languageBound = 'true';
    languageLink.addEventListener('click', function (event) {
      event.preventDefault();
      var nextLanguage = languageLink.textContent.trim() === 'English' ? 'en' : 'ar';
      writeStorage(LANGUAGE_KEY, nextLanguage);
      navigateToLanguage(nextLanguage);
    });
  }

  function bindSystemTheme() {
    var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (!media) return;
    var listener = function () { if (currentTheme() === 'system') applyTheme('system'); };
    if (media.addEventListener) media.addEventListener('change', listener);
    else if (media.addListener) media.addListener(listener);
  }

  document.addEventListener('DOMContentLoaded', function () {
    mountThemeControl();
    mountLanguagePersistence();
    bindSystemTheme();
  });
}());

(function () {
  'use strict';
  var root = document.documentElement;
  root.dataset.developmentMode = 'true';
  document.querySelectorAll('[data-development-section="true"]').forEach(function (section) {
    section.dataset.populationStatus = 'DEMO_PLACEHOLDER';
  });
})();

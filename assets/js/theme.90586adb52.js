/* Runs before first paint (loaded without defer): applies the saved or preferred theme
   so the page never flashes the wrong colours. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var saved = null;
  try { saved = window.localStorage.getItem('as-theme'); } catch (e) { /* storage blocked */ }
  var dark = saved ? saved === 'dark' : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
}());

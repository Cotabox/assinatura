var CotaboxAccordion = (function () {
  function setActive(item, active) {
    item.classList.toggle('is-active', active);
    item.querySelector('.accordion__header').setAttribute('aria-expanded', active ? 'true' : 'false');
  }

  function init(root) {
    var items = Array.prototype.slice.call(root.querySelectorAll('.accordion__item'));
    items.forEach(function (item) {
      item.querySelector('.accordion__header').addEventListener('click', function () {
        var shouldOpen = !item.classList.contains('is-active');
        items.forEach(function (other) {
          setActive(other, false);
        });
        if (shouldOpen) setActive(item, true);
      });
    });
  }

  return { init: init };
}());

if (typeof module !== 'undefined') module.exports = CotaboxAccordion;

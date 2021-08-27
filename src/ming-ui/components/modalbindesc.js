if (!window.escbind) {
  window.escbind = true;
  window.closeindex = 0;
  window.closeFns = {};
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const activeElement = document.activeElement;
      const activeElementTagName = activeElement && activeElement.tagName && activeElement.tagName.toLowerCase();
      if (
        (activeElementTagName === 'input' || activeElementTagName === 'textarea') &&
        activeElement.getAttribute('class').indexOf('escclose') > -1
      ) {
        activeElement.blur();
      } else {
        const fnitem = _.max(window.closeFns, 'index');
        if (fnitem && typeof fnitem.fn === 'function') {
          fnitem.fn(e);
          if (Object.keys(window.closeFns).length === 0) {
            window.closeindex = 0;
          }
        }
      }
    }
  });
}

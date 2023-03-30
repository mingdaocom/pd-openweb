import _ from 'lodash';

if (!window.escbind) {
  window.escbind = true;
  window.closeindex = 0;
  window.closeFns = {};
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      // 弹窗内存在正在编辑单元格时不触发esc关闭弹窗
      if (e.target.classList.contains('stopPropagation')) {
        return;
      }
      const activeElement = document.activeElement;
      const activeElementTagName = activeElement && activeElement.tagName && activeElement.tagName.toLowerCase();
      if (
        (activeElementTagName === 'input' || activeElementTagName === 'textarea') &&
        activeElement &&
        (activeElement.getAttribute('class') || '').indexOf('escclose') > -1
      ) {
        activeElement.blur();
      } else {
        const fnitem = _.maxBy(
          Object.keys(window.closeFns).map(k => window.closeFns[k]),
          'index',
        );
        if (
          fnitem &&
          /(workSheetNewRecord|workSheetRecordInfo|fillRecordControls)/.test(fnitem.className) &&
          window.hasEditingCell
        ) {
          return;
        }
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

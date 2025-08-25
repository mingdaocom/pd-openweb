import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';

export default function RecordPortal({ children, closeEdit = _.noop }) {
  let $el = document.createElement('div');
  $el.className = 'editingRecordItemWrap';
  useEffect(() => {
    document.body.appendChild($el);
    const clickHandler = e => {
      e.stopPropagation();
      if (e.target.className === 'editingRecordItemWrap') {
        $el.parentElement && $el.parentElement.removeChild($el);
        closeEdit();
      }
    };
    $el.addEventListener('click', clickHandler);
    return () => {
      $el.parentElement && $el.parentElement.removeChild($el);
      closeEdit();
      $el.removeEventListener('click', clickHandler);
    };
  });
  return createPortal(children, $el);
}

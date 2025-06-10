import React from 'react';
import cx from 'classnames';

function click(func) {
  return e => {
    e.stopPropagation();
    func();
  };
}

export default function RecordTag(props) {
  const { disabled, title, onClick, onDelete, enumDefault } = props;

  return (
    <div
      className={cx('customFormCapsule', { capsuleLink: !!onClick })}
      onClick={e => {
        e.stopPropagation();
        onClick && onClick();
      }}
    >
      {title}
      {!disabled && enumDefault === 2 && <i className="icon-minus-square capsuleDel" onClick={click(onDelete)}></i>}
    </div>
  );
}

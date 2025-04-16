import React from 'react';

function click(func) {
  return e => {
    e.stopPropagation();
    func();
  };
}

export default function RecordTag(props) {
  const { disabled, title, onClick, onDelete, enumDefault } = props;

  return (
    <div className="customFormCapsule" onClick={onClick}>
      {title}
      {!disabled && enumDefault === 2 && <i className="icon-minus-square capsuleDel" onClick={click(onDelete)}></i>}
    </div>
  );
}

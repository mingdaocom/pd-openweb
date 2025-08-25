import React from 'react';
import './css/result.less';

export default function (props) {
  const { id, avatar, name, deleteFn } = props;
  return (
    <div className="GSelect-result-subItem" key={`subItem-${id}`}>
      {avatar}
      <div className="GSelect-result-subItem__name overflow_ellipsis">{name}</div>
      <div className="GSelect-result-subItem__remove" onClick={() => deleteFn(id)}>
        <span className="icon-delete"></span>
      </div>
    </div>
  );
}

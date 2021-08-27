import './css/result.less';
import React from 'react';

export default function (props) {
  const { id, avatar, name, deleteFn } = props;
  return (
    <div className="GSelect-result-subItem" key={`subItem-${id}`}>
      {avatar}
      <div className="GSelect-result-subItem__name overflow_ellipsis">{name}</div>
      <div className="GSelect-result-subItem__remove icon-minus" onClick={() => deleteFn(id)} />
    </div>
  );
}

import React from 'react';
import { CONTROLS_NAME } from '../../../enum';

export default ({ controls }) => {
  return (
    <div className="mTop15 webhookBox">
      <div className="webhookHeader flexRow">
        <div className="bold w140 ellipsis">{_l('参数名')}</div>
        <div className="bold mLeft15 w70 ellipsis">{_l('类型')}</div>
        <div className="bold mLeft15 flex ellipsis">{_l('参考值')}</div>
      </div>
      <ul className="webhookList">
        {(controls || []).map((item, i) => {
          return (
            <li className="flexRow" key={i}>
              <div className="w140">{item.controlId}</div>
              <div className="mLeft15 w70 ellipsis">{CONTROLS_NAME[item.type]}</div>
              <div className="mLeft15 flex" style={{ minWidth: 0 }}>
                {item.value}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

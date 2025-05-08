import React from 'react';
import { Checkbox } from 'ming-ui';
import { getControlTypeName } from '../../../utils';

export default ({ data, controls, showRequired, updateSource, hideControlType }) => {
  return (
    <div className="mTop15 webhookBox">
      <div className="webhookHeader flexRow">
        <div className="bold w180 ellipsis">{_l('参数名')}</div>
        {!hideControlType && <div className="bold mLeft15 w70 ellipsis">{_l('类型')}</div>}
        <div className="bold mLeft15 flex ellipsis">{_l('参考值')}</div>
        {showRequired && <div className="bold mLeft15 ellipsis">{_l('必填')}</div>}
      </div>
      <ul className="webhookList">
        {(controls || []).map((item, i) => {
          return (
            <li className="flexRow" key={i}>
              <div className="w180">{item.controlName}</div>
              {!hideControlType && <div className="mLeft15 w70 ellipsis">{getControlTypeName(item)}</div>}
              <div className="mLeft15 flex" style={{ minWidth: 0 }}>
                {item.value}
              </div>
              {showRequired && (
                <div className="mLeft15">
                  <Checkbox
                    checked={item.required}
                    onClick={checked => {
                      const newControls = [].concat(data);

                      newControls.forEach(o => {
                        if (o.controlId === item.controlId) {
                          o.required = !checked;
                        }
                      });

                      updateSource({ controls: newControls });
                    }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

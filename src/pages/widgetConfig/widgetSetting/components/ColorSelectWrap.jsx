import React, { Fragment, useEffect, useState } from 'react';
import { Icon } from 'ming-ui';
import { SCORE_COLORS_LIST } from '../../config/score';
import cx from 'classnames';
import { SelectColorWrap } from './SectionConfig/style';

export default function ColorSelectWrap({ color: activeColor, handleChange }) {
  const [customColor, setCustomColor] = useState([]);
  const [addColor, setAddColor] = useState('');
  const customMax = 9;

  useEffect(() => {
    setCustomColor(JSON.parse(window.localStorage.getItem('customColor') || '[]'));
  }, []);

  const getColorList = customIcon => {
    const list = customIcon ? customColor : SCORE_COLORS_LIST;
    return (
      <ul>
        {customIcon && (
          <li className={cx({ addActive: addColor })}>
            <div className="colorItem">
              {addColor ? (
                <div className="colorItemAdd" style={{ backgroundColor: addColor }} />
              ) : (
                <Icon icon="task-add-member-circle" className="Font24 Gray_bd" />
              )}
              <input
                type="color"
                value="#333333"
                onChange={event => {
                  setAddColor(event.target.value);
                }}
                onBlur={() => {
                  if (addColor) {
                    let newCustomColor = [].concat([addColor]).concat(customColor);
                    newCustomColor = newCustomColor.slice(0, customMax);
                    setCustomColor(newCustomColor);
                    setAddColor('');
                    safeLocalStorageSetItem('customColor', JSON.stringify(newCustomColor));
                  }
                }}
              />
            </div>
          </li>
        )}
        {list.map((item, index) => (
          <li
            className={cx({ active: activeColor === item })}
            key={index}
            style={{ color: item }}
            onClick={() => handleChange(item)}
          >
            <Icon className="colorItemCheck" icon="done" />
            <div className="colorItem" style={{ backgroundColor: item }} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <SelectColorWrap>
      {getColorList()}
      <div className="Gray_9e mTop10">{_l('自定义')}</div>
      {getColorList(true)}
    </SelectColorWrap>
  );
}

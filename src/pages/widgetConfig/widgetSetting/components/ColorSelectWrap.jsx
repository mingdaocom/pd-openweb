import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { SCORE_COLORS_LIST } from '../../config/score';
import cx from 'classnames';

const SelectColorWrap = styled.div`
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  position: relative;
  box-sizing: border-box;
  width: 350px;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #fff;
  ul {
    display: flex;
    flex-wrap: wrap;
  }
  li {
    box-sizing: border-box;
    width: 10%;
    padding: 5px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    .colorItem {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      position: relative;
    }
    .colorItemCheck {
      display: none;
    }
    &.active {
      .colorItemCheck {
        display: block;
        color: #fff;
        position: absolute;
        border-radius: 50%;
        z-index: 1;
      }
    }
    &.addActive {
      .colorItem {
        border: 1px solid #bdbdbd;
        padding: 2px;
        box-sizing: border-box;
      }
      .colorItemAdd {
        height: 100%;
        border-radius: 50%;
        margin-left: -0.5px;
      }
    }
    input {
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: 50%;
      z-index: 1;
      position: absolute;
      opacity: 0;
      cursor: pointer;
      top: 0;
      left: 0;
    }
  }
`;

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
                    window.localStorage.setItem('customColor', JSON.stringify(newCustomColor));
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

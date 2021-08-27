import React, { Component } from 'react';
import { string, func, arrayOf } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import { OPTION_COLORS_LIST } from '../../../config';

const SelectColorWrap = styled.div`
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  position: relative;
  box-sizing: border-box;
  max-width: 350px;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #fff;
  &::before {
    content: '';
    position: absolute;
    top: -16px;
    left: 46px;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-bottom-color: #fff;
    z-index: 1;
  }
  &::after {
    content: '';
    position: absolute;
    top: -19px;
    left: 45px;
    width: 0;
    height: 0;
    border: 9px solid transparent;
    border-bottom-color: #ddd;
  }
  ul {
    display: flex;
    flex-wrap: wrap;
  }
  li {
    box-sizing: border-box;
    width: 10%;
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    .colorItem {
      width: 18px;
      height: 18px;
      border-radius: 50%;
    }
    &.active {
      .colorItemBorder {
        position: absolute;
        border: 1px solid currentColor;
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }
    }
  }
`;

export default class SelectColor extends Component {
  static propTypes = {
    colors: arrayOf(string),
    color: string,
    onChange: func,
  };
  static defaultProps = {
    colors: OPTION_COLORS_LIST,
    color: OPTION_COLORS_LIST[0],
    onChange: _.noop,
  };

  render() {
    const { colors, color, onChange } = this.props;
    return (
      <SelectColorWrap>
        <ul>
          {colors.map(item => (
            <li
              className={cx({ active: color === item })}
              key={item}
              style={{ color: item }}
              onClick={() => onChange(item)}>
              <div className="colorItemBorder" />
              <div className="colorItem" style={{ backgroundColor: item }} />
            </li>
          ))}
        </ul>
      </SelectColorWrap>
    );
  }
}

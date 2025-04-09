import React from 'react';
import styled from 'styled-components';
import cx from 'classnames';

const Wrap = styled.ul`
  background: #fff;
  display: flex;
  align-items: center;
  border-radius: 3px;
  background: #d8d8d8;
  padding: 1px;
  width: fit-content;
  &.disabled {
    cursor: not-allowed;
  }
  li {
    padding: 8px 18px;
    background: #fff;
    margin-right: 1px;
    position: relative;
    &:last-child {
      margin-right: 0;
    }
    &.active:before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      left: -1px;
      top: -1px;
      border: 1px solid #2196f3;
      z-index: 1;
      box-sizing: content-box;
    }
    &.active-first:before {
      border-radius: 3px 0 0 3px;
    }
    &.active-middle:before {
      border-radius: 0;
    }
    &.active-end:before {
      border-radius: 0 3px 3px 0;
    }
  }
`;

function ButtonTabs(props) {
  const { value, disabled, data, from = '', className, style = {}, onChange } = props;

  const handleChange = newValue => {
    if (disabled) return;

    onChange(newValue);
  };

  return (
    <Wrap className={cx(className, { disabled: disabled })} style={style}>
      {data.map((item, index) => {
        return (
          <li
            className={cx(
              'Hand',
              { active: value === item.value },
              value === item.value
                ? index === 0
                  ? 'active-first'
                  : index === data.length - 1
                  ? 'active-end'
                  : 'active-middle'
                : '',
            )}
            key={`ButtonTabs-${from}-${item.value}`}
            onClick={() => handleChange(item.value)}
          >
            {item.text}
          </li>
        );
      })}
    </Wrap>
  );
}

export default ButtonTabs;

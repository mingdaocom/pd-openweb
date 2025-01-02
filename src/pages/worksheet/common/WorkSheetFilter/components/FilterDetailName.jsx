import React, { useEffect, useRef, useState } from 'react';
import { bool, func, string } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';

const Con = styled.div`
  input {
    border: none;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
  }
  .name {
    font-size: 16px;
    font-weight: bold;
  }
  &.editable {
    .name {
      cursor: pointer;
      border-bottom: 1px dashed #151515;
      max-width: 250px;
    }
    input {
      margin-bottom: 1px;
    }
  }
  &.withStar {
    position: relative;
    &:after {
      content: '*';
      position: absolute;
      right: -15px;
      top: 0px;
      font-size: 22px;
    }
  }
`;

export default function FilterDetailName(props) {
  const { withStar, editable, name, onChange = () => {} } = props;
  const ref = useRef();
  const [value, setValue] = useState(name);
  const [active, setActive] = useState();
  function handleBlur() {
    const result = onChange(value);
    if (!result) {
      setValue(name);
    }
    setActive(false);
  }
  useEffect(() => {
    setValue(name);
  }, [name]);
  return (
    <Con className={cx('filterDetailName', { withStar: withStar && !active, editable })}>
      {active && (
        <input
          ref={ref}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.keyCode === 13) {
              handleBlur();
            }
          }}
          onBlur={handleBlur}
        />
      )}
      {!active && (
        <div
          className="name ellipsis"
          title={name}
          onClick={() => {
            if (!editable) {
              return;
            }
            setActive(true);
            setTimeout(() => {
              if (ref.current) {
                ref.current.focus();
                ref.current.select();
              }
            }, 20);
          }}
        >
          {name}
        </div>
      )}
    </Con>
  );
}

FilterDetailName.propTypes = {
  withStar: bool,
  editable: bool,
  name: string,
  onChange: func,
};

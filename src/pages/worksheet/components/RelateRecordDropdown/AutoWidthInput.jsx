import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Con = styled.span``;
const Input = styled.input`
  border: none;
  padding: 0;
  margin: 0 10px;
  background: transparent;
  font-size: 12px;
  max-width: 100%;
  max-width: calc(100% - 30px);
`;

function getWidth(value) {
  if (!value || !_.isString(value)) {
    return 4;
  }
  let width = 4;
  const span = document.createElement('span');
  span.setAttribute('style', 'position: absolute; font-size: 12px; left: -10000px; top: -10000px');
  span.innerText = value;
  document.body.appendChild(span);
  width = span.offsetWidth;
  document.body.removeChild(span);
  return width;
}

export default function AutoWidthInput(props) {
  const { value, height, mountRef = () => {}, onChange = () => {} } = props;
  const [width, setWidth] = useState(4);
  const ref = useRef();
  useEffect(() => {
    setWidth(getWidth(value));
  }, [value]);
  useEffect(() => {
    if (ref && ref.current) {
      setTimeout(() => {
        ref.current.focus();
      }, 1);
      mountRef(ref);
    }
  }, []);
  return (
    <Input
      ref={ref}
      value={value}
      style={{ width: width + 2, lineHeight: `${height || 34}px` }}
      onChange={e => {
        onChange(e.target.value);
      }}
    />
  );
}

AutoWidthInput.propTypes = {
  maxWidth: PropTypes.number,
  height: PropTypes.number,
  mountRef: PropTypes.func,
  onChange: PropTypes.func,
};

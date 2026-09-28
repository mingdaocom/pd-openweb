import React, { useEffect, useRef, useState } from 'react';
import propTypes from 'prop-types';
import styled from 'styled-components';
import { Input } from 'ming-ui/antd-components';

const SearchInputCon = styled(Input)`
  width: 220px;
`;

const FocusBtn = styled.div`
  display: inline-block;
  margin: 5px;
  font-size: 0px;
  cursor: pointer;
`;

export default function SearchInput(props) {
  const { clickShowInput, placeholder, value, variant = 'filled', onChange } = props;
  const inputRef = useRef();
  const [isFocus, setIsFocus] = useState();
  const [isOnComposition, setIsOnComposition] = useState(false);
  const [compositionValue, setCompositionValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const isControlled = value !== undefined;

  useEffect(() => {
    if (clickShowInput && isFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [clickShowInput, isFocus]);

  if (clickShowInput && !isFocus) {
    return (
      <FocusBtn onClick={() => setIsFocus(true)}>
        <i className="icon icon-search Font20 textTertiary"></i>
      </FocusBtn>
    );
  }

  return (
    <SearchInputCon
      ref={inputRef}
      allowClear
      radius
      className={props.className}
      placeholder={placeholder}
      prefix={<i className="icon icon-search Font18 textTertiary" />}
      value={isOnComposition ? compositionValue : isControlled ? value || '' : inputValue}
      variant={variant}
      onBlur={e => {
        if (e.target.value.trim() === '') {
          setIsFocus(false);
        }
      }}
      onChange={e => {
        if (isOnComposition) {
          setCompositionValue(e.target.value);
        } else {
          if (!isControlled) {
            setInputValue(e.target.value);
          }

          onChange(e.target.value);
        }
      }}
      onClear={() => setIsFocus(false)}
      onCompositionStart={e => {
        setIsOnComposition(true);
        setCompositionValue(e.target.value);
      }}
      onCompositionEnd={e => {
        setIsOnComposition(false);
        if (!isControlled) {
          setInputValue(e.target.value);
        }

        onChange(e.target.value);
      }}
    />
  );
}

SearchInput.propTypes = {
  clickShowInput: propTypes.bool,
  placeholder: propTypes.string,
  value: propTypes.string,
  variant: propTypes.oneOf(['outlined', 'borderless', 'filled', 'underlined']),
  onChange: propTypes.func,
};

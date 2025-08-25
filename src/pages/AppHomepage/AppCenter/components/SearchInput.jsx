import React, { useEffect, useRef, useState } from 'react';
import propTypes from 'prop-types';
import styled from 'styled-components';
import { FlexCenter, VerticalMiddle } from 'worksheet/components/Basics';

const SearchInputCon = styled(VerticalMiddle)`
  width: 220px;
  height: 36px;
  border-radius: 36px;
  background-color: #f5f5f5;
  padding-left: 10px;
  overflow: hidden;
  input {
    flex: 1;
    border: none;
    margin-left: 2px;
    background-color: inherit;
  }
  &:hover {
    background-color: #eaeaea;
  }
`;

const BaseBtnCon = styled(FlexCenter)`
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 28px;
  margin-right: 2px;
  &:hover {
    background: #f5f5f5;
  }
`;

const FocusBtn = styled.div`
  display: inline-block;
  margin: 5px;
  font-size: 0px;
  cursor: pointer;
`;

let isOnComposition = false;
export default function SearchInput(props) {
  const { clickShowInput, placeholder, value, onChange } = props;
  const inputRef = useRef();
  const [isFocus, setIsFocus] = useState();

  useEffect(() => {
    if (clickShowInput && isFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocus]);

  useEffect(() => {
    !value && inputRef.current && (inputRef.current.value = '');
  }, [value]);

  if (clickShowInput && !isFocus) {
    return (
      <FocusBtn onClick={() => setIsFocus(true)}>
        <i className="icon icon-search Font20 Gray_9d"></i>
      </FocusBtn>
    );
  }
  return (
    <SearchInputCon className={props.className}>
      <i className="icon icon-search Font18 Gray_9d"></i>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onBlur={e => {
          if (e.target.value.trim() === '') {
            setIsFocus(false);
          }
        }}
        onChange={e => {
          !isOnComposition && onChange(e.target.value);
        }}
        onCompositionStart={() => (isOnComposition = true)}
        onCompositionEnd={e => {
          if (e.type === 'compositionend') {
            isOnComposition = false;
          }
          onChange(e.target.value);
        }}
      />
      {value && (
        <BaseBtnCon
          onClick={() => {
            inputRef.current.value = '';
            setIsFocus(false);
            onChange('');
          }}
        >
          <i className="icon icon-cancel Gray_9e Font16"></i>
        </BaseBtnCon>
      )}
    </SearchInputCon>
  );
}

SearchInput.propTypes = {
  clickShowInput: propTypes.bool,
  placeholder: propTypes.string,
  value: propTypes.string,
  onChange: propTypes.func,
};

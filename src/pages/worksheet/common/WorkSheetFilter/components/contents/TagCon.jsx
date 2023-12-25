import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Input } from 'ming-ui';
import styled from 'styled-components';

const InputWrap = styled.span`
  position: relative;
  max-width: 100%;
  display: inline-block;
  input {
    border: none !important;
  }
`;
function TagCon(props) {
  const { disabled, data, renderItem, onRemove, needInput = false, search, onChangeInput = () => {} } = props;
  const inputRef = useRef(null);

  const onFetchData = _.debounce(value => {
    onChangeInput({ keywords: value });
  }, 500);

  return (
    <div className={cx('filterTagCon', { disabled })} onClick={() => inputRef.current.focus()}>
      {data.length ? (
        data.map((item, index) => (
          <span className="fiterTagItem" key={index}>
            {renderItem ? renderItem(item) : <span className="text">{item.name}</span>}
            <span
              className="remove"
              onClick={e => {
                e.stopPropagation();
                if (disabled) {
                  return;
                }
                onRemove(item);
              }}
            >
              <i className="icon icon-delete"></i>
            </span>
          </span>
        ))
      ) : null}
      {needInput && !disabled && (
        <InputWrap className='CityPicker-input-tagSearchBox'>
          <Input
            manualRef={inputRef}
            placeholder={data.length ? '' : _l('请选择')}
            className="CityPicker-input-textCon CityPicker-input-tagSearch"
            autofocus
            type="search"
            value={search}
            onChange={value => {
              onChangeInput({ search: value });
              onFetchData(value);
            }}
          />
          <label className="CityPicker-input-box_label">{search}</label>
        </InputWrap>
      )}
    </div>
  );
}

TagCon.propTypes = {
  disabled: PropTypes.bool,
  data: PropTypes.arrayOf(PropTypes.shape({})),
  renderItem: PropTypes.func,
  onRemove: PropTypes.func,
};

export default TagCon;

import React, { useState, useEffect, useRef } from 'react';
import { string } from 'prop-types';
import { useClickAway } from 'react-use';
import { isEmpty } from 'lodash';
import { SelectFieldsWrap } from '../../styled';
import { getIconByType } from '../../util';

export default function SelectControl({
  className,
  list,
  searchable = true,
  searchValue,
  onSearchChange,
  onClick,
  onClickAway = _.noop,
}) {
  const ref = useRef(null);
  const inputEl = useRef(null);
  useClickAway(ref, onClickAway);
  useEffect(() => {
    inputEl && inputEl.current && inputEl.current.focus();
  }, []);
  return (
    <SelectFieldsWrap ref={ref} className={className}>
      {searchable && (
        <div className="search" onClick={e => e.stopPropagation()}>
          <i className="icon-search Gray_9e" />
          <input
            autoFocus
            ref={inputEl}
            value={searchValue}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            placeholder={_l('搜索字段')}
          ></input>
        </div>
      )}
      {isEmpty(list) ? (
        <div className="emptyText">{_l('没有可选控件')}</div>
      ) : (
        <div className="fieldsWrap">
          <ul className="fieldList">
            {list.map(item => (
              <li
                onClick={() => {
                  onClick(item);
                }}
              >
                <i className={`icon-${getIconByType(item.type)}`}></i>
                {item.controlName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SelectFieldsWrap>
  );
}

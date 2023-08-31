import React, { Fragment, useState } from 'react';
import { Dropdown } from 'antd';
import cx from 'classnames';
import { DropdownOverlay, DropdownPlaceholder } from '../styled';
import { isEmptyValue } from 'src/components/newCustomFields/tools/filterFn.js';
import _ from 'lodash';

export default function DropdownWrapper(props) {
  const {
    searchable,
    data = [],
    trigger = ['click'],
    value,
    placeholder,
    renderDisplay,
    isCheckMode,
    onChange,
    ...rest
  } = props;
  const [searchValue, setValue] = useState('');
  const filterData = searchValue ? data.filter(item => item.text.includes(searchValue)) : data;
  const renderPlaceholder = () => {
    if (isEmptyValue(value)) return <div className="placeholder">{placeholder || _l('请选择')}</div>;
    if (renderDisplay && typeof renderDisplay === 'function') return renderDisplay(value);
    return <div className="text">{(data.find(item => item.value === value) || {}).text}</div>;
  };
  const getItem = item => {
    const { text, icon, iconAtEnd, children, ...rest } = item;
    if (children) return children;
    if (iconAtEnd) {
      return (
        <Fragment>
          <div className="text">{text}</div>
          {icon && <i className={`icon-${icon} Font16`}></i>}
        </Fragment>
      );
    }
    if (isCheckMode) {
      return (
        <Fragment>
          <div className="text">{text}</div>
          {icon && _.includes(value || [], item.value) && <i className={`icon-${icon} Font16`}></i>}
        </Fragment>
      );
    }
    return (
      <Fragment>
        {icon && <i className={`icon-${icon} Font16`}></i>}
        <div className="text">{text}</div>
      </Fragment>
    );
  };
  return (
    <Dropdown
      trigger={trigger || ['click']}
      {...rest}
      overlay={
        <DropdownOverlay>
          {searchable && (
            <div className="searchWrap" onClick={e => e.stopPropagation()}>
              <i className="icon-search Font16 Gray_75"></i>
              <input
                autoFocus
                value={searchValue}
                placeholder={_l('搜索')}
                onChange={e => {
                  setValue(e.target.value);
                }}
              />
            </div>
          )}
          <div className="dropdownContent">
            {filterData.length > 0 ? (
              filterData.map(item => {
                return (
                  <div
                    {..._.pick(item, ['style'])}
                    className={`${item.className || 'item'}`}
                    onClick={() => onChange(item.value)}
                  >
                    {getItem(item)}
                  </div>
                );
              })
            ) : (
              <div className="emptyText">{_l(searchValue ? '暂无搜索结果' : '无内容')}</div>
            )}
          </div>
        </DropdownOverlay>
      }
    >
      <DropdownPlaceholder>
        {renderPlaceholder()}
        <i className="icon-arrow-down-border Font14 Gray_9e"></i>
      </DropdownPlaceholder>
    </Dropdown>
  );
}

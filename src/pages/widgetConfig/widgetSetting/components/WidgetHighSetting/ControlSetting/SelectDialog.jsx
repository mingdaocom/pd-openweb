import React, { useState } from 'react';
import { Dialog } from 'ming-ui';
import styled from 'styled-components';
import { Dropdown } from 'antd';
import update from 'immutability-helper';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import allData from './telData';
import { DropdownContent } from '../../../../styled';

const Wrap = styled(DropdownContent)`
  overflow: hidden;
  .searchWrap {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 16px;
    margin-bottom: 6px;
    border-bottom: 1px solid #f0f0f0;
    input {
      line-height: 36px;
      border: none;
      outline: none;
      padding-left: 8px;
    }
  }
  .emptyText {
    margin: 0 auto;
    line-height: 38px;
    color: #9e9e9e;
    font-size: 13px;
    text-align: center;
  }
  .countryContent {
    width: 100%;
    max-height: 260px;
    overflow-x: hidden;
  }
  .item {
    display: flex;
    align-items: center;
    line-height: 36px;
    &:not(disabled):hover {
      background-color: #f5f5f5;
      color: #151515;
    }
    .countryName {
      margin: 0 6px;
    }
  }
`;
const SelectInfoWrap = styled.div`
  .countryList {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    min-height: 36px;
    padding-bottom: 6px;
    line-height: 36px;
    border: 1px solid #eee;
    border-radius: 4px;
    &:hover {
      border-color: #2196f3;
    }
    .text {
      margin: 6px 0 0 12px;
      line-height: 22px;
    }
  }
  .countryItem {
    display: flex;
    align-items: center;
    height: 22px;
    line-height: 22px;
    margin: 6px 6px 0 6px;
    background-color: #eee;
    border-radius: 4px;
    padding: 0 8px;
    .countryName {
      margin: 0 6px;
    }
    i {
      pointer-events: all;
      cursor: pointer;
      &:hover {
        color: #757575;
      }
    }
  }
`;

export const SelectCountryDropdown = ({ unique, data, setData, selectableData }) => {
  const [value, setValue] = useState('');
  const filteredData = value
    ? selectableData.filter(
        item => item.dialCode.includes(value) || (item.name || '').toLowerCase().includes(value.toLowerCase()),
      )
    : selectableData;
  return (
    <Wrap>
      <div className="searchWrap" onClick={e => e.stopPropagation()}>
        <i className="icon-search Font16 Gray_75"></i>
        <input
          autoFocus
          value={value}
          placeholder={_l('搜索')}
          onChange={e => {
            setValue(e.target.value);
          }}
        />
      </div>
      {filteredData.length > 0 ? (
        <div className="countryContent">
          {filteredData.map(item => {
            return (
              <div
                key={item.iso2}
                className="item"
                onClick={e => {
                  if (unique) {
                    setData(item);
                    return;
                  }
                  e.stopPropagation();
                  if (!data.some(({ iso2 }) => iso2 === item.iso2)) {
                    setData(update(data, { $push: [item] }));
                  }
                }}
              >
                <div className={`iti__flag iti__${item.iso2}`}></div>
                <span className="countryName overflow_ellipsis">{item.name}</span>
                <span className="Gray_75">{`(+${item.dialCode})`}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="emptyText">{_l(value ? '暂无搜索结果' : _l('暂无可选项'))}</div>
      )}
    </Wrap>
  );
};

export default function SelectCountryDialog(props) {
  const { type, title, onOk, onCancel } = props;
  const [data, setData] = useState(props.data || []);

  const getSelectableData = () => {
    const initData = props.selectableData || allData;
    if (type === 'common') {
      return initData.filter(item => !data.some(({ iso2 }) => item.iso2 === iso2));
    }
    return initData;
  };
  return (
    <Dialog title={title} visible onOk={() => onOk(data)} onCancel={onCancel}>
      <Dropdown
        trigger={['click']}
        overlay={<SelectCountryDropdown data={data} setData={setData} selectableData={getSelectableData()} />}
      >
        <SelectInfoWrap>
          <div className="countryList">
            {data.length > 0 ? (
              data.map((item, index) => (
                <div key={item.name} className="countryItem">
                  <div className={`iti__flag iti__${item.iso2}`}></div>
                  <span className="countryName overflow_ellipsis">{item.name}</span>
                  <i
                    className="icon-close"
                    onClick={e => {
                      e.stopPropagation();
                      const nextData = update(data, { $splice: [[index, 1]] });
                      setData(nextData);
                    }}
                  ></i>
                </div>
              ))
            ) : (
              <div className="text Gray_bd">{type === 'allowData' ? _l('全部') : _l('请选择')}</div>
            )}
          </div>
        </SelectInfoWrap>
      </Dropdown>
    </Dialog>
  );
}

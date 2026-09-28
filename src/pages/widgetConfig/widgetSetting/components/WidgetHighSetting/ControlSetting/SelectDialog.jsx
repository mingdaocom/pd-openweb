import React, { useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Modal, Select } from 'ming-ui/antd-components';
import allData from './telData';
import '../../../../styled/style.less';

const SelectInfoWrap = styled.div`
  .countryItem {
    display: flex;
    align-items: center;
    height: 22px;
    line-height: 22px;
    margin: 6px 6px 0 6px;
    background-color: var(--color-border-secondary);
    border-radius: 4px;
    padding: 0 8px;
    .countryName {
      margin: 0 6px;
    }
    i {
      pointer-events: all;
      cursor: pointer;
      &:hover {
        color: var(--color-text-secondary);
      }
    }
  }
`;

const SELECT_STYLES = { root: { width: '100%', minHeight: 36 } };
export const getCountryOptions = data =>
  data.map(item => ({
    value: item.iso2,
    label: item.name,
    searchText: `+${item.dialCode} ${item.name}`,
    country: item,
  }));
const getAreaOptions = data =>
  data.map(item => ({
    value: item.id,
    label: item.name,
    searchText: item.name,
  }));
export const renderCountryOption = ({ data }) => (
  <div className="flexRow alignItemsCenter">
    <span className="flex overflow_ellipsis">{data.label}</span>
    <span className="textSecondary">{`(+${data.country.dialCode})`}</span>
  </div>
);
const renderSelectTag = ({ label, closable, onClose }) => (
  <div
    className="countryItem"
    onMouseDown={event => {
      event.preventDefault();
      event.stopPropagation();
    }}
  >
    <span className="countryName overflow_ellipsis">{label}</span>
    {closable && (
      <i
        className="icon-close"
        onClick={event => {
          event.stopPropagation();
          onClose();
        }}
      ></i>
    )}
  </div>
);

export default function SelectCountryDialog(props) {
  const { type, title, onOk, onCancel } = props;
  const [data, setData] = useState(props.data || []);
  const [searchValue, setSearchValue] = useState('');
  const options = getCountryOptions(_.uniqBy(data.concat(props.selectableData || allData), 'iso2'));

  return (
    <Modal
      width={480}
      wrapClassName="selectDialogZIndex"
      title={title}
      open
      mask={{ closable: true }}
      keyboard
      onOk={() => onOk(data)}
      onCancel={onCancel}
    >
      <SelectInfoWrap>
        <Select
          mode="multiple"
          value={data.map(item => item.iso2)}
          options={options}
          placeholder={type === 'allowData' ? _l('全部') : _l('请选择')}
          showPopupSearch
          optionFilterProp="searchText"
          styles={SELECT_STYLES}
          tagRender={renderSelectTag}
          optionRender={renderCountryOption}
          notFoundContent={_l(searchValue ? '暂无搜索结果' : '暂无可选项')}
          onSearch={setSearchValue}
          onChange={(_, selectedOptions) => setData(selectedOptions.map(item => item.country))}
        />
      </SelectInfoWrap>
    </Modal>
  );
}

export function SelectAreaCountryDialog(props) {
  const { title, data, onOk, onCancel } = props;
  const [selectableData, setSelectData] = useState(props.selectableData || []);
  const [searchValue, setSearchValue] = useState('');

  return (
    <Modal
      width={480}
      title={title}
      open
      mask={{ closable: true }}
      keyboard
      onOk={() => onOk(selectableData)}
      onCancel={onCancel}
    >
      <SelectInfoWrap>
        <Select
          mode="multiple"
          value={selectableData}
          options={getAreaOptions(data)}
          placeholder={_l('请选择')}
          showPopupSearch
          optionFilterProp="searchText"
          styles={SELECT_STYLES}
          tagRender={renderSelectTag}
          notFoundContent={_l(searchValue ? '暂无搜索结果' : '暂无可选项')}
          onSearch={setSearchValue}
          onChange={setSelectData}
        />
      </SelectInfoWrap>
    </Modal>
  );
}

import React, { useRef, useState } from 'react';
import _ from 'lodash';
import { arrayOf, func, shape } from 'prop-types';
import styled from 'styled-components';
import CascaderDropdown from 'src/components/newCustomFields/widgets/Cascader';
import { BaseSelectedItem } from './Styles';

const Con = styled.div`
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  min-height: 32px;
  line-height: 32px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid ${({ active }) => (active ? '#1677ff' : 'var(--border-color)')} !important;
  .clearIcon {
    display: none;
  }
  .customCascader .ant-select-selector {
    border: none !important;
    border-color: transparent !important;
    min-height: 32px;
    height: 32px !important;
  }
  &:hover {
    .clearIcon {
      display: inline-block;
    }
  }
  ${({ isEmpty }) => (!isEmpty ? '&:hover { .downIcon { display: none;} }' : '')}
  .customCascaderDel {
    display: none;
  }
  .customCascaderInput,
  .customAntSelect {
    .ant-select-selector {
      border: none !important;
      min-height: 34px !important;
    }
  }
`;

const CascaderDropdownCon = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0;
  width: 100%;
`;

const Selected = styled.div`
  width: 100%;
  padding: 0 10px;
`;

const Icon = styled.i`
  cursor: pointer;
  font-size: 13px;
  color: #9e9e9e;
  margin-right: 8px;
`;

export default function RelateRecord(props) {
  const { control, values = [], advancedSetting, onChange = () => {} } = props;
  const { allowitem } = advancedSetting || {};
  const isMultiple = String(allowitem) === '2';
  const cache = useRef({});
  const [popupVisible, setPopupVisible] = useState();
  const valuesForShow = cache.current.tempValue ? values.concat(cache.current.tempValue) : values;
  function handleChange(value) {
    onChange({
      filterType: props.filterType || 24,
      ...value,
    });
  }
  return (
    <Con active={popupVisible} isEmpty={!values.length}>
      <Selected onClick={() => setPopupVisible(true)}>
        {!valuesForShow.length && <span className="Font13 Gray_bd">{_l('请选择')}</span>}
        {valuesForShow.map((v, i) => (
          <BaseSelectedItem key={i}>
            <span className="name ellipsis" title={v.name}>
              {v.name}
            </span>
            <i
              className="icon icon-delete Gray_9e Font10 Hand"
              onClick={e => {
                e.stopPropagation();
                handleChange({ values: values.filter(vv => vv.rowid !== v.rowid) });
              }}
            />
          </BaseSelectedItem>
        ))}
      </Selected>
      {popupVisible && (
        <CascaderDropdownCon>
          <CascaderDropdown
            visible
            popupAlign={{
              offset: [6, 2],
              overflow: {
                adjustX: true,
                adjustY: true,
              },
            }}
            treePopupAlign={{
              offset: [7, -28],
              overflow: {
                adjustX: true,
                adjustY: true,
              },
            }}
            onChange={newSelected => {
              newSelected = JSON.parse(newSelected);
              cache.current.tempValue = newSelected.map(item => ({ rowid: item.sid, name: item.name }))[0];
            }}
            dataSource={control.dataSource}
            viewId={control.viewId}
            advancedSetting={control.advancedSetting}
            onPopupVisibleChange={visible => {
              if (!visible && cache.current.tempValue) {
                if (!isMultiple) {
                  handleChange({
                    values: [cache.current.tempValue],
                  });
                  cache.current.tempValue = undefined;
                } else {
                  handleChange({
                    values: _.unionBy(values.concat(cache.current.tempValue), 'rowid'),
                  });
                  cache.current.tempValue = undefined;
                }
              }
              setPopupVisible(visible);
            }}
          />
        </CascaderDropdownCon>
      )}
      <Icon className="icon icon-arrow-down-border downIcon" />
      {!!values.length && (
        <Icon
          className="icon icon-cancel clearIcon"
          onClick={e => {
            handleChange({ values: [] });
            e.stopPropagation();
          }}
        />
      )}
    </Con>
  );
}

RelateRecord.propTypes = {
  values: arrayOf(shape({})),
  control: shape({}),
  advancedSetting: shape({}),
  onChange: func,
};

import React, { useState } from 'react';
import { func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import Search from 'src/components/newCustomFields/widgets/Search';
import EditableCellCon from '../EditableCellCon';
import cx from 'classnames';

const Con = styled(EditableCellCon)`
  > div {
    width: 100%;
  }
  .searchIconBox {
    height: 32px;
    line-height: 32px;
  }
  .ant-select {
    font-size: 13px;
    .ant-select-arrow {
      height: 30px !important;
      border: none;
      right: 2px !important;
      transform: translateY(2px);
      .searchIconBox {
        height: 28px !important;
        border: none;
      }
    }
  }
  .ant-select .ant-select-selector,
  .ant-select .ant-select-selector:not(.ant-select-open):not(.ant-select-disabled) {
    height: 32px !important;
    min-height: auto !important;
    padding: 0 6px !important;
    background: transparent !important;
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    .ant-select-selection-placeholder,
    input {
      font-size: 13px;
    }
    .ant-select-selection-search {
      left: 6px !important;
    }
    .ant-select-selection-search,
    .ant-select-selection-search-input,
    .ant-select-selection-placeholder {
      height: 32px !important;
    }
    &:hover {
      background: transparent !important;
      background-color: transparent !important;
    }
  }
  ${({ isediting }) =>
    isediting
      ? `
      &.cell.isediting {
        padding: 0px !important;
        padding-right: 0px !important;
      }
  `
      : ''}
  &.hideArrow {
    .ant-select-arrow {
      display: none !important;
    }
  }
`;

export default function CellSearch(props) {
  const {
    isediting,
    editable,
    className,
    style,
    cell = {},
    formdata,
    updateEditingStatus,
    onClick,
    updateCell,
    updateControlValue,
  } = props;
  const [value, setValue] = useState(cell.value);
  return (
    <Con
      className={cx(className, 'cellControl flexRow', {
        canedit: editable,
        hideArrow: cell.enumDefault === 2 && _.get(cell, 'advancedSetting.clicksearch') === '1',
      })}
      isediting={isediting}
      style={style}
      onClick={onClick}
      iconName={'arrow-down-border'}
      onIconClick={() => updateEditingStatus(true)}
    >
      {!isediting && <span>{value || ''}</span>}
      {isediting && (
        <div onClick={e => e.stopPropagation()}>
          <Search
            isCell
            {...{
              ...cell,
              advancedSetting: { ...cell.advancedSetting, width: 200 },
              ..._.pick(props, ['projectId', 'recordId', 'appId', 'worksheetId', 'viewId']),
            }}
            formData={!formdata ? null : formdata()}
            defaultSelectProps={{ open: true, dropdownMatchSelectWidth: 420 }}
            onChange={(value, id) => {
              if (id) {
                // TODO 重写子表数据更新逻辑
                setTimeout(() => {
                  if (typeof value === 'string') {
                    updateControlValue({ controlId: id, value });
                  } else if (_.get(value, 'rows')) {
                    updateControlValue({
                      controlId: id,
                      editType: 9,
                      value: JSON.stringify(
                        [
                          {
                            editType: 2,
                            rowid: 'all',
                          },
                        ].concat(
                          value.rows.map(row => ({
                            editType: 0,
                            newOldControl: Object.keys(row)
                              .filter(key => key.length === 24)
                              .map(key => ({ controlId: key, value: row[key] })),
                          })),
                        ),
                      ),
                    });
                  }
                }, 10);
              } else {
                updateCell({ value });
                setValue(value);
              }
            }}
            onVisibleChange={visible => {
              if (!visible) {
                updateEditingStatus(false);
              }
            }}
          />
        </div>
      )}
    </Con>
  );
}

CellSearch.propTypes = {
  className: string,
  style: shape({}),
  rowHeight: number,
  cell: shape({}),
  onClick: func,
};

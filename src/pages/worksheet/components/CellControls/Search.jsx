import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import Search from 'src/components/Form/DesktopForm/widgets/Search';
import EditableCellCon from '../EditableCellCon';

const Con = styled(EditableCellCon)`
  > div {
    width: 100%;
  }
  .searchIconBox {
    height: 32px;
    line-height: 32px;
  }
  .hap-select {
    font-size: 13px;
    .hap-select-arrow {
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
  ${({ $isediting }) =>
    $isediting
      ? `
      &.cell.isediting {
        padding: 0px !important;
        padding-right: 0px !important;
      }
  `
      : ''}
  &.hideArrow {
    .hap-select-arrow {
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
    rowFormData,
    updateEditingStatus,
    onClick,
    updateCell,
    updateControlValue,
  } = props;
  const [value, setValue] = useState(cell.value);
  useEffect(() => {
    setValue(cell.value);
  }, [cell.value]);
  return (
    <Con
      className={cx(className, 'cellControl flexRow', {
        canedit: editable,
        hideArrow: cell.enumDefault === 2 && _.get(cell, 'advancedSetting.clicksearch') === '1',
      })}
      $isediting={isediting}
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
            formData={!rowFormData ? null : _.isFunction(rowFormData) ? rowFormData() : rowFormData}
            defaultSelectProps={{ open: true, popupMatchSelectWidth: 420 }}
            onChange={(value, id) => {
              if (id) {
                // 重写子表数据更新逻辑
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

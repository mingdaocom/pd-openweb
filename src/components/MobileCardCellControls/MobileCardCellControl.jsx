import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import CellControl from 'worksheet/components/CellControls';
import { checkCellIsEmpty, getAdvanceSetting } from 'src/utils/control';

const CellWrap = styled.div`
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;

  .childTableCellName {
    min-width: 0;
    max-width: 100%;
    color: var(--color-text-secondary);
    font-size: 12px;
    line-height: 18px;
    margin-bottom: 3px;
  }
  .childTableCellValue {
    min-width: 0;
    max-width: 100%;
    font-size: 14px;
    line-height: 18px;
    overflow: hidden;
    .RelateRecordDropdown .normalSelectedItem,
    .cellRelateRecordTags > div {
      margin: 0 !important;
    }
    .RelateRecordDropdown .normalSelectedItem,
    .cellRelateRecordTags > div:first-of-type {
      padding: 4px 10px !important;
    }
    > div:first-of-type,
    > span:first-of-type {
      color: var(--color-text-primary);
    }
    .cellRelateRecord .cellRelateRecordTags {
      display: inline-flex;
    }
  }
  .childTableCellValue.isMain {
    color: var(--color-text-title);
    font-size: 14px;
    font-weight: 600;
  }
  .customFormNull {
    margin: unset;
    width: 22px;
    height: 6px;
    background: var(--color-border-primary);
    border-radius: 3px;
  }
  .cell:not(.cellRelateRecord),
  .cell .ellipsis,
  .editableCellCon:not(.cellRelateRecord),
  .worksheetCellPureString {
    max-width: 100% !important;
    overflow: hidden;
    word-break: break-all;
    text-overflow: ellipsis;
    white-space: pre-line;
    display: -webkit-box !important;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
  .mobileRelateRecordWrap {
    max-width: 100%;
    margin-right: 0;
    overflow: hidden;
    word-break: break-all;
    text-overflow: ellipsis;
    white-space: pre-line;
    display: -webkit-box !important;
    line-height: 16px !important;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .RelateRecordDropdown-selected {
    min-height: 0 !important;
  }
  .normalSelectedItem.placeholder {
    position: static !important;
  }

  .relateMultiple,
  .cellUsers,
  .cellDepartments,
  .cellOptions {
    display: flex !important;
    flex-wrap: wrap;
    max-height: 60px;
    overflow: hidden;
  }
  .cellOptions .cellOption {
    margin: 0 !important;
  }
  .cellOptionsParent {
    padding: 0 !important;
  }
`;

const MultipleValueWrap = styled.div`
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  height: 20px;
  padding: 5px 9px;
  border-radius: 3px;
  background: var(--color-primary-transparent-light);
  color: var(--color-text-primary);
  line-height: 20px;
`;

const fieldConfigs = {
  10: { controlName: _l('多选'), icon: 'multi_select' },
  26: { controlName: _l('成员'), icon: 'account_circle' },
  27: { controlName: _l('部门'), icon: 'department' },
  48: { controlName: _l('角色'), icon: 'user' },
  14: { controlName: _l('附件'), icon: 'attachment' },
  29: { controlName: _l('关联'), icon: 'link_record' },
};

export const getControlMultipleValue = (control, value) => {
  // 单个值显示具体值
  if (
    (_.includes([26, 27, 48], control.type) && control.enumDefault !== 1) ||
    (control.type === 29 && control.enumDefault !== 2)
  ) {
    return false;
  }

  const multipleControl = fieldConfigs[control.type];

  if (multipleControl) {
    return (
      <MultipleValueWrap>
        <Icon icon={multipleControl.icon} className="mRight6 textTertiary" />
        <span>{safeParse(value, 'array').length}</span>
      </MultipleValueWrap>
    );
  }

  return false;
};

export default function MobileCardCellControl(props) {
  const {
    cellCellWrapClassName,
    control,
    row,
    showControlName = true,
    isMain = false,
    sheetSwitchPermit,
    worksheetId,
    projectId,
    viewId,
    appId,
    from,
    mode = 'mobileSub',
    masterData,
    rowHeight,
    rowFormData,
    canedit,
    style,
    updateCell,
  } = props;
  const value = row[control.controlId];
  const isEmpty = checkCellIsEmpty(value);
  const multipleValue = !isEmpty && getControlMultipleValue(control, value);

  return (
    <CellWrap className={cellCellWrapClassName}>
      {showControlName && <div className="childTableCellName ellipsis">{control.controlName}</div>}
      <div className={cx('childTableCellValue', { isMain })}>
        {isEmpty ? (
          <div className="customFormNull" />
        ) : multipleValue ? (
          multipleValue
        ) : (
          <CellControl
            isMobileTable
            className={cx('cell flex', {
              cellOptionsParent: _.includes([9, 10, 11], control.type),
              ellipsis: control.type !== 29,
              relateMultiple: control.type === 29 && control.enumDefault === 2,
            })}
            sheetSwitchPermit={sheetSwitchPermit}
            cell={{
              ...control,
              value,
              // 检查项以勾选项显示、数值以数字显示
              advancedSetting:
                control.type === 36 || control.type === 6
                  ? { ...getAdvanceSetting(control), showtype: '0' }
                  : control.advancedSetting,
            }}
            row={row}
            rowHeight={rowHeight}
            from={from || (control.type == 29 && control.enumDefault === 2 ? 3 : 4)}
            mode={mode}
            masterData={masterData}
            rowFormData={rowFormData}
            projectId={projectId}
            worksheetId={worksheetId}
            viewId={viewId}
            canedit={canedit}
            appId={appId}
            style={style}
            updateCell={updateCell}
          />
        )}
      </div>
    </CellWrap>
  );
}

MobileCardCellControl.propTypes = {
  control: PropTypes.shape({}).isRequired,
  row: PropTypes.shape({}).isRequired,
  className: PropTypes.string,
  showControlName: PropTypes.bool,
  isMain: PropTypes.bool,
};

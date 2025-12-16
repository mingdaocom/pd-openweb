import React from 'react';
import cx from 'classnames';
import _, { get, identity } from 'lodash';
import styled from 'styled-components';
import CellControl from 'worksheet/components/CellControls';
import { checkCellIsEmpty } from 'src/utils/control';
import { checkControlCanSetStyle } from 'src/utils/control';
import { getRecordCardStyle } from '../../tools/utils';

const Control = styled.div`
  display: flex;
  flex-direction: ${$props => $props.direction};
  ${({ direction }) => direction === 'row' && 'align-items: center;'}
  padding-bottom: 6px;

  .cellControl {
    font-size: inherit !important;
  }

  .label {
    max-width: 200px;
    min-width: 70px;
    color: #757575;
    padding-right: 1em;
    ${({ direction }) => direction === 'column' && 'padding-bottom: 6px;'}
    ${({ labelStyle }) => labelStyle}
  }
  .content {
    display: flex;
    align-items: center;
    flex: 1;
    overflow: hidden;
    white-space: pre;
    > div {
      max-width: 100%;
      font-size: inherit;
      line-height: initial;
    }
    .editableCellCon {
      display: flex;
    }
    .InlineBlock {
      display: block !important;
    }
    .worksheetCellPureString {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre-line;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      /* autoprefixer: off */
      -webkit-box-orient: vertical;
      /* autoprefixer: on */
    }
    &:not(.isTextControl) {
      max-width: 100%;
    }
    .cellOptions,
    .cellDepartments,
    .cellUsers,
    .RelateRecordDropdown {
      overflow: hidden;
      width: 100%;
      white-space: pre-line;
    }
    .cellOptions,
    .cellDepartments,
    .cellUsers {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    // 选项
    .cellOption {
      margin: initial;
      line-height: initial;
      padding: 2px 8px;
      border-radius: 12px;
      color: var(--secondary-color);
    }
    // 部门
    .cellDepartment,
    .cellUser {
      margin: initial;
      height: initial;
      line-height: initial;
      font-size: inherit;
    }
    // 成员
    .cellUser {
      .cellUserHead {
        line-height: initial !important;
      }
      .userName {
        display: flex;
        align-items: center;
      }
    }
    .customFormNull {
      margin: unset;
      width: 22px;
      height: 6px;
      background: var(--color-border-primary);
      border-radius: 3px;
    }
    ${({ contentStyle }) => contentStyle}
  }
`;

export default function CardCellControls(props) {
  const { controls, data, parentControl, projectId, worksheetId, viewId, isCharge, sheetSwitchPermit } = props;

  return (
    <div>
      {controls.filter(identity).map((control = {}, i) => {
        const recordCardStyle = getRecordCardStyle(parentControl);
        const isColumn = get(recordCardStyle, 'controlTitleStyle.direction') === '2';
        const isTextControl = checkControlCanSetStyle(control.type === 30 ? control.sourceControlType : control.type);
        const isNotEmpty = !checkCellIsEmpty(data[control.controlId]);
        return (
          <Control
            key={i}
            labelStyle={get(recordCardStyle, 'controlTitleStyle.valueStyle', '')}
            contentStyle={isTextControl ? get(recordCardStyle, 'controlValueStyle.valueStyle', '') : ''}
            direction={isColumn ? 'column' : 'row'}
          >
            <div
              className={cx('label', { ellipsis: isColumn, breakAll: !isColumn })}
              style={{
                fontSize: get(recordCardStyle, 'controlTitleStyle.size'),
              }}
            >
              {control.controlName}
            </div>
            <div
              className={cx(`content control${control.type}`, { isTextControl, isNotEmpty })}
              style={{
                fontSize: get(recordCardStyle, 'controlValueStyle.size', ''),
              }}
            >
              {isNotEmpty ? (
                <CellControl
                  cell={Object.assign({}, control, { value: data[control.controlId] })}
                  row={data}
                  worksheetId={worksheetId}
                  from={4}
                  rowFormData={() => _.get(parentControl, 'formData') || []}
                  projectId={projectId}
                  viewId={viewId}
                  isCharge={isCharge}
                  sheetSwitchPermit={sheetSwitchPermit}
                />
              ) : (
                <div className="customFormNull" />
              )}
            </div>
          </Control>
        );
      })}
    </div>
  );
}

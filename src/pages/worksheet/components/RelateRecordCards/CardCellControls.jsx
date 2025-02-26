import React from 'react';
import styled from 'styled-components';
import CellControl from 'worksheet/components/CellControls';
import { checkCellIsEmpty, getRecordCardStyle, checkControlCanSetStyle } from 'worksheet/util';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import _, { get, identity } from 'lodash';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';

function getCellContentPaddingTop(control, isNotEmpty) {
  if (!isNotEmpty) {
    return 4;
  }
  const type = control.type === 30 ? control.sourceControlType : control.type;
  if (checkControlCanSetStyle(type)) return 6;
  switch (type) {
    case WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU:
    case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT:
    case WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN:
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET:
    case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER:
    case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT:
    case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE:
    case WIDGETS_TO_API_TYPE_ENUM.SUB_LIST:
      return 3;
    case WIDGETS_TO_API_TYPE_ENUM.SWITCH:
    case WIDGETS_TO_API_TYPE_ENUM.SCORE:
      return 5;
    case WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT:
      return 2;
    default:
      return 6;
  }
}

const Con = styled.div`
  ${({ fullShowCard }) => (!fullShowCard ? 'display: grid;' : '')}
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
`;

const Empty = styled.span`
  display: inline-block;
  width: 22px;
  height: 6px;
  background: #eaeaea;
  border-radius: 3px;
`;

const Group = styled.div`
  display: inline-block;
`;

const Control = styled.div`
  display: flex;
  flex-direction: ${$props => $props.direction};
  font-size: 12px;
  padding-right: 14px;
  .label {
    max-width: 200px;
    min-width: 70px;
    color: #757575;
    line-height: 16px;
    margin: 6px 0;
    padding-right: 1em;
    ${({ labelStyle }) => labelStyle}
  }
  .content {
    flex: 1;
    min-height: 28px;
    overflow: hidden;
    white-space: pre;
    > div {
      max-width: 100%;
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
    // &.isNotEmpty:not(.isTextControl) {
    //   font-size: 0px;
    //   > * {
    //     font-size: 13px;
    //   }
    // }
    .cellOptions,
    .cellDepartments,
    .cellUsers,
    .RelateRecordDropdown {
      overflow: hidden;
      width: 100%;
      white-space: pre-line;
    }
    .AttachmentCon {
      margin: 0 4px 0 0;
    }
    ${({ contentStyle }) => contentStyle}
  }
`;

export default function CardCellControls(props) {
  const { fullShowCard, controls, data, parentControl, projectId, worksheetId, viewId, isCharge, sheetSwitchPermit } =
    props;
  const isMobile = browserIsMobile();

  return (
    <Con fullShowCard={fullShowCard}>
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
              className={cx('label', { ellipsis: isColumn, breakAll: isMobile && !isColumn })}
              style={{
                fontSize: get(recordCardStyle, 'controlTitleStyle.size'),
                lineHeight:
                  Math.floor(get(recordCardStyle, 'controlTitleStyle.size', '').replace(/[^\d]/g, '') * 1.3) + 'px',
              }}
            >
              {control.controlName}
            </div>
            <div
              className={cx(`content control${control.type}`, { isTextControl, isNotEmpty })}
              style={{
                [isColumn ? 'paddingBottom' : 'paddingTop']: getCellContentPaddingTop(control, isNotEmpty),
                ...(isTextControl
                  ? {
                      fontSize: get(recordCardStyle, 'controlValueStyle.size', ''),
                      lineHeight:
                        Math.floor(get(recordCardStyle, 'controlValueStyle.size', '').replace(/[^\d]/g, '') * 1.3) +
                        'px',
                    }
                  : {}),
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
                <Empty />
              )}
            </div>
          </Control>
        );
      })}
    </Con>
  );
}

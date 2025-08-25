import React, { useState } from 'react';
import cx from 'classnames';
import { includes } from 'lodash';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Menu, MenuItem } from 'ming-ui';
import { UserHead } from 'ming-ui';
import addRecord from 'worksheet/common/newRecord/addRecord';
import CustomScore from 'src/ming-ui/components/CustomScore';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { FROM } from 'src/pages/worksheet/components/CellControls/enum';
import Options from 'src/pages/worksheet/components/CellControls/Options';
import { controlState } from 'src/utils/control';

const Con = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #fafafa;
  padding: 12px;
  .controlContent {
    margin-right: 6px;
    display: flex;
    align-items: center;
    max-width: calc(100% - 90px);
    overflow: hidden;
    > * {
      max-width: 100%;
    }
    .cellOptions,
    .cellOption {
      max-width: 100%;
    }
    .customScoreWrap {
      .StarScore-item:not(.active) {
        display: none;
      }
    }
  }
  .count {
    color: #999;
    font-size: 12px;
    margin: 0 8px;
  }
  .controlText {
    color: #151515;
    font-size: 14px;
    font-weight: bold;
  }
  .cellOptions .cellOption {
    margin: 0;
  }
  .Score-wrapper.customScoreWrap .text {
    color: #151515;
    font-size: 14px;
    font-weight: bold;
    margin-left: 5px !important;
  }
  .hoverShow {
    display: none;
  }
  &.hover,
  &:hover {
    .hoverShow {
      display: flex;
    }
    .count {
      display: none;
    }
  }
`;

const Icon = styled.div`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 16px;
  margin-right: 6px;
  cursor: pointer;
  .icon-arrow-down {
    font-size: 13px;
    &.folded {
      transform: rotate(-90deg);
    }
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }
`;

export function getDefaultValue({ control, groupKey, name } = {}) {
  if (String(groupKey) === '-1') {
    return {};
  }
  const isOptions = includes(
    [WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN],
    control.type,
  );
  if (isOptions) {
    return { [control.controlId]: JSON.stringify([groupKey]) };
  } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.SCORE) {
    return { [control.controlId]: groupKey };
  } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET) {
    return { [control.controlId]: JSON.stringify([{ sid: groupKey, name }]) };
  }
  return { [control.controlId]: `[${name}]` };
}

export function ControlContent(props) {
  const { projectId, control = {}, groupKey, name, groupEmptyName, appId } = props;
  if (String(groupKey) === '-1') {
    return (
      <div className="controlContent">
        <div className="controlText ellipsis"> {groupEmptyName} </div>
      </div>
    );
  }
  const isOptions = includes(
    [WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN],
    control.type,
  );
  if (isOptions && control.enumDefault2 === 1) {
    return (
      <div className="controlContent">
        <Options
          cell={{
            ...control,
            value: groupKey && JSON.stringify([groupKey]),
          }}
          style={{ padding: 0 }}
          from={FROM.CARD}
        />
      </div>
    );
  } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.SCORE) {
    return (
      <div className="controlContent">
        <CustomScore hideTip backgroundColor="rgba(0,0,0,0.16)" score={name} data={control} disabled />
      </div>
    );
  } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.USER_PICKER) {
    const account = safeParse(name);
    return (
      account && (
        <div className="controlContent">
          <UserHead
            appId={appId}
            projectId={projectId}
            size={21}
            className="cellUserHead"
            user={{
              userHead: account.avatar,
              accountId: account.accountId,
            }}
          />
          <div className="controlText ellipsis mLeft5"> {account.fullname} </div>
        </div>
      )
    );
  }
  let showText = name;
  if (control.type === WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE) {
    showText = safeParse(name).organizeName;
  } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT) {
    showText = safeParse(name).departmentName;
  }
  return (
    <div className="controlContent">
      <div className="controlText ellipsis"> {showText} </div>
    </div>
  );
}

ControlContent.propTypes = {
  groupKey: PropTypes.string,
  name: PropTypes.string,
  control: PropTypes.shape({}),
  appId: PropTypes.string,
};

export default function GroupByControl(props) {
  const {
    projectId,
    worksheetId,
    view = {},
    appId,
    viewId,
    className,
    folded,
    style = {},
    groupKey,
    name,
    count = 0,
    allowAdd = false,
    lineEditable = true,
    onFold = () => {},
    onAllFold = () => {},
    onAdd,
  } = props;
  const [popupVisible, setPopupVisible] = useState(false);
  const originControl = props.control;
  const control = _.assign(
    {},
    originControl,
    originControl.type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD ? { type: originControl.sourceControlType } : {},
  );
  const groupEmptyName = _.get(view, 'advancedSetting.groupemptyname') || _l('为空');
  const addRecordVisible =
    allowAdd &&
    lineEditable &&
    controlState(control).editable &&
    originControl.type !== WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD;
  return (
    <Con
      className={className}
      style={style}
      onClick={() => {
        onFold(!folded);
      }}
    >
      <Icon>
        <i className={cx('icon icon-arrow-down', { folded })}> </i>
      </Icon>
      <ControlContent
        projectId={projectId}
        control={control}
        groupKey={groupKey}
        name={name}
        groupEmptyName={groupEmptyName}
        appId={appId}
      />
      <div className="count">{count}</div>
      <Trigger
        action={['click']}
        popupVisible={popupVisible}
        onPopupVisibleChange={setPopupVisible}
        popup={
          <Menu className="Relative" onClick={e => e.stopPropagation()}>
            <MenuItem
              onClick={() => {
                setPopupVisible(false);
                onFold(!folded);
              }}
            >
              {folded ? _l('展开分组') : _l('收起分组')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setPopupVisible(false);
                onAllFold(false);
              }}
            >
              {_l('展开全部')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setPopupVisible(false);
                onAllFold(true);
              }}
            >
              {_l('收起全部')}
            </MenuItem>
          </Menu>
        }
        popupAlign={{
          offset: [0, 2],
          points: ['tl', 'bl'],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
      >
        <Icon className="hoverShow" onClick={e => e.stopPropagation()}>
          <i className="icon icon-more_horiz Gray_9e"></i>
        </Icon>
      </Trigger>
      {addRecordVisible && (
        <Icon
          className="hoverShow"
          onClick={e => {
            e.stopPropagation();
            addRecord({
              worksheetId,
              appId,
              viewId,
              defaultFormData: getDefaultValue({ control, groupKey, name }),
              defaultFormDataEditable: false,
              directAdd: false,
              onAdd: record => {
                onAdd(record);
              },
            });
          }}
        >
          <i className="icon icon-add Gray_9e"></i>
        </Icon>
      )}
    </Con>
  );
}

GroupByControl.propTypes = {
  worksheetId: PropTypes.string,
  appId: PropTypes.string,
  viewId: PropTypes.string,
  key: PropTypes.string,
  name: PropTypes.string,
  folded: PropTypes.bool,
  allFolded: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  count: PropTypes.number,
  control: PropTypes.shape({}),
  onFold: PropTypes.func,
  onAllFold: PropTypes.func,
  onAdd: PropTypes.func,
};

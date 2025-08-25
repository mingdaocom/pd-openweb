import React from 'react';
import cx from 'classnames';
import { find, includes } from 'lodash';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { UserHead } from 'ming-ui';
import CustomScore from 'src/ming-ui/components/CustomScore';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';

const Con = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px;
  font-size: 16px;
  .controlContent {
    margin-right: 6px;
    display: flex;
    align-items: center;
    font-size: 1.1em;
    .dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .avatarBox {
      display: flex !important;
    }
  }
  .count {
    color: var(--gray-9e);
    font-size: 0.9em;
    margin: 0 8px;
  }
  .controlText {
    color: #151515;
    /* font-size: 15px; */
    font-weight: bold;
  }
  .cellOptions .cellOption {
    margin: 0;
  }
  .Score-wrapper.customScoreWrap .text {
    color: #151515;
    /* font-size: 15px; */
    font-weight: bold;
    margin-left: 5px !important;
  }
  .hoverShow {
    display: none;
  }
`;

const IconWrap = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-9e);
  font-size: 1em;
  margin-right: 6px;
  cursor: pointer;
  .icon-arrow-down {
    font-size: 13px;
  }
  .folded {
    transform: rotate(-90deg);
  }
`;

function ControlContent(props) {
  const { control = {}, groupKey, name, groupEmptyName } = props;

  if (String(groupKey) === '-1') {
    return (
      <div className="controlContent">
        <div className="controlText"> {groupEmptyName} </div>
      </div>
    );
  }
  const isOptions = includes(
    [WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN],
    control.type,
  );
  if (isOptions && control.enumDefault2 === 1) {
    const color = (find(control.options || [], v => v.key === groupKey) || {}).color;

    return (
      <div className="controlContent">
        <span className="dot" style={{ backgroundColor: color }} />
        <span className="flex ellipsis bold">{name}</span>
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
        <div className="controlContent ellipsis">
          <UserHead
            size={21}
            className="cellUserHead"
            user={{
              userHead: account.avatar,
              accountId: account.accountId,
            }}
          />
          <div className="controlText ellipsis mLeft5 bold"> {account.fullname} </div>
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
    <div className="controlContent ellipsis">
      <div className="controlText ellipsis bold"> {showText} </div>
    </div>
  );
}

ControlContent.propTypes = {
  groupKey: PropTypes.string,
  name: PropTypes.string,
  control: PropTypes.shape({}),
  canFold: PropTypes.bool,
};

export default function GroupByControl(props) {
  const {
    className,
    folded,
    style = {},
    groupKey,
    name,
    count = 0,
    onFold = () => {},
    canFold = true,
    view,
    customEmptyName = '',
  } = props;
  const originControl = props.control;
  const control = _.assign(
    {},
    originControl,
    originControl.type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD ? { type: originControl.sourceControlType } : {},
  );
  const groupEmptyName = _.get(view, 'advancedSetting.groupemptyname') || customEmptyName || _l('为空');

  return (
    <Con className={className} style={style} onClick={() => canFold && onFold(!folded)}>
      {canFold && (
        <IconWrap>
          <i
            className={cx('icon-arrow-down', {
              folded,
            })}
          ></i>
        </IconWrap>
      )}
      <ControlContent
        control={control}
        groupKey={groupKey}
        name={name}
        canFold={canFold}
        groupEmptyName={groupEmptyName}
      />
      <div className="count">{count}</div>
      <div className="flex"></div>
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
  className: PropTypes.string,
  style: PropTypes.shape({}),
  count: PropTypes.number,
  control: PropTypes.shape({}),
  onFold: PropTypes.func,
  canFold: PropTypes.bool,
  view: PropTypes.shape({}),
};

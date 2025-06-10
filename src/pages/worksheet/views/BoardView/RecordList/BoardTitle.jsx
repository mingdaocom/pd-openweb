import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, UserHead } from 'ming-ui';
import { FlexCenter } from 'worksheet/styled';
import { isLightColor } from 'src/utils/control';
import { CAN_AS_BOARD_OPTION } from '../config';

const BoardTitleWrap = styled(FlexCenter)`
  border-radius: 18px;
  padding: 0 18px;
  line-height: 28px;
  margin: 8px 0;
  font-weight: 500;

  .boardTitle {
    border-radius: 18px;
    line-height: 28px;
    padding: 0 12px;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .avatarWrap {
    display: flex;
    align-items: center;
    img {
      vertical-align: baseline;
    }
    span {
      margin-left: 4px;
    }
  }
  .optionType {
    &.haveColor {
      color: #fff;
    }
    &.isLightColor {
      color: #151515;
    }
  }
  .relationSheetType {
    color: #2196f3;
    background-color: rgba(0, 0, 0, 0.05);
    cursor: pointer;
    font-size: 15px;
    &:hover {
      color: #1976d2;
    }
    .icon {
      margin-right: 5px;
    }
  }
  .gradeType {
    font-size: 15px;
    color: #151515;
  }
  .noGroupTitle {
    color: #757575;
    font-size: 15px;
  }
`;
const RecordCount = styled.div`
  box-sizing: border-box;
  padding: 0 6px;
  margin-left: 8px;
  line-height: 24px;
  min-width: 24px;
  border-radius: 12px;
  text-align: center;
  color: #9e9e9e;
  background-color: rgba(0, 0, 0, 0.05);
`;

export default class BoardTitle extends Component {
  static propTypes = {};
  static defaultProps = {};

  renderBoardTitle = () => {
    const {
      type,
      name,
      selectControl: { advancedSetting = {} } = {},
      color,
      keyType,
      enumDefault,
      enumDefault2,
      noGroup,
      rowId,
      appId,
      projectId,
    } = this.props;

    if (noGroup) return <div className="noGroupTitle WordBreak">{name}</div>;
    if (_.includes(CAN_AS_BOARD_OPTION, type)) {
      const isColorful = enumDefault2 === 1 && color;
      return (
        <div
          className={cx('boardTitle optionType', {
            haveColor: isColorful,
            isLightColor: isLightColor(color),
          })}
          style={{ backgroundColor: isColorful ? color : 'transparent' }}
        >
          {name}
        </div>
      );
    }
    if (type === 26) {
      const { accountId, avatar: userHead, fullname } = JSON.parse(name) || {};
      return (
        <div className="avatarWrap overflow_ellipsis">
          <UserHead className="mRight5" user={{ userHead, accountId }} size={24} appId={appId} projectId={projectId} />
          <span className="Font14 Bold overflow_ellipsis">{fullname}</span>
        </div>
      );
    }
    if (type === 27) {
      return <div className="relationSheetType boardTitle">{(JSON.parse(name) || {}).departmentName}</div>;
    }
    if (type === 48) {
      return <div className="relationSheetType boardTitle">{(JSON.parse(name) || {}).organizeName}</div>;
    }
    if (_.includes([28], type)) {
      const itemnames = JSON.parse(advancedSetting.itemnames || '[]');
      const currentName =
        _.get(
          _.find(itemnames, i => i.key === keyType),
          'value',
        ) || name;
      return <div className="gradeType">{currentName}</div>;
    }
    return (
      <div className="relationSheetType boardTitle">
        <Icon icon="link-worksheet" />
        {name || _l('未命名')}
      </div>
    );
  };
  render() {
    const { count } = this.props;
    return (
      <BoardTitleWrap className="boardTitleWrap">
        {this.renderBoardTitle()}
        {!!count && <RecordCount>{count}</RecordCount>}
      </BoardTitleWrap>
    );
  }
}

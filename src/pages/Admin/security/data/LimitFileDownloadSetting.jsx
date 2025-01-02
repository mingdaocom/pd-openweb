import React, { Component } from 'react';
import { Icon, RadioGroup, UserHead } from 'ming-ui';
import MoreActionDia from '../account/contactsHidden/modules/moreActionDia';
import { dialogSelectOrgRole, dialogSelectDept, dialogSelectUser } from 'ming-ui/functions';
import dataLimitAjax from 'src/api/dataLimit';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';

const Wrap = styled.div`
  box-sizing: border-box;
  margin: 16px 0 0;
  border: 1px solid #d9d9d9;
  padding: 24px 8px;
  position: relative;

  .userItem {
    position: relative;
    height: 40px;
    line-height: 40px;
    border-radius: 11px;
    display: inline-block;
    margin-right: 8px;
    padding: 0 15px;

    .delete {
      display: none;
      font-size: 24px;
    }

    &.active,
    &:hover {
      .delete {
        display: block;
        position: absolute;
        right: -5px;
        top: -5px;
      }
    }

    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: inline-block;
      vertical-align: middle;
      background: #eaeaea;
    }

    .name {
      color: #151515;
      font-size: 13px;
      margin-left: 10px;
      display: inline-block;
      vertical-align: middle;
      text-decoration: none;
    }

    .depIcon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: inline-block;
      vertical-align: middle;
      background: #eaeaea;
      color: #2196f3;
      font-size: 12px;
      line-height: 24px;
      text-align: center;
      &.orgRoleIcon {
        background-color: #ffad00;
        color: #fff;
      }
    }
  }

  .moreActionDia {
    position: absolute;
    top: 20px;
    left: 0;
    z-index: 1;
    line-height: 30px;
    text-align: left;
    width: 180px;
    background: rgba(255, 255, 255, 1) 0% 0% no-repeat padding-box;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.24);
    border-radius: 3px;
    padding: 10px 0;
    box-sizing: border-box;

    li {
      padding: 0 24px;

      &:hover {
        background: #eaeaea;
      }
    }
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const Footer = styled.div`
  height: 66px;
  padding: 15px 0;
  background-color: #fff;
  .saveBtn,
  .delBtn {
    height: 36px;
    line-height: 36px;
    padding: 0 30px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: color ease-in 0.2s, border-color ease-in 0.2s, background-color ease-in 0;
  }

  .saveBtn {
    margin-right: 20px;
    background: #1e88e5;
    color: #fff;
    &:hover {
      background: #1565c0;
    }
    &.disabled {
      color: #fff;
      background: #b2dbff;
      cursor: not-allowed;
      &:hover {
        background: #b2dbff;
      }
    }
  }
  .delBtn {
    border: 1px solid #eaeaea;
    &:hover {
      border: 1px solid #ccc;
    }
    &.disabled {
      color: #eaeaea;
      cursor: not-allowed;
      &:hover {
        border: 1px solid #eaeaea;
      }
    }
  }
`;

export default class LimitFileDownloadSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      limitType: props.limitType,
      whiteList: props.whiteList || [],
      initialLimitType: props.limitType,
      initialWhiteList: props.whiteList || [],
      showMoreActionSelf: false,
    };
  }

  addUser = () => {
    const { projectId } = this.props;

    const SelectUserSettingsForAdd = {
      unique: false,
      projectId: projectId,
      filterAll: true,
      filterFriend: true,
      filterOthers: true,
      filterOtherProject: true,
      dataRange: 2,
      callback: accounts => this.addDataFn(accounts, 1),
    };
    dialogSelectUser({
      fromAdmin: true,
      showMoreInvite: false,
      SelectUserSettings: SelectUserSettingsForAdd,
    });
  };

  addDept = () => {
    const { projectId } = this.props;

    dialogSelectDept({
      projectId,
      unique: false,
      fromAdmin: true,
      selectedDepartment: [],
      showCreateBtn: false,
      selectFn: departments => this.addDataFn(departments, 2),
    });
  };

  addOrgRoles = () => {
    const { projectId } = this.props;
    dialogSelectOrgRole({
      projectId,
      onSave: roles => this.addDataFn(roles, 3),
    });
  };

  addDataFn = (data, type) => {
    const { whiteList } = this.state;
    const selectedIds = whiteList.filter(item => item.sourceType === type).map(v => v.id);
    const addData = data
      .filter(
        item =>
          !_.includes(selectedIds, type === 1 ? item.accountId : type === 2 ? item.departmentId : item.organizeId),
      )
      .map(v => ({
        id: type === 1 ? v.accountId : type === 2 ? v.departmentId : v.organizeId,
        name: type === 1 ? v.fullname : type === 2 ? v.departmentName : v.organizeName,
        sourceType: type,
        avatar: type === 1 ? v.avatar : undefined,
      }));

    this.setState({ whiteList: whiteList.concat(addData) });
  };

  handleSave = () => {
    const { projectId } = this.props;
    const { whiteList, initialWhiteList, limitType, initialLimitType } = this.state;

    if (_.isEqual(limitType, initialLimitType) && _.isEqual(whiteList, initialWhiteList)) return;

    const requestArr =
      !_.isEqual(limitType, initialLimitType) && !_.isEqual(whiteList, initialWhiteList)
        ? [
            dataLimitAjax.editAttachmentWhiteList({ projectId, whiteList }),
            dataLimitAjax.editAttachmentSetting({ projectId, status: 1, limitType }),
          ]
        : !_.isEqual(whiteList, initialWhiteList)
        ? [dataLimitAjax.editAttachmentWhiteList({ projectId, whiteList })]
        : [dataLimitAjax.editAttachmentSetting({ projectId, status: 1, limitType })];

    Promise.all(requestArr).then(resArr => {
      if (resArr.every(v => v === true)) {
        alert(_l('保存成功'));
        this.setState({ initialLimitType: limitType, initialWhiteList: whiteList });
        this.props.updateSettingData(limitType, whiteList);
      }
    });
  };

  renderContent = () => {
    const { showMoreActionSelf, whiteList = [] } = this.state;
    return (
      <Wrap className="listCon">
        <div className={cx({ mBottom15: whiteList.length })}>
          {whiteList.map(item => {
            const { id, name, sourceType, avatar } = item;
            return (
              <div key={id} className={cx('userItem')}>
                <Icon
                  className="Font24 Red delete Hand"
                  icon="cancel"
                  onClick={() =>
                    this.setState({
                      whiteList: whiteList.filter(v => item.id !== v.id),
                    })
                  }
                />
                {_.includes([2, 3], sourceType) ? (
                  <span className={cx('depIcon', { orgRoleIcon: sourceType === 3 })}>
                    <Icon className="department Hand" icon={sourceType === 2 ? 'department' : 'user'} />
                  </span>
                ) : (
                  <UserHead
                    className="InlineBlock"
                    accountId={id}
                    user={{ userHead: avatar, accountId: id }}
                    size={24}
                  />
                )}
                <span className="name">{name}</span>
              </div>
            );
          })}
        </div>
        <span
          className="ThemeColor Font13 Hand mLeft15 Relative"
          onClick={e => this.setState({ showMoreActionSelf: true })}
        >
          <Icon className="Font16 mRight5" icon="add" />
          {_l('添加')}
          <MoreActionDia
            onClickAway={() => this.setState({ showMoreActionSelf: false })}
            showMoreAction={showMoreActionSelf}
            addUser={this.addUser}
            addDept={this.addDept}
            addOrgRoles={this.addOrgRoles}
          />
        </span>
      </Wrap>
    );
  };

  render() {
    const { onClose = () => {} } = this.props;
    const { limitType, initialLimitType, whiteList, initialWhiteList } = this.state;
    const disabled = _.isEqual(limitType, initialLimitType) && _.isEqual(whiteList, initialWhiteList);

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader">
          <div className="flexRow alignItemsCenter">
            <Icon icon="backspace" className="Font22 ThemeHoverColor3 pointer" onClick={onClose} />
            <div className="Font17 bold flex mLeft10">{_l('附件下载')}</div>
          </div>
        </div>
        <div className="orgManagementContent flexColumn">
          <Content>
            <div className="Font15 bold mBottom20">{_l('限制方式')}</div>
            <RadioGroup
              size="middle"
              checkedValue={limitType}
              data={[
                {
                  text: _l('禁止所有设备下载'),
                  value: 0,
                },
                {
                  text: _l('禁止所有Web移动端下载'),
                  value: 1,
                },
              ]}
              onChange={value => this.setState({ limitType: value })}
            />
            <div className="Font15 bold mTop40">{_l('白名单')}</div>
            <div className="Gray_9e Font12 mBottom20">{_l('允许以下成员下载，不受「限制方式」的管控')}</div>
            {this.renderContent()}
          </Content>
          <Footer className="flexRow">
            <div className={cx('saveBtn', { disabled })} onClick={this.handleSave}>
              {_l('保存')}
            </div>
            <div
              className={cx('delBtn', { disabled })}
              onClick={() => this.setState({ limitType: initialLimitType, whiteList: initialWhiteList })}
            >
              {_l('取消')}
            </div>
          </Footer>
        </div>
      </div>
    );
  }
}

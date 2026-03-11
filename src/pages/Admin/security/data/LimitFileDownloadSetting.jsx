import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, Icon, RadioGroup, Textarea, UserHead } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { dialogSelectDept, dialogSelectOrgRole, dialogSelectUser } from 'ming-ui/functions';
import dataLimitAjax from 'src/api/dataLimit';
import MoreActionDia from '../account/contactsHidden/modules/moreActionDia';
import { LIMIT_FILE_DOWNLOAD_USE_TYPE_ENUM } from './enum';

const Wrap = styled.div`
  box-sizing: border-box;
  margin: 16px 0 0;
  border: 1px solid var(--color-border-primary);
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
      background: var(--color-border-secondary);
    }

    .name {
      color: var(--color-text-title);
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
      background: var(--color-border-secondary);
      color: var(--color-primary);
      font-size: 12px;
      line-height: 24px;
      text-align: center;
      &.orgRoleIcon {
        background-color: var(--color-warning);
        color: var(--color-white);
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
        background: var(--color-border-secondary);
      }
    }
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  .conditionDropdown {
    width: 112px;
    .ming.Menu {
      width: 100% !important;
    }
  }
  .ipTextarea {
    width: 60% !important;
    min-width: 500px;
  }
  .deviceDropdown {
    width: 336px;
    .ming.Menu {
      width: 100% !important;
    }
  }
  .accessTypeRadioGroup {
    .Radio-box {
      margin-right: 8px !important ;
    }
    .Radio {
      margin-right: 26px !important;
    }
  }
`;

const Footer = styled.div`
  height: 66px;
  padding: 15px 0;
  background-color: var(--color-background-primary);
  .saveBtn,
  .delBtn {
    height: 36px;
    line-height: 36px;
    padding: 0 30px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition:
      color ease-in 0.2s,
      border-color ease-in 0.2s,
      background-color ease-in 0;
  }

  .saveBtn {
    margin-right: 20px;
    background: var(--color-primary);
    color: var(--color-white);
    &:hover {
      background: var(--color-link-hover);
    }
    &.disabled {
      color: var(--color-white);
      background: var(--color-primary-transparent);
      cursor: not-allowed;
      &:hover {
        background: var(--color-primary-transparent);
      }
    }
  }
  .delBtn {
    border: 1px solid var(--color-border-secondary);
    &:hover {
      border: 1px solid var(--color-border-tertiary);
    }
    &.disabled {
      color: var(--color-border-secondary);
      cursor: not-allowed;
      &:hover {
        border: 1px solid var(--color-border-secondary);
      }
    }
  }
`;

export default class LimitFileDownloadSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMoreActionSelf: false,
      attachmentSettingInfo: props.attachmentSettingInfo || {},
      initialAttachmentSettingInfo: props.attachmentSettingInfo || {},
      ipContent: _.get(props, 'attachmentSettingInfo.ipList', []).join(','),
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
    const { attachmentSettingInfo } = this.state;
    const { whiteList = [] } = attachmentSettingInfo;
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

    this.setState({ attachmentSettingInfo: { ...attachmentSettingInfo, whiteList: whiteList.concat(addData) } });
  };

  handleSave = () => {
    const { projectId } = this.props;
    const { attachmentSettingInfo, initialAttachmentSettingInfo, ipContent } = this.state;
    const { whiteList = [], limitType, useType, modelType, ipList } = attachmentSettingInfo;

    if (_.isEqual(attachmentSettingInfo, initialAttachmentSettingInfo)) return;

    if (modelType === 1 && !_.trim(ipContent)) {
      alert(_l('请输入IP地址'), 2);
      return;
    }

    if (
      modelType === 1 &&
      _.find(
        ipList,
        item =>
          !/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)(\/([0-9]|[12]\d|3[0-2]))?$/.test(item),
      )
    ) {
      alert(_l('IP地址格式不正确'), 2);
      return;
    }

    const requestArr =
      (!_.isEqual(limitType, initialAttachmentSettingInfo.limitType) ||
        !_.isEqual(useType, initialAttachmentSettingInfo.useType) ||
        !_.isEqual(modelType, initialAttachmentSettingInfo.modelType) ||
        !_.isEqual(ipList, initialAttachmentSettingInfo.ipList)) &&
      !_.isEqual(whiteList, initialAttachmentSettingInfo.whiteList)
        ? [
            dataLimitAjax.editAttachmentWhiteList({ projectId, whiteList }),
            dataLimitAjax.editAttachmentSetting({ projectId, status: 1, limitType, useType, modelType, ipList }),
          ]
        : !_.isEqual(whiteList, initialAttachmentSettingInfo.whiteList)
          ? [dataLimitAjax.editAttachmentWhiteList({ projectId, whiteList })]
          : [dataLimitAjax.editAttachmentSetting({ projectId, status: 1, limitType, useType, modelType, ipList })];

    Promise.all(requestArr).then(resArr => {
      if (resArr.every(v => v === true)) {
        alert(_l('保存成功'));
        this.setState({ initialAttachmentSettingInfo: { ...attachmentSettingInfo, ipList } });
        this.props.updateSettingData({ ...attachmentSettingInfo, ipList });
      }
    });
  };

  renderContent = () => {
    const { projectId } = this.props;
    const { attachmentSettingInfo, showMoreActionSelf } = this.state;
    const { whiteList = [] } = attachmentSettingInfo;

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
                      attachmentSettingInfo: {
                        ...attachmentSettingInfo,
                        whiteList: whiteList.filter(v => item.id !== v.id),
                      },
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
                    projectId={projectId}
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
          className="colorPrimary Font13 Hand mLeft15 Relative"
          onClick={() => this.setState({ showMoreActionSelf: true })}
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
    const { attachmentSettingInfo, initialAttachmentSettingInfo, ipContent } = this.state;
    const { limitType, modelType, useType } = attachmentSettingInfo;
    const disabled = _.isEqual(attachmentSettingInfo, initialAttachmentSettingInfo);

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
            <div className="Font15 bold mBottom12">{_l('限制下载的访问条件')}</div>
            <div className="textSecondary mBottom20">{_l('符合条件的访问将无法下载附件')}</div>
            <RadioGroup
              size="middle"
              className="accessTypeRadioGroup"
              checkedValue={modelType}
              data={[
                { text: 'IP', value: 1 },
                { text: _l('设备类型'), value: 0 },
              ]}
              onChange={value =>
                this.setState({
                  attachmentSettingInfo: {
                    ipContent: '',
                    ipList: [],
                    limitType: 0,
                    ...attachmentSettingInfo,
                    modelType: value,
                  },
                })
              }
            ></RadioGroup>
            <div>
              <Dropdown
                className="conditionDropdown mTop16 mBottom16"
                data={LIMIT_FILE_DOWNLOAD_USE_TYPE_ENUM}
                border
                value={useType}
                onChange={value =>
                  this.setState({ attachmentSettingInfo: { ...attachmentSettingInfo, useType: value } })
                }
              />
            </div>

            {modelType === 1 ? (
              <Fragment>
                <div className="mBottom12">
                  <span className="textSecondary TxtMiddle">{_l('仅支持IPv4，可输入IP地址或CIDR格式的IP地址段')}</span>
                  <Tooltip
                    title={
                      <Fragment>
                        <div>{_l('单个 IP： 如 192.168.1.1')}</div>
                        <div>{_l('CIDR 网段： 如 10.0.0.0/24')}</div>
                        <div>{_l('注： 输入多个地址时，请使用英文逗号“,”分隔，最多添加50个地址。')}</div>
                      </Fragment>
                    }
                  >
                    <Icon icon="info_outline" className=" mLeft5 pointer Font16 textTertiary TxtMiddle" />
                  </Tooltip>
                </div>
                <Textarea
                  className="ipTextarea mBottom24"
                  placeholder={_l('输入多个地址时，请使用英文逗号“,”分割')}
                  value={ipContent}
                  minHeight={80}
                  maxHeight={200}
                  onChange={value => {
                    const temp = value.trim().split(',');
                    if (temp.length > 50) {
                      alert(_l('最多添加50个地址'), 3);
                      return;
                    }
                    this.setState({
                      ipContent: value,
                      attachmentSettingInfo: { ...attachmentSettingInfo, ipList: temp },
                    });
                  }}
                />
              </Fragment>
            ) : (
              <Dropdown
                className="deviceDropdown mBottom30"
                data={[
                  { text: _l('所有设备'), value: 0 },
                  { text: _l('PC端'), value: 2 },
                  { text: _l('移动端'), value: 1 },
                ]}
                border
                value={limitType}
                onChange={value =>
                  this.setState({ attachmentSettingInfo: { ...attachmentSettingInfo, limitType: value } })
                }
              />
            )}
            <div className="Font15 bold">{_l('白名单')}</div>
            <div className="textTertiary Font12 mBottom20">{_l('允许以下成员下载，不受「限制方式」的管控')}</div>
            {this.renderContent()}
          </Content>
          <Footer className="flexRow">
            <div className={cx('saveBtn', { disabled })} onClick={this.handleSave}>
              {_l('保存')}
            </div>
            <div
              className={cx('delBtn', { disabled })}
              onClick={() => this.setState({ attachmentSettingInfo: initialAttachmentSettingInfo })}
            >
              {_l('取消')}
            </div>
          </Footer>
        </div>
      </div>
    );
  }
}

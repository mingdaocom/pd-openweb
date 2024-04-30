import React, { useState, useEffect, Fragment } from 'react';
import { Modal, Button, WingBlank } from 'antd-mobile';
import { Icon } from 'ming-ui';
import delegationApi from 'src/pages/workflow/api/delegation';
import SelectUser from 'mobile/components/SelectUser';
import MobileDatePicker from 'src/ming-ui/components/MobileDatePicker';
import moment from 'moment';
import styled from 'styled-components';
import cx from 'classnames';

const ModalWrap = styled(Modal)`
  height: 95%;
  overflow: hidden;
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;
  &.full {
    height: 100%;
    border-top-right-radius: 0;
    border-top-left-radius: 0;
  }
  .description {
    font-size: 13px;
    color: #9e9e9e;
    padding: 22px 16px;
  }
  .formInfo {
    padding: 0 16px;
    .formItem {
      .label {
        font-size: 14px;
        color: #333;
        font-weight: 600;
      }
    }
    .requied {
      position: absolute;
      left: -10px;
      top: 3px;
      color: #ff7272;
      font-size: 13px;
      font-weight: bold;
    }
    .organization {
      height: 36px;
      padding: 0 10px;
      border: 1px solid #eaeaea;
    }
    .client {
      margin: 15px 0 24px 0;
    }
    .userItemWrapper {
      display: flex;
      height: 26px;
      align-items: center;
      margin-right: 10px;
      overflow: hidden;
      max-width: calc(100% - 26px);
      .circle {
        z-index: 2;
      }
      .fullName {
        height: 22px;
        line-height: 22px;
        background: #f7f7f7;
        border-top-right-radius: 22px;
        border-bottom-right-radius: 22px;
        padding-left: 20px !important;
        margin-left: -16px;
      }
    }
    .addUserBtn {
      width: 26px;
      height: 26px;
      line-height: 26px;
      border: 1px solid #ddd;
      border-radius: 50%;
      display: inline-flex;
      vertical-align: top;
      align-items: center;
      justify-content: center;
    }
  }
  .actionButtons {
    padding: 7px 0;
    .am-button {
      height: 36px;
      line-height: 36px;
      border-radius: 18px;
      border: 1px solid #ddd;
    }
    .am-button-primary {
      border: 1px solid #2196f3;
      background-color: #2196f3;
      &.am-button-disabled {
        opacity: 0.9;
      }
    }
    .am-button-active::before,
    .am-button::before {
      border: none;
    }
  }
  &.projectListWrap {
    height: 280px;
    .am-modal-body {
      text-align: left;
      padding: 16px 16px 0;
    }
    .header {
      line-height: 24px;
      margin-bottom: 10px;
      .closeIcon {
        width: 24px;
        height: 24px;
        text-align: center;
        border-radius: 50%;
        background-color: #e6e6e6;
        .icon {
          line-height: 24px;
        }
      }
    }
    .projectItem {
      height: 50px;
      line-height: 50px;
    }
  }
`;

export default function DelegationConfigModal(props) {
  const {
    configVisible,
    onCancel = () => {},
    getList = () => {},
    entrustData = {},
    setEntrustData,
    delegationList = [],
  } = props;
  const projectList = md.global.Account.projects;
  const existCompanyIds = delegationList ? delegationList.map(item => item.companyId) : [];
  const isEdit = !_.isEmpty(entrustData);
  const currentProjectId = isEdit
    ? entrustData.companyId
    : !_.includes(existCompanyIds, localStorage.getItem('currentProjectId'))
    ? localStorage.getItem('currentProjectId')
    : projectList.find(it => !_.includes(existCompanyIds, it.projectId)).projectId;
  const currentProject = _.find(projectList, it => it.projectId == currentProjectId);
  const [orgInfo, setOrgInfo] = useState(!_.isEmpty(currentProject) ? currentProject : projectList[0]);
  const [selectUserVisible, setSelectUserVisible] = useState(false);
  const [user, setUser] = useState(isEdit ? { ...entrustData.trustee, fullname: entrustData.trustee.fullName } : {});
  const [startDateVisible, setStartDateVisible] = useState(false);
  const [endDateVisible, setEndDateVisible] = useState(false);
  const [dateInfo, setDateInfo] = useState(
    isEdit
      ? {
          startDate: entrustData.startDate
            ? new Date(moment(entrustData.startDate).format('YYYY-MM-DD HH:mm'))
            : entrustData.startDate,
          endDate: new Date(moment(entrustData.endDate).format('YYYY-MM-DD HH:mm')),
        }
      : { startDate: '', endDate: '' },
  );
  const [projectListVisible, setProjectListVisible] = useState(false);

  const formatDate = date => {
    if (!date) return;
    return moment(date).format('YYYY-MM-DD HH:mm');
  };

  const onSubmit = () => {
    const params = {
      companyId: orgInfo.projectId,
      startDate: dateInfo.startDate ? moment(dateInfo.startDate).format('YYYY-MM-DD HH:mm:ss') : '',
      endDate: moment(dateInfo.endDate).format('YYYY-MM-DD HH:mm:ss'),
      trustee: user.accountId,
    };
    if (moment(dateInfo.endDate).diff(moment(dateInfo.startDate), 'minutes') <= 0) {
      alert(_l('委托结束时间应大于开始时间'), 2);
      return;
    }
    if (isEdit) {
      delegationApi.update({ ...params, id: entrustData.id, status: entrustData.status }).then(res => {
        if (res) {
          onCancel();
          getList();
          _.isFunction(setEntrustData) && setEntrustData({});
          alert(_l('更新委托成功'));
        }
      });
      return;
    }
    delegationApi.add(params).then(res => {
      if (res) {
        onCancel();
        getList();
        setOrgInfo(!_.isEmpty(currentProject) ? currentProject : projectList[0]);
        setDateInfo({ startDate: '', endDate: '' });
        setUser({});
        alert(_l('添加委托成功'));
      }
    });
  };

  if (!orgInfo) return null;

  const disabled = !orgInfo.projectId || !user.accountId || !dateInfo.endDate;

  return (
    <ModalWrap
      popup
      animationType="slide-up"
      className="mobileDelegationCardList full"
      onClose={onCancel}
      visible={configVisible}
    >
      <div className="flexColumn h100 TxtLeft Font13">
        <div className="description">{_l('发起委托后，您负责的审批、填写事项将转交给被委托人')}</div>
        <div className="formInfo flex">
          <div className="formItem ">
            <div className="label Relative">
              <span className="requied">*</span>
              {_l('组织')}
            </div>
            <div
              className="formCon organization flexRow alignItemsCenter mBottom24 mTop10"
              onClick={() => setProjectListVisible(true)}
            >
              <div className="flex ellipsis Gray">{orgInfo.companyName || ''}</div>
              <Icon icon="arrow-right-border" className="Gray_9d" />
            </div>
          </div>
          <div className="formItem">
            <div className="label Relative">
              <span className="requied">*</span>
              {_l('委托给')}
            </div>
            <div className="formCon flexRow client">
              {!_.isEmpty(user) && (
                <div className="userItemWrapper">
                  <div className="pointer circle">
                    <img
                      style={{ backgroundColor: '#f5f5f5', borderRadius: '50%', width: '22px', height: '22px' }}
                      placeholder={`${md.global.FileStoreConfig.pictureHost.replace(/\/$/, '')}/UserAvatar/default.gif`}
                      className="circle"
                      src={
                        user.avatar
                          ? user.avatar.indexOf('?') > 0
                            ? user.avatar.replace(
                                /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
                                'imageView2/2/w/100/h/100/q/90',
                              )
                            : `${user.avatar}?imageView2/2/w/100/h/100/q/90`
                          : ''
                      }
                    />
                  </div>
                  <div className="Gray Font13 pRight10 pTop1 ellipsis fullName">{user.fullname}</div>
                </div>
              )}
              <div className="addUserBtn" onClick={() => setSelectUserVisible(true)}>
                <Icon icon={!_.isEmpty(user) ? 'swap_horiz' : 'plus'} className="Font14" />
              </div>
            </div>
          </div>
          <div className="formItem">
            <div className="label mBottom16">{_l('委托时间')}</div>
            <div className="flexRow Gray Font13">
              <div className="flex mRight5">
                <div>{_l('开始')}</div>
                <div
                  className="formCon organization flexRow alignItemsCenter mTop8"
                  onClick={() => {
                    setStartDateVisible(true);
                  }}
                >
                  <div className="flex ellipsis Gray_bd">
                    {formatDate(dateInfo.startDate) ? (
                      <span className="Gray">{formatDate(dateInfo.startDate)}</span>
                    ) : (
                      _l('此刻')
                    )}
                  </div>
                  <Icon icon="arrow-right-border" className="Gray_9d" />
                </div>
                {startDateVisible && (
                  <MobileDatePicker
                    customHeader={_l('开始时间')}
                    precision="minite"
                    isOpen={startDateVisible}
                    value={dateInfo.startDate ? dateInfo.startDate : new Date()}
                    min={new Date()}
                    onSelect={date => {
                      setDateInfo({ ...dateInfo, startDate: date });
                      setStartDateVisible(false);
                    }}
                    onCancel={() => {
                      setDateInfo({ ...dateInfo, startDate: '' });
                      setStartDateVisible(false);
                    }}
                  />
                )}
              </div>
              <div className="flex mLeft5">
                <div className="Relative">
                  <span className="requied">*</span>
                  {_l('结束')}
                </div>
                <div
                  className="formCon organization flexRow alignItemsCenter mTop8"
                  onClick={() => {
                    setEndDateVisible(true);
                  }}
                >
                  <div className="flex ellipsis Gray_bd">
                    {formatDate(dateInfo.endDate) ? (
                      <span className="Gray">{formatDate(dateInfo.endDate)}</span>
                    ) : (
                      _l('请选择')
                    )}
                  </div>
                  <Icon icon="arrow-right-border" className="Gray_9d" />
                </div>
                {endDateVisible && (
                  <MobileDatePicker
                    customHeader={_l('结束时间')}
                    precision="minite"
                    isOpen={endDateVisible}
                    value={dateInfo.endDate || new Date()}
                    min={dateInfo.startDate || new Date()}
                    onSelect={date => {
                      setDateInfo({ ...dateInfo, endDate: date });
                      setEndDateVisible(false);
                    }}
                    onCancel={() => {
                      setDateInfo({ ...dateInfo, endDate: '' });
                      setEndDateVisible(false);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="actionButtons flexRow">
          <WingBlank className="flex" size="sm">
            <Button className="Font13 bold Gray_75 btn" onClick={onCancel}>
              {_l('取消')}
            </Button>
          </WingBlank>
          <WingBlank className="flex" size="sm">
            <Button className="Font13 bold btn" type="primary" disabled={disabled} onClick={onSubmit}>
              {_l('确定')}
            </Button>
          </WingBlank>
        </div>
      </div>
      {selectUserVisible && (
        <SelectUser
          visible={selectUserVisible}
          filterAccountIds={
            user.accountId ? [md.global.Account.accountId].concat(user.accountId) : [md.global.Account.accountId]
          }
          type="user"
          projectId={orgInfo.projectId}
          onlyOne={true}
          onClose={() => setSelectUserVisible(false)}
          onSave={user => {
            setUser(_.get(user, [0]) || {});
          }}
        />
      )}
      {projectListVisible && (
        <ModalWrap
          popup
          animationType="slide-up"
          visible={projectListVisible}
          style={{ height: 280 }}
          className="projectListWrap"
          onClose={() => setProjectListVisible(false)}
        >
          <div className="flexRow header">
            <div className="Font13 Gray_9e flex">{_l('选择组织')}</div>
            <div
              className="closeIcon"
              onClick={() => {
                setProjectListVisible(false);
              }}
            >
              <Icon icon="close" className="Font17 Gray_9e bold" />
            </div>
          </div>

          {projectList.map(it => {
            return (
              <div
                className="flexRow projectItem"
                onClick={() => {
                  if (_.includes(existCompanyIds, it.projectId)) return;
                  if (it.projectId !== orgInfo.projectId) {
                    setUser({});
                  }
                  setOrgInfo(it);
                  setProjectListVisible(false);
                }}
              >
                <div className={cx('flex Gray Font15 Bold', { Gray_9e: _.includes(existCompanyIds, it.projectId) })}>
                  {it.companyName}
                </div>
                {it.projectId === orgInfo.projectId && (
                  <div>
                    <Icon icon="done" className="ThemeColor Font20 Bold" />
                  </div>
                )}
              </div>
            );
          })}
        </ModalWrap>
      )}
    </ModalWrap>
  );
}

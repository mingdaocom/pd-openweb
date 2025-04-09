import React, { useState, useEffect, Fragment } from 'react';
import { Popup, Button } from 'antd-mobile';
import { Icon, Radio } from 'ming-ui';
import delegationApi from 'src/pages/workflow/api/delegation';
import SelectUser from 'mobile/components/SelectUser';
import MobileDatePicker from 'src/ming-ui/components/MobileDatePicker';
import SelectAppDialog from 'mobile/components/SelectAppDialog/index.js';
import moment from 'moment';
import styled from 'styled-components';
import cx from 'classnames';

const ModalWrap = styled(Popup)`
  .description {
    font-size: 13px;
    color: #9e9e9e;
    padding: 22px 16px;
  }
  .formInfo {
    padding: 0 16px;
    overflow-x: hidden;
    overflow-y: auto;
    .formItem {
      .label {
        font-size: 14px;
        color: #151515;
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
    .organization,
    .emptyAppWrap {
      height: 36px;
      padding: 0 10px;
      border: 1px solid #eaeaea;
    }
    .selectedAppsWrap {
      flex-wrap: wrap;
      border: 1px solid #eaeaea;
      padding: 0 10px;
    }
    .appTags {
      height: 26px;
      border-radius: 26px;
      background: #f7f7f7 !important;
      display: inline-flex;
      align-items: center;
      margin: 4px 8px 4px 0;
      padding: 0 10px;
      vertical-align: top;
      position: relative;
      max-width: 100%;
      .tagDel {
        cursor: pointer;
        color: #9e9e9e;
        position: absolute;
        top: -5px;
        right: -5px;
        transition: all 0.2s ease-out;
      }
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
    .organization .addUserBtn {
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
  }
  &.projectListModal {
    height: 280px;
    .adm-popup-body {
      padding: 16px 0px 0;
    }
    .header {
      line-height: 24px;
      margin-bottom: 10px;
      padding: 0 16px;
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
    .projectListWrap {
      height: calc(100% - 50px);
      overflow: auto;
      padding: 0 16px;
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
  const [selectedApps, setSelectedApps] = useState(
    entrustData.apks ? (entrustData.apks || []).map(item => ({ ...item, appId: item.id, appName: item.name })) : [],
  );
  const [showAppDialog, setShowAppDialog] = useState(false);
  const [scope, setScope] = useState(!entrustData.apks ? 1 : 2);

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
      apkIds: scope === 2 && !_.isEmpty(selectedApps) ? selectedApps.map(item => item.appId) : undefined,
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
  const date = new Date();
  const minYear = date.getFullYear();
  const minMouth = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const disabled = !orgInfo.projectId || !user.accountId || !dateInfo.endDate;

  return (
    <ModalWrap className="mobileDelegationCardList mobileModal full" onClose={onCancel} visible={configVisible}>
      <div className="flexColumn h100 TxtLeft Font13">
        <div className="formInfo flex">
          <div className="description">{_l('发起委托后，您负责的审批、填写事项将转交给被委托人')}</div>
          <div className="formItem ">
            <div className="label Relative">
              <span className="requied">*</span>
              {_l('组织')}
            </div>
            <div
              className="formCon organization flexRow alignItemsCenter mBottom24 mTop10"
              onClick={() => {
                setProjectListVisible(true);
                setSelectedApps([]);
              }}
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
          <div className="formItem mBottom24">
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
                    min={new Date(minYear, minMouth, day, hour, minute, second)}
                    onClose={() => {
                      setStartDateVisible(false);
                    }}
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
                    min={dateInfo.startDate || new Date(minYear, minMouth, day, hour, minute, second)}
                    onClose={() => {
                      setEndDateVisible(false);
                    }}
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
          <div className="formItem">
            <div className="label mBottom16">{_l('委托范围')}</div>
            {[
              { label: _l('所有工作流'), value: 1 },
              { label: _l('指定应用的工作流'), value: 2 },
            ].map(item => {
              return (
                <div key={item.value} className="mBottom15">
                  <Radio
                    text={item.label}
                    checked={item.value === scope}
                    onClick={() => {
                      setScope(item.value);
                      if (item.value === 2) {
                        setShowAppDialog(true);
                      }
                    }}
                  />
                </div>
              );
            })}
            {scope === 2 && (
              <Fragment>
                {_.isEmpty(selectedApps) ? (
                  <div className="flexRow emptyAppWrap alignItemsCenter" onClick={() => setShowAppDialog(true)}>
                    <div className="Gray_bd flex">{_l('所有应用')}</div>
                    <Icon icon="arrow-right-border" className="Gray_9d" />
                  </div>
                ) : (
                  <div className="selectedAppsWrap flexRow">
                    <div className="flex pRight8 overflowHidden">
                      {selectedApps.map(item => {
                        return (
                          <div className="appTags">
                            <span className="ellipsis">{item.appName}</span>
                            <i
                              className="icon-minus-square Font16 tagDel"
                              onClick={() => setSelectedApps(selectedApps.filter(v => v.appId !== item.appId))}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="Gray_9d mTop7">
                      <Icon icon="arrow-right-border" onClick={() => setShowAppDialog(true)} />
                    </div>
                  </div>
                )}
              </Fragment>
            )}
          </div>
        </div>
        <div className="actionButtons flexRow">
          <Button className="flex mLeft6 mRight6 Font13 bold Gray_75 btn" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button
            className="flex mLeft6 mRight6 Font13 bold btn"
            color="primary"
            disabled={disabled}
            onClick={onSubmit}
          >
            {_l('确定')}
          </Button>
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
          visible={projectListVisible}
          className="projectListModal mobileModal minFull topRadius"
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

          <div className="projectListWrap">
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
                  <div className={cx('flex Gray Font15 Bold ellipsis', { Gray_9e: _.includes(existCompanyIds, it.projectId) })}>
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
          </div>
        </ModalWrap>
      )}

      {showAppDialog && (
        <SelectAppDialog
          visible={showAppDialog}
          projectId={orgInfo.projectId}
          selectedApps={selectedApps}
          ajaxFun="getMyApp"
          filterFun={l => {
            _.assign(l, { appId: l.id, appName: l.name });
            return !!l;
          }}
          onClose={() => setShowAppDialog(false)}
          onOk={selectedApps => setSelectedApps(selectedApps)}
        />
      )}
    </ModalWrap>
  );
}

import React, { useEffect, useState } from 'react';
import { DatePicker } from 'antd';
import en_US from 'antd/es/date-picker/locale/en_US';
import ja_JP from 'antd/es/date-picker/locale/ja_JP';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dropdown, Icon, Modal, Radio, ScrollView, SvgIcon, UserHead, UserName } from 'ming-ui';
import { dialogSelectApp, dialogSelectUser } from 'ming-ui/functions';
import delegationApi from 'src/pages/workflow/api/delegation';
import PointImg from 'src/pages/workflow/asset/point.png';
import { getCurrentProject } from 'src/utils/project';

const FormItem = styled.div`
  margin-top: 25px;
  color: #151515;
  font-size: 14px;
  .userItemWrapper {
    display: flex;
    align-items: center;
    margin-right: 10px;
    border-radius: 24px;
    background-color: #f7f7f7;
    max-width: calc(100% - 36px);
  }
  .entrustDateWrapper {
    display: flex;

    .dateItem {
      width: 288px;
    }
  }
  .trusteeAddButton {
    display: inline-flex;
    width: 26px;
    height: 26px;
    line-height: 26px;
    border: 1px solid #ddd;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    .addOrTransferIcon {
      color: #757575;
    }
    &:hover {
      border-color: #2196f3;
      .addOrTransferIcon {
        color: #2196f3;
      }
    }
  }
  .w50 {
    width: 50%;
  }
  &.selectUserWrap {
    justify-content: space-between;
    gap: 16px;
    overflow: hidden;
    .selectUserItem {
      width: calc(50% - 8px);
    }
    .pointBox {
      height: 5px;
      background: url(${PointImg}) no-repeat;
      background-size: contain;
    }
  }
`;

const AppListContainer = styled.div`
  width: 100%;
  border-radius: 3px;
  border: 1px solid #ddd;
  margin-top: 16px;
  padding-top: 8px;

  .noDataContent {
    height: 100px;
    line-height: 100px;
    color: #bdbdbd;
    text-align: center;
  }

  .appList {
    height: 268px;

    .dataItem {
      display: flex;
      height: 40px;
      line-height: 40px;
      padding: 0 20px;

      .name {
        flex: 1;
        min-width: 0;
        .appIcon {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 24px;
          min-width: 24px;
          height: 24px;
          line-height: 16px;
          border-radius: 4px;
          margin-right: 8px;
        }
      }
      .removeItem {
        color: #bdbdbd;
        cursor: pointer;
        &:hover {
          color: #2196f3;
        }
      }
    }
  }
`;

const ENTRUST_SCOPE = [
  { text: _l('所有工作流'), value: 1 },
  { text: _l('指定应用的工作流'), value: 2 },
];

export default function TodoEntrustModal(props) {
  const {
    type = 1,
    companyId,
    setTodoEntrustModalVisible,
    editEntrustData,
    defaultValue = {},
    onUpdate = () => {},
  } = props;
  const projectOptions = md.global.Account.projects.map(item => {
    return { text: item.companyName, value: item.projectId };
  });
  const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;

  const isEdit = !_.isEmpty(editEntrustData);
  const [formData, setFormData] = useState(
    isEdit
      ? { ...editEntrustData, scope: !editEntrustData.apks ? 1 : 2 }
      : { ...defaultValue, companyId: type === 2 ? companyId : (projectOptions[0] || {}).value, scope: 1 },
  );
  const [authApps, setAuthApps] = useState(
    (_.get(editEntrustData, 'apks') || []).map(app => ({
      ...app,
      appName: app.name,
      appId: app.appId || app.id,
    })),
  );

  const updateDataSource = options => {
    setFormData(Object.assign({}, formData, options));
  };

  const onSelectApp = () => {
    if (type === 2 && _.isEmpty(formData.principal)) {
      alert(_l('请先选择委托人'), 3);
      return;
    }

    dialogSelectApp({
      projectId: formData.companyId,
      title: _l('添加应用'),
      ajaxFun: type === 1 ? 'getMyApp' : 'getUserApp',
      ajaxParam:
        type === 2
          ? {
              userId: formData.principal.accountId,
              projectId: formData.companyId,
            }
          : { projectId: formData.companyId },
      filterFun: l => {
        _.assign(l, { appId: l.id, appName: l.name, ctime: l.createTime, createAccountInfo: l.owner });
        return !!l;
      },
      onOk: selectedApps => {
        const newAuthApps = _.uniqBy(authApps.concat(selectedApps), 'appId');
        setAuthApps(newAuthApps);
      },
    });
  };

  const disabledDateTime = date => {
    const hours = moment().hours();
    const minutes = moment().minutes();
    if (!date || moment(date).isSame(moment(), 'd')) {
      return {
        disabledHours: () => Array.from(Array(hours), (_, k) => k),
        disabledMinutes: () =>
          !date || moment(date).isSame(moment(), 'h') ? Array.from(Array(minutes), (_, k) => k) : [],
      };
    }
    return {
      disabledHours: () => [],
      disabledMinutes: () => [],
    };
  };

  const onAddOrChangeMember = (userType = 'trustee') => {
    const fromAdmin = type === 2;

    dialogSelectUser({
      fromAdmin: fromAdmin,
      SelectUserSettings: {
        filterAccountIds: userType === 'trustee' && type === 1 ? [md.global.Account.accountId] : [],
        selectedAccountIds: (formData[userType] || {}).accountId ? [(formData[userType] || {}).accountId] : [],
        projectId: formData.companyId,
        filterAll: true,
        filterFriend: true,
        filterOtherProject: true,
        unique: true,
        callback: users => updateDataSource({ [userType]: users[0] }),
      },
    });
  };

  const getProjectOptions = () => {
    if (formData.companyId && !_.find(projectOptions, l => l.value === formData.companyId)) {
      const currentProject = getCurrentProject(formData.companyId, true);

      return currentProject.projectStatus === 2
        ? projectOptions.concat({ text: currentProject.companyName, value: currentProject.projectId })
        : projectOptions;
    }

    return projectOptions;
  };

  const onSubmit = () => {
    const params = {
      companyId: formData.companyId,
      startDate: formData.startDate ? moment(formData.startDate).format('YYYY-MM-DD HH:mm:ss') : '',
      endDate: moment(formData.endDate).format('YYYY-MM-DD HH:mm:ss'),
      trustee: formData.trustee.accountId,
      apkIds: formData.scope === 1 ? undefined : authApps.map(app => app.appId),
      principal: type === 2 ? formData.principal.accountId : undefined,
    };

    if (moment(formData.endDate).diff(moment(formData.startDate), 'minutes') <= 0) {
      alert(_l('委托结束时间应大于开始时间'), 2);
      return;
    }

    if (type == 2 && formData.trustee.accountId === formData.principal.accountId) {
      alert(_l('委托人、受托人不能相同'), 2);
      return;
    }

    delegationApi[isEdit ? 'update' : 'add'](
      isEdit ? { ...params, id: editEntrustData.id, status: editEntrustData.status } : params,
    ).then(res => {
      if (res) {
        setTodoEntrustModalVisible(false);
        onUpdate();
        alert(isEdit ? _l('更新委托成功') : _l('添加委托成功'));
      }
    });
  };

  const renderAppList = () => {
    return (
      <AppListContainer>
        {!authApps.length ? (
          <div className="noDataContent">{_l('没有授权应用')}</div>
        ) : (
          <ScrollView className="appList">
            {authApps.map((appItem, i) => {
              return (
                <div key={i} className="dataItem">
                  <div className="name">
                    <div className="flexRow alignItemsCenter">
                      <div className="appIcon" style={{ background: appItem.iconColor }}>
                        <SvgIcon url={appItem.iconUrl} fill="#fff" size={16} />
                      </div>
                      <span className="overflow_ellipsis mRight10" title={appItem.appName}>
                        {appItem.appName}
                      </span>
                    </div>
                  </div>
                  <div
                    className="removeItem"
                    onClick={() => setAuthApps(authApps.filter(app => app.appId !== appItem.appId))}
                  >
                    {_l('移除')}
                  </div>
                </div>
              );
            })}
          </ScrollView>
        )}
      </AppListContainer>
    );
  };

  const renderSelectUser = (userType = 'trustee') => {
    const isTrustee = userType === 'trustee';

    return (
      <div className={cx('w100', { selectUserItem: type === 2 })}>
        <div className="flexRow valignWrapper">
          <span className="bold">{isTrustee ? _l('受托人') : _l('委托人')}</span>
          <span className="Red bold mLeft4">*</span>
          {!isTrustee && <div className="pointBox mLeft17 flex"></div>}
        </div>
        <div className="flexRow mTop10 w100">
          {formData[userType] && (
            <div className="userItemWrapper">
              <UserHead
                className="circle"
                user={{
                  userHead: formData[userType].avatar,
                  accountId: formData[userType].accountId,
                }}
                size={26}
              />
              <UserName
                className="Gray Font13 pLeft5 pRight10 pTop2 overflow_ellipsis userName"
                user={{
                  userName: formData[userType].fullName || formData[userType].fullname,
                  accountId: formData[userType].accountId,
                }}
              />
            </div>
          )}
          {(isTrustee || !isEdit) && (
            <div className="trusteeAddButton" onClick={() => onAddOrChangeMember(userType)}>
              <Icon icon={formData[userType] ? 'swap_horiz' : 'plus'} className="Font16 addOrTransferIcon" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal
      visible
      width={640}
      bodyStyle={{ padding: '0 24px 16px' }}
      okDisabled={
        !formData.trustee ||
        !formData.companyId ||
        !formData.endDate ||
        (type === 2 && !formData.principal) ||
        (formData.scope === 2 && !authApps.length)
      }
      onOk={onSubmit}
      onCancel={() => setTodoEntrustModalVisible(false)}
      title={
        <React.Fragment>
          <div className="bold">{_l('待办委托')}</div>
          <div className="Font13 Gray_75">{_l('创建后，委托人在委托范围中负责的审批、填写事项将转交给受托人')}</div>
        </React.Fragment>
      }
    >
      {type === 1 && (
        <FormItem>
          <span className="bold">{_l('组织')}</span>
          <span className="Red bold mLeft4">*</span>
          <div>
            <Dropdown
              className="mTop10 w100 Font13"
              isAppendToBody
              border
              value={formData.companyId}
              data={getProjectOptions()}
              onChange={companyId => {
                updateDataSource({ companyId, trustee: '' });
                setAuthApps([]);
              }}
            />
          </div>
        </FormItem>
      )}

      <FormItem className="flexRow selectUserWrap">
        {type === 2 && renderSelectUser('principal')}
        {renderSelectUser()}
      </FormItem>

      <FormItem>
        <span className="bold">{_l('委托时间')}</span>
        <div className="entrustDateWrapper">
          <div className="mTop10 mRight16 dateItem">
            <div className="Font13 mBottom5">{_l('开始')}</div>
            <DatePicker
              style={{ width: '100%', borderRadius: '3px' }}
              placeholder={_l('此刻')}
              showTime
              disabledDate={date => moment().isAfter(date)}
              disabledTime={disabledDateTime}
              format="YYYY-MM-DD HH:mm"
              locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN}
              defaultValue={isEdit ? moment(formData.startDate || formData.createDate) : formData.startDate}
              allowClear={true}
              onChange={startDate => updateDataSource({ startDate })}
            />
          </div>
          <div className="mTop10 dateItem">
            <div className="Font13 mBottom5">
              {_l('结束')}
              <span className="Red bold mLeft4">*</span>
            </div>
            <DatePicker
              style={{ width: '100%', borderRadius: '3px' }}
              placeholder={_l('请选择日期')}
              showTime
              showNow={false}
              disabledDate={date => moment().isAfter(date)}
              disabledTime={disabledDateTime}
              format="YYYY-MM-DD HH:mm"
              defaultValue={formData.endDate}
              allowClear={true}
              locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN}
              onChange={endDate => updateDataSource({ endDate })}
            />
          </div>
        </div>
      </FormItem>

      <FormItem>
        <span className="bold">{_l('委托范围')}</span>
        <div className="flexRow alignItemsCenter mTop16">
          {ENTRUST_SCOPE.map(item => {
            return (
              <Radio
                text={item.text}
                checked={item.value === formData.scope}
                onClick={() => {
                  updateDataSource({ scope: item.value });
                  item.value === 2 && onSelectApp();
                }}
              />
            );
          })}
          <div className="flex" />
          {formData.scope === 2 && (
            <div className="ThemeColor Hand" onClick={onSelectApp}>
              <Icon icon="add" />
              <span className="bold mLeft4">{_l('添加应用')}</span>
            </div>
          )}
        </div>
        {formData.scope === 2 && renderAppList()}
      </FormItem>
    </Modal>
  );
}

import React from 'react';
import _ from 'lodash';
import { Avatar, UserHead } from 'ming-ui';
import {
  getAccountName,
  getLoginAccount,
  getLoginPlatformName,
  getOperationObjectAccount,
  getOperationObjectName,
  getOperatorAccount,
  LOG_TABS,
} from './LoginInfo.util';

function AccountCell({ account = {}, fallback, projectId, appId }) {
  const accountInfo = account || {};
  const name = getAccountName(accountInfo, fallback);

  if (!name) {
    return null;
  }

  return (
    <div className="accountCell">
      {accountInfo.accountId ? (
        <UserHead
          appId={accountInfo.appId || appId}
          projectId={accountInfo.projectId || projectId}
          size={24}
          user={{
            userHead: accountInfo.avatar,
            accountId: accountInfo.accountId,
          }}
          className="roleAvatar"
        />
      ) : (
        <Avatar size={24} src={accountInfo.avatar} className="roleAvatar" />
      )}
      <span className="accountName">{name}</span>
    </div>
  );
}

function getLoginColumns(appId) {
  return [
    {
      id: 'accountId',
      width: 170,
      name: _l('用户'),
      render: (control, data = {}) => {
        return <AccountCell account={getLoginAccount(data)} fallback={_.get(data, 'log.fullname')} appId={appId} />;
      },
    },
    {
      id: 'mobilePhone',
      width: 150,
      name: _l('手机号'),
      render: (control, data = {}) => {
        return _.get(data, 'log.mobilePhone');
      },
    },
    {
      id: 'email',
      width: 150,
      name: _l('邮箱'),
      render: (control, data = {}) => {
        return _.get(data, 'log.email');
      },
    },
    {
      id: 'userAgent',
      width: 170,
      name: _l('终端平台'),
      render: (control, data = {}) => {
        return getLoginPlatformName(data);
      },
    },
    {
      id: 'ip',
      width: 150,
      name: _l('IP地址'),
      render: (control, data = {}) => {
        return _.get(data, 'log.ip');
      },
    },
    {
      id: 'date',
      name: _l('登录时间'),
      width: 170,
      render: (control, data = {}) => {
        return data.date;
      },
    },
  ];
}

function getManageColumns(appId) {
  return [
    {
      id: 'operator',
      width: 170,
      name: _l('操作人'),
      render: (control, data = {}) => {
        const operatorAccount = getOperatorAccount(data);

        return <AccountCell account={operatorAccount} fallback="-" projectId={data.projectId} appId={appId} />;
      },
    },
    {
      id: 'operationObject',
      width: 180,
      name: _l('操作对象'),
      render: (control, data = {}) => {
        const operationObjectAccount = getOperationObjectAccount(data);
        const operationObjectName = getOperationObjectName(data);

        return operationObjectAccount ? (
          <AccountCell
            account={operationObjectAccount}
            fallback={operationObjectName}
            projectId={data.projectId}
            appId={appId}
          />
        ) : (
          <span className="operationObjectName">{operationObjectName}</span>
        );
      },
    },
    {
      id: 'operationType',
      width: 140,
      name: _l('操作类型'),
      render: (control, data = {}) => {
        return _.get(data, 'log.operationType');
      },
    },
    {
      id: 'operationContent',
      width: 360,
      name: _l('操作内容'),
      render: (control, data = {}) => {
        const operationContent = _.get(data, 'log.operationContent');

        return (
          <span className="operationContent wMax100 overflowHidden breakAll" title={operationContent}>
            {operationContent}
          </span>
        );
      },
    },
    {
      id: 'date',
      name: _l('操作时间'),
      width: 170,
      render: (control, data = {}) => {
        return data.date;
      },
    },
  ];
}

export function getLogColumns({ activeTab, appId }) {
  return activeTab === LOG_TABS.MANAGE ? getManageColumns(appId) : getLoginColumns(appId);
}

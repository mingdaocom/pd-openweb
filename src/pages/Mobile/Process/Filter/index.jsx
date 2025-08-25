import React, { useEffect, useState } from 'react';
import { Popup } from 'antd-mobile';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { getRequest } from 'src/utils/common';
import Date from './Date';
import OperationType from './OperationType';
import SelectAllAppProcess from './SelectAllAppProcess';
import SelectAppProcess from './SelectAppProcess';
import Status from './Status';
import Users from './Users';

const Wrap = styled.div`
  .header {
    padding: 10px 15px;
    justify-content: flex-end;
  }
  .body {
    padding: 0 15px;
    overflow: auto;
  }
  .close {
    font-weight: bold;
    padding: 5px;
    border-radius: 50%;
    background-color: #e6e6e6;
  }
  .footer {
    border-top: 1px solid #eaeaea;
    z-index: 0;
    background-color: #fff;
    .flex {
      padding: 10px;
    }
    .query {
      color: #fff;
      background-color: #1677ff;
    }
  }
`;

const width = document.documentElement.clientWidth - 60;

export default props => {
  const { tab, visible, query, todoListFilterParam, onClose, onQuery } = props;
  const [queryParam, onChangeQueryParam] = useState({});
  const currentProjectId = localStorage.getItem('currentProjectId');
  const projectId = currentProjectId === 'external' ? '' : currentProjectId;
  const isProcessed = ['completeDispose', 'completeMySponsor', 'already'].includes(tab);
  const requestAppId = getRequest().appId;

  useEffect(() => {
    if (_.isEmpty(query)) {
      onChangeQueryParam({});
    }
  }, [query]);

  const renderDate = () => {
    return <Date date={queryParam.date} onChange={data => onChangeQueryParam({ ...queryParam, date: data })} />;
  };

  const renderAccount = () => {
    return (
      <Users
        projectId={projectId}
        createAccount={queryParam.createAccount}
        onChange={data => onChangeQueryParam({ ...queryParam, createAccount: data })}
      />
    );
  };

  const renderSelectAppProcess = () => {
    return (
      <SelectAppProcess
        visible={visible}
        todoListFilterParam={todoListFilterParam}
        requestAppId={requestAppId}
        apkId={queryParam.apkId}
        processId={queryParam.processId}
        onChange={data => onChangeQueryParam({ ...queryParam, ...data })}
      />
    );
  };

  const renderSelectAllAppProcess = () => {
    return (
      <SelectAllAppProcess
        visible={visible}
        requestAppId={requestAppId}
        apkId={queryParam.apkId}
        processId={queryParam.processId}
        onChange={data => onChangeQueryParam({ ...queryParam, ...data })}
      />
    );
  };

  const renderOperationType = () => {
    return (
      <OperationType
        operationType={queryParam.operationType}
        onChange={data => onChangeQueryParam({ ...queryParam, operationType: data })}
      />
    );
  };

  const renderStatus = () => {
    return <Status status={queryParam.status} onChange={data => onChangeQueryParam({ ...queryParam, status: data })} />;
  };

  return (
    <Popup
      bodyStyle={{
        borderRadius: '14px 0 0 14px',
        overflow: 'hidden',
      }}
      position="right"
      visible={visible}
      onMaskClick={onClose}
      onClose={onClose}
    >
      <Wrap className="flexColumn h100" style={{ width }}>
        <div className="header flexRow valignWrapper">
          <Icon className="Gray_9e close" icon="close" onClick={onClose} />
        </div>
        <div className="body flex">
          {!['mySponsor', 'completeMySponsor'].includes(tab) && renderAccount()}
          {!isProcessed && renderSelectAppProcess()}
          {isProcessed && renderDate()}
          {['completeDispose'].includes(tab) && renderOperationType()}
          {['completeMySponsor'].includes(tab) && renderStatus()}
          {isProcessed && renderSelectAllAppProcess()}
        </div>
        <div className="footer flexRow valignWrapper">
          <div
            className="flex Font16 centerAlign"
            onClick={() => {
              onQuery({});
              onClose();
            }}
          >
            {_l('重置')}
          </div>
          <div
            className="flex Font16 centerAlign query"
            onClick={() => {
              onQuery(queryParam);
              onClose();
            }}
          >
            {_l('查询')}
          </div>
        </div>
      </Wrap>
    </Popup>
  );
};

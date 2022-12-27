import React, { Fragment, useState, useEffect } from 'react';
import { Icon, LoadDiv } from 'ming-ui';
import { Button, Table } from 'antd';
import styled from 'styled-components';
import copy from 'copy-to-clipboard';
import PrivateKeyDialog from './PrivateKeyDialog';
import privateGuideApi from 'src/api/privateGuide';
import { useClientRect } from '../common';
import moment from 'moment';
import _ from 'lodash';

const Wrap = styled.div`
  padding: 20px 25px;
  .card {
    padding: 20px;
    border-radius: 3px;
    box-shadow: 0px 1px 4px 1px rgba(0, 0, 0, 0.16);
  }
  .authorizationInfo, .versionsInfo {
    height: 174px;
    min-width: 0;
  }
  .authorizationInfo {
    flex: 2;
  }
  .versionsInfo {
    flex: 1;
    .label {
      width: 90px;
    }
  }
  .ant-table-thead th {
    color: #757575;
    background: #fff;
  }
  .updatePrivateKey {
    color: #4194F0;
    border-radius: 34px;
    padding: 9px 16px;
    background: #ECF4FD;
  }
`;

const columns = [
  {
    title: _l('更新密钥时间'),
    dataIndex: 'logTime',
    key: 'logTime'
  },
  {
    title: _l('密钥生效时间'),
    dataIndex: 'startDate',
    key: 'startDate',
    render: (_, data) => moment(data.startDate).format('YYYY-MM-DD')
  },
  {
    title: _l('密钥到期时间'),
    dataIndex: 'expirationDate',
    key: 'expirationDate',
    render: (_, data) => moment(data.expirationDate).format('YYYY-MM-DD')
  },
  {
    title: _l('升级服务到期时间'),
    dataIndex: 'upgradeExpirationDate',
    key: 'upgradeExpirationDate',
    render: (_, data) => moment(data.upgradeExpirationDate).format('YYYY-MM-DD')
  },
  {
    title: _l('内部用户配额'),
    dataIndex: 'internalUserNum',
    key: 'internalUserNum',
    render: (_, data) => data.internalUserNum.toLocaleString()
  },
  {
    title: _l('外部用户配额'),
    dataIndex: 'externalUserNum',
    key: 'externalUserNum',
    render: (_, data) => data.externalUserNum.toLocaleString()
  },
  {
    title: _l('操作人'),
    dataIndex: 'fullname',
    key: 'fullname',
    render: (_, data) => data.operater ? data.operater.fullname : '-'
  },
  {
    title: _l('操作'),
    dataIndex: 'operate',
    key: 'operate',
    render: () => {
      return <a className="viewOriginCode">{_l('查看')}</a>
    }
  }
];

const AuthorizationInfo = props => {
  const [loading, setLoading] = useState(true);
  const [platformLicenseInfo, setPlatformLicenseInfo] = useState({});

  const formatDate = (date) => {
    const year = moment(date).format('YYYY');
    const diff = moment(date).diff(moment(), 'd');
    if (year == 9999) {
      return <span style={{ color: '#4CAF50' }}>{_l('永久有效')}</span>;
    }
    if (diff < 0) {
      return <span style={{ color: '#F44336' }}>{_l('已到期')}</span>;
    }
    return _l('剩余%0天', diff);
  };

  useEffect(() => {
    privateGuideApi.getPlatformLicenseInfo().then(data => {
      setLoading(false);
      setPlatformLicenseInfo(data);
    });
  }, []);

  return (
    <div className="authorizationInfo card mRight20">
      <div className="Font15 bold mBottom25">{_l('授权信息')}</div>
      {loading ? (
        <LoadDiv />
      ) : (
        <div className="flexRow">
          <div className="flexColumn valignWrapper flex">
            <div className="Font14 Gray_9e mBottom10 pBottom2">{_l('密钥到期时间')}</div>
            <div className="Font17 mBottom10 bold">{formatDate(platformLicenseInfo.expirationDate)}</div>
            <div className="Font13 Gray_bd">{_l('%0到期', moment(platformLicenseInfo.expirationDate).format('YYYY年MM月DD日') )}</div>
          </div>
          <div className="flexColumn valignWrapper flex">
            <div className="Font14 Gray_9e mBottom10 pBottom2">{_l('升级服务到期时间')}</div>
            <div className="Font17 mBottom10 bold">{formatDate(platformLicenseInfo.upgradeExpirationDate)}</div>
            <div className="Font13 Gray_bd">{_l('%0到期', moment(platformLicenseInfo.upgradeExpirationDate).format('YYYY年MM月DD日') )}</div>
          </div>
          <div className="flexColumn valignWrapper flex">
            <div className="Font14 Gray_9e mBottom10 pBottom2">{_l('内部用户配额')}</div>
            <div className="Font17 mBottom10 bold">{_l('%0 人', (platformLicenseInfo.internalUserNum || 0).toLocaleString())}</div>
            <div className="Font13 Gray_bd">{_l('已使用 %0 人', (platformLicenseInfo.internalUsedUserNum || 0).toLocaleString() )}</div>
          </div>
          <div className="flexColumn valignWrapper flex">
            <div className="Font14 Gray_9e mBottom10 pBottom2">{_l('外部用户配额')}</div>
            <div className="Font17 mBottom10 bold">{_l('%0 人', (platformLicenseInfo.externalUserNum || 0).toLocaleString())}</div>
            <div className="Font13 Gray_bd">{_l('已使用 %0 人', (platformLicenseInfo.externalUsedUserNum || 0).toLocaleString() )}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const VersionsInfo = props => {
  const [loading, setLoading] = useState(true);
  const [serverInfo, setServerInfo] = useState({});

  useEffect(() => {
    privateGuideApi.getServerInfo().then(data => {
      setLoading(false);
      setServerInfo(data);
    });
  }, []);

  return (
    <div className="versionsInfo flexColumn card">
      <div className="Font15 bold mBottom20">{_l('版本信息')}</div>
      {
        loading ? (
          <LoadDiv />
        ) : (
          <Fragment>
            <div className="flexRow valignWrapper mBottom15">
              <div className="Gray_75 Font13 label">{_l('平台版本')}</div>
              <div>{serverInfo.systemVersion}</div>
            </div>
            <div className="flexRow valignWrapper mBottom15">
              <div className="Gray_75 Font13 label">{_l('密钥版本')}</div>
              <div>{serverInfo.licenseTemplateVersion}</div>
            </div>
            <div className="flexRow valignWrapper mBottom15">
              <div className="Gray_75 Font13 label">{_l('服务器ID')}</div>
              <div data-tip={serverInfo.serverId}>
                <div style={{ maxWidth: 300 }} className="ellipsis">{serverInfo.serverId}</div>
              </div>
              <Icon
                icon="copy"
                className="Gray_9e Font17 pointer"
                onClick={() => {
                  copy(serverInfo.serverId);
                  alert(_l('复制成功'));
                }}
              />
            </div>
          </Fragment>
        )
      }
    </div>
  );
}

const Log = props => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [total, setTotal] = useState(0);
  const [privateKeyDialogVisible, setPrivateKeyDialogVisible] = useState(false);
  const [originCode, setOriginCode] = useState('');
  const [rect, ref] = useClientRect();
  const pageSize = 10;
  const tableHeight = _.get(rect, 'height');

  const getPlatformLicenseLogs = () => {
    setLoading(true);
    privateGuideApi.getPlatformLicenseLogs({
      pageIndex,
      pageSize,
    }).then(data => {
      const { allCount, list } = data;
      setLoading(false);
      setList(list);
      setTotal(allCount);
    });
  }

  useEffect(() => {
    getPlatformLicenseLogs();
  }, [pageIndex]);

  return (
    <div className="flex card flexColumn mTop20 tableWrapper" ref={ref}>
      <div className="flexRow valignWrapper">
        <div className="Font15 bold flex">{_l('授权日志')}</div>
        <div
          className="updatePrivateKey pointer bold"
          onClick={() => setPrivateKeyDialogVisible(true)}
        >
          {_l('更新密钥')}
        </div>
      </div>
      <PrivateKeyDialog
        originCode={originCode}
        visible={privateKeyDialogVisible}
        onCancel={() => {
          setOriginCode('');
          setPrivateKeyDialogVisible(false);
        }}
        onSave={() => {
          setPageIndex(1);
        }}
      />
      <Table
        loading={loading}
        columns={columns}
        dataSource={list}
        locale={{
          emptyText: _l('暂无数据')
        }}
        pagination={{
          position: ['none', 'bottomCenter'],
          pageSize: 10,
          total,
          onChange: (page) => {
            setPageIndex(page);
          }
        }}
        scroll={{
          scrollToFirstRowOnChange: false,
          y: `${tableHeight > 500 ? (tableHeight - 130) : 500}px`,
        }}
        onRow={(record) => {
          return {
            onClick: e => {
              const { target } = e;
              if (target.classList.contains('viewOriginCode')) {
                setPrivateKeyDialogVisible(true);
                setOriginCode(record.originCode);
              }
            }
          }
        }}
      />
    </div>
  );
}

const Authorization = props => {
  const { SysSettings } = md.global;

  return (
    <Wrap className="flexColumn h100">
      <div className="flexRow valignWrapper">
        <AuthorizationInfo />
        <VersionsInfo />
      </div>
      <Log />
    </Wrap>
  );
}

export default Authorization;

import React, { Fragment, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Table, ConfigProvider } from 'antd';
import Trigger from 'rc-trigger';
import { Icon, Dropdown, UserHead } from 'ming-ui';
import { dialogSelectApp } from 'ming-ui/functions';
import appManagement from 'src/api/appManagement';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import IsAppAdmin from '../../../components/IsAppAdmin';
import MoveDataBaseDialog from '../component/MoveDataBaseDialog';
import ConfirmMoveDialog from '../component/ConfirmMoveDialog';
import './ManageDataBase.less';

const ActionOpWrap = styled.ul`
  background: #fff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.24);
  border-radius: 3px 3px 3px 3px;
  width: 160px;
  font-size: 13px;
  color: #151515;
  padding: 4px 0;
  li {
    line-height: 36px;
    padding: 0 24px;
    cursor: pointer;
    &:hover {
      background-color: #2196f3;
      color: #fff;
    }
  }
`;

const APP_STATUS_OPTIONS = [
  { text: _l('全部状态'), value: '' },
  { text: _l('开启'), value: 1 },
  { text: _l('关闭'), value: 0 },
];

function ManageDataBase(props) {
  const { history, projectId, id, location } = props;
  const baseInfo = _.get(location, 'state') || {};
  const [keywords, setKeywords] = useState(undefined);
  const [appStatus, setAppStatus] = useState('');
  const [data, setData] = useState({});
  const [pageIndex, setPageIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionOp, setActionOp] = useState(undefined);
  const [dataBaseDialog, setDataBaseDialog] = useState({ visible: false });
  const [confirmDialog, setConfirmDialog] = useState({ visible: false });

  const COLUMNS = [
    {
      title: _l('应用'),
      dataIndex: 'appName',
      classNames: 'appName',
      width: 200,
      ellipsis: true,
      render: (value, record) => {
        return (
          <div className="appRowName flexRow">
            <IsAppAdmin
              className=""
              appId={record.appId}
              appName={record.appName}
              iconUrl={record.iconUrl}
              iconColor={record.iconColor}
              createType={2}
            />
          </div>
        );
      },
    },
    {
      title: _l('工作表数'),
      dataIndex: 'sheetCount',
      classNames: 'sheetCount',
      width: 100,
    },
    {
      title: _l('状态'),
      dataIndex: 'status',
      classNames: 'status',
      width: 120,
      render: value => {
        return (
          <span className={value === 1 ? 'allowCreateColor' : 'Gray'}>{value === 1 ? _l('开启中') : _l('已关闭')}</span>
        );
      },
    },
    {
      title: _l('创建时间'),
      dataIndex: 'ctime',
      classNames: 'ctime',
      width: 140,
      render: value => moment(value).format('YYYY-MM-DD'),
    },
    {
      title: _l('添加时间'),
      dataIndex: 'migrateTime',
      classNames: 'migrateTime',
      width: 160,
      render: (value, record) =>
        value || record.ctime ? moment(value || record.ctime).format('YYYY-MM-DD HH:mm') : '',
    },
    {
      title: _l('拥有者'),
      dataIndex: 'addUser',
      classNames: 'addUser',
      ellipsis: true,
      width: 160,
      render: (value, record) => {
        return (
          <div className="valignWrapper">
            <UserHead
              size={28}
              projectId={projectId}
              user={{ userHead: record.createAccountInfo.avatar, accountId: record.caid }}
            />
            <div className="mLeft12 ellipsis flex mRight20">{record.createAccountInfo.fullName}</div>
          </div>
        );
      },
    },
    {
      title: '',
      dataIndex: 'appId',
      classNames: 'optionWrapTr w50 mRight20',
      width: 50,
      render: (value, record, index) => {
        return (
          <Trigger
            popupVisible={actionOp === value}
            onPopupVisibleChange={visible => setActionOp(visible ? value : undefined)}
            action={['click']}
            popupAlign={{ points: ['tr', 'bc'], offset: [15, 0] }}
            popup={
              <ActionOpWrap>
                <li
                  onClick={value => {
                    setActionOp(undefined);
                    setDataBaseDialog({ visible: true, appId: value, appInfo: record });
                  }}
                >
                  {_l('迁移到')}
                </li>
                {/* <li
                  onClick={() => {
                    setActionOp(undefined);
                    setConfirmDialog({
                      visible: true,
                      type: 'remove',
                      appInfo: _.pick(record, ['appId', 'appName']),
                      dataBaseInfo: { id, name: baseInfo.name },
                    });
                  }}
                >
                  {_l('移出')}
                </li> */}
              </ActionOpWrap>
            }
          >
            <Icon icon="moreop" className="Font18 Gray_9e Hover_49 Hand" />
          </Trigger>
        );
      },
    },
  ];

  useEffect(() => {
    getApp();
  }, [pageIndex, appStatus]);

  const getApp = param => {
    setLoading(true);
    appManagement
      .getAppsForProject({
        projectId,
        status: appStatus,
        pageIndex,
        pageSize: 50,
        keyword: (keywords || '').trim(),
        containsLink: true,
        dbInstanceId: id,
        filterDBType: 2,
        ...param,
      })
      .then(({ apps, maxCount, total, count }) => {
        setLoading(false);
        setData({ apps: apps, total: total });
      });
  };

  const handleSearch = (param = {}) => {
    const { keyWords = keywords } = param;
    setKeywords(keyWords);
    getApp({ keyword: (keyWords || '').trim() });
  };

  const onSearch = _.debounce(keywords => handleSearch({ keyWords: keywords }), 500);

  const handleChangeStatus = value => setAppStatus(value);

  const onAdd = () => {
    dialogSelectApp({
      unique: true,
      projectId,
      title: _l('添加应用'),
      externParam: {
        dbInstanceId: '',
        filterDBType: 1,
      },
      onOk: value => {
        setConfirmDialog({
          visible: true,
          type: 'move',
          dataBaseInfo: { id, name: baseInfo.name },
          appInfo: _.pick(value[0], ['appId', 'appName']),
        });
      },
    });
  };

  const renderFilters = () => {
    return (
      <div className="listActionCon flexRow alignItemsCenter">
        <Dropdown
          className="statusSelectWrap"
          data={APP_STATUS_OPTIONS}
          value={appStatus}
          border
          onChange={handleChangeStatus}
        />
        <div className="search InlineBlock mLeft16">
          <SearchInput className="roleSearch" placeholder={_l('应用名称')} value={keywords} onChange={onSearch} />
        </div>
        <span className="flex"></span>
        {!!baseInfo.status && (
          <div className="addAppBtn Hand mLeft20 TxtTop Bold" onClick={onAdd}>
            <Icon type="add" />
            {_l('应用')}
          </div>
        )}
      </div>
    );
  };

  const renderEmpty = () => {
    return (
      <div className="manageListNull flex flexColumn">
        <div className="iconWrap">
          <Icon icon="widgets2" />
        </div>
        <div className="emptyExplain">{_l('暂无应用')}</div>
      </div>
    );
  };

  const onMoveOk = dataBaseInfo => {
    setConfirmDialog({
      visible: true,
      type: 'move',
      dataBaseInfo,
      appInfo: _.pick(dataBaseDialog.appInfo, ['appId', 'appName']),
    });
    setDataBaseDialog({ visible: false });
    getApp({ pageIndex: 1 });
    setPageIndex(1);
  };

  return (
    <Fragment>
      <div className="manageDataBase">
        <div className="HeaderWrap exclusiveCompHeader">
          <span className="icon-backspace Font22 ThemeHoverColor3" onClick={() => history.go(-1)}></span>
          <span className="dataAuthorizeLabel">{_l('管理数据库')}</span>
          <span className="dataAuthorizeName Gray_75">{baseInfo.name}</span>
        </div>
        <div className="ContentWrap">
          {renderFilters()}
          <div className="flex ListWrap">
            <div className="flex flexColumn mTop16">
              <ConfigProvider renderEmpty={renderEmpty}>
                <Table
                  loading={loading}
                  className="databaseAppTable"
                  rowClassName="databaseAppTableTitleRow"
                  columns={COLUMNS}
                  dataSource={data.apps || []}
                  rowKey={record => record.appId}
                  pagination={false}
                />
              </ConfigProvider>
            </div>
            <PaginationWrap
              total={_.get(data, 'total') || 0}
              pageIndex={pageIndex}
              pageSize={50}
              onChange={pageIndex => setPageIndex(pageIndex)}
            />
          </div>
        </div>
      </div>
      {dataBaseDialog.visible && (
        <MoveDataBaseDialog
          visible={dataBaseDialog.visible}
          projectId={projectId}
          filterId={id}
          onOk={onMoveOk}
          onCancel={() => setDataBaseDialog({ visible: false })}
        />
      )}
      {confirmDialog.visible && (
        <ConfirmMoveDialog
          {...confirmDialog}
          projectId={projectId}
          onClose={() => setConfirmDialog({ visible: false })}
        />
      )}
    </Fragment>
  );
}

export default withRouter(ManageDataBase);

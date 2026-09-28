import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import { Icon, SearchInput, UserHead } from 'ming-ui';
import { Dropdown as AntdDropdown, Button, Select, Tooltip } from 'ming-ui/antd-components';
import { dialogSelectApp } from 'ming-ui/functions';
import appManagement from 'src/api/appManagement';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import IsAppAdmin from '../../../components/IsAppAdmin';
import ConfirmMoveDialog from '../component/ConfirmMoveDialog';
import MoveDataBaseDialog from '../component/MoveDataBaseDialog';
import './ManageDataBase.less';

const APP_STATUS_OPTIONS = [
  { label: _l('全部状态'), value: '' },
  { label: _l('开启'), value: 1 },
  { label: _l('关闭'), value: 0 },
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
          <span className={value === 1 ? 'allowCreateColor' : 'textPrimary'}>
            {value === 1 ? _l('开启中') : _l('已关闭')}
          </span>
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
      render: (value, record) => {
        return (
          <AntdDropdown
            open={actionOp === value}
            onOpenChange={visible => setActionOp(visible ? value : undefined)}
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'move',
                  label: _l('迁移到'),
                  onClick: () => {
                    setActionOp(undefined);
                    setDataBaseDialog({ visible: true, appId: value, appInfo: record });
                  },
                },
                {
                  key: 'remove',
                  label: _l('移出'),
                  danger: true,
                  onClick: () => {
                    setActionOp(undefined);
                    setConfirmDialog({
                      visible: true,
                      type: 'remove',
                      appInfo: _.pick(record, ['appId', 'appName']),
                      dataBaseInfo: { id, name: baseInfo.name },
                    });
                  },
                },
              ],
              style: { minWidth: 160 },
            }}
          >
            <Icon icon="moreop" className="Font18 textTertiary hoverColorPrimaryLight Hand" />
          </AntdDropdown>
        );
      },
    },
  ];

  const getApp = useCallback(
    (param = {}) => {
      setLoading(true);
      return appManagement
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
        .then(({ apps, total }) => {
          setLoading(false);
          setData({ apps, total });
        });
    },
    [appStatus, id, keywords, pageIndex, projectId],
  );

  useEffect(() => {
    const timer = setTimeout(getApp, 0);
    return () => clearTimeout(timer);
  }, [getApp]);

  const debouncedSearch = useMemo(() => _.debounce(setKeywords, 500), []);

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const onSearch = value => {
    if (value) {
      debouncedSearch(value);
    } else {
      debouncedSearch.cancel();
      setKeywords('');
    }
  };

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
        <Select
          className="statusSelectWrap"
          options={APP_STATUS_OPTIONS}
          value={appStatus}
          onChange={handleChangeStatus}
        />
        <div className="search InlineBlock mLeft16">
          <SearchInput className="roleSearch" placeholder={_l('应用名称')} onChange={onSearch} />
        </div>
        <span className="flex"></span>
        {!!baseInfo.status && (
          <Button type="primary" className="mLeft20" icon={<Icon icon="add" />} onClick={onAdd}>
            {_l('应用')}
          </Button>
        )}
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
          <span className="icon-backspace Font22 hoverColorPrimary" onClick={() => history.go(-1)}></span>
          <span className="dataAuthorizeLabel">{_l('应用管理')}</span>
          <span className="dataAuthorizeName textSecondary flex">{baseInfo.name}</span>
          <Tooltip title={_l('刷新')}>
            <Icon icon="refresh1" className="Font22 textTertiary hoverColorPrimary" onClick={() => getApp()} />
          </Tooltip>
        </div>
        <div className="ContentWrap">
          {renderFilters()}
          <div className="flex overflowHidden mTop16">
            <PageTableCon
              loading={loading}
              columns={COLUMNS}
              dataSource={data.apps || []}
              count={_.get(data, 'total') || 0}
              paginationInfo={{ pageIndex, pageSize: 50 }}
              getDataSource={getApp}
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

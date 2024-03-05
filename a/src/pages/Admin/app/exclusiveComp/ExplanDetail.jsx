import React, { Fragment, useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import cx from 'classnames';
import moment from 'moment';
import { Select, Table, ConfigProvider, Empty } from 'antd';
import Trigger from 'rc-trigger';
import _ from 'lodash';
import { Icon, Button } from 'ming-ui';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import UserHead from 'src/components/userHead/userHead';
import Search from 'src/pages/workflow/components/Search';
import PaginationWrap from '../../components/PaginationWrap';
import MoveWorkflowDialog from './component/MoveWorkflowDialog';
import AddWorkflowDialog from './component/AddWorkflowDialog';
import resourceApi from 'src/pages/workflow/api/resource';
import appManagement from 'src/api/appManagement';
import projectAjax from 'src/api/project';
import { START_APP_TYPE } from 'src/pages/workflow/WorkflowList/utils';
import { TYPE_LIST, COMPUTING_INSTANCE_STATUS } from './config';
import './index.less';
import IsAppAdmin from '../../components/IsAppAdmin';
import { navigateTo } from 'src/router/navigateTo';

const ActionOpWrap = styled.ul`
  background: #fff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.24);
  border-radius: 3px 3px 3px 3px;
  width: 160px;
  font-size: 13px;
  color: #333;
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

const PAGE_SIZE = 10;

const renderEmpty = () => {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={_l('暂无数据')}></Empty>;
};

function ExplanDetail(props) {
  const { projectId, id, history, location } = props;

  const [workflowData, setWorkflowData] = useState({
    count: 0,
    list: [],
  });
  const [appList, setAppList] = useState([{ label: _l('全部应用'), value: '' }]);
  const [filters, setFilters] = useState({
    apkId: '',
    workflowType: '',
    search: '',
    pageIndex: 1,
  });
  const [actionOp, setActionOp] = useState(-1);
  const [selectKeys, setSelectKeys] = useState([]);
  const [moveWorkflowDialog, setMoveWorkflowDialog] = useState({
    visible: false,
    ids: [],
  });
  const [addWorkflowDialog, setAddWorkflowDialog] = useState({
    visible: false,
  });
  const [explanInfo, setExplanInfo] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useState(() => {
    projectAjax
      .getComputingInstanceDetail({
        projectId: projectId,
        id: id,
      })
      .then(res => {
        setExplanInfo(res);
        getProcessList(res.resourceId);
      });
  }, [id]);

  useEffect(() => {
    getProcessList();
  }, [filters.search, filters.pageIndex, filters.apkId, filters.workflowType]);

  const getProcessList = resourceId => {
    setLoading(true);
    let _resourceId = resourceId || (explanInfo || {}).resourceId;
    if (!_resourceId) return;
    let promiseList = Promise.all([
      resourceApi.getProcessList({
        keyword: filters.search,
        pageIndex: filters.pageIndex,
        pageSize: PAGE_SIZE,
        resourceId: _resourceId,
        apkId: filters.apkId,
        processListType: filters.workflowType,
      }),
      resourceApi.getCountByResourceId({
        keyword: filters.search,
        resourceId: _resourceId,
        apkId: filters.apkId,
        processListType: filters.workflowType,
      }),
    ]);
    promiseList.then(([res, count]) => {
      setLoading(false);
      setWorkflowData({
        list: res,
        count: count,
      });
    });
  };

  const getAppList = () => {
    appManagement
      .getAppsForProject({
        projectId,
        status: '',
        order: 3,
        pageIndex: 1,
        pageSize: 100000,
        keyword: '',
      })
      .then(({ apps }) => {
        const newAppList = apps.map(item => {
          return {
            label: item.appName,
            value: item.appId,
          };
        });
        setAppList(appList.concat(newAppList));
      });
  };

  const removeWorkflow = (ids, targetResourceId) => {
    if (!ids || ids.length === 0) return;

    resourceApi
      .moveProcess({
        moveToResourceId: targetResourceId || '',
        processIds: ids,
        resourceId: (explanInfo || {}).resourceId,
        companyId: projectId,
      })
      .then(res => {
        if (res) {
          alert(_l('移动成功'));
          getProcessList();
        } else {
          alert(_l('移动失败'), 2);
        }
      });
  };

  const COLUMNS = [
    {
      title: _l('工作流'),
      dataIndex: 'id',
      render: (value, record) => {
        return (
          <div className="workfloeRowName flexRow alignItemsCenter">
            <IsAppAdmin
              className="workflowCheckWrap"
              appId={record.app ? record.app.id : undefined}
              desc={record.app ? record.app.name : undefined}
              appName={record.process.name}
              defaultIcon={
                (START_APP_TYPE[record.process.child ? 'subprocess' : record.process.startAppType] || {}).iconName
              }
              iconColor={
                (START_APP_TYPE[record.process.child ? 'subprocess' : record.process.startAppType] || {}).iconColor
              }
              createType={2}
              ckeckSuccessCb={() => {
                navigateTo(`/workflowedit/${value}`);
              }}
            />
          </div>
        );
      },
    },
    {
      title: _l('类型'),
      dataIndex: 'id',
      width: 150,
      render: (value, record) => {
        return (
          <div className="columnType">
            {(START_APP_TYPE[record.process.child ? 'subprocess' : record.process.startAppType] || {}).text}
          </div>
        );
      },
    },
    {
      title: _l('添加时间'),
      dataIndex: 'createDate',
      width: 300,
    },
    {
      title: _l('添加人'),
      dataIndex: 'id',
      width: 300,
      render: (value, record) => {
        return (
          <div className="flexRow Gray_75">
            <UserHead
              size={28}
              user={{ userHead: record.createBy.avatar, accountId: record.createBy.accountId }}
              projectId={projectId}
            />
            <div className="mLeft12 ellipsis flex LineHeight28">{record.createBy.fullName}</div>
          </div>
        );
      },
    },
    {
      title: '',
      width: 50,
      dataIndex: 'id',
      render: (value, record, index) => {
        return (
          <Trigger
            popupVisible={actionOp === index}
            onPopupVisibleChange={visible => setActionOp(visible ? index : -1)}
            action={['click']}
            popup={
              <ActionOpWrap>
                <li
                  onClick={value => {
                    setActionOp(-1);
                    setMoveWorkflowDialog({
                      visible: true,
                      ids: [record.id],
                    });
                  }}
                >
                  {_l('移动到')}
                </li>
                <li
                  onClick={() => {
                    setActionOp(-1);
                    removeWorkflow([record.id]);
                  }}
                >
                  {_l('移出')}
                </li>
              </ActionOpWrap>
            }
            popupAlign={{ points: ['tr', 'bc'], offset: [15, 0] }}
          >
            <Icon icon="moreop" className="Font18 Gray_9e Hover_49 Hand" />
          </Trigger>
        );
      },
    },
  ];

  return (
    <Fragment>
      <div className="exclusiveCompHeader explanDetailHeader">
        <span className="icon-backspace Font22 ThemeHoverColor3" onClick={() => history.go(-1)}></span>
        <span className="explanDetailLabel">{_l('管理算力')}</span>
        <span className="explanDetailName Gray_75">
          {explanInfo && `${explanInfo.name}（${explanInfo.resourceId}）`}
        </span>
        <span className="flex"></span>
        {explanInfo && moment(explanInfo.expirationDatetime).add(1, 'd').isBefore(new Date()) && (
          <span className="" style={{ color: '#f51744' }}>
            {_l('服务已过期')}
          </span>
        )}
      </div>
      <div className="explanDetailContent flex">
        <div className="actionCon flexRow">
          <Select
            className="selectItem"
            showSearch
            defaultValue={filters.apkId}
            options={appList}
            onFocus={() => appList.length === 1 && getAppList(projectId)}
            filterOption={(inputValue, option) =>
              appList
                .find(item => item.value === option.value)
                .label.toLowerCase()
                .indexOf(inputValue.toLowerCase()) > -1
            }
            suffixIcon={<Icon icon="arrow-down-border Font14" />}
            notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
            onChange={value =>
              setFilters({
                ...filters,
                apkId: value,
              })
            }
          />
          <Select
            className="selectItem"
            defaultValue={filters.workflowType}
            options={TYPE_LIST}
            suffixIcon={<Icon icon="arrow-down-border Font14" />}
            onChange={value =>
              setFilters({
                ...filters,
                workflowType: value,
              })
            }
          />
          <Search
            placeholder={_l('工作流名称')}
            handleChange={_.debounce(value => {
              setFilters({
                ...filters,
                pageIndex: 1,
                search: value,
              });
            }, 500)}
          />
          <div className="flex"></div>
          <span
            className={cx('actionBtn mRight20', { disabled: selectKeys.length === 0 })}
            onClick={() => {
              if (selectKeys.length === 0) return;
              setMoveWorkflowDialog({
                ...workflowData,
                visible: true,
                ids: selectKeys,
              });
            }}
          >
            {_l('移动到')}
          </span>
          <span
            className={cx('actionBtn mRight20', { disabled: selectKeys.length === 0 })}
            onClick={() => {
              if (selectKeys.length === 0) return;
              Confirm({
                className: '',
                title: selectKeys.length === 1 ? _l('移出工作流') : _l('移出%0个工作流', selectKeys.length),
                okText: _l('移出'),
                buttonType: 'danger',
                cancelText: _l('取消'),
                onOk: () => {
                  removeWorkflow(selectKeys);
                },
              });
            }}
          >
            {_l('移出')}
          </span>
          <Button
            type="primary"
            icon="add"
            className="addBtn"
            size="small"
            disabled={explanInfo && explanInfo.status !== COMPUTING_INSTANCE_STATUS.Running}
            onClick={() => {
              setAddWorkflowDialog({
                visible: true,
              });
            }}
          >
            {_l('工作流')}
          </Button>
        </div>
        <div className="listCon flex">
          <ConfigProvider renderEmpty={renderEmpty}>
            <Table
              loading={loading}
              className="workflowTable"
              rowClassName="workflowTableTitleRow"
              rowSelection={{
                selectedRowKeys: selectKeys,
                onChange: value => {
                  setSelectKeys(value);
                },
              }}
              columns={COLUMNS}
              dataSource={workflowData.list}
              rowKey={record => record.id}
              pagination={false}
            />
          </ConfigProvider>
        </div>
        <PaginationWrap
          total={workflowData.count}
          pageIndex={filters.pageIndex}
          pageSize={PAGE_SIZE}
          onChange={index => {
            setFilters({
              ...filters,
              pageIndex: index,
            });
          }}
        />
      </div>
      {explanInfo && moveWorkflowDialog.visible && (
        <MoveWorkflowDialog
          visible={moveWorkflowDialog.visible}
          projectId={projectId}
          sourceResourceId={explanInfo.resourceId}
          onOk={value => {
            setMoveWorkflowDialog({
              ...moveWorkflowDialog,
              visible: false,
            });
            removeWorkflow(moveWorkflowDialog.ids, value);
          }}
          onCancel={() => {
            setMoveWorkflowDialog({
              visible: false,
              ids: [],
            });
          }}
        />
      )}
      {explanInfo && addWorkflowDialog.visible && (
        <AddWorkflowDialog
          projectId={projectId}
          visible={addWorkflowDialog.visible}
          resourceId={explanInfo.resourceId}
          onOk={() => {
            setAddWorkflowDialog({
              visible: false,
            });
            getProcessList();
          }}
          onCancel={() => {
            setAddWorkflowDialog({
              visible: false,
            });
          }}
        />
      )}
    </Fragment>
  );
}

export default withRouter(ExplanDetail);

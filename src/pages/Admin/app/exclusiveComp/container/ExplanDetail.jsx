import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { Icon, UserHead } from 'ming-ui';
import { Button, ConfigProvider, Dropdown, Empty, Modal, Select } from 'ming-ui/antd-components';
import appManagement from 'src/api/appManagement';
import projectAjax from 'src/api/project';
import resourceApi from 'src/pages/workflow/api/resource';
import { Table } from 'src/ming-ui/antd-components/AsyncAntd';
import Search from 'src/pages/workflow/components/Search';
import { START_APP_TYPE } from 'src/pages/workflow/WorkflowList/utils';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import IsAppAdmin from '../../../components/IsAppAdmin';
import PaginationWrap from '../../../components/PaginationWrap';
import AddWorkflowDialog from '../component/AddWorkflowDialog';
import HistoryWorkflowTable from '../component/HistoryWorkflowTable';
import MoveWorkflowDialog from '../component/MoveWorkflowDialog';
import WorkflowConflictDialog from '../component/WorkflowConflictDialog';
import { COMPUTING_INSTANCE_STATUS, TYPE_LIST } from '../config';
import {
  canShowComputingInstanceHistory,
  checkHistoryWorkflowConflicts,
  getAllHistoryWorkflowIds,
  getHistoryWorkflowMoveIds,
  getHistoryWorkflowRequestParams,
  isComputingInstanceExpired,
  isHistoryComputingRoute,
  normalizeHistoryWorkflowResult,
} from '../historyWorkflow';
import '../index.less';

const PAGE_SIZE = 10;

const renderEmpty = () => {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={_l('暂无数据')}></Empty>;
};

function ExplanDetail(props) {
  const { projectId, id, history, location } = props;
  const isHistoryMode = isHistoryComputingRoute(location.search);

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
  const [historyConflictDialog, setHistoryConflictDialog] = useState({
    visible: false,
    list: [],
    checked: [],
    workflowIds: [],
    targetResourceId: '',
  });
  const [explanInfo, setExplanInfo] = useState(undefined);
  const [historyIdsLoading, setHistoryIdsLoading] = useState(false);
  const [historyMoveSubmitting, setHistoryMoveSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const historyMovePending = useRef(false);
  const historyWorkflowCount = (explanInfo || {}).workflowCount || 0;
  const showHistoryInfo = canShowComputingInstanceHistory(isHistoryMode, explanInfo);
  const showHistoryWorkflowActions = showHistoryInfo && historyWorkflowCount > 0;
  const historyWorkflowActionDisabled = historyIdsLoading || historyMoveSubmitting || historyConflictDialog.visible;
  const isServiceExpired = isComputingInstanceExpired((explanInfo || {}).expirationDatetime);
  const resourceId = (explanInfo || {}).resourceId;
  const managementResourceId = isHistoryMode ? undefined : resourceId;
  const handleSearchChange = useMemo(
    () =>
      _.debounce(value => {
        setLoading(true);
        setFilters(currentFilters => ({
          ...currentFilters,
          pageIndex: 1,
          search: value,
        }));
      }, 500),
    [setFilters, setLoading],
  );

  const getProcessList = useCallback(() => {
    if (!isHistoryMode && !managementResourceId) return Promise.resolve();

    const request = isHistoryMode
      ? projectAjax
          .getComputingInstanceHistoryWorkflows(
            getHistoryWorkflowRequestParams({ projectId, id, filters, pageSize: PAGE_SIZE }),
          )
          .then(normalizeHistoryWorkflowResult)
      : Promise.all([
          resourceApi.getProcessList({
            keyword: filters.search,
            pageIndex: filters.pageIndex,
            pageSize: PAGE_SIZE,
            resourceId: managementResourceId,
            apkId: filters.apkId,
            processListType: filters.workflowType,
          }),
          resourceApi.getCountByResourceId({
            keyword: filters.search,
            resourceId: managementResourceId,
            apkId: filters.apkId,
            processListType: filters.workflowType,
          }),
        ]).then(([list, count]) => ({ list, count }));

    return request
      .then(result => {
        setWorkflowData({ list: result.list, count: result.count });
        if (isHistoryMode && result.instance) {
          setExplanInfo(result.instance);
        }
      })
      .finally(() => setLoading(false));
  }, [filters, id, isHistoryMode, managementResourceId, projectId, setExplanInfo, setLoading, setWorkflowData]);

  useEffect(() => {
    if (isHistoryMode) return undefined;

    let mounted = true;

    projectAjax.getComputingInstanceDetail({ projectId, id }).then(res => {
      if (!mounted) return;

      setExplanInfo(res);
    });

    return () => {
      mounted = false;
    };
  }, [id, isHistoryMode, projectId]);

  useEffect(() => {
    getProcessList();
  }, [getProcessList]);

  useEffect(() => () => handleSearchChange.cancel(), [handleSearchChange]);

  const getAppList = () => {
    const keyword = '';
    appManagement
      .getAppsForProject({
        projectId,
        status: '',
        order: 3,
        pageIndex: 1,
        pageSize: 100000,
        keyword: keyword.trim(),
      })
      .then(({ apps }) => {
        const newAppList = apps.map(item => {
          return {
            label: item.appName,
            value: item.appId,
          };
        });
        setAppList(currentList => currentList.concat(newAppList));
      });
  };

  const removeWorkflow = (ids, targetResourceId, options = {}) => {
    if (!ids || ids.length === 0) return Promise.resolve();

    const { showSuccess = true } = options;

    const request = isHistoryMode
      ? projectAjax.moveComputingInstanceHistoryWorkflows({
          projectId,
          id,
          targetResourceId,
          workflowIds: ids,
        })
      : resourceApi.moveProcess({
          moveToResourceId: targetResourceId || '',
          processIds: ids,
          resourceId: (explanInfo || {}).resourceId,
          companyId: projectId,
        });

    return request.then(res => {
      if (res) {
        showSuccess && alert(_l('移动成功'));

        setLoading(true);
        getProcessList();
      } else {
        alert(_l('移动失败'), 2);
      }

      return res;
    });
  };

  const openHistoryWorkflowDialog = () => {
    if (historyWorkflowActionDisabled || historyMovePending.current || historyWorkflowCount === 0) return;

    setHistoryIdsLoading(true);
    getAllHistoryWorkflowIds({
      request: params => projectAjax.getComputingInstanceHistoryWorkflows(params),
      projectId,
      id,
    })
      .then(workflowIds => {
        if (!workflowIds.length) {
          alert(_l('暂无可添加的历史工作流'), 3);
          return;
        }

        setMoveWorkflowDialog({
          visible: true,
          ids: workflowIds,
          isHistory: true,
        });
      })
      .catch(_requestError => alertIfNotUnauthorized(_requestError, _l('获取历史工作流失败'), 2))
      .finally(() => setHistoryIdsLoading(false));
  };

  const resetHistoryConflictDialog = () => {
    setHistoryConflictDialog({
      visible: false,
      list: [],
      checked: [],
      workflowIds: [],
      targetResourceId: '',
    });
  };

  const prepareHistoryWorkflowMove = (workflowIds, targetResourceId) => {
    if (historyMovePending.current) return;

    historyMovePending.current = true;
    setHistoryMoveSubmitting(true);
    return checkHistoryWorkflowConflicts({
      request: params => projectAjax.checkMoveComputingInstanceHistoryWorkflows(params),
      projectId,
      id,
      targetResourceId,
      workflowIds,
    })
      .then(
        conflicts => {
          if (!conflicts.length) {
            return removeWorkflow(workflowIds, targetResourceId);
          }

          setHistoryConflictDialog({
            visible: true,
            list: conflicts,
            checked: conflicts.map(item => item.id),
            workflowIds,
            targetResourceId,
          });
        },
        _requestError2 => alertIfNotUnauthorized(_requestError2, _l('检查工作流冲突失败'), 2),
      )
      .finally(() => {
        historyMovePending.current = false;
        setHistoryMoveSubmitting(false);
      });
  };

  const submitHistoryWorkflowMove = checkedConflictIds => {
    if (historyMovePending.current) return;

    const conflictIds = historyConflictDialog.list.map(item => item.id);
    const workflowIds = getHistoryWorkflowMoveIds({
      workflowIds: historyConflictDialog.workflowIds,
      conflictIds,
      checkedConflictIds,
    });

    if (!workflowIds.length) {
      resetHistoryConflictDialog();
      return;
    }

    historyMovePending.current = true;
    setHistoryMoveSubmitting(true);
    return removeWorkflow(workflowIds, historyConflictDialog.targetResourceId, {
      showSuccess: checkedConflictIds.length > 0,
    })
      .then(res => {
        if (res) {
          resetHistoryConflictDialog();
        }
      })
      .finally(() => {
        historyMovePending.current = false;
        setHistoryMoveSubmitting(false);
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
          <div className="flexRow textSecondary">
            <UserHead
              size={28}
              user={{ userHead: record?.createBy?.avatar, accountId: record?.createBy?.accountId }}
              projectId={projectId}
            />
            <div className="mLeft12 ellipsis flex LineHeight28">{record?.createBy?.fullName || '_'}</div>
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
          <Dropdown
            open={actionOp === index}
            onOpenChange={visible => setActionOp(visible ? index : -1)}
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'move',
                  label: _l('移动到'),
                  onClick: () => {
                    setActionOp(-1);
                    setMoveWorkflowDialog({
                      visible: true,
                      ids: [record.id],
                    });
                  },
                },
                {
                  key: 'remove',
                  label: _l('移出'),
                  danger: true,
                  onClick: () => {
                    setActionOp(-1);
                    removeWorkflow([record.id]);
                  },
                },
              ],
              style: { minWidth: 160 },
            }}
          >
            <Icon icon="moreop" className="Font18 textTertiary hoverColorPrimaryLight Hand" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Fragment>
      <div className="exclusiveCompHeader explanDetailHeader">
        <span className="icon-backspace Font22 hoverColorPrimary" onClick={() => history.go(-1)}></span>
        <span className="explanDetailLabel">{_l('管理算力')}</span>
        <span className="explanDetailName textSecondary">
          {explanInfo && `${explanInfo.name}（${explanInfo.resourceId}）`}
        </span>
        <span className="flex"></span>
        {isServiceExpired && (
          <span className="" style={{ color: 'var(--color-error)' }}>
            {_l('服务已过期')}
          </span>
        )}
      </div>
      <div className="explanDetailContent flex">
        {showHistoryInfo && (
          <div className="historyWorkflowNotice flexRow alignItemsCenter">
            <Icon icon="info_outline" className="Font18 mRight10" />
            <span className="bold">
              {_l(
                '本专属算力已于 %0 到期',
                (explanInfo || {}).expirationDatetime
                  ? moment(explanInfo.expirationDatetime).format(_l('YYYY-MM-DD'))
                  : '_',
              )}
              {showHistoryWorkflowActions &&
                _l('，以下 %0 条工作流为到期前的历史记录，已自动释放。', historyWorkflowCount)}
            </span>
            {showHistoryWorkflowActions && (
              <Fragment>
                <span className="flex" />
                <span
                  className={cx('addHistoryWorkflow', { disabled: historyWorkflowActionDisabled })}
                  onClick={openHistoryWorkflowDialog}
                >
                  {_l('添加到其他算力')}
                </span>
              </Fragment>
            )}
          </div>
        )}
        <div className="actionCon flexRow">
          <Select
            className="selectItem"
            showSearch
            defaultValue={filters.apkId}
            options={appList}
            onFocus={() => appList.length === 1 && getAppList()}
            filterOption={(inputValue, option) =>
              appList
                .find(item => item.value === option.value)
                .label.toLowerCase()
                .indexOf(inputValue.toLowerCase()) > -1
            }
            suffixIcon={<Icon icon="arrow-down-border Font14" />}
            notFoundContent={<span className="textTertiary">{_l('无搜索结果')}</span>}
            onChange={value => {
              setLoading(true);
              setFilters(currentFilters => ({
                ...currentFilters,
                apkId: value,
                pageIndex: 1,
              }));
            }}
          />
          <Select
            className="selectItem"
            defaultValue={filters.workflowType}
            options={TYPE_LIST}
            suffixIcon={<Icon icon="arrow-down-border Font14" />}
            onChange={value => {
              setLoading(true);
              setFilters(currentFilters => ({
                ...currentFilters,
                workflowType: value,
                pageIndex: 1,
              }));
            }}
          />
          <Search placeholder={_l('工作流名称')} handleChange={handleSearchChange} />
          <div className="flex"></div>
          {!isHistoryMode && (
            <Fragment>
              <Button
                className="mRight20"
                disabled={selectKeys.length === 0}
                onClick={() => {
                  setMoveWorkflowDialog({
                    ...workflowData,
                    visible: true,
                    ids: selectKeys,
                  });
                }}
              >
                {_l('移动到')}
              </Button>
              <Button
                className="mRight20"
                disabled={selectKeys.length === 0}
                onClick={() => {
                  Modal.confirm({
                    className: '',
                    title: (
                      <span className="textError">
                        {selectKeys.length === 1 ? _l('移出工作流') : _l('移出%0个工作流', selectKeys.length)}
                      </span>
                    ),
                    okText: _l('移出'),
                    okButtonProps: {
                      danger: true,
                    },
                    cancelText: _l('取消'),
                    onOk: () => {
                      removeWorkflow(selectKeys);
                    },
                  });
                }}
              >
                {_l('移出')}
              </Button>
              <Button
                type="primary"
                icon={<Icon icon="add" />}
                disabled={explanInfo && explanInfo.status !== COMPUTING_INSTANCE_STATUS.Running}
                onClick={() => {
                  setAddWorkflowDialog({
                    visible: true,
                  });
                }}
              >
                {_l('工作流')}
              </Button>
            </Fragment>
          )}
        </div>
        <div className="listCon flex">
          {isHistoryMode ? (
            <HistoryWorkflowTable loading={loading} list={workflowData.list} projectId={projectId} />
          ) : (
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
          )}
        </div>
        <PaginationWrap
          total={workflowData.count}
          pageIndex={filters.pageIndex}
          pageSize={PAGE_SIZE}
          onChange={index => {
            setLoading(true);
            setFilters(currentFilters => ({
              ...currentFilters,
              pageIndex: index,
            }));
          }}
        />
      </div>
      {explanInfo && moveWorkflowDialog.visible && (
        <MoveWorkflowDialog
          visible={moveWorkflowDialog.visible}
          projectId={projectId}
          sourceResourceId={explanInfo.resourceId}
          title={
            moveWorkflowDialog.isHistory
              ? _l('将 %0 个历史工作流添加到其他专属算力', moveWorkflowDialog.ids.length)
              : undefined
          }
          okText={moveWorkflowDialog.isHistory ? _l('确认') : undefined}
          onOk={value => {
            const { isHistory, ids: workflowIds = [] } = moveWorkflowDialog;
            setMoveWorkflowDialog({
              visible: false,
              ids: [],
            });
            if (isHistory) {
              prepareHistoryWorkflowMove(workflowIds, value);
            } else {
              removeWorkflow(workflowIds, value);
            }
          }}
          onCancel={() => {
            setMoveWorkflowDialog({
              visible: false,
              ids: [],
            });
          }}
        />
      )}
      <WorkflowConflictDialog
        visible={historyConflictDialog.visible}
        list={historyConflictDialog.list}
        totalCount={historyConflictDialog.workflowIds.length}
        checked={historyConflictDialog.checked}
        submitting={historyMoveSubmitting}
        onCheckedChange={checked => setHistoryConflictDialog({ ...historyConflictDialog, checked })}
        onMove={() => {
          if (!historyConflictDialog.checked.length) return;
          submitHistoryWorkflowMove(historyConflictDialog.checked);
        }}
        onNotMove={() => submitHistoryWorkflowMove([])}
      />
      {explanInfo && addWorkflowDialog.visible && (
        <AddWorkflowDialog
          projectId={projectId}
          visible={addWorkflowDialog.visible}
          resourceId={explanInfo.resourceId}
          onOk={() => {
            setAddWorkflowDialog({
              visible: false,
            });
            setLoading(true);
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

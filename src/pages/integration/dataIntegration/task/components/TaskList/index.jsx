import React, { Fragment, useEffect, useState, useCallback } from 'react';
import { useSetState } from 'react-use';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, Checkbox } from 'ming-ui';
import { Switch } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import OptionColumn from './OptionColumn';
import { TASK_STATUS_TYPE, TASK_STATUS_TAB_LIST, SORT_TYPE } from '../../../constant';
import syncTaskApi from '../../../../api/syncTask';
import { formatDate } from '../../../../config';
import { Link } from 'react-router-dom';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import dataSourceApi from '../../../../api/datasource';
import ToolTip from 'ming-ui/components/Tooltip';
import DropMotion from 'src/pages/worksheet/components/Animations/DropMotion';

const TaskListBox = styled.div`
  .itemWrapper {
    padding-left: 22px;
    position: relative;

    &.isHeader {
      .rowItem {
        padding: 8px 0;
        .sortIcon {
          color: #bfbfbf;
          height: 8px;

          &.selected {
            color: #2196f3;
          }
        }
      }
    }

    &:not(.isHeader) {
      &:hover {
        background: rgba(247, 247, 247, 1);
        .checkbox {
          .taskItemCheckbox {
            display: block;
          }
        }
        .titleText {
          color: #2196f3 !important;
        }
        .optionIcon {
          background: rgba(247, 247, 247, 1);
        }
      }
    }
  }

  .rowItem {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 12px 0;
    border-bottom: 1px solid #e0e0e0;

    .titleColumn {
      min-width: 124px;
      cursor: pointer;
    }
    .arrowIcon {
      transform: rotate(-90deg);
      margin-right: 8px;
      color: #d0d0d0;
      font-size: 20px;
    }
    .titleText {
      font-size: 14px;
      color: #151515;
      font-weight: 600;
    }
    .ant-switch-checked {
      background-color: rgba(40, 202, 131, 1);
    }
    .errorIcon {
      font-size: 16px;
      color: #f44336;
      margin-left: 8px;
      cursor: pointer;
    }
    .warnColor {
      color: #faad14;
    }
  }

  .checkbox {
    position: absolute;
    left: 6px;
    .taskItemCheckbox {
      display: none;
      &.isShow {
        display: block;
      }
    }
  }
  .optionIcon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: #9e9e9e;
    background: #fff;

    &:hover {
      color: #2196f3;
      background: #fff !important;
    }
  }

  .taskStatus {
    flex: 3;
    .ant-switch-disabled {
      background: #dedede !important;
      opacity: 1;
      &.ant-switch-checked {
        background: #80e4c1 !important;
        opacity: 1;
      }
    }
  }

  .taskName {
    flex: 6;
    width: 0;
    padding-left: 6px;
  }
  .createUser {
    flex: 3;
  }
  .readRecord,
  .writeRecord {
    flex: 2;
    .hrHeight {
      height: 19.5px;
    }
    .h16 {
      height: 16px;
    }
  }
  .option {
    flex: 1;
  }
`;

const NoDataWrapper = styled.div`
  text-align: center !important;
  .iconCon {
    width: 130px;
    height: 130px;
    line-height: 130px;
    background: #fbfbfb;
    border-radius: 50%;
    margin: 64px auto 0;
    color: #9e9e9e;
  }
`;

const TaskIcon = styled.div`
  display: inline-flex;
  position: relative;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 8px;
  font-size: 22px;
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 0px 1px, rgba(0, 0, 0, 0.06) 0px 1px 3px;

  .svg-icon {
    width: 24px;
    height: 24px;
  }
  .sourceNum {
    position: absolute;
    text-align: center;
    top: -5px;
    right: -5px;
    width: 19px;
    height: 19px;
    line-height: 17px;
    border: 1px solid #fff;
    border-radius: 50%;
    background: #151515;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
  }
`;

const ErrorInfoWrapper = styled.div`
  padding: 18px 20px;
  width: 220px;
  background: #fff;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.24);
  border-radius: 3px;

  .errorText {
    color: #f44336;
    word-break: break-all;
  }
`;

const RedDot = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 100%;
  background-color: red;
`;

const FilterItem = styled.div`
  display: flex;
  height: 36px;
  overflow: hidden;

  &.isExpand {
    overflow: visible !important;
    height: auto;
  }

  .itemText {
    min-width: 100px;
    font-size: 13px;
    color: #757575;
    font-weight: 600;
    padding: 8px 0;
  }

  ul {
    position: relative;
    padding-right: 28px;
    li {
      display: inline-block;
      padding: 0 15px;
      margin: 4px 0 4px 8px;
      height: 28px;
      box-sizing: border-box;
      border: 1px solid #e0e0e0;
      border-radius: 20px;
      cursor: pointer;
      line-height: 26px;
      font-size: 12px;
      color: #151515;

      &.isActive {
        font-weight: 600;
        color: #2196f3;
      }
      &:hover {
        border-color: #ccc;
      }
      &::before {
        display: block;
        content: attr(title);
        font-weight: 600;
        visibility: hidden;
        overflow: hidden;
        height: 0;
      }
    }

    .expandIcon {
      position: absolute;
      width: 28px;
      height: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 14px;
      top: 5px;
      right: 0;
      color: #bdbdbd;
      cursor: pointer;

      &:hover {
        color: #2196f3;
        background: #f5f5f5;
      }
    }
  }
`;

const SelectedWrapper = styled.div`
  height: 71px;
  display: flex;
  align-items: center;
  background: #fff;

  .operateBtn {
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
    border: 1px solid #ddd;
    border-radius: 3px;
    cursor: pointer;
    &:hover {
      border-color: #2196f3;
      color: #2196f3;
    }
  }
`;

let ajaxPromise;
let statusAjaxPromise;
let batchAjaxPromise;
let sortFlag = 0;

export default function TaskList({ projectId, onRefreshComponents }) {
  const [taskList, setTaskList] = useState([]);
  const [errorInfoVisible, setErrorInfoVisible] = useSetState({});
  const [fetchState, setFetchState] = useSetState({
    taskStatus: 'ALL',
    sourceType: 'ALL',
    destType: 'ALL',
    keyWords: '',
    pageNo: 0,
    loading: true,
    noMore: false,
    sort: { fieldName: '', sortDirection: null },
  });
  const [isFilterExpand, setIsFilterExpand] = useSetState({ sourceType: false, destType: false });
  const [showFilter, setShowFilter] = useState(false);
  const [sourceTypeTabList, setSourceTypeTabList] = useState([]);
  const [switchLoading, setSwitchLoading] = useState({});
  const [selectedTasks, setSelectedTasks] = useState([]);

  const FILTER_TYPES = [
    { title: _l('任务状态'), data: TASK_STATUS_TAB_LIST, key: 'taskStatus', hasExpand: false },
    { title: _l('源类型'), data: sourceTypeTabList, key: 'sourceType', hasExpand: false },
    { title: _l('目的地类型'), data: sourceTypeTabList, key: 'destType', hasExpand: false },
  ];
  const sortTypes = [null, SORT_TYPE.ASC, SORT_TYPE.DESC];

  const onSearch = useCallback(
    _.debounce(value => {
      setFetchState({ keyWords: value, loading: true, pageNo: 0 });
    }, 500),
    [],
  );

  useEffect(() => {
    //获取数据源类型列表
    const getTypeParams = {
      projectId,
      onlyRelatedTask: false,
      onlyCreated: false,
    };

    dataSourceApi.getTypes(getTypeParams).then(res => {
      if (res) {
        const list = res.map(item => {
          return { key: item.type, text: item.name };
        });
        setSourceTypeTabList([{ key: 'ALL', text: _l('全部') }, ...list]);
      }
    });
  }, []);

  useEffect(() => {
    if (!fetchState.loading) return;
    if (ajaxPromise) ajaxPromise.abort();

    //同步任务列表请求参数
    const fetchListParams = {
      projectId,
      pageNo: fetchState.pageNo,
      pageSize: 50,
      searchBody: fetchState.keyWords,
      status: fetchState.taskStatus === 'ALL' ? null : fetchState.taskStatus,
      sourceType: fetchState.sourceType === 'ALL' ? null : fetchState.sourceType,
      destType: fetchState.destType === 'ALL' ? null : fetchState.destType,
      sort: fetchState.sort,
    };
    //获取同步任务列表;
    ajaxPromise = syncTaskApi.list(fetchListParams);
    ajaxPromise.then(result => {
      if (result) {
        setTaskList(fetchState.pageNo > 0 ? taskList.concat(result.content) : result.content);
        setFetchState({ loading: false, noMore: result.content.length < 50 });
      }
    });
  }, [
    fetchState.taskStatus,
    fetchState.sourceType,
    fetchState.destType,
    fetchState.keyWords,
    fetchState.pageNo,
    fetchState.loading,
    fetchState.sort,
  ]);

  const switchTaskStatus = (checked, record) => {
    if (statusAjaxPromise) return;
    setSwitchLoading({ [record.id]: true });
    statusAjaxPromise = syncTaskApi[checked ? 'startTask' : 'stopTask']({
      projectId,
      taskId: record.id,
    });
    statusAjaxPromise
      .then(res => {
        statusAjaxPromise = null;
        setSwitchLoading({ [record.id]: false });
        if (checked ? res.isSucceeded : res) {
          alert(checked ? _l('启动同步任务成功') : _l('停止同步任务成功'));

          const newTaskList = taskList.map(item => {
            return item.id === record.id
              ? { ...item, taskStatus: checked ? TASK_STATUS_TYPE.RUNNING : TASK_STATUS_TYPE.STOP }
              : item;
          });

          setTaskList && setTaskList(newTaskList);
          onRefreshComponents(+new Date());
        } else {
          alert(
            res.errorMsg || (res.errorMsgList || [])[0] || (checked ? _l('开启同步任务失败') : _l('停止同步任务失败')),
            2,
          );
        }
      })
      .catch(() => {
        statusAjaxPromise = null;
        setSwitchLoading({ [record.id]: false });
      });
  };

  const batchStartEndTasks = isStart => {
    if (batchAjaxPromise) return;

    const taskIds = selectedTasks
      .filter(task =>
        isStart ? task.taskStatus !== TASK_STATUS_TYPE.RUNNING : task.taskStatus === TASK_STATUS_TYPE.RUNNING,
      )
      .map(task => task.id);

    if (!taskIds.length) {
      alert(isStart ? _l('任务都已开启') : _l('任务都已关闭'), 3);
      return;
    }

    setSwitchLoading({ ...taskIds.map(taskId => ({ [taskId]: true })) });
    batchAjaxPromise = syncTaskApi[isStart ? 'batchStartTask' : 'batchStopTask']({ projectId, taskIds });
    batchAjaxPromise
      .then(res => {
        batchAjaxPromise = null;
        setSwitchLoading({ ...taskIds.map(taskId => ({ [taskId]: false })) });
        if (isStart ? res.isSucceeded : res) {
          alert(isStart ? _l('启动同步任务成功') : _l('停止同步任务成功'));

          const newTaskList = taskList.map(item => {
            return taskIds.includes(item.id)
              ? { ...item, taskStatus: isStart ? TASK_STATUS_TYPE.RUNNING : TASK_STATUS_TYPE.STOP }
              : item;
          });

          setTaskList && setTaskList(newTaskList);
          setSelectedTasks(newTaskList.filter(task => selectedTasks.map(t => t.id).includes(task.id)));
          onRefreshComponents(+new Date());
        } else {
          alert(
            res.errorMsg || (res.errorMsgList || [])[0] || (isStart ? _l('开启同步任务失败') : _l('停止同步任务失败')),
            2,
          );
        }
      })
      .catch(() => {
        batchAjaxPromise = null;
        setSwitchLoading({ ...taskIds.map(taskId => ({ [taskId]: false })) });
      });
  };

  const onScrollEnd = () => {
    if (!fetchState.noMore && !fetchState.loading) {
      setFetchState({ pageNo: fetchState.pageNo + 1, loading: true });
    }
  };

  const columns = [
    {
      dataIndex: 'checkbox',
      renderTitle: () => {
        const checkableCount = taskList.filter(task => !task.errorInfo).length;
        const checked = checkableCount === selectedTasks.length;
        return !!selectedTasks.length ? (
          <Checkbox
            size="small"
            className={cx('taskItemCheckbox', { isShow: !!selectedTasks.length })}
            checked={checked}
            clearselected={!checked && !!selectedTasks.length}
            onClick={() => {
              setSelectedTasks(checked ? [] : taskList.filter(task => !task.errorInfo));
            }}
          />
        ) : null;
      },
      render: item => {
        const checked = !!selectedTasks.filter(task => task.id === item.id).length;
        return (
          <Checkbox
            size="small"
            className={cx('taskItemCheckbox', { isShow: checked })}
            checked={checked}
            disabled={!!item.errorInfo}
            onClick={() => {
              setSelectedTasks(
                checked ? selectedTasks.filter(task => task.id !== item.id) : selectedTasks.concat(item),
              );
            }}
          />
        );
      },
    },
    {
      dataIndex: 'taskName',
      title: _l('任务'),
      render: item => {
        return (
          <Link
            className="flexRow alignItemsCenter pRight8 pointer stopPropagation"
            to={`/integration/taskCon/${item.flowId}`}
          >
            <div className="flexRow alignItemsCenter pLeft8 titleColumn">
              <ToolTip text={item.sourceTypeName}>
                <TaskIcon>
                  <svg className="icon svg-icon" aria-hidden="true">
                    <use xlinkHref={`#icon${item.sourceClassName}`} />
                  </svg>
                  {item.sourceNum > 1 && <div className="sourceNum">{item.sourceNum}</div>}
                </TaskIcon>
              </ToolTip>
              <Icon icon="arrow_down" className="arrowIcon" />
              <ToolTip text={item.destTypeName}>
                <TaskIcon>
                  <svg className="icon svg-icon" aria-hidden="true">
                    <use xlinkHref={`#icon${item.destClassName}`} />
                  </svg>
                </TaskIcon>
              </ToolTip>
            </div>

            <span title={item.name} className="titleText overflow_ellipsis">
              {item.name}
            </span>
          </Link>
        );
      },
    },
    {
      dataIndex: 'taskStatus',
      title: _l('同步状态'),
      render: item => {
        return (
          <div
            className={cx('statusBox overflow_ellipsis WordBreak flexRow alignItemsCenter', {
              cursorDefault: [TASK_STATUS_TYPE.STOP, TASK_STATUS_TYPE.ERROR].indexOf(item.taskStatus) !== -1,
            })}
          >
            <Switch
              loading={switchLoading[item.id]}
              checkedChildren={_l('开启')}
              unCheckedChildren={_l('关闭%11001')}
              checked={item.taskStatus === TASK_STATUS_TYPE.RUNNING}
              onChange={checked => switchTaskStatus(checked, item)}
              disabled={!!item.errorInfo}
            />
            {item.taskStatus === TASK_STATUS_TYPE.CREATING && (
              <div className="flexRow alignItemsCenter">
                <LoadDiv size="small" className="mLeft8" />
                <span className="mLeft4 ThemeColor">{_l('创建中')}</span>
              </div>
            )}
            {(item.hasConfigUpdate || item.taskStatus === TASK_STATUS_TYPE.UN_PUBLIC) && !item.errorInfo && (
              <div className="flexRow alignItemsCenter">
                <Icon icon="info1" className="warnColor Font16 mLeft8" />
                <span className="mLeft4 ThemeColor">{item.hasConfigUpdate ? _l('有更新未发布') : _l('未发布')}</span>
              </div>
            )}
            {item.errorInfo && (
              <Trigger
                action={['hover']}
                getPopupContainer={() => document.body}
                popupVisible={errorInfoVisible[item.id]}
                onPopupVisibleChange={visible => setErrorInfoVisible({ [item.id]: visible })}
                popupAlign={{
                  points: ['bl', 'tl'],
                  offset: [0, -10],
                  overflow: { adjustX: true, adjustY: true },
                }}
                popup={
                  <ErrorInfoWrapper>
                    <div className="errorText">{item.errorInfo}</div>
                  </ErrorInfoWrapper>
                }
              >
                <Icon icon="info1" className="errorIcon" />
              </Trigger>
            )}
          </div>
        );
      },
    },
    {
      dataIndex: 'readRecord',
      render: item => <span className="Font14 Gray bold">{item.readRecord}</span>,
      renderTitle: () => {
        return (
          <div
            className="flexRow pointer"
            onClick={() => {
              if (fetchState.sort.fieldName !== 'readRecord') {
                sortFlag = 1;
              } else {
                sortFlag = sortFlag === 2 ? 0 : sortFlag + 1;
              }
              setFetchState({
                loading: true,
                pageNo: 0,
                sort: { fieldName: sortFlag === 0 ? '' : 'readRecord', sortDirection: sortTypes[sortFlag] },
              });
            }}
          >
            <span>{_l('已读取(行)')}</span>
            <div className="flexColumn mLeft6">
              <Icon
                icon="arrow-up"
                className={cx('sortIcon', {
                  selected:
                    fetchState.sort.fieldName === 'readRecord' && fetchState.sort.sortDirection === SORT_TYPE.ASC,
                })}
              />
              <Icon
                icon="arrow-down"
                className={cx('sortIcon', {
                  selected:
                    fetchState.sort.fieldName === 'readRecord' && fetchState.sort.sortDirection === SORT_TYPE.DESC,
                })}
              />
            </div>
          </div>
        );
      },
    },
    {
      dataIndex: 'writeRecord',
      render: item => <span className="Font14 Gray bold">{item.writeRecord}</span>,
      renderTitle: () => {
        return (
          <div
            className="flexRow pointer alignItemsCenter"
            onClick={() => {
              if (fetchState.sort.fieldName !== 'writeRecord') {
                sortFlag = 1;
              } else {
                sortFlag = sortFlag === 2 ? 0 : sortFlag + 1;
              }
              setFetchState({
                loading: true,
                pageNo: 0,
                sort: { fieldName: sortFlag === 0 ? '' : 'writeRecord', sortDirection: sortTypes[sortFlag] },
              });
            }}
          >
            <span>{_l('已写入(行)')}</span>
            <div className="flexColumn mLeft6 hrHeight">
              <Icon
                icon="arrow-up"
                className={cx('sortIcon', {
                  selected:
                    fetchState.sort.fieldName === 'writeRecord' && fetchState.sort.sortDirection === SORT_TYPE.ASC,
                })}
              />
              <Icon
                icon="arrow-down"
                className={cx('sortIcon', {
                  selected:
                    fetchState.sort.fieldName === 'writeRecord' && fetchState.sort.sortDirection === SORT_TYPE.DESC,
                })}
              />
            </div>

            <ToolTip className="mLeft5 h16" text={_l('工作表数据量大时会按队列分批写入，实际完成写入量略有延迟。')}>
              <Icon icon="info_outline" className="Gray_9e Font16" />
            </ToolTip>
          </div>
        );
      },
    },
    {
      dataIndex: 'createUser',
      render: item => {
        return (
          <div>
            <span>{item.creatorName}</span>
            <span className="Gray_9e">{` 创建于 ${formatDate(item.createTime)}`}</span>
          </div>
        );
      },
      renderTitle: () => {
        return (
          <div
            className="flexRow pointer pRight8"
            onClick={() => {
              if (fetchState.sort.fieldName !== 'createTime') {
                sortFlag = 1;
              } else {
                sortFlag = sortFlag === 2 ? 0 : sortFlag + 1;
              }
              setFetchState({
                loading: true,
                pageNo: 0,
                sort: { fieldName: sortFlag === 0 ? '' : 'createTime', sortDirection: sortTypes[sortFlag] },
              });
            }}
          >
            <span>{_l('创建人')}</span>
            <div className="flexColumn mLeft6">
              <Icon
                icon="arrow-up"
                className={cx('sortIcon', {
                  selected:
                    fetchState.sort.fieldName === 'createTime' && fetchState.sort.sortDirection === SORT_TYPE.ASC,
                })}
              />
              <Icon
                icon="arrow-down"
                className={cx('sortIcon', {
                  selected:
                    fetchState.sort.fieldName === 'createTime' && fetchState.sort.sortDirection === SORT_TYPE.DESC,
                })}
              />
            </div>
          </div>
        );
      },
    },
    {
      dataIndex: 'option',
      title: '',
      renderTitle: () => {
        return (
          <div
            className="optionIcon"
            onClick={() => {
              setTaskList([]);
              setFetchState({ pageNo: 0, loading: true });
            }}
          >
            <Icon icon="refresh1" className="Font18 pointer" />
          </div>
        );
      },
      render: item => (
        <OptionColumn
          projectId={projectId}
          record={item}
          taskList={taskList}
          setTaskList={setTaskList}
          onRefreshComponents={onRefreshComponents}
        />
      ),
    },
  ];

  return (
    <Fragment>
      <div className="filterContent">
        <p className="taskListText">{_l('任务列表')}</p>
        <div className="flexRowBetween">
          <div className="flexRow">
            <SearchInput
              className="searchInput"
              placeholder={_l('任务名称 / 创建人')}
              value={fetchState.keyWords}
              onChange={onSearch}
            />
            <div className="relative">
              <Icon
                icon="filter"
                className={cx('filterIcon', { isActive: showFilter })}
                onClick={() => setShowFilter(!showFilter)}
              />
              {!showFilter &&
                [fetchState.taskStatus, fetchState.sourceType, fetchState.destType].filter(item => item === 'ALL')
                  .length !== 3 && <RedDot />}
            </div>
          </div>
          {/* <div
              className="addTaskButton"
              onClick={() => {
                navigateTo(`/integration/taskCon/${props.currentProjectId}/null/task`);
              }}
            >
              <Icon icon="add" className="Font12" />
              <span className="mLeft6 bold">{_l('同步任务')}</span>
            </div> */}
        </div>

        {showFilter && (
          <div className="mTop16">
            {FILTER_TYPES.map((list, i) => {
              return (
                <FilterItem key={i} className={cx({ isExpand: isFilterExpand[list.key] })}>
                  <div className="itemText">{list.title}</div>
                  <ul>
                    {list.data.map((item, index) => (
                      <li
                        key={index}
                        title={item.text}
                        className={cx({ isActive: item.key === fetchState[list.key] })}
                        onClick={() => setFetchState({ [list.key]: item.key, pageNo: 0, loading: true })}
                      >
                        {item.text}
                      </li>
                    ))}

                    {list.hasExpand && (
                      <Icon
                        icon={isFilterExpand[list.key] ? 'arrow-up' : 'arrow-down'}
                        className="expandIcon"
                        onClick={() => setIsFilterExpand({ [list.key]: !isFilterExpand[list.key] })}
                      />
                    )}
                  </ul>
                </FilterItem>
              );
            })}
          </div>
        )}

        <DropMotion
          duration={200}
          animateOffset={24}
          style={{ position: 'absolute', width: '100%', top: 0, left: 0, zIndex: 2 }}
          visible={!!selectedTasks.length}
        >
          <SelectedWrapper>
            <div className="Font15 bold mRight40">{_l('已选择') + selectedTasks.length + _l('条记录')}</div>
            <div className="operateBtn mRight16" onClick={() => batchStartEndTasks(true)}>
              {_l('启动任务')}
            </div>
            <div className="operateBtn" onClick={() => batchStartEndTasks(false)}>
              {_l('停止任务')}
            </div>
          </SelectedWrapper>
        </DropMotion>
      </div>

      <div className="flexColumn h100 leftMove22">
        <TaskListBox>
          <div className={cx('itemWrapper mTop8', { isHeader: true })}>
            <div className="rowItem">
              {columns.map((item, index) => {
                return (
                  <div key={index} className={`${item.dataIndex}`}>
                    {item.renderTitle ? item.renderTitle() : item.title}
                  </div>
                );
              })}
            </div>
          </div>
        </TaskListBox>
        <ScrollView className="flex" onScrollEnd={onScrollEnd}>
          {taskList && taskList.length > 0 ? (
            <TaskListBox>
              {taskList.map((sourceItem, index) => {
                return (
                  <div className="itemWrapper">
                    <div key={index} className="rowItem">
                      {columns.map((item, i) => {
                        return (
                          <div key={i} className={`${item.dataIndex}`}>
                            {item.render ? item.render(sourceItem) : sourceItem[item.dataIndex]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </TaskListBox>
          ) : !fetchState.loading ? (
            <NoDataWrapper>
              <span className="iconCon InlineBlock TxtCenter ">
                <i className="icon-synchronization Font64 TxtMiddle" />
              </span>
              <p className="Gray_9e mTop20 mBottom0">
                {fetchState.searchKeyWords ? _l('无搜索结果，换一个关键词试试吧') : _l('暂无数据')}
              </p>
            </NoDataWrapper>
          ) : null}

          {fetchState.loading && <LoadDiv className="mTop10" />}
        </ScrollView>
      </div>
    </Fragment>
  );
}

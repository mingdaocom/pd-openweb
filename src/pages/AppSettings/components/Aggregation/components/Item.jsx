import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import { Switch } from 'antd';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Icon, Menu, MenuItem, Tooltip, UserHead } from 'ming-ui';
import AggTableAjax from 'src/pages/integration/api/aggTable.js';
import SyncTask from 'src/pages/integration/api/syncTask.js';
import customApi from 'statistics/api/custom.js';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
import { TASK_STATUS_TYPE } from 'src/pages/integration/dataIntegration/constant.js';
import { getTranslateInfo } from 'src/utils/app';
import MoveDialog from './MoveDialog';

const Wrap = styled.div`
  .flexShrink0 {
    flex-shrink: 0;
    min-width: 0;
  }
  background: #fff;
  min-height: 68px;
  padding: 12px 0;
  margin: 0 40px;
  .iconCon {
    width: 36px;
    height: 36px;
    border-radius: 5px;
    flex-shrink: 0;
    min-width: 0;
    background: #bdbdbd;
    &.isRun {
      background: #1677ff;
    }
    .iconTitle {
      color: #fff;
    }
  }
  .moreActive {
    opacity: 0;
    &.show {
      opacity: 1;
    }
  }
  &:hover {
    background: #fafafa;
    .moreActive {
      opacity: 1;
    }
  }
  .ant-switch-checked {
    background-color: #01ca83;
  }
`;

const WrapS = styled(Menu)`
  .ming.Item .Item-content .Icon {
    left: 15px;
  }
  .ming.MenuItem .Item-content:not(.disabled):hover {
    background: #f5f5f5 !important;
    color: initial !important;
    .icon {
      color: #9e9e9e !important;
    }
    .Red {
      color: red !important;
    }
  }
  .Red.ming.MenuItem .Item-content:not(.disabled):hover {
    color: red !important;
  }
`;
const WrapDialog = styled.div`
  .ic {
    span {
      padding: 4px 6px;
      border-radius: 3px;
      margin-left: -6px;
      &:hover {
        background: #f5f5f5;
      }
    }
  }
`;

const ReSyncDialog = ({ aggTableId, onClose, onChange, items, projectId, appId }) => {
  const [reCheck, setReCheck] = useState(false);
  const [reCheckLoading, setReCheckLoading] = useState(true);
  const [aggNameList, setAggNameList] = useState([]);

  useEffect(() => {
    setReCheckLoading(true);
    setAggNameList([]);
    AggTableAjax.preReSyncCheck(
      {
        projectId,
        appId,
        aggTableId,
      },
      { isAggTable: true },
    ).then(res => {
      setReCheck(true);
      setReCheckLoading(false);
      setAggNameList(res.aggNameList);
    });
  }, []);

  const handleOk = () => {
    setReCheckLoading(true);
    AggTableAjax.reSync(
      {
        projectId,
        appId,
        aggTableId,
      },
      { isAggTable: true },
    ).then(res => {
      let isSucceeded = (res || {}).isSucceeded;
      const { errorMsg, errorMsgList } = res;
      if (isSucceeded) {
        onChange(
          items.map(o => {
            if (o.aggTableId === aggTableId) {
              return { ...o, taskStatus: TASK_STATUS_TYPE.RUNNING };
            } else {
              return o;
            }
          }),
        );
        alert(_l('重新同步成功'));
      } else {
        alert(errorMsg ? errorMsg : errorMsgList ? errorMsgList[0] : _l('重新同步失败，请稍后再试'), 2);
      }
      onClose();
    });
  };

  return (
    <Dialog
      width={480}
      visible={true}
      title={_l('重新同步')}
      onCancel={onClose}
      okDisabled={reCheckLoading}
      okText={reCheckLoading && !reCheck ? _l('检测中...') : _l('确定')}
      onOk={handleOk}
    >
      <div class="">
        <div class="Gray Font14">{_l('重新获取数据源数据')}</div>
        {reCheck && aggNameList.length > 0 && (
          <div class="mTop5">
            <div className="Gray_9e">{_l('以下%0个聚合表使用该数据源', aggNameList.length)}</div>
            {aggNameList.map(o => {
              return <div className="mTop8">{o}</div>;
            })}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default function ItemCard(props) {
  const { item, items, onEdit, onChange, projectId, displayType, appId, onRefresh, canEdit } = props;
  const trigger = useRef(null);
  const [{ showChangeName, showMoreOption, updating, showMoveDialog, showReSync }, setState] = useSetState({
    showChangeName: false,
    showMoreOption: false,
    updating: false,
    showMoveDialog: false,
    showReSync: false,
  });

  const updateName = name => {
    SyncTask.updateSyncTask(
      {
        projectId,
        taskId: item.id,
        name,
      },
      { isAggTable: true },
    ).then(res => {
      if (res) {
        alert(_l('名称修改成功'));
        onChange(
          items.map(o => {
            return item.id === o.id ? { ...item, name } : o;
          }),
        );
      } else {
        alert(_l('名称修改失败'), 2);
      }
    });
  };
  const onCopy = () => {
    AggTableAjax.copy(
      {
        appId,
        projectId,
        aggTableId: item.aggTableId,
        name: `${item.name}-${_l('复制')}`,
      },
      { isAggTable: true },
    ).then(() => {
      onRefresh();
    });
  };
  const changeTask = taskStatus => {
    if (updating) {
      return;
    }
    let Ajax = null;
    setState({
      updating: true,
    });
    if (taskStatus === TASK_STATUS_TYPE.RUNNING) {
      Ajax = SyncTask.stopTask({ projectId, taskId: item.id }, { isAggTable: true });
    } else {
      Ajax = SyncTask.startTask({ projectId, taskId: item.id }, { isAggTable: true });
    }
    Ajax.then(
      res => {
        setState({
          updating: false,
        });
        let isSucceeded = taskStatus === TASK_STATUS_TYPE.RUNNING ? res : (res || {}).isSucceeded;
        const { errorMsg, errorMsgList, worksheetId } = res;
        if (isSucceeded) {
          onChange(null, {
            ...item,
            worksheetId: worksheetId || item.worksheetId,
            aggTableTaskStatus: 1,
            errorInfo: taskStatus !== TASK_STATUS_TYPE.RUNNING ? '' : item.errorInfo,
            taskStatus: taskStatus !== TASK_STATUS_TYPE.RUNNING ? TASK_STATUS_TYPE.RUNNING : TASK_STATUS_TYPE.STOP,
          });
        } else {
          alert(errorMsg ? errorMsg : errorMsgList ? errorMsgList[0] : _l('操作失败，请稍后再试'), 2);
        }
      },
      () => {
        setState({
          updating: false,
        });
      },
    );
  };
  const checkItem = () => {
    const deleteDia = () => {
      Dialog.confirm({
        title: (
          <span style={{ color: '#f44336' }} className="WordBreak">
            {_l('删除聚合表“%0”', item.name)}
          </span>
        ),
        buttonType: 'danger',
        anim: false,
        okText: _l('删除'),
        description: (
          <div className="pBottom6 pTop8">
            <span className="Gray">{_l('此聚合表未被任何统计图引用，删除后不可恢复、不可再被引用。')}</span>
          </div>
        ),
        onOk: onDeleteItem,
      });
    };
    if (item.worksheetId) {
      customApi
        .getReportsByWorksheetId({
          worksheetId: item.worksheetId,
        })
        .then(res => {
          const hasGet = res.length > 0; //被引用，无法直接删除
          if (hasGet) {
            Dialog.confirm({
              title: (
                <span style={{ color: '#f44336' }} className="WordBreak">
                  {_l('无法直接删除聚合表“%0”', item.name)}
                </span>
              ),
              buttonType: 'danger',
              anim: false,
              okText: _l('关闭'),
              removeCancelBtn: true,
              type: 'scroll',
              description: (
                <WrapDialog>
                  <span className="Gray">
                    {_l('此聚合表正在被以下统计图引用，无法直接删除。请先解除引用关系后再删除聚合表。')}
                  </span>
                  {res.map((it, i) => {
                    return (
                      <div className="mTop20" key={`${it.apkName}_${i}`}>
                        <div className="Gray Bold">{it.apkName}</div>
                        {(it.reports || []).map((o, n) => {
                          return (
                            <div className="ic mTop6" key={`${it.apkName}-${o.reportName}-${n}`}>
                              <span
                                className="Gray ThemeHoverColor3 Hand"
                                onClick={() => {
                                  window.open(`/worksheet/${o.pageId}`);
                                }}
                              >
                                {`${it.apkName} - ${o.reportName}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </WrapDialog>
              ),
              onOk: () => {},
            });
          } else {
            deleteDia();
          }
        });
    } else {
      deleteDia();
    }
  };
  const onDeleteItem = () => {
    SyncTask.deleteTask({ projectId, taskId: item.id }, { isAggTable: true }).then(res => {
      if (res) {
        alert(_l('删除成功'));
        onChange(items.filter(o => o.aggTableId !== item.aggTableId));
      } else {
        alert(_l('删除失败'), 2);
      }
    });
  };

  return (
    <Wrap className="flexRow alignItemsCenter">
      <div
        className="flex mLeft10 mRight20 flexRow alignItemsCenter Hand"
        style={{ minWidth: 120 }}
        onClick={e => {
          e.stopPropagation();
          onEdit();
        }}
      >
        <div
          className={cx(
            'iconCon flexRow alignItemsCenter justifyContentCenter flexShrink0',
            item.taskStatus !== TASK_STATUS_TYPE.RUNNING ? '' : 'isRun',
          )}
        >
          <Icon icon={'aggregate_table'} className={cx('iconTitle Font24')} />
        </div>
        <Tooltip popupPlacement="topLeft" text={<span className="InlineBlock WordBreak">{item.name}</span>}>
          <span
            className={cx(
              'mLeft12 flex WordBreak overflow_ellipsis flexShrink0 ThemeHoverColor3 Hand Font14',
              item.taskStatus !== TASK_STATUS_TYPE.RUNNING ? 'Gray_75' : 'Gray',
            )}
          >
            {item.name}
          </span>
        </Tooltip>
      </div>
      <div className="flex mRight20 alignItemsCenter WordBreak minWidth100">
        <Tooltip
          autoCloseDelay={0}
          text={
            <span className="InlineBlock WordBreak">
              {(item.datasources || []).map((o, i) => {
                return (
                  <React.Fragment key={o.tableName + i}>
                    {o.isDelete ? _l('已删除') : getTranslateInfo(o.appId, null, o.workSheetId).name || o.tableName}
                    {i < (item.datasources || []).length - 1 && '、'}
                  </React.Fragment>
                );
              })}
            </span>
          }
        >
          <span
            className={cx(
              'flex WordBreak flexShrink0 Hand Font14',
              item.taskStatus !== TASK_STATUS_TYPE.RUNNING ? 'Gray_75' : 'Gray',
            )}
          >
            {(item.datasources || []).map((o, i) => {
              return (
                <React.Fragment key={o.tableName + i}>
                  <span className={cx('', { Red: o.isDelete })}>
                    {' '}
                    {o.isDelete ? _l('已删除') : getTranslateInfo(o.appId, null, o.workSheetId).name || o.tableName}
                  </span>
                  {i < (item.datasources || []).length - 1 && '、'}
                </React.Fragment>
              );
            })}
          </span>
        </Tooltip>
      </div>
      <div className="w150px minWidth100 flexRow mRight20">
        <div className="flex alignItemsCenter" onClick={e => e.stopPropagation()}>
          <Switch
            checkedChildren={_l('开启')}
            unCheckedChildren={_l('关闭%01019')}
            className="TxtMiddle tableSwitch mRight10"
            checked={item.taskStatus === TASK_STATUS_TYPE.RUNNING}
            onChange={() => {
              if (!canEdit) return;
              changeTask(item.taskStatus);
            }}
            loading={updating}
          />
          {item.aggTableTaskStatus === 0 && <span className="Gray_9e Font12">{_l('未发布')}</span>}
          {item.taskStatus !== TASK_STATUS_TYPE.RUNNING && item.errorInfo && (
            <Tooltip
              tooltipStyle={{
                maxWidth: 350,
                maxHeight: 300,
                overflow: 'auto',
              }}
              autoCloseDelay={0}
              text={<span className="InlineBlock WordBreak">{item.errorInfo}</span>}
            >
              <Icon type={'error'} className="Red Font16 TxtMiddle InlineBlock" />
            </Tooltip>
          )}
        </div>
      </div>
      <div className="w180px pRight20 mRight20 flexRow alignItemsCenter">
        <span className="Gray_9e">{`${createTimeSpan(item[displayType])}`}</span>
      </div>
      <div className="w100px minWidth100 mRight20 Gray_75 flexRow alignItemsCenter">
        <UserHead
          className="createHeadImg circle userAvarar pointer userMessage"
          user={{
            userHead: item.creatorAvatar,
            accountId: item.createBy,
          }}
          size={24}
          appId={appId}
          projectId={projectId}
        />
        <span className="mLeft8 WordBreak overflow_ellipsis">{item.creatorName}</span>
      </div>
      <div
        className={cx(
          'w50px mRight20 Bold ',
          item.aggTableTaskStatus !== 0 ? 'ThemeColor Hand ThemeHoverColor3' : 'Gray_9e',
        )}
        onClick={() => {
          if (item.aggTableTaskStatus === 0 || !canEdit) {
            return;
          }
          window.open(`/aggregation/${item.worksheetId}`);
        }}
      >
        {_l('查看')}
      </div>
      <div className="w20px mRight20">
        {!canEdit ? (
          <span />
        ) : (
          <Trigger
            ref={trigger}
            action={['click']}
            popup={
              <WrapS>
                <MenuItem
                  icon={<Icon className="Font16" icon={'edit'} />}
                  onClick={event => {
                    setState({
                      showMoreOption: false,
                      showChangeName: true,
                    });
                    event.stopPropagation();
                  }}
                >
                  <div className="mLeft16 Gray">{_l('重命名')}</div>
                </MenuItem>
                <MenuItem
                  icon={<Icon className="Font16" icon={'copy'} />}
                  onClick={event => {
                    setState({
                      showMoreOption: false,
                    });
                    onCopy(item);
                    event.stopPropagation();
                  }}
                >
                  <div className="mLeft16 Gray">{_l('复制')}</div>
                </MenuItem>
                <MenuItem
                  onClick={event => {
                    setState({
                      showMoveDialog: true,
                      showMoreOption: false,
                    });
                    event.stopPropagation();
                  }}
                  icon={<Icon className="Font16" icon={'swap_horiz'} />}
                >
                  <div className="mLeft16 Gray">{_l('移动到')}</div>
                </MenuItem>
                {item.taskStatus === TASK_STATUS_TYPE.RUNNING && (
                  <MenuItem
                    onClick={event => {
                      setState({ showMoreOption: false, showReSync: true });
                      event.stopPropagation();
                    }}
                    icon={<Icon className="Font16" icon={'ic_refresh_black'} />}
                  >
                    <div className="mLeft16 Gray">{_l('重新同步')}</div>
                  </MenuItem>
                )}
                {item.taskStatus !== TASK_STATUS_TYPE.RUNNING && (
                  <MenuItem
                    icon={<Icon icon={'trash'} className="Red Font16" />}
                    className="Red"
                    onClick={event => {
                      event.stopPropagation();
                      setState({
                        showMoreOption: false,
                      });
                      checkItem();
                    }}
                  >
                    <div className="mLeft16">{_l('删除')}</div>
                  </MenuItem>
                )}
              </WrapS>
            }
            popupClassName={cx('dropdownTrigger PolymerizationTrigge')}
            popupVisible={showMoreOption}
            onPopupVisibleChange={visible => {
              setState({
                showMoreOption: visible,
              });
            }}
            popupAlign={{
              points: ['tl', 'bl'],
              offset: [0, 1],
              overflow: {
                adjustX: true,
                adjustY: true,
              },
            }}
          >
            <Icon
              icon="more_horiz"
              className={cx(
                'moreActive Hand Font20 mLeft6 Gray_9e ThemeHoverColor3',
                showMoreOption && 'show ThemeColor3',
              )}
              onClick={e => e.stopPropagation()}
            />
          </Trigger>
        )}
      </div>
      {showReSync && (
        <ReSyncDialog
          aggTableId={item.aggTableId}
          onClose={() => setState({ showReSync: false })}
          onChange={onChange}
          items={items}
          projectId={projectId}
          appId={appId}
        />
      )}
      {showChangeName && (
        <ChangeName
          name={item.name}
          onCancel={() => {
            setState({
              showChangeName: false,
            });
          }}
          onChange={name => {
            updateName(name);
            setState({
              showChangeName: false,
            });
          }}
        />
      )}
      {showMoveDialog && (
        <MoveDialog
          item={item}
          appId={appId}
          projectId={projectId}
          onCancel={() => {
            setState({
              showMoveDialog: false,
            });
          }}
          onOk={() => {
            onChange(items.filter(o => o.aggTableId !== item.aggTableId));
          }}
        />
      )}
    </Wrap>
  );
}

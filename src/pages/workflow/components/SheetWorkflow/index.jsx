import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Drawer } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { Icon, LoadDiv, ScrollView, UserHead } from 'ming-ui';
import instance from 'src/pages/workflow/api/instance';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import MobileOtherAction from 'mobile/ProcessRecord/OtherAction';
import OtherAction from 'src/pages/workflow/components/ExecDialog/components/OtherAction';
import { ACTION_TO_METHOD } from 'src/pages/workflow/components/ExecDialog/config';
import Steps from 'src/pages/workflow/components/ExecDialog/Steps';
import { covertTime, INSTANCELOG_STATUS } from 'src/pages/workflow/MyProcess/config';
import { browserIsMobile } from 'src/utils/common';
import { dateConvertToUserZone, handlePushState, handleReplaceState } from 'src/utils/project';
import StepHeader from '../ExecDialog/StepHeader';
import WorkflowAction, { TaskRevokeAction } from './Action';
import './index.less';

const isMobile = browserIsMobile();

const renderTimeConsuming = (createDate, completeDate) => {
  const timeConsuming = moment(createDate) - moment(completeDate);
  if (timeConsuming) {
    return (
      <div className="flexRow valignWrapper mBottom12">
        <div className="Font13 Gray_75 label">{_l('整体耗时')}</div>
        <div>{covertTime(timeConsuming)}</div>
      </div>
    );
  }
};

const renderState = data => {
  const { status, completed, flowNode, instanceLog, workItem } = data;
  const { type } = flowNode || {};
  const allowReset = status === 6;

  if (allowReset) {
    return (
      <div className="state bold valignWrapper Font13" style={{ backgroundColor: '#bdbdbd', color: '#fff' }}>
        {_l('流程撤回')}
      </div>
    );
  }

  if (workItem) {
    if (type === 3 || type === 0)
      return (
        <span className="bold" style={{ color: '#2196F3' }}>
          {_l('等我填写...')}
        </span>
      );
    if (type === 4)
      return (
        <span className="bold" style={{ color: '#2196F3' }}>
          {_l('等我审批...')}
        </span>
      );
  } else {
    if (type === 3 || type === 0) return <span className="bold Gray_75">{_l('填写中...')}</span>;
    if (type === 4) return <span className="bold Gray_75">{_l('审批中...')}</span>;
  }

  if (completed) {
    const instanceStatus = status === 3 || status === 4 ? instanceLog.status : status;
    const { text, bg, icon } = INSTANCELOG_STATUS[instanceStatus];
    return (
      <div className="state bold valignWrapper" style={{ backgroundColor: bg }}>
        {icon ? <Icon icon={icon} className="mRight5" /> : null}
        <div className="Font13">{text}</div>
      </div>
    );
  }
};

const renderSurplusTime = data => {
  const { workItem } = data;
  let currentAccountNotified = false;
  const workItems = (_.get(workItem, 'workId') ? [workItem] : []).filter(item => {
    if (item.executeTime) {
      currentAccountNotified = true;
    }
    return _.includes([3, 4], item.type) && !item.operationTime && item.dueTime;
  });

  if (!workItems.length) return null;

  const time = moment() - moment(workItems[0].dueTime) || 0;

  return (
    <div className="flexRow valignWrapper mBottom12">
      <div className="Font13 Gray_75 label">{_l('剩余时间')}</div>
      <div>
        <span
          className="stepTimeConsuming flexRow"
          style={{
            color: time > 0 ? '#F44336' : currentAccountNotified ? '#FF9800' : undefined,
          }}
        >
          {time > 0 ? _l('已超时%0', covertTime(time)) : covertTime(time)}
        </span>
      </div>
    </div>
  );
};

function CurrentWorkItems(props) {
  const { formWidth, data, appId, projectId } = props;
  const { type } = data.flowNode || {};
  const allCurrentWorkItems = (data.currentWorkItems || []).filter(c => c.operationType !== 5);
  const [currentWorkItems, setCurrentWorkItems] = useState(allCurrentWorkItems);
  const wrapRef = useRef();

  useEffect(() => {
    if (currentWorkItems.length && wrapRef.current) {
      const { clientWidth } = wrapRef.current;
      const accountWidth = 24;
      const accountRightMargin = 8;
      const count = Math.floor(clientWidth / (accountWidth + accountRightMargin));
      setCurrentWorkItems(allCurrentWorkItems.slice(0, count - 1));
    }
  }, [formWidth]);

  return (
    !!(currentWorkItems || []).length && (
      <div className="flexRow valignWrapper mBottom12">
        <div className="Font13 Gray_75 label">{type === 4 ? _l('审批人') : _l('填写人')}</div>
        <div className="flex flexRow valignWrapper flexWrap" ref={wrapRef}>
          {currentWorkItems.map(data => (
            <span className="InlineBlock Relative mRight8">
              {data.workItemAccount.accountId === md.global.Account.accountId ? (
                <div className="flexRow valignWrapper myAvatar">{_l('我')}</div>
              ) : (
                <UserHead
                  size={24}
                  user={{ userHead: data.workItemAccount.avatar, accountId: data.workItemAccount.accountId }}
                  appId={appId}
                  projectId={projectId}
                />
              )}
              <Fragment>
                {(data.operationType === 1 || _.get(data, 'workItemLog.action') === 17) && (
                  <div className="flexRow valignWrapper approveState pass">
                    <Icon className="Font12" icon="ok" />
                  </div>
                )}
                {data.operationType === 4 && (
                  <div className="flexRow valignWrapper approveState overrule">
                    <Icon className="Font12" icon="clear" />
                  </div>
                )}
              </Fragment>
            </span>
          ))}
          {allCurrentWorkItems.length !== currentWorkItems.length && (
            <span className="InlineBlock Relative mRight8">
              <div className="flexRow valignWrapper hideAvatar">
                +{allCurrentWorkItems.length - currentWorkItems.length}
              </div>
            </span>
          )}
        </div>
      </div>
    )
  );
}

function WorkflowCard(props) {
  const { data, currentWorkflow, formWidth, appId, projectId, isCharge } = props;
  const { onAction, onRevoke, onUrge, onViewFlowStep, onViewExecDialog, onReset } = props;
  const {
    currents,
    createDate,
    completeDate,
    revokeDate,
    completed,
    createAccount,
    flowNode,
    workItem,
    process,
    status,
  } = data;
  const currentWorkItems = data.currentWorkItems || [];
  const receiveTime = _.get(workItem, 'receiveTime') || _.get(currentWorkItems[0], 'receiveTime');
  const isBranch = !!(currents || []).length;
  const getIsRevoke = () => {
    const current = currents[0];
    const { allowRevoke, allowApproval, workItem } = current;
    return isBranch && ((allowRevoke && allowApproval) || workItem ? false : allowRevoke);
  };
  const allowReset = status === 6;
  const handleRevoke = () => {
    onRevoke(currents[0]);
  };

  const renderContent = data => {
    const { flowNode } = data;
    const { name } = flowNode || {};
    return (
      <div
        className={cx('flexColumn itemWrapper', { mTop18: !isBranch })}
        onClick={isBranch ? () => onViewFlowStep(data) : undefined}
      >
        {!allowReset && (
          <Fragment>
            {name && (
              <div className="flexRow valignWrapper mBottom12">
                <div className="flexRow valignWrapper flex">
                  <div className="Font13 Gray_75 label">{_l('当前节点')}</div>
                  <div className="flowNodeName Gray">{name}</div>
                </div>
                {isBranch && renderState(data)}
              </div>
            )}
            <CurrentWorkItems data={data} formWidth={formWidth} appId={appId} projectId={projectId} />
            {receiveTime && (
              <div className="flexRow valignWrapper mBottom12">
                <div className="Font13 Gray_75 label">{_l('处理开始')}</div>
                <div>{dateConvertToUserZone(receiveTime)}</div>
              </div>
            )}
          </Fragment>
        )}
        {completeDate && (
          <div className="flexRow valignWrapper mBottom12">
            <div className="Font13 Gray_75 label">{_l('完成时间')}</div>
            <div>{dateConvertToUserZone(completeDate)}</div>
          </div>
        )}
        {completed && renderTimeConsuming(createDate, completeDate)}
        {allowReset && (
          <Fragment>
            <div className="flexRow valignWrapper mBottom12">
              <div className="Font13 Gray_75 label">{_l('完成时间')}</div>
              <div>{dateConvertToUserZone(revokeDate)}</div>
            </div>
            {renderTimeConsuming(createDate, revokeDate)}
          </Fragment>
        )}
        {renderSurplusTime(data)}
      </div>
    );
  };

  return (
    <div className={cx('workflowCard', isMobile ? 'mBottom10' : 'mBottom18')}>
      <div className={cx({ pointer: !isBranch })} onClick={!isBranch ? () => onViewFlowStep(data) : undefined}>
        <div className="flexRow valignWrapper">
          <UserHead
            size={32}
            user={{ userHead: createAccount.avatar, accountId: createAccount.accountId }}
            appId={appId}
            projectId={projectId}
          />
          <div className="flexColumn flex mLeft10">
            <div className="Font15 bold Gray">{process.name}</div>
            <div className="Font13 Gray_75">
              {_l(
                '%0 于 %1 发起',
                createAccount.accountId === md.global.Account.accountId ? _l('我') : createAccount.fullName,
                createTimeSpan(dateConvertToUserZone(createDate)),
              )}
            </div>
          </div>
          {isBranch && getIsRevoke() && (
            <div className="ThemeColor bold Font14 pointer" onClick={handleRevoke}>
              {_l('撤回')}
            </div>
          )}
          {!isBranch && renderState(data)}
        </div>
        {isBranch && (
          <Fragment>
            <div className="branchNode" style={{ margin: '5px 0 5px 43px' }}>
              {_l('%0个节点办理中...', (currents || []).length)}
            </div>
            <div className="branchNodeLine" />
          </Fragment>
        )}
        {isBranch
          ? currents
              .map(data => {
                data.parentCurrents = currents;
                return data;
              })
              .map((data, index) => (
                <Fragment key={data.workId}>
                  <div className={cx('branchWrap pointer', { hover: !isMobile })}>
                    {renderContent(data)}
                    <WorkflowAction
                      className={cx('mTop20', { mBottom5: index !== currents.length - 1 })}
                      appId={appId}
                      projectId={projectId}
                      isBranch={isBranch}
                      isCharge={isCharge}
                      data={data}
                      currentWorkflow={currentWorkflow}
                      {...{ onAction, onRevoke, onUrge, onReset, onViewExecDialog }}
                    />
                  </div>
                  {index !== currents.length - 1 && <div className="branchWrapLine" />}
                </Fragment>
              ))
          : renderContent(data)}
      </div>
      {!isBranch && !completed && (
        <WorkflowAction
          className="mTop20"
          appId={appId}
          projectId={projectId}
          isBranch={isBranch}
          isCharge={isCharge}
          data={data}
          currentWorkflow={currentWorkflow}
          {...{ onAction, onRevoke, onUrge, onReset, onViewExecDialog }}
        />
      )}
    </div>
  );
}

export default function SheetWorkflow(props) {
  const {
    isCharge,
    projectId,
    worksheetId,
    recordId,
    formWidth,
    refreshBtnNeedLoading,
    appId,
    controls = [],
    reloadRecord,
  } = props;
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState({});
  const [workflowVisible, setWorkflowVisible] = useState(false);
  const [viewWorkflow, setViewWorkflow] = useState(null);
  const [actionVisible, setActionVisible] = useState(false);
  const [allowTaskRevokeBackNodeId, setAllowTaskRevokeBackNodeId] = useState(null);
  const [ProcessRecord, setProcessRecord] = useState(null);

  const getList = () => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      const param = {
        startAppId: worksheetId,
        startSourceId: recordId,
      };
      Promise.all([
        instanceVersion.getTodoList2(param),
        instanceVersion.getTodoList2({
          ...param,
          complete: true,
        }),
      ]).then(result => {
        const [unfinished, completed] = result;
        const list = unfinished.concat(
          completed.map(data => {
            return { ...data, completed: true };
          }),
        );
        setList(list);
        setLoading(false);
        if (list.length === 1 && unfinished.length === 1) {
          const firstData = list[0];
          if (_.get(firstData, 'currents.length')) {
            const data = firstData.currents.filter(n => {
              const userIds = n.currentWorkItems.map(n => n.workItemAccount.accountId);
              return userIds.includes(md.global.Account.accountId);
            });
            handleViewFlowStep(data[0] || firstData.currents[0]);
          } else {
            handleViewFlowStep(firstData);
          }
        } else {
          resolve(list);
        }
      });
    });
  };

  const getWorkflow = (data, param) => {
    const api = data.workItem ? instanceVersion.get : instanceVersion.get2;
    return api({
      id: data.id,
      workId: data.workId,
    }).then(instance => {
      setCurrentWorkflow({
        ...instance,
        ...param,
        cardData: data,
        instanceId: data.id,
      });
    });
  };

  const handleAction = ({ action, content, userId, backNodeId, signature, files, nextUserRange }) => {
    if (_.includes(['pass', 'overrule', 'return', 'submit', 'revoke'], action)) {
      handleRequest(ACTION_TO_METHOD[action === 'return' ? 'overrule' : action], {
        opinion: content,
        backNodeId,
        signature,
        files,
        nextUserRange,
      }).then(() => {
        setActionVisible(false);
        handleCloseDrawer();
        getList().then(list => {
          const { cardData } = currentWorkflow;
          if (workflowVisible) {
            const card = _.find(list, { id: cardData.id });
            card && handleViewFlowStep(card);
          }
        });
      });
    }
    if (action === 'taskRevoke') {
      const { works } = currentWorkflow;
      const data = _.find(works, { allowTaskRevokeBackNodeId });
      instance['taskRevoke']({
        id: data.instanceId,
        workId: data.workId,
        opinion: content,
        backNodeId,
        files,
      }).then(() => {
        setActionVisible(false);
        handleCloseDrawer();
        getList();
      });
    }
  };

  const handleRequest = (action, restPara = {}) => {
    let { id, workId, revokeWorkId } = currentWorkflow.cardData || {};
    if (action === 'revoke') {
      workId = revokeWorkId;
    }
    return instance[action]({ id, workId, ...restPara });
  };

  const handleCloseDrawer = () => {
    setAllowTaskRevokeBackNodeId(null);
    setWorkflowVisible(false);
    setCurrentWorkflow({});
  };

  const handleQuickAction = (data, value) => {
    getWorkflow(data, {
      value,
    }).then(() => {
      setCurrentWorkflow(currentWorkflow => {
        return { ...currentWorkflow, instanceId: data.id };
      });
      setActionVisible(true);
    });
  };

  const handleRevoke = data => {
    const { cardData, currentWork } = currentWorkflow;
    instanceVersion
      .get2({
        id: data.id,
        workId: data.revokeWorkId,
      })
      .then(instance => {
        setCurrentWorkflow({
          ...instance,
          opinionTemplate: instance.opinionTemplate || {},
          value: 'revoke',
          cardData: {
            ...cardData,
            id: data.id,
            workId: data.workId,
            revokeWorkId: data.revokeWorkId,
          },
          currentWork,
          instanceId: data.id,
        });
        setActionVisible(true);
      });
  };

  const handleTaskRevoke = () => {
    const { works, cardData, currentWork } = currentWorkflow;
    const data = _.find(works, { allowTaskRevokeBackNodeId });
    instanceVersion
      .get2({
        id: data.instanceId,
        workId: data.workId,
      })
      .then(instance => {
        setCurrentWorkflow({
          ...instance,
          allowTaskRevokeBackNodeId,
          opinionTemplate: instance.opinionTemplate || {},
          value: 'taskRevoke',
          cardData,
          currentWork,
          instanceId: data.instanceId,
        });
        setActionVisible(true);
      });
  };

  const handleUrge = data => {
    handleRequest('operation', {
      id: data.id,
      operationType: 18,
    }).then(result => {
      if (result) {
        window[`urgeDisable-workId-${data.workId}`] = true;
        const { cardData = {} } = currentWorkflow;
        if (cardData.workId === data.workId) {
          setCurrentWorkflow({
            ...currentWorkflow,
            cardData: {
              ...cardData,
              urgeDisable: true,
            },
          });
        }
        setList(
          list.map(item => {
            if (item.id === data.id) {
              if (_.get(item, 'currents.length')) {
                const currents = item.currents.map(item => {
                  if (item.workId === data.workId) {
                    return {
                      ...item,
                      urgeDisable: true,
                    };
                  } else {
                    return item;
                  }
                });
                return {
                  ...item,
                  currents,
                };
              }
              return {
                ...item,
                urgeDisable: true,
              };
            } else {
              return item;
            }
          }),
        );
        alert(_l('催办成功'));
      }
    });
  };

  const handleSkip = data => {
    handleRequest('operation', {
      id: data.id,
      operationType: 15,
    }).then(result => {
      if (result) {
        alert(_l('已跳过当前节点'));
        handleCloseDrawer();
        getList().then(list => {
          const { cardData } = currentWorkflow;
          const card = _.find(list, { id: cardData.id });
          card && handleViewFlowStep(card);
        });
      }
    });
  };

  const handleUpdateWorkAccounts = (data, ids) => {
    handleRequest('operation', {
      id: data.id,
      operationType: 14,
      forwardAccountId: ids.join(','),
    }).then(result => {
      if (result) {
        alert(_l('操作成功'));
        handleCloseDrawer();
        getList().then(list => {
          const { cardData } = currentWorkflow;
          const card = _.find(list, { id: cardData.id });
          card && handleViewFlowStep(card);
        });
      }
    });
  };

  const handleReset = data => {
    handleRequest('submit', {
      id: data.id,
      workId: data.workId,
    }).then(result => {
      if (result) {
        alert(_l('提交成功'));
        handleCloseDrawer();
        getList();
      }
    });
  };

  const handleEndInstance = data => {
    instanceVersion
      .endInstance({
        instanceId: data.id,
      })
      .then(result => {
        if (result) {
          alert(_l('操作成功'));
          handleCloseDrawer();
          getList();
        }
      });
  };

  const handleViewFlowStep = data => {
    getWorkflow(data, {
      processId: data.process.id,
      workItem: data.workItem,
      completed: data.completed,
    }).then(() => {
      setWorkflowVisible(true);
    });
  };

  const handleViewExecDialog = data => {
    handlePushState('page', 'processRecord');
    setViewWorkflow({
      id: data.id,
      workId: data.workId,
    });
  };

  useEffect(() => {
    if (isMobile) {
      import('src/pages/Mobile/ProcessRecord').then(component => {
        setProcessRecord(component);
      });
    } else {
      import('src/pages/workflow/components/ExecDialog').then(component => {
        setProcessRecord(component);
      });
    }
  }, []);

  useEffect(() => {
    handleCloseDrawer();
    getList();
  }, [recordId]);

  useEffect(() => {
    if (refreshBtnNeedLoading) {
      handleCloseDrawer();
      getList();
    }
  }, [refreshBtnNeedLoading]);

  useEffect(() => {
    window.addEventListener('popstate', onQueryChange);
    return () => {
      window.removeEventListener('popstate', onQueryChange);
    };
  }, []);

  const onQueryChange = () => {
    handleReplaceState('page', 'processRecord', () => setViewWorkflow(null));
  };

  const renderStepItem = () => {
    const { processId, cardData = {}, processName, works = [], workItem, currentWorkItem, status } = currentWorkflow;
    const { id, workId, flowNode, completed, parentCurrents = [] } = cardData;
    const allowTaskRevokeWorks = works.filter((_, index) => index).filter(n => n.allowTaskRevokeBackNodeId && isCharge);
    const currentWork = (function () {
      if (allowTaskRevokeBackNodeId) {
        return _.find(works, { allowTaskRevokeBackNodeId });
      }
      if (parentCurrents.length) {
        return _.find(parentCurrents, { workId });
      }
      return currentWorkflow.currentWork;
    })();
    const stepsCurrents = (function () {
      if (parentCurrents.length) {
        return parentCurrents.concat(allowTaskRevokeWorks);
      }
      return allowTaskRevokeWorks.length ? allowTaskRevokeWorks.concat(currentWorkflow.currentWork || []) : [];
    })();
    return (
      <div className="h100 flexColumn">
        <StepHeader
          processId={processId}
          instanceId={id}
          processName={processName}
          hasBack={true}
          currentWork={currentWork}
          onClose={handleCloseDrawer}
          isApproval
        />
        {!!parentCurrents.length && (
          <div className="branchNode" style={{ margin: isMobile ? '3px 0px 6px 35px' : '3px 0px 6px 55px' }}>
            {_l('%0个节点办理中...', parentCurrents.length)}
          </div>
        )}
        <ScrollView className="flex">
          <Steps
            worksheetId={worksheetId}
            rowId={recordId}
            currentWork={currentWork}
            currentType={_.get(currentWork, 'flowNode.type')}
            currents={stepsCurrents.map(n => n.workId)}
            onChangeCurrentWork={workId => {
              if (allowTaskRevokeWorks.length) {
                const work = _.find(works, { workId }) || {};
                if (work.allowTaskRevokeBackNodeId && work.workId === workId && isCharge) {
                  setAllowTaskRevokeBackNodeId(work.allowTaskRevokeBackNodeId);
                } else {
                  setAllowTaskRevokeBackNodeId(null);
                }
                return;
              }
              const newCardData = _.find(parentCurrents, { workId });
              setCurrentWorkflow({
                ...currentWorkflow,
                cardData: {
                  ...newCardData,
                  workId,
                },
              });
            }}
            works={works}
            status={status}
            appId={appId}
            projectId={projectId}
            controls={controls}
          />
        </ScrollView>
        {workId && !completed && (
          <div className={cx('workflowStepFooter flexColumn justifyContentCenter', isMobile ? 'pLeft10 pRight10' : '')}>
            <div className="mLeft1 Font13 Gray_75">{_.get(currentWork, 'flowNode.name')}</div>
            {allowTaskRevokeBackNodeId ? (
              <TaskRevokeAction className="mBottom2 mTop5" onClick={handleTaskRevoke} />
            ) : (
              <WorkflowAction
                className="mBottom2 mTop5"
                hasMore={true}
                isCharge={isCharge}
                isBranch={!!parentCurrents.length}
                appId={appId}
                projectId={projectId}
                data={cardData}
                currentWorkflow={currentWorkflow}
                onAction={handleQuickAction}
                onRevoke={handleRevoke}
                onUrge={handleUrge}
                onSkip={handleSkip}
                onReset={handleReset}
                onEndInstance={handleEndInstance}
                onUpdateWorkAccounts={handleUpdateWorkAccounts}
                onViewFlowStep={handleViewFlowStep}
                onViewExecDialog={handleViewExecDialog}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  const Wrap = isMobile ? Fragment : ScrollView;

  return (
    <div className="h100 w100 sheetWorkflowWrapper Relative">
      {loading ? (
        <LoadDiv className="pTop20" />
      ) : (
        <Wrap>
          <div className={cx(isMobile ? 'pAll10 h100' : 'pAll20')}>
            {list.length ? (
              list.map(data => (
                <WorkflowCard
                  key={data.id}
                  projectId={projectId}
                  appId={appId}
                  isCharge={isCharge}
                  formWidth={formWidth}
                  data={data}
                  currentWorkflow={currentWorkflow}
                  onAction={handleQuickAction}
                  onRevoke={handleRevoke}
                  onUrge={handleUrge}
                  onReset={handleReset}
                  onViewFlowStep={handleViewFlowStep}
                  onViewExecDialog={handleViewExecDialog}
                />
              ))
            ) : isMobile ? (
              <div className="flexColumn valignWrapper h100 withoutData">
                <Icon className="Font70" icon="examination_approval_color" />
                <div className="Font18 Gray_bd mTop20">{_l('暂无审批流程')}</div>
              </div>
            ) : (
              <div className="mTop5 mLeft4 Gray_bd Font13">{_l('暂无审批流程')}</div>
            )}
          </div>
        </Wrap>
      )}
      <Drawer
        placement="right"
        width={isMobile ? '85%' : '100%'}
        zIndex={isMobile ? 1000 : 10}
        className="sheetWorkflowDrawer"
        closable={false}
        getContainer={isMobile ? () => document.body : false}
        mask={isMobile}
        push={false}
        style={{ position: 'absolute' }}
        onClose={handleCloseDrawer}
        visible={workflowVisible}
      >
        {renderStepItem()}
      </Drawer>
      {viewWorkflow && ProcessRecord &&
        (isMobile ? (
          <ProcessRecord.default
            isModal={true}
            visible={true}
            instanceId={viewWorkflow.id}
            workId={viewWorkflow.workId}
            onClose={() => {
              history.back();
              setViewWorkflow(null);
            }}
          />
        ) : (
          <ProcessRecord.default
            id={viewWorkflow.id}
            workId={viewWorkflow.workId}
            onClose={() => {
              setViewWorkflow(null);
              reloadRecord();
            }}
            onSave={() => {
              handleCloseDrawer();
              getList();
            }}
          />
        ))}
      {actionVisible &&
        (isMobile ? (
          <MobileOtherAction
            projectId={projectId}
            visible={actionVisible}
            action={currentWorkflow.value}
            instanceId={currentWorkflow.instanceId}
            workId={_.get(currentWorkflow.currentWork, 'workId')}
            selectedUser={{}}
            instance={currentWorkflow}
            onAction={handleAction}
            onHide={() => {
              setActionVisible(false);
            }}
          />
        ) : (
          <OtherAction
            projectId={projectId}
            data={currentWorkflow}
            action={currentWorkflow.value}
            instanceId={currentWorkflow.instanceId}
            workId={_.get(currentWorkflow.currentWork, 'workId')}
            onOk={handleAction}
            onCancel={() => {
              setActionVisible(false);
            }}
          />
        ))}
    </div>
  );
}

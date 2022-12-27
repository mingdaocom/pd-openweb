import React, { Fragment, useEffect, useState, useRef } from 'react';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Drawer } from 'antd';
import cx from 'classnames';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import instance from 'src/pages/workflow/api/instance';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import StepHeader from '../ExecDialog/StepHeader';
import StepItem from 'src/pages/workflow/components/ExecDialog/StepItem';
import ExecDialog from 'src/pages/workflow/components/ExecDialog';
import MobileProcessRecord from 'src/pages/Mobile/ProcessRecord';
import OtherAction from 'src/pages/workflow/components/ExecDialog/OtherAction';
import MobileOtherAction from 'mobile/ProcessRecord/OtherAction';
import { ACTION_TO_METHOD } from 'src/pages/workflow/components/ExecDialog/config';
import { covertTime, INSTANCELOG_STATUS } from 'src/pages/workflow/MyProcess/config';
import WorkflowAction from './Action';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import moment from 'moment';
import './index.less';

const isMobile = browserIsMobile();

function WorkflowCard(props) {
  const { data, formWidth } = props;
  const { onAction, onRevoke, onUrge, onViewFlowStep, onViewExecDialog } = props;
  const { createDate, completeDate, completed, createAccount, flowNode, workItem, process, instanceLog } = data;
  const { receiveTime } = workItem || {};
  const { name, type } = flowNode || {};
  const wrapRef = useRef();
  const allCurrentWorkItems = (data.currentWorkItems || []).filter(c => c.operationType !== 5);
  const [currentWorkItems, setCurrentWorkItems] = useState(allCurrentWorkItems);

  useEffect(
    () => {
      if (currentWorkItems.length && wrapRef.current) {
        const { clientWidth } = wrapRef.current;
        const accountWidth = 24;
        const accountRightMargin = 8;
        const count = Math.floor(clientWidth / (accountWidth + accountRightMargin));
        setCurrentWorkItems(allCurrentWorkItems.slice(0, count - 1));
      }
    },
    [formWidth],
  );

  const renderSurplusTime = () => {
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
        <div className="Font13 Gray_9e label">{_l('剩余时间')}</div>
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

  const renderTimeConsuming = () => {
    const timeConsuming = moment(createDate) - moment(completeDate);
    if (timeConsuming) {
      return (
        <div className="flexRow valignWrapper mBottom12">
          <div className="Font13 Gray_9e label">{_l('整体耗时')}</div>
          <div>{covertTime(timeConsuming)}</div>
        </div>
      );
    }
  };

  const renderState = () => {
    const { status } = data;
    if (workItem) {
      if (type === 3) return <span style={{ color: '#2196F3' }}>{_l('等我填写...')}</span>;
      if (type === 4) return <span style={{ color: '#2196F3' }}>{_l('等我审批...')}</span>;
    } else {
      if (type === 3) return <span className="Gray_9e">{_l('填写中...')}</span>;
      if (type === 4) return <span className="Gray_9e">{_l('审批中...')}</span>;
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

  return (
    <div className={cx('workflowCard', isMobile ? 'mBottom10' : 'mBottom18')}>
      <div className="pointer" onClick={onViewFlowStep}>
        <div className="flexRow valignWrapper">
          <UserHead
            lazy="false"
            size={32}
            user={{ userHead: createAccount.avatar, accountId: createAccount.accountId }}
          />
          <div className="flexColumn flex mLeft10">
            <div className="Font15 bold Gray">{process.name}</div>
            <div className="Font13 Gray_9e">
              {_l(
                '%0 于 %1 发起',
                createAccount.accountId === md.global.Account.accountId ? _l('我') : createAccount.fullName,
                createTimeSpan(createDate),
              )}
            </div>
          </div>
          <div className="bold">{renderState()}</div>
        </div>
        <div className="flexColumn mTop18 itemWrapper">
          {name && (
            <div className="flexRow valignWrapper mBottom12">
              <div className="Font13 Gray_9e label">{_l('当前节点')}</div>
              <div className="flowNodeName">{name}</div>
            </div>
          )}
          {!!(currentWorkItems || []).length && (
            <div className="flexRow valignWrapper mBottom12">
              <div className="Font13 Gray_9e label">{type === 4 ? _l('审批人') : _l('填写人')}</div>
              <div className="flex flexRow valignWrapper flexWrap" ref={wrapRef}>
                {currentWorkItems.map(data => (
                  <span className="InlineBlock Relative mRight8">
                    {data.workItemAccount.accountId === md.global.Account.accountId ? (
                      <div className="flexRow valignWrapper myAvatar">{_l('我')}</div>
                    ) : (
                      <UserHead
                        lazy="false"
                        size={24}
                        user={{ userHead: data.workItemAccount.avatar, accountId: data.workItemAccount.accountId }}
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
          )}
          {receiveTime && (
            <div className="flexRow valignWrapper mBottom12">
              <div className="Font13 Gray_9e label">{_l('处理开始')}</div>
              <div>{receiveTime}</div>
            </div>
          )}
          {completeDate && (
            <div className="flexRow valignWrapper mBottom12">
              <div className="Font13 Gray_9e label">{_l('完成时间')}</div>
              <div>{completeDate}</div>
            </div>
          )}
          {completed && renderTimeConsuming()}
          {renderSurplusTime()}
        </div>
      </div>
      {!completed && (
        <WorkflowAction
          className="mTop20"
          data={data}
          {...{ onAction, onRevoke, onUrge, onViewFlowStep, onViewExecDialog }}
        />
      )}
    </div>
  );
}

export default function SheetWorkflow(props) {
  const { isCharge, projectId, worksheetId, recordId, formWidth, refreshBtnNeedLoading } = props;
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState({});
  const [workflowVisible, setWorkflowVisible] = useState(false);
  const [viewWorkflow, setViewWorkflow] = useState(null);
  const [actionVisible, setActionVisible] = useState(false);

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
        if (list.length === 1) {
          handleViewFlowStep(list[0]);
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
      });
    });
  };

  const handleAction = ({ action, content, userId, backNodeId, signature }) => {
    if (_.includes(['pass', 'overrule'], action)) {
      handleRequest(ACTION_TO_METHOD[action], { opinion: content, backNodeId, signature }).then(() => {
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
  };

  const handleRequest = (action, restPara = {}) => {
    const { id, workId } = currentWorkflow.cardData || {};
    return instance[action]({ id, workId, ...restPara });
  };

  const handleCloseDrawer = () => {
    setWorkflowVisible(false);
    setCurrentWorkflow({});
  };

  const handleQuickAction = (data, value) => {
    getWorkflow(data, {
      value,
    }).then(() => {
      setActionVisible(true);
    });
  };

  const handleRevoke = data => {
    handleRequest('revoke', {
      id: data.id,
      workId: data.revokeWorkId,
    }).then(result => {
      if (result) {
        alert(_l('撤回成功'));
        setList(list.filter(item => item.id !== data.id));
        handleCloseDrawer();
      }
    });
  };

  const handleUrge = data => {
    handleRequest('operation', {
      id: data.id,
      operationType: 18,
    }).then(result => {
      if (result) {
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
    setViewWorkflow({
      id: data.id,
      workId: data.workId,
    });
  };

  useEffect(
    () => {
      handleCloseDrawer();
      getList();
    },
    [recordId],
  );

  useEffect(
    () => {
      if (refreshBtnNeedLoading) {
        handleCloseDrawer();
        getList();
      }
    },
    [refreshBtnNeedLoading],
  );

  const renderStepItem = () => {
    const {
      processId,
      cardData = {},
      processName,
      works = [],
      workItem,
      currentWork,
      currentWorkItem,
    } = currentWorkflow;
    const { id, workId, completed } = cardData;
    return (
      <div className="h100 flexColumn">
        <StepHeader
          processId={processId}
          instanceId={id}
          processName={processName}
          hasBack={true}
          onClose={handleCloseDrawer}
          isApproval
        />
        <ScrollView className="flex">
          {works.map((item, index) => {
            return (
              <StepItem
                key={index}
                data={item}
                currentWork={currentWork}
                currentType={(currentWorkItem || {}).type}
                worksheetId={worksheetId}
                rowId={recordId}
              />
            );
          })}
        </ScrollView>
        {id && !completed && (
          <div className={cx('workflowStepFooter', isMobile ? 'pLeft10 pRight10' : '')}>
            <WorkflowAction
              hasMore={true}
              isCharge={isCharge}
              projectId={projectId}
              className="h100"
              data={cardData}
              onAction={value => handleQuickAction(cardData, value)}
              onRevoke={() => handleRevoke(cardData)}
              onUrge={() => handleUrge(cardData)}
              onSkip={() => handleSkip(cardData)}
              onEndInstance={() => handleEndInstance(cardData)}
              onUpdateWorkAccounts={ids => handleUpdateWorkAccounts(cardData, ids)}
              onViewFlowStep={() => handleViewFlowStep(cardData)}
              onViewExecDialog={() => handleViewExecDialog(cardData)}
            />
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
                  formWidth={formWidth}
                  data={data}
                  onAction={value => handleQuickAction(data, value)}
                  onRevoke={() => handleRevoke(data)}
                  onUrge={() => handleUrge(data)}
                  onViewFlowStep={() => handleViewFlowStep(data)}
                  onViewExecDialog={() => handleViewExecDialog(data)}
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
        zIndex={isMobile ? 999 : 10}
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
      {viewWorkflow &&
        (isMobile ? (
          <MobileProcessRecord
            isModal={true}
            visible={true}
            instanceId={viewWorkflow.id}
            workId={viewWorkflow.workId}
            onClose={() => {
              setViewWorkflow(null);
            }}
          />
        ) : (
          <ExecDialog
            id={viewWorkflow.id}
            workId={viewWorkflow.workId}
            onClose={() => {
              setViewWorkflow(null);
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
            visible={actionVisible}
            action={currentWorkflow.value}
            selectedUser={{}}
            instance={currentWorkflow}
            onAction={(action, content, userId, backNodeId, signature) => {
              handleAction({ action, content, userId, backNodeId, signature });
            }}
            onHide={() => {
              setActionVisible(false);
            }}
          />
        ) : (
          <OtherAction
            data={currentWorkflow}
            action={currentWorkflow.value}
            onOk={handleAction}
            onCancel={() => {
              setActionVisible(false);
            }}
          />
        ))}
    </div>
  );
}

import React, { Fragment, useEffect, useState, useRef } from 'react';
import { Icon, LoadDiv, ScrollView, Modal } from 'ming-ui';
import { Drawer } from 'antd';
import cx from 'classnames';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import instance from 'src/pages/workflow/api/instance';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import StepItem from 'src/pages/workflow/components/ExecDialog/StepItem';
import ExecDialog from 'src/pages/workflow/components/ExecDialog';
import MobileProcessRecord from 'src/pages/Mobile/ProcessRecord';
import FlowChart from 'src/pages/workflow/components/FlowChart';
import OtherAction from 'src/pages/workflow/components/ExecDialog/OtherAction';
import MobileOtherAction from 'mobile/ProcessRecord/OtherAction';
import { ACTION_TO_METHOD } from 'src/pages/workflow/components/ExecDialog/config';
import { covertTime, INSTANCELOG_STATUS } from 'src/pages/workflow/MyProcess/config';
import { browserIsMobile } from 'src/util';
import './index.less';

const isMobile = browserIsMobile();

function WorkflowCard(props) {
  const { data, formWidth } = props;
  const { onAction, onRevoke, onUrge, onViewFlowStep, onViewExecDialog } = props;
  const { createDate, completeDate, completed, createAccount, flowNode, workItem, process, instanceLog } = data;
  const { receiveTime } = workItem || {};
  const { name, type } = flowNode || {};
  const wrapRef = useRef();
  const allCurrentWorkItems = data.currentWorkItems || [];
  const [currentWorkItems, setCurrentWorkItems] = useState(allCurrentWorkItems);

  useEffect(() => {
    if (currentWorkItems.length && wrapRef.current) {
      const { clientWidth } = wrapRef.current;
      const accountWidth = 24;
      const accountRightMargin = 8;
      const count = Math.floor(clientWidth / (accountWidth + accountRightMargin));
      setCurrentWorkItems(allCurrentWorkItems.slice(0, count - 1));
    }
  }, [formWidth]);

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
  }

  const renderTimeConsuming = () => {
    const timeConsuming = moment(createDate) - moment(completeDate);
    if (timeConsuming) {
      return (
        <div className="flexRow valignWrapper mBottom12">
          <div className="Font13 Gray_9e label">{_l('整体耗时')}</div>
          <div>
            {covertTime(timeConsuming)}
          </div>
        </div>
      );
    }
  }

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
  }

  const renderAction = () => {
    const { allowRevoke, allowUrge } = data;
    const { batchType, passBatchType, overruleBatchType, btnMap } = flowNode || {};
    const allowBatch = type === 4 && ![-1, -2].includes(batchType);
    const allowApproval = allowBatch && workItem;

    if (!(allowApproval || workItem || allowRevoke || allowUrge)) return;

    return (
      <div className={cx('flexRow valignWrapper approveBtnWrapper mTop20', { hoverBtnWrap: !isMobile })}>
        <Fragment>
          {allowApproval && (
            <div className="btn pass" onClick={() => onAction('pass')}>
              <span className="ellipsis">{btnMap[4] || _l('通过')}</span>
            </div>
          )}
          {allowApproval && (
            <div className="btn overrule" onClick={() => onAction('overrule')}>
              <span className="ellipsis">{btnMap[5] || _l('否决')}</span>
            </div>
          )}
        </Fragment>
        {workItem && type === 3 && (
          <div className="btn handle" onClick={() => onViewExecDialog()}>
            <span className="ellipsis">{_l('前往填写')}</span>
          </div>
        )}
        {workItem && type === 4 && (
          <div className="btn handle" onClick={() => onViewExecDialog()}>
            <span className="ellipsis">{_l('前往办理')}</span>
          </div>
        )}
        {((allowRevoke && allowApproval || workItem) ? false : allowRevoke) && (
          <div className="btn revoke" onClick={() => onRevoke()}>{_l('撤回')}</div>
        )}
        {((allowUrge && allowApproval || workItem) ? false : allowUrge) && (
          <div className="btn handle" onClick={() => onUrge()}>{_l('催办')}</div>
        )}
      </div>
    );
  }

  return (
    <div className={cx('workflowCard', isMobile ? 'mBottom10' : 'mBottom18')}>
      <div className="pointer" onClick={onViewFlowStep}>
        <div className="flexRow valignWrapper">
          <UserHead lazy="false" size={32} user={{ userHead: createAccount.avatar, accountId: createAccount.accountId }}/>
          <div className="flexColumn flex mLeft10">
            <div className="Font15 bold Gray">{process.name}</div>
            <div className="Font13 Gray_9e">{_l('%0 于 %1 发起', createAccount.accountId === md.global.Account.accountId ? _l('我') : createAccount.fullName, createTimeSpan(createDate))}</div>
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
                      <UserHead lazy="false" size={24} user={{ userHead: data.workItemAccount.avatar, accountId: data.workItemAccount.accountId }}/>
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
                    <div className="flexRow valignWrapper hideAvatar">+{allCurrentWorkItems.length - currentWorkItems.length}</div>
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
      {!completed && renderAction()}
    </div>
  );
}

export default function SheetWorkflow(props) {
  const { isCharge, worksheetId, recordId, formWidth, refreshBtnNeedLoading } = props;
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState({});
  const [workflowVisible, setWorkflowVisible] = useState(false);
  const [viewWorkflow, setViewWorkflow] = useState(null);
  const [actionVisible, setActionVisible] = useState(false);
  const [flowChartVisible, setFlowChartVisible] = useState(false);

  const getList = () => {
    setLoading(true);
    const param = {
      startAppId: worksheetId,
      startSourceId: recordId,
    };
    Promise.all([
      instanceVersion.getTodoList2(param),
      instanceVersion.getTodoList2({
        ...param,
        complete: true
      })
    ]).then(result => {
      const [unfinished, completed] = result;
      setList(unfinished.concat(completed.map(data => { return { ...data, completed: true } })));
      setLoading(false);
    });
  }

  const getWorkflow = (data, param) => {
    const api = data.workItem ? instanceVersion.get : instanceVersion.get2;
    const apiParam = {
      id: data.id,
      workId: data.workId,
    };
    return api(apiParam).then(data => {
      setCurrentWorkflow({
        ...data,
        ...param,
        ...apiParam
      });
    });
  }

  const handleAction = ({ action, content, userId, backNodeId, signature }) => {
    if (_.includes(['pass', 'overrule'], action)) {
      handleRequest(ACTION_TO_METHOD[action], { opinion: content, backNodeId, signature }).then(() => {
        setActionVisible(false);
        getList();
      });
    }
  }

  const handleRequest = (action, restPara = {}) => {
    const { id, workId } = currentWorkflow;
    return instance[action]({ id, workId, ...restPara });
  }

  const handleCloseDrawer = () => {
    setWorkflowVisible(false);
    setCurrentWorkflow({});
  }

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


  const renderStepItem = () => {
    const { id, workId, completed, processName, works = [], workItem, currentWork, currentWorkItem } = currentWorkflow;

    return (
      <div className="h100 flexColumn">
        <div className={cx('flexRow valignWrapper pRight20 pTop20 pBottom8', isMobile ? 'pLeft10' : 'pLeft20')}>
          <div className="flexRow valignWrapper pointer" onClick={handleCloseDrawer}>
            <Icon className="Font20 Gray_bd" icon="arrow-left-border" />
            <div className={cx('Font17 bold flex', isMobile ? 'mLeft6' : 'mLeft10')}>{processName}</div>
          </div>
          {workItem && (
            <div className="flexRow valignWrapper flex justifyContentEnd">
              <div className="flexRow valignWrapper pointer viewExecDialog" onClick={() => setViewWorkflow({ id, workId })}>
                <Icon className="Font18 mRight5" icon="knowledge_file" />
                <div className="Font14">{_l('查看')}</div>
              </div>
            </div>
          )}
        </div>
        <ScrollView className="flex">
          {works.map((item, index) => {
            return (
              <StepItem
                key={index}
                data={item}
                firstWorkId={works[0].workId}
                currentWork={currentWork}
                currentType={(currentWorkItem || {}).type}
                isLast={index === works.length - 1 && !completed}
                isAppAdmin={isCharge}
                onClose={() => {
                  setList(list.filter(item => item.id !== id));
                  setWorkflowVisible(false);
                  setCurrentWorkflow({});
                }}
              />
            );
          })}
        </ScrollView>
        {!isMobile && (
          <div className="viewFlowChartWrap">
            <div className="viewFlowChart flexRow valignWrapper pointer Font14 bold" onClick={() => setFlowChartVisible(true)}>
              {_l('查看流转图')}
            </div>
          </div>
        )}
        {flowChartVisible && (
          <Modal
            visible
            className="flowChartModal"
            closable={false}
            title={(
              <div className="flexRow valignWrapper">
                <div className="flex Font17 bold">{_l('流转图')}</div>
                <Icon className="Gray_9e Font20 pointer" icon="close" onClick={() => setFlowChartVisible(false)} />
              </div>
            )}
            type="fixed"
            width={window.outerWidth - 60}
            onCancel={() => setFlowChartVisible(false)}
          >
            <FlowChart
              processId={currentWorkflow.processId}
              instanceId={currentWorkflow.id}
            />
          </Modal>
        )}
      </div>
    );
  }

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
                  onAction={(value) => {
                    getWorkflow(data, {
                      value
                    }).then(() => {
                      setActionVisible(true);
                    });
                  }}
                  onRevoke={() => {
                    handleRequest('revoke', {
                      id: data.id,
                      workId: data.revokeWorkId
                    }).then((result) => {
                      if (result) {
                        alert(_l('撤回成功'));
                        setList(list.filter(item => item.id !== data.id));
                      }
                    });
                  }}
                  onUrge={() => {
                    handleRequest('operation', {
                      id: data.id,
                      operationType: 18
                    }).then((result) => {
                      if (result) {
                        alert(_l('催办成功'));
                      }
                    });
                  }}
                  onViewFlowStep={() => {
                    getWorkflow(data, {
                      processId: data.process.id,
                      workItem: data.workItem,
                      completed: data.completed
                    }).then(() => {
                      setWorkflowVisible(true);
                    });
                  }}
                  onViewExecDialog={() => {
                    setViewWorkflow({
                      id: data.id,
                      workId: data.workId,
                    });
                  }}
                />
              ))
            ) : (
              isMobile ? (
                <div className="flexColumn valignWrapper h100 withoutData">
                  <Icon className="Font70" icon="examination_approval_color" />
                  <div className="Font18 Gray_bd mTop20">{_l('暂无审批流程')}</div>
                </div>
              ) : (
                <div className="mTop5 mLeft4 Gray_bd Font13">{_l('暂无审批流程')}</div>
              )
            )}
          </div>
        </Wrap>
      )}
      <Drawer
        placement="right"
        width={isMobile ? "85%" : "100%"}
        className="sheetWorkflowDrawer"
        closable={false}
        getContainer={isMobile ? () => document.body : false}
        mask={isMobile}
        style={{ position: 'absolute' }}
        onClose={handleCloseDrawer}
        visible={workflowVisible}
      >
        {renderStepItem()}
      </Drawer>
      {viewWorkflow && (
        isMobile ? (
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
        )
      )}
      {actionVisible && (
        isMobile ? (
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
        )
      )}
    </div>
  );
}

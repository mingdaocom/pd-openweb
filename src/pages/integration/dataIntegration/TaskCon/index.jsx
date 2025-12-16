import React, { Component } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, FullScreenCurtain } from 'ming-ui';
import LoadDiv from 'ming-ui/components/LoadDiv';
import dataSourceApi from 'src/pages/integration/api/datasource.js';
import SyncTask from 'src/pages/integration/api/syncTask.js';
import TaskFlow from 'src/pages/integration/api/taskFlow.js';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import PublishFail from 'src/pages/integration/components/PublishFail';
import 'src/pages/integration/dataIntegration/connector/style.less';
import { DATABASE_TYPE } from 'src/pages/integration/dataIntegration/constant.js';
import PublishSetDialog from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/components/PublishSetDialog';
import { navigateTo } from 'src/router/navigateTo';
import Disposition from './Disposition';
import Monitor from './Monitor';
import TaskCanvas from './TaskCanvas';
import TaskHeader from './TaskHeader';

const Wrap = styled.div`
  height: 100%;
`;

class Task extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      tab: props.type || 'task',
      flowId: props.id,
      taskId: props.taskId,
      flowData: {},
      isNew: false,
      isUpdate: false, //是否需要更新发布
      curId: '',
      showPublishFail: false,
      jobId: props.jobId,
      updating: false,
      currentProjectId: '',
      errorMsgList: [],
    };
  }

  componentDidMount() {
    const { params = {} } = this.props.match;
    const { id, type } = params;
    this.setState(
      {
        flowId: id,
        tab: type || 'task',
      },
      () => {
        if (id === 'null' || !id) {
          this.creatSynsTask();
        } else {
          this.getSynsTask();
        }
      },
    );
  }

  validatePermission = projectId => {
    const hasTaskAuth =
      projectId && checkPermission(projectId, [PERMISSION_ENUM.CREATE_SYNC_TASK, PERMISSION_ENUM.MANAGE_SYNC_TASKS]);
    if (!hasTaskAuth) {
      alert(_l('该同步任务无权限查看或已删除'), 3);
      navigateTo('/integration');
      return;
    }
  };

  // 创建同步任务
  creatSynsTask = () => {
    const projectId = localStorage.getItem('currentProjectId');
    this.validatePermission(projectId);
    TaskFlow.init({
      projectId,
      owner: md.global.Account.accountId,
      sourceNode: {
        projectId,
        nodeId: uuidv4(),
        nodeType: 'SOURCE_TABLE',
        name: _l('读取数据源'),
      },
      destNode: {
        projectId,
        nodeId: uuidv4(),
        nodeType: 'DEST_TABLE',
        name: _l('写入数据目的地'),
      },
    }).then(res => {
      const { id, taskId = '' } = res;
      this.setState(
        {
          flowData: res,
          flowId: id,
          loading: false,
          isNew: true,
          isUpdate: false,
          taskId,
          currentProjectId: projectId,
          // jobId: res.jobId ? res.jobId : this.state.jobId,
        },
        () => {
          history.pushState({}, '', `/integration/taskCon/${id}`);
        },
      );
    });
  };
  //获取流信息
  getSynsTask = errIds => {
    const { flowId = '' } = this.state;
    TaskFlow.getTaskFlow({
      flowId,
    }).then(res => {
      let flowData = res || {};
      if (errIds) {
        errIds.map(o => {
          flowData = {
            ...flowData,
            flowNodes: { ...flowData.flowNodes, [o]: { ...flowData.flowNodes[o], status: 'ERR' } },
          };
        });
      }
      this.validatePermission(flowData.projectId);
      this.getDatasourcesList(flowData, flowData.projectId, datasources => {
        this.setState({
          flowData: { ...flowData, datasources },
          flowId: flowId,
          loading: false,
          taskId: flowData.taskId || '',
          jobId: flowData.jobId || '',
          currentProjectId: flowData.projectId,
          isUpdate: res.taskStatus === 'ERROR' || res.status === 'EDITING', //PUBLISHED：已发布
          isNew: ['UN_PUBLIC'].includes(res.taskStatus),
          //    * 未发布
          //   'UN_PUBLIC',
          //   //  * 运行中
          //   // 'RUNNING',
          //   //  * 停止
          //   // 'STOP',
          //   //  * 异常
          //   // 'ERROR',
          //    * 创建中
          //   // 'CREATING',
        });
      });
    });
  };
  //获取当前画布所有的数据源信息
  getDatasourcesList = (flowData, projectId, cb) => {
    const nodes =
      _.values(flowData.flowNodes).filter(
        o =>
          ['DEST_TABLE', 'SOURCE_TABLE'].includes(_.get(o, 'nodeType')) &&
          _.get(o, 'nodeConfig.config.dsType') !== DATABASE_TYPE.APPLICATION_WORKSHEET,
      ) || {};
    dataSourceApi
      .getDatasources({
        projectId,
        datasourceIds: nodes.map(
          o => _.get(o, 'nodeConfig.config.datasourceId') || _.get(o, 'nodeConfig.config.dataDestId'),
        ),
      })
      .then(datasources => {
        cb(datasources);
      });
  };

  //修改同步任务属性(name)
  updateSyncTask = taskName => {
    const { currentProjectId: projectId } = this.state;
    const { taskId = '', flowData } = this.state;
    SyncTask.updateSyncTask({
      taskId: taskId,
      name: taskName,
      projectId,
      owner: md.global.Account.accountId,
    }).then(res => {
      if (res) {
        this.setState({
          flowData: { ...flowData, taskName },
        });
      } else {
        alert(_l('修改失败，请稍后再试'), 2);
      }
    });
  };
  changeTask = taskStatus => {
    const { currentProjectId: projectId } = this.state;
    const { taskId = '', flowData, updating } = this.state;
    if (updating) {
      return;
    }
    let Ajax = null;
    this.setState({
      updating: true,
    });
    if (taskStatus !== 'RUNNING') {
      Ajax = SyncTask.stopTask({ projectId, taskId: taskId });
    } else {
      Ajax = SyncTask.startTask({ projectId, taskId: taskId });
    }
    Ajax.then(
      res => {
        this.setState({
          updating: false,
        });
        const info = {
          flowData: {
            ...flowData,
            taskStatus: taskStatus,
          },
          isNew: false,
        };
        if (taskStatus !== 'RUNNING') {
          if (res) {
            this.setState({
              ...info,
            });
          } else {
            alert(_l('失败，请稍后再试'), 2);
          }
        } else {
          const { isSucceeded, errorMsg } = res;
          if (isSucceeded) {
            this.setState({
              ...info,
              taskId: res.taskId,
              jobId: res.jobId,
            });
          } else {
            alert(errorMsg || _l('失败，请稍后再试'), 2);
          }
        }
      },
      () => {
        this.setState({
          updating: false,
        });
      },
    );
  };
  publishTask = () => {
    const { updating, flowData = {}, isNew } = this.state;
    if (updating) {
      return;
    }
    const destData = _.values(flowData.flowNodes).find(o => _.get(o, 'nodeType') === 'DEST_TABLE') || {};
    const isDestMDType = _.get(destData, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET;
    if (isDestMDType && !_.get(destData, 'nodeConfig.config.createTable') && !isNew) {
      //目的地是表 且选择已有表
      this.setState({
        showPublishDialog: true,
      });
    } else {
      this.publishTaskAction();
    }
  };

  publishTaskAction = info => {
    const { currentProjectId: projectId } = this.state;
    const { flowId = '', flowData } = this.state;
    this.setState({
      updating: true,
      showPublishDialog: false,
    });
    TaskFlow.publishTask({
      projectId,
      flowId: flowId,
      ...info,
    }).then(
      res => {
        this.setState({
          updating: false,
        });
        const { jobId, errorMsgList = [], isSucceeded, errorNodeIds = [], errorType } = res;
        if (isSucceeded) {
          this.setState({
            isNew: false,
            isUpdate: false,
            jobId,
            flowData: {
              ...flowData,
              taskStatus: 'RUNNING',
            },
            errorMsgList: [],
          });
        } else {
          this.setState(
            {
              isNew: false,
              isUpdate: false,
              jobId,
              showPublishFail: errorType === 0, //有错误
              errorMsgList: errorMsgList,
            },
            () => {
              if (errorType === 1 && errorMsgList.length > 0) {
                return Dialog.confirm({
                  title: _l('报错信息'),
                  className: 'connectorErrorDialog',
                  description: (
                    <div className="errorInfo" style={{ marginBottom: -30, 'max-height': 400, overflow: 'auto' }}>
                      {errorMsgList.map((error, index) => {
                        return (
                          <div key={index} className="mTop5">
                            {error}
                          </div>
                        );
                      })}
                    </div>
                  ),
                  removeCancelBtn: true,
                  okText: _l('关闭'),
                });
              }
            },
          );
        }
        this.getSynsTask(errorNodeIds);
      },
      () => {
        this.setState({
          updating: false,
        });
      },
    );
  };

  renderCon = () => {
    const { tab, flowData, curId, jobId } = this.state;
    switch (tab) {
      case 'task':
        return (
          <TaskCanvas
            {...this.props}
            currentProjectId={this.state.currentProjectId}
            flowId={this.state.flowId}
            flowData={flowData}
            curId={curId}
            onUpdate={(flowData, isUpdate = true) => {
              this.setState({
                flowData,
                isUpdate,
              });
            }}
          />
        );
      case 'disposition':
        return (
          <Disposition
            {...this.props}
            currentProjectId={this.state.currentProjectId}
            flowId={this.state.flowId}
            flowData={flowData}
            onUpdate={(flowData, isUpdate = true) => {
              this.setState({
                flowData,
                isUpdate,
              });
            }}
          />
        );
      case 'monitor':
        return (
          <Monitor
            {...this.props}
            currentProjectId={this.state.currentProjectId}
            flowId={this.state.flowId}
            jobId={jobId}
            flowData={flowData}
          />
        );
    }
  };
  render() {
    const {
      flowData = {},
      loading,
      isNew,
      isUpdate,
      showPublishFail,
      updating,
      errorMsgList = [],
      showPublishDialog,
    } = this.state;
    const destData = _.values(flowData.flowNodes).find(o => _.get(o, 'nodeType') === 'DEST_TABLE') || {};
    const { writeMode, isCleanDestTableData, fieldForIdentifyDuplicate } = _.get(destData, 'nodeConfig.config') || {};
    if (loading) {
      return <LoadDiv />;
    }
    return (
      <FullScreenCurtain>
        <Wrap className="flexColumn">
          <TaskHeader
            {...this.props}
            updating={updating}
            currentProjectId={this.state.currentProjectId}
            flowId={this.state.flowId}
            tab={this.state.tab}
            onChangeTab={tab => {
              this.setState({
                tab,
              });
              navigateTo(`/integration/taskCon/${this.state.flowId}/${tab}`);
            }}
            isNew={isNew}
            isUpdate={isUpdate}
            flowData={flowData}
            title={flowData.taskName || ''}
            onChangeTitle={taskName => {
              this.updateSyncTask(taskName);
            }}
            changeTask={taskStatus => {
              this.changeTask(taskStatus);
            }}
            publishTask={() => {
              this.publishTask();
            }}
          />
          {this.renderCon()}
        </Wrap>
        {showPublishFail && (
          <PublishFail
            toNode={() => {
              this.setState({
                // curId: id,
                tab: 'task',
                showPublishFail: false,
              });
            }}
            name={flowData.taskName || _l('数据同步任务')}
            errorMsgList={errorMsgList}
            onCancel={() => {
              this.setState({
                showPublishFail: false,
              });
            }}
          />
        )}
        {showPublishDialog && (
          <PublishSetDialog
            controls={(
              _.get(
                _.values(flowData.flowNodes).find(o => _.get(o, 'nodeType') === 'DEST_TABLE') || {},
                'nodeConfig.fields',
              ) || []
            ).filter(o => o.isCheck && [1, 2, 7, 5, 3, 4, 33].includes(o.mdType))} //文本1 2、证件7、邮箱5、电话3 4、自动编号33
            onClose={() => {
              this.setState({
                showPublishDialog: false,
              });
            }}
            fieldForIdentifyDuplicate={fieldForIdentifyDuplicate}
            writeMode={writeMode}
            isCleanDestTableData={!!isCleanDestTableData}
            onOk={data => {
              this.publishTaskAction(data);
            }}
          />
        )}
      </FullScreenCurtain>
    );
  }
}

export default Task;

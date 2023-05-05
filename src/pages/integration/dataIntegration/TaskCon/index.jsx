import React, { Component } from 'react';
import FullScreenCurtain from 'src/pages/workflow/components/FullScreenCurtain';
import styled from 'styled-components';
import TaskHeader from './TaskHeader';
import TaskCanvas from './TaskCanvas';
import Disposition from './Disposition';
import Monitor from './Monitor';
import TaskFlow from 'src/pages/integration/api/taskFlow.js';
import SyncTask from 'src/pages/integration/api/syncTask.js';
import { v4 as uuidv4 } from 'uuid';
import LoadDiv from 'ming-ui/components/LoadDiv';
import PublishFail from 'src/pages/integration/components/PublishFail';
import { navigateTo } from 'src/router/navigateTo';
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

  setProJectInfo = projectId => {
    const projects = md.global.Account.projects;
    const projectInfo = projects.find(o => o.projectId === projectId) || {};
    const { isSuperAdmin = false, isProjectAppManager = false } = projectInfo;
    if (!isSuperAdmin && !isProjectAppManager) {
      alert(_l('该同步任务无权限查看或已删除'), 3);
      navigateTo('/integration');
      return;
    }
  };

  // 创建同步任务
  creatSynsTask = () => {
    const projectId = localStorage.getItem('currentProjectId');
    this.setProJectInfo(projectId);
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
  getSynsTask = () => {
    const { flowId = '' } = this.state;
    TaskFlow.getTaskFlow({
      flowId,
    }).then(res => {
      let flowData = res || {};
      this.setProJectInfo(flowData.projectId);
      this.setState({
        flowData,
        flowId: flowId,
        loading: false,
        taskId: flowData.taskId || '',
        jobId: flowData.jobId || '',
        currentProjectId: flowData.projectId,
        isUpdate: res.taskStatus === 'ERROR',
      });
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
    const { currentProjectId: projectId } = this.state;
    const { flowId = '', flowData, updating } = this.state;
    if (updating) {
      return;
    }
    this.setState({
      updating: true,
    });
    TaskFlow.publishTask({
      projectId,
      flowId: flowId,
    }).then(
      res => {
        this.setState({
          updating: false,
        });
        if (res) {
          this.setState({
            isNew: false,
            isUpdate: false,
            jobId: res,
            flowData: {
              ...flowData,
              taskStatus: 'RUNNING',
              // showPublishFail: true, //有错误 ?????
            },
          });
        } else {
          alert(_l('失败，请稍后再试'), 2);
        }
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
    const { flowData = {}, loading, isNew, isUpdate, showPublishFail, updating } = this.state;
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
            toNode={id => {
              this.setState({
                // curId: id,
                tab: 'task',
                showPublishFail: false,
              });
            }}
            name={flowData.taskName || _l('数据同步任务')}
            errInfo={['sadsa', 'sad']}
            onCancel={() => {
              this.setState({
                showPublishFail: false,
              });
            }}
          />
        )}
      </FullScreenCurtain>
    );
  }
}

export default Task;

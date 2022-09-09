import React, { Component } from 'react';
import { Dialog, LoadDiv, Button, Checkbox } from 'ming-ui';
import privateGuideApi from 'src/api/privateGuide';
import cx from 'classnames';
import styled from 'styled-components';
import Trigger from 'rc-trigger';

const PrivateDeploymentProjectPopup = styled.div`
  width: 300px;
  padding: 24px;
  .projectItme {
    padding: 10px 0;
    cursor: pointer;
  }
  .projectItmeActive {
    color: #2196F3;
  }
  .projectWrapper {
    overflow-y: auto;
    min-height: 30px;
    max-height: 400px;
  }
  .btnWrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
  }
  .Button--link:hover {
    color: #2196F3;
  }
  .Button--primary {
    margin-left: 10px;
    background-color: #2196F3;
  }
`;

export default class Projects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      confirmVisible: false,
      bindProjectIds: [],
      projects: [],
      loading: true,
    }
  }
  getProjects() {
    this.setState({ loading: true });
    privateGuideApi.getProjects().then(result => {
      // 所有组织列表
      let projects = [];
      // 已绑定的组织Id
      let bindProjectIds = [];
      result.map(item => {
        if (item.isBind) {
          item.disabled = true;
          bindProjectIds.push(item.projectId);
        }
        projects.push(item);
      })

      this.setState({
        loading: false,
        projects: projects,
        bindProjectIds: bindProjectIds
      });
    });
  }
  changeBind = (project) => {
    const { projects } = this.state;
    const newProjects = projects.map(item => {
      if (item.projectId === project.projectId) {
        item.isBind = !project.isBind;
      }
      return item;
    });
    this.setState({
      newProjects: projects,
    });
  }
  handleSave = () => {

    // 如果没有组织id变化，直接关闭弹层即可
    const { projects, bindProjectIds } = this.state;
    const projectIds = projects.filter(item => item.isBind).map(item => item.projectId);
    let newProjectIds = projectIds.filter(function (id) { return bindProjectIds.indexOf(id) == -1 });
    if (!newProjectIds.length) {
      this.setState({ visible: false });
      return;
    }

    this.setState({ confirmVisible: true });
    Dialog.confirm({
      title: _l('您确认要关联新组织吗 ？'),
      description: _l('关联后会占用租户名额，且不可取消'),
      onOk: () => {
        privateGuideApi.bindProject({
          projectIds,
        }).then(result => {
          if (result) {
            alert(_l('关联成功'), 1);
            this.setState({ visible: false });
          } else {
            alert(_l('关联失败'), 2);
          }
        });
      },
      onCancel: () => {
        this.setState({ confirmVisible: false });
      }
    });
  }
  handlePopupVisibleChange = visible => {
    const { usable } = this.props;
    if (!usable || this.state.confirmVisible) return;
    this.setState({ visible });
    if (visible) {
      this.getProjects();
    }
  }
  renderProjectPopup = () => {
    const { projects, loading } = this.state;
    return (
      <PrivateDeploymentProjectPopup className="card z-depth-2 flexColumn">
        <div className="Font20 Gray bold">{_l('关联组织')}</div>
        <div className="Gray_75 mTop5 mBottom5">{_l('关联后会占租户名额，且不可取消')}</div>
        <div className="flex projectWrapper">
          {
            loading ? (
              <div className="mTop5"><LoadDiv size="small" /></div>
            ) : (
              projects.map(item => (
                <div
                  key={item.projectId}
                  className="projectItme projectItmeActive flexRow valignWrapper"
                  onClick={() => {
                    if (!item.disabled) this.changeBind(item);
                  }}
                >
                  <Checkbox checked={item.isBind} value={item.projectId} />
                  <span className="flex overflow_ellipsis">{item.companyName}</span>
                </div>
              ))
            )
          }
        </div>
        <div className="btnWrapper">
          <Button type="link" onClick={() => { this.setState({ visible: false }) }}>{_l('取消')}</Button>
          <Button type="primary" onClick={this.handleSave}>{_l('确认')}</Button>
        </div>
      </PrivateDeploymentProjectPopup>
    );
  }
  render() {
    const { usable } = this.props;
    const { visible } = this.state;
    return (
      <Trigger
        zIndex={100}
        popupVisible={visible}
        onPopupVisibleChange={this.handlePopupVisibleChange}
        action={['click']}
        popup={this.renderProjectPopup()}
        popupAlign={{
          offset: [0, 7],
          points: ['tl', 'bl'],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
      >
        <div className={cx({ pointer: usable })}>
          <span className={cx({ associated: usable })}>{_l('关联')}</span>
        </div>
      </Trigger>
    );
  }
}

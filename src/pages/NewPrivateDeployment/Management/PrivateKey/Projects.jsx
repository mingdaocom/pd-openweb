import React, { Component, Fragment } from 'react';
import { Icon, Dialog, LoadDiv, Checkbox } from 'ming-ui';
import privateGuideApi from 'src/api/privateGuide';
import cx from 'classnames';
import styled from 'styled-components';
import PrivateKeyDialog from '../../Platform/PrivateKeyDialog';
import { LicenseVersions } from '../../common';

const PrivateDeploymentProjectPopup = styled.div`
  .projectItme {
    margin: 0 0 12px 0;
    cursor: pointer;
  }
  .projectWrapper {
    padding: 10px 13px;
    overflow-y: auto;
    min-height: 30px;
    max-height: 400px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .licenseCodeWrap {
    padding: 10px;
    border: 1px solid #f5f5f5;
  }
  .warning {
    color: #ff8d0e;
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
      privateKeyDialogVisible: false
    }
  }
  getProjects() {
    const { verifyLicenseInfo } = this.props;
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
        if (!_.isUndefined(verifyLicenseInfo)) {
          item.disabled = false;
          item.isBind = false;
        }
        projects.push(item);
      });

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
      projects: newProjects,
    });
  }
  handleSave = () => {
    const { onSave = _.noop, verifyLicenseInfo = {} } = this.props;

    // 如果没有组织id变化，直接关闭弹层即可
    const { projects, bindProjectIds } = this.state;
    const projectIds = projects.filter(item => item.isBind).map(item => item.projectId);

    if (verifyLicenseInfo.licenseCode) {
      privateGuideApi.bindLicenseCode({
        licenseCode: verifyLicenseInfo.licenseCode,
        projectIds: verifyLicenseInfo.isPlatform ? undefined : projectIds
      }).then(result => {
        alert(_l('更新成功'), 1);
        this.setState({ visible: false });
        onSave();
      });
    } else {
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
              onSave();
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
  }
  handlePopupVisibleChange = visible => {
    const { usable } = this.props;
    if (!usable || this.state.confirmVisible) return;
    this.setState({ visible });
    if (visible) {
      this.getProjects();
    }
  }
  renderDialog() {
    const { title, verifyLicenseInfo = {}, platformLicenseInfo = {} } = this.props;
    const { visible, loading, projects } = this.state;
    const projectNum = platformLicenseInfo.projectNum || verifyLicenseInfo.projectNum;
    const projectUserNum = platformLicenseInfo.internalUserNum || verifyLicenseInfo.projectUserNum;
    const currentProjectNum = projects.filter(n => n.isBind).length;
    const currentProjectUserNum = projects.filter(n => n.isBind).reduce((sum, n) => sum + n.projectNormalUserCount, 0);
    return (
      <Dialog
        visible={visible}
        anim={false}
        title={title || _l('绑定组织')}
        width={560}
        onOk={this.handleSave}
        okDisabled={!verifyLicenseInfo.isPlatform && (currentProjectNum > projectNum || currentProjectUserNum > projectUserNum)}
        onCancel={() => this.handlePopupVisibleChange(false)}
      >
        <PrivateDeploymentProjectPopup>
          {verifyLicenseInfo.licenseCode && (
            <div className="licenseCodeWrap flexRow alignItemsCenter mBottom10 card">
              <div className="flex flexRow alignItemsCenter">
                <Icon className="ThemeColor Font40" icon="key1" />
                <div className="mLeft10">{verifyLicenseInfo.isPlatform ? _l('平台版') : LicenseVersions[verifyLicenseInfo.licenseVersion]}</div>
              </div>
              <div className="ThemeColor pointer" onClick={() => this.setState({ privateKeyDialogVisible: true })}>{_l('密钥信息')}</div>
              {this.state.privateKeyDialogVisible && (
                <PrivateKeyDialog
                  codeInfo={verifyLicenseInfo}
                  visible={this.state.privateKeyDialogVisible}
                  onCancel={() => {
                    this.setState({ privateKeyDialogVisible: false });
                  }}
                  onSave={() => {
                    location.reload();
                  }}
                />
              )}
            </div>
          )}
          {loading ? (
            <div className="flexRow Gray_75 mBottom10">
              <LoadDiv size="small" />
            </div>
          ) : (
            !verifyLicenseInfo.isPlatform && (
              <Fragment>
                <div className="Gray_75 mTop5 mBottom5">{_l('绑定后会占组织额度，且不可取消')}</div>
                <div className="flexRow valignWrapper Gray_75 mBottom10">
                  <div className={cx('flexRow valignWrapper mRight40', { warning: currentProjectNum > projectNum })}>
                    <span className="mRight5">{_l('组织数')}</span>
                    {`${currentProjectNum} / ${projectNum}`}
                  </div>
                  <div className={cx('flexRow valignWrapper', { warning: currentProjectUserNum > projectUserNum })}>
                    <span className="mRight5">{_l('人数')}</span>
                    {`${currentProjectUserNum} / ${projectUserNum}`}
                  </div>
                </div>
                <div className="flex projectWrapper">
                  <div
                    className="projectItme flexRow valignWrapper"
                    onClick={() => {
                      if (projects.filter(n => n.isBind).length === projects.length) {
                        this.setState({
                          projects: projects.map(n => {
                            return {
                              ...n,
                              isBind: n.disabled ? n.isBind : false
                            }
                          })
                        });
                      } else {
                        this.setState({
                          projects: projects.map(n => {
                            return {
                              ...n,
                              isBind: true
                            }
                          })
                        });
                      }
                    }}
                  >
                    <Checkbox checked={projects.filter(n => n.isBind).length === projects.length} />
                    <span className="Gray_75">{_l('全选')}</span>
                  </div>
                  {projects.map(item => (
                    <div
                      key={item.projectId}
                      className="projectItme flexRow valignWrapper"
                      onClick={() => {
                        if (!item.disabled) this.changeBind(item);
                      }}
                    >
                      <Checkbox checked={item.isBind} />
                      <span className="flex overflow_ellipsis">{item.companyName}</span>
                      <span className="Gray_75">{_l('%0人', item.projectNormalUserCount)}</span>
                    </div>
                  ))}
                </div>
              </Fragment>
            )
          )}
        </PrivateDeploymentProjectPopup>
      </Dialog>
    );
  }
  render() {
    const { usable, verifyLicenseInfo } = this.props;
    return (
      <Fragment>
        {verifyLicenseInfo ? (
          <Fragment />
        ) : (
          <div className={cx({ pointer: usable })} onClick={() => this.handlePopupVisibleChange(true)}>
            <span className={cx({ associated: usable })}>{_l('绑定')}</span>
          </div>
        )}
        {this.renderDialog()}
      </Fragment>
    );
  }
}

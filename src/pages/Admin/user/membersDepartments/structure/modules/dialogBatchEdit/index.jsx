import React, { Component } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Input, Modal, Radio, Select } from 'ming-ui/antd-components';
import { dialogSelectDept, dialogSelectJob } from 'ming-ui/functions';
import { RoleSelectPopover } from 'ming-ui/functions/quickSelectRole';
import userAjax from 'src/api/user';
import workSiteAjax from 'src/api/workSite';
import { isPasswordValid } from 'src/utils/domain/security/verification';
import { encrypt } from 'src/utils/services/security/encryption';
import DepartmentAction from './DepartmentAction';
import './index.less';

const options = [
  { text: _l('部门'), value: 1 },
  { text: _l('职位'), value: 2 },
  { text: _l('角色'), value: 5 },
  { text: _l('工作地点'), value: 3 },
  {
    text: _l('密码'),
    value: 4,
    get className() {
      return !window.platformENV.isPlatform ? 'show' : 'hide';
    },
  },
];

export default class DialogBatchEdit extends Component {
  requestPending = false;

  constructor(props) {
    super(props);
    this.state = {
      filedValue: 1,
      departmentInfos: [],
      jobInfos: [],
      orgRoles: [],
      workSiteInfo: [],
      isShowAct: false,
      idAct: '',
      messageWay: [],
    };
  }

  changeRadio = val => {
    if (val === this.state.filedValue) return;

    this.setState({ filedValue: val, departmentInfos: [], jobInfos: [], orgRoles: [], workSiteId: '' }, () => {
      if (this.state.filedValue === 3) {
        this.getWorkSites();
      }
    });
  };
  dialogSelectDeptFn = () => {
    const { projectId } = this.props;
    const { departmentInfos } = this.state;
    const _this = this;

    dialogSelectDept({
      projectId,
      unique: false,
      fromAdmin: true,
      showCreateBtn: false,
      selectedDepartment: departmentInfos,
      selectFn(departments) {
        _this.setState({
          departmentInfos: departments,
        });
      },
    });
  };
  dialogSelectJobFn = () => {
    const { projectId } = this.props;
    const { jobInfos } = this.state;
    dialogSelectJob({
      projectId,
      onSave: data => {
        const jobIds = jobInfos.map(job => job.jobId);
        this.setState({
          jobInfos: jobInfos.concat(data.filter(o => jobIds.indexOf(o.jobId) === -1)),
        });
      },
    });
  };

  handleRoleSelect = (data, isCancel = false) => {
    if (!data.length) return;

    const roles = data.map(l => ({ id: l.organizeId, name: l.organizeName }));
    this.setState({
      orgRoles: isCancel
        ? this.state.orgRoles.filter(l => l.id !== data[0].organizeId)
        : _.uniqBy(this.state.orgRoles.concat(roles), 'id'),
    });
  };
  getWorkSites = () => {
    const { projectId } = this.props;
    workSiteAjax
      .getWorkSites({
        projectId,
        pageSize: 10000,
        sortField: 1,
        sortType: 1,
      })
      .then(res => {
        this.setState({ workSiteInfo: _.get(res, 'list') || [] });
      });
  };

  updateRoleForUsers = () => {
    const { projectId, selectedAccountIds } = this.props;
    const { orgRoles = [] } = this.state;

    return userAjax
      .updateOrgRoleForUsers({
        projectId,
        accountIds: selectedAccountIds,
        orgRoleIds: orgRoles.map(item => item.id),
      })
      .then(res => {
        if (res) {
          this.props.loadData(1);
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'), 2);
        }
      });
  };

  // 批量重置密码
  resetPassword = () => {
    const { selectedAccountIds = [], projectId } = this.props;
    let { password } = this.state;
    const { passwordRegexTip, passwordRegex } = _.get(md, ['global', 'SysSettings']) || {};

    if (_.isEmpty(password)) {
      alert(_l('请输入新密码'), 3);
      return;
    } else if (!isPasswordValid(password, passwordRegex)) {
      alert(passwordRegexTip || _l('密码过于简单，至少8~20位且含字母+数字'), 3);
      return;
    }

    return userAjax
      .batchResetPassword({
        projectId,
        accountIds: selectedAccountIds,
        password: encrypt(password),
      })
      .then(result => {
        if (result) {
          alert(_l('修改成功'), 1);
        } else {
          alert(_l('修改失败'), 2);
        }
      });
  };

  submit = () => {
    if (this.requestPending) return;

    const { projectId, selectedAccountIds } = this.props;
    let { departmentInfos = [], jobInfos = [], workSiteId = '', filedValue } = this.state;

    let request;

    if (filedValue === 1) {
      let departmentIds = departmentInfos.map(item => item.departmentId);
      request = userAjax
        .updateDepartmentForUsers({
          projectId,
          accountIds: selectedAccountIds,
          departmentIds,
        })
        .then(res => {
          if (res) {
            this.props.loadData(1);
            alert(_l('修改成功'));
          } else {
            alert(_l('修改失败'), 2);
          }
        });
    } else if (filedValue === 2) {
      let jobIds = jobInfos.map(item => item.jobId);
      request = userAjax.updateJobForUsers({ projectId, accountIds: selectedAccountIds, jobIds }).then(res => {
        if (res) {
          this.props.loadData(1);
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'), 2);
        }
      });
    } else if (filedValue === 3) {
      request = userAjax.updateWorkSiteForUsers({ projectId, accountIds: selectedAccountIds, workSiteId }).then(res => {
        if (res) {
          this.props.loadData(1);
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'), 2);
        }
      });
    } else if (filedValue === 5) {
      request = this.updateRoleForUsers();
    } else if (filedValue === 4) {
      request = this.resetPassword();
    }

    if (!request) return;
    this.requestPending = true;
    this.props.removeUserFromSet(selectedAccountIds);
    this.props.onCancel();
    return request.finally(() => {
      this.requestPending = false;
    });
  };

  render() {
    const { projectId, visible, selectedAccountIds = [] } = this.props;
    const { passwordRegexTip } = _.get(md, ['global', 'SysSettings']) || {};
    let {
      filedValue,
      departmentInfos = [],
      jobInfos = [],
      orgRoles = [],
      isShowAct,
      idAct,
      workSiteInfo = [],
      workSiteId,
      password,
    } = this.state;
    return (
      <Modal
        className="dialogBatchEdit dialogSetEdit"
        title={_l('编辑%0个用户信息', selectedAccountIds.length)}
        open={visible}
        mask={{ closable: true }}
        keyboard
        okText={_l('确认')}
        cancelText={_l('取消')}
        onCancel={this.props.onCancel}
        onOk={this.submit}
      >
        <div className="textSecondary Bold mBottom10">{_l('选择编辑字段')}</div>
        <Radio.Group
          options={(options.filter(it => (!window.platformENV.isPlatform ? true : it.value !== 4)) || []).map(
            ({ text, ...option }) => ({ ...option, label: text }),
          )}
          onChange={event => this.changeRadio(event.target.value)}
          value={filedValue}
        />
        <div className="textSecondary Bold mTop20 mBottom12">{_l('设为')}</div>
        {filedValue === 1 &&
          departmentInfos.map((item, i) => {
            return (
              <span className="itemSpan mAll5">
                {item.departmentName}
                {i === 0 && <span className="isTopIcon">{_l('主')}</span>}
                <div className="moreOption">
                  <Icon
                    className="Font14 Hand textDisabled"
                    icon="moreop"
                    onClick={() => {
                      this.setState({
                        isShowAct: !isShowAct,
                        idAct: !isShowAct ? item.departmentId : '',
                      });
                    }}
                  />
                  {isShowAct && idAct === item.departmentId && (
                    <DepartmentAction
                      onClickAwayExceptions={[]}
                      onClickAway={() =>
                        this.setState({
                          isShowAct: false,
                          idAct: '',
                        })
                      }
                      isPosition={false}
                      isTop={i === 0}
                      deleteFn={() => {
                        let list = departmentInfos.filter(it => it.departmentId !== item.departmentId) || [];
                        this.setState({
                          isShowAct: false,
                          idAct: '',
                          departmentInfos: list,
                        });
                      }}
                      setToTop={() => {
                        let list = departmentInfos.filter(it => it.departmentId !== item.departmentId);
                        let data = departmentInfos.find(it => it.departmentId === item.departmentId);
                        list.unshift(data);
                        this.setState({
                          isShowAct: false,
                          idAct: '',
                          departmentInfos: list,
                        });
                      }}
                      isShowAct={isShowAct}
                    />
                  )}
                </div>
              </span>
            );
          })}
        {filedValue === 2 &&
          _.map(jobInfos, item => {
            return (
              <span className="itemSpan mAll5">
                {item.jobName}
                <div className="moreOption">
                  <Icon
                    className="Font14 Hand textDisabled"
                    icon="moreop"
                    onClick={() => {
                      this.setState({
                        isShowAct: !isShowAct,
                        idAct: !isShowAct ? item.jobId : '',
                      });
                    }}
                  />
                  {isShowAct && idAct === item.jobId && (
                    <DepartmentAction
                      onClickAwayExceptions={[]}
                      onClickAway={() =>
                        this.setState({
                          isShowAct: false,
                          idAct: '',
                        })
                      }
                      isPosition={true}
                      isTop={false}
                      deleteFn={() => {
                        this.setState({
                          isShowAct: false,
                          idAct: '',
                          jobInfos: this.state.jobInfos.filter(it => it.jobId !== item.jobId),
                        });
                      }}
                      isShowAct={isShowAct}
                    />
                  )}
                </div>
              </span>
            );
          })}
        {filedValue === 5 &&
          _.map(orgRoles, item => {
            return (
              <span className="itemSpan roleTag mAll5" key={item.id}>
                <Icon icon="person_new" className="textTertiary Font18 mRight8 TxtMiddle" />
                {item.name}
                <Icon
                  icon="clear"
                  className="mLeft8 Hand"
                  onClick={() => {
                    this.setState({
                      orgRoles: this.state.orgRoles.filter(it => it.id !== item.id),
                    });
                  }}
                />
              </span>
            );
          })}
        {(filedValue === 1 || filedValue === 2) && (
          <Icon
            icon="task_add-02"
            className="Font26 Hand textTertiary mAll5 TxtMiddle"
            onClick={e => {
              let { filedValue } = this.state;

              if (filedValue === 1) {
                this.dialogSelectDeptFn(e);
              } else {
                this.dialogSelectJobFn(e);
              }
            }}
          />
        )}
        {filedValue === 5 && (
          <RoleSelectPopover
            projectId={projectId}
            unique={false}
            value={orgRoles.map(item => ({ organizeId: item.id, organizeName: item.name }))}
            onSave={this.handleRoleSelect}
          >
            <Icon icon="task_add-02" className="Font26 Hand textTertiary mAll5 TxtMiddle" />
          </RoleSelectPopover>
        )}
        {filedValue === 3 && (
          <Select
            className="w100"
            placeholder={_l('请选择')}
            value={workSiteId ? workSiteId : undefined}
            onChange={value => {
              this.setState({ workSiteId: value });
            }}
            options={workSiteInfo.map(item => ({ value: item.workSiteId, label: item.workSiteName }))}
          />
        )}

        {filedValue === 4 && (window.platformENV.isOverseas || window.platformENV.isLocal) && (
          <Input
            className="w100"
            type="password"
            value={password}
            autoComplete="new-password"
            placeholder={passwordRegexTip || _l('密码，8-20位，必须含字母+数字')}
            onChange={e => {
              this.setState({ password: e.target.value });
            }}
          />
        )}
      </Modal>
    );
  }
}

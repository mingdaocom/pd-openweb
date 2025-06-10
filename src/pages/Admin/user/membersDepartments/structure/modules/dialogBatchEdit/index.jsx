import React, { Component } from 'react';
import { Checkbox, Select } from 'antd';
import _ from 'lodash';
import { Dialog, Icon, Input, RadioGroup } from 'ming-ui';
import { dialogSelectDept, dialogSelectJob } from 'ming-ui/functions';
import userAjax from 'src/api/user';
import workSiteAjax from 'src/api/workSite';
import { encrypt } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import DepartmentAction from './DepartmentAction';
import './index.less';

const { Option } = Select;
const options = [
  { text: _l('部门'), value: 1 },
  { text: _l('职位'), value: 2 },
  { text: _l('工作地点'), value: 3 },
  {
    text: _l('密码'),
    value: 4,
    className: md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal ? 'show' : 'hide',
  },
];
const checkedOptions = [
  { label: _l('短信'), value: 1 },
  { label: _l('邮件'), value: 2 },
  { label: _l('微信'), value: 3 },
];
export default class DialogBatchEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filedValue: 1,
      departmentInfos: [],
      jobInfos: [],
      workSiteInfo: [],
      isShowAct: false,
      idAct: '',
      messageWay: [],
    };
  }

  changeRadio = val => {
    if (val === this.state.filedValue) return;

    this.setState({ filedValue: val, departmentInfos: [], jobInfos: [], workSiteId: '' }, () => {
      if (this.state.filedValue === 3) {
        this.getWorkSites();
      }
    });
  };
  dialogSelectDeptFn = e => {
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
  dialogSelectJobFn = e => {
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
  chnageMessageWay = value => {
    this.setState({ messageWay: value });
  };
  submit = () => {
    const { projectId, selectedAccountIds } = this.props;
    let { departmentInfos = [], jobInfos = [], workSiteId = '', filedValue } = this.state;
    if (filedValue === 1) {
      let departmentIds = departmentInfos.map(item => item.departmentId);
      userAjax
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
      userAjax.updateJobForUsers({ projectId, accountIds: selectedAccountIds, jobIds }).then(res => {
        if (res) {
          this.props.loadData(1);
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'), 2);
        }
      });
    } else if (filedValue === 3) {
      userAjax.updateWorkSiteForUsers({ projectId, accountIds: selectedAccountIds, workSiteId }).then(res => {
        if (res) {
          this.props.loadData(1);
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'), 2);
        }
      });
    } else if (filedValue === 4) {
      this.resetPassword();
    }
    this.props.removeUserFromSet(selectedAccountIds);
    this.props.onCancel();
  };
  resetPassword = () => {
    const { selectedAccountIds = [], projectId, emptyUserSet } = this.props;
    let { password } = this.state;
    const { passwordRegexTip, passwordRegex } = _.get(md, ['global', 'SysSettings']) || {};
    if (_.isEmpty(password)) {
      alert(_l('请输入新密码'), 3);
      return;
    } else if (!RegExpValidator.isPasswordValid(password, passwordRegex)) {
      alert(passwordRegexTip || _l('密码过于简单，至少8~20位且含字母+数字'), 3);
      return;
    }
    userAjax
      .batchResetPassword({
        projectId,
        accountIds: selectedAccountIds,
        password: encrypt(password),
      })
      .then(result => {
        if (result) {
          alert(_l('修改成功'), 1);
          this.setState({ batchResetPasswordVisible: false, password: '' });
        } else {
          alert(_l('修改失败'), 2);
        }
        emptyUserSet();
      });
  };
  render() {
    const { visible, selectedAccountIds = [] } = this.props;
    const { passwordRegexTip } = _.get(md, ['global', 'SysSettings']) || {};
    let {
      filedValue,
      departmentInfos = [],
      jobInfos = [],
      isShowAct,
      idAct,
      workSiteInfo = [],
      workSiteId,
      messageWay = [],
      password,
    } = this.state;
    return (
      <Dialog
        className="dialogBatchEdit dialogSetEdit"
        title={_l('编辑%0个用户信息', selectedAccountIds.length)}
        visible={visible}
        okText={_l('确认')}
        cancelText={_l('取消')}
        onCancel={this.props.onCancel}
        onOk={this.submit}
      >
        <div className="Gray_75 Bold ">{_l('选择编辑字段')}</div>
        <RadioGroup
          data={options.filter(it => (!md.global.Config.IsLocal ? it.value !== 4 : true))}
          onChange={this.changeRadio}
          checkedValue={filedValue}
        />
        <div className="Gray_75 Bold mTop20 mBottom12">{_l('设为')}</div>
        {filedValue === 1 &&
          departmentInfos.map((item, i) => {
            return (
              <span className="itemSpan mAll5">
                {item.departmentName}
                {i === 0 && <span className="isTopIcon">{_l('主')}</span>}
                <div className="moreOption">
                  <Icon
                    className="Font14 Hand Gray_bd"
                    icon="moreop"
                    onClick={e => {
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
                    className="Font14 Hand Gray_bd"
                    icon="moreop"
                    onClick={e => {
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
        {(filedValue === 1 || filedValue === 2) && (
          <Icon
            icon="task_add-02"
            className="Font26 Hand Gray_9e mAll5 TxtMiddle"
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
        {filedValue === 3 && (
          <Select
            className="w100"
            placeholder={_l('请选择')}
            value={workSiteId ? workSiteId : undefined}
            onChange={value => {
              this.setState({ workSiteId: value });
            }}
          >
            {workSiteInfo.map(item => (
              <Option value={item.workSiteId}>{item.workSiteName}</Option>
            ))}
          </Select>
        )}
        {filedValue === 4 && md.global.Config.IsLocal && (
          <Input
            className="w100"
            type="password"
            value={password}
            autoComplete="new-password"
            placeholder={passwordRegexTip || _l('密码，8-20位，必须含字母+数字')}
            onChange={value => {
              this.setState({ password: value });
            }}
          />
        )}

        {/* filedValue === 4 && md.global.Config.IsLocal && (
          <div>
            <div className="Gray_75 Bold mTop35">{_l('通知用户新密码')}</div>
            <Checkbox.Group value={messageWay} options={checkedOptions} onChange={this.chnageMessageWay} />
          </div>
        ) */}
      </Dialog>
    );
  }
}

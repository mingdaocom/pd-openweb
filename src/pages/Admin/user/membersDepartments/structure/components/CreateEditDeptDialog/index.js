import React, { Component, Fragment } from 'react';
import { Dialog, FunctionWrap } from 'ming-ui';
import { dialogSelectDept } from 'ming-ui/functions';
import departmentController from 'src/api/department';
import fixedDataAjax from 'src/api/fixedData.js';
import { updateTreeData } from 'src/pages/Admin/user/membersDepartments/structure/modules/util';
import { dialogSelectDeptUser } from '../DialogSelectDeptUser';
import './index.less';

let RESULTS = {
  FAILED: 0,
  SUCCESS: 1,
  EXISTS: 2,
  NOTDEPARTMENTUSER: 3,
  PARENTNOTTOSUB: 4,
  /* 设置的上级部门是自己的子部门 */
};

export default class CreateEditDeptDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      departmentInfo: {},
      parentDepartment: {},
      chargeUsers: [],
      submitLoading: false,
    };
  }
  componentDidMount() {
    if (this.props.type === 'create') return;
    this.getDeptInfo();
  }
  // 获取部门详细信息
  getDeptInfo = () => {
    const { projectId, departmentId } = this.props;
    if (!departmentId) return;
    departmentController
      .getDepartmentInfo({
        projectId,
        departmentId: departmentId,
      })
      .then(res => {
        const { departmentId, departmentName, parentDepartment = {}, chargeUsers = [] } = res;
        this.setState({
          departmentInfo: { departmentId, departmentName },
          parentDepartment,
          chargeUsers,
        });
      });
  };
  onOk = () => {
    const { departmentInfo = {}, parentDepartment, submitLoading } = this.state;
    const { departmentName } = departmentInfo;
    if (parentDepartment.departmentId && parentDepartment.departmentId === departmentInfo.departmentId) {
      return alert(_l('不能设设置自己为上级部门'), 3);
    }
    if (!departmentName) {
      return alert(_l('请输入部门名称'), 2);
    }

    if (submitLoading) return;

    this.setState({ submitLoading: true }, this.handleSubmit);
  };

  handleSubmit = () => {
    const { projectId, departmentId, type, callback = () => {}, newDepartments } = this.props;
    const { departmentInfo = {}, parentDepartment, chargeUsers = [] } = this.state;
    const { departmentName } = departmentInfo;
    const _this = this;

    fixedDataAjax.checkSensitive({ content: departmentName }).then(res => {
      if (res) {
        this.setState({ submitLoading: false });
        return alert(_l('输入内容包含敏感词，请重新填写'), 3);
      }
      if (type === 'create') {
        departmentController
          .addDepartment({
            projectId,
            departmentName,
            parentId: departmentId,
          })
          .then(data => {
            if (data.resultStatus === RESULTS.SUCCESS) {
              callback({ response: data.departmentInfo });
              _this.props.onCancel();
            } else if (data.resultStatus === RESULTS.FAILED) {
              alert(_l('创建失败'), 2);
            } else if (data.resultStatus === RESULTS.EXISTS) {
              alert(_l('该部门已存在'), 3);
            } else if (data.resultStatus === RESULTS.PARENTNOTTOSUB) {
              alert(_l('不能设置子部门为自己的上级部门'), 3);
            }
            this.setState({ submitLoading: false });
          })
          .catch(err => {
            alert(_l('创建失败'), 2);
            this.setState({ submitLoading: false });
          });
      } else {
        departmentController
          .editDepartment({
            projectId,
            departmentId: departmentInfo.departmentId,
            departmentName: departmentInfo.departmentName,
            parentId: parentDepartment.departmentId,
            chargeAccountIds: chargeUsers.map(({ accountId }) => accountId),
          })
          .then(data => {
            const { departmentInfo = {} } = data;
            const newInfo = updateTreeData(
              newDepartments,
              departmentInfo.departmentId,
              departmentInfo.departmentName,
              parentDepartment.departmentId,
            );
            if (data.resultStatus === RESULTS.SUCCESS) {
              callback({
                response: {
                  departmentId: departmentInfo.departmentId,
                  parentId: parentDepartment.departmentId,
                  ...newInfo,
                },
              });
              _this.props.onCancel();
            } else if (data.resultStatus === RESULTS.FAILED) {
              alert(_l('编辑失败'), 2);
            } else if (data.resultStatus === RESULTS.EXISTS) {
              alert(_l('该部门已存在'), 3);
            } else if (data.resultStatus === RESULTS.NOTDEPARTMENTUSER) {
              alert(_l('部门负责人不是部门成员'), 3);
            } else if (data.resultStatus === RESULTS.PARENTNOTTOSUB) {
              alert(_l('不能设置子部门为自己的上级部门'), 3);
            }
            this.setState({ submitLoading: false });
          })
          .catch(err => {
            alert(_l('编辑失败'), 2);
            this.setState({ submitLoading: false });
          });
      }
    });
  };

  changeParent = () => {
    const { projectId } = this.props;
    const { parentDepartment } = this.state;

    dialogSelectDept({
      projectId,
      selectedDepartment: _.isEmpty(parentDepartment) ? [] : [parentDepartment],
      includeProject: true,
      showCreateBtn: false,
      fromAdmin: true,
      selectFn: departments => {
        this.setState({
          parentDepartment: _.isEmpty(departments) ? {} : departments[0],
        });
      },
    });
  };

  selectCharger = () => {
    const { projectId } = this.props;
    const { departmentInfo, chargeUsers } = this.state;
    dialogSelectDeptUser({
      projectId,
      departmentId: departmentInfo.departmentId,
      selectedUsersIds: chargeUsers.map(({ accountId }) => accountId),
      isUnique: false,
      maxCount: 5,
      callback: accounts => this.setState({ chargeUsers: accounts }),
    });
  };

  render() {
    const { projectId, type, visible, onCancel = () => {} } = this.props;
    const { departmentInfo, parentDepartment, chargeUsers, submitLoading } = this.state;
    const { companyName } = _.find(md.global.Account.projects, item => item.projectId === projectId) || {};

    return (
      <Dialog
        visible={visible}
        title={type === 'create' ? _l('创建部门') : _l('编辑部门')}
        onCancel={onCancel}
        onOk={this.onOk}
        okDisabled={submitLoading}
      >
        <div className="departmentInfoList">
          <div className="singleInfo departmentName">
            <span className="infoLabel">{_l('部门名称')}</span>
            <span className="info Relative">
              <input
                type="text"
                value={departmentInfo.departmentName}
                maxlength="64"
                autoFocus
                className="deptName TxtBottom w100"
                onChange={e => {
                  let val = e.target.value;
                  this.setState({ departmentInfo: { ...departmentInfo, departmentName: val } });
                }}
              />
            </span>
          </div>
          {type === 'edit' && (
            <Fragment>
              <div className="singleInfo parentDepartment" onClick={this.changeParent}>
                <span className="infoLabel">{_l('上级部门')}</span>
                <span className="info Hand">
                  <input
                    type="text"
                    value={parentDepartment.departmentName || companyName}
                    maxlength="64"
                    className="deptName TxtBottom"
                  />
                  <span className="icon-arrow-down-border arrowIcon Font16 changeParent"></span>
                </span>
              </div>
              <div className="singleInfo departmentCharger">
                <span className="infoLabel">{_l('部门负责人')}</span>
                <div className="mTop10">
                  <span className="chargerUserBox">
                    {chargeUsers.map(item => {
                      const { avatar, fullname } = item;
                      return (
                        <div className="chargerUserItem">
                          <img src={avatar} alt={fullname} className="chargeUserAvatar" />
                          <span className="TxtMiddle chargeUserName">{fullname}</span>
                          <i
                            className="icon-minus-square Font18 chargeUserDel"
                            onClick={() =>
                              this.setState({ chargeUsers: chargeUsers.filter(it => it.accountId !== item.accountId) })
                            }
                          />
                        </div>
                      );
                    })}
                  </span>
                  <span
                    className="TxtCenter Gray_75 ThemeHoverBorderColor3 ThemeHoverColor3 pointer chargerUser"
                    onClick={this.selectCharger}
                  >
                    <i className="icon-plus" />
                  </span>
                </div>
              </div>
            </Fragment>
          )}
        </div>
      </Dialog>
    );
  }
}

export const createEditDeptDialog = props => FunctionWrap(CreateEditDeptDialog, { ...props });

import React, { Component } from 'react';
import { Dialog, VerifyPasswordConfirm, Checkbox, UserHead } from 'ming-ui';
import userController from 'src/api/user';
import functionWrap from 'ming-ui/components/FunctionWrap';
import moment from 'moment';
import './index.less';
import { getCurrentProject } from 'src/util';
import { downloadFile } from '../../util';

class UserBoardDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: props.accountIds,
    };
  }
  componentDidMount() {
    this.getUserList();
  }

  getUserList = () => {
    const { accountIds = [], projectId } = this.props;
    userController
      .getUserListByAccountId({
        accountIds: accountIds,
        projectId: projectId,
      })
      .then(res => {
        this.setState({ userList: res.list, selected: accountIds });
      });
  };

  exportUser = () => {
    const { projectId } = this.props;
    const { selected = [] } = this.state;
    if (_.isEmpty(selected)) {
      return alert(_l('请选择要导出的用户'), 2);
    }
    this.props.onCancel();
    VerifyPasswordConfirm.confirm({
      allowNoVerify: false,
      isRequired: false,
      closeImageValidation: false,
      onOk: () => {
        var url = `${md.global.Config.AjaxApiUrl}download/exportProjectUserList`;
        let projectName = getCurrentProject(projectId, true).companyName || '';
        let date = moment().format('YYYYMMDDHHmmss');
        const fileName = `${projectName}_${_l('人员')}_${date}` + '.xlsx';

        downloadFile({
          url,
          params: {
            userStatus: '1',
            projectId,
            accountIds: selected.join(','),
          },
          exportFileName: fileName,
        });
      },
    });
  };
  onCancel = () => {
    this.props.onCancel();
    this.props.updateSelectUserIds();
  };
  render() {
    const { selected = [], userList = [] } = this.state;
    const isChecked = selected.length === userList.length;

    return (
      <Dialog
        width={700}
        className="userBoardDialog"
        visible
        title={_l('批量导出')}
        okText={_l('确认导出')}
        cancelText={_l('重新选择')}
        onCancel={this.onCancel}
        onOk={this.exportUser}
      >
        <div className="userBoard pTop5 pBottom5">
          <div className="Font14 mBottom8">{_l('用户列表： 已选择 %0 个用户', selected.length)}</div>
          <div className="tableBox">
            <table className="w100 usersTable" cellspacing="0">
              <thead>
                <tr>
                  <th className="checkBox">
                    <Checkbox
                      checked={isChecked}
                      onClick={checked => {
                        this.setState({ selected: checked ? [] : userList.map(it => it.accountId) });
                      }}
                    />
                  </th>
                  <th width="20%">{_l('姓名/职位')}</th>
                  <th width="15%">{_l('部门')}</th>
                  <th width="15%">{_l('工作地点')}</th>
                  <th>{_l('工作电话/手机')}</th>
                  <th>{_l('邮箱')}</th>
                </tr>
              </thead>
              <tbody>
                {userList.map(user => {
                  const { accountId, avatar, fullname, isDepartmentChargeUser } = user;
                  const checked = _.includes(selected, accountId);
                  return (
                    <tr className="userItem" key={accountId}>
                      <td className="checkBox">
                        <Checkbox
                          checked={checked}
                          onClick={checked => {
                            this.setState({
                              selected: checked ? selected.filter(it => it !== accountId) : selected.concat(accountId),
                            });
                          }}
                        />
                      </td>
                      <td>
                        <table class="w100" style={{ tableLayout: 'fixed' }}>
                          <tr>
                            <td width="38px">
                              <UserHead
                                className="circle mRight8"
                                user={{
                                  userHead: avatar,
                                  accountId: accountId,
                                }}
                                size={36}
                                projectId={this.props.projectId}
                              />
                            </td>
                            <td>
                              <div className="name" title={fullname}>
                                {fullname}

                                {isDepartmentChargeUser && <span class="icon-ic-head Font16 mLeft5 chargeIcon"></span>}
                              </div>
                              <div className="job" title={user.job}>
                                {user.job}
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>

                      <td>
                        <span
                          className="dept"
                          title={(user.departmentInfos || []).map(v => v.departmentName).join(';')}
                        >
                          {(user.departmentInfos || []).map(v => v.departmentName).join(';')}
                        </span>
                      </td>
                      <td>
                        <div className="workSite" title={user.workSite}>
                          {user.workSite}
                        </div>
                      </td>
                      <td>
                        <div>
                          <span>{user.contactPhone}</span>
                        </div>
                        <div>
                          {user.isPrivateMobile ? (
                            <span title={_l('保密')} className="overflow_ellipsis">
                              *********
                            </span>
                          ) : user.mobilePhone ? (
                            <span>{user.mobilePhone}</span>
                          ) : (
                            ''
                          )}
                        </div>
                      </td>
                      <td>
                        {user.isPrivateEmail ? (
                          <span title={_l('保密')} className="overflow_ellipsis">
                            *********
                          </span>
                        ) : user.email ? (
                          <span className="email" title={user.email}>
                            {user.email}
                          </span>
                        ) : (
                          ''
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Dialog>
    );
  }
}

export const dialogUserBoard = props => functionWrap(UserBoardDialog, props);

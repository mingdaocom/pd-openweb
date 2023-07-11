import React, { Component } from 'react';
import { Dialog, VerifyPasswordConfirm } from 'ming-ui';
import userController from 'src/api/user';
import functionWrap from 'ming-ui/components/FunctionWrap';
import UserHead from 'src/pages/feed/components/userHead';
import { getPssId } from 'src/util/pssId';
import moment from 'moment';
import cx from 'classnames';
import './index.less';

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
      title: <div className="Bold">{_l('请输入登录密码，以验证管理员身份')}</div>,
      description: '',
      inputName: _l('登录密码'),
      allowNoVerify: false,
      onOk: () => {
        var url = `${md.global.Config.AjaxApiUrl}download/exportProjectUserList`;
        let projectName = (md.global.Account.projects || []).filter(item => item.projectId === projectId).length
          ? (md.global.Account.projects || []).filter(item => item.projectId === projectId)[0].companyName
          : '';
        fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            Authorization: `md_pss_id ${getPssId()}`,
          },
          body: JSON.stringify({
            userStatus: '1',
            projectId,
            accountIds: selected.join(','),
          }),
        })
          .then(response => response.blob())
          .then(blob => {
            let date = moment(new Date()).format('YYYYMMDDHHmmss');
            const fileName = `${projectName}_${_l('人员')}_${date}` + '.xlsx';
            const link = document.createElement('a');

            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(link.href);
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
          <div className="Font14 mBottom8">
            {_l('用户列表： 已选择')}
            <span class="count ThemeColor3">{selected.length}</span>
            {_l('个用户')}
          </div>
          <div className="tableBox">
            <table className="w100 usersTable" cellspacing="0">
              <thead>
                <tr>
                  <th className="checkBox">
                    <span
                      className={cx('checkAll TxtMiddle mRight5 Icon_UnChecked ', { Icon_Checked: isChecked })}
                      onClick={() => {
                        this.setState({ selected: isChecked ? [] : userList.map(it => it.accountId) });
                      }}
                    ></span>
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
                        <span
                          className={cx('check TxtMiddle mRight5 Icon_UnChecked', { Icon_Checked: checked })}
                          onClick={() => {
                            this.setState({
                              selected: checked ? selected.filter(it => it !== accountId) : selected.concat(accountId),
                            });
                          }}
                        ></span>
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
                                lazy={'false'}
                                size={36}
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
                          <span>{user.mobilePhone}</span>
                          {user.isPrivateMobile && (
                            <span title={_l('保密')} className="overflow_ellipsis">
                              *********
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="email" title={user.email}>
                          {user.email}
                        </span>
                        {user.isPrivateEmail && (
                          <span title={_l('保密')} className="overflow_ellipsis">
                            *********
                          </span>
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

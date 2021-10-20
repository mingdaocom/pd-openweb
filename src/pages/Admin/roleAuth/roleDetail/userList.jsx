import React from 'react';
import PropTypes from 'prop-types';
import LoadDiv from 'ming-ui/components/LoadDiv';
import UserHead from 'src/pages/feed/components/userHead';

import RoleController from 'src/api/role';

class RoleUserList extends React.Component {
  static propTypes = {
    projectId: PropTypes.string,
    roleId: PropTypes.string,
    userOpAuth: PropTypes.bool,
    isSuperAdmin: PropTypes.bool,
    isApply: PropTypes.bool,
    manualDef: PropTypes.func,
    callback: PropTypes.func,
  };

  static defaultProps = {
    manualDef() {},
    callback() {},
    isApply: false,
  };

  constructor() {
    super();

    this.state = {
      pageIndex: 1,
      pageSize: 50,
      isLoading: false,
      users: null,
      allCount: null,
      keywords: ''
    };

    this.getUserList = this.getUserList.bind(this);
  }

  componentDidMount() {
    this.props.manualDef(this);
  }

  componentWillMount() {
    this.getUserList();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.keywords !== this.props.keywords) {
      this.setState({
        keywords: nextProps.keywords,
        pageIndex: 1
      }, () => {
        this.getUserList()
      })
    }
  }

  componentDidUpdate() {
    const { allCount, pageIndex, pageSize } = this.state;
    if (this.pager) {
      $(this.pager)
        .show()
        .Pager({
          pageIndex,
          pageSize,
          count: allCount,
          changePage: pageIndex => {
            this.setState({ pageIndex }, this.getUserList);
          },
        });
    }
  }

  getUserList() {
    const { pageIndex, pageSize, keywords } = this.state;
    const { projectId, roleId, callback } = this.props;
    this.setState({
      isLoading: true,
    });
    return RoleController.getPageUserIds({
      pageIndex,
      pageSize,
      projectId,
      roleId,
      keywords
    })
      .done(({ allCount, list } = {}) => {
        if (allCount === undefined) {
          return $
            .Deferred()
            .reject()
            .promise();
        }
        this.setState({
          isLoading: false,
          users: list,
          allCount,
        });

        callback(allCount !== 0);
      })
      .fail(() => {
        this.setState({
          isLoading: false,
        });
      });
  }

  renderUserList() {
    const { userOpAuth, isSuperAdmin, projectId, roleId, isApply } = this.props;
    const { users, isLoading } = this.state;
    if (isLoading) {
      return (
        <tr>
          <td colSpan="5" className="listEmpty">
            <LoadDiv />
          </td>
        </tr>
      );
    }

    if (users && users.length) {
      return (
        <React.Fragment>
          {_.map(users, user => {
            return (
              <tr key={user.accountId} className="tdHover">
                <td className="avatarBox ">
                  <UserHead user={{ userHead: user.avatar, accountId: user.accountId }} lazy={'false'} size={32} />
                </td>
                <td className="userName">{user.fullName}</td>
                <td className="userProfession">{user.profession}</td>
                <td className="userDepartment">{user.departName}</td>
                {!isApply ? (
                  <td className="userOperation ThemeHoverColor3">
                    {userOpAuth && !(user.accountId === md.global.Account.accountId && isSuperAdmin) ? (
                      <span
                        className="adminHoverDeleteColor"
                        onClick={() => {
                          RoleController.removeUserFromRole({
                            accountId: user.accountId,
                            projectId,
                            roleId,
                          }).then(res => {
                            if (res) {
                              alert(_l('操作成功'));
                              this.getUserList();
                            } else {
                              alert(_l('操作失败'), 2);
                            }
                          });
                        }}
                      >
                        {_l('移除')}
                      </span>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </React.Fragment>
      );
    } else {
      return (
        <tr>
          <td colSpan={isApply ? 4 : 5} className="listEmpty">
            <div>
              <span className="icon-empty_member mainIcon" />
            </div>
            <div className="mTop20">{_l('暂无成员')}</div>
          </td>
        </tr>
      );
    }
  }

  render() {
    const { isApply } = this.props;
    const { users, allCount, pageSize, isLoading } = this.state;
    return (
      <div className="roleAuthDetailTable">
        <table className="w100">
          <thead className="roleUserTitle">
            <tr>
              <th className="userAvatar" />
              <th className="userName">{_l('姓名')}</th>
              <th className="userProfession">{_l('职位')}</th>
              <th className="userDepartment">{_l('部门')}</th>
              {!isApply ? <th className="userOperation">{_l('操作')}</th> : null}
            </tr>
          </thead>
        </table>
        <div className="roleAuthDetailScroll">
          <table className="w100">
            <tbody className="roleUserList">{this.renderUserList()}</tbody>
          </table>
        </div>
        {!isLoading && users && allCount > pageSize ? (
          <div
            ref={el => {
              this.pager = el;
            }}
          />
        ) : null}
      </div>
    );
  }
}

export default RoleUserList;

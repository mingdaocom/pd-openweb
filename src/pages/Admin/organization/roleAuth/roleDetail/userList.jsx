import React from 'react';
import PropTypes from 'prop-types';
import { LoadDiv, UserHead } from 'ming-ui';
import RoleController from 'src/api/role';
import PaginationWrap from '../../../components/PaginationWrap';
import { navigateTo } from 'src/router/navigateTo';
import cx from 'classnames';
import _ from 'lodash';

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
      keywords: '',
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
    if (nextProps.keywords !== this.props.keywords) {
      this.setState(
        {
          keywords: nextProps.keywords,
          pageIndex: 1,
        },
        () => {
          this.getUserList();
        },
      );
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
      keywords,
    })
      .then(({ allCount, list } = {}) => {
        if (allCount === undefined) {
          return Promise.reject();
        }
        this.setState({
          isLoading: false,
          users: list,
          allCount,
        });

        callback(allCount !== 0);
      })
      .catch(() => {
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
            const isOwner = user.accountId === md.global.Account.accountId;

            return (
              <tr key={user.accountId} className="tdHover">
                <td className="userHeadBox">
                  <UserHead
                    user={{ userHead: user.avatar, accountId: user.accountId }}
                    size={32}
                    projectId={projectId}
                  />
                </td>
                <td className="userName">{user.fullName}</td>
                <td className="userProfession">{user.profession}</td>
                <td className="userDepartment">{(user.departName || '').replace(/;/g, '；')}</td>
                {!isApply ? (
                  <td
                    className={cx('userOperation ThemeHoverColor3', {
                      pLeft8: this.roleUserList.clientHeight > this.roleAuthDetailScroll.clientHeight,
                    })}
                  >
                    {userOpAuth && !(isOwner && isSuperAdmin) ? (
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
                              if (isOwner) {
                                location.href = '/admin/sysroles/' + projectId;
                              } else {
                                this.getUserList();
                              }
                            } else {
                              alert(_l('操作失败'), 2);
                            }
                          });
                        }}
                      >
                        {isOwner ? _l('退出') : _l('移除')}
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
        <div className="roleAuthDetailScroll" ref={node => (this.roleAuthDetailScroll = node)}>
          <table className="w100">
            <tbody className="roleUserList roleUserListEmpty" ref={node => (this.roleUserList = node)}>
              {this.renderUserList()}
            </tbody>
          </table>
        </div>
        {!isLoading && users && allCount > pageSize ? (
          <PaginationWrap
            total={allCount}
            pageSize={pageSize}
            pageIndex={this.state.pageIndex}
            onChange={pageIndex => this.setState({ pageIndex }, this.getUserList)}
          />
        ) : null}
      </div>
    );
  }
}

export default RoleUserList;

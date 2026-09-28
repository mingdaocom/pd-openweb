import React from 'react';
import _ from 'lodash';
import { LoadDiv, UserHead } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import RoleController from 'src/api/role';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import PaginationWrap from '../../../components/PaginationWrap';
import './style.less';

export default class ApplyForRole extends React.Component {
  constructor() {
    super();
    this.state = {
      pageIndex: 1,
      pageSize: 10,
      totalCount: null,
      list: null,
      isLoading: false,
    };

    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const { projectId } = this.props;
    const { pageIndex, pageSize } = this.state;
    this.setState({
      isLoading: true,
    });
    this.promise = RoleController.getUnauditedUserDetail({
      projectId,
      pageIndex,
      pageSize,
    })
      .then(data => {
        if (data) {
          this.setState({
            totalCount: data.allCount,
            list: data.list,
            isLoading: false,
          });
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        this.setState({
          isLoading: false,
        });
      });
  }

  renderUsers() {
    const { projectId } = this.props;
    const { list } = this.state;

    return (
      <React.Fragment>
        {list && list.length ? (
          _.map(list, user => {
            return (
              <tr key={user.accountId}>
                <td>
                  <UserHead
                    className="avatarImg"
                    user={{ userHead: user.avatar, accountId: user.accountId }}
                    size={30}
                    projectId={projectId}
                  />
                </td>
                <td>{user.fullName}</td>
                <td>{user.departName}</td>
                <td>{user.jobName}</td>
                <td>{user.roleName}</td>
                <td>
                  <span
                    className="Hand colorPrimary"
                    onClick={() => {
                      RoleController.agreeUserToRole({
                        accountId: user.accountId,
                        roleId: user.roleId,
                        projectId,
                      })
                        .then(data => {
                          if (data) {
                            alert(_l('操作成功'), 1);
                            this.fetchData();
                          } else {
                            throw new Error();
                          }
                        })
                        .catch(function (_requestError) {
                          alertIfNotUnauthorized(_requestError, _l('操作失败'), 2);
                        });
                    }}
                  >
                    {_l('授予权限')}
                  </span>
                  <span
                    className="Hand Red mLeft24"
                    onClick={() => {
                      RoleController.refuseUserToRole({
                        accountId: user.accountId,
                        roleId: user.roleId,
                        projectId,
                      })
                        .then(data => {
                          if (data) {
                            alert(_l('操作成功'), 1);
                            this.fetchData();
                          } else {
                            throw new Error();
                          }
                        })
                        .catch(function (_requestError2) {
                          alertIfNotUnauthorized(_requestError2, _l('操作失败'), 2);
                        });
                    }}
                  >
                    {_l('拒绝')}
                  </span>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="6" className="listEmpty">
              <div>
                <span className="icon-empty_member mainIcon" />
              </div>
              <div className="mTop20">{_l('暂无申请')}</div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  }

  render() {
    const { visible, onClose } = this.props;
    const { isLoading, list, totalCount, pageSize } = this.state;
    return (
      <Modal
        className="applyRoleDialog"
        width={850}
        title={_l('权限申请')}
        open={visible}
        mask={{ closable: true }}
        keyboard
        onCancel={onClose}
      >
        {isLoading ? (
          <LoadDiv />
        ) : (
          <React.Fragment>
            <div className="roleApplyContainer">
              <table className="w100">
                <thead className="roleUserTitle">
                  <tr>
                    <th className="userAvatar" />
                    <th className="userName">{_l('姓名')}</th>
                    <th className="userDepartment">{_l('部门')}</th>
                    <th className="userProfession">{_l('职位')}</th>
                    <th className="userApplyRole">{_l('申请权限组')}</th>
                    <th className="userOperation">{_l('操作')}</th>
                  </tr>
                </thead>
                <tbody>{isLoading ? null : this.renderUsers()}</tbody>
              </table>
              {isLoading ? <LoadDiv /> : null}
              {!isLoading && list && totalCount > pageSize ? (
                <PaginationWrap
                  total={totalCount}
                  pageSize={pageSize}
                  pageIndex={this.state.pageIndex}
                  onChange={pageIndex => this.setState({ pageIndex }, this.fetchData)}
                />
              ) : null}
            </div>
          </React.Fragment>
        )}
      </Modal>
    );
  }
}

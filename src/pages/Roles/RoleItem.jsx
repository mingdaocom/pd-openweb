import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon, Button, ScrollView } from 'ming-ui';
import Menu from 'ming-ui/components/Menu/Menu';
import MenuItem from 'ming-ui/components/Menu/MenuItem';
import UserHead from 'src/pages/feed/components/userHead';
import RoleDialog from './RoleDialog';
import { ROLE_TYPES, rolePropType, ROLE_CONFIG } from './config';
import { CSSTransition } from 'react-transition-group';
import styles from './style.less?module';
import './transition.less';
import { SortableElement } from 'react-sortable-hoc';
import { getCurrentProject } from 'src/util';

const TYPES = RoleDialog.TYPES;

export default class RoleItem extends PureComponent {
  static propTypes = {
    isOwner: PropTypes.bool,
    isAdmin: PropTypes.bool,
    isUserAdmin: PropTypes.bool,
    collapse: PropTypes.bool,
    role: rolePropType,
    roles: PropTypes.arrayOf(rolePropType),
    onClickRole: PropTypes.func,
    onSelectRole: PropTypes.func,
    transferApp: PropTypes.func,
    copyRole: PropTypes.func,
    addJobToRole: PropTypes.func,
    addDepartmentToRole: PropTypes.func,
    addUserToRole: PropTypes.func,
    removeUserFromRole: PropTypes.func,
    moveUser: PropTypes.func,
    deleteRole: PropTypes.func,
    exitRole: PropTypes.func,
    rolesVisibleConfig: PropTypes.string,
  };

  state = {
    selectUserIds: [],
    selectDepIds: [],
    selectJobIds: [],
    dialogType: '',
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.collapse && !this.props.collapse) {
      this.setState({
        selectUserIds: [],
        selectDepIds: [],
        selectJobIds: [],
      });
    }
  }

  renderDialog() {
    const { dialogType, selectUserIds, selectDepIds, selectJobIds } = this.state;
    const { roles, removeUserFromRole, moveUser, deleteRole, exitRole } = this.props;
    if (dialogType) {
      return (
        <RoleDialog
          type={dialogType}
          roleList={roles.filter(item => item.roleType !== ROLE_TYPES.ADMIN)}
          onOk={roleId => {
            let promise;
            if (dialogType === TYPES.REMOVE_USER) {
              promise = removeUserFromRole(selectUserIds, selectDepIds, selectJobIds);
            } else if (dialogType === TYPES.DELETE || dialogType === TYPES.DELETE_WITH_USER) {
              promise = deleteRole(roleId);
              return promise;
            } else if (dialogType === TYPES.MOVE_USER) {
              promise = moveUser(roleId, selectUserIds, selectDepIds, selectJobIds);
            } else if (dialogType === TYPES.EXIT) {
              promise = exitRole();
            }

            return promise.then(() => {
              // 关闭confirm
              this.setState({
                dialogType: '',
                selectUserIds: [],
                selectDepIds: [],
                selectJobIds: [],
              });
            });
          }}
          onCancel={() => {
            this.setState({
              dialogType: '',
            });
          }}
        />
      );
    }
  }

  renderDesc() {
    const { selectUserIds, selectDepIds, selectJobIds } = this.state;
    const {
      role: { description, permissionWay },
      collapse,
    } = this.props;

    if (!collapse && (selectUserIds.length || selectDepIds.length || selectJobIds.length)) {
      return (
        <div className="mTop6 Gray_75">
          {_l('已选择%0个用户', selectUserIds.length + selectDepIds.length + selectJobIds.length)}
          <span
            className="Hand ThemeColor3 ThemeHoverColor2 mRight24 mLeft15"
            onClick={e => {
              this.setState({
                selectUserIds: [],
                selectDepIds: [],
                selectJobIds: [],
              });
              e.stopPropagation();
            }}
          >
            {_l('取消')}
          </span>
          <span className="Gray_bd">|</span>
          <span
            className="Hand ThemeColor3 ThemeHoverColor2 mLeft24"
            onClick={e => {
              this.setState({
                dialogType: TYPES.MOVE_USER,
              });
              e.stopPropagation();
            }}
          >
            {_l('移到其他角色')}
          </span>
          <span
            className="Hand ThemeColor3 ThemeHoverColor2 mLeft20"
            onClick={e => {
              this.setState({
                dialogType: TYPES.REMOVE_USER,
              });
              e.stopPropagation();
            }}
          >
            {_l('移出')}
          </span>
        </div>
      );
    } else {
      const text =
        description || (permissionWay === 80 ? _l('可以配置应用，管理应用下所有数据和人员') : _l('自定义权限'));
      return (
        text && (
          <div className="Gray_9e mTop6 ellipsis" style={{ width: 600 }}>
            {text}
          </div>
        )
      );
    }
  }

  renderAvatarList() {
    const {
      isOwner,
      isAdmin,
      collapse,
      transferApp,
      copyRole,
      onSelectRole,
      projectId,
      role: { users, departmentsInfos, jobInfos = [], roleType },
    } = this.props;
    const isExist = !!_.find(users, ({ accountId }) => accountId === md.global.Account.accountId);

    if (collapse) {
      return (
        <React.Fragment>
          <div className={styles.roleMembers}>
            {_.map(users.slice(0, 6), user => (
              <UserHead
                key={user.accountId}
                projectId={_.isEmpty(getCurrentProject(projectId)) ? '' : projectId}
                size={26}
                lazy="false"
                user={{
                  ...user,
                  userHead: user.avatar,
                }}
                className={styles.roleAvatar}
              />
            ))}
          </div>
          <Icon icon="arrow-right-border" className="Hand Font20 LightGray mLeft15 ThemeHoverColor3" />
        </React.Fragment>
      );
    }

    return (
      <Fragment>
        {roleType !== ROLE_TYPES.ADMIN && isAdmin && (
          <div className={styles.roleAction}>
            <span
              className={styles.roleSettings + ' Hand ThemeColor3'}
              onClick={evt => {
                evt.stopPropagation();
                onSelectRole();
              }}
            >
              {_l('设置角色权限')}
            </span>
          </div>
        )}

        {(isExist || isAdmin) && (
          <div className={styles.roleAction + ' Relative mLeft10'}>
            <Menu
              mode={'vertical-right'}
              className={styles.roleActionMenu}
              trigger={
                <span className={styles.roleOperationBox + ' Hand Gray_75 ThemeHoverColor3 roleOperationMore'}>
                  <i className="icon-more_horiz Font18" style={{ lineHeight: 'inherit' }} />
                </span>
              }
            >
              {roleType === ROLE_TYPES.ADMIN && isOwner && <MenuItem onClick={transferApp}>{_l('转交应用')}</MenuItem>}

              {isExist && ((roleType === ROLE_TYPES.ADMIN && !isOwner) || roleType !== ROLE_TYPES.ADMIN) && (
                <MenuItem onClick={() => this.setState({ dialogType: TYPES.EXIT })}>{_l('离开角色')}</MenuItem>
              )}

              {roleType !== ROLE_TYPES.ADMIN && isAdmin && (
                <Fragment>
                  <MenuItem onClick={copyRole}>{_l('复制角色')}</MenuItem>
                  <MenuItem
                    className={styles.danger}
                    onClick={() => {
                      if (users.length + departmentsInfos.length + jobInfos.length) {
                        this.setState({ dialogType: TYPES.DELETE_WITH_USER });
                      } else {
                        this.setState({ dialogType: TYPES.DELETE });
                      }
                    }}
                  >
                    {_l('删除角色')}
                  </MenuItem>
                </Fragment>
              )}
            </Menu>
          </div>
        )}
      </Fragment>
    );
  }

  renderHeader(isInCurrentRole) {
    const {
      role: { name, users, departmentsInfos, jobInfos = [] },
      collapse,
      onClickRole,
      disabled,
    } = this.props;

    return (
      <div
        className={cx(styles.roleItemHeader, {
          Hand: collapse,
          grab: !disabled,
        })}
        onClick={evt => {
          if (!$(evt.target).closest('.roleOperationMore').length) {
            onClickRole();
          }
        }}
      >
        <div className={styles.roleInfo}>
          <div>
            <span className="Font16 TxtMiddle bold mRight12">{name}</span>
            {isInCurrentRole && <span className={styles.roleTag + ' TxtMiddle mRight12'}>{_l('我的角色')}</span>}
            {jobInfos.length > 0 && <span className="Gray_9e TxtMiddle">{_l('%0 个职位', jobInfos.length)}</span>}
            {jobInfos.length > 0 && (departmentsInfos.length > 0 || users.length > 0) && (
              <span className="Gray_9e TxtMiddle">、</span>
            )}

            {departmentsInfos.length > 0 && (
              <span className="Gray_9e TxtMiddle">{_l('%0 个部门', departmentsInfos.length)}</span>
            )}
            {departmentsInfos.length > 0 && users.length > 0 && <span className="Gray_9e TxtMiddle">、</span>}

            {users.length > 0 && <span className="Gray_9e TxtMiddle">{_l('%0 个人', users.length)}</span>}
          </div>
          {this.renderDesc()}
        </div>
        {this.renderAvatarList()}
      </div>
    );
  }

  renderUserTag(roleType, { isOwner }) {
    if (isOwner) {
      return (
        <span className={styles.memberTag}>
          <span className={styles.ownerTag}>{_l('拥有者')}</span>
        </span>
      );
    } else if (roleType === ROLE_TYPES.ADMIN) {
      return <span className={styles.memberTag + ' Gray_75'}>{_l('管理员')}</span>;
    }
  }

  renderList() {
    const {
      projectId,
      isUserAdmin,
      collapse,
      role: { users, departmentsInfos, jobInfos = [] },
      addJobToRole,
      addDepartmentToRole,
      addUserToRole,
    } = this.props;

    if (collapse) return <Fragment />;

    return (
      <Fragment>
        {users && departmentsInfos && jobInfos && users.length + departmentsInfos.length + jobInfos.length > 0 ? (
          <ScrollView className={styles.roleMemberListWrapper}>
            <div className={styles.roleMemberList}>
              {_.map(
                departmentsInfos.filter(o => o.departmentId.indexOf('orgs_') > -1),
                item => this.renderDepartmentItem(item),
              )}

              {_.map(
                users.filter(o => o.isOwner),
                user => this.renderUserItem(user),
              )}

              {_.map(jobInfos, item => this.renderJobItem(item))}

              {_.map(
                departmentsInfos.filter(o => o.departmentId.indexOf('orgs_') === -1),
                item => this.renderDepartmentItem(item),
              )}

              {_.map(
                users.filter(o => !o.isOwner),
                user => this.renderUserItem(user),
              )}
            </div>
          </ScrollView>
        ) : (
          <div className={'mBottom50 Gray_75 TxtCenter Font17 ' + styles.emptyContent}>
            <div>{_l('此角色下还没有用户')}</div>
            {isUserAdmin && <div>{_l('你可以添加人员或部门一起协作')}</div>}
          </div>
        )}
        {isUserAdmin ? (
          <div className="TxtRight pTop20 pBottom20 pRight24 pLeft24">
            {!!projectId && !_.isEmpty(getCurrentProject(projectId)) && (
              <Button type="ghost" radius onClick={addJobToRole} className="pLeft10 pRight10">
                {_l('添加职位')}
              </Button>
            )}

            {!!projectId && !_.isEmpty(getCurrentProject(projectId)) && (
              <Button type="ghost" radius onClick={addDepartmentToRole} className="pLeft10 pRight10 mLeft10">
                {_l('添加部门')}
              </Button>
            )}

            <Button type="primary" radius onClick={addUserToRole} className="pLeft10 pRight10 mLeft10">
              {_l('添加人员')}
            </Button>
          </div>
        ) : null}
      </Fragment>
    );
  }

  renderUserItem(user) {
    const {
      isUserAdmin,
      projectId,
      role: { roleType },
    } = this.props;
    const { selectUserIds } = this.state;
    const isSelected = selectUserIds.indexOf(user.accountId) !== -1;
    const canSelect = isUserAdmin && !user.isOwner;
    const clickHandler = canSelect
      ? () => {
          this.setState({
            selectUserIds: isSelected
              ? _.filter(selectUserIds, accountId => accountId !== user.accountId)
              : selectUserIds.concat(user.accountId),
          });
        }
      : undefined;

    return (
      <div className={styles.roleMemberWrapper} onClick={clickHandler} key={user.accountId} title={user.fullName}>
        <div
          className={cx(styles.roleMember, {
            [styles.selected]: isSelected,
            [styles.canSelect]: canSelect,
          })}
        >
          <UserHead
            key={user.accountId}
            projectId={_.isEmpty(getCurrentProject(projectId)) ? '' : projectId}
            size={40}
            lazy="false"
            user={{
              ...user,
              userHead: user.avatar,
            }}
          />
          <div className={styles.memberInfo}>
            <div className={styles.memberName}>{user.fullName}</div>
            {this.renderUserTag(roleType, user)}
          </div>
          {canSelect && this.renderSelect(isSelected)}
        </div>
      </div>
    );
  }

  renderJobItem(item) {
    const { isUserAdmin } = this.props;
    const { selectJobIds } = this.state;
    const isSelected = selectJobIds.indexOf(item.jobId) !== -1;
    const clickHandler = isUserAdmin
      ? () => {
          this.setState({
            selectJobIds: isSelected
              ? _.filter(selectJobIds, id => id !== item.jobId)
              : selectJobIds.concat(item.jobId),
          });
        }
      : undefined;

    return (
      <div className={styles.roleMemberWrapper} onClick={clickHandler} key={item.jobId} title={item.jobName}>
        <div
          className={cx(styles.roleMember, {
            [styles.selected]: isSelected,
            [styles.canSelect]: isUserAdmin,
          })}
        >
          <div className={styles.iconBG}>
            <Icon icon="limit-principal" className="Gray_9e Font24" />
          </div>
          <div className={styles.memberInfo}>
            <div className={styles.memberName}>{item.jobName}</div>
            <span className={styles.memberTag}>
              <span className={styles.ownerTag}>{_l('职位')}</span>
            </span>
          </div>
          {isUserAdmin && this.renderSelect(isSelected)}
        </div>
      </div>
    );
  }

  renderDepartmentItem(item) {
    const { isUserAdmin } = this.props;
    const { selectDepIds } = this.state;
    const isAllProject = item.departmentId.indexOf('orgs_') > -1;
    const isSelected = selectDepIds.indexOf(item.departmentId) !== -1;
    const clickHandler = isUserAdmin
      ? () => {
          this.setState({
            selectDepIds: isSelected
              ? _.filter(selectDepIds, id => id !== item.departmentId)
              : selectDepIds.concat(item.departmentId),
          });
        }
      : undefined;

    return (
      <div
        className={styles.roleMemberWrapper}
        onClick={clickHandler}
        key={item.departmentId}
        title={item.departmentName}
      >
        <div
          className={cx(styles.roleMember, {
            [styles.selected]: isSelected,
            [styles.canSelect]: isUserAdmin,
          })}
        >
          <div className={styles.iconBG} style={{ background: isAllProject ? '#2196f3' : '#eaeaea' }}>
            <Icon
              icon={isAllProject ? 'business' : 'group'}
              className={cx('Font24', isAllProject ? 'White' : 'Gray_9e')}
            />
          </div>
          <div className={styles.memberInfo}>
            <div className={styles.memberName}>{item.departmentName}</div>
            {!isAllProject && (
              <span className={styles.memberTag}>
                <span className={styles.ownerTag}>{_l('部门')}</span>
              </span>
            )}
          </div>
          {isUserAdmin && this.renderSelect(isSelected)}
        </div>
      </div>
    );
  }

  renderSelect(isSelected) {
    return (
      <div className={styles.memberCheckbox}>
        {isSelected ? (
          <span className="pAll2 boderRadAll_50 ThemeBGColor3">
            <Icon icon="done" className="Font14 White" />
          </span>
        ) : (
          <span className={styles.memberCheckboxNo} />
        )}
      </div>
    );
  }

  renderContent() {
    const {
      role: { users, roleType },
      isUserAdmin,
      collapse,
      rolesVisibleConfig,
    } = this.props;

    const isInCurrentRole =
      !isUserAdmin && !!_.filter(users, ({ accountId }) => accountId === md.global.Account.accountId).length;

    return (
      <Fragment>
        <div
          className={cx(styles.roleItem, {
            [styles.withBorder]: isInCurrentRole,
          })}
        >
          {this.renderHeader(isInCurrentRole)}
          <CSSTransition
            timeout={{
              enter: 400,
              exit: 400,
            }}
            classNames="roleItemContent"
            in={collapse}
          >
            <div>{this.renderList()}</div>
          </CSSTransition>
          {this.renderDialog()}
        </div>
        {isUserAdmin && rolesVisibleConfig === ROLE_CONFIG.REFUSE && roleType === ROLE_TYPES.ADMIN && (
          <div className={styles.hideRolesDivide}>
            <div className={styles.line} />
            <div className={styles.divideText}>{_l('对非管理员隐藏以下角色')}</div>
            <div className={styles.line} />
          </div>
        )}
      </Fragment>
    );
  }

  render() {
    const { disabled, index } = this.props;

    if (disabled) {
      return <Fragment>{this.renderContent()}</Fragment>;
    } else {
      const Content = SortableElement(() => this.renderContent());
      return <Content index={index} />;
    }
  }
}

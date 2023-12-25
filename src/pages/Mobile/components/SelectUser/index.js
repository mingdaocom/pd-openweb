import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, ScrollView, LoadDiv, Switch } from 'ming-ui';
import { Modal, Button, WingBlank, List, Checkbox, Toast } from 'antd-mobile';
import functionWrap from 'ming-ui/components/FunctionWrap';
import userAjax from 'src/api/user';
import departmentAjax from 'src/api/department';
import externalPortalAjax from 'src/api/externalPortal';
import './index.less';
import _ from 'lodash';

const { CheckboxItem } = Checkbox;

const isChecked = (id, ids) => {
  let result = false;
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] === id) {
      result = true;
      break;
    }
  }
  return result;
};

export default class SelectUser extends Component {
  constructor(props) {
    super(props);
    const { selectedUsers } = props;
    this.state = {
      searchValue: '',
      departmentVisible: false,
      department: null,
      departments: [],
      departmentUsers: [],
      departmentUsersLoading: false,
      departmentPath: [],
      loading: false,
      isMore: true,
      pageIndex: 1,
      pageSize: 50,
      users: [],
      selectedUsers: selectedUsers || [],
      onlyJoinDepartmentChecked: false,
      depPageIndex: 1,
      isMoreDep: true,
      rootData: [],
      treeData: [],
      selectUserDepPath: [],
    };
  }
  componentDidMount() {
    const { type, staticAccounts = [], advancedSetting = {} } = this.props;
    if (type === 'user') {
      if (!_.isEmpty(staticAccounts)) {
        this.setState({ users: staticAccounts });
      } else {
        this.setState(
          {
            users:
              advancedSetting && advancedSetting.shownullitem === '1'
                ? [
                    {
                      avatar:
                        md.global.FileStoreConfig.pictureHost.replace(/\/$/, '') +
                        '/UserAvatar/undefined.gif?imageView2/1/w/100/h/100/q/90',
                      fullname: advancedSetting.nullitemname || _l('为空'),
                      accountId: 'isEmpty',
                    },
                  ]
                : [],
          },
          this.requestContactUserList,
        );
      }
    } else {
      this.setState(
        {
          departmentVisible: true,
        },
        this.requestSearchDepartment,
      );
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.selectedUsers.length !== nextState.selectedUsers.length) {
      const { maxScrollTop } = this.selectedScrollViewEl.nanoScroller.nanoscroller;
      $(this.selectedScrollViewEl.nanoScroller).nanoScroller({ scrollTop: maxScrollTop });
    }
    return true;
  }
  requestContactUserList = () => {
    const { loading, isMore } = this.state;
    const { staticAccounts = [] } = this.props;

    if (!_.isEmpty(staticAccounts)) {
      return;
    }

    if (loading || !isMore) {
      return;
    }

    this.setState({
      loading: true,
    });

    if (this.request && this.request.state() === 'pending') {
      this.request.abort();
    }

    const { pageIndex, pageSize, users, searchValue } = this.state;
    const {
      projectId,
      selectRangeOptions,
      filterAccountIds = [],
      appointedAccountIds = [],
      userType,
      appId,
    } = this.props;

    if (userType === 2) {
      this.request = externalPortalAjax
        .getUsersByApp({
          projectId,
          appId,
          pageIndex,
          pageSize,
          keywords: searchValue ? searchValue : undefined,
        })
        .then(res => {
          let userList = res.map(item => ({ ...item, fullname: item.name }));
          this.setState({
            users: users.concat(userList),
            loading: false,
            pageIndex: pageIndex + 1,
            isMore: userList.length === pageSize,
          });
        });
    } else {
      if (selectRangeOptions) {
        this.request = userAjax.getProjectContactUserListByApp({
          keywords: searchValue,
          projectId,
          pageIndex,
          pageSize,
          ...(_.isObject(selectRangeOptions) ? selectRangeOptions : {}),
        });
      } else {
        this.request = userAjax.getContactUserList({
          keywords: searchValue,
          projectId,
          filterFriend: false,
          includeUndefinedAndMySelf: false,
          pageIndex,
          pageSize,
          dataRange: 2,
          filterProjectId: '',
          includeSystemField: false,
          filterAccountIds,
          appointedAccountIds,
          prefixAccountIds: [],
        });
      }
      this.request.then(result => {
        const { list } = result.users;
        this.setState({
          users: users.concat(list),
          loading: false,
          pageIndex: pageIndex + 1,
          isMore: list.length === pageSize,
        });
      });
    }
  };
  requestContactProjectDepartments = () => {
    const {
      loading,
      depPageIndex,
      pageSize,
      departments,
      isMoreDep,
      onlyJoinDepartmentChecked = false,
      department,
    } = this.state;
    this.setState({
      departmentUsersLoading: true,
    });

    if (this.request && this.request.state() === 'pending') {
      this.request.abort();
    }
    const { projectId } = this.props;
    this.request = departmentAjax.getMembersAndSubs({
      projectId,
      pageIndex: depPageIndex,
      pageSize: 100,
      onlyMyJoin: onlyJoinDepartmentChecked,
      filterAccountIds: [],
      departmentId: department ? department.departmentId : undefined,
    });
    this.request.then(({ subDepts = [], members = [] }) => {
      const temp = subDepts.map(it => ({ departmentId: it.id, departmentName: it.name, isDep: true }));
      this.setState({
        departments: temp,
        loading: false,
        departmentUsers: temp.concat(members),
        departmentUsersLoading: false,
      });
    });
  };
  requestSearchDepartment = () => {
    const { loading, searchValue } = this.state;

    if (loading) {
      return;
    }

    this.setState({
      loading: true,
    });

    const { projectId } = this.props;

    departmentAjax
      .searchDepartment({
        keywords: searchValue,
        projectId,
      })
      .then(result => {
        this.setState({
          loading: false,
          departments: result,
          rootData: result,
        });
      });
  };
  handleSelectSubDepartment = (department, index) => {
    const { departmentId } = department;
    const { projectId, selectDepartmentType, allPath } = this.props;
    const { departmentPath, loading, selectedUsers, rootData = [], treeData = [] } = this.state;
    const copyDepartmentPath =
      index || index === 0 ? departmentPath.slice(0, index + 1) : departmentPath.concat(department);
    if (index || index === 0) {
      this.setState({
        departmentPath: copyDepartmentPath,
        loading: true,
      });
    } else {
      this.setState({
        departmentPath: copyDepartmentPath,
        loading: true,
      });
    }

    departmentAjax
      .getProjectSubDepartmentByDepartmentId({
        projectId,
        departmentId,
      })
      .then(result => {
        this.setState({
          departments: result.map(item => ({
            ...item,
            disabledSubDepartment:
              (selectDepartmentType === 'all' &&
                _.findIndex(selectedUsers, item => item.departmentId === departmentId) > -1) ||
              department.disabledSubDepartment,
            departmentPath: allPath
              ? copyDepartmentPath.map((it, i) => ({
                  departmentId: it.departmentId,
                  departmentName: it.departmentName,
                  depth: i + 1,
                }))
              : [],
          })),
          loading: false,
          treeData: _.isEmpty(treeData)
            ? this.getTreeData(rootData, departmentId, result)
            : this.getTreeData(treeData, departmentId, result),
        });
      });
  };
  getTreeData = (list, departmentId, subDepartments) => {
    return list.map(item => {
      if (item.departmentId === departmentId) {
        return { ...item, subDepartments };
      }
      if (item.subDepartments && item.subDepartments.length) {
        return { ...item, subDepartments: this.getTreeData(item.subDepartments, departmentId, subDepartments) };
      }
      return item;
    });
  };
  getChildren = (data = [], currentId) => {
    let arr = [],
      result = [];
    const func = (data, id) => {
      data.find(item => {
        if (item.subDepartments && item.subDepartments.length) {
          func(item.subDepartments, id);
        }
        if (item.departmentId === id) {
          return (arr = item.subDepartments);
        }
      });
    };
    func(data, currentId);
    const flatTree = data => {
      data.forEach(item => {
        if (item.subDepartments && item.subDepartments.length) {
          flatTree(item.subDepartments);
        }
        delete item.subDepartments;
        result.push(item);
      });
    };
    arr && flatTree(arr);
    return _.isArray(result) && !_.isEmpty(result) ? result.map(item => item.departmentId) : [];
  };
  handleSave = () => {
    const { type } = this.props;
    const { selectedUsers } = this.state;
    if (selectedUsers.length) {
      this.props.onClose();
      this.props.onSave(selectedUsers);
    } else {
      Toast.info(_l('请选择%0', type === 'user' ? _l('人员') : _l('部门')));
    }
  };
  handleSearch = () => {
    const { type } = this.props;
    this.setState(
      {
        users: [],
        pageIndex: 1,
        isMore: true,
      },
      type === 'user' ? this.requestContactUserList : this.requestSearchDepartment,
    );
  };
  renderSearch() {
    const { searchValue } = this.state;
    const { type } = this.props;
    return (
      <div className="searchWrapper">
        <Icon icon="h5_search" />
        <form
          action="#"
          className="flex"
          onSubmit={e => {
            e.preventDefault();
          }}
        >
          <input
            type="text"
            placeholder={type === 'user' ? _l('搜索人员') : _l('搜索部门')}
            className="Font14"
            value={searchValue}
            onChange={e => {
              this.setState({ searchValue: e.target.value });
            }}
            onKeyDown={event => {
              event.which === 13 && this.handleSearch();
            }}
          />
        </form>
        {searchValue ? (
          <Icon
            icon="workflow_cancel"
            onClick={() => {
              this.setState(
                {
                  searchValue: '',
                },
                this.handleSearch,
              );
            }}
          />
        ) : null}
      </div>
    );
  }

  onlyShowJoinDepartment = checked => {
    this.setState(
      { onlyJoinDepartmentChecked: !checked, depPageIndex: 1, departments: [], isMoreDep: true, loading: true },
      () => {
        this.requestContactProjectDepartments();
      },
    );
  };

  renderSelected() {
    const { selectedUsers } = this.state;
    const { type, selectDepartmentType } = this.props;
    const name = type === 'user' ? 'fullname' : 'departmentName';
    const id = type === 'user' ? 'accountId' : 'departmentId';
    return (
      <div className={cx('selectedWrapper', { hide: _.isEmpty(selectedUsers) })}>
        <ScrollView style={{ maxHeight: 92, minHeight: 46 }} ref={el => (this.selectedScrollViewEl = el)}>
          {selectedUsers.map(item => (
            <span className="selectedItem" key={item[id]}>
              <span>{item[name]}</span>
              {selectDepartmentType === 'all' && <Icon icon="workflow" className="Gray_9e mLeft5" />}
              <Icon
                icon="close"
                className="Gray_9e Font15"
                onClick={() => {
                  const { selectedUsers } = this.state;
                  this.setState({
                    selectedUsers: selectedUsers.filter(user => user[id] != item[id]),
                  });
                }}
              />
            </span>
          ))}
        </ScrollView>
      </div>
    );
  }
  renderDepartment() {
    const {
      departmentVisible,
      departments,
      departmentUsers,
      department,
      departmentUsersLoading,
      loading,
      departmentPath,
      onlyJoinDepartmentChecked,
      selectedAllUsers = [],
      selectUserDepPath,
    } = this.state;
    const { type, selectDepartmentType, filterAccountIds = [] } = this.props;

    if (departmentVisible) {
      return (
        <List
          className="departmentWrapper flex flexColumn leftAlign"
          renderHeader={() =>
            type === 'user' ? (
              <div className="Font15">
                <span
                  className="avtive mRight3"
                  onClick={() => {
                    this.setState({
                      departmentVisible: false,
                      department: null,
                      departmentUsers: [],
                      selectUserDepPath: [],
                    });
                  }}
                >
                  {_l('全体人员')}
                </span>
                <span
                  className={cx({ avtive: department })}
                  onClick={() => {
                    if (department) {
                      this.setState(
                        {
                          department: null,
                          departmentUsers: [],
                          selectUserDepPath: [],
                        },
                        this.requestContactProjectDepartments,
                      );
                    }
                  }}
                >
                  <i className="mRight3">></i>
                  {_l('按部门选择')}
                </span>
                {selectUserDepPath.map((department, index) => (
                  <span
                    className="avtive mLeft5"
                    key={department.departmentId}
                    onClick={() => {
                      this.setState(
                        { department: department, selectUserDepPath: selectUserDepPath.slice(0, index + 1) },
                        this.requestContactProjectDepartments,
                      );
                    }}
                  >
                    <i className="mRight3">&gt;</i>
                    {department.departmentName}
                  </span>
                ))}
              </div>
            ) : (
              <Fragment>
                <span
                  className={cx({ avtive: departmentPath.length })}
                  onClick={() => {
                    if (!departmentPath.length) return;
                    this.setState({ departmentPath: [], selectedAllUsers: [...selectedAllUsers, ...departmentPath] });
                    this.requestSearchDepartment();
                  }}
                >
                  {_l('全部部门')}
                </span>
                {departmentPath.map((department, index) => (
                  <span
                    className="avtive mLeft5"
                    key={department.departmentId}
                    onClick={() => {
                      this.handleSelectSubDepartment(department, index);
                    }}
                  >
                    <i className="mRight3">&gt;</i>
                    {department.departmentName}
                  </span>
                ))}
              </Fragment>
            )
          }
        >
          {loading ? (
            <div className="pTop30 pBottom30">
              <LoadDiv size="middle" />
            </div>
          ) : department ? (
            departmentUsersLoading ? (
              <div className="pTop30 pBottom30">
                <LoadDiv size="middle" />
              </div>
            ) : (
              <ScrollView className="flex">
                {departmentUsers.map((item, index) =>
                  item.isDep ? (
                    <List.Item
                      multipleLine
                      arrow="horizontal"
                      thumb={
                        <div className="groupWrapper">
                          <Icon icon="group" className="Font22 White" />
                        </div>
                      }
                      onClick={() => {
                        this.setState(
                          {
                            department: item,
                            selectUserDepPath: this.state.selectUserDepPath.concat(item),
                          },
                          this.requestContactProjectDepartments,
                        );
                      }}
                    >
                      {item.departmentName}
                    </List.Item>
                  ) : (
                    <CheckboxItem
                      key={item.accountId}
                      checked={isChecked(
                        item.accountId,
                        this.state.selectedUsers.map(item => item.accountId),
                      )}
                      onChange={() => {
                        const { selectedUsers } = this.state;
                        const { onlyOne } = this.props;
                        const isSelected = selectedUsers.filter(user => user.accountId === item.accountId).length;
                        if (onlyOne) {
                          this.setState({
                            selectedUsers: isSelected ? [] : [item],
                          });
                          return;
                        }
                        if (isSelected) {
                          this.setState({
                            selectedUsers: selectedUsers.filter(user => user.accountId != item.accountId),
                          });
                        } else {
                          this.setState({
                            selectedUsers: selectedUsers.concat(item),
                          });
                        }
                      }}
                    >
                      <Fragment>
                        <img src={item.avatar} className="avatar" />
                        {item.fullname}
                      </Fragment>
                    </CheckboxItem>
                  ),
                )}
                {_.isEmpty(departmentUsers) ? <div className="pTop30 pBottom30 TxtCenter">{_l('暂无人员')}</div> : null}
              </ScrollView>
            )
          ) : (
            <ScrollView className="flex">
              <div className="flexRow onlyShowJoinDepartment">
                <span>{_l('只看我加入的部门')}</span>
                <Switch checked={onlyJoinDepartmentChecked} onClick={this.onlyShowJoinDepartment} />
              </div>
              {departments.map((item, index) => (
                <Fragment key={item.departmentId}>
                  {type === 'department' ? (
                    <List.Item
                      multipleLine
                      className="departmentItem"
                      arrow={item.haveSubDepartment ? 'horizontal' : ''}
                      thumb={
                        <div
                          className="flexRow valignWrapper"
                          onClick={event => {
                            const { selectedUsers } = this.state;
                            const { onlyOne } = this.props;
                            if (item.disabledSubDepartment) return;
                            const isSelected = selectedUsers.filter(
                              department => department.departmentId === item.departmentId,
                            ).length;
                            let children = this.getChildren(this.state.treeData, item.departmentId);
                            let temp = selectedUsers.filter(it =>
                              selectDepartmentType === 'current' ? !_.includes(children, it.departmentId) : true,
                            );
                            if (onlyOne) {
                              this.setState({
                                selectedUsers: isSelected ? [] : [item],
                                selectedAllUsers: isSelected ? [] : [item],
                              });
                              return;
                            }
                            if (isSelected) {
                              this.setState({
                                selectedUsers: temp.filter(department => department.departmentId != item.departmentId),
                                selectedAllUsers: temp.filter(
                                  department => department.departmentId != item.departmentId,
                                ),
                              });
                            } else {
                              this.setState({
                                selectedUsers: temp.concat(item),
                                selectedAllUsers: temp.concat(item),
                              });
                            }
                          }}
                        >
                          <Checkbox
                            checked={
                              item.disabledSubDepartment
                                ? true
                                : isChecked(
                                    item.departmentId,
                                    this.state.selectedUsers.map(item => item.departmentId),
                                  )
                            }
                            disabled={item.disabledSubDepartment}
                          />
                          <div className="groupWrapper">
                            <Icon icon="group" className="Font22 White" />
                          </div>
                        </div>
                      }
                      onClick={event => {
                        const { selectedUsers } = this.state;
                        if (
                          item.haveSubDepartment &&
                          (event.target.classList.contains('am-list-content') ||
                            event.target.classList.contains('am-list-arrow'))
                        ) {
                          this.handleSelectSubDepartment(item);
                        }
                      }}
                    >
                      {item.departmentName}
                    </List.Item>
                  ) : (
                    <List.Item
                      multipleLine
                      arrow="horizontal"
                      thumb={
                        <div className="groupWrapper">
                          <Icon icon="group" className="Font22 White" />
                        </div>
                      }
                      onClick={() => {
                        this.setState(
                          {
                            department: item,
                            selectUserDepPath: this.state.selectUserDepPath.concat(item),
                          },
                          this.requestContactProjectDepartments,
                        );
                      }}
                    >
                      {item.departmentName}
                    </List.Item>
                  )}
                </Fragment>
              ))}
              {_.isEmpty(departments) ? <div className="pTop30 pBottom30 TxtCenter">{_l('暂无部门')}</div> : null}
            </ScrollView>
          )}
        </List>
      );
    }
    let currentAccount = md.global.Account || {};
    return (
      <Fragment>
        <List>
          <List.Item
            arrow="horizontal"
            onClick={() => {
              this.requestContactProjectDepartments();
              this.setState({ departmentVisible: true });
            }}
          >
            <div className="Font15 Gray mTop5 mBottom5">
              <Icon icon="department" className="TxtMiddle Font18 Gray_9e mRight15" /> {_l('按部门选择')}
            </div>
          </List.Item>
        </List>
        {!filterAccountIds.includes(currentAccount.accountId) && (
          <div
            className="currentAccount mTop10"
            onClick={() => {
              this.selectedAccount(currentAccount);
            }}
          >
            <img src={currentAccount.avatar} className="avatar mRight10" />
            <span>{_l('我自己')}</span>
          </div>
        )}
      </Fragment>
    );
  }
  selectedAccount = item => {
    const { selectedUsers } = this.state;
    const { onlyOne } = this.props;
    const isSelected = selectedUsers.filter(user => user.accountId === item.accountId).length;
    if (onlyOne) {
      this.setState({
        selectedUsers: isSelected ? [] : [item],
      });
      return;
    }
    if (isSelected) {
      this.setState({
        selectedUsers: selectedUsers.filter(user => user.accountId != item.accountId),
      });
    } else {
      this.setState({
        selectedUsers: selectedUsers.concat(item),
      });
    }
  };
  renderUsers() {
    const { selectRangeOptions, userType, staticAccounts = [] } = this.props;
    const { users, loading, pageIndex } = this.state;
    const isStatic = !_.isEmpty(staticAccounts);
    return (
      <div className="flex">
        <ScrollView onScrollEnd={this.requestContactUserList}>
          {!isStatic && !selectRangeOptions && (userType === 1 || userType === 3) && this.renderDepartment()}
          <List className="leftAlign" renderHeader={isStatic ? null : () => 'A-Z'}>
            {loading && pageIndex === 1 ? (
              <div className="pTop30 pBottom30">
                <LoadDiv size="middle" />
              </div>
            ) : (
              <Fragment>
                {users.map(item => {
                  let { departmentName } = _.get(item, 'departmentInfo') || {};
                  let { job } = item;
                  return (
                    <CheckboxItem
                      key={item.accountId}
                      checked={isChecked(
                        item.accountId,
                        this.state.selectedUsers.map(item => item.accountId),
                      )}
                      onChange={() => this.selectedAccount(item)}
                    >
                      <div className="flexRow w100 alignItemsCenter">
                        <div className="userInfo">
                          <img src={item.avatar} className="avatar" />
                          {item.fullname}
                        </div>
                        <span className="Gray_9e mLeft16 Font12 flex ellipsis">
                          {departmentName && job ? `${departmentName} / ${job}` : departmentName || job}
                        </span>
                      </div>
                    </CheckboxItem>
                  );
                })}
                {loading ? (
                  <div className="pTop10 pBottom10">
                    <LoadDiv size="middle" />
                  </div>
                ) : null}
                {_.isEmpty(users) ? <div className="pTop30 pBottom30 TxtCenter">{_l('暂无人员')}</div> : null}
              </Fragment>
            )}
          </List>
        </ScrollView>
      </div>
    );
  }
  renderContent() {
    const { departmentVisible } = this.state;
    const { userType = 1, type } = this.props;
    return (
      <div className="flex flexColumn">
        {((type === 'user' && !departmentVisible) || type === 'department') && this.renderSearch()}
        {this.renderSelected()}
        {departmentVisible && (userType === 1 || userType === 3) ? this.renderDepartment() : null}
        {!departmentVisible ? this.renderUsers() : null}
      </div>
    );
  }
  render() {
    const { visible, onClose } = this.props;
    return (
      <Modal popup visible={visible} onClose={onClose} animationType="slide-up" className="h100">
        <div className="selectUserModal flexColumn h100">
          {this.renderContent()}
          <div className="btnsWrapper flexRow">
            <WingBlank className="flex" size="sm">
              <Button className="Gray_75 bold Font14" onClick={onClose}>
                {_l('取消')}
              </Button>
            </WingBlank>
            <WingBlank className="flex" size="sm">
              <Button className="bold Font14" onClick={this.handleSave} type="primary">
                {_l('确定')}
              </Button>
            </WingBlank>
          </div>
        </div>
      </Modal>
    );
  }
}
export const selectUser = props => functionWrap(SelectUser, { ...props });

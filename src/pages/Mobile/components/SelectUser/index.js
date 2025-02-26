import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, ScrollView, LoadDiv, Switch, PopupWrapper } from 'ming-ui';
import { List } from 'antd-mobile';
import functionWrap from 'ming-ui/components/FunctionWrap';
import userAjax from 'src/api/user';
import departmentAjax from 'src/api/department';
import externalPortalAjax from 'src/api/externalPortal';
import { getAccounts } from 'src/ming-ui/functions/quickSelectUser/util';
import UserOrDepartmentItem from './components/UserOrDepartmentItem';
import './index.less';
import _ from 'lodash';

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
      // 最常协作
      oftenUsers: [],
      isOftenUsersShow: true,
      isPartnerShow: true,
    };
  }
  componentDidMount() {
    const { type, staticAccounts = [], advancedSetting = {}, userType } = this.props;
    if (type === 'user') {
      if (!_.isEmpty(staticAccounts) && advancedSetting.navshow === '2' && userType !== 2) {
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
    const { loading, isMore, users, searchValue, selectedUsers, portalUserVisible } = this.state;
    const {
      staticAccounts = [],
      userType,
      advancedSetting = {},
      includeUndefinedAndMySelf,
      prefixAccounts = [],
      prefixAccountIds = [],
    } = this.props;
    const { navshow } = advancedSetting;

    if (!_.isEmpty(staticAccounts) && navshow === '2' && userType !== 2) {
      this.setState({ users: staticAccounts.filter(u => u.fullname.includes(_.trim(searchValue))) });
      return;
    }

    if (loading || !isMore) {
      return;
    }

    this.setState({
      loading: true,
    });

    if (this.request && _.isFunction(this.request.abort)) {
      this.request.abort();
    }

    const { pageIndex, pageSize } = this.state;
    const { projectId, selectRangeOptions, filterAccountIds = [], appointedAccountIds = [], appId } = this.props;

    if (userType === 2 || portalUserVisible) {
      this.request = externalPortalAjax.getUsersByApp({
        projectId,
        appId,
        pageIndex,
        pageSize,
        keywords: searchValue ? searchValue : undefined,
      });
      this.request.then(res => {
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
          filterAccountIds,
          keywords: _.trim(searchValue),
          projectId,
          pageIndex,
          pageSize,
          ...(_.isObject(selectRangeOptions) ? selectRangeOptions : {}),
        });
      } else {
        this.request = userAjax.getContactUserList({
          keywords: _.trim(searchValue),
          projectId,
          filterFriend: false,
          includeUndefinedAndMySelf,
          pageIndex,
          pageSize,
          dataRange: 2,
          filterProjectId: '',
          includeSystemField: false,
          filterAccountIds,
          appointedAccountIds,
          prefixAccountIds,
        });
      }
      this.request.then(result => {
        const { list } = result.users;
        let oftenUsers = _.get(result, 'oftenUsers.list') || this.state.oftenUsers;
        let prefixUsers = prefixAccounts;

        if (includeUndefinedAndMySelf && !searchValue) {
          const result = getAccounts({
            list: _.cloneDeep(oftenUsers),
            includeUndefinedAndMySelf,
            includeSystemField: false,
            filterAccountIds: filterAccountIds.concat(selectedUsers.map(v => v.accountId)).filter(_.identity),
            prefixAccountIds,
            prefixAccounts,
          });
          prefixUsers = result.prefixUsers;
          const prefixUsersIds = prefixUsers.map(v => v.accountId);
          oftenUsers = oftenUsers.filter(v => !_.includes(prefixUsersIds, v.accountId));
        }

        this.setState({
          users: users.concat(list),
          loading: false,
          pageIndex: pageIndex + 1,
          isMore: list.length === pageSize,
          prefixUsers: includeUndefinedAndMySelf && !searchValue ? prefixUsers : this.state.prefixUsers,
          oftenUsers,
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
      searchValue,
    } = this.state;
    const { projectId, departrangetype = '0', filterAccountIds } = this.props;

    if (!onlyJoinDepartmentChecked && departrangetype !== '0') {
      this.requestSearchDepartment(true);
      return;
    }

    this.setState({
      departmentUsersLoading: true,
    });

    if (this.request && _.isFunction(this.request.abort)) {
      this.request.abort();
    }

    this.request = departmentAjax.getMembersAndSubs({
      projectId,
      pageIndex: depPageIndex,
      pageSize: 100,
      onlyMyJoin: onlyJoinDepartmentChecked,
      filterAccountIds: filterAccountIds || [],
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
  requestSearchDepartment = (ignoreLoading = false) => {
    const { loading, searchValue } = this.state;
    const { departrangetype = '0', appointedDepartmentIds = [], appointedUserIds = [] } = this.props;

    if (loading && !ignoreLoading) {
      return;
    }

    this.setState({
      loading: true,
    });

    const { projectId } = this.props;

    let param = {
      keywords: _.trim(searchValue),
      projectId,
    };

    if (departrangetype !== '0') {
      param.appointedDepartmentIds = appointedDepartmentIds;
      param.rangeTypeId = [10, 20, 30][departrangetype - 1];
      param.appointedUserIds = appointedUserIds;
    }

    departmentAjax[departrangetype !== '0' ? 'appointedDepartment' : 'searchDepartment'](param).then(result => {
      let list =
        departrangetype === '3'
          ? result.map(l => ({ ...l, disabled: appointedDepartmentIds.includes(l.departmentId) }))
          : result;

      const handleSearch = (data, result = []) => {
        data.forEach(item => {
          if (item.departmentName.includes(_.trim(searchValue))) {
            result.push(item);
          } else if (item.subDepartments) {
            handleSearch(item.subDepartments, result);
          }
        });

        return result;
      };

      list = _.trim(searchValue) ? handleSearch(list, []) : list;

      this.setState({
        loading: false,
        departments: list,
        rootData: list,
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
    let arr = [];
    let result = [];
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
      const selectData = selectedUsers.map(item => ({
        ...item,
        departmentPath:
          item.departmentPath && _.isArray(item.departmentPath)
            ? item.departmentPath.reverse().map((v, index) => ({ ...v, depth: index + 1 }))
            : undefined,
      }));
      this.props.onClose();
      this.props.onSave(selectData);
    } else {
      alert(type === 'user' ? _l('请选择人员') : _l('请选择部门'), 3);
    }
  };
  handleSearch = () => {
    const { type } = this.props;
    if (type === 'department') {
      this.setState({
        onlyJoinDepartmentChecked: false,
        departmentPath: [],
      });
    }
    this.setState(
      {
        users: [],
        pageIndex: 1,
        isMore: true,
      },
      type === 'user' ? this.requestContactUserList : this.requestSearchDepartment,
    );
  };

  realTimeSearch = _.debounce(() => this.handleSearch(), 500);

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
            type="search"
            placeholder={type === 'user' ? _l('搜索人员') : _l('搜索部门')}
            className="Font14"
            value={searchValue}
            onChange={e => {
              this.setState({ searchValue: e.target.value }, this.realTimeSearch);
            }}
          />
        </form>
        {searchValue ? (
          <Icon
            icon="workflow_cancel"
            onMouseDown={event => event.preventDefault()}
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
      {
        onlyJoinDepartmentChecked: !checked,
        depPageIndex: 1,
        departments: [],
        isMoreDep: true,
        loading: true,
        departmentPath: [],
      },
      () => {
        const { type } = this.props;
        if (type === 'department' && checked) this.requestSearchDepartment(true);
        else this.requestContactProjectDepartments();
      },
    );
  };

  // 选择人员-点击 人员行
  selectedAccount = item => {
    const { selectedUsers } = this.state;
    const { onlyOne } = this.props;
    const isSelected = selectedUsers.filter(user => user.accountId === item.accountId).length;
    if (onlyOne) {
      this.setState(
        {
          selectedUsers: isSelected ? [] : [item],
        },
        this.handleSave,
      );
      return;
    }
    if (isSelected) {
      this.setState({
        selectedUsers: selectedUsers.filter(user => user.accountId !== item.accountId),
      });
    } else {
      this.setState({
        selectedUsers: selectedUsers.concat(item),
      });
    }
  };

  // 选择部门-点击 部门行
  selectedDepartment = item => {
    const { selectedUsers } = this.state;
    const { selectDepartmentType } = this.props;
    const { onlyOne } = this.props;
    if (item.disabledSubDepartment || item.disabled) return;
    const isSelected = selectedUsers.filter(department => department.departmentId === item.departmentId).length;
    let children = this.getChildren(this.state.treeData, item.departmentId);
    let temp = selectedUsers.filter(it =>
      selectDepartmentType === 'current' ? !_.includes(children, it.departmentId) : true,
    );
    if (onlyOne) {
      this.setState(
        {
          selectedUsers: isSelected ? [] : [item],
          selectedAllUsers: isSelected ? [] : [item],
        },
        this.handleSave,
      );
      return;
    } else if (isSelected) {
      this.setState({
        selectedUsers: temp.filter(department => department.departmentId !== item.departmentId),
        selectedAllUsers: temp.filter(department => department.departmentId !== item.departmentId),
      });
    } else {
      this.setState({
        selectedUsers: temp.concat(item),
        selectedAllUsers: temp.concat(item),
      });
    }
  };

  // 已选择项
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
              <span className="ellipsis curSelected">{item[name]}</span>
              {selectDepartmentType === 'all' && <Icon icon="workflow" className="Gray_9e mLeft5" />}
              <Icon
                icon="close"
                className="Gray_9e Font15"
                onClick={() => {
                  const { selectedUsers } = this.state;
                  this.setState({
                    selectedUsers: selectedUsers.filter(user => user[id] !== item[id]),
                  });
                }}
              />
            </span>
          ))}
        </ScrollView>
      </div>
    );
  }

  // 人员选择行
  renderSelectUserItem(item, key) {
    const { onlyOne, filterAccountIds = [] } = this.props;
    const { selectedUsers } = this.state;

    return (
      <UserOrDepartmentItem
        renderKey={`${key}_${item.accountId}`}
        renderItemType="user"
        item={item}
        onlyOne={onlyOne}
        filterAccountIds={filterAccountIds}
        selectedUsers={selectedUsers}
        selectedAccount={this.selectedAccount}
      />
    );
  }

  // 人员-部门-选择行
  renderSelectUserWithDepartmentItem(item) {
    const { onlyOne, filterAccountIds = [] } = this.props;
    const { selectedUsers } = this.state;

    return (
      <UserOrDepartmentItem
        renderKey={item.departmentId}
        item={item}
        onlyOne={onlyOne}
        filterAccountIds={filterAccountIds}
        selectedUsers={selectedUsers}
        selectedDepartment={() => {
          this.setState(
            {
              department: item,
              selectUserDepPath: this.state.selectUserDepPath.concat(item),
            },
            this.requestContactProjectDepartments,
          );
        }}
      />
    );
  }

  // 部门选择行
  renderSelectDepartmentItem(item) {
    const { onlyOne } = this.props;
    const { selectedUsers } = this.state;

    return (
      <UserOrDepartmentItem
        renderKey={item.departmentId}
        renderItemType="department"
        item={item}
        onlyOne={onlyOne}
        selectedUsers={selectedUsers}
        selectedDepartment={this.selectedDepartment}
        handleSelectSubDepartment={this.handleSelectSubDepartment}
      />
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
      oftenUsers,
      prefixUsers = [],
    } = this.state;
    const { type, filterAccountIds = [], includeUndefinedAndMySelf, userType } = this.props;

    if (departmentVisible) {
      return (
        <List
          className="departmentWrapper flex flexColumn leftAlign"
          header={
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
                  <i className="mRight3">{'>'}</i>
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
                {departmentUsers.map(item =>
                  item.isDep ? this.renderSelectUserWithDepartmentItem(item) : this.renderSelectUserItem(item),
                )}
                {_.isEmpty(departmentUsers) ? (
                  <div className="pTop30 pBottom30 TxtCenter Gray_9e Font15">{_l('暂无人员')}</div>
                ) : null}
              </ScrollView>
            )
          ) : (
            <ScrollView className="flex">
              <div className="flexRow onlyShowJoinDepartment" onMouseDown={e => e.preventDefault()}>
                <span className="onlySelf">{_l('只看我加入的部门')}</span>
                <Switch checked={onlyJoinDepartmentChecked} onClick={this.onlyShowJoinDepartment} />
              </div>
              {departments.map(item => (
                <Fragment key={item.departmentId}>
                  {type === 'department'
                    ? this.renderSelectDepartmentItem(item)
                    : this.renderSelectUserWithDepartmentItem(item)}
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
        <div className="conditionSelectBox">
          <List>
            <List.Item
              key="departmentSelect"
              prefix={<Icon icon="department" className="selectIconBox TxtMiddle Font18 White" />}
              arrowIcon={<Icon icon="arrow-right-border" className="Font18 Gray_75" />}
              onClick={() => {
                this.requestContactProjectDepartments();
                this.setState({ departmentVisible: true });
              }}
            >
              <div className="conditionSelectInfo">{_l('按部门选择')}</div>
            </List.Item>
            {userType === 3 && (
              <List.Item
                key="portalSelect"
                prefix={<Icon icon="supervisor_account" className="portalIconBox TxtMiddle Font18 White" />}
                arrowIcon={<Icon icon="arrow-right-border" className="Font20 Gray_75" />}
                onClick={() => {
                  this.setState({ portalUserVisible: true, pageIndex: 1, users: [] }, this.requestContactUserList);
                }}
              >
                <div className="conditionSelectInfo">{_l('外部门户')}</div>
              </List.Item>
            )}
            {includeUndefinedAndMySelf
              ? prefixUsers.map(item => {
                  return this.renderSelectUserItem(item, 'prefix');
                })
              : !filterAccountIds.includes(currentAccount.accountId) && (
                  <List.Item
                    key="mySelfSelect"
                    prefix={<img src={currentAccount.avatar} className="avatar" />}
                    arrowIcon={false}
                    onClick={() => this.selectedAccount(currentAccount)}
                  >
                    <div className="conditionSelectInfo">{_l('我自己')}</div>
                  </List.Item>
                )}
          </List>
        </div>
      </Fragment>
    );
  }

  // 渲染人员列表
  renderUsers() {
    const { selectRangeOptions, userType, staticAccounts = [], recordPartner = [] } = this.props;
    const { users, loading, pageIndex, oftenUsers, isOftenUsersShow, isPartnerShow, searchValue } = this.state;
    const isStatic =
      !_.isEmpty(staticAccounts) &&
      !(staticAccounts.length === 1 && _.get(staticAccounts, '0.accountId') === 'isEmpty');

    return (
      <div className="flex">
        <ScrollView onScrollEnd={this.requestContactUserList}>
          {!isStatic && !selectRangeOptions && (userType === 1 || userType === 3) && this.renderDepartment()}
          {/* 参与者 */}
          {!_.trim(searchValue) && !!recordPartner.length && (
            <Fragment>
              <div
                className="sortTitle oftenUserHeader"
                onClick={() => {
                  this.setState({ isPartnerShow: !isPartnerShow });
                }}
              >
                <span>{_l('参与者')}</span>
                <Icon icon="arrow-down-border" className={`Font18 Gray_75 ${isPartnerShow ? 'rotatable' : ''}`} />
              </div>
              {isPartnerShow && <div>{recordPartner.map(item => this.renderSelectUserItem(item, 'partner'))}</div>}
            </Fragment>
          )}
          {/* 最常协作 */}
          {!_.trim(searchValue) && oftenUsers && oftenUsers.length > 0 && (
            <Fragment>
              <div
                className="sortTitle oftenUserHeader"
                onClick={() => {
                  this.setState({ isOftenUsersShow: !isOftenUsersShow });
                }}
              >
                <span>{_l('最常协作')}</span>
                <Icon icon="arrow-down-border" className={`Font18 Gray_75 ${isOftenUsersShow ? 'rotatable' : ''}`} />
              </div>
              {isOftenUsersShow && <div>{oftenUsers.map(item => this.renderSelectUserItem(item, 'often'))}</div>}
            </Fragment>
          )}
          {isStatic || selectRangeOptions || userType === 2 ? null : <div className="sortTitle">A-Z</div>}
          <div>
            {loading && pageIndex === 1 ? (
              <div className="pTop30 pBottom30">
                <LoadDiv size="middle" />
              </div>
            ) : (
              <Fragment>
                {users.map(item => this.renderSelectUserItem(item, 'common'))}
                {loading ? (
                  <div className="pTop10 pBottom10">
                    <LoadDiv size="middle" />
                  </div>
                ) : null}
                {_.isEmpty(users) ? (
                  <div className="pTop30 pBottom30 TxtCenter Gray_9e Font15">{_l('暂无人员')}</div>
                ) : null}
              </Fragment>
            )}
          </div>
        </ScrollView>
      </div>
    );
  }

  renderPortalUsers = () => {
    const { loading, pageIndex, users = [] } = this.state;
    const {} = this.props;

    return (
      <List
        className="departmentWrapper flex flexColumn leftAlign"
        header={
          <div className="Font15">
            <span
              className="avtive mRight3"
              onClick={() =>
                this.setState({ portalUserVisible: false, pageIndex: 1, users: [] }, this.requestContactUserList)
              }
            >
              {_l('全体人员')}
            </span>
            <span>
              <i className="mRight3">{'>'}</i>
              {_l('按外部门户选择')}
            </span>
          </div>
        }
      >
        <ScrollView onScrollEnd={this.requestContactUserList}>
          <List>
            {loading && pageIndex === 1 ? (
              <div className="pTop30 pBottom30">
                <LoadDiv size="middle" />
              </div>
            ) : (
              <Fragment>
                {users.map(item => this.renderSelectUserItem(item, 'common'))}
                {loading ? (
                  <div className="pTop10 pBottom10">
                    <LoadDiv size="middle" />
                  </div>
                ) : null}
                {_.isEmpty(users) ? (
                  <div className="pTop30 pBottom30 TxtCenter Gray_9e Font15">{_l('暂无人员')}</div>
                ) : null}
              </Fragment>
            )}
          </List>
        </ScrollView>
      </List>
    );
  };

  renderContent() {
    const { departmentVisible, portalUserVisible } = this.state;
    const { userType = 1, type } = this.props;
    return (
      <div className="flex flexColumn">
        {((type === 'user' && !departmentVisible && !portalUserVisible) || type === 'department') &&
          this.renderSearch()}
        {this.renderSelected()}
        {portalUserVisible ? (
          this.renderPortalUsers()
        ) : (
          <Fragment>
            {departmentVisible && (userType === 1 || userType === 3) ? this.renderDepartment() : null}
            {!departmentVisible ? this.renderUsers() : null}
          </Fragment>
        )}
      </div>
    );
  }
  render() {
    const { selectedUsers } = this.state;
    const { type, visible, onClose, onlyOne } = this.props;
    return (
      <PopupWrapper
        bodyClassName="heightPopupBody40"
        visible={visible}
        title={type === 'user' ? _l('人员选择') : _l('部门选择')}
        confirmDisable={!selectedUsers.length}
        onClose={onClose}
        onConfirm={onlyOne ? null : this.handleSave}
      >
        <div className="selectUserContentBox flexColumn">{this.renderContent()}</div>
      </PopupWrapper>
    );
  }
}

export const selectUser = props => functionWrap(SelectUser, { ...props });

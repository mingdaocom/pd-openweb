import React, { Component, Fragment } from 'react';
import User from './User';
import cx from 'classnames';
import NoData from './NoData';
import { Icon, Checkbox, ScrollView } from 'ming-ui';
import styled from 'styled-components';
import departmentController from 'src/api/department';

const DepartmentTreeWrapper = styled.div`
  overflow: auto;
  .subs {
    margin-left: 10px;
  }
`;

const UsersWrapper = styled.div`
  .justifyCenter {
    justify-content: center;
  }
  .GSelect-User {
    padding-left: 15px !important;
  }
`;

const Department = styled.div`
  width: 100%;
  padding: 4px;
  border-radius: 3px;
  &:hover {
    background-color: #f5f5f5;
  }
  &.active {
    background-color: #d6ecfe;
    .icon,
    div {
      color: #2196f3 !important;
    }
    .icon:hover {
      background-color: #f5f5f5 !important;
    }
  }
  .iconArrow {
    display: flex;
    padding: 7px 0px 5px 2px;
    border-radius: 4px;
    &:hover {
      background-color: #eaeaea;
    }
  }
`;

// import './css/user.less';

export default class DepartmentTree extends Component {
  constructor(props) {
    super(props);
    const project = _.find(md.global.Account.projects, { projectId: props.projectId });
    this.state = {
      groupId: null,
      selects: [project.projectId],
      groupList: [],
      loading: false,
      pageIndex: 1,
      isMore: true,
      pagedDepartmentIndex: 1,
      pagedDepartmentSize: 100,
      isMoreDepartment: true,
      department: props.data || [],
      departmentLoading: false,
      onlyJoinDepartmentChecked: localStorage.getItem('isCheckedOnlyMyJoin')
        ? JSON.parse(localStorage.getItem('isCheckedOnlyMyJoin'))
        : false,
    };
  }
  componentDidMount() {
    if (this.props.defaultCheckedDepId) {
      this.handleSelectGroup(this.props.defaultCheckedDepId);
    }
  }
  getChecked(user) {
    return !!this.props.selectedUsers.filter(item => item.accountId === user.accountId).length;
  }
  handleScrollEnd = () => {
    const { groupId, loading, isMore } = this.state;
    const { projectId } = this.props;
    if (!loading && isMore) {
      if (projectId === groupId) {
        this.handleLoadAll(groupId);
      } else {
        this.handleSelectGroup(groupId);
      }
    }
  };
  getNextPageDepartmentTrees = id => {
    const { pagedDepartmentIndex, pagedDepartmentSize } = this.state;
    const { projectId, isNetwork } = this.props;
    this.setState({ departmentLoading: true });
    departmentController[isNetwork ? 'pagedProjectDepartmentTrees' : 'pagedDepartmentTrees']({
      projectId,
      pageIndex: pagedDepartmentIndex + 1,
      pageSize: pagedDepartmentSize,
      parentId: id,
    }).then(res => {
      let temp =
        (_.isArray(res) &&
          res.map(item => ({ ...item, name: item.departmentName, id: item.departmentId, subs: [] }))) ||
        [];
      const department = this.state.department.concat(temp);
      this.setState({
        isMoreDepartment: department.length % pagedDepartmentSize <= 0,
        departmentLoading: false,
        pagedDepartmentIndex: pagedDepartmentIndex + 1,
        department,
      });
    });
  };
  handleLoadAll = id => {
    const { pageIndex } = this.state;
    const { projectId } = this.props;
    this.setState({ groupId: id, loading: true });
    departmentController
      .getNotInDepartmentUsers({
        projectId,
        pageIndex,
        pageSize: 20,
      })
      .then(({ listUser }) => {
        const groupList = this.state.groupList.concat(listUser.list);
        this.setState({
          isMore: groupList.length !== listUser.allCount,
          loading: false,
          pageIndex: pageIndex + 1,
          groupList,
        });
      });
  };
  handleSelectGroup = id => {
    const { pageIndex } = this.state;
    const { userSettings, projectId } = this.props;
    this.setState({ groupId: id, loading: true });
    departmentController
      .getDepartmentUsers({
        filterAccountIds: userSettings.filterAccountIds,
        departmentId: id,
        projectId,
        pageIndex,
        pageSize: 20,
      })
      .then(data => {
        const groupList = this.state.groupList.concat(data.list);
        this.setState({
          isMore: groupList.length !== data.allCount,
          loading: false,
          pageIndex: pageIndex + 1,
          groupList,
        });
      });
  };

  updateTreeData = (list, key, subs) => {
    return list.map(node => {
      if (node.id === key) {
        return { ...node, subs };
      }
      if (node.subs) {
        return { ...node, subs: this.updateTreeData(node.subs, key, subs) };
      }
      return node;
    });
  };
  expandNext = id => {
    const { projectId, isNetwork } = this.props;
    let { department } = this.state;
    this.setState({ departmentLoading: true });
    departmentController[isNetwork ? 'pagedProjectDepartmentTrees' : 'pagedDepartmentTrees']({
      projectId,
      pageIndex: 1,
      pageSize: 100,
      parentId: id,
    }).then(res => {
      let data = res.map(item => ({ ...item, name: item.departmentName, id: item.departmentId, subs: [] }));
      this.setState({ department: this.updateTreeData(department, id, data), departmentLoading: false });
    });
  };

  renderDepartment(item) {
    const { projectId } = this.props;
    const { selects, groupId } = this.state;
    const subVisible = selects.includes(item.id);
    return (
      <Fragment key={item.id}>
        <Department
          className={cx('flexRow valignWrapper pointer', { active: groupId === item.id })}
          onClick={() => {
            this.setState(
              {
                groupList: [],
                pageIndex: 1,
                isMore: true,
              },
              () => {
                if (projectId === item.id) {
                  this.handleLoadAll(item.id);
                } else {
                  this.handleSelectGroup(item.id);
                }
              },
            );
          }}
        >
          <Icon
            icon={subVisible ? 'arrow-down' : 'arrow-right-tip'}
            className={cx('Gray_75 iconArrow', { Visibility: !item.haveSubDepartment })}
            onClick={event => {
              event.stopPropagation();
              this.expandNext(item.id);
              const { selects } = this.state;
              if (selects.includes(item.id)) {
                this.setState({
                  selects: selects.filter(id => id !== item.id),
                });
              } else {
                this.setState({
                  selects: selects.concat(item.id),
                });
              }
            }}
          />
          <Icon className="Gray_9e Font16 mLeft2 mRight5" icon="folder" />
          <div className="ellipsis Font13">{item.name}</div>
        </Department>
        {subVisible && <div className="subs">{item.subs.map(item => this.renderDepartment(item))}</div>}
      </Fragment>
    );
  }
  onlyShowJoinDepartment = checked => {
    this.setState({ onlyJoinDepartmentChecked: !checked });
    safeLocalStorageSetItem('isCheckedOnlyMyJoin', !checked);
    this.props.userAction();
  };
  renderDepartmentTree() {
    const { department = [], departmentLoading, onlyJoinDepartmentChecked } = this.state;
    return (
      <DepartmentTreeWrapper className="flexColumn flex">
        <Checkbox
          className="mBottom10 pLeft7 mTop10"
          checked={onlyJoinDepartmentChecked}
          onClick={this.onlyShowJoinDepartment}
        >
          {_l('只看我加入的部门')}
        </Checkbox>
        <div className="flex">
          {!departmentLoading && _.isEmpty(department) ? (
            <NoData>{_l('无结果')}</NoData>
          ) : (
            <ScrollView
              className="flex asdsad"
              onScrollEnd={() => {
                const { isMoreDepartment } = this.state;
                if (!departmentLoading && isMoreDepartment && department.length >= this.state.pagedDepartmentSize) {
                  this.getNextPageDepartmentTrees();
                }
              }}
            >
              {department.map(item => {
                return this.renderDepartment(item);
              })}
              {departmentLoading && (
                <div className="justifyCenter flexRow valignWrapper" dangerouslySetInnerHTML={{ __html: LoadDiv() }} />
              )}
            </ScrollView>
          )}
        </div>
      </DepartmentTreeWrapper>
    );
  }
  renderUsers() {
    const { pageIndex } = this.props;
    const { groupId, loading, groupList } = this.state;
    if (loading && !groupList.length) {
      return (
        <div className="justifyCenter flexRow valignWrapper h100" dangerouslySetInnerHTML={{ __html: LoadDiv() }} />
      );
    } else {
      const ids = this.props.selectedUsers.map(item => item.accountId);
      const res = groupList.filter(item => ids.includes(item.accountId));
      return (
        <ScrollView className="flex" onScrollEnd={this.handleScrollEnd}>
          {groupList.length ? (
            <Fragment>
              <div className="flexRow valignWrapper pLeft15 pBottom5">
                <Checkbox
                  checked={res.length === groupList.length}
                  disabled={this.props.unique}
                  onClick={() => {
                    const isAll = res.length !== groupList.length;
                    if (isAll) {
                      const ids = this.props.selectedUsers.map(item => item.accountId);
                      const res = groupList
                        .filter(item => !ids.includes(item.accountId))
                        .map(item => {
                          return {
                            data: item,
                            type: 'user',
                          };
                        });
                      this.props.addSelectedData(res);
                    } else {
                      const ids = this.props.selectedUsers.map(item => item.accountId);
                      this.props.removeSelectedData(
                        groupList.filter(item => ids.includes(item.accountId)).map(item => item.accountId),
                      );
                    }
                  }}
                />
                <div className="Gray_75">
                  {res.length ? _l('已选 %0/%1', res.length, groupList.length) : _l('全选')}
                </div>
              </div>
              {groupList.map(item => (
                <User
                  key={item.accountId}
                  user={item}
                  projectId={this.props.projectId}
                  checked={this.getChecked(item)}
                  onChange={this.props.onChange}
                />
              ))}
              {loading && (
                <div className="justifyCenter flexRow valignWrapper" dangerouslySetInnerHTML={{ __html: LoadDiv() }} />
              )}
            </Fragment>
          ) : (
            <div className="Gray_9e TxtCenter justifyCenter flexRow valignWrapper h100">
              {groupId ? _l('部门下没有可选成员') : _l('从左侧选择部门后显示成员')}
            </div>
          )}
        </ScrollView>
      );
    }
  }
  render() {
    let { departmentLoading, department = [] } = this.state;
    return (
      <div className="flexRow h100">
        {this.renderDepartmentTree()}
        <UsersWrapper className="flex">
          {!departmentLoading && !_.isEmpty(department) ? this.renderUsers() : null}
        </UsersWrapper>
      </div>
    );
  }
}

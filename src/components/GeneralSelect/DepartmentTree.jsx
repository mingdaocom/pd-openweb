
import React, { Component, Fragment } from 'react';
import autobind from './autobind';
import User from './User';
import cx from 'classnames';
import NoData from './NoData';
import { Icon, Checkbox, ScrollView } from 'ming-ui';
import styled from 'styled-components';
import departmentController from 'src/api/department';

const DepartmentTreeWrapper = styled.div`
  border-right: 1px solid #F3F3F3;
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
  &:hover {
    background-color: #F5F5F5;
  }
  &.active {
    background-color: #D6ECFE;
    .icon, div {
      color: #2196F3 !important;
    }
  }
  .iconArrow {
    display: flex;
    padding: 7px 0px 5px 2px;
    border-radius: 4px;
    &:hover {
      background-color: #F5F5F5;
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
      pagedDepartmentSize: 20,
      isMoreDepartment: true,
      department: props.data || [],
      departmentLoading: false
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
  }
  getNextPageDepartmentTrees = () => {
    const { pagedDepartmentIndex, pagedDepartmentSize } = this.state;
    const { projectId } = this.props;
    this.setState({ departmentLoading: true });
    departmentController.pagedDepartmentTrees({
      projectId,
      pageIndex: pagedDepartmentIndex + 1,
      pageSize: pagedDepartmentSize,
    }).then((res) => {
      const department = this.state.department.concat(res);
      this.setState({
        isMoreDepartment: department.length % pagedDepartmentSize <= 0,
        departmentLoading: false,
        pagedDepartmentIndex: pagedDepartmentIndex + 1,
        department
      });
    });
  }
  handleLoadAll = (id) => {
    const { pageIndex } = this.state;
    const { projectId } = this.props;
    this.setState({ groupId: id, loading: true });
    departmentController.getNotInDepartmentUsers({
      projectId,
      pageIndex,
      pageSize: 20,
    }).then(({ listUser }) => {
      const groupList = this.state.groupList.concat(listUser.list);
      this.setState({
        isMore: groupList.length !== listUser.allCount,
        loading: false,
        pageIndex: pageIndex + 1,
        groupList
      });
    });
  }
  handleSelectGroup = (id) => {
    const { pageIndex } = this.state;
    const { userSettings, projectId } = this.props;
    const { groupId } = this.state;
    this.setState({ groupId: id, loading: true });
    departmentController.getDepartmentUsers({
      filterAccountIds: userSettings.filterAccountIds,
      departmentId: id,
      projectId,
      pageIndex,
      pageSize: 20
    }).then(data => {
      const groupList = this.state.groupList.concat(data.list);
      this.setState({
        isMore: groupList.length !== data.allCount,
        loading: false,
        pageIndex: pageIndex + 1,
        groupList
      });
    });
  }
  renderDepartment(item) {
    const { projectId } = this.props;
    const { selects, groupId } = this.state;
    const subVisible = selects.includes(item.id);
    return (
      <Fragment key={item.id}>
        <Department
          className={cx('flexRow valignWrapper pointer', { active: groupId === item.id })}
          onClick={() => {
            this.setState({
              groupList: [], pageIndex: 1, isMore: true
            }, () => {
              if (projectId === item.id) {
                this.handleLoadAll(item.id);
              } else {
                this.handleSelectGroup(item.id);
              }
            });
          }}
        >
          <Icon
            icon={subVisible ? 'arrow-down' : 'arrow-right-tip'}
            className={cx('Gray_75 iconArrow', { Visibility: _.isEmpty(item.subs) })}
            onClick={(event) => {
              event.stopPropagation();
              const { selects } = this.state;
              if (selects.includes(item.id)) {
                this.setState({
                  selects: selects.filter(id => id !== item.id)
                });
              } else {
                this.setState({
                  selects: selects.concat(item.id)
                });
              }
            }}
          />
          <Icon className="Gray_9e Font16 mLeft2 mRight5" icon="folder" />
          <div className="ellipsis Font13">{item.name}</div>
        </Department>
        {subVisible && (
          <div className="subs">
            {
              item.subs.map(item => (
                this.renderDepartment(item)
              ))
            }
          </div>
        )}
      </Fragment>
    );
  }
  renderDepartmentTree() {
    const { projectId } = this.props;
    const { department = [], departmentLoading } = this.state
    const project = _.find(md.global.Account.projects, { projectId });
    return (
      <DepartmentTreeWrapper className="flex">
        <ScrollView className="flex asdsad" onScrollEnd={() => {
          const { isMoreDepartment } = this.state;
          if (!departmentLoading && isMoreDepartment) {
            this.getNextPageDepartmentTrees();
          }
        }}>
          {this.renderDepartment({
            id: project.projectId,
            name: project.companyName,
            subs: department.length ? department : []
          })}
          {departmentLoading && <div className="justifyCenter flexRow valignWrapper" dangerouslySetInnerHTML={{ __html: LoadDiv() }} />}
        </ScrollView>
      </DepartmentTreeWrapper>
    );
  }
  renderUsers() {
    const { pageIndex } = this.props;
    const { groupId, loading, groupList } = this.state;
    if (loading && !groupList.length) {
      return (
        <UsersWrapper className="flex">
          <div className="justifyCenter flexRow valignWrapper h100" dangerouslySetInnerHTML={{ __html: LoadDiv() }} />
        </UsersWrapper>
      )
    } else {
      const ids = this.props.selectedUsers.map(item => item.accountId);
      const res = groupList.filter(item => ids.includes(item.accountId));
      return (
        <UsersWrapper className="flex">
          <ScrollView className="flex" onScrollEnd={this.handleScrollEnd}>
          {
            groupList.length ? (
              <Fragment>
                <div className="flexRow valignWrapper pLeft15 pBottom5">
                  <Checkbox
                    checked={res.length === groupList.length}
                    onClick={() => {
                      const isAll = res.length !== groupList.length;
                      if (isAll) {
                        const ids = this.props.selectedUsers.map(item => item.accountId);
                        const res = groupList.filter(item => !ids.includes(item.accountId)).map(item => {
                          return {
                            data: item,
                            type: 'user'
                          }
                        })
                        this.props.addSelectedData(res);
                      } else {
                        const ids = this.props.selectedUsers.map(item => item.accountId);
                        this.props.removeSelectedData(groupList.filter(item => ids.includes(item.accountId)).map(item => item.accountId));
                      }
                    }}
                  />
                  <div className="Gray_75">{_l('已选')} {`${res.length}/${groupList.length}`}</div>
                </div>
                {
                  groupList.map(item => (
                    <User
                      key={item.accountId}
                      user={item}
                      checked={this.getChecked(item)}
                      onChange={this.props.onChange}
                    />
                  ))
                }
                {
                  loading && <div className="justifyCenter flexRow valignWrapper" dangerouslySetInnerHTML={{ __html: LoadDiv() }} />
                }
              </Fragment>
            ) : (
              groupId && <div className="Gray_75 TxtCenter justifyCenter flexRow valignWrapper h100">{_l('暂无成员')}</div>
            )
          }
          </ScrollView>
        </UsersWrapper>
      );
    }
  }
  render() {
    return (
      <div className="flexRow h100">
        {this.renderDepartmentTree()}
        {this.renderUsers()}
      </div>
    );
  }
}

import React from 'react';
import Checkbox from 'ming-ui/components/Checkbox';
import ListSearchBar from '../components/ListSearchBar';
import ProjectContactsList from '../components/ProjectContactsList';
import ContactList from '../components/ContactList';
import DepartmentUsers from '../components/DepartmentUsers';
import API from '../api';
import departmentController from 'src/api/department';
import styled from 'styled-components';
import { Icon, ScrollView } from 'ming-ui';
import _ from 'lodash';

const SearchContainer = styled.div`
  width: 100%;
  height: 100%;
  .searchUsers {
    padding-top: 24px;
    height: 50%;
    .userTxt {
      font-size: 14px;
      color: #757575;
      margin-bottom: 8px;
      padding-left: 24px;
    }
    .searchResult {
      width: 100%;
      flex: 1;
    }
  }
  .searchDepartment {
    height: 50%;
    padding-top: 10px;
    .departmentTxt {
      font-size: 14px;
      color: #757575;
      padding-left: 24px;
    }
    .searchResult {
      width: 100%;
      flex: 1;
      .departmentItem {
        color: #333;
        font-size: 13px;
        padding-left: 24px;
        line-height: 32px;
        .icon {
          line-height: 32px;
          color: #bdbdbd;
        }
        .departmentName {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .departmentItem:hover {
        background-color: #f5f5f5;
      }
    }
  }
`;

const formatDepartmentData = list => {
  const departments = {};
  const concatedList = (list || []).concat({
    departmentName: _l('未分配部门的联系人'),
    departmentId: '',
  });
  _.forEach(concatedList, item => {
    const { departmentId, departmentName } = item;
    departments[departmentId] = {
      departmentName,
      departmentId,
      isOpen: false,
      isLoading: false,
      list: [],
    };
  });

  return departments;
};

export default class ProjectContacts extends React.Component {
  constructor() {
    super();

    this.state = {
      // store
      listData: [],
      departments: null,
      // list state
      selectedAccountId: null,
      isLoading: false,
      keywords: '',
      hasMore: true,
      pageIndex: 1,
      pageSize: 20,
      groupList: [],
      usersPageIndex: 1,
      usersLoading: true,
    };

    this.promise = null;

    this.fetch = this.fetch.bind(this);
    this.search = this.search.bind(this);
    this.fetchDepartmentUser = this.fetchDepartmentUser.bind(this);
    this.updateDeptModel = this.updateDeptModel.bind(this);
    this.itemClickHandler = this.itemClickHandler.bind(this);
    this.fetchDepartments = this.fetchDepartments.bind(this);
  }

  componentDidMount() {
    this.fetchDepartments();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({}, this.fetchDepartments);
    if (!_.isEqual(this.props.projectId, nextProps.projectId)) {
      this.setState({ pageIndex: 1, groupId: '', groupList: [], keywords: '' });
    }
  }

  componentWillUnmount() {
    this.abortRequest();
  }

  abortRequest() {
    if (this.promise && this.promise.state() === 'pending' && this.promise.abort) {
      this.promise.abort();
    }
  }

  search(keywords) {
    this.abortRequest();
    this.setState(
      {
        isLoading: false,
        pageIndex: 1,
        keywords,
        hasMore: true,
        listData: [],
        hideBackBtn: keywords ? true : false,
      },
      this.fetch,
    );
  }

  fetch() {
    const { isLoading, pageIndex, hasMore, keywords } = this.state;
    if (!keywords || isLoading || !hasMore) return;
    this.setState({
      isLoading: true,
    });
    this.fetchContacts().then(hasMore => {
      this.setState({
        isLoading: false,
        pageIndex: 1,
        // hasMore,
      });
    });
  }

  fetchContacts() {
    const { pageIndex, keywords } = this.state;
    const { projectId } = this.props;
    this.promise = API.searchAddressbookAndDepartment({
      pageIndex,
      keywords,
      projectId,
      pageSize: 100,
      range: 0,
      isFilterOther: false,
    });
    return this.promise.then(data => {
      const { listData } = this.state;
      this.setState({
        listData: (listData || []).concat(data.userResult),
      });
      return data.userResult && data.userResult.length;
    });
  }

  fetchDepartments() {
    const { projectId } = this.props;
    let { pageIndex, pageSize } = this.state;
    this.setState({ isMore: false });
    this.promise = departmentController.pagedDepartmentTrees({
      dataRange: 2,
      filterAccountIds: [md.global.Account.accountId],
      filterFriend: false,
      keywords: '',
      parentId: '',
      prefixAccountIds: [],
      firstLetter: '',
      projectId,
      pageIndex,
      pageSize,
    });
    return this.promise.then(data => {
      const { pageIndex, departmentsList = [] } = this.state;

      let currentPageData = (data || []).map(item => ({ ...item, subs: [] }));
      let result = pageIndex > 1 ? departmentsList.concat(currentPageData) : currentPageData;
      this.setState({
        departments: formatDepartmentData(result),
        isMore: _.isArray(data) && data.length === pageSize,
        departmentsList: result,
      });
    });
  }

  loadNextPage = () => {
    this.setState({ pageIndex: this.state.pageIndex + 1 }, () => {
      this.fetchDepartments();
    });
  };

  fetchDepartmentUser(departmentId) {
    const { projectId } = this.props;
    this.updateDeptModel(departmentId, {
      isLoading: true,
      isOpen: true,
    });
    return API.fetchDepartmentUsers({
      projectId,
      departmentId,
    })
      .then(({ list }) => {
        return list || [];
      })
      .then(list => {
        const {
          departments: { [departmentId]: department },
        } = this.state;
        this.updateDeptModel(departmentId, {
          list,
          isLoading: false,
        });
      });
  }

  updateDeptModel(id, payload) {
    const {
      departments: { [id]: department },
    } = this.state;

    this.setState({
      departments: {
        ...this.state.departments,
        [id]: _.extend({}, department, payload),
      },
    });
  }

  itemClickHandler({ accountId, isFriend }) {
    this.setState({
      selectedAccountId: accountId,
      isFriend,
      hideBackBtn: true,
    });
  }

  handleSelectGroup = id => {
    const { usersPageIndex } = this.state;
    const { projectId } = this.props;
    this.setState({ isMoreUsers: false });
    departmentController
      .getDepartmentUsers({
        filterAccountIds: [],
        departmentId: id ? id : this.state.groupId,
        projectId,
        pageIndex: usersPageIndex,
        pageSize: 20,
      })
      .then(data => {
        const groupList = usersPageIndex > 1 ? this.state.groupList.concat(data.list) : data.list;
        this.setState({
          isMoreUsers: groupList.length !== data.allCount,
          usersLoading: false,
          usersPageIndex: usersPageIndex + 1,
          groupList,
          allCount: data.allCount,
        });
      });
  };

  handleLoadAll = () => {
    const { usersPageIndex } = this.state;
    const { projectId } = this.props;
    this.setState({ isMoreUsers: false });
    departmentController
      .getNotInDepartmentUsers({
        projectId,
        pageIndex: usersPageIndex,
        pageSize: 20,
      })
      .then(({ listUser }) => {
        const groupList = usersPageIndex > 1 ? this.state.groupList.concat(listUser.list) : listUser.list;
        this.setState({
          isMoreUsers: groupList.length !== listUser.allCount,
          usersLoading: false,
          usersPageIndex: usersPageIndex + 1,
          groupList,
          allCount: listUser.allCount,
        });
      });
  };

  selectCurrentDepartment = (id, name) => {
    this.setState({ groupId: id, groupList: [], usersPageIndex: 1, groupName: name, usersLoading: true }, () => {
      if (this.props.projectId === id) {
        this.handleLoadAll(id);
      } else {
        this.handleSelectGroup(id);
      }
    });
  };

  renderList() {
    const {
      departments,
      listData,
      selectedAccountId,
      isLoading,
      keywords,
      isMore,
      departmentsList,
      departmentResult = [],
    } = this.state;
    const isSearch = !!keywords;
    if (isSearch) {
      return (
        <SearchContainer>
          <ContactList
            isSearch={isSearch}
            selectedAccountId={selectedAccountId}
            list={listData}
            isLoading={isLoading}
            fetch={() => {}}
            itemClickHandler={this.itemClickHandler}
            searchDepartmentUsers={true}
          />
          {/* <div className="searchUsers flexColumn">
            <div className="userTxt">{_l('成员')}</div>
            <div className="Relative searchResult">
             
            </div>
          </div>
          <div className="searchDepartment flexColumn">
            <div className="departmentTxt">{_l('部门')}</div>
            <div className="Relative searchResult">
              <ScrollView>
                {departmentResult.map(item => {
                  return (
                    <div
                      className="departmentItem flexRow"
                      key={item.id}
                      onClick={() => {
                        this.selectCurrentDepartment(item.id, item.name);
                      }}
                    >
                      <Icon icon="folder" className="mRight8" />
                      <span className="flex departmentName">{item.name}</span>
                    </div>
                  );
                })}
              </ScrollView>
            </div>
          </div> */}
        </SearchContainer>
      );
    } else {
      return (
        <ProjectContactsList
          selectedAccountId={selectedAccountId}
          list={departments}
          isLoading={isLoading}
          loadNextPage={this.loadNextPage}
          departmentLoading={this.state.departmentLoading}
          isMore={isMore}
          departmentsList={departmentsList}
          projectId={this.props.projectId}
          groupId={this.state.groupId}
          selectCurrentDepartment={this.selectCurrentDepartment}
        />
      );
    }
  }

  render() {
    const { selectedAccountId, keywords, usersLoading, groupList = [], groupId } = this.state;
    return (
      <React.Fragment>
        <div className="contacts-list">
          <ListSearchBar
            keywords={keywords}
            type="projectContacts"
            search={this.search}
            projectId={this.props.projectId}
          />
          <div className="contacts-list-content">{this.renderList()}</div>
        </div>
        <div className="contacts-detail">
          {(groupId || selectedAccountId) && (
            <DepartmentUsers
              usersLoading={usersLoading}
              groupList={groupList}
              groupId={groupId}
              projectId={this.props.projectId}
              isMoreUsers={this.state.isMoreUsers}
              handleSelectGroup={this.handleSelectGroup}
              handleLoadAll={this.handleLoadAll}
              allCount={this.state.allCount || 0}
              groupId={this.state.groupId}
              selectedAccountId={selectedAccountId}
              groupName={this.state.groupName}
              hideBackBtn={this.state.hideBackBtn}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}

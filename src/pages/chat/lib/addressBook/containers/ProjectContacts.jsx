import React from 'react';

import Checkbox from 'ming-ui/components/Checkbox';

import ListSearchBar from '../components/ListSearchBar';
import ProjectContactsList from '../components/ProjectContactsList';
import ContactList from '../components/ContactList';

import UserDetail from '../components/UserDetail';
// unSelectState

import API from '../api';

const formatDepartmentData = (list) => {
  const departments = {};
  const concatedList = (list || []).concat({
    departmentName: _l('未分配部门的联系人'),
    departmentId: '',
  });
  _.forEach(concatedList, (item) => {
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

const defaultState = {
  // store
  listData: null,
  departments: null,
  // list state
  selectedAccountId: null,
  isLoading: false,
  keywords: '',
  hasMore: true,
};

export default class ProjectContacts extends React.Component {
  constructor() {
    super();

    this.state = defaultState;

    this.promise = null;

    this.fetch = this.fetch.bind(this);
    this.search = this.search.bind(this);
    this.fetchDepartmentUser = this.fetchDepartmentUser.bind(this);
    this.updateDeptModel = this.updateDeptModel.bind(this);
    this.itemClickHandler = this.itemClickHandler.bind(this);
  }

  componentDidMount() {
    this.fetchDepartments();
  }

  componentWillReceiveProps() {
    this.setState(defaultState, this.fetchDepartments.bind(this));
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
        listData: null,
      },
      this.fetch
    );
  }

  fetch() {
    const { isLoading, pageIndex, hasMore, keywords } = this.state;
    if (!keywords || isLoading || !hasMore) return;
    this.setState({
      isLoading: true,
    });
    this.fetchContacts().then((hasMore) => {
      this.setState({
        isLoading: false,
        pageIndex: pageIndex + 1,
        hasMore,
      });
    });
  }

  fetchContacts() {
    const { pageIndex, keywords } = this.state;
    const { projectId } = this.props;
    this.promise = API.fetchProjectContacts({ pageIndex, keywords, projectId });
    return this.promise.then((data) => {
      const { listData } = this.state;
      this.setState({
        listData: (listData || []).concat(data.list),
      });
      // has more data to load
      return data.list && data.list.length;
    });
  }

  fetchDepartments() {
    const { projectId } = this.props;
    this.promise = API.fetchDepartments({ projectId });
    return this.promise.then((data) => {
      const { departments } = this.state;
      this.setState({
        departments: formatDepartmentData(data.list),
      });
    });
  }

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
      .then((list) => {
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
    });
  }

  renderList() {
    const { departments, listData, selectedAccountId, isLoading, keywords } = this.state;
    const isSearch = !!keywords;
    if (isSearch) {
      return (
        <ContactList
          isSearch={isSearch}
          selectedAccountId={selectedAccountId}
          list={listData}
          isLoading={isLoading}
          fetch={this.fetch}
          itemClickHandler={this.itemClickHandler}
        />
      );
    } else {
      return (
        <ProjectContactsList
          selectedAccountId={selectedAccountId}
          list={departments}
          isLoading={isLoading}
          fetch={this.fetchDepartmentUser}
          update={this.updateDeptModel}
          itemClickHandler={this.itemClickHandler}
        />
      );
    }
  }

  render() {
    const { selectedAccountId, keywords } = this.state;
    return (
      <React.Fragment>
        <div className="contacts-list">
          <ListSearchBar keywords={keywords} type="projectContacts" search={this.search} projectId={this.props.projectId} />
          <div className="contacts-list-content">{this.renderList()}</div>
        </div>
        <div className="contacts-detail">
          <UserDetail accountId={selectedAccountId} />
        </div>
      </React.Fragment>
    );
  }
}

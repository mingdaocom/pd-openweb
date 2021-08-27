import React from 'react';
import PropTypes from 'prop-types';

import ListSearchBar from '../components/ListSearchBar';
import GroupList from '../components/GroupList';
import GroupDetail from '../components/GroupDetail';
import JoinGroup from '../components/JoinGroup';
import GroupFilter from '../components/GroupFilter';

import API from '../api';

import { SEARCH_GROUP_TYPES, GROUP_STATUS } from '../constants';

const formatGroupsData = (store, list) => {
  const result = store || {};
  _.each(list, (item) => {
    const { firstCode } = item;
    const title = /[A-Z]/.test(firstCode.toUpperCase()) ? firstCode.toUpperCase() : '#';
    if (!result[title]) {
      result[title] = [];
    }
    result[title].push(item);
  });

  return result;
};

const defaultState = {
  // store
  listData: null,
  // list state
  selectedGroupId: null,
  isLoading: false,
  hasMore: true,
  // request param
  pageIndex: 1,
  keywords: '',
  searchGroupType: SEARCH_GROUP_TYPES.JOINED,
  groupStatus: GROUP_STATUS.OPEN,
};

export default class ProjectGroups extends React.Component {
  static propTypes = {
    projectId: PropTypes.string,
  };

  static defaultProps = {
    projectId: '',
  };

  constructor(props) {
    super();

    this.state = defaultState;

    this.promise = null;

    this.search = this.search.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
    this.changeStatus = this.changeStatus.bind(this);
    this.fetch = this.fetch.bind(this);
    this.fetchGroups = this.fetchGroups.bind(this);
    this.itemClickHandler = this.itemClickHandler.bind(this);
    this.updateGroupModel = this.updateGroupModel.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(defaultState, this.fetch.bind(this));
  }

  componentWillUnmount() {
    this.abortRequest();
  }

  abortRequest() {
    if (this.promise && this.promise.state() === 'pending' && this.promise.abort) {
      this.promise.abort();
    }
  }

  fetchGroups() {
    const { pageIndex, keywords, searchGroupType, groupStatus } = this.state;
    const { projectId } = this.props;
    const params = { pageIndex, keywords, projectId, searchGroupType };
    this.promise = API.fetchAllGroups(keywords ? { ...params } : { ...params, groupStatus });
    return this.promise.then((data) => {
      const { listData } = this.state;
      if (keywords) {
        this.setState({
          listData: (listData || []).concat(data.list),
        });
      } else {
        this.setState({
          listData: formatGroupsData(listData, data.list),
        });
      }
      // has more data to load
      return data.list && data.list.length;
    });
  }

  fetch() {
    const { isLoading, hasMore, pageIndex } = this.state;
    if (isLoading || !hasMore) return;
    this.setState({
      isLoading: true,
    });
    this.fetchGroups().then((_hasMore) => {
      this.setState({
        pageIndex: pageIndex + 1,
        isLoading: false,
        hasMore: _hasMore,
      });
    });
  }

  updateGroupModel(groupId, isOpen) {
    const { listData } = this.state;
    const keys = _.keys(listData);
    const result = {};
    _.forEach(keys, (key) => {
      const list = listData[key];
      result[key] = _.map(list, (group) => {
        if (group.groupId === groupId) {
          return {
            ...group,
            isOpen,
          };
        } else {
          return group;
        }
      });
    });
    this.setState({
      listData: result,
    });
  }

  getGroupModel(groupId) {
    const { listData, keywords } = this.state;
    let result = null;
    if (keywords) {
      result = _.find(listData, group => group.groupId === groupId);
    } else {
      const keys = _.keys(listData);
      _.forEach(keys, (key) => {
        const list = listData[key];
        result = _.find(list, (group) => {
          return group.groupId === groupId;
        });
        if (result) return false;
      });
    }
    return result;
  }

  itemClickHandler(id) {
    this.setState({
      selectedGroupId: id,
    });
  }

  renderFilter() {
    return (
      <GroupFilter
        isProject={!!this.props.projectId}
        changeGroupFilter={this.changeFilter}
        changeGroupStatus={this.changeStatus}
        searchGroupType={this.state.searchGroupType}
        groupStatus={this.state.groupStatus}
      />
    );
  }

  search(keywords) {
    this.abortRequest();
    this.setState(
      {
        isLoading: false,
        keywords,
        pageIndex: 1,
        hasMore: true,
        listData: null,
        selectedGroupId: null,
      },
      this.fetch
    );
  }

  changeFilter(searchGroupType) {
    this.setState(
      {
        pageIndex: 1,
        hasMore: true,
        listData: null,
        searchGroupType,
      },
      this.fetch
    );
  }

  changeStatus() {
    this.setState(({ groupStatus }) => {
      if (groupStatus === GROUP_STATUS.ALL) {
        return {
          pageIndex: 1,
          hasMore: true,
          listData: null,
          groupStatus: GROUP_STATUS.OPEN,
        };
      } else {
        return {
          pageIndex: 1,
          hasMore: true,
          listData: null,
          groupStatus: GROUP_STATUS.ALL,
        };
      }
    }, this.fetch);
  }

  // updateFixedTip(position) {
  //     if (position < 32) {
  //         this.setState({
  //             showTip: false,
  //         });
  //         return;
  //     }
  //     const $lists = $(this.listContent).find('.list-wrapper');
  //     for (var i = 0, len = $lists.length; i < len; i++) {
  //         var $list = $lists.eq(i);
  //         var _top = parseInt($list.position().top, 10);
  //         var _height = $list.height();

  //         if (_top < 32 && Math.abs(_top) + 32 < _height) {
  //             this.setState({
  //                 showTip: true,
  //                 tip: $list.find('.list-packet').html(),
  //             });
  //             break;
  //         } else {
  //             this.setState({
  //                 showTip: false,
  //             });
  //         }
  //     }
  // }

  // renderTip() {
  //     const { showTip, tip } = this.state;
  //     if (showTip && tip) {
  //         return <div className='list-packet fixed Gray_75 Font12'>{tip}</div>
  //     } else {
  //         return null;
  //     }
  // }

  renderDetail() {
    const { selectedGroupId } = this.state;
    const selectedGroup = this.getGroupModel(selectedGroupId);
    if (selectedGroupId && selectedGroup && !selectedGroup.isMember) {
      return <JoinGroup groupId={selectedGroupId} />;
    }
    return <GroupDetail group={selectedGroup} updateGroupModel={this.updateGroupModel} />;
  }

  render() {
    const { listData, isLoading, selectedGroupId, keywords } = this.state;
    return (
      <React.Fragment>
        <div className="contacts-list">
          <ListSearchBar search={this.search} keywords={keywords} type={'groups'} projectId={this.props.projectId} />
          {keywords ? null : this.renderFilter()}
          <div
            className="contacts-list-content"
            ref={(el) => {
              this.listContent = el;
            }}
          >
            <GroupList
              isSearch={!!keywords}
              selectedGroupId={selectedGroupId}
              list={listData}
              isLoading={isLoading}
              fetch={this.fetch}
              itemClickHandler={this.itemClickHandler}
            />
          </div>
        </div>
        <div className="contacts-detail">{this.renderDetail()}</div>
      </React.Fragment>
    );
  }
}

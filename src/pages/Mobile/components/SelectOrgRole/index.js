import React, { Component, Fragment } from 'react';
import { Checkbox } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, PopupWrapper, ScrollView } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import organizeAjax from 'src/api/organize.js';
import './index.less';

export default class SelectOrgRole extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orgRoleList: [],
      isLoading: false,
      isMore: false,
      treeData: [],
      expendTreeNodeKey: [],
      searchList: [],
      pageIndex: 1,
      selectedOrgRole: props.selectOrgRoles || [],
    };
    this.debounceSearch = _.debounce(() => {
      this.handleSearch();
    }, 500);
  }
  componentDidMount() {
    this.init();
  }

  init() {
    const { projectId, appointedOrganizeIds } = this.props;
    organizeAjax
      .getOrgRoleGroupsByProjectId({
        projectId,
      })
      .then(res => {
        let groups = [
          {
            orgRoleGroupName: _l('默认'),
            orgRoleGroupId: '',
          },
        ]
          .concat(res)
          .map(l => {
            return {
              ...l,
              children: [],
              fetched: false,
            };
          });
        !appointedOrganizeIds && this.setState({ expendTreeNodeKey: [groups[0].orgRoleGroupId] });
        this.getData(groups, groups[0].orgRoleGroupId);
      });
  }

  getData = (groups, orgRoleGroupId, index) => {
    const { projectId, appointedOrganizeIds = [] } = this.props;
    let { keywords, pageIndex = 1, treeData, searchList } = this.state;
    let treeList = groups || treeData;
    const fetchPageIndex = index || pageIndex;

    organizeAjax
      .getOrganizes({
        projectId,
        keywords,
        pageIndex: fetchPageIndex,
        pageSize: keywords ? 50 : 500,
        appointedOrganizeIds,
        orgRoleGroupId,
      })
      .then(result => {
        if (keywords) {
          let list = pageIndex === 1 ? result.list : searchList.concat(result.list);
          this.setState({
            searchList: list,
            isMore: result.allCount > list.length,
            loading: false,
          });
          return;
        }
        if (appointedOrganizeIds.length) {
          result.list.forEach(l => {
            let index = _.findIndex(treeList, o => o.orgRoleGroupId === l.orgRoleGroupId);
            treeList[index].children.push(l);
            !treeList[index].fetched && (treeList[index].fetched = true);
          });
          treeList = treeList.filter(l => l.fetched);
          treeList[0] && this.setState({ expendTreeNodeKey: [treeList[0].orgRoleGroupId] });
        } else {
          let index = _.findIndex(treeList, l => l.orgRoleGroupId === orgRoleGroupId);
          let list =
            fetchPageIndex === 1 ? result.list : _.unionBy(treeList[index].children, result.list, 'organizeId');
          treeList[index].children = list;
          treeList[index].fetched = true;
          treeList[index].hasMore = result.allCount > list.length;
          treeList[index].pageIndex = fetchPageIndex;
        }

        this.setState({
          isLoading: false,
          treeData: treeList,
        });
      });
  };

  handleSearch = () => {
    if (!this.state.keywords) {
      this.setState({ searchList: [], pageIndex: 1 });
      return;
    }

    this.setState(
      {
        pageIndex: 1,
      },
      () => {
        this.getData();
      },
    );
  };

  handleSave = () => {
    const { selectedOrgRole } = this.state;
    this.props.onSave(selectedOrgRole);
    this.props.onClose();
  };

  onClear = () => {
    this.props.onSave([]);
    this.props.onClose();
  };

  renderSearch() {
    const { keywords } = this.state;
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
            placeholder={_l('搜索组织角色')}
            className="Font14"
            value={keywords}
            onChange={e => {
              this.setState({ keywords: e.target.value }, this.debounceSearch);
            }}
            onKeyDown={event => {
              event.which === 13 && this.handleSearch();
            }}
            onBlur={this.handleSearch}
          />
        </form>
        {keywords ? (
          <Icon
            icon="workflow_cancel"
            onClick={() => {
              this.setState(
                {
                  keywords: '',
                },
                this.handleSearch,
              );
            }}
          />
        ) : null}
      </div>
    );
  }

  onScrollEnd = () => {
    const { isMore, isLoading, keywords, pageIndex } = this.state;

    if (!keywords || isLoading || !isMore) return;

    this.setState({ pageIndex: pageIndex + 1 }, () => {
      this.getData();
    });
  };

  renderSelected() {
    const { selectedOrgRole = [] } = this.state;
    return (
      <div className={cx('selectedWrapper', { hide: _.isEmpty(selectedOrgRole) })}>
        <ScrollView style={{ maxHeight: 92, minHeight: 46 }}>
          {selectedOrgRole.map(item => (
            <span className="selectedItem" key={item.organizeId}>
              <span className="ellipsis curSelected">{item.organizeName}</span>
              <Icon
                icon="close"
                className="Gray_9e Font15"
                onClick={() => {
                  const { selectedOrgRole } = this.state;
                  this.setState({
                    selectedOrgRole: selectedOrgRole.filter(it => it.organizeId !== item.organizeId),
                  });
                }}
              />
            </span>
          ))}
        </ScrollView>
      </div>
    );
  }

  handleExpend = groupItem => {
    const { expendTreeNodeKey } = this.state;
    const { orgRoleGroupId, fetched } = groupItem;

    if (expendTreeNodeKey.includes(orgRoleGroupId)) {
      this.setState({ expendTreeNodeKey: expendTreeNodeKey.filter(l => l !== orgRoleGroupId) });
      return;
    }

    if (!fetched) {
      this.getData(undefined, orgRoleGroupId);
    }

    this.setState({ expendTreeNodeKey: expendTreeNodeKey.concat([orgRoleGroupId]) });
  };

  checkOrgRoles = item => {
    const { unique } = this.props;
    const { selectedOrgRole = [] } = this.state;
    const selectedOrgRoleIds = selectedOrgRole.map(item => item.organizeId);
    let isSelected = _.includes(selectedOrgRoleIds, item.organizeId);
    let copySelectedOrgRole = [...selectedOrgRole];
    if (!isSelected) {
      !unique && copySelectedOrgRole.push(item);
      this.setState(
        {
          selectedOrgRole: !unique ? copySelectedOrgRole : [item],
        },
        () => {
          if (unique) this.handleSave();
        },
      );
    } else {
      this.setState({ selectedOrgRole: selectedOrgRole.filter(it => it.organizeId !== item.organizeId) });
    }
  };

  renderChildren = groupItem => {
    const { unique } = this.props;
    const { expendTreeNodeKey, selectedOrgRole, keywords, searchList } = this.state;
    const selectedOrgRoleIds = selectedOrgRole.map(item => item.organizeId);

    if (groupItem && !expendTreeNodeKey.includes(groupItem.orgRoleGroupId)) return;

    return (groupItem ? groupItem.children : searchList).map(roleItem => {
      return (
        <div className="flexRow orgRoleItem" key={roleItem.organizeId} onClick={() => this.checkOrgRoles(roleItem)}>
          {!unique && (
            <Checkbox
              style={{ '--icon-size': '18px' }}
              checked={_.includes(selectedOrgRoleIds, roleItem.organizeId)}
              onClick={() => this.checkOrgRoles(roleItem)}
            />
          )}
          <div className="flex organizeName Gray">{roleItem.organizeName}</div>
        </div>
      );
    });
  };

  renderParent = () => {
    const { isLoading, keywords, treeData, expendTreeNodeKey, searchList } = this.state;
    if (isLoading) {
      return <LoadDiv />;
    }

    if (
      !treeData.length ||
      (treeData.length === 1 && treeData[0].orgRoleGroupId === '' && !treeData[0].children.length)
    ) {
      return (
        <div className="emptyWrap h100 flexCenter justifyContentCenter">
          <div className="Gray_bd Font14">{_l('没有可选组织角色')}</div>
        </div>
      );
    }

    if (keywords && !searchList.length) {
      return (
        <div className="GSelect-NoData">
          <i className="icon-search GSelect-iconNoData" />
          <p className="GSelect-noDataText">{keywords ? _l('搜索无结果') : _l('无结果')}</p>
        </div>
      );
    }

    const list = treeData.filter(l => l.orgRoleGroupId !== '' || l.children.length);

    return (
      <ScrollView className="flex orgRoleList" onScrollEnd={this.onScrollEnd}>
        {!keywords &&
          treeData.map(groupItem => {
            if (groupItem.orgRoleGroupId === '' && !groupItem.children.length) return null;

            return (
              <Fragment key={`mobile-role-fragment-${groupItem.orgRoleGroupId}`}>
                <div
                  className="groupItem Hand ellipsis"
                  key={`mobile-role-groupItem-${groupItem.orgRoleGroupId}`}
                  onClick={() => this.handleExpend(groupItem)}
                >
                  <Icon
                    icon="task_custom_btn_unfold"
                    className={cx('Gray_9e mRight13 expendIcon InlineBlock', {
                      rotate: !expendTreeNodeKey.includes(groupItem.orgRoleGroupId),
                    })}
                  />
                  <span className="Font15 Bold ellipsis">{groupItem.orgRoleGroupName}</span>
                </div>
                {this.renderChildren(groupItem)}
                {groupItem.hasMore && expendTreeNodeKey.includes(groupItem.orgRoleGroupId) && (
                  <div
                    className="organizeName Hand valignWrapper ThemeColor pLeft20 pTop13 pBottom13"
                    onClick={() => this.getData(undefined, groupItem.orgRoleGroupId, groupItem.pageIndex + 1)}
                  >
                    <span className={cx({ mLeft16: list.length > 1 })}>{_l('加载更多')}</span>
                  </div>
                )}
              </Fragment>
            );
          })}
        {keywords && this.renderChildren()}
      </ScrollView>
    );
  };

  renderContent = () => {
    return (
      <div className="flex flexColumn">
        {this.renderSearch()}
        {this.renderSelected()}
        {this.renderParent()}
      </div>
    );
  };

  render() {
    const { visible, onClose, unique, hideClearBtn = true } = this.props;
    const { selectedOrgRole } = this.state;
    return (
      <PopupWrapper
        bodyClassName="heightPopupBody40"
        visible={visible}
        title={_l('组织角色')}
        confirmDisable={!selectedOrgRole.length}
        onClose={onClose}
        onConfirm={unique ? null : this.handleSave}
        onClear={hideClearBtn ? null : this.onClear}
      >
        <div className="selectOrgRoleModal flexColumn">{this.renderContent()}</div>
      </PopupWrapper>
    );
  }
}
export const selectOrgRole = props => functionWrap(SelectOrgRole, { ...props });

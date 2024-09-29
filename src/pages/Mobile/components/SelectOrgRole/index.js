import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, ScrollView, LoadDiv } from 'ming-ui';
import { Popup, Button, Checkbox } from 'antd-mobile';
import functionWrap from 'ming-ui/components/FunctionWrap';
import organizeAjax from 'src/api/organize.js';
import './index.less';
import _ from 'lodash';

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
      selectedOrgRole: [],
    };
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

  getData = (groups, orgRoleGroupId) => {
    const { projectId, appointedOrganizeIds = [] } = this.props;
    let { keywords, pageIndex = 1, treeData, searchList } = this.state;
    let treeList = groups || treeData;

    organizeAjax
      .getOrganizes({
        projectId,
        keywords,
        pageIndex,
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
          treeList[index].children = result.list;
          treeList[index].fetched = true;
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
            type="text"
            placeholder={_l('搜索组织角色')}
            className="Font14"
            value={keywords}
            onChange={e => {
              this.setState({ keywords: e.target.value });
            }}
            onKeyDown={event => {
              event.which === 13 && this.handleSearch();
            }}
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
              <span>{item.organizeName}</span>
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
      this.setState({ selectedOrgRole: !unique ? copySelectedOrgRole : [item] });
    } else {
      this.setState({ selectedOrgRole: selectedOrgRole.filter(it => it.organizeId !== item.organizeId) });
    }
  };

  renderChildren = groupItem => {
    const { expendTreeNodeKey, selectedOrgRole, keywords, searchList } = this.state;
    const selectedOrgRoleIds = selectedOrgRole.map(item => item.organizeId);

    if (groupItem && !expendTreeNodeKey.includes(groupItem.orgRoleGroupId)) return;

    return (groupItem ? groupItem.children : searchList).map(roleItem => {
      return (
        <div className="flexRow orgRoleItem" key={roleItem.organizeId} onClick={() => this.checkOrgRoles(roleItem)}>
          <Checkbox
            checked={_.includes(selectedOrgRoleIds, roleItem.organizeId)}
            onClick={() => this.checkOrgRoles(roleItem)}
          ></Checkbox>
          <div className="flex organizeName ellipsis Gray">{roleItem.organizeName}</div>
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
        <div className="emptyWrap">
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

    return (
      <ScrollView className="flex orgRolelist" onScrollEnd={this.onScrollEnd}>
        {!keywords &&
          treeData.map(groupItem => {
            if (groupItem.orgRoleGroupId === '' && !groupItem.children.length) return null;

            return (
              <Fragment key={`mobile-role-fragment-${groupItem.orgRoleGroupId}`}>
                <div
                  className="groupItem GrayBGF8 Hand ellipsis"
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
    const { visible, onClose } = this.props;
    return (
      <Popup visible={visible} onClose={onClose} className="mobileModal full">
        <div className="selectUserModal flexColumn h100">
          {this.renderContent()}
          <div className="flexRow WhiteBG pAll10">
            <Button className="flex mLeft6 mRight6 Gray_75 bold Font14" onClick={onClose}>
              {_l('取消')}
            </Button>
            <Button className="flex mLeft6 mRight6 bold Font14" onClick={this.handleSave} color="primary">
              {_l('确定')}
            </Button>
          </div>
        </div>
      </Popup>
    );
  }
}
export const selectOrgRole = props => functionWrap(SelectOrgRole, { ...props });

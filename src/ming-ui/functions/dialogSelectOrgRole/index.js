import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Checkbox, Input, Modal, Radio } from 'ming-ui/antd-components';
import organizeAjax from 'src/api/organize';
import './index.less';

class DialogSelectOrgRole extends Component {
  static defaultProps = {
    projectId: '',
    showCompanyName: false,
    showCurrentOrgRole: false,
    unique: false,
  };

  state = {
    selectData: [],
    loading: true,
    keywords: '',
    pageIndex: 1,
    isMore: false,
    treeData: [],
    expendTreeNodeKey: [],
    searchList: [],
  };

  promise = null;

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
        this.fetchData(groups, groups[0].orgRoleGroupId);
      });
  }

  fetchData(groups, orgRoleGroupId, index) {
    const { projectId, appointedOrganizeIds = [] } = this.props;
    const { keywords, pageIndex = 1, treeData, searchList } = this.state;
    let treeList = groups || treeData;
    const fetchPageIndex = index || pageIndex;

    let isShowRole =
      !md.global.Account.isPortal &&
      (md.global.Account.projects || []).some(it => it.projectId === this.props.projectId);

    if (!isShowRole) {
      this.setState({ loading: false });
      return;
    }

    this.setState({ isMore: false });
    if (this.promise && this.promise.abort) {
      this.promise.abort();
    }

    this.promise = organizeAjax.getOrganizes({
      keywords,
      projectId,
      pageIndex: fetchPageIndex,
      pageSize: keywords ? 50 : 500,
      appointedOrganizeIds,
      orgRoleGroupId,
    });
    this.promise
      .then(result => {
        if (keywords) {
          let list = fetchPageIndex === 1 ? result.list : searchList.concat(result.list);
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
          treeData: treeList,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  toggle(item, checked) {
    const { unique } = this.props;
    let selectData = _.cloneDeep(this.state.selectData);

    if (!checked) {
      _.remove(selectData, o => o.organizeId === item.organizeId);
    } else {
      selectData = unique ? [item] : selectData.concat(item);
    }

    this.setState({ selectData });
  }

  onScrollEnd = () => {
    const { keywords, isMore, loading } = this.state;

    if (!keywords || loading || !isMore) return;

    this.setState({ pageIndex: this.state.pageIndex + 1 }, () => {
      this.fetchData();
    });
  };

  handleExpend = groupItem => {
    const { expendTreeNodeKey } = this.state;
    const { orgRoleGroupId, fetched } = groupItem;

    if (expendTreeNodeKey.includes(orgRoleGroupId)) {
      this.setState({ expendTreeNodeKey: expendTreeNodeKey.filter(l => l !== orgRoleGroupId) });
      return;
    }

    if (!fetched) {
      this.fetchData(undefined, orgRoleGroupId);
    }

    this.setState({ expendTreeNodeKey: expendTreeNodeKey.concat([orgRoleGroupId]) });
  };

  onRemove = item => {
    const { selectData } = this.state;

    this.setState({
      selectData: selectData.filter(l => l.organizeId !== item.organizeId),
    });
  };

  renderChildren(groupItem) {
    const { expendTreeNodeKey, selectData, keywords, searchList, treeData } = this.state;
    const { unique, appointedOrganizeIds = [] } = this.props;

    if (groupItem && !expendTreeNodeKey.includes(groupItem.orgRoleGroupId)) return;

    const list = treeData.filter(l => l.orgRoleGroupId !== '' || l.children.length);
    const onlyOneGroup = list.length === 1 && (list[0].orgRoleGroupId === '' || appointedOrganizeIds.length);

    return (groupItem ? groupItem.children : searchList).map(roleItem => {
      const checked = !!_.find(selectData, o => o.organizeId === roleItem.organizeId);
      return (
        <div
          key={`roleItem-${roleItem.organizeId}-${roleItem.orgRoleGroupId}`}
          className="roleItem Hand"
          onClick={() => this.toggle(roleItem, !checked)}
        >
          {unique ? (
            <Radio
              className={cx('mRight0', {
                mLeft14: !keywords && !onlyOneGroup,
              })}
              checked={checked}
              title={null}
            >
              {null}
            </Radio>
          ) : (
            <Checkbox
              className={cx('GSelect-department-row pointer', {
                mLeft14: !keywords && !onlyOneGroup,
              })}
              checked={checked}
            >
              {null}
            </Checkbox>
          )}
          <span className="mLeft10 flex overflow_ellipsis">{roleItem.organizeName}</span>
        </div>
      );
    });
  }

  renderContent() {
    const { loading, keywords, treeData, expendTreeNodeKey, searchList } = this.state;
    const { appointedOrganizeIds = [] } = this.props;

    if (loading) {
      return <LoadDiv />;
    }

    if (
      !treeData.length ||
      (treeData.length === 1 && treeData[0].orgRoleGroupId === '' && !treeData[0].children.length)
    ) {
      return (
        <div className="emptyWrap">
          <p className="textDisabled Font14">{_l('没有可选组织角色')}</p>
        </div>
      );
    }

    if (keywords && !searchList.length) {
      return (
        <div className="GSelect-NoData">
          <i className="icon-search GSelect-iconNoData" />
          <p className="GSelect-noDataText textDisabled">{_l('搜索无结果')}</p>
        </div>
      );
    }

    const list = treeData.filter(l => l.orgRoleGroupId !== '' || l.children.length);

    return (
      <ScrollView className="h100" onScrollEnd={this.onScrollEnd}>
        {!keywords &&
          list.map(groupItem => {
            return (
              <Fragment key={`fragment-${groupItem.orgRoleGroupId}`}>
                {list.length === 1 && (groupItem.orgRoleGroupId === '' || appointedOrganizeIds.length) ? null : (
                  <div
                    className="groupItem roleItem"
                    key={`groupItem-${groupItem.orgRoleGroupId}`}
                    onClick={() => this.handleExpend(groupItem)}
                  >
                    <Icon
                      icon="task_custom_btn_unfold"
                      className={cx('textTertiary expendIcon Hand InlineBlock', {
                        iconRotate: !expendTreeNodeKey.includes(groupItem.orgRoleGroupId),
                      })}
                    />
                    <span className="bold flex overflow_ellipsis mLeft4">{groupItem.orgRoleGroupName}</span>
                  </div>
                )}
                {this.renderChildren(groupItem)}
                {groupItem.hasMore && (
                  <div
                    className="roleItem Hand valignWrapper colorPrimary"
                    onClick={() => this.fetchData(undefined, groupItem.orgRoleGroupId, groupItem.pageIndex + 1)}
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
  }

  renderResult() {
    const { selectData } = this.state;

    return selectData.map((item, i) => {
      return (
        <div className="GSelect-result-subItem" key={`subItem-${i}`}>
          <div className="GSelect-result-subItem__name overflow_ellipsis">{item.organizeName}</div>
          <div className="GSelect-result-subItem__remove" onClick={() => this.onRemove(item)}>
            <span className="icon-close"></span>
          </div>
        </div>
      );
    });
  }

  getCurrentUserOrgRoleChecked() {
    return !!this.state.selectData.filter(item => item.organizeId === 'user-role').length;
  }

  handleSearch = evt => {
    if (!evt.target.value) {
      this.setState({ keywords: '', searchList: [], pageIndex: 1 });
      return;
    }

    this.setState({ keywords: evt.target.value, loading: true, pageIndex: 1, searchList: [] }, () => {
      this.searchRequest = _.debounce(this.fetchData, 200);
      this.searchRequest();
    });
  };

  render() {
    const { projectId, showCompanyName } = this.props;
    const { keywords } = this.state;
    let isShowRole =
      !md.global.Account.isPortal && (md.global.Account.projects || []).some(it => it.projectId === projectId);

    return (
      <div className="selectJobContainer">
        <Input
          allowClear
          placeholder={_l('搜索组织角色')}
          prefix={<Icon icon="search" className="textTertiary Font20" />}
          value={keywords}
          onChange={this.handleSearch}
        />
        {isShowRole && this.props.showCurrentOrgRole && (
          <div className="mTop24 Font13 overflow_ellipsis Hand pBottom10 pLeft5">
            {this.props.unique ? (
              <Radio
                className="GSelect-department--checkbox mRight0"
                checked={this.getCurrentUserOrgRoleChecked()}
                onChange={event =>
                  this.toggle(
                    {
                      organizeId: 'user-role',
                      organizeName: _l('当前用户所在的组织角色'),
                    },
                    event.target.checked,
                  )
                }
                title={_l('当前用户所在的组织角色')}
              >
                {_l('当前用户所在的组织角色')}
              </Radio>
            ) : (
              <Checkbox
                className="GSelect-department--checkbox"
                checked={this.getCurrentUserOrgRoleChecked()}
                onChange={event =>
                  this.toggle(
                    { organizeId: 'user-role', organizeName: _l('当前用户所在的组织角色') },
                    event.target.checked,
                  )
                }
              >
                {_l('当前用户所在的组织角色')}
              </Checkbox>
            )}
          </div>
        )}
        {showCompanyName && (
          <div className="mTop12 Font13 overflow_ellipsis pLeft5">
            {(_.find(md.global.Account.projects, o => o.projectId === projectId) || {}).companyName}
          </div>
        )}
        <div className="selectJobContent">{this.renderContent()}</div>
        <div className="GSelect-result-box selectResultCon">{this.renderResult()}</div>
      </div>
    );
  }
}

export function dialogSelectOrgRole(options = {}) {
  let modal;
  const dialogRef = React.createRef();
  const handlePopState = () => modal.destroy();

  modal = Modal.info({
    afterClose: () => window.removeEventListener('popstate', handlePopState),
    centered: true,
    className: 'dialogSelectOrgRole',
    content: <DialogSelectOrgRole {...options} ref={dialogRef} />,
    mask: { closable: options.overlayClosable !== false },
    okCancel: true,
    onCancel: () => {
      if (_.isFunction(options.onClose)) {
        options.onClose();
      }
    },
    onOk: () => {
      if (_.isFunction(options.onSave)) {
        options.onSave(dialogRef.current.state.selectData);
      }

      if (_.isFunction(options.onClose)) {
        options.onClose();
      }
    },
    title: _l('选择组织角色'),
    width: 480,
    zIndex: options.zIndex,
  });

  window.addEventListener('popstate', handlePopState);

  return modal;
}

export default dialogSelectOrgRole;

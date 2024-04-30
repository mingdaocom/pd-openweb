import React, { Component, Fragment } from 'react';
import organizeAjax from 'src/api/organize';
import { Dialog, LoadDiv, Checkbox, ScrollView, Radio, FunctionWrap, Icon } from 'ming-ui';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

class DialogSelectOrgRole extends Component {
  static defaultProps = {
    projectId: '',
    showCompanyName: false,
    orgRoleDialogVisible: false,
    showCurrentOrgRole: false,
    unique: false,
    onSave: () => {},
    onClose: () => {},
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

  fetchData(groups, orgRoleGroupId) {
    const { projectId, appointedOrganizeIds = [] } = this.props;
    const { keywords, pageIndex = 1, treeData, searchList } = this.state;
    let treeList = groups || treeData;

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
      pageIndex,
      pageSize: keywords ? 50 : 500,
      appointedOrganizeIds,
      orgRoleGroupId,
    });
    this.promise
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
          treeData: treeList,
          loading: false,
        });
      })
      .catch(error => {
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
              text={null}
            />
          ) : (
            <Checkbox
              className={cx('GSelect-department-row pointer', {
                mLeft14: !keywords && !onlyOneGroup,
              })}
              checked={checked}
              text={null}
            />
          )}
          <Icon icon="person_new" className="Gray_9e Font18" />
          <span className="mLeft4 flex overflow_ellipsis">{roleItem.organizeName}</span>
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
          <p className="Gray_bd Font14">{_l('没有可选组织角色')}</p>
        </div>
      );
    }

    if (keywords && !searchList.length) {
      return (
        <div className="GSelect-NoData">
          <i className="icon-search GSelect-iconNoData" />
          <p className="GSelect-noDataText Gray_bd">{_l('搜索无结果')}</p>
        </div>
      );
    }

    const list = treeData.filter(l => l.orgRoleGroupId !== '' || l.children.length);

    return (
      <ScrollView onScrollEnd={this.onScrollEnd}>
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
                      className={cx('Gray_9e expendIcon Hand InlineBlock', {
                        rotate: !expendTreeNodeKey.includes(groupItem.orgRoleGroupId),
                      })}
                    />
                    <span className="bold flex overflow_ellipsis mLeft4">{groupItem.orgRoleGroupName}</span>
                  </div>
                )}
                {this.renderChildren(groupItem)}
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
          <div className="GSelect-result-subItem__avatar">
            <i className="icon-person_new Gray_9e" />
          </div>
          <div className="GSelect-result-subItem__name overflow_ellipsis">{item.organizeName}</div>
          <div class="GSelect-result-subItem__remove" onClick={() => this.onRemove(item)}>
            <span class="icon-close"></span>
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
    const { onClose, projectId, onSave, showCompanyName, orgRoleDialogVisible, overlayClosable } = this.props;
    const { keywords, selectData } = this.state;
    let isShowRole =
      !md.global.Account.isPortal && (md.global.Account.projects || []).some(it => it.projectId === projectId);

    return (
      <Dialog
        visible={orgRoleDialogVisible}
        title={_l('选择组织角色')}
        className="dialogSelectOrgRole"
        width={480}
        type="scroll"
        onCancel={onClose}
        overlayClosable={overlayClosable}
        onOk={() => {
          onSave(selectData);
          onClose();
        }}
      >
        <div className="selectJobContainer">
          <div className="selectJobContainer_search pLeft5">
            <span className="searchIcon icon-search" />
            <input
              type="text"
              className="searchInput"
              placeholder={_l('搜索组织角色')}
              value={keywords}
              onChange={this.handleSearch}
            />
            <span
              className={cx('searchClose icon-closeelement-bg-circle', { Block: !!keywords.trim() })}
              onClick={() => this.setState({ keywords: '', searchList: [], pageIndex: 1 })}
            />
          </div>
          {isShowRole && this.props.showCurrentOrgRole && (
            <div className="mTop24 Font13 overflow_ellipsis Hand pBottom10 pLeft5">
              {this.props.unique ? (
                <Radio
                  className="GSelect-department--checkbox mRight0"
                  checked={this.getCurrentUserOrgRoleChecked()}
                  text={_l('当前用户所在的组织角色')}
                  onClick={checked =>
                    this.toggle(
                      {
                        organizeId: 'user-role',
                        organizeName: _l('当前用户所在的组织角色'),
                      },
                      !checked,
                    )
                  }
                />
              ) : (
                <Checkbox
                  className="GSelect-department--checkbox"
                  checked={this.getCurrentUserOrgRoleChecked()}
                  text={_l('当前用户所在的组织角色')}
                  onClick={checked =>
                    this.toggle(
                      {
                        organizeId: 'user-role',
                        organizeName: _l('当前用户所在的组织角色'),
                      },
                      !checked,
                    )
                  }
                />
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
      </Dialog>
    );
  }
}

export default props => FunctionWrap(DialogSelectOrgRole, { ...props, visibleName: 'orgRoleDialogVisible' });

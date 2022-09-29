import React, { Component } from 'react';
import { getOrganizes } from 'src/api/organize';
import { Dialog, LoadDiv, Checkbox, ScrollView, Radio } from 'ming-ui';
import cx from 'classnames';
import './index.less';

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
    data: [],
    selectData: [],
    loading: true,
    keywords: '',
    pageIndex: 1,
    isMore: false,
  };

  promise = null;

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const { projectId } = this.props;
    const { keywords, data = [], pageIndex = 1 } = this.state;
    let isShowRole =
      !md.global.Account.isPortal &&
      (md.global.Account.projects || []).some(it => it.projectId === this.props.projectId);
    if (!isShowRole) {
      this.setState({ loading: false });
      return;
    }
    this.setState({ isMore: false });
    if (this.promise && this.promise.state() === 'pending' && this.promise.abort) {
      this.promise.abort();
    }
    this.promise = getOrganizes({ keywords, projectId, pageIndex, pageSize: 10 });
    this.promise
      .then(result => {
        let list = pageIndex > 1 ? data.concat(result.list) : result.list;
        this.setState({ data: list, loading: false, isMore: result.list && result.list.length >= 10 });
      })
      .fail(error => {
        this.setState({ loading: false });
      });
  }

  toggle(item, checked) {
    const { unique } = this.props;
    let selectData = [].concat(this.state.selectData);
    if (unique) {
      if (checked) {
        _.remove(selectData, o => o.organizeId === item.organizeId);
      } else {
        selectData = [item];
      }
    } else {
      if (!checked) {
        _.remove(selectData, o => o.organizeId === item.organizeId);
      } else {
        selectData = selectData.concat(item);
      }
    }

    this.setState({ selectData });
  }
  onScrollEnd = () => {
    let { isMore, loading } = this.state;
    if (loading || !isMore) return;
    this.setState({ pageIndex: this.state.pageIndex + 1 }, () => {
      this.fetchData();
    });
  };
  renderContent() {
    const { loading, data = [], keywords, selectData } = this.state;
    const { unique } = this.props;

    if (loading) {
      return <LoadDiv />;
    }

    if (!data.length) {
      return (
        <div className="GSelect-NoData">
          <i className="icon-search GSelect-iconNoData" />
          <p className="GSelect-noDataText">{keywords ? _l('搜索无结果') : _l('无结果')}</p>
        </div>
      );
    }
    if (unique) {
      return (
        <ScrollView onScrollEnd={this.onScrollEnd}>
          {data.map((item, i) => {
            return (
              <div className="roleItem pointer ellipsis" key={i} onClick={checked => this.toggle(item, !checked)}>
                <Radio checked={!!_.find(selectData, o => o.organizeId === item.organizeId)}>{item.organizeName}</Radio>
              </div>
            );
          })}
        </ScrollView>
      );
    }
    return (
      <ScrollView onScrollEnd={this.onScrollEnd}>
        {data.map((item, i) => {
          return (
            <Checkbox
              key={i}
              className="GSelect-department-row pointer"
              style={{ padding: '9px 5px' }}
              checked={!!_.find(selectData, o => o.organizeId === item.organizeId)}
              onClick={checked => this.toggle(item, !checked)}
              text={item.organizeName}
            />
          );
        })}
      </ScrollView>
    );
  }

  renderResult() {
    const { selectData } = this.state;

    return selectData.map((item, i) => {
      return (
        <div className="GSelect-result-subItem" key={`subItem-${i}`}>
          <div className="GSelect-result-subItem__avatar" style={{ backgroundColor: '#FFAD00' }}>
            <i className="icon-user" />
          </div>
          <div className="GSelect-result-subItem__name overflow_ellipsis">{item.organizeName}</div>
          <div className="GSelect-result-subItem__remove icon-minus" onClick={() => this.toggle(item, false)} />
        </div>
      );
    });
  }

  getCurrentUserOrgRoleChecked() {
    return !!this.state.selectData.filter(item => item.organizeId === 'user-role').length;
  }

  render() {
    const { onClose, projectId, onSave, showCompanyName, orgRoleDialogVisible } = this.props;
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
              onChange={evt => {
                this.setState({ keywords: evt.target.value, loading: true, pageIndex: 1, data: [] }, () => {
                  this.searchRequst = _.throttle(this.fetchData, 200);
                  this.searchRequst();
                });
              }}
            />
            <span
              className={cx('searchClose icon-closeelement-bg-circle', { Block: !!keywords.trim() })}
              onClick={() => this.setState({ keywords: '' })}
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
                      checked,
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
          <div className="GSelect-result-box">{this.renderResult()}</div>
        </div>
      </Dialog>
    );
  }
}

export default DialogSelectOrgRole;

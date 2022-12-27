import React, { Component } from 'react';
import JobController from 'src/api/job';
import { Dialog, LoadDiv, Checkbox, ScrollView, FunctionWrap } from 'ming-ui';
import cx from 'classnames';
import './style.less';
import _ from 'lodash';

class DialogSelectJob extends Component {
  static defaultProps = {
    projectId: '',
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
    this.setState({ isMore: false });
    if (this.promise && this.promise.state() === 'pending' && this.promise.abort) {
      this.promise.abort();
    }
    this.promise = JobController.getJobs({ keywords, projectId, pageIndex, pageSize: 10 });
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

    if (!checked) {
      _.remove(selectData, o => o.jobId === item.jobId);
    } else {
      if (unique) {
        selectData = [item];
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
    return (
      <ScrollView onScrollEnd={this.onScrollEnd}>
        {data.map((item, i) => {
          return (
            <Checkbox
              key={i}
              className="GSelect-department-row pointer"
              style={{ padding: '9px 5px' }}
              checked={!!_.find(selectData, o => o.jobId === item.jobId)}
              onClick={checked => this.toggle(item, !checked)}
              text={item.jobName}
            />
          );
        })}
      </ScrollView>
    );
  }

  renderResult() {
    const { selectData } = this.state;
    const { isAppRole } = this.props;

    return selectData.map((item, i) => {
      return (
        <div className="GSelect-result-subItem" key={`subItem-${i}`}>
          <div
            className="GSelect-result-subItem__avatar"
            style={isAppRole ? { background: 'unset', color: '#9e9e9e' } : {}}
          >
            <i className="icon-limit-principal" />
          </div>
          <div className="GSelect-result-subItem__name overflow_ellipsis">{item.jobName}</div>
          <div className="GSelect-result-subItem__remove" onClick={() => this.toggle(item, false)}>
            <span className="icon-close" />
          </div>
        </div>
      );
    });
  }

  render() {
    const { onClose, projectId, onSave, showCompanyName, overlayClosable, visible } = this.props;
    const { keywords, selectData } = this.state;

    return (
      <Dialog
        visible={visible}
        title={_l('选择职位')}
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
          <div className="selectJobContainer_search">
            <span className="searchIcon icon-search" />
            <input
              type="text"
              className="searchInput"
              placeholder={_l('搜索职位')}
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
          {showCompanyName && (
            <div className="mTop12 Font13 overflow_ellipsis">
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

export default DialogSelectJob;

export const selectJob = props => FunctionWrap(DialogSelectJob, { ...props });

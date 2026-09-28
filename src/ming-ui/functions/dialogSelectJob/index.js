import React, { Component } from 'react';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Checkbox, Input, Modal } from 'ming-ui/antd-components';
import JobController from 'src/api/job';
import './style.less';

class DialogSelectJob extends Component {
  static defaultProps = {
    projectId: '',
    unique: false,
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
    if (this.promise && this.promise.abort) {
      this.promise.abort();
    }

    this.promise = JobController.getJobs({ keywords, projectId, pageIndex, pageSize: 10 });
    this.promise
      .then(result => {
        let list = pageIndex > 1 ? data.concat(result.list) : result.list;
        this.setState({ data: list, loading: false, isMore: result.list && result.list.length >= 10 });
      })
      .catch(() => {
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
      <ScrollView className="h100" onScrollEnd={this.onScrollEnd}>
        {data.map((item, i) => {
          return (
            <Checkbox
              key={i}
              className="GSelect-department-row w100 pointer"
              style={{ padding: '9px 5px' }}
              checked={!!_.find(selectData, o => o.jobId === item.jobId)}
              onChange={event => this.toggle(item, event.target.checked)}
            >
              {item.jobName}
            </Checkbox>
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
            style={isAppRole ? { background: 'unset', color: 'var(--color-text-tertiary)' } : {}}
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
    const { projectId, showCompanyName } = this.props;
    const { keywords } = this.state;

    return (
      <div className="selectJobContainer">
        <Input
          allowClear
          placeholder={_l('搜索职位')}
          prefix={<Icon icon="search" className="textTertiary Font20" />}
          value={keywords}
          onChange={evt => {
            this.setState({ keywords: evt.target.value, loading: true, pageIndex: 1, data: [] }, () => {
              this.searchRequst = _.throttle(this.fetchData, 200);
              this.searchRequst();
            });
          }}
        />
        {showCompanyName && (
          <div className="mTop12 Font13 overflow_ellipsis">
            {(_.find(md.global.Account.projects, o => o.projectId === projectId) || {}).companyName}
          </div>
        )}
        <div className="selectJobContent">{this.renderContent()}</div>
        <div className="GSelect-result-box">{this.renderResult()}</div>
      </div>
    );
  }
}

export function dialogSelectJob(options = {}) {
  let modal;
  const dialogRef = React.createRef();
  const handlePopState = () => modal.destroy();

  modal = Modal.info({
    afterClose: () => window.removeEventListener('popstate', handlePopState),
    centered: true,
    content: <DialogSelectJob {...options} ref={dialogRef} />,
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
    title: _l('选择职位'),
    width: 480,
    zIndex: options.zIndex,
  });

  window.addEventListener('popstate', handlePopState);

  return modal;
}

export default dialogSelectJob;

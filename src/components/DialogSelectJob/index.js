import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import JobController from 'src/api/job';
import { Dialog, LoadDiv, Checkbox, ScrollView } from 'ming-ui';
import cx from 'classnames';
import './style.less';

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
    loading: false,
    keywords: '',
  };

  promise = null;

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const { projectId } = this.props;
    const { keywords } = this.state;

    this.setState({ loading: true });

    if (this.promise && this.promise.state() === 'pending') {
      this.promise.abort();
    }

    this.promise = JobController.getJobs({ keywords, projectId, pageIndex: 1, pageSize: 1000 })
      .then(result => {
        this.setState({ data: result.list, loading: false });
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

  renderContent() {
    const { loading, data, keywords, selectData } = this.state;
    const filterData = _.filter(data, item => item.jobName.indexOf(keywords) > -1);

    if (loading) {
      return <LoadDiv />;
    }

    if (!filterData.length) {
      return (
        <div className="GSelect-NoData">
          <i className="icon-search GSelect-iconNoData" />
          <p className="GSelect-noDataText">{keywords ? _l('搜索无结果') : _l('无结果')}</p>
        </div>
      );
    }

    return (
      <ScrollView>
        {filterData.map((item, i) => {
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

    return selectData.map((item, i) => {
      return (
        <div className="GSelect-result-subItem" key={`subItem-${i}`}>
          <div className="GSelect-result-subItem__avatar">
            <i className="icon-limit-principal" />
          </div>
          <div className="GSelect-result-subItem__name overflow_ellipsis">{item.jobName}</div>
          <div className="GSelect-result-subItem__remove icon-minus" onClick={() => this.toggle(item, false)} />
        </div>
      );
    });
  }

  render() {
    const { onClose, projectId, onSave } = this.props;
    const { keywords, selectData } = this.state;

    return (
      <Dialog
        visible
        title={_l('选择职位')}
        width={480}
        type="scroll"
        onCancel={onClose}
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
              onChange={evt => this.setState({ keywords: evt.target.value })}
            />
            <span className={cx('searchClose icon-closeelement-bg-circle', { Block: !!keywords.trim() })} onClick={() => this.setState({ keywords: '' })} />
          </div>
          <div className="mTop12 Font13 overflow_ellipsis">{(_.find(md.global.Account.projects, o => o.projectId === projectId) || {}).companyName}</div>
          <div className="selectJobContent">{this.renderContent()}</div>
          <div className="GSelect-result-box">{this.renderResult()}</div>
        </div>
      </Dialog>
    );
  }
}

export default function initDialogSelectJob(props) {
  const $container = document.createElement('div');
  document.body.appendChild($container);

  function handleClose() {
    setTimeout(() => {
      const isHaveComponent = ReactDOM.unmountComponentAtNode($container);
      if (isHaveComponent && $container.parentElement) {
        $container.parentElement.removeChild($container);
      }
    }, 0);
  }

  ReactDOM.render(<DialogSelectJob onClose={handleClose} {...props} />, $container);
}

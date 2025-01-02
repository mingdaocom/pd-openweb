import React, { Component } from 'react';
import cx from 'classnames';
import { Icon, ScrollView } from 'ming-ui';
import { Popup, Button, Checkbox } from 'antd-mobile';
import jobAjax from 'src/api/job.js';
import './index.less';
import _ from 'lodash';

export default class SelectJob extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobList: [],
      isLoading: false,
      isMore: false,
    };
  }
  componentDidMount() {
    this.getData();
  }
  getData = () => {
    const { projectId } = this.props;
    let { keywords, pageIndex = 1, jobList = [] } = this.state;
    jobAjax.getJobs({
      projectId,
      keywords,
      pageIndex,
      pageSize: 20,
    }).then(res => {
      this.setState({
        jobList: pageIndex === 1 ? res.list : jobList.concat(res.list),
        pageIndex: pageIndex + 1,
        isMore: res.list.length >= 20 ? true : false,
        isLoading: false,
      });
    });
  };
  handleSearch = () => {
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
    const { selectJobs } = this.state;
    this.props.onSave(selectJobs);
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
            placeholder={_l('搜索职位')}
            className="Font14"
            value={keywords}
            onChange={e => {
              this.setState({ keywords: e.target.value });
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
    let { isMore, isLoading } = this.state;
    if (!isMore || isLoading) return;
    this.getData();
  };
  renderSelected() {
    const { selectJobs = [] } = this.state;
    return (
      <div className={cx('selectedWrapper', { hide: _.isEmpty(selectJobs) })}>
        <ScrollView style={{ maxHeight: 92, minHeight: 46 }}>
          {selectJobs.map(item => (
            <span className="selectedItem" key={item.jobId}>
              <span>{item.jobName}</span>
              <Icon
                icon="close"
                className="Gray_9e Font15"
                onClick={() => {
                  const { selectJobs } = this.state;
                  this.setState({
                    selectJobs: selectJobs.filter(it => it.jobId !== item.jobId),
                  });
                }}
              />
            </span>
          ))}
        </ScrollView>
      </div>
    );
  }
  checkJobs = item => {
    const { unique } = this.props;
    const { selectJobs = [] } = this.state;
    const selectJobsIds = selectJobs.map(item => item.jobId);
    let isSelected = _.includes(selectJobsIds, item.jobId);
    let copySelectJobs = [...selectJobs];
    if (!isSelected) {
      !unique && copySelectJobs.push(item);
      this.setState({ selectJobs: !unique ? copySelectJobs : [item] });
    } else {
      this.setState({ selectJobs: selectJobs.filter(it => it.jobId !== item.jobId) });
    }
  };
  renderList = () => {
    const { unique } = this.props;
    const { jobList = [], selectJobs = [] } = this.state;
    const selectJobsIds = selectJobs.map(item => item.jobId);
    return (
      <ScrollView className="flex jobList" onScrollEnd={this.onScrollEnd}>
        {jobList.map(item => (
          <div className="flexRow jobItem" onClick={() => this.checkJobs(item)}>
            <Checkbox
              className="mLeft10 mRight10"
              checked={_.includes(selectJobsIds, item.jobId)}
              onClick={() => this.checkJobs(item)}
            ></Checkbox>
            <div className="flex jobName ellipsis Gray">{item.jobName}</div>
          </div>
        ))}
      </ScrollView>
    );
  };
  renderContent = () => {
    return (
      <div className="flex flexColumn">
        {this.renderSearch()}
        {this.renderSelected()}
        {this.renderList()}
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

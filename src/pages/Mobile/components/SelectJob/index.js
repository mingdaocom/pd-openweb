import React, { Component } from 'react';
import cx from 'classnames';
import { Icon, ScrollView } from 'ming-ui';
import { Modal, Button, WingBlank, Checkbox } from 'antd-mobile';
import jobAjax from 'src/api/job.js';
import './index.less';
import _ from 'lodash';

const { CheckboxItem } = Checkbox;

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
            type="text"
            placeholder={_l('搜索职位')}
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
            <CheckboxItem
              checked={_.includes(selectJobsIds, item.jobId)}
              onChange={() => this.checkJobs(item)}
            ></CheckboxItem>
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
      <Modal popup visible={visible} onClose={onClose} animationType="slide-up" className="h100">
        <div className="selectUserModal flexColumn h100">
          {this.renderContent()}
          <div className="btnsWrapper flexRow">
            <WingBlank className="flex" size="sm">
              <Button className="Gray_75 bold Font14" onClick={onClose}>
                {_l('取消')}
              </Button>
            </WingBlank>
            <WingBlank className="flex" size="sm">
              <Button className="bold Font14" onClick={this.handleSave} type="primary">
                {_l('确定')}
              </Button>
            </WingBlank>
          </div>
        </div>
      </Modal>
    );
  }
}

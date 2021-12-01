import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Icon, ScrollView, LoadDiv } from 'ming-ui';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import HistoryHeader from './HistoryHeader';
import HistoryList from './HistoryList';
import HistoryDetail from './HistoryDetail';
import './index.less';
import api from '../../api/instance';
import process from '../../api/process';
import UserHead from 'src/pages/feed/components/userHead';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';

const ClickAwayable = createDecoratedComponent(withClickAway);

@withRouter
class History extends Component {
  constructor(props) {
    super(props);

    const ids = (props.match.params.actionId || '').split('_');

    this.state = {
      data: [],
      selectActionId: ids.length === 1 ? ids[0] : '',
      workId: ids.length > 1 ? ids[0] : '',
      instanceId: ids.length > 1 ? ids[1] : '',
      pageIndex: 1,
      hasMoreData: false,
      instanceData: null,
      historyVisible: false,
      historyIsLoading: false,
      historyIndex: 1,
      historyIsMore: true,
      historyList: [],
    };
  }

  pageSize = 20;
  requestPending = false;
  filterPara = {};

  componentWillMount() {
    const { instanceId } = this.state;

    this.getData();
    if (instanceId) {
      this.getInstance();
    }
  }

  getData = () => {
    const processId = this.props.flowInfo.id;
    const { pageIndex, workId, instanceId } = this.state;
    const { pageSize, filterPara } = this;

    const para = { pageIndex, processId, pageSize, workId, instanceId, ...filterPara };

    !this.requestPending &&
      api
        .getHistoryList(para)
        .then(res => {
          this.setState({
            data: pageIndex === 1 ? res : this.state.data.concat(res),
            pageIndex: pageIndex + 1,
            hasMoreData: res.length >= this.pageSize,
          });
        })
        .always(() => {
          this.requestPending = false;
        });
  };

  getInstance() {
    const { instanceId } = this.state;

    api.getInstance({ instanceId }).then(res => {
      this.setState({ instanceData: res });
    });
  }

  /**
   * 筛选条件变化
   */
  handleFilter = para => {
    this.filterPara = para;
    this.setState({ pageIndex: 1 }, () => {
      this.getData();
      this.requestPending = true;
    });
  };

  getMore = () => {
    this.getData();
    this.requestPending = true;
  };

  handleRestoreVisible = id => {
    const { flowInfo } = this.props;

    Confirm({
      title: _l('确定恢复到指定版本吗？'),
      description: _l('执行此操作后，流程将回滚到指定的发布版本。您未发布的流程修改将会被清除，此操作无法撤回'),
      okText: _l('确定恢复'),
      onOk: () => {
        process.goBack({ processId: id }).then(() => {
          location.href = `/workflowedit/${flowInfo.id}`;
        });
      },
    });
  };

  renderInstanceContent() {
    const { instanceId, instanceData } = this.state;

    if (!instanceId || instanceData === null) return null;

    return (
      <div className="instanceContent">
        <div className="instanceContentBox flexRow ellipsis Font14">
          <div className="flex bold">
            <span
              className="ThemeColor3 ThemeHoverColor2 mRight10 pointer"
              onClick={() => window.open(`/workflowedit/${instanceData.process.id}`)}
            >
              {instanceData.process.name}
            </span>
            {_l('触发了以下子流程')}
          </div>
          <Link
            className="pointer Gray_9e ThemeHoverColor3 Font16 mLeft20"
            to={`/workflowedit/${this.props.flowInfo.id}/2`}
            onClick={() => {
              this.setState({ workId: '', instanceId: '', instanceData: null }, this.handleFilter);
            }}
          >
            <i className="icon-delete" />
          </Link>
        </div>
      </div>
    );
  }

  getHistoryList = _.throttle(() => {
    const { flowInfo } = this.props;
    const { historyIsLoading, historyIndex, historyIsMore, historyList } = this.state;

    // 加载更多
    if (historyIndex > 1 && ((historyIsLoading && historyIsMore) || !historyIsMore)) {
      return;
    }

    this.setState({ historyIsLoading: true });

    process.getHistory({ processId: flowInfo.id, pageIndex: historyIndex, pageSize: 20 }).then(result => {
      this.setState({
        historyList: historyIndex === 1 ? result : historyList.concat(result),
        historyIsLoading: false,
        historyIndex: historyIndex + 1,
        historyIsMore: result.length === 20,
      });
    });
  }, 200);

  renderHistory() {
    const { flowInfo } = this.props;
    const { enabled } = flowInfo;
    const { historyIsLoading, historyIndex, historyList } = this.state;

    return (
      <ClickAwayable
        component="div"
        className="historyBox flexColumn"
        style={{ height: historyList.length * 40 + 64 }}
        onClickAwayExceptions={['.restoreWrap', '.mui-dialog-container']}
        onClickAway={() => this.setState({ historyVisible: false })}
      >
        <div className="flexRow historyReleaseItem Gray_9e noBG">
          <div className="w250">{_l('发布时间')}</div>
          <div className="flex">{_l('发布者')}</div>
        </div>
        <ScrollView className="flex" onScrollEnd={this.getHistoryList}>
          {historyList.map((item, i) => {
            return (
              <div
                className="flexRow historyReleaseItem"
                key={i}
                onClick={() => (location.href = `/workflowedit/${item.id}`)}
              >
                <div className="w250">
                  {createTimeSpan(item.date)}
                  {i === 0 && enabled && <span className="historyReleaseItemActive">{_l('运行中')}</span>}
                </div>
                <div className="flex flexRow">
                  <UserHead
                    user={{
                      userHead: item.publisher.avatar,
                      accountId: item.publisher.accountId,
                    }}
                    lazy="false"
                    size={26}
                  />
                  <div className="mLeft12 flex ellipsis">{item.publisher.fullName}</div>
                </div>
                <div className="mLeft12">
                  <span
                    data-tip={_l('恢复')}
                    className={historyList.length > 1 && i === historyList.length - 1 ? 'tip-top' : ''}
                  >
                    <Icon
                      className="Font16 Gray_9e ThemeHoverColor3 pointer"
                      icon="restore2"
                      onClick={e => {
                        e.stopPropagation();
                        this.handleRestoreVisible(item.id);
                      }}
                    />
                  </span>
                </div>
              </div>
            );
          })}
          {historyIsLoading && historyIndex > 1 && <LoadDiv className="mTop15" size="small" />}
        </ScrollView>
      </ClickAwayable>
    );
  }

  render() {
    const { flowInfo } = this.props;
    const { data, selectActionId, hasMoreData, historyVisible } = this.state;
    const { lastPublishDate, parentId, enabled } = flowInfo;

    if (selectActionId) {
      return (
        <ScrollView className="workflowHistoryWrap flex">
          <div className="workflowHistoryContentWrap">
            <HistoryDetail id={selectActionId} onClick={() => this.setState({ selectActionId: '' })} />
          </div>
        </ScrollView>
      );
    }

    return (
      <ScrollView className="workflowHistoryWrap flex">
        <div className="lastPublishInfo">
          <div className="flex Gray">
            {!parentId && !lastPublishDate
              ? _l('待流程发布后，在此处查看流程的运行历史')
              : _l('可查看最近一年内的流程运行记录')}
          </div>
          {parentId ? (
            <div>
              {_l('只展示该发布版本的流程历史')}
              <span
                className="ThemeColor3 ThemeHoverColor2 mLeft10 pointer"
                onClick={() => (location.href = `/workflowedit/${parentId}`)}
              >
                {_l('打开当前流程')}
              </span>
            </div>
          ) : lastPublishDate ? (
            <Fragment>
              {enabled && <div>{_l('当前运行中流程发布于: %0', createTimeSpan(lastPublishDate))}</div>}
              <div
                className="restoreWrap ThemeHoverColor3 relative"
                onClick={evt => {
                  if (evt.target.className.indexOf('restoreWrap') > -1) {
                    if (historyVisible) {
                      this.setState({ historyVisible: false });
                    } else {
                      this.setState(
                        { historyVisible: true, historyIndex: 1, historyIsMore: true, historyList: [] },
                        this.getHistoryList,
                      );
                    }
                  }
                }}
              >
                {_l('历史版本')}
                {historyVisible && this.renderHistory()}
              </div>
            </Fragment>
          ) : null}
        </div>

        <div className="workflowHistoryContentWrap">
          {this.renderInstanceContent()}
          <HistoryHeader onFilter={this.handleFilter} />
          <HistoryList
            data={data}
            updateSource={(item, index) => {
              const newData = [].concat(data);
              newData[index] = item;
              this.setState({ data: newData });
            }}
            getMore={this.getMore}
            hasMoreData={hasMoreData}
            onClick={selectActionId => this.setState({ selectActionId })}
          />
        </div>
      </ScrollView>
    );
  }
}

export default connect(state => state.workflow)(History);

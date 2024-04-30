import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Icon, ScrollView, LoadDiv, Dialog, Dropdown, UserHead } from 'ming-ui';
import HistoryHeader from './HistoryHeader';
import HistoryList from './HistoryList';
import HistoryDetail from './HistoryDetail';
import './index.less';
import api from '../../api/instance';
import process from '../../api/process';
import processVersion from '../../api/processVersion';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { FLOW_STATUS } from './config';
import DateRangePicker from 'ming-ui/components/NewDateTimePicker/date-time-range';
import _ from 'lodash';
import moment from 'moment';
import Detail from '../Detail';
import ArchivedList from '../../components/ArchivedList';

const ClickAwayable = createDecoratedComponent(withClickAway);

@withRouter
class History extends Component {
  constructor(props) {
    super(props);

    const { operator, operatorId } = props.match.params;
    let ids = [];

    if (!_.includes(['execHistory', 'subprocessHistory'], operator)) {
      ids = [operator];
    } else if (operator === 'subprocessHistory') {
      ids = (operatorId || '').split('_');
    }

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
      showFilter: false,
      filters: {},
      accumulation: {},
      requestPending: false,
      batchIds: [],
      selectNodeObj: {},
      archivedId: '',
    };
  }

  pageSize = 20;
  filterPara = {};

  componentWillMount() {
    const { instanceId } = this.state;

    this.getData();
    this.getProcessAccumulation();
    instanceId && this.getInstance();
  }

  getData = (callback = () => {}) => {
    const processId = this.props.flowInfo.id;
    const { pageIndex, workId, instanceId, filters, requestPending, archivedId } = this.state;
    const { pageSize, filterPara } = this;
    let para = { pageIndex, processId, pageSize, workId, instanceId, archivedId, ...filterPara };

    if (_.isEmpty(filters) && !para.startDate) {
      para.startDate = moment().add(-6, 'M').format('YYYY/MM/DD HH:mm');
    }

    if (archivedId) {
      para.startDate = undefined;
    }

    if (requestPending) return;

    this.setState({ requestPending: true });

    api
      .getHistoryList(para, { isIntegration: location.href.indexOf('integration') > -1 })
      .then(res => {
        this.setState({
          data: pageIndex === 1 ? res : this.state.data.concat(res),
          pageIndex: pageIndex + 1,
          hasMoreData: res.length >= this.pageSize,
        });
        callback();
      })
      .finally(() => {
        this.setState({ requestPending: false });
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
    this.setState({ pageIndex: 1, batchIds: [] }, () => {
      this.getData();
    });
  };

  getMore = () => {
    this.getData();
  };

  handleRestoreVisible = id => {
    const { flowInfo } = this.props;

    Dialog.confirm({
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
    const { enabled, companyId } = flowInfo;
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
                    projectId={companyId}
                    user={{
                      userHead: item.publisher.avatar,
                      accountId: item.publisher.accountId,
                    }}
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

  formatData = data => {
    return Object.keys(data).map(key => ({ ...data[key], value: key }));
  };

  renderTimePlaceholder = () => {
    const { filters } = this.state;
    const [startTime, endTime] = (filters.time || []).map(item => item && moment(item).format('YYYY/MM/DD HH:mm'));
    if (!startTime && !endTime) return <span className="placeholder">{_l('最大跨度180天')}</span>;
    return `${startTime} ~ ${endTime}`;
  };

  /**
   * 获取流程堆积量
   */
  getProcessAccumulation() {
    const { flowInfo } = this.props;

    processVersion.getDifferenceByProcessId({ processId: flowInfo.id }).then(accumulation => {
      this.setState({ accumulation });
    });
  }

  /**
   * 立即恢复
   */
  onRecovery = (waiting, hours) => {
    const { flowInfo } = this.props;

    processVersion.updateWaiting({ processId: flowInfo.id, waiting, hours }).then(() => {
      this.getProcessAccumulation();
    });
  };

  render() {
    const { flowInfo } = this.props;
    const {
      data,
      selectActionId,
      hasMoreData,
      historyVisible,
      showFilter,
      filters,
      accumulation,
      requestPending,
      batchIds,
      selectNodeObj,
    } = this.state;
    const { lastPublishDate, parentId, enabled } = flowInfo;
    const isMoreHistory = !_.isEmpty(filters) && !showFilter;
    const detailProps = {
      processId: selectNodeObj.processId,
      selectNodeId: selectNodeObj.selectNodeId,
      selectNodeType: selectNodeObj.selectNodeType,
      debugEvents: selectNodeObj.debugEvents,
      instanceId: selectActionId,
      closeDetail: () => this.setState({ selectNodeObj: {} }),
    };

    if (selectActionId) {
      return (
        <Fragment>
          <ScrollView className="workflowHistoryWrap flex">
            <div className="workflowHistoryContentWrap">
              <HistoryDetail
                id={selectActionId}
                onClick={() => this.setState({ selectActionId: '' })}
                openNodeDetail={selectNodeObj => this.setState({ selectNodeObj })}
              />
            </div>
          </ScrollView>

          <Detail {...detailProps} />
        </Fragment>
      );
    }

    return (
      <ScrollView className="workflowHistoryWrap flex">
        <div className="lastPublishInfo">
          <div className="flex Gray">
            {!parentId && !lastPublishDate ? (
              _l('待流程发布后，在此处查看流程的运行历史')
            ) : isMoreHistory ? (
              <Fragment>
                {_l('流程状态：')}
                <span
                  className="pointer ThemeHoverColor3"
                  onClick={() => {
                    this.setState({ showFilter: true });
                  }}
                >
                  {FLOW_STATUS[filters.status].text}
                </span>
                <span className="mLeft15">{_l('筛选时间：')}</span>
                <span
                  className="pointer ThemeHoverColor3"
                  onClick={() => {
                    this.setState({ showFilter: true });
                  }}
                >
                  {this.renderTimePlaceholder()}
                </span>

                <span
                  className="mLeft15 pointer ThemeColor3 ThemeHoverColor2"
                  onClick={() => {
                    this.setState({ filters: {} });
                    this.handleFilter({});
                  }}
                >
                  {_l('清除筛选')}
                </span>
              </Fragment>
            ) : (
              <Fragment>
                {_l('默认查看最近半年内的流程运行记录')}
                <span
                  className="mLeft10 ThemeColor3 ThemeHoverColor2 pointer"
                  onClick={() => {
                    this.setState({ showFilter: true });
                  }}
                >
                  {_l('查看更早')}
                </span>
                <ArchivedList
                  className="mLeft10 ThemeColor3 ThemeHoverColor2"
                  hideIcon
                  onChange={archivedId => this.setState({ archivedId, pageIndex: 1 }, this.getData)}
                />
              </Fragment>
            )}
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
          <HistoryHeader
            processId={flowInfo.id}
            isSerial={_.includes([2, 3], flowInfo.executeType)}
            filters={
              isMoreHistory
                ? {
                    status: filters.status,
                    startDate: filters.time[0].format('YYYY/MM/DD HH:mm'),
                    endDate: filters.time[1].format('YYYY/MM/DD HH:mm'),
                  }
                : {}
            }
            hideStatusAndDate={isMoreHistory}
            batchIds={batchIds}
            onFilter={this.handleFilter}
            onRefresh={callback => {
              this.setState({ pageIndex: 1, batchIds: [] }, () => {
                this.getData(callback);
              });
              this.getProcessAccumulation();
            }}
          />
          <HistoryList
            processId={flowInfo.id}
            data={data}
            accumulation={accumulation}
            disabled={isMoreHistory}
            updateSource={(item, index) => {
              const newData = [].concat(data);
              newData[index] = item;
              this.setState({ data: newData });
            }}
            getMore={this.getMore}
            hasMoreData={hasMoreData}
            requestPending={requestPending}
            batchIds={batchIds}
            onClick={selectActionId => this.setState({ selectActionId })}
            onRecovery={this.onRecovery}
            onRefreshAccumulation={() => this.getProcessAccumulation()}
            onUpdateBatchIds={batchIds => this.setState({ batchIds })}
          />
        </div>

        {showFilter && (
          <Dialog
            className="workflowHistoryBox"
            closable={false}
            visible
            title={_l('筛选条件')}
            okDisabled={!filters.status || !filters.time}
            onCancel={() => {
              this.setState({ showFilter: false, filters: {} });
              this.handleFilter({});
            }}
            onOk={() => {
              this.handleFilter({
                status: filters.status,
                startDate: filters.time[0].format('YYYY/MM/DD HH:mm'),
                endDate: filters.time[1].format('YYYY/MM/DD HH:mm'),
              });
              this.setState({ showFilter: false });
            }}
          >
            <div>{_l('流程状态')}</div>
            <Dropdown
              className="w100 mTop10"
              isAppendToBody
              border
              onChange={status => this.setState({ filters: Object.assign({}, filters, { status }) })}
              value={filters.status}
              data={this.formatData(FLOW_STATUS)}
              placeholder={_l('请选择')}
            />
            <div className="mTop20 mBottom10">{_l('时间范围')}</div>
            <DateRangePicker
              mode="datetime"
              timeMode="minute"
              selectedValue={filters.time || ['', '']}
              children={
                <div className="filterTimeRange">
                  <div>{this.renderTimePlaceholder()}</div>
                  <Icon icon="bellSchedule" className="Gray_9e Font18" />
                </div>
              }
              onOk={time => {
                if (time[1] - time[0] > 180 * 24 * 60 * 60 * 1000) {
                  alert('最大跨度180天');
                } else {
                  this.setState({ filters: Object.assign({}, filters, { time }) });
                }
              }}
              onClear={() => this.setState({ filters: Object.assign({}, filters, { time: '' }) })}
            />
          </Dialog>
        )}
      </ScrollView>
    );
  }
}

export default connect(state => state.workflow)(History);

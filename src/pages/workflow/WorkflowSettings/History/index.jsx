import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ScrollView, MdLink } from 'ming-ui';
import HistoryHeader from './HistoryHeader';
import HistoryList from './HistoryList';
import HistoryDetail from './HistoryDetail';
import './index.less';
import api from '../../api/instance';
import processVersion from '../../api/processVersion';
import _ from 'lodash';
import Detail from '../Detail';
import ArchivedList from 'src/components/ArchivedList';

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
      data: null,
      selectActionId: ids.length === 1 ? ids[0] : '',
      workId: ids.length > 1 ? ids[0] : '',
      instanceId: ids.length > 1 ? ids[1] : '',
      pageIndex: 1,
      hasMoreData: false,
      instanceData: null,
      accumulation: {},
      requestPending: false,
      batchIds: [],
      selectNodeObj: {},
      archivedItem: {},
      cacheKey: +new Date(),
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
    const { pageIndex, workId, instanceId, requestPending, archivedItem } = this.state;
    const { pageSize, filterPara } = this;
    let para = {
      pageIndex,
      processId,
      pageSize,
      workId,
      instanceId,
      archivedId: archivedItem.id,
      ...filterPara,
    };

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
    this.setState({ pageIndex: 1, batchIds: [], data: null }, () => {
      this.getData();
    });
  };

  renderInstanceContent() {
    const { isPlugin } = this.props;
    const { instanceId, instanceData } = this.state;

    if (!instanceId || instanceData === null) return null;

    return (
      <div className="instanceContent">
        <div className="instanceContentBox flexRow ellipsis Font14">
          <div className="flex bold">
            <span
              className="ThemeColor3 ThemeHoverColor2 mRight10 pointer"
              onClick={() =>
                window.open(`${isPlugin ? '/workflowplugin' : '/workflowedit'}/${instanceData.process.id}`)
              }
            >
              {instanceData.process.name}
            </span>
            {_l('触发了以下子流程')}
          </div>
          <MdLink
            className="pointer Gray_75 ThemeHoverColor3 Font16 mLeft20"
            to={`${isPlugin ? '/workflowplugin' : '/workflowedit'}/${this.props.flowInfo.id}/2`}
            onClick={() => {
              this.setState({ workId: '', instanceId: '', instanceData: null }, this.handleFilter);
            }}
          >
            <i className="icon-delete" />
          </MdLink>
        </div>
      </div>
    );
  }

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
    const { flowInfo, match, isPlugin } = this.props;
    const {
      data,
      selectActionId,
      hasMoreData,
      accumulation,
      requestPending,
      batchIds,
      selectNodeObj,
      archivedItem,
      cacheKey,
    } = this.state;
    const { lastPublishDate, parentId, enabled } = flowInfo;
    const detailProps = {
      processId: selectNodeObj.processId,
      selectNodeId: selectNodeObj.selectNodeId,
      selectNodeType: selectNodeObj.selectNodeType,
      debugEvents: selectNodeObj.debugEvents,
      instanceId: selectActionId,
      isPlugin,
      closeDetail: () => this.setState({ selectNodeObj: {} }),
    };

    if (selectActionId) {
      return (
        <Fragment>
          <ScrollView className="workflowHistoryWrap flex">
            <div className="workflowHistoryContentWrap">
              <HistoryDetail
                isPlugin={isPlugin}
                id={selectActionId}
                onClick={() => {
                  if (match.params.operator) {
                    location.replace(
                      `${isPlugin ? '/workflowplugin' : '/workflowedit'}/${flowInfo.id}/${match.params.type}`,
                    );
                  } else {
                    this.setState({ selectActionId: '' });
                  }
                }}
                openNodeDetail={selectNodeObj => this.setState({ selectNodeObj })}
              />
            </div>
          </ScrollView>

          <Detail {...detailProps} />
        </Fragment>
      );
    }

    return (
      <ScrollView className="workflowHistoryWrap flex" style={{ marginTop: _.isEmpty(archivedItem) ? 20 : 13 }}>
        <div
          className="lastPublishInfo"
          style={{
            height: _.isEmpty(archivedItem) ? 22 : 36,
            marginBottom: _.isEmpty(archivedItem) ? 20 : 13,
          }}
        >
          {!_.isEmpty(archivedItem) ? (
            <ArchivedList
              type={1}
              archivedItem={archivedItem}
              onChange={archivedItem => {
                this.filterPara = {};
                this.setState({ archivedItem, pageIndex: 1, cacheKey: +new Date(), data: null }, this.getData);
              }}
            />
          ) : (
            <Fragment>
              <div className="flex Gray_75">
                {!parentId && !lastPublishDate ? (
                  _l('待流程发布后，在此处查看流程的运行历史')
                ) : parentId ? (
                  <Fragment>
                    {_l('只展示该发布版本的流程历史')}
                    <span
                      className="ThemeColor3 ThemeHoverColor2 mLeft10 pointer"
                      onClick={() => (location.href = `${isPlugin ? '/workflowplugin' : '/workflowedit'}/${parentId}`)}
                    >
                      {_l('打开当前流程')}
                    </span>
                  </Fragment>
                ) : lastPublishDate ? (
                  <Fragment>
                    {enabled && <span>{_l('当前运行中流程发布于: %0', createTimeSpan(lastPublishDate))}</span>}
                  </Fragment>
                ) : null}
              </div>
              <ArchivedList
                type={1}
                archivedItem={archivedItem}
                onChange={archivedItem => {
                  this.filterPara = {};
                  this.setState({ archivedItem, pageIndex: 1, cacheKey: +new Date(), data: null }, this.getData);
                }}
              />
            </Fragment>
          )}
        </div>

        <div className="workflowHistoryContentWrap">
          {this.renderInstanceContent()}
          <HistoryHeader
            key={cacheKey}
            isPlugin={isPlugin}
            processId={flowInfo.id}
            isSerial={_.includes([2, 3], flowInfo.executeType)}
            batchIds={batchIds}
            onFilter={this.handleFilter}
            archivedItem={archivedItem}
            onRefresh={callback => {
              this.setState({ pageIndex: 1, batchIds: [], data: null }, () => {
                this.getData(callback);
              });
              this.getProcessAccumulation();
            }}
          />
          <HistoryList
            processId={flowInfo.id}
            isPlugin={isPlugin}
            data={data}
            accumulation={accumulation}
            updateSource={(item, index) => {
              const newData = [].concat(data);
              newData[index] = item;
              this.setState({ data: newData });
            }}
            getMore={() => this.getData()}
            hasMoreData={hasMoreData}
            requestPending={requestPending}
            batchIds={batchIds}
            onClick={selectActionId => this.setState({ selectActionId })}
            onRecovery={this.onRecovery}
            onRefreshAccumulation={() => this.getProcessAccumulation()}
            onUpdateBatchIds={batchIds => this.setState({ batchIds })}
          />
        </div>
      </ScrollView>
    );
  }
}

export default connect(state => state.workflow)(History);

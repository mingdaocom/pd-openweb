import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { MdLink, ScrollView } from 'ming-ui';
import api from '../../api/instance';
import processVersion from '../../api/processVersion';
import ArchivedList from 'src/components/ArchivedList';
import chatbot from '../../apiV2/chatbot';
import Detail from '../Detail';
import { APP_TYPE } from '../enum';
import HistoryDetail from './HistoryDetail';
import HistoryHeader from './HistoryHeader';
import HistoryList from './HistoryList';
import './index.less';

const MenuIcon = styled.i`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const DrawerBox = styled.div`
  width: 280px;
  background-color: #fff;
  .listItem {
    padding: 0 10px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    cursor: pointer;
    &:hover,
    &.active {
      background: #f5f5f5;
    }
  }
`;

@withRouter
class History extends Component {
  constructor(props) {
    super(props);

    const { operator, operatorId } = props.match.params;
    let ids = [];

    if (operator && !_.includes(['execHistory', 'subprocessHistory'], operator) && operator.length === 24) {
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
      scrollTop: 0,
      showTalksDrawer: true,
      chatBotHistory: [],
      selectConversationId: '',
    };
  }

  pageSize = 20;
  filterPara = {};

  componentWillMount() {
    const { flowInfo } = this.props;
    const { instanceId } = this.state;

    this.getData();
    this.getProcessAccumulation();
    instanceId && this.getInstance();
    flowInfo.startAppType === APP_TYPE.CHATBOT && !flowInfo.parentId && this.getChatBotHistory();
  }

  getChatBotHistory = () => {
    const { flowInfo } = this.props;

    chatbot
      .getAllConversationList({
        pageIndex: 1,
        pageSize: 1000,
        chatbotId: flowInfo.id,
      })
      .then(res => {
        this.setState({ chatBotHistory: res });
      });
  };

  getData = (callback = () => {}) => {
    const processId = this.props.flowInfo.id;
    const { pageIndex, workId, instanceId, requestPending, archivedItem, selectConversationId } = this.state;
    const { pageSize, filterPara } = this;
    let para = {
      pageIndex,
      processId,
      pageSize,
      workId,
      instanceId,
      archivedId: archivedItem.id,
      conversationId: selectConversationId,
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

  renderTalksDrawer() {
    const { chatBotHistory, selectConversationId } = this.state;
    const selectFunc = id => {
      this.setState(
        {
          selectConversationId: id,
          pageIndex: 1,
          batchIds: [],
          data: null,
          selectActionId: '',
        },
        () => this.getData(),
      );
    };

    return (
      <DrawerBox>
        <div className="flexColumn h100">
          <div className="flexRow alignItemsCenter mTop15 mLeft20 mRight15">
            <div className="Font12 bold flex Gray_75">{_l('历史对话')}</div>
            {selectConversationId && (
              <div className="Gray_75 ThemeHoverColor3 pointer mRight10" onClick={() => selectFunc('')}>
                {_l('重置')}
              </div>
            )}
            <i
              className="icon-menu_left Font20 Gray_9e ThemeHoverColor3 pointer"
              onClick={() => this.setState({ showTalksDrawer: false })}
            />
          </div>
          <ScrollView className="flex h100 mTop10 pLeft10 pRight10">
            {chatBotHistory.map(item => (
              <div
                className={cx('listItem', { active: selectConversationId === item.conversationId })}
                key={item.conversationId}
                onClick={() => selectFunc(item.conversationId)}
              >
                <div className="ellipsis flex">{item.title}</div>
                <div className="Gray_9e Font12 mLeft10">{createTimeSpan(item.ctime)}</div>
              </div>
            ))}
          </ScrollView>
        </div>
      </DrawerBox>
    );
  }

  renderDetail() {
    const { flowInfo, match, isPlugin } = this.props;
    const { selectActionId, selectNodeObj, scrollTop } = this.state;
    const detailProps = {
      processId: selectNodeObj.processId,
      selectNodeId: selectNodeObj.selectNodeId,
      selectNodeType: selectNodeObj.selectNodeType,
      debugEvents: selectNodeObj.debugEvents,
      instanceId: selectActionId,
      isPlugin,
      closeDetail: () => this.setState({ selectNodeObj: {} }),
    };

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
                  this.setState({ selectActionId: '' }, () => {
                    this.contentScroll.scrollTo({ top: scrollTop });
                  });
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

  renderList() {
    const { flowInfo, isPlugin } = this.props;
    const { data, hasMoreData, accumulation, requestPending, batchIds, archivedItem, cacheKey } = this.state;
    const { lastPublishDate, parentId, enabled } = flowInfo;

    return (
      <ScrollView className="workflowHistoryWrap flex" ref={contentScroll => (this.contentScroll = contentScroll)}>
        <div className="lastPublishInfo">
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
            isChatbot={flowInfo.startAppType === APP_TYPE.CHATBOT}
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
            onClick={selectActionId =>
              this.setState({ selectActionId, scrollTop: this.contentScroll.getScrollInfo().scrollTop })
            }
            onRecovery={this.onRecovery}
            onRefreshAccumulation={() => this.getProcessAccumulation()}
            onUpdateBatchIds={batchIds => this.setState({ batchIds })}
          />
        </div>
      </ScrollView>
    );
  }

  render() {
    const { flowInfo } = this.props;
    const { selectActionId, showTalksDrawer } = this.state;

    return (
      <div className="flexRow flex minHeight0">
        {flowInfo.startAppType !== APP_TYPE.CHATBOT || flowInfo.parentId ? null : showTalksDrawer ? (
          this.renderTalksDrawer()
        ) : (
          <MenuIcon
            className="icon-menu_right Gray_9e ThemeHoverColor3 mLeft24 mTop20 Font20"
            onClick={() => this.setState({ showTalksDrawer: true })}
          />
        )}

        {selectActionId ? this.renderDetail() : this.renderList()}
      </div>
    );
  }
}

export default connect(state => state.workflow)(History);

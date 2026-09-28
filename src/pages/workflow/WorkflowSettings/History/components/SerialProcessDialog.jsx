import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { LoadDiv, Support } from 'ming-ui';
import { Modal, Tooltip } from 'ming-ui/antd-components';
import activityAJAX from '../../../api/activity';
import activityV2 from '../../../apiV2/activity';
import emptyListPng from '../images/emptyList.png';

const SerialProcessContent = styled.div`
  height: 100%;
  overflow: auto;

  .listHeader,
  .list,
  .partitionHeader,
  .partitionRow {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--color-border-primary);
  }
  .listHeader,
  .partitionHeader {
    height: 45px;
  }
  .list,
  .partitionRow {
    min-height: 68px;
  }
  .list {
    .icon-delete {
      display: none;
    }
    &:hover {
      .icon-delete {
        display: block;
      }
    }
  }
  .partitionContent {
    padding-left: 40px;
  }
  .partitionName {
    min-width: 0;
  }
  .w40 {
    width: 40px;
  }
  .w75 {
    width: 75px;
  }
  .w150 {
    width: 150px;
  }
  .w190 {
    width: 190px;
  }
  .emptyListWrap {
    padding: 100px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    img {
      width: 130px;
      height: 130px;
      border-radius: 50%;
    }
    .text {
      margin-top: 24px;
    }
  }
`;

const formatTime = value => (value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '');

const formatPartitionItem = item => ({
  sequenceId: item.sequenceId,
  firstQueuedDate: item.firstQueuedDate,
  partitionControls: item.partitionControls || [],
});

export default class SerialProcessDialog extends Component {
  state = {
    list: [],
    loading: true,
    pageIndex: 1,
    hasMore: true,
    partitionList: [],
    partitionProcesses: {},
    expandedSequenceIds: [],
  };

  componentDidMount() {
    if (this.props.isPartitionSerial) {
      this.getPartitionList();
    } else {
      this.getSerialList();
    }
  }

  componentWillUnmount() {
    this.handleScroll.cancel();
  }

  getSerialList = (pageIndex = 1, sequenceId, clearList = false) => {
    const { processId, isPartitionSerial } = this.props;

    if (isPartitionSerial) {
      this.setState(prevState => ({
        partitionProcesses: {
          ...prevState.partitionProcesses,
          [sequenceId]: {
            list: [],
            pageIndex: 1,
            hasMore: false,
            ...(clearList ? {} : prevState.partitionProcesses[sequenceId] || {}),
            loading: true,
          },
        },
      }));

      return activityV2.getList_2({ processId, sequenceId, pageIndex, pageSize: 30 }).then(res => {
        const list = Array.isArray(res) ? res : [];

        this.setState(prevState => {
          const current = prevState.partitionProcesses[sequenceId] || {};
          return {
            partitionProcesses: {
              ...prevState.partitionProcesses,
              [sequenceId]: {
                list: pageIndex === 1 ? list : (current.list || []).concat(list),
                pageIndex,
                hasMore: list.length >= 30,
                loading: false,
              },
            },
          };
        });
      });
    }

    this.setState({ loading: true });

    return activityAJAX.getList({ processId, pageIndex, pageSize: 30 }).then(res => {
      const list = Array.isArray(res) ? res : [];
      this.setState(prevState => ({
        loading: false,
        list: pageIndex === 1 ? list : prevState.list.concat(list),
        pageIndex,
        hasMore: list.length >= 30,
      }));
    });
  };

  getPartitionList = (clearList = false) => {
    const { processId } = this.props;
    this.setState({
      loading: true,
      ...(clearList ? { partitionList: [], partitionProcesses: {} } : {}),
    });

    return activityV2.getPartitionList({ processId }).then(res => {
      this.setState({
        partitionList: (Array.isArray(res) ? res : []).map(formatPartitionItem),
        loading: false,
      });
    });
  };

  handleScroll = _.throttle(e => {
    const { loading, hasMore, pageIndex } = this.state;

    if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 30 && !loading && hasMore) {
      this.getSerialList(pageIndex + 1);
    }
  });

  removePendingProcess = (id = '', sequenceId) => {
    const { processId } = this.props;

    return activityAJAX.remove({ processId, id }).then(() => this.getSerialList(1, sequenceId));
  };

  togglePartition = sequenceId => {
    const { expandedSequenceIds, partitionProcesses } = this.state;
    const isExpanded = expandedSequenceIds.includes(sequenceId);

    this.setState({
      expandedSequenceIds: isExpanded
        ? expandedSequenceIds.filter(id => id !== sequenceId)
        : expandedSequenceIds.concat(sequenceId),
    });

    if (!isExpanded && !partitionProcesses[sequenceId]) {
      this.getSerialList(1, sequenceId);
    }
  };

  refreshAllPartitions = () => {
    const { expandedSequenceIds } = this.state;

    return this.getPartitionList(true).then(() =>
      Promise.all(expandedSequenceIds.map(sequenceId => this.getSerialList(1, sequenceId))),
    );
  };

  removePartition = sequenceId => {
    const { processId } = this.props;

    return activityV2.remove_1({ processId, sequenceId }).then(() => {
      this.setState(prevState => {
        const partitionProcesses = { ...prevState.partitionProcesses };
        delete partitionProcesses[sequenceId];
        return {
          partitionProcesses,
          expandedSequenceIds: prevState.expandedSequenceIds.filter(id => id !== sequenceId),
        };
      });
      this.getPartitionList();
    });
  };

  removeAllPartitions = () => {
    const { processId } = this.props;

    return activityV2.remove_1({ processId }).then(() => {
      this.setState({ partitionProcesses: {}, expandedSequenceIds: [] });
      this.getPartitionList();
    });
  };

  renderListHeader(className = '') {
    return (
      <div className={`listHeader bold textSecondary ${className}`}>
        <div className="w150 mLeft16">{_l('状态')}</div>
        <div className="flex">{_l('流程触发数据')}</div>
        <div className="w190">{_l('加入排队时间')}</div>
        <div className="w150">{_l('触发时间')}</div>
        <div className="w40" />
      </div>
    );
  }

  renderProcessList({ list, loading, pageIndex, hasMore, sequenceId, isNested = false, showEmpty = false }) {
    return (
      <div className={isNested ? 'partitionContent' : ''}>
        {this.renderListHeader(isNested ? 'Font12' : 'Font14 mTop30')}

        {loading && pageIndex === 1 && <LoadDiv className="mTop15" />}

        {showEmpty && !loading && !list.length && this.renderEmpty()}

        <ul>
          {list.map((item, index) => (
            <li className="list" key={item.id || index}>
              <div className="w150 mLeft16 bold flexRow alignItemsCenter">
                <i
                  className="icon-play-circle Font24 mRight6"
                  style={{ color: item.createDate ? 'var(--color-primary)' : 'var(--color-cyan-dark)' }}
                />
                {item.createDate ? _l('运行中') : _l('等待中')}
              </div>
              <div className="flex ellipsis mRight15">
                {_l('数据：')}
                {item.title}
              </div>
              <div className="w190">{formatTime(item.date)}</div>
              <div className="w150">{formatTime(item.createDate)}</div>
              <div className="w40">
                {index === 0 && (
                  <Tooltip title={_l('取消')}>
                    <span className="InlineFlex" onClick={() => this.removePendingProcess(item.id, sequenceId)}>
                      <i className="icon-delete Font16 pointer hoverColorPrimary textSecondary" />
                    </span>
                  </Tooltip>
                )}
              </div>
            </li>
          ))}
        </ul>

        {loading && pageIndex > 1 && <LoadDiv className="mTop10" />}

        {isNested && !loading && hasMore && (
          <div
            className="centerAlign colorPrimary hoverColorPrimaryDark pointer mTop15 mBottom15"
            onClick={() => this.getSerialList(pageIndex + 1, sequenceId)}
          >
            {_l('加载更多')}
          </div>
        )}
      </div>
    );
  }

  renderPartitionList() {
    const { partitionList, partitionProcesses, expandedSequenceIds, loading } = this.state;
    const partitionControls = _.uniqBy(
      _.flatMap(partitionList, 'partitionControls'),
      control => control.controlId || control.controlName,
    );
    const partitionControlNames = partitionControls.map(control => control.controlName).join(' / ');

    return (
      <div>
        <div className="partitionHeader bold textSecondary Font14 mTop20">
          <div className="partitionName flex">
            {partitionControlNames ? _l('分区（%0）', partitionControlNames) : _l('分区')}
          </div>
          <div className="w190">{_l('首次加入排队时间')}</div>
          <div className="w75">{_l('操作')}</div>
        </div>

        {loading && <LoadDiv className="mTop15" />}

        {!loading && !partitionList.length && this.renderEmpty()}

        {partitionList.map(item => {
          const isExpanded = expandedSequenceIds.includes(item.sequenceId);
          const processData = partitionProcesses[item.sequenceId] || {
            list: [],
            loading: true,
            pageIndex: 1,
            hasMore: false,
          };

          return (
            <div key={item.sequenceId}>
              <div className="partitionRow">
                <div
                  className="partitionName flex bold flexRow alignItemsCenter pointer"
                  onClick={() => this.togglePartition(item.sequenceId)}
                >
                  <i
                    className={`Font16 mRight10 textSecondary icon-${
                      isExpanded ? 'arrow-down-border' : 'arrow-right-border'
                    }`}
                  />
                  <span className="ellipsis">{item.partitionControls.map(control => control.value).join(' / ')}</span>
                </div>
                <div className="w190">{formatTime(item.firstQueuedDate)}</div>
                <div className="w75 flexRow alignItemsCenter">
                  <Tooltip title={_l('刷新')}>
                    <span className="InlineFlex" onClick={() => this.getSerialList(1, item.sequenceId, true)}>
                      <i className="icon-refresh1 Font16 hoverColorPrimary pointer" />
                    </span>
                  </Tooltip>
                  <Tooltip title={_l('取消')}>
                    <span className="InlineFlex mLeft15" onClick={() => this.removePartition(item.sequenceId)}>
                      <i className="icon-delete Font16 hoverColorPrimary pointer" />
                    </span>
                  </Tooltip>
                </div>
              </div>

              {isExpanded && this.renderProcessList({ ...processData, sequenceId: item.sequenceId, isNested: true })}
            </div>
          );
        })}
      </div>
    );
  }

  renderEmpty() {
    return (
      <div className="emptyListWrap">
        <img src={emptyListPng} />
        <div className="text textSecondary Font16">{_l('没有串行等待中的流程')}</div>
      </div>
    );
  }

  renderHeaderActions() {
    const { isPartitionSerial } = this.props;
    const cancelAll = isPartitionSerial ? this.removeAllPartitions : () => this.removePendingProcess();
    const refresh = isPartitionSerial ? this.refreshAllPartitions : () => this.getSerialList();

    return (
      <React.Fragment>
        <div className="hoverColorPrimary pointer" onClick={cancelAll}>
          {_l('取消等待中的流程')}
        </div>
        <div className="icon-refresh1 Font16 hoverColorPrimary pointer mLeft15" onClick={refresh} />
      </React.Fragment>
    );
  }

  render() {
    const { isPartitionSerial, onClose = () => {} } = this.props;
    const { list, loading, pageIndex, hasMore } = this.state;

    return (
      <Modal
        open
        width={960}
        mask={{ closable: false }}
        type="fixed"
        title={_l('串行等待中的流程')}
        onCancel={onClose}
        footer={null}
      >
        <SerialProcessContent onScroll={isPartitionSerial ? undefined : this.handleScroll}>
          <div className="textSecondary flexRow alignItemsCenter">
            {isPartitionSerial
              ? _l('工作流配置为“分区严格串行”时，运行中的工作流需要等待前序的流程执行完毕')
              : _l('工作流配置为“严格串行”时，运行中的工作流需要等待前序的流程执行完毕')}
            <Support
              type={3}
              text={_l('了解更多')}
              className="colorPrimary hoverColorPrimaryDark mLeft5"
              href="https://help.mingdao.com/workflow/configuration#operation-mode"
            />
            <div className="flex" />
            {this.renderHeaderActions()}
          </div>

          {isPartitionSerial
            ? this.renderPartitionList()
            : this.renderProcessList({ list, loading, pageIndex, hasMore, showEmpty: true })}
        </SerialProcessContent>
      </Modal>
    );
  }
}

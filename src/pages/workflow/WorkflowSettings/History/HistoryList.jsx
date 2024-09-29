import React, { Component, Fragment } from 'react';
import { string, number, arrayOf, shape, bool, func, any, array } from 'prop-types';
import cx from 'classnames';
import HistoryListItem from './components/HistoryListItem';
import { STATUS2COLOR } from './config';
import styled from 'styled-components';
import { Menu, MenuItem, Support, Dialog, Checkbox } from 'ming-ui';
import { SUPPORT_HREF } from '../enum';
import _ from 'lodash';
import moment from 'moment';
import processVersion from '../../api/processVersion';
import { Tooltip } from 'antd';

const HISTORY_TITLE = [
  { id: 'status', text: _l('状态') },
  { id: 'triggerData', text: _l('触发流程数据') },
  { id: 'cause', text: _l('原因') },
  { id: 'time', text: _l('触发时间') },
  { id: 'retry', text: '' },
  { id: 'version', text: '' },
];

const Box = styled.div`
  border-radius: 3px;
  padding: 0 12px;
  height: 40px;
  display: flex;
  align-items: center;
  margin: 10px 24px 0;
  > a {
    color: #333;
    border-bottom: 1px dashed #757575;
    margin: 0 3px;
    &:hover {
      color: #2196f3;
    }
  }
`;
export default class HistoryList extends Component {
  static propTypes = {
    processId: string,
    data: arrayOf(
      shape({
        createDate: string,
        id: string,
        instanceLog: shape({ cause: number, nodeName: string }),
        status: number,
        title: string,
      }),
    ),
    accumulation: any,
    getMore: func,
    hasMoreData: bool,
    requestPending: bool,
    batchIds: array,
    onRecovery: func,
    onRefreshAccumulation: func,
    onUpdateBatchIds: func,
  };
  static defaultProps = {
    data: [],
    batchIds: [],
    getMore: () => {},
    onRecovery: () => {},
    onRefreshAccumulation: () => {},
    onUpdateBatchIds: () => {},
  };

  state = {
    showList: false,
  };

  /**
   * 渲染堆积
   */
  renderAccumulation() {
    const { accumulation, onRecovery } = this.props;

    return (
      <Box style={{ backgroundColor: STATUS2COLOR[accumulation.waiting ? 'suspend' : 'pending'].bgColor }}>
        <span className="bold">{_l('%0条排队中...', accumulation.difference)}</span>
        <Support className="mLeft10" type={1} href={SUPPORT_HREF['queue']} title={_l('什么是排队中？')} />
        <div className="flex" />

        {!accumulation.waiting && (
          <Fragment>
            <div className="relative">
              <span className="ThemeColor3 ThemeHoverColor2 pointer" onClick={() => this.setState({ showList: true })}>
                {_l('暂停')}
              </span>
              {this.renderSuspendList()}
            </div>
            {this.discardAction()}
          </Fragment>
        )}

        {accumulation.waiting && (
          <Fragment>
            <span className="mLeft10">{_l('已被')}</span>
            <a href={`/user_${accumulation.createdBy.accountId}`} className="accumulationLine" target="_blank">
              {accumulation.createdBy.fullName}
            </a>
            <span>{_l('暂停消费')}</span>
          </Fragment>
        )}

        {accumulation.waiting && accumulation.dueDate && (
          <Fragment>
            <span>{_l('，将在')}</span>
            <a className="accumulationLine relative" onClick={() => this.setState({ showList: true })}>
              {this.renderDateText()}
              {this.renderSuspendList()}
            </a>
            <span>{_l('后恢复')}</span>
          </Fragment>
        )}

        {accumulation.waiting && (
          <Fragment>
            <span className="ThemeColor3 ThemeHoverColor2 pointer mLeft10" onClick={() => onRecovery(false)}>
              {_l('立即恢复')}
            </span>
            {this.discardAction()}
          </Fragment>
        )}
      </Box>
    );
  }

  /**
   * 渲染暂停列表
   */
  renderSuspendList() {
    const { onRecovery } = this.props;
    const { showList } = this.state;
    const LIST = [
      { text: _l('直至手动恢复'), value: 0 },
      { text: _l('暂停1小时'), value: 1 },
      { text: _l('暂停2小时'), value: 2 },
      { text: _l('暂停3小时'), value: 3 },
    ];

    if (!showList) return null;

    return (
      <Menu onClickAway={() => this.setState({ showList: false })}>
        {LIST.map((o, i) => (
          <MenuItem
            key={i}
            onMouseDown={() => {
              onRecovery(true, o.value);
              this.setState({ showList: false });
            }}
          >
            {o.text}
          </MenuItem>
        ))}
      </Menu>
    );
  }

  /**
   * 渲染时间文本
   */
  renderDateText() {
    const { accumulation } = this.props;
    const diff = (moment(accumulation.dueDate) - moment()) / 1000;
    const hour = Math.floor(diff / 60 / 60);
    const minute = Math.floor((diff - hour * 60 * 60) / 60);
    const second = Math.floor(diff - hour * 60 * 60 - minute * 60);

    return `${hour ? _l('%0小时', hour) : ''}${minute ? _l('%0分钟', minute) : ''}${second ? _l('%0秒', second) : ''}`;
  }

  /**
   * 丢弃执行
   */
  discardAction() {
    const { processId, onRefreshAccumulation } = this.props;
    const discardFun = () => {
      Dialog.confirm({
        className: 'deleteApprovalProcessDialog',
        title: <span style={{ color: '#f44336' }}>{_l('丢弃排队中的执行')}</span>,
        description: _l('这些已触发的流程实例将不会被执行'),
        onOk: () => {
          processVersion.remove({ processIds: [processId] }).then(() => {
            onRefreshAccumulation();
          });
        },
      });
    };

    return (
      <span className="ThemeColor3 ThemeHoverColor2 pointer mLeft20" onClick={discardFun}>
        {_l('丢弃')}
      </span>
    );
  }

  render() {
    const { data, getMore, hasMoreData, requestPending, accumulation, ...res } = this.props;
    return (
      <div className="historyListWrap">
        <ul className="historyListTitle">
          <li style={{ fontWeight: 600 }} className="Gray_75 Font14 batch">
            <Tooltip placement="bottomLeft" align={{ offset: [-10, 0] }} title={_l('全选已加载列表')}>
              <span className="InlineBlock" style={{ width: 18 }}>
                <Checkbox
                  checked={!!res.batchIds.length}
                  clearselected={!!res.batchIds.length && res.batchIds.length !== data.length}
                  onClick={checked => {
                    res.onUpdateBatchIds(
                      !checked || (checked && res.batchIds.length !== data.length)
                        ? data.map(o => {
                            return {
                              id: o.id,
                              status: o.status,
                              cause: o.instanceLog.cause,
                            };
                          })
                        : [],
                    );
                  }}
                />
              </span>
            </Tooltip>
          </li>

          {HISTORY_TITLE.map(item => {
            const { id, text } = item;
            return (
              <li
                key={id}
                style={{ fontWeight: 600 }}
                className={cx('Gray_75 Font14', id, { flex: _.includes(['cause', 'triggerData'], id) })}
              >
                {text}
              </li>
            );
          })}
        </ul>
        {!_.isEmpty(accumulation) && accumulation.difference > 0 && this.renderAccumulation()}
        {data.length ? (
          <ul className={cx('historyList', { littleData: data.length < 20 })}>
            {data.map((item, index) => (
              <HistoryListItem key={index} index={index} {...item} {...res} />
            ))}
            {!hasMoreData && data.length > 20 && (
              <div className="noMoreDataText Font16 Gray_75">{_l('没有更多数据')}</div>
            )}
          </ul>
        ) : (
          <div className="emptyListWrap">
            <div className="imgWrap" />
            <div className="text Gray_75 Font16">{_l('暂无数据运行记录')}</div>
          </div>
        )}
        {hasMoreData && (
          <div className="moreDataWrap">
            <div className="moreData" onClick={getMore}>
              {requestPending ? _l('加载中...') : _l('更多')}
            </div>
          </div>
        )}
      </div>
    );
  }
}

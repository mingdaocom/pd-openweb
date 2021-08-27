import React, { Component } from 'react';
import { string, number, arrayOf, shape, bool, func } from 'prop-types';
import cx from 'classnames';
import HistoryListItem from './HistoryListItem';

const HISTORY_TITLE = [
  { id: 'status', text: _l('状态') },
  { id: 'triggerData', text: _l('触发流程数据') },
  { id: 'cause', text: _l('原因') },
  { id: 'time', text: _l('触发时间') },
];
export default class HistoryList extends Component {
  static propTypes = {
    data: arrayOf(
      shape({
        createDate: string,
        id: string,
        instanceLog: shape({ cause: number, nodeName: string }),
        status: number,
        title: string,
      })
    ),
    getMore: func,
    hasMoreData: bool,
  };
  static defaultProps = {
    data: [],
    getMore: () => {},
  };

  render() {
    const { data, getMore, hasMoreData, ...res } = this.props;
    return (
      <div className="historyListWrap">
        <ul className="historyListTitle">
          {HISTORY_TITLE.map((item) => {
            const { id, text } = item;
            return (
              <li key={id} style={{ fontWeight: 600 }} className={cx('Gray_75 Font14', id, { flex: _.includes(['cause', 'triggerData'], id) })}>
                {text}
              </li>
            );
          })}
        </ul>
        {data.length ? (
          <ul className={cx('historyList', { littleData: data.length < 20 })}>
            {data.map((item, index) => (
              <HistoryListItem key={index} {...item} {...res} />
            ))}
            {!hasMoreData && data.length > 20 && <div className="noMoreDataText Font16 Gray_9e">{_l('没有更多数据')}</div>}
          </ul>
        ) : (
          <div className="emptyListWrap">
            <div className="imgWrap" />
            <div className="text Gray_9e Font16">{_l('暂无数据运行记录')}</div>
          </div>
        )}
        {hasMoreData && (
          <div className="moreDataWrap">
            <div className="moreData" onClick={getMore}>
              {_l('更多')}
            </div>
          </div>
        )}
      </div>
    );
  }
}

import React from 'react';
import { LoadDiv, Icon } from 'ming-ui';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import { dateConvertToUserZone } from 'src/util';
import './style.less';
import _ from 'lodash';
import cx from 'classnames';

export default class HistoryLogs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      pageSize: 20,
    };
  }

  renderLogs = () => {
    const { historyLogInfo = {} } = this.props;
    const { list = [] } = historyLogInfo;
    return (
      <div className="orgManagementContent roleLogListContent">
        {_.map(list, (log, index) => {
          return (
            <div className={cx('logItem Font13 clearfix ThemeColor3', { mTop0: index === 0 })} key={index}>
              <span className="Gray" dangerouslySetInnerHTML={{ __html: log.msg }} />{' '}
              <span className="mLeft24 Gray_9e">{dateConvertToUserZone(log.createTime)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    const { onClose = () => {}, historyLogInfo = {} } = this.props;
    const { isLoading, allCount, list } = historyLogInfo;
    const { pageSize, pageIndex } = this.state;

    return (
      <div className="orgManagementWrap roleAuthLogTable">
        <div className="orgManagementHeader Font17">
          <div className="flexRow alignItemsCenter">
            <Icon icon="backspace" className="Font22 ThemeHoverColor3 pointer" onClick={onClose} />
            <div className="Font17 bold flex mLeft10">{_l('历史日志')}</div>
          </div>
        </div>
        {isLoading ? <LoadDiv /> : this.renderLogs()}
        {!isLoading && list && allCount > pageSize ? (
          <PaginationWrap
            total={allCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onChange={pageIndex =>
              this.setState({ pageIndex }, () => this.props.fetchHistoryLogs({ pageIndex, pageSize }))
            }
          />
        ) : null}
      </div>
    );
  }
}

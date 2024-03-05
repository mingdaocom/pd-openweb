import React from 'react';
import RoleController from 'src/api/role';
import LoadDiv from 'ming-ui/components/LoadDiv';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import Config from '../../config';
import './style.less';
import _ from 'lodash';
import cx from 'classnames';

export default class orgLog extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      list: null,
      pageIndex: 1,
      pageSize: 20,
      totalCount: null,
    };
    Config.setPageTitle(_l('组织管理'));
  }

  componentWillMount() {
    this.fetchLogs();
  }

  fetchLogs() {
    const { projectId } = _.get(this.props, 'match.params') || '';
    const { pageIndex, pageSize } = this.state;
    this.setState({
      isLoading: true,
    });
    RoleController.getPageLogs({
      projectId,
      pageIndex,
      pageSize,
    })
      .done(({ allCount, list } = {}) => {
        this.setState({
          isLoading: false,
          allCount: allCount || 0,
          list: list,
        });
      })
      .fail(() => {
        this.setState({
          isLoading: false,
        });
      });
  }

  renderLogs() {
    const { list } = this.state;
    if (list && list.length) {
      return (
        <div className="orgManagementContent roleLogListContent">
          {_.map(list, (log, index) => {
            return (
              <div className={cx('logItem Font13 clearfix ThemeColor3', { mTop0: index === 0 })} key={index}>
                <span className="Gray" dangerouslySetInnerHTML={{ __html: log.msg }} />{' '}
                <span className="mLeft24 Gray_9e">{log.createTime}</span>
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <div className="TxtCenter listEmpty">
          <div>
            <span className="icon-knowledge-log icon" />
          </div>
          <div className="mTop20">{_l('暂无日志')}</div>
        </div>
      );
    }
  }

  render() {
    const { isLoading, allCount, list, pageSize, pageIndex } = this.state;
    return (
      <div className="orgManagementWrap roleAuthLogTable">
        <div className="orgManagementHeader Font17">{_l('组织管理')}</div>
        {isLoading ? <LoadDiv /> : this.renderLogs()}
        {!isLoading && list && allCount > pageSize ? (
          <PaginationWrap
            total={allCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onChange={pageIndex => this.setState({ pageIndex }, this.fetchLogs)}
          />
        ) : null}
      </div>
    );
  }
}

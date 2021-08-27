import React from 'react';
import PropTypes from 'prop-types';
import RoleController from 'src/api/role';

import LoadDiv from 'ming-ui/components/LoadDiv';
import 'pager';
import './style.less';

class RoleLog extends React.Component {
  static propTypes = {
    projectId: PropTypes.string,
  };

  constructor() {
    super();
    this.state = {
      isLoading: false,
      list: null,
      pageIndex: 1,
      pageSize: 20,
      totalCount: null,
    };
  }

  componentWillMount() {
    this.fetchLogs();
  }

  componentDidUpdate() {
    const { allCount, pageIndex, pageSize } = this.state;
    if (this.pager) {
      $(this.pager)
        .show()
        .Pager({
          pageIndex,
          pageSize,
          count: allCount,
          changePage: pageIndex => {
            this.setState({ pageIndex }, this.fetchLogs);
          },
        });
    }
  }

  fetchLogs() {
    const { projectId } = this.props;
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
        <div className="roleLogListContent">
          {_.map(list, (log, index) => {
            return (
              <div className="logItem Font13 clearfix ThemeColor3" key={index}>
                <span className="Gray" dangerouslySetInnerHTML={{ __html: log.msg }} /> <span className="mLeft24 Gray_9e">{log.createTime}</span>
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
    const { isLoading, allCount, list, pageSize } = this.state;
    return (
      <div className="roleAuthLogTable">
        {isLoading ? <LoadDiv /> : this.renderLogs()}
        {!isLoading && list && allCount > pageSize ? (
          <div
            className="mTop20"
            ref={el => {
              this.pager = el;
            }}
          />
        ) : null}
      </div>
    );
  }
}

export default RoleLog;

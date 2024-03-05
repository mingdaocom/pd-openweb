import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import './taskLog.less';
import ajaxRequest from 'src/api/taskCenter';
import LoadDiv from 'ming-ui/components/LoadDiv';
import filterXSS from 'xss';

export default class TaskDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logs: [],
      getSuccess: false,
    };
  }
  componentDidMount() {
    this.getTaskLog();
    if (this.props.manualRef) {
      this.props.manualRef(this);
    }
  }

  /**
   * 获取讨论
   */
  getTaskLog() {
    ajaxRequest
      .getTaskLog({
        taskID: this.props.taskId,
      })
      .then(result => {
        if (result.status) {
          this.setState({
            logs: result.data || [],
            getSuccess: true,
          });
        } else {
          alert(_l('操作失败，请稍后重试'), 2);
        }
      });
  }

  /**
   * 图标
   */
  returnIcons(type) {
    if (type === 0) {
      return 'icon-plus';
    } else if (type === 1) {
      return 'icon-task-card';
    } else if (type === 2 || type === 3 || type === 12 || type === 13) {
      return 'icon-group';
    } else if (type === 4) {
      return 'icon-edit';
    } else if (type === 6) {
      return 'icon-circle';
    } else if (type === 7) {
      return 'icon-task-stage';
    } else if (type === 8) {
      return 'icon-ok';
    } else if (type === 9) {
      return 'icon-task-status-no';
    } else if (type === 10) {
      return 'icon-task-new-locked';
    } else if (type === 11) {
      return 'icon-task-new-no-locked';
    } else if (type === 14 || type === 99) {
      return 'icon-task-new-delete';
    }
  }

  render() {
    const { logs, getSuccess } = this.state;

    // 空状态
    if (!logs.length && !getSuccess) {
      return <LoadDiv />;
    }

    return (
      <div className="dailyContent">
        {logs.map((item, i) => {
          return (
            <div key={i} className="singleDdaily boxSizing">
              <i className={cx('singleDdailyType', this.returnIcons(item.type))} />
              <div
                dangerouslySetInnerHTML={{
                  __html: filterXSS(item.msg),
                }}
              />
              <span className="singleDdailyTime">{createTimeSpan(item.createTime)}</span>
            </div>
          );
        })}
      </div>
    );
  }
}

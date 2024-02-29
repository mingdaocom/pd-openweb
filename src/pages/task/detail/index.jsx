import './index.less';
import React, { Component } from 'react';

import TaskDetail from '../containers/taskDetail/taskDetail';
import UniformRoute from 'src/router/withTitle';
import { connect } from 'react-redux';
import _ from 'lodash';

class TaskDetailEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppTaskDetail');
  }
  componentWillUnmount() {
    $('html').removeClass('AppTaskDetail');
    $('body').off('.task');
  }
  render() {
    const { taskDetails, match } = this.props;
    const { id } = match.params;
    let title = '任务详情-任务';
    if (taskDetails[id] && !_.get(taskDetails, [id, 'status'])) {
      title = _l('任务已删除');
    }
    _.get(taskDetails, [id, 'data', 'taskName']) && (title = _.get(taskDetails, [id, 'data', 'taskName']));
    return (
      <div className="taskDetailContainer flexColumn">
        <div className="flex">
          <UniformRoute title={title} taskId={id} openType={2} visible={true} component={TaskDetail} />
        </div>
      </div>
    );
  }
}

export default connect(state => state.task)(TaskDetailEntrypoint);

import React, { Component } from 'react';
import config from '../../config/config';
import './dragPreview.less';
import moment from 'moment';

export default class DragPreview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { data, preview } = this.props;
    return (
      <div id="ganttDragPreview">
        {data.startTime ? <div className="dragPreviewStartTime">{moment(data.startTime).format('Do HH')}</div> : undefined}
        <div dangerouslySetInnerHTML={{ __html: preview }} />
        {data.deadline ? <div className="dragPreviewEndTime">{moment(data.deadline).format('Do HH')}</div> : undefined}
      </div>
    );
  }
}

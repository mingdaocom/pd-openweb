﻿import React, { Component } from 'react';
import TaskCenter from './containers/taskCenter/taskCenter';
import { emitter } from 'src/util';

export default class FolderEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppTask');
  }
  componentWillUnmount() {
    $('#container').off('.task');
    $('body').off('.task').removeClass('taskDetailOpen');
    $('html').removeClass('AppTask');
  }
  render() {
    return <TaskCenter folderId={this.props.match.params.id} hideNavigation={true} emitter={emitter} />;
  }
}

import React from 'react';
import { getCreateTaskSettings, submitCreateTask } from './createTask';
import { CreateTaskDialog } from './CreateTaskContent';

export default class FunctionWrapCreateTaskDialog extends React.PureComponent {
  constructor(props) {
    super(props);

    this.settings = getCreateTaskSettings(props);
    this.settings.dialog = {
      destroy: () => this.handleClose(),
    };
  }

  handleClose = () => {
    this.props.onClose();
  };

  handleSubmit = () => submitCreateTask(this.settings);

  render() {
    return (
      <CreateTaskDialog
        open={this.props.open}
        settings={this.settings}
        onClose={this.handleClose}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

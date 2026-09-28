import React from 'react';
import { CreateCalendar } from './createCalendar';
import { CreateCalendarDialog } from './CreateCalendarContent';

export default class FunctionWrapCreateCalendarDialog extends React.PureComponent {
  constructor(props) {
    super(props);

    this.createCalendar = new CreateCalendar(props, false);
    this.createCalendar.settings.dialog = {
      destroy: this.handleClose,
    };
  }

  handleClose = () => {
    this.props.onClose();
  };

  handleSubmit = () => this.createCalendar.send();

  render() {
    return (
      <CreateCalendarDialog
        open={this.props.open}
        settings={this.createCalendar.settings}
        onClose={this.handleClose}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

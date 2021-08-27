import React from 'react';
import config from '../../config';

class WidgetListItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="widgetListItem">
        <i className={this.props.WIDGETS[this.props.enumName].icon} />
        <span>{this.props.WIDGETS[this.props.enumName].widgetName}</span>
      </div>
    );
  }
}

export default WidgetListItem;

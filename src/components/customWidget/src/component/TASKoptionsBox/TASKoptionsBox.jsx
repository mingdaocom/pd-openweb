import React from 'react';
import Checkbox from '../common/checkbox';

export default class TASKOptionsBox extends React.Component {
  handleChange(key, value) {
    let options = {
      [key]: value,
    };
    this.props.changeTASKOptions(this.props.widget.id, options);
  }

  render() {
    let { widget } = this.props;

    return (
      <div className="OAOptionsBox">
        {widget.TASKOptions.display !== undefined ? (
          <Checkbox
            toggleCheckbox={this.handleChange.bind(this)}
            optionKey="display"
            checked={widget.TASKOptions.display}
            name={_l('该字段呈现在任务卡片上')}
          />
        ) : (
          undefined
        )}
      </div>
    );
  }
}

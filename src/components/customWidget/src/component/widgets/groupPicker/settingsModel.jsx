import React from 'react';
import config from '../../../config';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  handleChange() {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
    });
  }

  render() {
    return (
      <div>
        <div className="wsItem">
          <span className="wsLf">
            <span>{_l('名称')}</span>
          </span>
          <input
            className="ThemeBorderColor3"
            type="text"
            ref="controlName"
            value={this.props.widget.data.controlName}
            onChange={this.handleChange.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.GROUP_PICKER.type,
  SettingsModel,
};

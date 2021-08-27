import React from 'react';
import config from '../../../config';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  handleChange() {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.controlName.value,
    });
  }

  render() {
    let { widget } = this.props;
    return (
      <div>
        <div className="wsItem">
          <span className="wsLf">{_l('名称')}</span>
          <input
            className="ThemeBorderColor3 allowEmpty"
            data-editcomfirm="true"
            type="text"
            ref={controlName => {
              this.controlName = controlName;
            }}
            value={widget.data.controlName}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.SWITCH.type,
  SettingsModel,
};

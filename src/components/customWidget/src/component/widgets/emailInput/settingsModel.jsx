import React from 'react';
import config from '../../../config';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: Object.assign(this.props.widget.data),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.state = {
      data: Object.assign(nextProps.widget.data),
    };
  }

  handleChange() {
    let data = {
      controlName: this.refs.controlName.value,
      hint: this.refs.hint.value,
    };
    this.setState({
      data,
    });
    this.props.changeWidgetData(this.props.widget.id, data);
  }

  render() {
    return (
      <div className="">
        <div className="wsItem">
          <span className="wsLf">{_l('名称')}</span>
          <input
            className="ThemeBorderColor3"
            data-editcomfirm="true"
            type="text"
            ref="controlName"
            value={this.state.data.controlName}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
        <div className="wsItem">
          <span className="wsLf">{_l('引导文字')}</span>
          <input
            className="ThemeBorderColor3 allowEmpty"
            type="text"
            ref="hint"
            value={this.state.data.hint}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.EMAIL_INPUT.type,
  SettingsModel,
};

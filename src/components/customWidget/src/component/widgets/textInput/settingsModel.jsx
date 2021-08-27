import React from 'react';
import config from '../../../config';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange() {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
      hint: this.refs.hint.value,
    });
  }

  render() {
    let { widget } = this.props;
    return (
      <div className="">
        <div className="wsItem">
          <span className="wsLf">{_l('名称')}</span>
          <input
            className="ThemeBorderColor3"
            data-editcomfirm="true"
            type="text"
            ref="controlName"
            value={widget.data.controlName}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        <div className="wsItem">
          <span className="wsLf">{_l('引导文字')}</span>
          <input className="ThemeBorderColor3 allowEmpty" type="text" ref="hint" value={widget.data.hint} onChange={this.handleChange.bind(this)} />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.TEXT_INPUT.type,
  SettingsModel,
};

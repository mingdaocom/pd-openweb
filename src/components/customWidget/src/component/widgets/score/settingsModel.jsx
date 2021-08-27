import React from 'react';
import config from '../../../config';
import RadioGroup from '../../common/radioGroup';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange() {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
    });
  }

  changeType(value) {
    this.props.changeWidgetData(this.props.widget.id, {
      enumDefault: value,
    });
  }

  render() {
    let { widget } = this.props;
    let typeRadios = widget.scoreArr.map(item => {
      return {
        name: item.name,
        value: item.type,
      };
    });
    return (
      <div className="">
        <div className="wsItem">
          <span className="wsLf">{_l('名称')}</span>
          <input
            className="ThemeBorderColor3"
            data-editcomfirm="true"
            type="text"
            ref="controlName"
            value={this.props.widget.data.controlName}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
        <div className="wsItem">
          <span className="wsLf">{_l('类型')}</span>
          <RadioGroup data={typeRadios} checkedValue={this.props.widget.data.enumDefault} changeRadioValue={this.changeType.bind(this)} size="small" />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.SCORE.type,
  SettingsModel,
};

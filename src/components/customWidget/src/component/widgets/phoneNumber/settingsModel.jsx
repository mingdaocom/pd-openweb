import React from 'react';
import config from '../../../config';
import RadioGroup from '../../common/radioGroup';
import firstInputSelect from '../../common/firstInputSelect';
import _ from 'lodash';

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange() {
    let data = {
      controlName: this.refs.controlName.value,
      hint: this.refs.hint.value,
    };
    this.props.changeWidgetData(this.props.widget.id, data);
  }

  changeRadioValue(value) {
    let widget = config.WIDGETS.PHONE_NUMBER;
    let controlName = _.find(widget.typeArr, item => item.type === value).name + _l('号码');
    let hint = _.find(widget.defaultHintArr, item => item.type === value).hint;
    this.props.changeWidgetData(
      this.props.widget.id,
      {
        type: value,
        controlName,
        hint,
      },
      true
    );
  }

  render() {
    let radios = this.props.widget.typeArr.map(item => {
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
            data-editcomfirm="true"
            className="ThemeBorderColor3"
            type="text"
            ref="controlName"
            value={this.props.widget.data.controlName}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
        <div className="wsItem">
          <span className="wsLf">{_l('类型')}</span>
          <RadioGroup data={radios} checkedValue={this.props.widget.data.type} changeRadioValue={this.changeRadioValue.bind(this)} size="small" />
        </div>
        <div className="wsItem">
          <span className="wsLf">{_l('引导文字')}</span>
          <input
            className="ThemeBorderColor3 allowEmpty"
            type="text"
            ref="hint"
            value={this.props.widget.data.hint}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.PHONE_NUMBER.type,
  SettingsModel,
};

import React from 'react';
import config from '../../../config';
import firstInputSelect from '../../common/firstInputSelect';
import RadioGroup from 'ming-ui/components/RadioGroup';

@firstInputSelect
class SettingsModel extends React.Component {
  /**
   * 整行或半行
   */
  halfOptions = [
    {
      value: false,
      text: _l('整行'),
    },
    {
      value: true,
      text: _l('半行'),
    },
  ];

  constructor(props) {
    super(props);
  }

  handleChange() {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
      hint: this.refs.hint.value,
    });
  }

  /**
   * 修改控件整行半行
   */
  halfChanged = value => {
    this.props.changeWidgetHalf(this.props.widget.id, value);
  };

  render() {
    let { widget } = this.props;
    let toggleHalf = null;
    if (this.props.widget.toggleHalf) {
      toggleHalf = (
        <div className="wsItem">
          <span className="wsLf">
            <span>{_l('类型')}</span>
          </span>
          <RadioGroup
            className="wsRadioGroup inline"
            data={this.halfOptions}
            checkedValue={this.props.widget.data.half}
            onChange={this.halfChanged}
            size="small"
          />
        </div>
      );
    }
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
            maxLength="100"
          />
        </div>
        <div className="wsItem">
          <span className="wsLf">{_l('引导文字')}</span>
          <input
            className="ThemeBorderColor3 allowEmpty"
            type="text"
            ref="hint"
            value={widget.data.hint}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
        {toggleHalf}
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.TEXTAREA_INPUT.type,
  SettingsModel,
};

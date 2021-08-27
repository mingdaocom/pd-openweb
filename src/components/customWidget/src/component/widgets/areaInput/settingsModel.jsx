import React from 'react';
import config from '../../../config';
import Dropdown from '../../common/dropdown';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange() {
    let data = {
      controlName: this.refs.controlName.value,
    };
    this.props.changeWidgetData(this.props.widget.id, data);
  }

  changeDefaultValue(value) {
    this.props.changeWidgetData(
      this.props.widget.id,
      {
        type: parseInt(value, 10),
      },
      true
    );
  }

  render() {
    let { widget } = this.props;
    let arr = widget.typeArr.map(item => {
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
          <span className="wsLf">{_l('所在地区')}</span>
          <Dropdown data={arr} value={widget.data.type} onChange={this.changeDefaultValue.bind(this)} width="140px" />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.AREA_INPUT.type,
  SettingsModel,
};

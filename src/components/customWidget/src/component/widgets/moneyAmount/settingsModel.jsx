import React from 'react';
import config from '../../../config';
import Number from '../../common/number';
import Checkbox from '../../common/checkbox';
import Dropdown from '../../common/dropdown';
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
      unit: this.refs.unit.value,
    };
    this.props.changeWidgetData(this.props.widget.id, data);
  }

  toggleNumber(value) {
    this.props.changeWidgetData(
      this.props.widget.id,
      {
        dot: value,
      },
      true
    );
  }

  render() {
    let { data } = this.props.widget;
    let formulaType = _.cloneDeep(config.formulaType);

    _.remove(formulaType, formula => formula.type === 1);
    let dropdownData = _.map(formulaType, formula => {
      return {
        value: formula.type,
        name: formula.name,
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
            value={data.controlName}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
        <div className="wsItem clearfix">
          <div className="wsHalfItem">
            <span className="wsLf">{_l('单位')}</span>
            <input
              type="text"
              data-editcomfirm="true"
              className="ThemeBorderColor3 halfInput allowEmpty"
              ref="unit"
              value={data.unit}
              onChange={this.handleChange.bind(this)}
              maxLength="20"
            />
          </div>
          <div className="waHalfItem">
            <span className="wsLf">{_l('小数点')}</span>
            <Number number={data.dot} toggleNumber={this.toggleNumber.bind(this)} />
          </div>
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
        {this.props.isDetail ? (
          <div className="wsItem">
            <span className="borderLine mTop5 mBottom10" />
            <Checkbox checked={data.needEvaluate} toggleCheckbox={this.props.toggleCheckbox.bind(this)} name={_l('对当前所有明细的该字段进行统计运算')} />
            <div className="mTop15">
              {_l('统计公式')}：<Dropdown data={dropdownData} value={data.enumDefault2} onChange={this.props.handleChange.bind(this)} />
            </div>
          </div>
        ) : (
          undefined
        )}
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.MONEY_AMOUNT.type,
  SettingsModel,
};

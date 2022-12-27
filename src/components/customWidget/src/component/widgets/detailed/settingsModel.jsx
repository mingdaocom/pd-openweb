import React from 'react';
import config from '../../../config';
import DragDetailedOptions from '../../common/dragDetailedOptions';
import firstInputSelect from '../../common/firstInputSelect';
import Number from '../../common/number';
import Dropdown from '../../common/dropdown';
import _ from 'lodash';

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

  // 改变options
  changeOptionData(value) {
    this.props.changeWidgetData(this.props.widget.id, {
      controls: value.length === 0 ? [{ hint: _l('请选择') }] : value,
    });
  }

  addOption() {
    let widget = _.cloneDeep(this.props.widget);
    let controls = _.cloneDeep(widget.data.controls);
    controls.push({ hint: _l('请选择') });
    this.props.changeWidgetData(this.props.widget.id, {
      controls: controls,
    });
  }

  changeDefaultValue(value) {
    this.props.changeWidgetData(this.props.widget.id, {
      enumDefault: parseInt(value, 10),
    });
  }

  render() {
    let { widget, changeDragPreview, changeDragState } = this.props;
    let count = 0;

    widget.data.controls.forEach(item => {
      if (item.data && item.data.needEvaluate && (item.type === 4 || item.type === 5)) {
        count++;
      }
    });

    return <div className="">
      <div className="wsItem">
        <span className="wsLf">{_l('名称')}</span><input className="ThemeBorderColor3" data-editcomfirm="true" type="text" ref="controlName" value={widget.data.controlName} onChange={this.handleChange.bind(this)} maxLength="100"/>
      </div>
      <div className="wsItem">
        <span className="wsLf">{_l('明细项')}</span>
        <DragDetailedOptions
          widget={widget}
          data={widget.data.controls}
          changeDragPreview={changeDragPreview}
          changeDragState={changeDragState}
          changeData={this.changeOptionData.bind(this)}
          addOption={this.addOption.bind(this)}
          changeWidgetData={this.props.changeWidgetData}
        />
      </div>

      {count > 0
        ? <div className="wsItem">
            <div className="waHalfItem">
              <span className="wsLf" style={{ width: '111px' }}>{_l('统计运算显示')}</span>
              <Dropdown data={widget.positionArr} value={widget.data.enumDefault} onChange={this.changeDefaultValue.bind(this)} width='140px' />
            </div>
          </div>
        : null
      }
    </div>;
  }
}

export default {
  type: config.WIDGETS['DETAILED'].type,
  SettingsModel,
};

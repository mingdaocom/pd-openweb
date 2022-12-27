import React from 'react';
import Checkbox from '../../common/checkbox';
import config from '../../../config';
import RadioGroup from '../../common/radioGroup';
import firstInputSelect from '../../common/firstInputSelect';
import _ from 'lodash';

@firstInputSelect
class SettingsModel extends React.Component {
  userSelectType = [
    {
      value: 0,
      name: _l('单选'),
    },
    {
      value: 1,
      name: _l('多选'),
    },
  ];
  handleChange() {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
    });
  }
  changeRadioValue(value) {
    let oldWigets = this.getOldWigets(config.initalWidgets);
    const oldControl = oldWigets.filter(item => item.type === 26 && item.data.controlId === this.props.widget.data.controlId)[0];
    if (!this.props.widget.data.controlId) {
      this.props.changeWidgetData(this.props.widget.id, { enumDefault: value });
      if (config.isWorkSheet) {
        this.props.changeWidgetHalf(this.props.widget.id, !value);
      }
    }
  }
  /**
   * 取得老数据的widget
   * @memberOf CustomWidget
   */
  getOldWigets(widgets) {
    let oldWidgets = [];
    widgets.forEach(list =>
      list.forEach(widget => {
        if (widget.data && widget.data.controlId) {
          oldWidgets.push(widget);
        }
      })
    );
    return oldWidgets;
  }

  render() {
    const { widget, changeWidgetData } = this.props;
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
            value={widget.data.controlName}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        { config.isWorkSheet && <div className="wsItem">
          <span className="wsLf">{_l('类型')}</span>
          {
            this.props.widget.data.controlId
            ? (_.find(this.userSelectType, type => type.value === this.props.widget.data.enumDefault) || {})['name']
            : <RadioGroup
              data={this.userSelectType}
            checkedValue={widget.data.enumDefault}
              changeRadioValue={this.changeRadioValue.bind(this)} size="small"
            />
          }
        </div> }
        { config.isWorkSheet && <div className="wsItem mBottom0">
          <div className="checkbox-container mBottom5">
            <Checkbox
              toggleCheckbox={(key, value) => {
                changeWidgetData(this.props.widget.id, {
                  noticeItem: value ? 1 : 0,
                });
              }}
              checked={!!widget.data.noticeItem}
              name={_l('通知被选择人员')}
            />
          </div>
        </div> }
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.USER_PICKER.type,
  SettingsModel,
};

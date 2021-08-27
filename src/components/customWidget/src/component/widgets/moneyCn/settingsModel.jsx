import React from 'react';
import config from '../../../config';

import Dropdown from 'ming-ui/components/Dropdown';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      widgets: [],
    };
  }

  componentWillMount() {
    this.getWidgets();
  }

  componentWillReceiveProps() {
    this.getWidgets();
  }

  handleChange() {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
    });
  }

  bindChanged = value => {
    let hint = _l('未关联字段');
    const { widgets } = this.state;

    for (let i in widgets) {
      let widget = widgets[i];

      if (widget.value === value) {
        hint = _l('通过 %0 生成', widget.text);
      }
    }
    this.props.changeWidgetData(this.props.widget.id, {
      dataSource: value,
      hint: hint,
    });
  };

  getWidgets() {
    const widgets = [];

    for (let i in this.props.editWidgets) {
      let line = this.props.editWidgets[i];

      for (let j in line) {
        let widget = line[j];

        // 金额，公式
        if (widget.enumName === 'MONEY_AMOUNT' || widget.enumName === 'FORMULA') {
          const controlId = widget.data.controlId;
          let value = controlId ? `$${controlId}$` : `$${widget.id}$`;

          widgets.push({
            text: widget.data.controlName || widget.widgetName,
            value: value,
          });
        }
      }
    }

    this.setState({ widgets });
  }

  render() {
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
            value={this.props.widget.data.controlName}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        <div className="wsItem">
          <span className="wsLf">
            <span>{ _l('关联表') }</span>
          </span>
          <Dropdown
            className="wsDropdown noBorder inline"
            data={this.state.widgets}
            value={this.props.widget.data.dataSource || ''}
            onChange={this.bindChanged}
            width="140px"
          />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.MONEY_CN.type,
  SettingsModel,
};

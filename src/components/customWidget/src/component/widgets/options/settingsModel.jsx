import React from 'react';
import config from '../../../config';
import _ from 'lodash';
import RadioGroup from '../../common/radioGroup';
import DragOptions from '../../common/dragOptions';
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
  // 切换多选单选
  changeType(value) {
    let oldWigets = this.getOldWigets(config.initalWidgets);
    let widget = this.props.widget;
    let options = _.cloneDeep(widget.data.options);
    // 切换多选单选时改变默认值
    if (value === widget.SINGLE) {
      options.map((item, index) => {
        if (index === 0) {
          item.checked = true;
        } else {
          item.checked = false;
        }
        return item;
      });
    } else if (value === widget.MULTIPLE) {
      options.map(item => {
        item.checked = false;
        return item;
      });
    }
    this.props.changeWidgetData(
      this.props.widget.id,
      {
        type: value,
        options,
      },
      true
    );
  }

  // 改变options
  changeOptionData(value, isConfirm, handleType) {
    this.props.changeWidgetData(
      this.props.widget.id,
      {
        options: value,
      },
      isConfirm
    );
  }

  // 数据源
  changeSourceType(value) {
    this.props.changeWidgetData(this.props.widget.id, {
      sourceType: value,
    });
  }

  // 改变默认选中项
  changeDefaultValue(index) {
    let widget = this.props.widget;
    let options = _.cloneDeep(widget.data.options);
    if (widget.data.type === widget.SINGLE) {
      options.map((item, i) => {
        if (i !== index) {
          item.checked = false;
        }
        return item;
      });
    }
    options[index].checked = !options[index].checked;
    this.props.changeWidgetData(this.props.widget.id, {
      options,
    });
  }

  addOption() {
    let widget = _.cloneDeep(this.props.widget);
    let options = widget.data.options;
    let defaultOption = _.cloneDeep(widget.defaultOption);
    let index = _.remove([...options], item => item.isDeleted === false).length + 1;
    defaultOption.value = defaultOption.value + index;
    options.push(defaultOption);
    this.props.changeWidgetData(this.props.widget.id, {
      options,
    });
  }

  render() {
    let { widget, changeDragPreview, changeDragState } = this.props;
    let typeRadios = widget.typeArr.map(item => {
      return {
        name: item.name,
        value: item.type,
      };
    });
    let optionsRadios = [
      {
        name: _l('自定义'),
        value: config.OPTIONS_DATA.CUSTOM,
      },
      {
        name: _l('数据源'),
        value: config.OPTIONS_DATA.DATA_SOURCE,
      },
    ];
    return (
      <div className="">
        <div className="wsItem">
          <span className="wsLf">{_l('类型')}</span>
          {
            this.props.widget.data.controlId
            ? (_.find(typeRadios, type => type.value === this.props.widget.data.type) || {})['name']
            : <RadioGroup data={typeRadios} checkedValue={this.props.widget.data.type} changeRadioValue={this.changeType.bind(this)} size="small" />
          }
        </div>
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
        <div className="wsItem" style={{ display: 'flex' }}>
          <span
            className="wsLf"
            style={{
              marginTop: '14px',
              width: 'auto',
            }}
          >
            {_l('选项')}
          </span>
          {/* <RadioGroup
          data={optionsRadios}
          checkedValue={this.props.widget.data.sourceType}
          changeRadioValue={this.changeSourceType.bind(this)}
          /> */}
          <DragOptions
            data={widget.data.options}
            changeDragPreview={changeDragPreview}
            changeDragState={changeDragState}
            changeData={this.changeOptionData.bind(this)}
            toggleCheckbox={this.changeDefaultValue.bind(this)}
            addOption={this.addOption.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.OPTIONS.type,
  SettingsModel,
};

import React from 'react';

import config from '../../../config';
import DragOptions from '../../common/dragOptions';

import Dropdown from 'ming-ui/components/Dropdown';
import RadioGroup from 'ming-ui/components/RadioGroup';
import DataSourceList from '../../common/dataSourceList';
import firstInputSelect from '../../common/firstInputSelect';
import _ from 'lodash';

@firstInputSelect
class SettingsModel extends React.Component {
  options = [
    {
      text: _l('自定义'),
      value: 1,
    },
    {
      text: _l('数据源'),
      value: 2,
    },
  ];

  constructor(props) {
    super(props);

    this.state = {
      sourceOptions: [],
    };

    this.getSourceOptions();
  }

  // 获取可用数据源
  getSourceOptions = () => {
    $.get(`${config.OARequest()}/system/source/get?companyId=${config.uniqueParam.companyId}`).then(data => {
      let sourceOptions = [];
      if (data.status === 1) {
        for (let i in data.data) {
          let item = data.data[i];

          if (item && item.id) {
            sourceOptions.push({
              text: item.value,
              value: item.id,
              children: item.children,
            });
          }
        }
      }

      this.setState({
        sourceOptions: sourceOptions,
      });
    });
  };

  handleChange() {
    let data = {
      controlName: this.refs.controlName.value,
      hint: this.refs.hint.value,
    };
    this.props.changeWidgetData(this.props.widget.id, data);
  }

  // 改变options
  changeOptionData(value, isConfirm) {
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
      dataSource: '',
      list: [],
    });
  }

  // 改变默认选中项
  changeDefaultValue(index) {
    let widget = _.cloneDeep(this.props.widget);
    let options = widget.data.options;
    options.map((item, i) => {
      if (i !== index) {
        item.checked = false;
      }
      return item;
    });
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

  dataSourceChanged = value => {
    let list = [];

    for (let i in this.state.sourceOptions) {
      let option = this.state.sourceOptions[i];

      if (option.value === value) {
        for (let j in option.children) {
          let item = option.children[j];

          if (item && item.id) {
            list.push({
              value: item.id,
              label: item.title,
            });
          }
        }
      }
    }

    this.props.changeWidgetData(this.props.widget.id, {
      dataSource: value,
      list: list,
    });
  };

  render() {
    let { widget, changeDragPreview, changeDragState } = this.props;

    let checkedValue = 1;
    if (this.props.widget.data.sourceType === 2 || this.props.widget.data.dataSource) {
      checkedValue = 2;
    }

    let radioGroup = null;
    if (config.isOA) {
      radioGroup = (
        <div className="wsItem">
          <span className="wsLf">{_l('选项')}</span>
          <RadioGroup
            className="wsRadioGroup inline"
            data={this.options}
            checkedValue={checkedValue}
            onChange={this.changeSourceType.bind(this)}
            size="small"
          />
        </div>
      );
    }

    let options = null;
    if (checkedValue === 1) {
      options = (
        <div className="wsItem ingrid">
          <DragOptions
            data={widget.data.options}
            changeDragPreview={changeDragPreview}
            changeDragState={changeDragState}
            changeData={this.changeOptionData.bind(this)}
            toggleCheckbox={this.changeDefaultValue.bind(this)}
            addOption={this.addOption.bind(this)}
          />
        </div>
      );
    } else if (checkedValue === 2) {
      options = (
        <div className="wsItem">
          <span className="wsLf" />
          <Dropdown
            className="wsDropdown maxHeight inline"
            data={this.state.sourceOptions}
            value={this.props.widget.data.dataSource}
            onChange={this.dataSourceChanged}
            width="140px"
          />
          <DataSourceList list={this.props.widget.data.list} />
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
            value={this.props.widget.data.controlName}
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
            value={this.props.widget.data.hint}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
        {radioGroup}
        {options}
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.DROPDOWN.type,
  SettingsModel,
};

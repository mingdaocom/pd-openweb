import React from 'react';
import sheetAjax from 'src/api/worksheet';
import config from '../../../config';
import Dropdown from '../../common/dropdown';
import firstInputSelect from '../../common/firstInputSelect';
import _ from 'lodash';
const systemControl = [
  {
    controlId: 'ownerid',
    controlName: _l('拥有者'),
    type: 26,
  },
  {
    controlId: 'caid',
    controlName: _l('创建者'),
    type: 26,
  },
  {
    controlId: 'ctime',
    controlName: _l('创建时间'),
    type: 16,
  },
  {
    controlId: 'utime',
    controlName: _l('最近修改时间'),
    type: 16,
  },
]

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      widgets: [],
      sheetFieldList: [],
      loadingField: false,
    };
    this.searchSheet = _.debounce(this.getRelateSheetControl, 500);
  }

  handleChange() {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
    });
  }
  componentWillMount() {
    this.getWidgets();
    if (this.props.widget.data.dataSource && !this.props.widget.data.fieldList) {
      this.getRelateSheetControl(this.props.widget.data.dataSource);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.widget.id !== nextProps.widget.id) {
      this.getWidgets();
      if (nextProps.widget.data.dataSource) {
        this.getRelateSheetControl(nextProps.widget.data.dataSource);
      }
    }
  }
  getWidgets() {
    const widgets = [];

    for (let i in this.props.editWidgets) {
      let line = this.props.editWidgets[i];

      for (let j in line) {
        let widget = line[j];

        if (widget.enumName === 'RELATESHEET' && widget.data && widget.data.enumDefault !== 2) {
          widgets.push(widget);
        }
      }
    }
    this.setState({ widgets });
  }
  getRelateSheetControl = function (sheetFieldDataSource) {
    const widgets = [];

    for (let i in this.props.editWidgets) {
      let line = this.props.editWidgets[i];

      for (let j in line) {
        let widget = line[j];

        if (widget.enumName === 'RELATESHEET') {
          widgets.push(widget);
        }
      }
    }
    const filterValue = sheetFieldDataSource.slice(1, -1);
    const selectWidget = widgets.filter(item => item.data.controlId ? item.data.controlId === filterValue : item.id === filterValue)[0];
    if (selectWidget.data.dataSource) {
      this.setState({ loadingField: true });
      sheetAjax.getWorksheetInfo({ worksheetId: selectWidget.data.dataSource, getTemplate: true })
        .then((data) => {
          const fieldList = data.template.controls.filter(item => item.type !== 20 && item.type !== 22 && item.type !== 25 && item.type !== 29 && item.type !== 30 && item.type !== 36 && item.type !== 10010 && item.attribute !== 1).concat(systemControl)
          this.props.changeWidgetData(this.props.widget.id, {
            fieldList: fieldList,
          });
          this.setState({ loadingField: false });
          // this.setState({
          //   sheetFieldList: data.template.controls.map((fieldItem) => {
          //     return { name: fieldItem.controlName, value: fieldItem.controlId };
          //   }),
          // });
        });
    }
  }.bind(this);
  changeRelateSheetValue(value) {
    this.getRelateSheetControl(value);
    this.props.changeWidgetData(this.props.widget.id, {
      dataSource: value,
    });
  }
  changeSheetFieldValue = function (selectField) {
    const { controlName, fieldList, sourceControlId } = this.props.widget.data;
    const selectedField = fieldList.filter(item => item.controlId === sourceControlId)[0];
    if (controlName === _l('他表字段') || !selectedField || (selectedField && controlName === selectedField.controlName)) {
      this.props.changeWidgetData(this.props.widget.id, {
        sourceControlId: selectField.value,
        controlName: selectField.name,
      });
    } else {
      this.props.changeWidgetData(this.props.widget.id, {
        sourceControlId: selectField.value,
      });
    }
  }.bind(this);
  render() {
    let { widget } = this.props;
    let fieldList = [];
    const selectWidgets = this.state.widgets.map((widgetItem) => {
      const controlId = widgetItem.data.controlId;
      let value = controlId ? `$${controlId}$` : `$${widgetItem.id}$`;
      return { name: widgetItem.data.controlName || widgetItem.widgetName, value: value };
    })
    if (widget.data.fieldList) {
      fieldList = widget.data.fieldList.map((fieldItem) => {
        return { name: fieldItem.controlName, value: fieldItem.controlId };
      });
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
          <span className="wsLf">{_l('关联表')}</span>
          <Dropdown
            hint={_l('选择配置的"关联表记录"')}
            noneContent={_l('请先添加一个"关联表记录"字段')}
            data={selectWidgets}
            value={widget.data.dataSource}
            onChange={this.changeRelateSheetValue.bind(this)} width="320px"
          />
        </div>
        <div className="wsItem">
          <span className="wsLf">{_l('显示字段')}</span>
          <Dropdown
            loading={this.state.loadingField}
            hint={_l('请选择')}
            noneContent={_l('请选择一个有效的"关联表记录"字段"')}
            data={fieldList}
            value={widget.data.sourceControlId}
            onChange={(value) => {
              this.changeSheetFieldValue(fieldList.filter(item => item.value === value)[0]);
            }}
            width="320px"
          />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.SHEETFIELD.type,
  SettingsModel,
};

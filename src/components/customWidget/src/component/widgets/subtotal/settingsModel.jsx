import React from 'react';
import { autobind } from 'core-decorators';
import sheetAjax from 'src/api/worksheet';
import config from '../../../config';
import firstInputSelect from '../../common/firstInputSelect';
import Dropdown from '../../common/dropdown';

const systemControl = [
  {
    controlId: 'ownerid',
    controlName: _l('拥有者'),
    type: 26,
  },
  {
    controlId: 'caid',
    controlName: _l('创建人'),
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
];

function getTotalType(control) {
  let { type } = control;
  if (type === 37) {
    type = control.enumDefault2;
  }
  const isDate =
    type === config.WIDGETS.DATE_INPUT.typeArr[0].type || type === config.WIDGETS.DATE_INPUT.typeArr[1].type;
  const TOTAL_TYPE = {
    AVG: { name: _l('平均值'), value: 1 },
    MAX: { name: isDate ? _l('最晚') : _l('最大值'), value: 2 },
    MIN: { name: isDate ? _l('最早') : _l('最小值'), value: 3 },
    PRODUCT: { name: _l('乘积'), value: 4 },
    SUM: { name: _l('求和'), value: 5 },
    COUNTA: { name: _l('计数'), value: 6 },
    ABS: { name: _l('绝对值'), value: 7 },
    INT: { name: _l('取整'), value: 8 },
    MOD: { name: _l('取模'), value: 9 },
    ROUND: { name: _l('四舍五入'), value: 10 },
    ROUNDUP: { name: _l('向上保留小数'), value: 11 },
    ROUNDDOWN: { name: _l('向下保留小数'), value: 12 },
    COUNTY: { name: _l('已填计数'), value: 13 },
    COUNTN: { name: _l('未填计数'), value: 14 },
  };
  switch (type) {
    // 数值
    case 6:
    case 8:
      return [TOTAL_TYPE.COUNTY, TOTAL_TYPE.COUNTN, TOTAL_TYPE.SUM, TOTAL_TYPE.AVG, TOTAL_TYPE.MAX, TOTAL_TYPE.MIN];
    // 时间
    case config.WIDGETS.DATE_INPUT.typeArr[0].type:
    case config.WIDGETS.DATE_INPUT.typeArr[1].type:
      return [TOTAL_TYPE.COUNTY, TOTAL_TYPE.COUNTN, TOTAL_TYPE.MAX, TOTAL_TYPE.MIN];
    default:
      return [TOTAL_TYPE.COUNTY, TOTAL_TYPE.COUNTN];
  }
}

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contolsLoading: true,
      controls: [],
    };
  }

  componentDidMount() {
    const dataSource = this.props.widget.data.dataSource;
    if (dataSource) {
      this.loadControls(dataSource.slice(1, -1));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.widget.data.dataSource !== this.props.widget.data.dataSource) {
      this.setState({
        controls: [],
      });
      if (nextProps.widget.data.dataSource) {
        this.loadControls(nextProps.widget.data.dataSource.slice(1, -1));
      }
    }
  }

  @autobind
  handleChange(data) {
    this.props.changeWidgetData(this.props.widget.id, data);
  }

  @autobind
  handleChangeControlName() {
    this.setState({ controlNameIsDefault: false });
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
    });
  }

  @autobind
  changeRelateSheetControl(value) {
    if (`$${value}$` === this.props.widget.data.dataSource) {
      return;
    }
    this.handleChange({ dataSource: `$${value}$` });
    this.loadControls(value, controls => {
      this.handleChange({ sourceControlId: '' });
    });
  }

  loadControls(relateSheetWidgetId, cb) {
    const { editWidgets } = this.props;
    const { contolsLoading } = this.state;
    const relateSheetWidget = _.find(
      _.flatten(editWidgets),
      widget => widget.data.controlId === relateSheetWidgetId || widget.id === relateSheetWidgetId,
    );
    if (!relateSheetWidget) {
      return;
    }
    if (!contolsLoading) {
      this.setState({ contolsLoading: true });
    }
    sheetAjax.getWorksheetInfo({ worksheetId: relateSheetWidget.data.dataSource, getTemplate: true }).then(data => {
      const controls = data.template.controls
        .filter(
          item =>
            item.type !== 20 &&
            item.type !== 22 &&
            item.type !== 25 &&
            item.type !== 29 &&
            item.type !== 30 &&
            item.type !== 37 &&
            item.type !== 10010,
        )
        .concat(systemControl);
      this.setState({
        loadcontolsLoadinging: false,
        controls,
      });
      if (cb && _.isFunction(cb)) {
        cb(controls);
      }
    });
  }

  render() {
    let { editWidgets, widget } = this.props;
    const { loadingOfContols, controls } = this.state;
    let { data } = widget;
    const relateSheetWidgets = _.flatten(editWidgets).filter(
      widget => widget.data.type === 29 && widget.data.enumDefault === 2,
    );
    const selectedContorl = _.find(controls, control => control.controlId === data.sourceControlId);
    return (
      <div className="subTotalSetting">
        <div className="wsItem">
          <span className="wsLf">{_l('名称')}</span>
          <input
            className="ThemeBorderColor3"
            data-editcomfirm="true"
            type="text"
            ref="controlName"
            value={this.props.widget.data.controlName}
            onChange={this.handleChangeControlName}
            maxLength="100"
          />
        </div>
        <div className="wsItem selectSheet">
          <div className="wsLf">{_l('关联表')}</div>
          <Dropdown
            hint={_l('请选择配置的“关联表记录”字段')}
            noneContent={_l('没有可选的“关联表记录”字段')}
            data={relateSheetWidgets.map(relateSheetWidget => ({
              name: relateSheetWidget.data.controlName,
              value: relateSheetWidget.data.controlId || relateSheetWidget.id,
            }))}
            value={data.dataSource && data.dataSource.slice(1, -1)}
            onChange={this.changeRelateSheetControl}
            width="320px"
          />
        </div>
        {data.dataSource && (
          <div className="wsItem subtotalControl">
            <div className="wsLf">{_l('汇总')}</div>
            <Dropdown
              loading={loadingOfContols}
              data={[{ name: _l('记录数量'), value: '' }].concat(
                controls.map(control => ({ name: control.controlName, value: control.controlId })),
              )}
              value={data.sourceControlId}
              onChange={value => {
                const newSelectedContorl = _.find(controls, control => control.controlId === value);
                const changeedValue = {
                  sourceControlId: value,
                  enumDefault2: 6,
                };
                if (value && newSelectedContorl) {
                  changeedValue.enumDefault = getTotalType(newSelectedContorl)[0].value;
                } else {
                  changeedValue.enumDefault = 0;
                }
                this.handleChange(changeedValue);
              }}
              width="320px"
            />
          </div>
        )}
        {data.sourceControlId && (
          <div className="wsItem">
            <div className="wsLf"></div>
            <Dropdown
              hint={_l('汇总方式')}
              data={selectedContorl ? getTotalType(selectedContorl) : []}
              value={data.enumDefault}
              onChange={value => {
                const changeedValue = {
                  enumDefault: value,
                  enumDefault2: 6,
                };
                if ((selectedContorl.type === 15 || selectedContorl.type === 16) && (value === 2 || value === 3)) {
                  changeedValue.enumDefault2 = selectedContorl.type;
                }
                this.handleChange(changeedValue);
              }}
              width="320px"
            />
          </div>
        )}
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.SUBTOTAL.type,
  SettingsModel,
};

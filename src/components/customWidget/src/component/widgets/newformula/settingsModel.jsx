import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { Parser } from 'hot-formula-parser';
import sheetAjax from 'src/api/worksheet';
import Formula from './Formula';
import config from '../../../config';
import firstInputSelect from '../../common/firstInputSelect';
import Number from '../../common/number';
import { getControlValue } from '../../../utils/util';
import { FORMULA } from './enum';
import _ from 'lodash';

@firstInputSelect
class SettingsModel extends React.Component {
  static propTypes = {
    widget: PropTypes.shape({
      id: PropTypes.string.isRequired,
      data: PropTypes.shape({
        enumDefault2: PropTypes.number,
        controlName: PropTypes.string,
        unit: PropTypes.string,
        dot: PropTypes.number,
        dataSource: PropTypes.string,
      }),
    }),
    editWidgets: PropTypes.arrayOf(PropTypes.shape({})),
    changeWidgetData: PropTypes.func,
  };
  constructor(props) {
    super(props);
    const { dataSource } = props.widget.data;
    this.state = {
      showTestBtn: !!dataSource,
      worksheetData: {},
      testCalResult: '',
    };
  }
  componentDidMount() {
    sheetAjax.getFilterRows({
      worksheetId: config.global.sourceId,
      searchType: 1,
      pageSize: 1,
      pageIndex: 1,
      status: 1,
    }).then((res) => {
      if (res.data && res.data[0]) {
        this.setState({
          worksheetData: res.data[0],
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.widget.id !== this.props.widget.id) {
      this.setState({
        showTestBtn: false,
        testCalResult: '',
      });
    }
  }

  @autobind
  handleChange() {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
      unit: this.refs.unit.value,
    });
  }

  @autobind
  toggleNumber(value) {
    this.props.changeWidgetData(this.props.widget.id, {
      dot: value,
    });
  }

  getFormulaByType(type) {
    const key = _.findKey(FORMULA, obj => obj.type === type);
    return _.assign({}, FORMULA[key], { key });
  }

  @autobind
  testFormula() {
    const parser = new Parser();
    let { widget, editWidgets } = this.props;
    const { worksheetData } = this.state;
    let expression = widget.data.dataSource.replace(/\$(.+?)\$/g, (id) => getControlValue(id.slice(1, -1), editWidgets, worksheetData) || 0);
    let expressionForShow = widget.data.dataSource.replace(/\$(.+?)\$/g, (id) => getControlValue(id.slice(1, -1), editWidgets, worksheetData) || 'null');
    expression = expression.replace(/\/0/g, '/1'); // 除数为0 时按照除数为1计算
    expressionForShow = expressionForShow.replace(/\/0/g, '/1'); // 除数为0 时按照除数为1计算
    const result = parser.parse(expression);
    if (/.*undefined.*/.test(expression)) {
      alert(_l('字段存在空值，无法计算'), 3);
      return;
    }
    if (result.error) {
      alert(_l('计算发生错误'), 3);
      return;
    } else {
      this.setState({
        testCalResult: `${_l('测试：')}${expressionForShow} = ${result.result.toFixed(widget.data.dot)}`.replace(/(\(|\)|\+|\-|\*|\/|\,)/g, ' $1 '),
      });
    }
  }

  render() {
    let { widget, editWidgets, changeFormulaEditStatus } = this.props;
    const { controlName, unit, dot } = widget.data;
    const { worksheetData, testCalResult, showTestBtn } = this.state;
    return (
      <div className="flexRow">
        <div className="flex newformulaSetting">
          <div className="wsItem">
            <span className="wsLf">{_l('名称')}</span>
            <input
              className="ThemeBorderColor3"
              type="text"
              ref="controlName"
              value={controlName}
              onChange={this.handleChange}
              maxLength="100"
            />
          </div>

          <div className="wsItem clearfix">
              <div className="wsHalfItem">
                <span className="wsLf">{_l('单位')}</span>
                <input
                  type="text"
                  className="ThemeBorderColor3 halfInput allowEmpty"
                  ref="unit"
                  value={unit}
                  onChange={this.handleChange}
                  maxLength="20"
                  />
            </div>
            <div className="waHalfItem">
              <span className="wsLf">{ _l('小数点') }</span><Number number={dot} toggleNumber={this.toggleNumber}/>
            </div>
          </div>
          <Formula
            widget={widget}
            worksheetData={worksheetData}
            editWidgets={editWidgets}
            onFormulaEditStatusChange={changeFormulaEditStatus}
            onChange={() => {
              this.setState({
                showTestBtn: false,
                testCalResult: '',
              });
            }}
            onSave={(result) => {
              this.setState({
                showTestBtn: true,
              });
              this.props.changeWidgetData(this.props.widget.id, {
                dataSource: result.formula,
                enumDefault: result.calType,
              });
            }}
          />
          { showTestBtn && <div className="testFormula">
            <span className="testFormulaBtn" onClick={this.testFormula}>{ _l('测试计算结果') }</span>
          </div> }
          { !!testCalResult && <div className="testCalResult">
            { testCalResult }
          </div> }
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.NEW_FORMULA.type,
  SettingsModel,
};

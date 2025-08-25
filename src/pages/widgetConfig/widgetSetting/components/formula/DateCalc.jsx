import React, { Component } from 'react';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Dropdown, TagTextarea } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { createWorksheetColumnTag, formatColumnToText, getFormulaControls } from '../../../util/data';
import ColumnListDropdown from '../ColumnListDropdown';
import DateCalcPicker from './DateCalcPicker';
import ToTodaySetting from './toTodaySetting';

export default class DateCalc extends Component {
  static propTypes = {
    widget: PropTypes.shape({}),
    worksheetData: PropTypes.shape({}),
    editWidgets: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({}))),
    onDataChange: PropTypes.func,
    onFormulaEditStatusChange: PropTypes.func,
  };
  static defaultProps = {
    editWidgets: [],
    worksheetData: {},
    onDataChange: () => {},
  };
  constructor(props) {
    super(props);
    const { dataSource } = props.widget.data;
    this.state = {
      formulaStr: dataSource || '',
      changed: !dataSource,
      formulaColumnSelectVisible: false,
    };
  }

  componentDidMount() {
    const { widget, onFormulaEditStatusChange, onDataChange } = this.props;
    if (widget.data.dot !== 0) {
      onDataChange({ dot: 0 });
    }
    if (this.state.changed && widget.data.enumDefault === 2) {
      onFormulaEditStatusChange(true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { widget } = nextProps;
    if (widget.id !== this.props.widget.id) {
      const dataSource = widget.data.dataSource;
      this.setState({
        formulaStr: dataSource || '',
        changed: !dataSource,
        formulaColumnSelectVisible: false,
      });
      if (this.tagtextarea) {
        this.tagtextarea.setValue(dataSource || '');
      }
    }
  }

  handleCalTypeChange = type => {
    const { onDataChange } = this.props;
    const newValue = {
      enumDefault: type,
      dataSource: '',
      sourceControlId: '',
    };
    onDataChange(newValue);
    this.setState({
      formulaStr: '',
    });
  };

  saveFormula = () => {
    const { onDataChange, onFormulaEditStatusChange } = this.props;
    const sourceControlId = this.props.widget.data.sourceControlId;
    const { formulaStr } = this.state;
    if (!sourceControlId) {
      alert(_l('未添加选择日期'), 3);
      return;
    }
    if (!/^([+-]\d+[YMdhm])+$/.test(formulaStr.replace(/\$(.+?)\$/g, '1'))) {
      alert(_l('公式有语法错误'), 3);
      return;
    }
    onDataChange({
      dataSource: formulaStr,
    });
    onFormulaEditStatusChange(false);
    this.setState({
      changed: false,
    });
  };

  cancelEdit = () => {
    const { widget, onFormulaEditStatusChange } = this.props;
    this.tagtextarea.setValue(widget.data.dataSource);
    onFormulaEditStatusChange(false);
    this.setState({
      changed: false,
      dataSource: widget.data.dataSource,
    });
  };

  render() {
    const {
      widget,
      editWidgets,
      worksheetData,
      onDataChange,
      onFormulaEditStatusChange,
      allControls = [],
    } = this.props;
    const { formulaColumnSelectVisible, formulaStr, changed } = this.state;
    const { data } = widget;
    const { enumDefault, unit, strDefault, sourceControlId = '', dataSource = '' } = data;
    return (
      <div className="DateCalc">
        <div className="settingItem">
          <div className="settingItemTitle">{_l('计算方式')}</div>
          <Dropdown
            className="calType WhiteBG"
            data={[
              {
                text: _l('两个日期间的时长'),
                value: 1,
              },
              {
                text: _l('为日期加减时间'),
                value: 2,
              },
              { text: _l('距离此刻的时长'), value: 3 },
            ]}
            value={enumDefault}
            onChange={this.handleCalTypeChange}
          />
        </div>
        {enumDefault === 3 && <ToTodaySetting {...this.props} />}
        {_.includes([1, 2], enumDefault) && (
          <div className="settingItem">
            <div className="settingItemTitle">{enumDefault === 2 ? _l('选择日期') : _l('计算')}</div>
            <div className={cx('settingItem', { mTop10: enumDefault === 1 })}>
              {enumDefault === 1 && <div className="mBottom8">{_l('开始日期')}</div>}
              <DateCalcPicker
                value={sourceControlId}
                widgets={editWidgets}
                onChange={id => {
                  onDataChange({ sourceControlId: id });
                }}
                hidedIds={[dataSource]}
                worksheetData={worksheetData}
                emptyText={_l('没有可选的字段，请在配置区添加日期字段')}
              />
            </div>
            {enumDefault === 1 && (
              <div className="settingItem mTop10">
                <div className="mBottom8">{_l('结束日期')}</div>
                <DateCalcPicker
                  value={dataSource}
                  widgets={editWidgets}
                  onChange={id => {
                    onDataChange({ dataSource: id });
                  }}
                  hidedIds={[sourceControlId]}
                  worksheetData={worksheetData}
                  emptyText={_l('没有可选的字段，请在配置区添加日期字段')}
                />
              </div>
            )}
            {enumDefault === 1 && (
              <div className="settingItem mTop10">
                <div className="mBottom8">{_l('格式化')}</div>
                <div className="Font12 Gray_9e mBottom8">{_l('参与计算的日期未设置时间时，格式化方式为：')}</div>
                <Dropdown
                  className="WhiteBG calType"
                  data={[
                    { text: _l('开始日期 00:00，结束日期 24:00'), value: '1' },
                    { text: _l('开始日期 00:00，结束日期 00:00'), value: '0' },
                  ]}
                  value={strDefault || '0'}
                  onChange={type => {
                    onDataChange({ strDefault: type });
                  }}
                />
              </div>
            )}
            {enumDefault === 1 && (
              <div className="settingItem mTop10">
                <div className="mBottom8">{_l('输出单位')}</div>
                <Dropdown
                  className="outputType WhiteBG"
                  data={[
                    { text: _l('年'), value: '5' },
                    { text: _l('月'), value: '4' },
                    { text: _l('天'), value: '3' },
                    { text: _l('时'), value: '2' },
                    { text: _l('分'), value: '1' },
                  ]}
                  value={unit}
                  onChange={type => {
                    onDataChange({ unit: type });
                  }}
                />
              </div>
            )}
          </div>
        )}
        {enumDefault === 2 && (
          <div className="settingItem">
            <div className="settingItemTitle">{_l('计算')}</div>
            <p className="Font12 Gray_9e">
              {_l('输入你想要 添加/减去 的时间。如：+8h+1m，-1d+8h。当使用数值类型的字段运算时，请不要忘记输入单位。')}
              <Tooltip
                autoCloseDelay={0}
                title={
                  <Fragment>
                    <div>{_l('年：Y（大写')}</div>
                    <div>{_l('月：M（大写')}</div>
                    <div>{_l('天：d')}</div>
                    <div>{_l('小时：h')}</div>
                    <div>{_l('分：m')}</div>
                  </Fragment>
                }
              >
                <span>{_l('查看时间单位')}</span>
              </Tooltip>
            </p>
          </div>
        )}
        {enumDefault === 2 && (
          <TagTextarea
            rightIcon
            mode={4}
            defaultValue={formulaStr}
            maxHeight={140}
            getRef={tagtextarea => {
              this.tagtextarea = tagtextarea;
            }}
            renderTag={(id, options) =>
              createWorksheetColumnTag(
                id,
                _.assign({}, options, {
                  mode: 4,
                  errorCallback: this.handleChange,
                  editWidgets,
                  worksheetData,
                }),
              )
            }
            onAddClick={() => this.setState({ formulaColumnSelectVisible: true })}
            onChange={(err, value) => {
              onFormulaEditStatusChange(true);
              this.setState({
                formulaStr: value,
                changed: true,
              });
            }}
            onFocus={() => {
              this.setState({ selectColumnVisible: true });
            }}
          />
        )}
        {enumDefault === 2 && (
          <ColumnListDropdown
            visible={formulaColumnSelectVisible}
            onClickAway={() => this.setState({ formulaColumnSelectVisible: false })}
            list={getFormulaControls(allControls, data).map(widget => ({
              value: widget.id,
              filterValue: widget.data.controlName,
              element: (
                <span className="controlItem">
                  <i className={`controlIcon icon-${getIconByType(widget.data.type)}`}></i>
                  <span className="controlName ellipsis">{widget.data.controlName}</span>
                  <span className="controlValue ellipsis">
                    {formatColumnToText(
                      _.assign({}, widget.data, { value: worksheetData[widget.data.controlId] }),
                      true,
                    ) || _l('空')}
                  </span>
                </span>
              ),
              onClick: id => {
                this.tagtextarea.insertColumnTag(id);
              },
            }))}
          />
        )}
        {enumDefault === 2 && changed && (
          <div className="saveOperation">
            <Button className="savelEdit" size="small" onClick={this.saveFormula}>
              {_l('保存')}
            </Button>
            <Button className="cancelEdit" type="link" size="small" onClick={this.cancelEdit}>
              {_l('取消')}
            </Button>
          </div>
        )}
      </div>
    );
  }
}

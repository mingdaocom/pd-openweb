import React from 'react';
import cx from 'classnames';
import { Parser } from 'hot-formula-parser';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, TagTextarea } from 'ming-ui';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { SettingItem } from '../../../styled';
import { genControlTag, getControlTextValue, getControlValue, getFormulaControls } from '../../../util/data';
import ColumnListDropdown from '../ColumnListDropdown';
import PointerConfig from '../PointerConfig';
import PreSuffix from '../PreSuffix';
import { FORMULA } from './enum';
import FnList from './FnList';

const CAL_LIST = ['+', '-', '*', '/', '(', ')'];

const CalItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  div {
    width: 43px;
    height: 28px;
    text-align: center;
    line-height: 26px;
    background: #ffffff;
    border-radius: 3px;
    border: 1px solid #dddddd;
    cursor: pointer;
    &:last-child {
      margin-right: 0;
    }
    &:hover {
      border: 1px solid #1677ff;
    }
  }
`;

export default class Formula extends React.Component {
  constructor(props) {
    super(props);
    const { dataSource } = props.data;
    this.state = {
      calType: FORMULA.CUSTOM.type,
      fnmatch: '',
      fnmatchPos: undefined,
      selectColumnVisible: false,
      showInSideFormulaSelect: false,
      shoOutSideFormulaSelect: false,
      hasDeletedWidget: false,
    };
    this.state.formulaStr = this.getFormulaFromDataSource(this.state.calType, dataSource);
  }

  componentWillReceiveProps(nextProps) {
    const { data } = nextProps;
    const { dataSource, controlId } = data;
    const nextCalType = FORMULA.CUSTOM.type;
    if (controlId !== this.props.data.controlId) {
      const newFormulaStr = this.getFormulaFromDataSource(nextCalType, dataSource);
      this.setState({
        calType: nextCalType,
        formulaStr: newFormulaStr,
        fnmatch: '',
        fnmatchPos: undefined,
        selectColumnVisible: false,
        showInSideFormulaSelect: false,
        shoOutSideFormulaSelect: false,
        hasDeletedWidget: false,
      });
      this.tagtextarea.setValue(newFormulaStr);
    }
  }

  getFormulaFromDataSource(calType, dataSource) {
    return dataSource;
  }

  hideSelectColumn = () => {
    this.setState({ selectColumnVisible: false });
  };

  getFormulaByType(type) {
    const key = _.findKey(FORMULA, obj => obj.type === type);
    return _.assign({}, FORMULA[key], { key });
  }

  getCommonCalType = () => {
    const data = _.keys(FORMULA)
      .slice(1, 6)
      .concat('CUSTOM')
      .map(key => ({
        text: FORMULA[key].fnName,
        value: FORMULA[key].type,
      }));
    return [data.slice(0, -1), data.slice(-1)];
  };

  testFormula = dataSource => {
    const parser = new Parser();
    let { allControls, worksheetData } = this.props;
    let expression = dataSource.replace(
      /\$(.+?)\$/g,
      id => getControlValue(id.slice(1, -1), allControls, worksheetData) || _.uniqueId(),
    );
    expression = expression.replace(/\/0/g, '/1'); // 除数为0 时按照除数为1计算

    const result = parser.parse(expression);
    if (/.*undefined.*/.test(expression)) {
      alert(_l('字段存在空值，无法计算'), 3);
      return;
    }
    if (result.error) {
      alert(_l('计算发生错误'), 3);
      return;
    }
  };

  genFormula = formulaStr => {
    return formulaStr;
  };

  checkFormula = formula => {
    const { calType } = this.state;
    const parser = new Parser();
    return calType === FORMULA.CUSTOM.type
      ? !parser.parse(formula.replace(/\$(.+?)\$/g, () => ` ${_.uniqueId()} `)).error
      : true;
  };

  cancelEdit = () => {
    const { data } = this.props;
    const { calType } = this.state;
    const dataSource = data.dataSource || '';
    if (this.tagtextarea) {
      let value = this.getFormulaFromDataSource(calType, dataSource);
      this.tagtextarea.setValue(value);
      this.setState({
        formulaStr: value,
      });
    }
  };

  saveFormula = () => {
    const { onSave } = this.props;
    const { calType, hasDeletedWidget } = this.state;
    let { formulaStr } = this.state;
    if (hasDeletedWidget) {
      alert(_l('存在已删除的字段'), 3);
      return;
    }
    if (!formulaStr) {
      alert(calType === FORMULA.CUSTOM.type ? _l('请输入计算公式') : _l('请选择参与计算的字段'), 3);
      return;
    }
    // 去掉函数括号内最后一个字段跟着的逗号
    if (formulaStr.match(/,\)/)) {
      formulaStr = formulaStr.replace(/,\)/g, ')');
      this.setState({ formulaStr });
      this.tagtextarea.setValue(formulaStr);
    }
    if (this.checkFormula(formulaStr)) {
      this.testFormula(this.genFormula(formulaStr));
      onSave({
        formula: this.genFormula(formulaStr),
        calType,
      });
    } else {
      alert(_l('公式有语法错误'), 3);
    }
  };

  handleError = err => {
    switch (err) {
      case 1:
        this.setState({
          hasDeletedWidget: true,
        });
        break;
      default:
        break;
    }
  };

  handleChange = (err, value, obj) => {
    if (err) {
      this.handleError(err);
      return;
    }
    const { onChange } = this.props;
    const { fnmatch, calType } = this.state;
    let newFnmatch = '';
    if (obj.origin === '+input') {
      if (!/[0-9|+|\-|*|/|(|),]/.test(obj.text[0])) {
        newFnmatch = fnmatch + obj.text[0];
      }
    }
    if (obj.origin === '+delete' && fnmatch && obj.removed[0]) {
      newFnmatch = /^[A-Z0-9]+$/.test(obj.removed[0]) ? fnmatch.replace(new RegExp(`${obj.removed[0]}$`), '') : '';
    }
    this.setState({
      formulaStr: value,
      fnmatch: newFnmatch,
      showInSideFormulaSelect: newFnmatch,
      selectColumnVisible: !newFnmatch,
      fnmatchPos: newFnmatch ? this.tagtextarea.cmObj.getCursor() : undefined,
      hasDeletedWidget: false,
    });
    onChange({
      dataSource: this.genFormula(value),
      enumDefault: calType,
    });
  };

  handleFnClick = key => {
    const { showInSideFormulaSelect, shoOutSideFormulaSelect, fnmatchPos, fnmatch } = this.state;
    if (showInSideFormulaSelect) {
      this.tagtextarea.cmObj.replaceRange(
        `${key}()`,
        { line: fnmatchPos.line, ch: fnmatchPos.ch - fnmatch.length },
        { line: fnmatchPos.line, ch: fnmatchPos.ch - fnmatch.length + key.length + 2 },
        'insertfn',
      );
      this.tagtextarea.cmObj.setCursor({ line: fnmatchPos.line, ch: fnmatchPos.ch - fnmatch.length + key.length + 1 });
      this.tagtextarea.cmObj.focus();
    } else if (shoOutSideFormulaSelect) {
      const cursor = this.tagtextarea.cmObj.getCursor();
      this.tagtextarea.cmObj.replaceRange(`${key}()`, this.tagtextarea.cmObj.getCursor(), undefined, 'insertfn');
      this.tagtextarea.cmObj.setCursor({ line: cursor.line, ch: cursor.ch + key.length + 1 });
      this.tagtextarea.cmObj.focus();
    }
    this.setState({
      showInSideFormulaSelect: false,
      shoOutSideFormulaSelect: false,
      fnmatch: '',
    });
  };

  render() {
    let { data, allControls, worksheetData, onChange, fromAggregation, className } = this.props;
    const { selectColumnVisible, showInSideFormulaSelect, shoOutSideFormulaSelect, calType, fnmatch } = this.state;
    const dataSource = data.dataSource || '';
    const { nullzero, numshow } = getAdvanceSetting(data);
    let formulaValue = this.getFormulaFromDataSource(calType, dataSource);
    const filterAllControls = filterOnlyShowField(allControls);
    const fnListEle = (
      <FnList
        fnmatch={showInSideFormulaSelect ? fnmatch : ''}
        className={cx('fomulaFnList', {
          isInSide: showInSideFormulaSelect,
          isOutSide: shoOutSideFormulaSelect,
        })}
        onFnClick={this.handleFnClick}
        onClickAwayExceptions={[document.querySelector('.addFormula')]}
        onClickAway={() => {
          this.setState({
            showInSideFormulaSelect: false,
            shoOutSideFormulaSelect: false,
          });
        }}
      />
    );
    return (
      <div className={className}>
        <SettingItem>
          <div className="settingItemTitle">{_l('表达式')}</div>
          <div className="formulaCon">
            <div className="customTip">{_l('输入英文+、-、*、/、( ) 进行运算')}</div>
            <CalItem className="formulaBtns">
              {CAL_LIST.map(calItem => {
                return (
                  <div
                    onClick={() => {
                      this.tagtextarea.cmObj.focus();
                      const cursor = this.tagtextarea.cmObj.getCursor();
                      this.tagtextarea.cmObj.replaceRange(`${calItem}`, cursor, undefined, 'insertfn');
                      this.tagtextarea.cmObj.setCursor({ line: cursor.line, ch: cursor.ch + 2 });
                      const newFnmatch = this.tagtextarea.cmObj.getValue();
                      this.setState({ formulaStr: newFnmatch });
                      onChange({ dataSource: this.genFormula(newFnmatch) });
                    }}
                  >
                    {calItem}
                  </div>
                );
              })}
            </CalItem>

            <div className="formulaBox">
              <TagTextarea
                autoComma
                key={data.controlId}
                mode={2}
                defaultValue={formulaValue}
                height={108}
                maxHeight={140}
                getRef={tagtextarea => {
                  this.tagtextarea = tagtextarea;
                }}
                renderTag={id => genControlTag(allControls, id)}
                onChange={this.handleChange}
                onFocus={() => {
                  this.setState({ selectColumnVisible: true });
                }}
              />
              {showInSideFormulaSelect && fnListEle}
              <ColumnListDropdown
                showSearch
                visible={selectColumnVisible}
                onClickAway={this.hideSelectColumn}
                list={getFormulaControls(filterAllControls, data).map(data => ({
                  value: data.controlId,
                  filterValue: data.controlName,
                  element: _.isEmpty(worksheetData) ? (
                    <span>{data.controlName}</span>
                  ) : (
                    <div>
                      <span className="controlName">{data.controlName}</span>
                      <span className="controlTextValue">
                        {getControlTextValue(data.controlId, allControls, worksheetData, true)}
                      </span>
                    </div>
                  ),
                  onClick: id => {
                    this.tagtextarea.insertColumnTag(id);
                  },
                }))}
              />
            </div>
          </div>
        </SettingItem>
        {data.type === 31 && (
          <Checkbox
            className="mTop12"
            size={fromAggregation ? 'default' : 'small'}
            checked={nullzero === '1'}
            text={_l('参与计算的字段值为空时，视为 0')}
            onClick={checked => {
              onChange(
                handleAdvancedSettingChange(data, {
                  nullzero: checked ? '0' : '1',
                }),
              );
            }}
          />
        )}
        <PointerConfig
          data={data}
          onChange={value => {
            if (value.advancedSetting) {
              onChange(value);
            } else {
              let newVal = value || {};
              if (!Number(value.dot)) {
                newVal.dotformat = '0';
              }
              onChange({ ...handleAdvancedSettingChange(data, newVal), ...value });
            }
          }}
        />
        {numshow !== '1' && (
          <SettingItem>
            <div className="settingItemTitle">{_l('单位')}</div>
            <PreSuffix data={data} onChange={onChange} />
          </SettingItem>
        )}
      </div>
    );
  }
}

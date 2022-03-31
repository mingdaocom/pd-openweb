import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { Parser } from 'hot-formula-parser';
import cx from 'classnames';
import { getRePosFromStr } from 'ming-ui/components/TagTextarea';
import { includes } from 'lodash';
import { TagTextarea, Dropdown, Checkbox } from 'ming-ui';
import PointerConfig from '../PointerConfig';
import NumberUnit from '../NumberUnit';
import ColumnListDropdown from '../ColumnListDropdown';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { getControlValue, getControlTextValue, getFormulaControls, genControlTag } from '../../../util/data';
import { FORMULA } from './enum';
import FnList from './FnList';
import { SettingItem } from '../../../styled';
import PreSuffix from '../PreSuffix';
import NumberConfig from '../ControlSetting/NumberConfig';

export default class Formula extends React.Component {
  constructor(props) {
    super(props);
    const { enumDefault, dataSource } = props.data;
    this.state = {
      calType: enumDefault || FORMULA.SUM.type,
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
    const { enumDefault, dataSource, controlId } = data;
    const nextCalType = enumDefault;
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

  // componentDidUpdate(prevProps) {
  //   if (!_.isEqual(prevProps.worksheetData, this.props.worksheetData)) {
  //     this.tagtextarea.updateTextareaView();
  //   }
  // }

  getFormulaFromDataSource(calType, dataSource) {
    if (calType === FORMULA.CUSTOM.type) {
      return dataSource;
    } else {
      return dataSource
        ? getRePosFromStr(dataSource)
            .map(s => `$${s.tag}$`)
            .join('')
        : '';
    }
  }

  @autobind
  hideSelectColumn() {
    this.setState({ selectColumnVisible: false });
  }

  getFormulaByType(type) {
    const key = _.findKey(FORMULA, obj => obj.type === type);
    return _.assign({}, FORMULA[key], { key });
  }

  @autobind
  getCommonCalType() {
    const data = _.keys(FORMULA)
      .slice(1, 6)
      .concat('CUSTOM')
      .map(key => ({
        text: FORMULA[key].fnName,
        value: FORMULA[key].type,
      }));
    return [data.slice(0, -1), data.slice(-1)];
  }

  @autobind
  testFormula(dataSource) {
    const parser = new Parser();
    let { data, allControls, worksheetData } = this.props;
    const { dot } = data;
    let expression = dataSource.replace(
      /\$(.+?)\$/g,
      id => getControlValue(id.slice(1, -1), allControls, worksheetData) || _.uniqueId(),
    );
    let expressionForShow = dataSource.replace(
      /\$(.+?)\$/g,
      id => getControlValue(id.slice(1, -1), allControls, worksheetData) || 'null',
    );
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
    }
  }

  @autobind
  genFormula(formulaStr) {
    const { calType } = this.state;
    const formulaObj = this.getFormulaByType(calType);
    if (calType === FORMULA.CUSTOM.type) return formulaStr;
    return includes(formulaStr, '$')
      ? `${formulaObj.key}(${getRePosFromStr(formulaStr)
          .map(s => `$${s.tag}$`)
          .join(',')})`
      : '';
  }

  @autobind
  checkFormula(formula) {
    const { calType } = this.state;
    const parser = new Parser();
    return calType === FORMULA.CUSTOM.type
      ? !parser.parse(formula.replace(/\$(.+?)\$/g, () => ` ${_.uniqueId()} `)).error
      : true;
  }

  @autobind
  cancelEdit() {
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
  }

  @autobind
  saveFormula() {
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
  }

  @autobind
  handleError(err) {
    switch (err) {
      case 1:
        this.setState({
          hasDeletedWidget: true,
        });
        break;
      default:
        break;
    }
  }

  @autobind
  handleChange(err, value, obj) {
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
  }

  @autobind
  handleFnClick(key, i) {
    const { showInSideFormulaSelect, shoOutSideFormulaSelect, fnmatchPos, fnmatch } = this.state;
    if (showInSideFormulaSelect) {
      this.tagtextarea.cmObj.replaceRange(
        `${key}()`,
        { line: fnmatchPos.line, ch: fnmatchPos.ch - 1 },
        { line: fnmatchPos.line, ch: fnmatchPos.ch + fnmatch.length },
        'insertfn',
      );
      this.tagtextarea.cmObj.setCursor({ line: fnmatchPos.line, ch: fnmatchPos.ch + key.length });
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
  }

  render() {
    let { data, allControls, worksheetData, onChange } = this.props;
    const { selectColumnVisible, showInSideFormulaSelect, shoOutSideFormulaSelect, calType, fnmatch } = this.state;
    const dataSource = data.dataSource || '';
    const { nullzero, numshow } = getAdvanceSetting(data);
    let formulaValue = this.getFormulaFromDataSource(calType, dataSource);
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
      <div>
        <SettingItem>
          <div className="settingItemTitle">{_l('计算方式')}</div>
          <Dropdown
            border
            className="calType WhiteBG"
            data={this.getCommonCalType()}
            value={calType}
            onChange={type => {
              onChange(
                handleAdvancedSettingChange({ ...data, enumDefault: type }, { nullzero: type === 1 ? '1' : '0' }),
              );
              this.setState({
                calType: type,
                formulaStr: '',
                fnmatch: '',
                fnmatchPos: undefined,
                selectColumnVisible: false,
                showInSideFormulaSelect: false,
                shoOutSideFormulaSelect: false,
                hasDeletedWidget: false,
              });
              this.tagtextarea.setValue('');
            }}
          />
        </SettingItem>
        <SettingItem>
          <div className="settingItemTitle">{this.getFormulaByType(calType).fnName}</div>
          <div className="formulaCon">
            <div className="formulaBox">
              <TagTextarea
                autoComma
                mode={calType === FORMULA.CUSTOM.type ? 2 : 3}
                defaultValue={formulaValue}
                maxHeight={140}
                getRef={tagtextarea => {
                  this.tagtextarea = tagtextarea;
                }}
                renderTag={(id, options) => genControlTag(allControls, id)}
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
                list={getFormulaControls(allControls, data).map(data => ({
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
                  onClick: (id, i) => {
                    this.tagtextarea.insertColumnTag(id);
                  },
                }))}
              />
            </div>
            {calType === FORMULA.CUSTOM.type && (
              <div className="customTip">
                {_l('英文输入+、-、*、/、( ) 进行运算或')}
                <span className="Hand ThemeColor3 addFormula">
                  <span
                    onClick={() => {
                      this.setState({ shoOutSideFormulaSelect: true });
                    }}
                  >
                    {_l('添加公式')}
                  </span>
                  {shoOutSideFormulaSelect && fnListEle}
                </span>
              </div>
            )}
          </div>
        </SettingItem>
        {data.type === 31 && calType === FORMULA.CUSTOM.type && (
          <SettingItem>
            <Checkbox
              size="small"
              checked={nullzero === '1'}
              text={_l('参与计算的字段值为空时，视为0')}
              onClick={checked => {
                onChange(
                  handleAdvancedSettingChange(data, {
                    nullzero: checked ? '0' : '1',
                  }),
                );
              }}
            />
          </SettingItem>
        )}
        <PointerConfig data={data} onChange={onChange} />
        <NumberConfig data={data} onChange={onChange} />
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

import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { Parser } from 'hot-formula-parser';
import cx from 'classnames';
import { Button, TagTextarea } from 'ming-ui';
import { getRePosFromStr } from 'ming-ui/components/TagTextarea';
import Dropdown from 'ming-ui/components/Dropdown';
import ColumnListDropdown from '../../common/ColumnListDropdown';
import FnList from './FnList';
import { getControlTextValue, getAvailableColumn, createWorksheetColumnTag } from '../../../utils/util';
import { FORMULA } from './enum';
import _ from 'lodash';

export default class Formula extends React.Component {
  static propTypes = {
    widget: PropTypes.shape({}),
    worksheetData: PropTypes.shape({}),
    editWidgets: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({}))),
    onChange: PropTypes.func,
    onSave: PropTypes.func,
    onFormulaEditStatusChange: PropTypes.func,
  }
  static defaultProps = {
    worksheetData: {},
    editWidgets: [],
    onChange: () => {},
    onSave: () => {},
    onFormulaEditStatusChange: () => {},
  }
  constructor(props) {
    super(props);
    const { enumDefault, dataSource } = props.widget.data;
    this.state = {
      calType: enumDefault || FORMULA.SUM.type,
      fnmatch: '',
      fnmatchPos: undefined,
      selectColumnVisible: false,
      showInSideFormulaSelect: false,
      shoOutSideFormulaSelect: false,
      changed: !dataSource,
      hasDeletedWidget: false,
    };
    this.state.formulaStr = this.getFormulaFromDataSource(this.state.calType, dataSource);
  }

  componentDidMount() {
    const { onFormulaEditStatusChange } = this.props;
    if (this.state.changed) {
      onFormulaEditStatusChange(true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { widget } = nextProps;
    const nextCalType = widget.data.enumDefault;
    if (widget.id !== this.props.widget.id) {
      const dataSource = widget.data.dataSource;
      const newFormulaStr = this.getFormulaFromDataSource(nextCalType, dataSource);
      this.setState({
        calType: nextCalType,
        formulaStr: newFormulaStr,
        fnmatch: '',
        fnmatchPos: undefined,
        selectColumnVisible: false,
        showInSideFormulaSelect: false,
        shoOutSideFormulaSelect: false,
        changed: !dataSource,
        hasDeletedWidget: false,
      });
      this.tagtextarea.setValue(newFormulaStr);
    }
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.worksheetData, this.props.worksheetData)) {
      this.tagtextarea.updateTextareaView();
    }
  }

  getFormulaFromDataSource(calType, dataSource) {
    if (calType === FORMULA.CUSTOM.type) {
      return dataSource;
    } else {
      return dataSource ? getRePosFromStr(dataSource).map(s => `$${s.tag}$`).join('') : '';
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
    const data = _.keys(FORMULA).slice(1, 6).concat('CUSTOM').map(key => ({
      text: FORMULA[key].fnName,
      value: FORMULA[key].type,
    }));
    return [data.slice(0, -1), data.slice(-1)];
  }

  @autobind
  genFormula(formulaStr) {
    const { calType } = this.state;
    const formulaObj = this.getFormulaByType(calType);
    return calType === FORMULA.CUSTOM.type ? formulaStr : `${formulaObj.key}(${getRePosFromStr(formulaStr).map(s => `$${s.tag}$`).join(',')})`;
  }

  @autobind
  checkFormula(formula) {
    const { calType } = this.state;
    const parser = new Parser();
    return calType === FORMULA.CUSTOM.type ? !parser.parse(formula.replace(/\$(.+?)\$/g, ' 1 ')).error : true;
  }

  @autobind
  cancelEdit() {
    const { widget, onFormulaEditStatusChange } = this.props;
    const { calType } = this.state;
    const dataSource = widget.data.dataSource || '';
    if (this.tagtextarea) {
      let value = this.getFormulaFromDataSource(calType, dataSource);
      this.tagtextarea.setValue(value);
      this.setState({
        formulaStr: value,
        changed: false,
      });
      onFormulaEditStatusChange(false);
    }
  }

  @autobind
  saveFormula() {
    const { onSave, onFormulaEditStatusChange } = this.props;
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
    if (formulaStr.match(/\,\)/)) {
      formulaStr = formulaStr.replace(/\,\)/g, ')');
      this.setState({ formulaStr });
      this.tagtextarea.setValue(formulaStr);
    }
    if (this.checkFormula(formulaStr)) {
      onSave({
        formula: this.genFormula(formulaStr),
        calType,
      });
      this.setState({ changed: false });
      onFormulaEditStatusChange(false);
    } else {
      alert(_l('公式有语法错误'), 3);
    }
  }

  @autobind
  handleError(err) {
    const { onFormulaEditStatusChange } = this.props;
    switch (err) {
      case 1:
        this.setState({
          changed: true,
          hasDeletedWidget: true,
        });
        onFormulaEditStatusChange(true);
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
    const { onChange, onFormulaEditStatusChange } = this.props;
    const { fnmatch } = this.state;
    let newFnmatch = '';
    if (obj.origin === '+input') {
      if (!/[0-9|\+|\-|\*|\/|\(|\),]/.test(obj.text[0])) {
        newFnmatch = fnmatch + obj.text[0];
      }
    }
    if (obj.origin === '+delete' && fnmatch && obj.removed[0]) {
      newFnmatch = /^[A-Z0-9]+$/.test(obj.removed[0]) ? fnmatch.replace(new RegExp(`${obj.removed[0]}$`), '') : '';
    }
    onChange();
    this.setState({
      formulaStr: value,
      changed: true,
      fnmatch: newFnmatch,
      showInSideFormulaSelect: newFnmatch,
      selectColumnVisible: !newFnmatch,
      fnmatchPos: newFnmatch ? this.tagtextarea.cmObj.getCursor() : undefined,
      hasDeletedWidget: false,
    });
    onFormulaEditStatusChange(true);
  }

  @autobind
  handleFnClick(key, i) {
    const { showInSideFormulaSelect, shoOutSideFormulaSelect, fnmatchPos, fnmatch } = this.state;
    if (showInSideFormulaSelect) {
      this.tagtextarea.cmObj.replaceRange(`${key}()`, { line: fnmatchPos.line, ch: fnmatchPos.ch - 1 }, { line: fnmatchPos.line, ch: fnmatchPos.ch + fnmatch.length }, 'insertfn');
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
    let { widget, editWidgets, worksheetData, onChange, onFormulaEditStatusChange } = this.props;
    const { selectColumnVisible, showInSideFormulaSelect, shoOutSideFormulaSelect, changed, calType, fnmatch } = this.state;
    const dataSource = widget.data.dataSource || '';
    let formulaValue = this.getFormulaFromDataSource(calType, dataSource);
    const fnListEle = <FnList
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
    />;
    return (
      <div>
        <div className="wsItem">
            <span className="wsLf">{_l('计算方式')}</span>
            <Dropdown
              className="calType"
              data={this.getCommonCalType()}
              value={calType}
              onChange={(type) => {
                onChange();
                this.setState({
                  calType: type,
                  formulaStr: '',
                  changed: true,
                  fnmatch: '',
                  fnmatchPos: undefined,
                  selectColumnVisible: false,
                  showInSideFormulaSelect: false,
                  shoOutSideFormulaSelect: false,
                  hasDeletedWidget: false,
                });
                this.tagtextarea.setValue('');
                onFormulaEditStatusChange(true);
              }}
            />
          </div>
          <div className="wsItem">
            <span className="wsLf">{ this.getFormulaByType(calType).fnName }</span>
            <div className="formulaCon">
              <div className="formulaBox">
                <TagTextarea
                  mode={calType === FORMULA.CUSTOM.type ? 2 : 3}
                  defaultValue={formulaValue}
                  maxHeight={140}
                  getRef={(tagtextarea) => { this.tagtextarea = tagtextarea; }}
                  renderTag={(id, options) => createWorksheetColumnTag(id, _.assign({}, options, {
                    mode: calType === FORMULA.CUSTOM.type ? 2 : 3,
                    errorCallback: this.handleChange,
                    editWidgets,
                    worksheetData,
                  }))}
                  onChange={this.handleChange}
                  onFocus={() => {
                    this.setState({ selectColumnVisible: true });
                  }}
                />
                { showInSideFormulaSelect && fnListEle }
                <ColumnListDropdown
                  visible={selectColumnVisible}
                  onClickAway={this.hideSelectColumn}
                  list={getAvailableColumn(editWidgets, widget).map(widget => ({
                    value: widget.id,
                    filterValue: widget.data.controlName,
                    element: _.isEmpty(worksheetData) ? <span>{widget.data.controlName}</span> : <div>
                      <span className="controlName">{widget.data.controlName}</span>
                      <span className="controlTextValue">{getControlTextValue(widget.id, editWidgets, worksheetData)}</span>
                    </div>,
                    onClick: (id, i) => {
                      this.tagtextarea.insertColumnTag(id);
                    },
                  }))}
                />
              </div>
              {calType === FORMULA.CUSTOM.type && <div className="customTip">
                {_l('英文输入+、-、*、/、( ) 进行运算或')}
                <span
                  className="Hand ThemeColor3 addFormula"
                >
                  <span
                    onClick={() => {
                      this.setState({ shoOutSideFormulaSelect: true });
                    }}
                  >
                    {_l('添加公式')}
                  </span>
                  {shoOutSideFormulaSelect && fnListEle}
                </span>
              </div>}
              {changed && <div className="saveOperation">
                <Button className="cancelEdit" type="link" size="small" onClick={this.cancelEdit}>{_l('取消')}</Button>
                <Button className="savelEdit" size="small" onClick={this.saveFormula}>{_l('保存')}</Button>
              </div>}
            </div>
          </div>
      </div>
    );
  }
}

import React from 'react';
import config from '../../../config';
import global from '../../../config/globalConfig';
import Checkbox from '../../common/checkbox';
import Dropdown from '../../common/dropdown';
import SingleFormula from '../../common/singleFormula';
import CustomFormula from '../../common/customFormula';
import ContentEditable from '../../common/contentEditable';
import { classSet, returnCustomDataSource, returnCustomString, checkCustomFormula } from '../../../utils/util';
import { getEditModel } from '../../editBox/editModels';
import firstInputSelect from '../../common/firstInputSelect';
import Number from '../../common/number';
import _ from 'lodash';

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange() {
    global.isControlNameFocus = true;
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
      unit: this.refs.unit.value,
    });
  }

  formulaChange(type) {
    this.props.changeWidgetData(this.props.widget.id, {
      enumDefault: parseInt(type, 10),
      dataSource: '',
    });
    this.props.seleteWidgetHighlight(this.props.widget.id, '', true);

    // 需要滚动
    global.shouldScroll = true;
    // 处于编辑状态
    global.activeFormulaId = this.props.widget.id;
  }

  toggleBackgroundClass(evt) {
    $(evt.target).toggleClass('ThemeBGColor2 ThemeBGColor3');
  }

  formulaSingleCancel() {
    this.props.changeWidgetData(this.props.widget.id, {
      dataSource: global.preDataSource,
    });
    this.props.changeFormulaState(false);
    global.alreadySaved = false;
    $('.formulaCustomDetail .customFormulaInput').text('');
    // 处于编辑状态
    global.activeFormulaId = '';
  }

  formulaSingleSave() {
    // 1:自定义公式
    if (this.props.widget.data.enumDefault === 1) {
      let dataSource = returnCustomString();
      if (checkCustomFormula(dataSource)) {
        this.props.changeWidgetData(this.props.widget.id, {
          dataSource: dataSource,
        });
        this.props.changeFormulaState(false);
        global.alreadySaved = false;
        // 处于编辑状态
        global.activeFormulaId = '';
      } else {
        alert(_l('自定义公式有误'), 2);
      }
    } else {
      this.props.changeFormulaState(false);
      global.alreadySaved = false;
      // 处于编辑状态
      global.activeFormulaId = '';
    }
  }

  // 常用公式框点击选中input focus
  commonFormulaClick() {
    this.commonFormulaInput.focus();
  }

  clickSaveDataSourceAndJoinEdit() {
    if (this.props.widget.data.enumDefault && !global.alreadySaved && !this.props.formulaState.formulaEdit) {
      this.props.seleteWidgetHighlight(this.props.widget.id, this.props.widget.data.dataSource);
      global.alreadySaved = true;
    }

    // 需要滚动
    global.shouldScroll = true;
    this.scrollIntoView();
    // 处于编辑状态
    global.activeFormulaId = this.props.widget.id;
  }

  clearInputText(evt) {
    evt.currentTarget.value = '';
  }

  singleFormulaName(id) {
    let formulaName = '';
    this.props.editWidgets.forEach(list =>
      list.forEach(widget => {
        if (widget.id === id) {
          formulaName = widget.data.controlName;
        }
      })
    );
    return formulaName || '';
  }

  removeSingleFormulaItem(id) {
    this.props.seleteSingleWidghtFormula(id);
  }

  // 最后一个聚焦
  customFormulaClick(evt) {
    global.isFocus = true;
    $('.customFormulaInput').focus();
    this.clickSaveDataSourceAndJoinEdit();
  }

  // 过滤除 数字 + - * / () . shift 左右键外的其他字符
  filterCharacter(evt) {
    let formula = $.trim($(evt.target).text());
    global.characterLength = formula.length; // 字符长度含非法字符

    formula = formula.match(/[0-9+-]|\*|\/|\.|\(|\)/g) || [];
    formula = formula.join('');

    global.cursorContent = formula;

    // 回车不需要重新获取位置
    if (evt.keyCode !== 13) {
      global.caretPos = document.getSelection().focusOffset;
    }

    if (evt.keyCode === 37 || evt.keyCode === 39 || evt.keyCode === 16) {
      return false;
    }

    $(evt.target).text(formula);
    global.clickFormulaIndex = $('.formulaDetail')
      .children('.singleFormula')
      .index($(evt.target));
    this.setCursorPosition(evt.target, global.caretPos);
  }

  // 设置光标位置
  setCursorPosition(evt, pos) {
    if (!evt) {
      return;
    }

    let textNode = evt.firstChild;

    if (!textNode) {
      return;
    }

    let range = document.createRange();
    let sel = window.getSelection();
    let legalPos = pos - (global.characterLength - textNode.length);

    evt.focus();

    if (legalPos > textNode.length) {
      legalPos = textNode.length;
    }

    range.setStart(textNode, legalPos);
    range.setEnd(textNode, legalPos);

    sel.removeAllRanges();
    sel.addRange(range);
  }

  // 点击保存坐标
  clickSavePosition(index, evt) {
    this.clickSaveDataSourceAndJoinEdit();

    if (evt.type === 'click' || global.isFocus) {
      global.cursorContent = $(evt.target).text();
      global.caretPos = document.getSelection().focusOffset;
      global.clickFormulaIndex = index;
      global.isFocus = false;
    }

    evt.stopPropagation();
  }

  // 添加常用公式后数据变化
  commonFormulaChange(type) {
    let formulaName = _.find(config.formulaType, formula => formula.type === parseInt(type, 10)).formulaName;
    let leftContent = global.cursorContent.slice(0, global.caretPos);
    let rightContent = global.cursorContent.slice(global.caretPos);
    let dataSource = returnCustomDataSource(returnCustomString());

    dataSource[global.clickFormulaIndex] = leftContent + formulaName + '()' + rightContent;

    global.cursorContent = '';
    if (leftContent) {
      global.clickFormulaIndex++;
    }

    $('.customFormulaInput').text('');

    this.props.changeWidgetData(this.props.widget.id, {
      dataSource: dataSource.join(''),
    });
  }

  // 删除公式
  removeCustomFormulaItem(index, secondIndex) {
    let customDataSource = returnCustomDataSource(this.props.widget.data.dataSource);
    let delItem = customDataSource[index];

    // 含有括号的是常用公式
    if (delItem.indexOf('(') >= 0 && secondIndex !== undefined) {
      let formulaName = delItem.match(/[\s\S]*?\(/)[0];
      let sing = delItem.replace(/[\s\S]*?\(|\)/gi, '');
      let formulaArray = sing ? sing.split(',') : [];
      _.remove(formulaArray, (item, i) => i === secondIndex);
      customDataSource[index] = formulaName + formulaArray.join(',') + ')';
    } else {
      _.remove(customDataSource, (item, i) => i === index);
    }

    this.props.changeWidgetData(this.props.widget.id, {
      dataSource: customDataSource.join(''),
    });
  }

  componentDidUpdate() {
    if (this.props.formulaState.formulaEdit && this.props.widget.data.enumDefault === 1 && !global.isControlNameFocus) {
      let childSpan = $('.formulaCustomDetail')
        .children('span')
        .eq(global.clickFormulaIndex);
      if (childSpan.find('input').length > 0) {
        childSpan.find('input').focus();
      } else {
        childSpan.focus();
        this.setCursorPosition(childSpan[0], 10000000); // 设置光标在最后
        global.cursorContent = childSpan.text();
      }
    }

    global.isControlNameFocus = false;

    this.scrollIntoView();
  }

  saveClickFormulaIndex(index, evt) {
    this.clickSaveDataSourceAndJoinEdit();
    global.clickFormulaIndex = index;
    global.caretPos = document.getSelection().focusOffset;
    evt.stopPropagation();
  }

  formulaSideItemClick(id) {
    if (this.props.formulaState.formulaEdit) {
      this.props.selectFormula(id);
    }
  }

  // 将编辑框和首个目标组件滚动到视图可见区域中
  scrollIntoView = () => {
    if (global.shouldScroll) {
      // 公式编辑框
      $('.formulaDetailBox').each((i, item) => {
        item.scrollIntoView();
      });

      // 公式编辑框
      let list = $('.formulaFocus, .formulaSelected');
      if (list.length) {
        list[0].scrollIntoView();
      }

      global.shouldScroll = false;
    }
  };

  toggleNumber(value) {
    this.props.changeWidgetData(this.props.widget.id, {
      dot: value,
    });
  }

  render() {
    let { widget } = this.props;
    let dropdownData = _.map(config.formulaType, formula => {
      return {
        value: formula.type,
        name: formula.name,
      };
    });

    let formulaType = _.cloneDeep(config.formulaType);
    _.remove(formulaType, formula => formula.type === 1);
    let formulaDropdownData = _.map(formulaType, formula => {
      return {
        value: formula.type,
        name: formula.name,
      };
    });

    let formulaName = widget.data.enumDefault ? _.find(config.formulaType, formula => formula.type === widget.data.enumDefault).formulaName : '';
    let singleData = [];
    let customDataSource;
    let EditModels;

    // 普通公式数据处理
    if (widget.data.enumDefault > 1) {
      singleData = widget.data.dataSource.replace(/\(|\)/g, '').replace(formulaName, '');
      singleData = singleData.length ? singleData.replace(/\$/g, '').split(',') : [];
    }

    // 自定义公式数据处理
    if (widget.data.enumDefault === 1) {
      customDataSource = returnCustomDataSource(widget.data.dataSource);
    }

    // 常用公式下拉数据
    let commonDropdownData = _.cloneDeep(dropdownData);
    _.remove(commonDropdownData, formula => formula.value === 1);

    return (
      <div className="flexRow">
        {this.props.isDetail ? (
          <div className="formulaSide">
            <div className="Font14 mBottom15">{_l('选中明细项进行运算')}</div>
            <table>
              <tbody>
                <tr>
                  <td colSpan="2" className="center">
                    {widget.data.controlName}-1
                  </td>
                </tr>
                {_.map(_.remove(_.cloneDeep(this.props.editWidgets[0]), item => item.id !== undefined), (item, index) => {
                  EditModels = getEditModel(item.type);
                  let sc = classSet({
                    pointer: this.props.formulaState.formulaEdit && item.highLight !== undefined,
                    formulaFocus: this.props.formulaState.formulaEdit && item.highLight === false,
                    formulaSelected: this.props.formulaState.formulaEdit && item.highLight,
                    pointerEvents: this.props.formulaState.formulaEdit && item.highLight === undefined,
                  });
                  return (
                    <tr key={index} className={sc} onClick={this.formulaSideItemClick.bind(this, item.id)}>
                      <td>{item.data.controlName}</td>
                      <td className="relative">
                        <EditModels widget={item} />
                        <div className="formulaSideMask" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          undefined
        )}
        <div className="flex">
          {this.props.isDetail ? <div className="Font14 mBottom15">{_l('设置公式')}</div> : undefined}
          <div className="wsItem">
            <span className="wsLf">{_l('名称')}</span>
            <input
              className="ThemeBorderColor3"
              data-editcomfirm="true"
              type="text"
              ref="controlName"
              value={widget.data.controlName}
              onChange={this.handleChange.bind(this)}
              maxLength="100"
            />
          </div>
          <div className="wsItem clearfix">
            <div className="wsHalfItem">
              <span className="wsLf">{_l('单位')}</span>
              <input
                type="text"
                data-editcomfirm="true"
                className="ThemeBorderColor3 halfInput allowEmpty"
                ref="unit"
                value={this.props.widget.data.unit}
                onChange={this.handleChange.bind(this)}
                maxLength="20"
                />
          </div>
          <div className="waHalfItem">
            <span className="wsLf">{ _l('小数点') }</span><Number number={widget.data.dot} toggleNumber={this.toggleNumber.bind(this)}/>
            </div>
          </div>
          <div className="wsItem">
            <span className="wsLf">{_l('公式')}</span>
            <Dropdown data={dropdownData} value={widget.data.enumDefault} onChange={this.formulaChange.bind(this)} hint={widget.data.hint} />
            <div className="formulaDesc">
              {widget.data.enumDefault === 1
                ? _l('选择公式的自定义，可对数值/金额/公式的控件进行加减乘除（+、-、*、/）的混合运算')
                : _l('选中预置项的公式，可对数值/金额/公式的控件进行计算')}
            </div>
          </div>
          <div className="wsItem">
            <span className="wsLf">{formulaName}</span>
            {widget.data.enumDefault ? (
              <div className="formulaDetailBox">
                {widget.data.enumDefault > 1 ? (
                  <div className="formulaDetail pointer" onClick={this.commonFormulaClick.bind(this)}>
                    <span className="formulaSingleDetail">
                      {_.map(singleData, (id, index) => (
                        <SingleFormula
                          id={id}
                          key={index}
                          addComma={index !== singleData.length - 1}
                          removeSingleFormulaItem={this.removeSingleFormulaItem.bind(this)}
                          name={this.singleFormulaName(id)}
                        />
                      ))}
                      <input
                        type="text"
                        placeholder={widget.data.dataSource ? '' : _l('点击编辑区内高亮的控件做运算')}
                        className={classSet({ noSelect: !widget.data.dataSource }, 'formulaInput')}
                        ref={input => {
                          this.commonFormulaInput = input;
                        }}
                        readOnly={!widget.data.enumDefault}
                        onFocus={this.clickSaveDataSourceAndJoinEdit.bind(this)}
                        onKeyDown={this.clearInputText.bind(this)}
                        onKeyUp={this.clearInputText.bind(this)}
                        onPaste={this.clearInputText.bind(this)}
                      />
                    </span>
                  </div>
                ) : (
                  <div className="formulaDetail formulaCustomDetail pointer" onClick={this.customFormulaClick.bind(this)}>
                    {_.map(customDataSource, (source, index) => {
                      if (
                        source.indexOf('SUM') >= 0 ||
                        source.indexOf('AVG') >= 0 ||
                        source.indexOf('MIN') >= 0 ||
                        source.indexOf('MAX') >= 0 ||
                        source.indexOf('PRODUCT') >= 0
                      ) {
                        return (
                          <CustomFormula
                            widget={source}
                            key={index}
                            index={index}
                            singleFormulaName={this.singleFormulaName.bind(this)}
                            removeCustomFormulaItem={this.removeCustomFormulaItem.bind(this)}
                          />
                        );
                      } else if (source.indexOf('$') >= 0) {
                        return (
                          <SingleFormula
                            id={source.replace(/\$/g, '')}
                            key={index}
                            addComma={false}
                            removeSingleFormulaItem={this.removeCustomFormulaItem.bind(this, index)}
                            name={this.singleFormulaName(source.replace(/\$/g, ''))}
                          />
                        );
                      }
                      return (
                        <ContentEditable
                          key={index}
                          index={index}
                          html={source}
                          saveClickFormulaIndex={this.saveClickFormulaIndex.bind(this)}
                          filterCharacter={this.filterCharacter.bind(this)}
                        />
                      );
                    })}
                    <span
                      className="singleFormula customFormulaInput"
                      contentEditable="true"
                      onClick={this.clickSavePosition.bind(this, customDataSource.length)}
                      onFocus={this.clickSavePosition.bind(this, customDataSource.length)}
                      onKeyUp={this.filterCharacter.bind(this)}
                      onPaste={this.filterCharacter.bind(this)}
                    />
                  </div>
                )}
              </div>
            ) : (
              undefined
            )}
          </div>
          {this.props.formulaState.formulaEdit && widget.data.enumDefault === 1 ? (
            <div className="wsItem">
              <span className="wsLf" />
              <div className="formulaCustom">
                <Dropdown data={commonDropdownData} className="ThemeColor3" onChange={this.commonFormulaChange.bind(this)} hint={_l('+添加常用公式')} />
              </div>
            </div>
          ) : (
            undefined
          )}
          {this.props.formulaState.formulaEdit ? (
            <div className="formulaSingleDetailBtn">
              <span className="formulaCancel pointer Font14 ThemeColor3" onClick={this.formulaSingleCancel.bind(this)}>
                {_l('取消')}
              </span>
              <span
                className="formulaSave pointer Font14 ThemeBGColor3"
                onClick={this.formulaSingleSave.bind(this)}
                onMouseOver={this.toggleBackgroundClass.bind(this)}
                onMouseOut={this.toggleBackgroundClass.bind(this)}
              >
                {_l('确定')}
              </span>
            </div>
          ) : (
            undefined
          )}
          {this.props.isDetail ? (
            <div className="wsItem">
              <span className="borderLine mTop5 mBottom10" />
              <Checkbox
                checked={widget.data.needEvaluate}
                toggleCheckbox={this.props.toggleCheckbox.bind(this)}
                name={_l('对当前所有明细的该字段进行统计运算')}
              />
              <div className="mTop15">
                {_l('统计公式')}：<Dropdown data={formulaDropdownData} value={widget.data.enumDefault2} onChange={this.props.handleChange.bind(this)} />
              </div>
            </div>
          ) : (
            undefined
          )}
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.FORMULA.type,
  SettingsModel,
};

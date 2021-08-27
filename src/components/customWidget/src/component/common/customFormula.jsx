import PropTypes from 'prop-types';
import React from 'react';
import { classSet } from '../../utils/util';
import global from '../../config/globalConfig';
import './customFormula.less';
import SingleFormula from './singleFormula';

class CustomFormula extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    widget: PropTypes.string.isRequired,
    removeCustomFormulaItem: PropTypes.func.isRequired,
    singleFormulaName: PropTypes.func.isRequired,
  };

  removeCustomFormulaItem(index) {
    this.props.removeCustomFormulaItem(this.props.index, index);
  }

  removeCustomFormula() {
    this.props.removeCustomFormulaItem(this.props.index);
  }

  clearInputText(evt) {
    evt.currentTarget.value = '';
  }

  handleClick(evt) {
    global.clickFormulaIndex = this.props.index;

    $(evt.target)
      .closest('.singleFormula')
      .find('.customFormulaText')
      .focus();
    evt.stopPropagation();
  }

  render() {
    let { widget } = this.props;
    let widgetArr = widget.replace(')', '').split('(');
    let customFormulaClass = 'customFormula' + widgetArr[0];
    let singleData = widgetArr[1] ? widgetArr[1].replace(/\$/g, '').split(',') : [];

    return (
      <span className="singleFormula singleFormulas" onClick={this.handleClick.bind(this)}>
        <span className={classSet(customFormulaClass, 'customFormulaName')}>{widgetArr[0]}</span>
        {_.map(singleData, (id, index) => (
          <SingleFormula
            id={id}
            key={index}
            addComma={index !== singleData.length - 1}
            removeSingleFormulaItem={this.removeCustomFormulaItem.bind(this, index)}
            name={this.props.singleFormulaName(id)}
          />
        ))}
        <input
          type="text"
          className="customFormulaText"
          onKeyDown={this.clearInputText.bind(this)}
          onKeyUp={this.clearInputText.bind(this)}
          onPaste={this.clearInputText.bind(this)}
        />
        <span className={classSet(customFormulaClass, 'customFormulaBrackets')} />
        <i className="icon-closeelement-bg-circle singleFormulasDel" onClick={this.removeCustomFormula.bind(this)} />
      </span>
    );
  }
}

export default CustomFormula;

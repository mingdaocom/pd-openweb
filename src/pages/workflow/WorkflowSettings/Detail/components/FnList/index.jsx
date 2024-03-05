import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem } from 'ming-ui';
import { FORMULA } from './enum';
import _ from 'lodash';

export default class FnList extends Component {
  static propTypes = {
    fnmatch: PropTypes.string,
    onClickAwayExceptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string])),
    onClickAway: PropTypes.func,
    onFnClick: PropTypes.func,
  };
  getFormulaKeysWithHr() {
    const keys = _.keys(FORMULA).slice(1);
    keys.splice(5, 0, 'HR-HR');
    return keys;
  }
  render() {
    const { fnmatch, onClickAwayExceptions, onClickAway, onFnClick } = this.props;
    const formulaKeys = this.getFormulaKeysWithHr().filter(
      key => key.match(new RegExp('.*' + fnmatch.toUpperCase() + '.*')) || key === 'HR-HR',
    );
    if (_.last(formulaKeys) === 'HR-HR') {
      formulaKeys.pop();
    }
    return (
      <Menu className="fomulaFnList" onClickAwayExceptions={onClickAwayExceptions} onClickAway={onClickAway}>
        {!formulaKeys.filter(key => key !== 'HR-HR').length && (
          <div className="fnEmpty">{_l('没有找到符合的公式')}</div>
        )}
        {formulaKeys.map((key, i) =>
          key === 'HR-HR' ? (
            <li className="hr" key={i} />
          ) : (
            <MenuItem key={i} onClick={() => onFnClick(key)}>
              <span className="fnKey"> {key} </span>
              <span className="fnName"> {FORMULA[key].fnName} </span>
            </MenuItem>
          ),
        )}
      </Menu>
    );
  }
}

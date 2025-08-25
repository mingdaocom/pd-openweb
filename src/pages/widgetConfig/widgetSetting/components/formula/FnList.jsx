import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import { FORMULA } from './enum';

export default class FnList extends Component {
  static propTypes = {
    className: PropTypes.string,
    fnmatch: PropTypes.string,
    onClickAwayExceptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string])),
    onClickAway: PropTypes.func,
    onFnClick: PropTypes.func,
  };
  getFormulaKeysWithHr() {
    var keys = _.keys(FORMULA).slice(1);
    keys.splice(6, 0, 'HR-HR');
    return keys;
  }
  render() {
    const { className, fnmatch, onClickAwayExceptions, onClickAway, onFnClick } = this.props;
    const formulaKeys = this.getFormulaKeysWithHr().filter(
      key => key.match(new RegExp('.*' + fnmatch + '.*')) || key === 'HR-HR',
    );
    if (_.head(formulaKeys) === 'HR-HR') {
      formulaKeys.shift();
    }
    if (_.last(formulaKeys) === 'HR-HR') {
      formulaKeys.pop();
    }
    return (
      <Menu className={className} onClickAwayExceptions={onClickAwayExceptions} onClickAway={onClickAway}>
        {!formulaKeys.filter(key => key !== 'HR-HR').length && (
          <div className="fnEmpty">{_l('没有找到符合的公式')}</div>
        )}
        {formulaKeys.map((key, i) =>
          key === 'HR-HR' ? (
            <li className="hr" key={i}></li>
          ) : (
            <MenuItem
              key={i}
              onClick={() => {
                onFnClick(key, i);
              }}
            >
              <span className="fnKey"> {key} </span>
              <span className="fnName"> {FORMULA[key].fnName} </span>
            </MenuItem>
          ),
        )}
      </Menu>
    );
  }
}

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Radio } from 'ming-ui';
import cx from 'classnames';
import { isLightColor } from 'src/util';
import { browserIsMobile } from 'src/util';
import OtherInput from '../Checkbox/OtherInput';
import { getCheckAndOther } from '../../tools/utils';
import _ from 'lodash';

export default class Widgets extends Component {
  static propTypes = {
    from: PropTypes.number,
    disabled: PropTypes.bool,
    options: PropTypes.any,
    value: PropTypes.string,
    enumDefault2: PropTypes.number,
    onChange: PropTypes.func,
  };

  /**
   * 渲染列表
   */
  renderList = (item, checkIds) => {
    const { enumDefault2, value, disabled } = this.props;
    const { otherValue } = getCheckAndOther(value);
    return (
      <span
        className={cx(
          'ellipsis customRadioItem',
          { White: enumDefault2 === 1 && !isLightColor(item.color) },
          { 'pLeft12 pRight12': enumDefault2 === 1 || checkIds.length > 1 },
        )}
        style={{ background: enumDefault2 === 1 ? item.color : checkIds.length > 1 ? '#eaeaea' : '' }}
      >
        {otherValue && disabled && browserIsMobile() ? otherValue : item.value}
      </span>
    );
  };

  onChange = key => {
    const { value } = this.props;
    const { checkIds } = getCheckAndOther(value);

    if (_.includes(checkIds, key)) {
      key = '';
    }

    this.props.onChange(JSON.stringify(key ? [key] : []));
  };

  render() {
    const { disabled, advancedSetting, className, vertical, options, value } = this.props;
    const { direction } = advancedSetting || {};
    const { checkIds } = getCheckAndOther(value);
    return (
      <div
        className={cx(
          'customFormControlBox formBoxNoBorder',
          { controlDisabled: disabled },
          { groupColumn: direction === '1' || browserIsMobile() },
        )}
        style={{ height: 'auto' }}
      >
        <div className={`ming RadioGroup2 ${className || ''}`}>
          <div className={cx('RadioGroupCon', { flexColumn: vertical })}>
            {options
              .filter(item => !item.isDeleted && ((disabled && _.includes(checkIds, item.key)) || !disabled))
              .map((item, index) => {
                return browserIsMobile() && disabled && item.key === 'other' ? (
                  <div className="flexColumn">
                    <Radio
                      key={index}
                      disabled={disabled}
                      text={this.renderList(item, checkIds)}
                      value={item.key}
                      checked={_.includes(checkIds, item.key)}
                      title={item.value}
                      onClick={this.onChange}
                    />
                  </div>
                ) : (
                  <div className="flexColumn">
                    <Radio
                      key={index}
                      disabled={disabled}
                      text={this.renderList(item, checkIds)}
                      value={item.key}
                      checked={_.includes(checkIds, item.key)}
                      title={item.value}
                      onClick={this.onChange}
                    />
                    {item.key === 'other' && (
                      <div className="otherInputBox">
                        <OtherInput {...this.props} isSelect={browserIsMobile() ? true : false} />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

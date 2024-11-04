import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Radio } from 'ming-ui';
import cx from 'classnames';
import { isLightColor } from 'src/util';
import { browserIsMobile } from 'src/util';
import OtherInput from '../Checkbox/OtherInput';
import { getCheckAndOther } from '../../tools/utils';
import _ from 'lodash';
import autoSize from 'ming-ui/decorators/autoSize';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

class Widgets extends Component {
  static propTypes = {
    from: PropTypes.number,
    disabled: PropTypes.bool,
    options: PropTypes.any,
    value: PropTypes.string,
    enumDefault2: PropTypes.number,
    onChange: PropTypes.func,
  };

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  getItemWidth = displayOptions => {
    const { width = '200', direction = '2' } = this.props.advancedSetting || {};
    let itemWidth = 100;
    const boxWidth = this.props.width;
    if (boxWidth && direction === '0') {
      const num = Math.floor(boxWidth / Number(width)) || 1;
      itemWidth = 100 / (num > displayOptions.length ? displayOptions.length : num);
    }
    return `${itemWidth}%`;
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

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  render() {
    const { disabled, advancedSetting, className, vertical, options, value } = this.props;
    const { direction = '2', width = '200', readonlyshowall } = advancedSetting || {};
    const { checkIds } = getCheckAndOther(value);
    const readOnlyShow = !browserIsMobile() && readonlyshowall === '1' && disabled ? true : !disabled;
    const displayOptions = options.filter(
      item => !item.isDeleted && (_.includes(checkIds, item.key) || (!item.hide && readOnlyShow)),
    );
    return (
      <div
        className={cx(
          'customFormControlBox formBoxNoBorder',
          { controlDisabled: disabled },
          { readOnlyDisabled: !browserIsMobile() && readonlyshowall === '1' && disabled },
          { groupColumn: direction === '1' || browserIsMobile() },
          { groupRow: direction === '2' && !browserIsMobile() },
        )}
        style={{ height: 'auto' }}
      >
        <div className={`ming RadioGroup2 ${className || ''}`}>
          <div
            className={cx('RadioGroupCon', {
              flexColumn: vertical,
              horizonArrangementRadio: (direction === '0' || direction === '2') && browserIsMobile(),
            })}
          >
            {displayOptions.map((item, index) => {
              return (
                <div
                  className="flexColumn"
                  style={direction === '0' && !browserIsMobile() ? { width: this.getItemWidth(displayOptions) } : {}}
                >
                  {browserIsMobile() && disabled && item.key === 'other' ? (
                    <div
                      className="flexColumn"
                      style={direction === '0' && !browserIsMobile() ? { width: `${width}px` } : {}}
                    >
                      <Radio
                        needDefaultUpdate
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
                    <div
                      className="flexColumn"
                      style={direction === '0' && !browserIsMobile() ? { width: `${width}px` } : {}}
                    >
                      <Radio
                        needDefaultUpdate
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

export default autoSize(Widgets, { onlyWidth: true });

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import RadioGroup from 'ming-ui/components/RadioGroup2';
import cx from 'classnames';
import { isLightColor } from 'src/util';
import { browserIsMobile } from 'src/util';

export default class Widgets extends Component {
  static propTypes = {
    from: PropTypes.number,
    disabled: PropTypes.bool,
    options: PropTypes.any,
    value: PropTypes.string,
    enumDefault2: PropTypes.number,
    onChange: PropTypes.func,
  };

  getData() {
    const { disabled, options, value } = this.props;
    const checkIds = JSON.parse(value || '[]');

    return options
      .filter(item => !item.isDeleted && ((disabled && _.includes(checkIds, item.key)) || !disabled))
      .map(item => {
        return {
          text: this.renderList(item),
          value: item.key,
          checked: _.includes(checkIds, item.key),
          title: item.value,
        };
      });
  }

  /**
   * 渲染列表
   */
  renderList = item => {
    const { enumDefault2, value } = this.props;
    const checkIds = JSON.parse(value || '[]');

    return (
      <span
        className={cx(
          'ellipsis customRadioItem',
          { White: enumDefault2 === 1 && !isLightColor(item.color) },
          { 'pLeft12 pRight12': enumDefault2 === 1 || checkIds.length > 1 },
        )}
        style={{ background: enumDefault2 === 1 ? item.color : checkIds.length > 1 ? '#eaeaea' : '' }}
      >
        {item.value}
      </span>
    );
  };

  onChange = key => {
    const { value } = this.props;
    const checkIds = JSON.parse(value || '[]');

    if (_.includes(checkIds, key)) {
      key = '';
    }

    this.props.onChange(JSON.stringify(key ? [key] : []));
  };

  render() {
    const { disabled, advancedSetting } = this.props;
    const { direction } = advancedSetting || {};

    return (
      <div
        className={cx(
          'customFormControlBox formBoxNoBorder',
          { controlDisabled: disabled },
          { groupColumn: direction === '1' || browserIsMobile() },
        )}
        style={{ height: 'auto' }}
      >
        <RadioGroup disabled={disabled} data={this.getData()} onChange={this.onChange} />
      </div>
    );
  }
}

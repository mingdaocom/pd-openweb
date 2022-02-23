import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { Linkify } from 'ming-ui';

export default class Widgets extends Component {
  static propTypes = {
    value: PropTypes.any,
    type: PropTypes.number,
    dot: PropTypes.number,
    unit: PropTypes.string,
    advancedSetting: PropTypes.object,
  };

  render() {
    const { value, type, dot, unit, advancedSetting } = this.props;
    let content = value;

    if (!_.isUndefined(value) && type === 31) {
      const prefix = advancedSetting.prefix;
      const suffix = advancedSetting.suffix || unit;

      content = _.isUndefined(dot) ? value : _.round(value, dot).toFixed(dot);
      content = content.replace(
        content.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g,
        '$1,',
      );

      content = (prefix ? `${prefix} ` : '') + content + (suffix ? ` ${suffix}` : '');
    }

    return (
      <div className={cx('customFormControlBox customFormTextareaBox customFormReadonly', { spacing: type === 25 })}>
        <Linkify properties={{ target: '_blank' }}>{content}</Linkify>
      </div>
    );
  }
}

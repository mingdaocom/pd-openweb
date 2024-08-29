import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { Linkify } from 'ming-ui';
import { formatStrZero } from 'src/util';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { formatNumberThousand } from 'src/util';

export default class Widgets extends Component {
  static propTypes = {
    value: PropTypes.any,
    type: PropTypes.number,
    dot: PropTypes.number,
    unit: PropTypes.string,
    advancedSetting: PropTypes.object,
  };

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  render() {
    const { value, type, dot, unit, advancedSetting } = this.props;
    const isUnLink = type === 32 && advancedSetting.analysislink !== '1';
    let content = value;

    if (!_.isUndefined(value) && type === 31) {
      const prefix = advancedSetting.prefix;
      const suffix = advancedSetting.suffix || unit;

      if (advancedSetting.numshow === '1' && content) {
        content = parseFloat(content) * 100;
      }

      content = _.isUndefined(dot) ? content : _.round(content, dot).toFixed(dot);

      if (advancedSetting.dotformat === '1') {
        content = formatStrZero(content);
      }

      if (advancedSetting.thousandth !== '1') {
        content = formatNumberThousand(content);
      }

      content = (prefix ? `${prefix} ` : '') + content + (suffix ? ` ${suffix}` : '');
    }

    return (
      <div className={cx('customFormControlBox customFormTextareaBox customFormReadonly', { spacing: type === 25 })}>
        {isUnLink ? content : <Linkify properties={{ target: '_blank' }}>{content}</Linkify>}
      </div>
    );
  }
}

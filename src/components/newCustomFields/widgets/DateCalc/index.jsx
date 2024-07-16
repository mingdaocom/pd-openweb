import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { toFixed, formatStrZero } from 'src/util';
import { formatFormulaDate } from 'src/pages/worksheet/util';
import { getShowFormat } from 'src/pages/widgetConfig/util/setting';
import { dateConvertToUserZone } from 'src/util';
import _, { includes } from 'lodash';
import moment from 'moment';
import { UNIT_TO_TEXT } from 'src/pages/widgetConfig/config/setting.js';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

export default class Widgets extends Component {
  static propTypes = {
    value: PropTypes.string,
    enumDefault: PropTypes.number,
    unit: PropTypes.string,
    advancedSetting: PropTypes.object,
    dot: PropTypes.number,
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
    const { value, enumDefault, unit, advancedSetting, dot } = this.props;
    let content;

    if (!value || (enumDefault === 3 && advancedSetting.hideneg === '1' && parseInt(value, 10) < 0)) {
      content = '';
    } else if (advancedSetting.autocarry === '1') {
      content = formatFormulaDate({ value, unit, dot });
    } else if (enumDefault === 1 || enumDefault === 3) {
      const prefix = advancedSetting.prefix || '';
      const suffix = prefix ? '' : advancedSetting.suffix || UNIT_TO_TEXT[unit] || '';
      const hideUnit = !!prefix || !!suffix;
      let formatValue = toFixed(value, dot);
      if (advancedSetting.dotformat === '1') {
        formatValue = formatStrZero(formatValue);
      }

      content = hideUnit ? prefix + formatValue + suffix : formatValue;
    } else {
      const showFormat = getShowFormat({ advancedSetting: { ...advancedSetting, showtype: unit || '1' } });
      if (includes(showFormat, ':')) {
        content = moment(value).year()
          ? moment(dateConvertToUserZone(moment(moment(value), showFormat))).format(showFormat)
          : moment(dateConvertToUserZone(moment(value, showFormat))).format(showFormat);
      } else {
        content = moment(value).year()
          ? moment(moment(moment(value), showFormat)).format(showFormat)
          : moment(moment(value, showFormat)).format(showFormat);
      }
    }

    return <div className={cx('customFormControlBox customFormReadonly customFormTextareaBox')}>{content}</div>;
  }
}

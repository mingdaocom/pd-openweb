import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { toFixed, formatStrZero } from 'src/util';
import { formatFormulaDate } from 'src/pages/worksheet/util';
import { getShowFormat } from 'src/pages/widgetConfig/util/setting';
import _ from 'lodash';
import moment from 'moment';

export default class Widgets extends Component {
  static propTypes = {
    value: PropTypes.string,
    enumDefault: PropTypes.number,
    unit: PropTypes.string,
    advancedSetting: PropTypes.object,
    dot: PropTypes.number,
  };

  render() {
    const { value, enumDefault, unit, advancedSetting, dot } = this.props;
    let content;

    if (!value || (enumDefault === 3 && advancedSetting.hideneg === '1' && parseInt(value, 10) < 0)) {
      content = '';
    } else if (advancedSetting.autocarry === '1') {
      content = formatFormulaDate({ value, unit, dot });
    } else if (enumDefault === 1 || enumDefault === 3) {
      const prefix = advancedSetting.prefix || '';
      const suffix = advancedSetting.suffix || '';
      const hideUnit = !!prefix || !!suffix;
      let formatValue = toFixed(value, dot);
      if (advancedSetting.dotformat === '1') {
        formatValue = formatStrZero(formatValue);
      }

      content = hideUnit ? prefix + formatValue + suffix : formatValue;
    } else {
      const showFormat = getShowFormat({ advancedSetting: { ...advancedSetting, showtype: unit || '1' } });
      content = moment(value).year()
        ? moment(moment(value), showFormat).format(showFormat)
        : moment(value, showFormat).format(showFormat);
    }

    return <div className={cx('customFormControlBox customFormReadonly customFormTextareaBox')}>{content}</div>;
  }
}

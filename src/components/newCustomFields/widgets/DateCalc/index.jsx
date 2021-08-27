import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { formatFormulaDate } from 'src/pages/worksheet/util';

export default class Widgets extends Component {
  static propTypes = {
    value: PropTypes.string,
    enumDefault: PropTypes.number,
    unit: PropTypes.string,
    advancedSetting: PropTypes.object,
  };

  render() {
    const { value, enumDefault, unit, advancedSetting } = this.props;
    let content;

    if (!value || (enumDefault === 3 && advancedSetting.hideneg === '1' && parseInt(value, 10) < 0)) {
      content = '';
    } else if (enumDefault === 1 || enumDefault === 3) {
      const prefix = advancedSetting.prefix;
      const suffix = advancedSetting.suffix;
      const hideUnit = !!prefix || !!suffix;
      const formatValue = formatFormulaDate(value, unit, hideUnit);

      content = hideUnit ? (prefix ? `${prefix} ` : '') + formatValue + (suffix ? ` ${suffix}` : '') : formatValue;
    } else {
      content = moment(value).format(unit === '3' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
    }

    return <div className={cx('customFormControlBox customFormReadonly customFormTextareaBox')}>{content}</div>;
  }
}

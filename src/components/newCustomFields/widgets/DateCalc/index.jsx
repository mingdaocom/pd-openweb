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
    dot: PropTypes.number,
  };

  render() {
    const { value, enumDefault, unit, advancedSetting, dot } = this.props;
    let content;

    if (!value || (enumDefault === 3 && advancedSetting.hideneg === '1' && parseInt(value, 10) < 0)) {
      content = '';
    } else if (enumDefault === 1 || enumDefault === 3) {
      const prefix = advancedSetting.prefix || '';
      const suffix = advancedSetting.suffix || '';
      const hideUnit = !!prefix || !!suffix;
      const formatValue = formatFormulaDate({ value, unit, hideUnitStr: hideUnit, dot });

      content = hideUnit
        ? prefix + formatValue + suffix
        : formatValue;
    } else {
      content = moment(value).format(unit === '3' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
    }

    return <div className={cx('customFormControlBox customFormReadonly customFormTextareaBox')}>{content}</div>;
  }
}

import React, { memo } from 'react';
import cx from 'classnames';
import { includes } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { getShowFormat } from 'src/pages/widgetConfig/util/setting';
import { formatFormulaDate } from 'src/pages/worksheet/util';
import { dateConvertToUserZone, formatStrZero } from 'src/util';
import { UNIT_TO_TEXT } from '../../../core/enum';
import { toFixed } from '../../tools/utils';

const DateCalc = props => {
  const { value, enumDefault, unit, advancedSetting, dot, triggerCustomEvent, formDisabled } = props;

  const getContent = () => {
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

    return content;
  };

  return (
    <div className={cx('customFormControlBox customFormReadonly', formDisabled ? 'readonlyCheck' : 'readonlyRefresh')}>
      {getContent()}
    </div>
  );
};

DateCalc.propTypes = {
  value: PropTypes.any,
  enumDefault: PropTypes.any,
  unit: PropTypes.string,
  advancedSetting: PropTypes.object,
  dot: PropTypes.number,
  triggerCustomEvent: PropTypes.func,
  formDisabled: PropTypes.bool,
};

export default memo(DateCalc, (prevProps, nextProps) => {
  return _.isEqual(_.pick(prevProps, ['value', 'formDisabled']), _.pick(nextProps, ['value', 'formDisabled']));
});

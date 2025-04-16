import React, { memo, useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Linkify } from 'ming-ui';
import { formatNumberThousand, formatStrZero } from 'src/util';

const Readonly = props => {
  const { value, type, dot, unit, advancedSetting, formDisabled } = props;
  const isUnLink = type === 32 && advancedSetting.analysislink !== '1';
  const [content, setContent] = useState(value);

  useEffect(() => {
    if (!_.isUndefined(value) && type === 31) {
      const prefix = advancedSetting.prefix;
      const suffix = advancedSetting.suffix || unit;

      let initValue = value;

      if (advancedSetting.numshow === '1' && initValue) {
        initValue = parseFloat(initValue) * 100;
      }

      initValue = _.isUndefined(dot) ? initValue : _.round(initValue, dot).toFixed(dot);

      if (advancedSetting.dotformat === '1') {
        initValue = formatStrZero(initValue);
      }

      if (advancedSetting.thousandth !== '1') {
        initValue = formatNumberThousand(initValue);
      }

      initValue = (prefix ? `${prefix} ` : '') + initValue + (suffix ? ` ${suffix}` : '');
      setContent(initValue);
    } else {
      setContent(value);
    }
  }, [value, type, dot, unit, advancedSetting]);

  return (
    <div
      className={cx(
        'customFormControlBox customFormReadonly',
        { spacing: type === 25 },
        formDisabled ? 'readonlyCheck' : 'readonlyRefresh',
      )}
    >
      {isUnLink ? content : <Linkify properties={{ target: '_blank' }}>{content}</Linkify>}
    </div>
  );
};

Readonly.propTypes = {
  value: PropTypes.any,
  type: PropTypes.number,
  dot: PropTypes.number,
  unit: PropTypes.string,
  advancedSetting: PropTypes.object,
  triggerCustomEvent: PropTypes.func,
  formDisabled: PropTypes.bool,
};

export default memo(Readonly, (prevProps, nextProps) => {
  return _.isEqual(_.pick(prevProps, ['value', 'formDisabled']), _.pick(nextProps, ['value', 'formDisabled']));
});

import React, { memo } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Linkify } from 'ming-ui';
import { renderText as renderCellText } from 'src/utils/control';

const FormulaFunc = props => {
  const { advancedSetting = {}, formDisabled } = props;
  const isLink = advancedSetting.analysislink === '1';
  const content = renderCellText(props);

  return (
    <div className={cx('customFormControlBox customFormReadonly', formDisabled ? 'readonlyCheck' : 'readonlyRefresh')}>
      {isLink ? <Linkify properties={{ target: '_blank' }}>{content}</Linkify> : content}
    </div>
  );
};

FormulaFunc.propTypes = {
  advancedSetting: PropTypes.object,
  formDisabled: PropTypes.bool,
};

export default memo(FormulaFunc, (prevProps, nextProps) => {
  return _.isEqual(_.pick(prevProps, ['value', 'formDisabled']), _.pick(nextProps, ['value', 'formDisabled']));
});

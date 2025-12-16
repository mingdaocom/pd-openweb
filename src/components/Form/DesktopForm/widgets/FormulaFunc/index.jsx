import React, { memo } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Linkify } from 'ming-ui';
import { renderText as renderCellText } from 'src/utils/control';

const FormulaFunc = props => {
  const { advancedSetting } = props;
  const isLink = advancedSetting.analysislink === '1';
  const content = renderCellText(props);

  return (
    <div className="customFormControlBox customFormTextareaBox customFormReadonly">
      {isLink ? <Linkify properties={{ target: '_blank' }}>{content}</Linkify> : content}
    </div>
  );
};

FormulaFunc.propTypes = {
  value: PropTypes.any,
  type: PropTypes.number,
  dot: PropTypes.number,
  unit: PropTypes.string,
  advancedSetting: PropTypes.object,
};

export default memo(FormulaFunc, (prevProps, nextProps) => {
  return _.isEqual(_.pick(prevProps, ['value']), _.pick(nextProps, ['value']));
});

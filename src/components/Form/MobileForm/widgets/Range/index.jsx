import React, { memo } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CustomScore } from 'ming-ui';

const RangeWrap = styled.div`
  ${props => (!props.formDisabled && props.disabled ? 'opacity: 0.5' : '')};
  display: flex;
  align-items: center;
  min-height: 37px;
`;

const Range = props => {
  const { disabled, value = 0, formDisabled } = props;

  const onChange = value => {
    props.onChange(value);
  };

  return (
    <RangeWrap formDisabled={formDisabled} disabled={disabled}>
      <CustomScore data={props} hideText={!disabled} score={parseInt(value)} disabled={disabled} callback={onChange} />
    </RangeWrap>
  );
};

Range.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.any,
  enumDefault: PropTypes.number,
  onChange: PropTypes.func,
  triggerCustomEvent: PropTypes.func,
  formDisabled: PropTypes.bool,
};

export default memo(Range, (prevProps, nextProps) => {
  return _.isEqual(_.pick(prevProps, ['value', 'disabled']), _.pick(nextProps, ['value', 'disabled']));
});

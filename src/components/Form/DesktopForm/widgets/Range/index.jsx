import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CustomScore } from 'ming-ui';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const RangeWrapper = styled.div`
  .Score-wrapper .StarScore-item:nth-child(${props => props.activeIndex}) {
    ${props =>
      props.activeIndex
        ? `outline: 2px dashed var(--color-primary-focus-outer);
        outline-offset: 1px;
        transition:
          outline-offset 0s,
          outline 0s;`
        : ''}
  }
`;

const Range = props => {
  const { disabled, value = 0, onChange, advancedSetting = {}, enumDefault, formItemId } = props;
  const maxCount = (advancedSetting || {}).max || (enumDefault === 1 ? 5 : 10);
  const [activeIndex, setActiveIndex] = useState(0);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      switch (triggerType) {
        case 'trigger_tab_enter':
          setActiveIndex(1);
          break;
        case 'ArrowRight':
          setActiveIndex(prevIndex => Math.min(prevIndex + 1, maxCount));
          break;
        case 'ArrowLeft':
          setActiveIndex(prevIndex => Math.max(prevIndex - 1, 1));
          break;
        case 'Enter':
          setActiveIndex(prevIndex => {
            const nextValue = parseInt(valueRef.current || '0') === prevIndex ? 0 : prevIndex;
            onChange(nextValue.toString());
            return prevIndex;
          });
          break;
        case 'trigger_tab_leave':
          setActiveIndex(0);
          break;
        default:
          break;
      }
    }, []),
  );

  const handleChange = value => {
    onChange(value);
  };

  return (
    <RangeWrapper
      className={cx('customFormControlBox customFormButton flexRow customFormControlScore', {
        controlDisabled: disabled,
      })}
      activeIndex={activeIndex}
    >
      <CustomScore
        from={'recordInfo'}
        data={props}
        hideText={false}
        score={parseInt(value)}
        disabled={disabled}
        callback={handleChange}
      />
    </RangeWrapper>
  );
};

Range.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.any,
  enumDefault: PropTypes.number,
  onChange: PropTypes.func,
};

export default memo(Range, (prevProps, nextProps) => {
  return _.isEqual(_.pick(prevProps, ['value', 'disabled']), _.pick(nextProps, ['value', 'disabled']));
});

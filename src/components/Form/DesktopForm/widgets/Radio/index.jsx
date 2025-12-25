import React, { Fragment, memo, useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Radio } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import { isLightColor } from 'src/utils/control';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import { getCheckAndOther } from '../../../core/utils';
import OtherInput from '../Checkbox/OtherInput';

const RadioWidgetWrapper = styled.div`
  .RadioGroupCon > div:nth-child(${props => props.activeIndex}) {
    .Radio-box {
      ${props =>
        props.activeIndex
          ? `outline: 3px solid var(--color-primary-focus-outer);
          outline-offset: 1px;
          transition:
            outline-offset 0s,
            outline 0s;`
          : ''}
    }
  }
`;

const RadioWidget = props => {
  const {
    disabled,
    advancedSetting,
    className,
    vertical,
    options,
    value,
    onConClick = () => {},
    width: boxWidth,
    enumDefault2,
    onChange,
    formItemId,
  } = props;
  const [activeIndex, setActiveIndex] = useState(0);
  const radioRef = useRef(null);

  const { direction = '2', width = '200', readonlyshowall } = advancedSetting || {};
  const { checkIds } = getCheckAndOther(value);
  const readOnlyShow = readonlyshowall === '1' && disabled ? true : !disabled;
  const displayOptions = options.filter(
    item => !item.isDeleted && (_.includes(checkIds, item.key) || (!item.hide && readOnlyShow)),
  );

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      switch (triggerType) {
        case 'trigger_tab_enter':
          setActiveIndex(1);
          break;
        case 'trigger_tab_leave':
          setActiveIndex(0);
          break;
        case 'ArrowRight':
          setActiveIndex(prevIndex => Math.min(prevIndex + 1, displayOptions.length));
          break;
        case 'ArrowLeft':
          setActiveIndex(prevIndex => Math.max(prevIndex - 1, 0));
          break;
        case 'Enter':
          setActiveIndex(prevIndex => {
            const optionElements = radioRef.current.querySelectorAll('.ming.Radio');
            const options = [...optionElements];
            const activeElement = options[prevIndex - 1];
            if (activeElement) {
              activeElement.click();
            }
            return prevIndex;
          });
          break;
        default:
          break;
      }
    }, []),
  );

  const getItemWidth = displayOptions => {
    const { width: settingWidth = '200', direction: settingDirection = '2' } = advancedSetting || {};
    let itemWidth = 100;
    if (boxWidth && settingDirection === '0') {
      const num = Math.floor(boxWidth / Number(settingWidth)) || 1;
      itemWidth = 100 / (num > displayOptions.length ? displayOptions.length : num);
    }
    return `${itemWidth}%`;
  };

  /**
   * 渲染列表
   */
  const renderList = (item, checkIds) => {
    return (
      <span
        className={cx(
          'ellipsis customRadioItem',
          { White: enumDefault2 === 1 && !isLightColor(item.color) },
          { 'pLeft12 pRight12': enumDefault2 === 1 || checkIds.length > 1 },
        )}
        style={{ background: enumDefault2 === 1 ? item.color : checkIds.length > 1 ? '#eaeaea' : '' }}
      >
        {item.value}
      </span>
    );
  };

  const handleChange = key => {
    const { checkIds } = getCheckAndOther(value);

    if (_.includes(checkIds, key)) {
      key = '';
    }

    onChange(JSON.stringify(key ? [key] : []));
  };

  return (
    <RadioWidgetWrapper
      className={cx(
        'customFormControlBox formBoxNoBorder',
        { controlDisabled: disabled },
        { readOnlyDisabled: readonlyshowall === '1' && disabled },
        { groupColumn: direction === '1' },
        { groupRow: direction === '2' },
      )}
      style={{ height: 'auto' }}
      onClick={onConClick}
      activeIndex={activeIndex}
    >
      <div className={`ming RadioGroup2 ${className || ''}`}>
        <div
          ref={radioRef}
          className={cx('RadioGroupCon', {
            flexColumn: vertical || direction === '1',
          })}
        >
          {displayOptions.map((item, index) => {
            return (
              <Fragment key={index}>
                <div className="flexColumn" style={direction === '0' ? { width: getItemWidth(displayOptions) } : {}}>
                  <div className="flexColumn" style={direction === '0' ? { width: `${width}px` } : {}}>
                    <Radio
                      needDefaultUpdate
                      disabled={disabled}
                      text={renderList(item, checkIds)}
                      value={item.key}
                      checked={_.includes(checkIds, item.key)}
                      title={item.value}
                      onClick={handleChange}
                    />
                  </div>
                </div>
                {item.key === 'other' && !disabled && (
                  <div className="otherInputBox w100">
                    <OtherInput className="pLeft0" {...props} isSelect={false} />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </RadioWidgetWrapper>
  );
};

RadioWidget.propTypes = {
  from: PropTypes.number,
  disabled: PropTypes.bool,
  options: PropTypes.any,
  value: PropTypes.string,
  enumDefault2: PropTypes.number,
  onChange: PropTypes.func,
};
const RadioComponent = autoSize(RadioWidget, { onlyWidth: true });

export default memo(RadioComponent, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'width', 'disabled']),
    _.pick(nextProps, ['value', 'width', 'disabled']),
  );
});

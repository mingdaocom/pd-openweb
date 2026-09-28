import React, { Fragment, memo, useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Radio } from 'ming-ui/antd-components';
import autoSize from 'ming-ui/components/AutoSize';
import { isLightColor } from 'src/utils/domain/control/style';
import { getCheckAndOther } from 'src/utils/domain/control/value';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import OtherInput from '../Checkbox/OtherInput';

const RadioWidgetWrapper = styled.div`
  .radioOption,
  .radioOptionContent,
  .hap-radio-wrapper,
  .hap-radio-label {
    min-width: 0;
    max-width: 100%;
  }
  .hap-radio-label {
    overflow: hidden;
  }
  .RadioGroupCon > div:nth-child(${props => props.$activeIndex}) {
    .ant-radio-inner {
      ${props =>
        props.$activeIndex
          ? `outline: 3px solid var(--color-primary-focus-outer);
          outline-offset: 1px;
          transition:
            outline-offset 0s,
            outline 0s;`
          : ''}
    }
  }
  .hap-radio-wrapper {
    margin-right: 20px;
    margin-bottom: 10px;
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
            const optionElements = radioRef.current.querySelectorAll('.ant-radio-wrapper');
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
          { textPrimary: disabled && enumDefault2 !== 1 },
          { textWhite: enumDefault2 === 1 && !isLightColor(item.color) },
          { textBlack: enumDefault2 === 1 && isLightColor(item.color) },
          { 'pLeft12 pRight12': enumDefault2 === 1 || checkIds.length > 1 },
        )}
        style={{
          background: enumDefault2 === 1 ? item.color : checkIds.length > 1 ? 'var(--color-border-secondary)' : '',
        }}
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
      $activeIndex={activeIndex}
    >
      <div className={`ming RadioGroup2 ${className || ''}`}>
        <div
          ref={radioRef}
          className={cx('RadioGroupCon', {
            flexColumn: vertical || direction === '1',
          })}
        >
          {displayOptions.map((item, index) => {
            const checked = _.includes(checkIds, item.key);

            return (
              <Fragment key={index}>
                <div
                  className="flexColumn radioOption"
                  style={direction === '0' ? { width: getItemWidth(displayOptions) } : {}}
                >
                  <div
                    className="flexColumn radioOptionContent"
                    style={direction === '0' ? { width: `${width}px` } : {}}
                  >
                    <Radio
                      styles={{ root: { opacity: 1 } }}
                      disabled={disabled}
                      value={item.key}
                      checked={checked}
                      title={item.value}
                      onClick={() => !disabled && handleChange(item.key)}
                    >
                      {renderList(item, checkIds)}
                    </Radio>
                  </div>
                </div>
                {item.key === 'other' && (
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

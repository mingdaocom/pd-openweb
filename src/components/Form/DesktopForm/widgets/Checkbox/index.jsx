import React, { Fragment, memo, useCallback, useRef, useState } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Checkbox, Icon } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import { MAX_OPTIONS_COUNT } from 'src/pages/widgetConfig/config';
import { isLightColor } from 'src/utils/control';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import { getCheckAndOther } from '../../../core/utils';
import OtherInput from './OtherInput';

const CheckboxWidgetWrapper = styled.div`
  .ming.CheckboxGroup > div:nth-child(${props => props.activeIndex}) {
    .ming.Checkbox {
      overflow: unset;
      .Checkbox-text {
        overflow: hidden;
      }
    }
    .Checkbox-box {
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

const CheckboxWidgets = props => {
  const {
    disabled,
    isFocus: initialIsFocus = false,
    options,
    value,
    enumDefault2,
    onChange,
    className,
    advancedSetting = {},
    hint,
    dropdownClassName,
    selectProps,
    isSheet,
    onConClick,
    width,
    type,
    formItemId,
    createEventHandler = () => {},
  } = props;
  const [isFocus, setIsFocus] = useState(initialIsFocus);
  const [keywords, setKeywords] = useState('');
  const selectRef = useRef(null);
  const checkRef = useRef(null);

  const {
    direction = '2',
    width: itemWidth = '200',
    readonlyshowall,
    showselectall,
    checktype,
    chooseothertype,
    allowadd,
  } = advancedSetting;
  const [activeIndex, setActiveIndex] = useState(0);

  useWidgetEvent(
    formItemId,
    useCallback(
      data => {
        const { triggerType } = data;
        switch (triggerType) {
          case 'trigger_tab_enter':
            if (checktype === '1') {
              selectRef.current && selectRef.current.focus();
            } else {
              setActiveIndex(1);
            }
            break;
          case 'trigger_tab_leave':
            if (checktype === '1') {
              selectRef.current && selectRef.current.blur();
            } else {
              setActiveIndex(0);
            }
            break;
          case 'ArrowLeft':
          case 'ArrowRight':
          case 'Enter':
            if (checktype === '1') {
              return;
            }
            const optionElements = checkRef.current.querySelectorAll('.ming.Checkbox');
            const options = [...optionElements];

            if (triggerType === 'ArrowRight') {
              setActiveIndex(prevIndex => {
                const newIndex = Math.min(prevIndex + 1, options.length);
                return newIndex;
              });
            } else if (triggerType === 'ArrowLeft') {
              setActiveIndex(prevIndex => {
                const newIndex = Math.max(prevIndex - 1, 1);
                return newIndex;
              });
            } else if (triggerType === 'Enter') {
              setActiveIndex(prevIndex => {
                const activeElement = $(options[prevIndex - 1]);
                activeElement.click();
                return prevIndex;
              });
            }
            break;
          default:
            break;
        }
      },
      [checktype],
    ),
  );

  /**
   * 渲染列表
   */
  const renderList = useCallback(
    (item, noMaxWidth) => {
      return (
        <span
          className={cx(
            'customRadioItem WordBreak ellipsis',
            { White: enumDefault2 === 1 && !isLightColor(item.color) },
            {
              'pLeft12 pRight12': enumDefault2 === 1,
            },
          )}
          style={{
            background: enumDefault2 === 1 ? item.color : '',
            maxWidth: noMaxWidth ? 'auto' : 140,
          }}
        >
          {item.value}
        </span>
      );
    },
    [enumDefault2],
  );

  const onSave = values => {
    onChange(JSON.stringify(values));
  };

  const handleChange = (checked, key) => {
    const checkIds = JSON.parse(value || '[]');

    if (checked) {
      _.remove(checkIds, item => (key === 'other' ? item.startsWith(key) : item === key));
    } else {
      checkIds.push(key);
      if (chooseothertype === '1') {
        _.remove(checkIds, item => (key === 'other' ? !item.startsWith('other') : item.startsWith('other')));
      }
    }

    onSave(checkIds);
  };

  const handleSelectAll = (options = [], isChecked) => {
    // 多选平铺, 多选选中则清空
    if (type === 10 && checktype !== '1' && isChecked) {
      onChange('');
      return;
    }
    const otherIds = options.map(i => i.key);
    onChange(JSON.stringify(otherIds));
  };

  const getItemWidth = useCallback(
    displayOptions => {
      let itemTempWidth = 100;
      const boxWidth = width;
      if (boxWidth && direction === '0') {
        const num = Math.floor(boxWidth / Number(itemWidth)) || 1;
        itemTempWidth = 100 / (num > displayOptions.length ? displayOptions.length : num);
      }
      return `${itemTempWidth}%`;
    },
    [width, direction, itemWidth],
  );

  const renderSelectAll = (checkIds = [], displayOptions = []) => {
    if (disabled || showselectall !== '1') return null;

    if (chooseothertype === '1') {
      displayOptions = displayOptions.filter(i => i.key !== 'other');
    }

    if (checktype !== '1') {
      const isChecked = _.every(displayOptions, d => _.find(checkIds, c => c.includes(d.key)));
      const clearselected = !isChecked && _.some(displayOptions, d => _.find(checkIds, c => c.includes(d.key)));
      return (
        <div className="flexColumn w100">
          <Checkbox
            key="select-all"
            title={_l('全选')}
            text={<span style={{ paddingTop: '3px', display: 'inline-block' }}>{_l('全选')}</span>}
            value="select-all"
            clearselected={clearselected}
            checked={isChecked}
            onClick={() => {
              handleSelectAll(displayOptions, isChecked);
            }}
          />
        </div>
      );
    }

    return (
      <Select.Option value="select-all" key="select-all">
        <span className="ellipsis customRadioItem ThemeColor3">{_l('全选')}</span>
      </Select.Option>
    );
  };

  const pcContent = checkIds => {
    const readOnlyShow = readonlyshowall === '1' && disabled ? true : !disabled;
    const displayOptions = options.filter(
      item => !item.isDeleted && (_.includes(checkIds, item.key) || (!item.hide && readOnlyShow)),
    );
    const noMaxWidth = direction === '0' && itemWidth;

    return (
      <Fragment>
        {renderSelectAll(checkIds, displayOptions)}
        {displayOptions.map(item => {
          return (
            <Fragment key={item.key}>
              <div className="flexColumn" style={direction === '0' ? { width: getItemWidth(displayOptions) } : {}}>
                <div className="flexColumn" style={direction === '0' ? { width: `${itemWidth}px` } : {}}>
                  <Checkbox
                    className={cx('w100', {
                      flexWidth: noMaxWidth,
                    })}
                    disabled={disabled}
                    title={item.value}
                    text={renderList(item, noMaxWidth)}
                    value={item.key}
                    checked={_.includes(checkIds, item.key)}
                    onClick={handleChange}
                  />
                </div>
              </div>
              {item.key === 'other' && (
                <OtherInput
                  className="w100 pLeft0"
                  disabled={disabled}
                  options={options}
                  value={value}
                  onChange={onChange}
                  advancedSetting={advancedSetting}
                  isSelect={false}
                />
              )}
            </Fragment>
          );
        })}
      </Fragment>
    );
  };

  const dropdownContent = checkIds => {
    let noDelOptions = options.filter(item => !item.isDeleted && !item.hide);
    const canAddOption = noDelOptions.length < MAX_OPTIONS_COUNT;

    checkIds.forEach(item => {
      if ((item || '').toString().indexOf('add_') > -1) {
        noDelOptions.push({ key: item, color: 'var(--color-primary)', value: item.split('add_')[1] });
      }
    });

    // 搜索
    if (keywords.length) {
      noDelOptions = noDelOptions.filter(
        item =>
          `${item.value || ''}|${item.pinYin || ''}`.search(
            new RegExp(keywords.trim().replace(/([,.+?:()*[\]^$|{}\\-])/g, '\\$1'), 'i'),
          ) !== -1,
      );
    }

    return (
      <Fragment>
        <Select
          ref={selectRef}
          mode="multiple"
          dropdownClassName={dropdownClassName}
          className={cx('w100 customAntSelect', { optionDisabled: disabled })}
          disabled={disabled}
          showSearch
          allowClear={checkIds.length > 0}
          listHeight={320}
          placeholder={hint}
          value={checkIds}
          tagRender={tagRender}
          showArrow
          suffixIcon={<Icon icon="arrow-down-border Font14" />}
          filterOption={() => true}
          notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
          onSearch={keywords => setKeywords(keywords.trim())}
          onKeyDown={createEventHandler}
          onDropdownVisibleChange={open => {
            setKeywords('');
            setIsFocus(open);
            !open && selectRef.current.blur();
            if (open && checkIds.indexOf('isEmpty') > -1) {
              onChange(JSON.stringify([]));
            }
          }}
          onChange={value => {
            if (value.indexOf('isEmpty') > -1) {
              onChange(JSON.stringify(['isEmpty']));
              selectRef.current?.blur();
              return;
            }
            // 全选
            if (value.indexOf('select-all') > -1) {
              const canSelectOptions =
                chooseothertype === '1' ? noDelOptions.filter(c => c.key !== 'other') : noDelOptions;
              handleSelectAll(canSelectOptions);
              selectRef.current?.blur();
              return;
            }
            if (chooseothertype === '1') {
              const newKey = _.last(value);
              _.remove(value, item => (newKey === 'other' ? !item.startsWith('other') : item.startsWith('other')));
            }
            onChange(JSON.stringify(value));
            setKeywords('');
          }}
          {...selectProps}
        >
          {!keywords.length && allowadd === '1' && canAddOption && (
            <Select.Option disabled className="cursorDefault">
              <span className="ellipsis customRadioItem Gray_9e">{_l('或直接输入添加新选项')}</span>
            </Select.Option>
          )}

          {renderSelectAll()}

          {noDelOptions.map((item, i) => {
            return (
              <Select.Option value={item.key} key={i} className={cx({ isEmpty: item.key === 'isEmpty' })}>
                {renderList(item, true)}
              </Select.Option>
            );
          })}

          {!!keywords.length &&
            !noDelOptions.find(item => item.value === keywords) &&
            allowadd === '1' &&
            canAddOption && (
              <Select.Option value={`add_${keywords}`}>
                <span className="ellipsis customRadioItem ThemeColor3">{_l('添加新的选项：') + keywords}</span>
              </Select.Option>
            )}
        </Select>
        {!isSheet && (
          <OtherInput
            disabled={disabled}
            options={options}
            value={value}
            onChange={onChange}
            advancedSetting={advancedSetting}
            isSelect={true}
          />
        )}
      </Fragment>
    );
  };

  /**
   * 渲染头部
   */
  const tagRender = ({ value: tagValue, onClose }) => {
    const { checkIds } = getCheckAndOther(value);
    const currentItem = options.find(o => o.key === tagValue) || { color: 'var(--color-primary)' };
    const label = (tagValue || '').toString().indexOf('add_') > -1 ? tagValue.split('add_')[1] : currentItem.value;

    return (
      <span
        key={tagValue}
        className={cx(
          'mTop5 mBottom5 mRight5',
          {
            White: enumDefault2 === 1 && !isLightColor(currentItem.color),
            isEmpty: tagValue === 'isEmpty',
          },
          enumDefault2 === 1 || isFocus ? 'customAntDropdownTitleWithBG' : 'customAntDropdownTitle',
        )}
        style={{ background: enumDefault2 === 1 ? currentItem.color : isFocus ? 'var(--color-border-secondary)' : '' }}
        title={label}
      >
        <div className="ellipsis Font13">
          {label}
          {enumDefault2 !== 1 && !isFocus && tagValue !== checkIds[checkIds.length - 1] && ','}
        </div>
        {isFocus && (
          <Icon
            icon={cx('close Font14 mLeft5 pointer', {
              White: enumDefault2 === 1 && !isLightColor(currentItem.color),
            })}
            onMouseDown={event => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={onClose}
            hint={_l('删除')}
            style={{ marginRight: -3, lineHeight: '24px' }}
          />
        )}
      </span>
    );
  };

  const { checkIds } = getCheckAndOther(value);

  // 多选下拉
  if (checktype === '1') {
    return dropdownContent(checkIds);
  }

  return (
    <CheckboxWidgetWrapper
      className={cx(
        'customFormControlBox formBoxNoBorder',
        { controlDisabled: disabled },
        { readOnlyDisabled: readonlyshowall === '1' && disabled },
        className,
      )}
      style={{ height: 'auto' }}
      onClick={onConClick}
      activeIndex={activeIndex}
    >
      <div
        className={cx('ming CheckboxGroup', {
          groupColumn: direction === '1',
          groupRow: direction === '2',
        })}
        ref={checkRef}
      >
        {pcContent(checkIds)}
      </div>
    </CheckboxWidgetWrapper>
  );
};

CheckboxWidgets.propTypes = {
  disabled: PropTypes.bool,
  isFocus: PropTypes.bool,
  options: PropTypes.any,
  value: PropTypes.string,
  enumDefault2: PropTypes.number,
  onChange: PropTypes.func,
  className: PropTypes.string,
  advancedSetting: PropTypes.object,
  hint: PropTypes.string,
  dropdownClassName: PropTypes.string,
  selectProps: PropTypes.object,
  isSheet: PropTypes.bool,
  onConClick: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.number,
};

const CheckboxComp = autoSize(CheckboxWidgets, { onlyWidth: true });

export default memo(CheckboxComp, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'width', 'disabled', 'options']),
    _.pick(nextProps, ['value', 'width', 'disabled', 'options']),
  );
});

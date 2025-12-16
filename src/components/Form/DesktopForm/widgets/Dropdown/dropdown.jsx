import React, { Fragment, memo, useCallback, useEffect, useRef, useState } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { MAX_OPTIONS_COUNT } from 'src/pages/widgetConfig/config';
import { isLightColor } from 'src/utils/control';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import { getCheckAndOther } from '../../../core/utils';
import OtherInput from '../Checkbox/OtherInput';

const DropdownComp = props => {
  const {
    dropdownClassName,
    disabled,
    disableCustom,
    options,
    value,
    enumDefault2,
    selectProps = {},
    onChange,
    advancedSetting,
    hint,
    formItemId,
    recordId,
    flag,
    createEventHandler = () => {},
  } = props;

  const [keywords, setKeywords] = useState('');
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('');
  const selectRef = useRef(null);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      switch (triggerType) {
        case 'trigger_tab_enter':
          selectRef.current && selectRef.current.focus();
          break;
        case 'trigger_tab_leave':
          selectRef.current && selectRef.current.blur();
          break;
        default:
          break;
      }
    }, []),
  );

  /**
   * 渲染头部
   */
  const renderTitle = useCallback(
    item => {
      return (
        <span
          key={item.key}
          className={cx(
            'ellipsis mTop5 mBottom5 mRight5 Font13',
            { White: enumDefault2 === 1 && !isLightColor(item.color), isEmpty: item.key === 'isEmpty' },
            enumDefault2 === 1 ? 'customAntDropdownTitleWithBG' : 'customAntDropdownTitle',
          )}
          style={{ background: enumDefault2 === 1 ? item.color : '' }}
          title={item.value}
        >
          {item.value}
        </span>
      );
    },
    [enumDefault2],
  );

  /**
   * 渲染列表
   */
  const renderList = useCallback(
    item => {
      return (
        <span
          className={cx(
            'customRadioItem',
            'ellipsis',
            {
              White: enumDefault2 === 1 && !isLightColor(item.color),
              isEmpty: item.key === 'isEmpty',
            },
            {
              'pLeft12 pRight12': enumDefault2 === 1,
            },
          )}
          style={{ background: enumDefault2 === 1 ? item.color : '' }}
        >
          {item.value}
        </span>
      );
    },
    [enumDefault2],
  );

  const handleChange = value => {
    onChange(JSON.stringify(value ? [value] : []));
  };

  const handleSearch = useCallback(keywords => {
    setKeywords(keywords.trim());
  }, []);

  const handleDropdownVisibleChange = useCallback(open => {
    setKeywords('');
    setOpen(open);
    if (!open && selectRef.current) {
      selectRef.current.blur();
    }
  }, []);

  const handleSelectChange = da => {
    const value = _.isArray(da) ? _.get(_.last(da), 'value') : _.get(da, 'value');

    // keywords判断是为了直接点击删除
    if (value || !keywords.length) {
      handleChange(value);
      setOpen(false);
    }
  };

  let noDelOptions = options.filter(item => !item.isDeleted && !item.hide);
  const delOptions = options.filter(item => item.isDeleted || item.hide);
  const { checkIds } = getCheckAndOther(value);
  const canAddOption = noDelOptions.length < MAX_OPTIONS_COUNT;

  checkIds.forEach(item => {
    if ((item || '').toString().indexOf('add_') > -1 && !selectProps.noPushAdd_) {
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

  const checkItems = noDelOptions
    .concat(delOptions)
    .filter(i => _.includes(checkIds, i.key))
    .map(c => ({ value: c.key, label: renderTitle(c) }));

  useEffect(() => {
    if (!open) {
      setMode(checkIds.length > 1 ? 'multiple' : '');
    }
  }, [recordId, flag, open]);

  const tagRender = ({ value: tagValue }) => {
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
          enumDefault2 === 1 ? 'customAntDropdownTitleWithBG' : 'customAntDropdownTitle',
        )}
        style={{ background: enumDefault2 === 1 ? currentItem.color : '' }}
        title={label}
      >
        <div className="ellipsis Font13">
          {label}
          {enumDefault2 !== 1 && tagValue !== checkIds[checkIds.length - 1] && ','}
        </div>
      </span>
    );
  };

  return (
    <Fragment>
      <Select
        {...(mode ? { mode, tagRender } : {})}
        ref={selectRef}
        dropdownClassName={dropdownClassName}
        className={cx('w100 customAntSelect', { optionDisabled: disabled })}
        disabled={disabled}
        showSearch
        open={open}
        allowClear={checkIds.length > 0}
        listHeight={320}
        value={checkItems}
        placeholder={hint}
        suffixIcon={<Icon icon="arrow-down-border Font14" />}
        labelInValue={true}
        optionFilterProp="children"
        filterOption={() => true}
        notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
        onSearch={handleSearch}
        onDropdownVisibleChange={handleDropdownVisibleChange}
        onChange={handleSelectChange}
        onKeyDown={createEventHandler}
        {...selectProps}
      >
        {!keywords.length && advancedSetting.allowadd === '1' && canAddOption && (
          <Select.Option disabled className="cursorDefault">
            <span className="ellipsis customRadioItem Gray_9e">{_l('或直接输入添加新选项')}</span>
          </Select.Option>
        )}

        {noDelOptions.map((item, i) => {
          return (
            <Select.Option
              value={item.key}
              key={i}
              text={item.text}
              className={cx({
                'ant-select-item-option-selected': _.includes(checkIds, item.key),
                isEmpty: item.key === 'isEmpty',
              })}
            >
              {renderList(item)}
            </Select.Option>
          );
        })}

        {!disableCustom &&
          !!keywords.length &&
          !options.find(item => item.value === keywords) &&
          advancedSetting.allowadd === '1' &&
          canAddOption && (
            <Select.Option value={`add_${keywords}`}>
              <span className="ellipsis customRadioItem ThemeColor3">{_l('添加新的选项：') + keywords}</span>
            </Select.Option>
          )}
      </Select>
      <OtherInput {...props} isSelect={true} />
    </Fragment>
  );
};

DropdownComp.propTypes = {
  dropdownClassName: PropTypes.string,
  disabled: PropTypes.bool,
  disableCustom: PropTypes.any,
  options: PropTypes.any,
  value: PropTypes.string,
  enumDefault2: PropTypes.number,
  selectProps: PropTypes.shape({}),
  onChange: PropTypes.func,
  advancedSetting: PropTypes.object,
  hint: PropTypes.string,
};

export default memo(DropdownComp, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'controlId', 'options']),
    _.pick(nextProps, ['value', 'disabled', 'controlId', 'options']),
  );
});

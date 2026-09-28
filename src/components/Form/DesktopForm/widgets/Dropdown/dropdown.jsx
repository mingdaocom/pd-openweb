import React, { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Select } from 'ming-ui/antd-components';
import { MAX_OPTIONS_COUNT } from 'src/utils/domain/control/config';
import { isLightColor } from 'src/utils/domain/control/style';
import { getCheckAndOther } from 'src/utils/domain/control/value';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import OtherInput from '../Checkbox/OtherInput';

const SELECT_LIST_ITEM_STYLE = { padding: '5.5px 12px' };

const mergeSelectStyles = styles => {
  const mergeStyles = currentStyles => ({
    ...currentStyles,
    popup: {
      ...currentStyles?.popup,
      listItem: {
        ...SELECT_LIST_ITEM_STYLE,
        ...currentStyles?.popup?.listItem,
      },
    },
  });

  return typeof styles === 'function' ? info => mergeStyles(styles(info)) : mergeStyles(styles);
};

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
    isFormDetail,
    createEventHandler = () => {},
  } = props;

  const [keywords, setKeywords] = useState('');
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('');
  const selectRef = useRef(null);
  const selectStyles = useMemo(() => mergeSelectStyles(selectProps.styles), [selectProps.styles]);

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
            'ellipsis Font13',
            enumDefault2 === 1 ? (isLightColor(item.color) ? 'textBlack' : 'textWhite') : '',
            enumDefault2 === 1
              ? 'customAntDropdownTitleWithBG singleSelectLabel'
              : 'customAntDropdownTitle singleSelectLabel',
            { isEmpty: item.key === 'isEmpty' },
          )}
          style={{
            ...(enumDefault2 === 1 ? { background: item.color } : { color: 'var(--color-text-primary)' }),
          }}
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
            'customRadioItem ellipsis',
            enumDefault2 === 1 ? (isLightColor(item.color) ? 'textBlack' : 'textWhite') : '',
            {
              isEmpty: item.key === 'isEmpty',
              'pLeft12 pRight12': enumDefault2 === 1,
            },
          )}
          title={item.value}
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

  const dropdownOptions = [
    !keywords.length &&
      advancedSetting.allowadd === '1' &&
      canAddOption && {
        value: '__allow_add_tip__',
        disabled: true,
        className: 'cursorDefault',
        label: (
          <span className="ellipsis customRadioItem textTertiary" title={_l('或直接输入添加新选项')}>
            {_l('或直接输入添加新选项')}
          </span>
        ),
      },
    ...noDelOptions.map(item => ({
      value: item.key,
      text: item.text,
      label: renderList(item),
      className: cx({
        'hap-select-item-option-selected': _.includes(checkIds, item.key),
        isEmpty: item.key === 'isEmpty',
      }),
    })),
    !disableCustom &&
      !!keywords.length &&
      !options.find(item => item.value === keywords) &&
      advancedSetting.allowadd === '1' &&
      canAddOption && {
        value: `add_${keywords}`,
        label: (
          <span className="ellipsis customRadioItem colorPrimary" title={_l('添加新的选项：') + keywords}>
            {_l('添加新的选项：') + keywords}
          </span>
        ),
      },
  ].filter(Boolean);

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
          enumDefault2 === 1 ? (isLightColor(currentItem.color) ? 'textBlack' : 'textWhite') : '',
          enumDefault2 === 1
            ? 'customAntDropdownTitleWithBG hap-select-selection-item'
            : 'customAntDropdownTitle hap-select-selection-item',
          { isEmpty: tagValue === 'isEmpty' },
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
        classNames={{ popup: { root: dropdownClassName } }}
        className={cx('w100 customAntSelect', { optionDisabled: disabled })}
        disabled={disabled}
        showSearch
        copyable
        open={open}
        allowClear={checkIds.length > 0}
        listHeight={320}
        value={checkItems}
        placeholder={hint}
        labelInValue={true}
        optionFilterProp="children"
        filterOption={() => true}
        notFoundContent={<span className="textTertiary">{_l('无搜索结果')}</span>}
        onSearch={handleSearch}
        onOpenChange={handleDropdownVisibleChange}
        onChange={handleSelectChange}
        onKeyDown={createEventHandler}
        {...selectProps}
        styles={selectStyles}
        variant={isFormDetail ? 'filled' : 'outlined'}
        options={dropdownOptions}
      />
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
  isFormDetail: PropTypes.bool,
};

export default memo(DropdownComp, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'controlId', 'options', 'isFormDetail', 'selectProps']),
    _.pick(nextProps, ['value', 'disabled', 'controlId', 'options', 'isFormDetail', 'selectProps']),
  );
});

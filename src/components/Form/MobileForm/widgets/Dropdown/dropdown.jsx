import React, { Fragment, memo, useMemo } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, MobileRadio } from 'ming-ui';
import { getCheckAndOther } from '../../../core/utils';
import { CustomOptionCapsule } from '../../style';
import OtherInput from '../Checkbox/OtherInput';

// 多选下拉 转 单选，可能存在多个选项值
const OptionsWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const Dropdown = props => {
  const { value, disabled, advancedSetting = {}, enumDefault2, options, hint, selectProps = {}, formDisabled } = props;
  const { checkIds, otherValue } = useMemo(() => getCheckAndOther(value), [value]);
  const selectedKeySet = useMemo(() => new Set(checkIds), [checkIds]);
  const { visibleOptions, deletedOptions } = useMemo(() => {
    return options.reduce(
      (result, item) => {
        if (item.isDeleted || item.hide) {
          result.deletedOptions.push(item);
        } else {
          result.visibleOptions.push(item);
        }

        return result;
      },
      { visibleOptions: [], deletedOptions: [] },
    );
  }, [options]);
  const optionsWithAdded = useMemo(() => {
    const list = visibleOptions.slice();

    checkIds.forEach(item => {
      if ((item || '').toString().indexOf('add_') > -1 && !selectProps.noPushAdd_) {
        list.push({ key: item, color: 'var(--color-primary)', value: item.split('add_')[1] });
      }
    });

    return list;
  }, [visibleOptions, checkIds, selectProps.noPushAdd_]);
  const allOptions = useMemo(() => optionsWithAdded.concat(deletedOptions), [optionsWithAdded, deletedOptions]);
  const selectedOptions = useMemo(
    () => allOptions.filter(item => selectedKeySet.has(item.key)),
    [allOptions, selectedKeySet],
  );

  const renderItem = (item, inPopup = false) => {
    const content = item.key === 'other' && otherValue && disabled ? otherValue : item.value;

    if (enumDefault2 === 1) {
      return (
        <CustomOptionCapsule tagColor={item.color} inPopup={inPopup}>
          {content}
        </CustomOptionCapsule>
      );
    }

    return <span className="breakAllWrap radioText">{content}</span>;
  };

  const onChange = value => {
    props.onChange(JSON.stringify(value ? [value] : []));
  };

  return (
    <Fragment>
      <MobileRadio
        disabled={disabled}
        allowAdd={advancedSetting.allowadd === '1'}
        data={optionsWithAdded}
        delOptions={deletedOptions}
        callback={onChange}
        renderText={item => renderItem(item, true)}
        {...props}
        value={selectedOptions}
      >
        <div
          className={cx('customFormControlBox controlMinHeight customFormControlCapsuleBox', {
            controlEditReadonly: !formDisabled && checkIds.length && disabled,
            controlDisabled: formDisabled,
          })}
        >
          <OptionsWrap>
            {checkIds.length ? (
              selectedOptions.map(item => {
                return <div key={item.key}>{renderItem(item)}</div>;
              })
            ) : (
              <span className="textDisabled">{hint || _l('请选择')}</span>
            )}
          </OptionsWrap>
          {(!disabled || !formDisabled) && (
            <Icon icon="arrow-right-border" className="Font16 textDisabled" style={{ marginRight: -5 }} />
          )}
        </div>
      </MobileRadio>
      {!disabled && <OtherInput {...props} isSelect={true} className="mTop5" />}
    </Fragment>
  );
};

Dropdown.propTypes = {
  value: PropTypes.string,
  disabled: PropTypes.bool,
  advancedSetting: PropTypes.object,
  enumDefault2: PropTypes.number,
  options: PropTypes.array,
  hint: PropTypes.string,
  selectProps: PropTypes.object,
  formDisabled: PropTypes.bool,
};

export default memo(Dropdown, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'controlId', 'options', 'formDisabled']),
    _.pick(nextProps, ['value', 'disabled', 'controlId', 'options', 'formDisabled']),
  );
});

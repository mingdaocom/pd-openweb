import React, { Fragment, memo } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, MobileRadio } from 'ming-ui';
import { isLightColor } from 'src/util';
import { getCheckAndOther } from '../../../core/utils';
import OtherInput from '../Checkbox/OtherInput';

const ItemBox = styled.span`
  ${props => props.enumDefault2 === 1 && `background: ${props.color} !important;`}
  word-break: break-all;
  white-space: pre-wrap;
`;

const Dropdown = props => {
  const { value, disabled, advancedSetting = {}, enumDefault2, options, hint, selectProps = {}, formDisabled } = props;

  let noDelOptions = options.filter(item => !item.isDeleted && !item.hide);
  const delOptions = options.filter(item => item.isDeleted || item.hide);
  const { checkIds } = getCheckAndOther(value);

  checkIds.forEach(item => {
    if ((item || '').toString().indexOf('add_') > -1 && !selectProps.noPushAdd_) {
      noDelOptions.push({ key: item, color: 'var(--color-primary)', value: item.split('add_')[1] });
    }
  });
  const mobileCheckItems = noDelOptions.concat(delOptions).filter(i => _.includes(checkIds, i.key));

  const renderItem = item => {
    const { otherValue } = getCheckAndOther(value);

    return (
      <ItemBox
        enumDefault2={enumDefault2}
        color={item.color}
        className={cx({
          customFormCapsule: enumDefault2 === 1,
          White: enumDefault2 === 1 && !isLightColor(item.color),
          isEmpty: item.key === 'isEmpty',
        })}
      >
        {item.key === 'other' ? (otherValue && disabled ? otherValue : item.value) : item.value}
      </ItemBox>
    );
  };

  const onChange = value => {
    props.onChange(JSON.stringify(value ? [value] : []));
  };

  return (
    <Fragment>
      <MobileRadio
        disabled={disabled}
        allowAdd={advancedSetting.allowadd === '1'}
        data={noDelOptions}
        delOptions={delOptions}
        callback={onChange}
        renderText={renderItem}
        {...props}
        value={mobileCheckItems}
      >
        <div
          className={cx('customFormControlBox controlMinHeight customFormControlCapsuleBox', {
            controlEditReadonly: !formDisabled && checkIds.length && disabled,
            controlDisabled: formDisabled,
          })}
        >
          <div className="flex minWidth0">
            {checkIds.length ? (
              noDelOptions
                .concat(delOptions)
                .filter(item => _.includes(checkIds, item.key))
                .map(item => {
                  return <div key={item.key}>{renderItem(item)}</div>;
                })
            ) : (
              <span className="Gray_bd">{hint || _l('请选择')}</span>
            )}
          </div>
          {(!disabled || !formDisabled) && (
            <Icon icon="arrow-right-border" className="Font16 Gray_bd" style={{ marginRight: -5 }} />
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

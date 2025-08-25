import React, { Fragment, memo } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Icon, MobileCheckbox } from 'ming-ui';
import { getCheckAndOther } from '../../../core/utils';
import { CustomOptionCapsule } from '../../style';
import OtherInput from './OtherInput';

// 下拉样式
const CheckboxWrap = styled.div`
  display: flex;
  align-items: center;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  min-width: 0;
  height: auto;

  .dropDownContentBox {
    display: flex;
    flex-wrap: wrap;
    ${props => (props.enumDefault2 === 1 ? 'gap: 10px;' : '')}
    flex: 1;
    min-width: 0;
  }
`;

const TileWrap = styled.div`
  ${props => (props.notGap ? 'gap: initial !important;' : '')}
`;

const CheckboxWidget = props => {
  const { enumDefault2, advancedSetting = {}, value, disabled, options = [], controlName, formDisabled, type } = props;
  const { checktype, direction, allowadd, showselectall, chooseothertype } = advancedSetting;
  const { checkIds, otherValue } = getCheckAndOther(value);
  const isDropDown = checktype === '1';

  const renderListItem = (item, needConnect = false, inPopup = false) => {
    const content = item.key === 'other' && otherValue && disabled ? otherValue : item.value;

    if (enumDefault2 === 1) {
      return (
        <CustomOptionCapsule tagColor={item.color} inPopup={inPopup}>
          {content}
        </CustomOptionCapsule>
      );
    }

    return (
      <span>
        {content}
        {needConnect ? '、' : ''}
      </span>
    );
  };

  const onSave = values => {
    props.onChange(JSON.stringify(values));
  };

  const handleSelectAll = (options = [], isChecked) => {
    const checkIds = safeParse(value, 'array');

    // 多选平铺, 多选选中则清空
    if (type === 10 && !isDropDown && isChecked) {
      props.onChange('');
      return;
    }

    if (chooseothertype === '1') {
      _.remove(checkIds, item => item.startsWith('other'));
    }
    const otherIds = options.filter(i => !_.find(checkIds, c => c.includes(i.key))).map(i => i.key);
    onSave(checkIds.concat(otherIds));
  };

  const onChange = (checked, key) => {
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
            text={<span>{_l('全选')}</span>}
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
        <span className="ellipsis ThemeColor3">{_l('全选')}</span>
      </Select.Option>
    );
  };

  // 平铺
  const renderTile = checkIds => {
    const readOnlyShow = !disabled;
    const displayOptions = options.filter(
      item => !item.isDeleted && (_.includes(checkIds, item.key) || (!item.hide && readOnlyShow)),
    );

    return (
      <Fragment>
        {renderSelectAll(checkIds, displayOptions)}
        {displayOptions.map((item, index) => {
          return (
            <div
              className="flexColumn"
              key={item.key}
              style={{ width: item.key === 'other' && checkIds.includes('other') && !disabled ? '100%' : 'auto' }}
            >
              <Checkbox
                key={item.key}
                disabled={disabled}
                title={item.value}
                text={renderListItem(item, disabled && direction !== '1' && index !== displayOptions.length - 1)}
                value={item.key}
                checked={_.includes(checkIds, item.key)}
                onClick={onChange}
              />
              {item.key === 'other' && !disabled && <OtherInput {...props} />}
            </div>
          );
        })}
      </Fragment>
    );
  };

  const renderDropdown = checkIds => {
    let sources = [];

    checkIds.forEach(item => {
      if ((item || '').toString().indexOf('add_') > -1) {
        sources.push({ key: item, color: 'var(--color-primary)', value: item.split('add_')[1] });
      } else {
        sources.push(options.find(o => o.key === item && !o.isDeleted));
      }
    });

    return (
      <Fragment>
        {sources
          .filter(item => item)
          .map((item, index) => {
            return <div key={item.key}>{renderListItem(item, index !== sources.length - 1)}</div>;
          })}
      </Fragment>
    );
  };

  return (
    <Fragment>
      {isDropDown ? (
        <Fragment>
          <MobileCheckbox
            disabled={disabled}
            allowAdd={checktype === '1' && allowadd === '1'}
            data={options.filter(item => !item.isDeleted && !item.hide)}
            delOptions={options.filter(item => item.isDeleted || item.hide)}
            checked={checkIds}
            callback={onSave}
            renderText={item => renderListItem(item, false, true)}
            otherValue={otherValue}
            controlName={controlName}
            showselectall={showselectall}
            chooseothertype={chooseothertype}
          >
            <CheckboxWrap
              enumDefault2={enumDefault2}
              className={cx('customFormControlBox controlMinHeight', {
                controlEditReadonly: !formDisabled && checkIds.length && disabled,
                controlDisabled: formDisabled,
              })}
            >
              <div className="dropDownContentBox">{renderDropdown(checkIds)}</div>
              {(!disabled || !formDisabled) && (
                <Icon icon="arrow-right-border" className="Font16 Gray_bd" style={{ marginRight: -5 }} />
              )}
            </CheckboxWrap>
          </MobileCheckbox>
          {checkIds.includes('other') && !disabled && (
            <div className="mTop5">
              <OtherInput {...props} />
            </div>
          )}
        </Fragment>
      ) : (
        <TileWrap
          notGap={disabled && direction !== '1' && enumDefault2 === 0}
          className={cx('customFormControlBox customFormControlNoBorder CheckboxGroupCon', {
            verticalArrangement: direction === '1',
          })}
        >
          {renderTile(checkIds)}
        </TileWrap>
      )}
    </Fragment>
  );
};

export default memo(CheckboxWidget, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'width', 'disabled', 'options']),
    _.pick(nextProps, ['value', 'width', 'disabled', 'options']),
  );
});

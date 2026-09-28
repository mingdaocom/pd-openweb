import React, { memo } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Checkbox, Radio, Switch } from 'ming-ui/antd-components';
import { getSwitchItemNames } from 'src/utils/domain/control/options';

const CheckWidgetWrap = styled.div`
  display: flex;
  align-items: center;
  line-height: 1.5;

  .ant-radio-wrapper {
    display: flex;
    align-items: center;
    margin-top: 6px;
    margin-bottom: 6px;

    &-box {
      flex-shrink: 0;
      margin-top: initial !important;
    }

    &-text {
      display: inline-block;
    }
  }
`;

const CheckWidget = props => {
  const { disabled, value, advancedSetting = {}, hint = '', switchSize, formDisabled } = props;
  const itemnames = getSwitchItemNames(props);
  const isChecked = Number(value) === 1;

  const onChange = checked => {
    props.onChange(checked ? '0' : '1');
  };

  /**
   * advancedSetting.showtype: 0-勾选框; 1-开关; 2-是否;
   */
  const renderContent = () => {
    if (advancedSetting.showtype === '1') {
      const text = isChecked ? _.get(itemnames[0], 'value') : _.get(itemnames[1], 'value');
      return (
        <div className="flexCenter flexRow">
          <Switch
            disabled={disabled}
            checked={isChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
              return onChange(!checked, event);
            }}
            size={switchSize || 'default'}
            className={cx({ mobileFormSwitchDisabled: disabled })}
          />
          {text && <span className="mLeft6">{text}</span>}
        </div>
      );
    }

    if (advancedSetting.showtype === '2') {
      if (disabled) {
        let radioLabel = (itemnames || []).filter(item => item.key === value).length
          ? itemnames.filter(item => item.key === value)[0].value
          : '';
        return <div>{radioLabel}</div>;
      }

      return (
        <Radio.Group
          size="middle"
          disabled={disabled}
          value={`${value}`}
          options={(itemnames.map(item => ({ text: item.value, value: item.key })) || []).map(
            ({ text, ...option }) => ({ ...option, label: text }),
          )}
          onChange={event => onChange(event.target.value !== '1')}
        />
      );
    }

    return (
      <Checkbox
        disabled={disabled}
        checked={isChecked}
        onChange={event => onChange(!event.target.checked, undefined, event)}
        size={switchSize || 'default'}
      >
        {hint}
      </Checkbox>
    );
  };

  return (
    <CheckWidgetWrap $formDisabled={formDisabled} className="controlMinHeight">
      {renderContent()}
    </CheckWidgetWrap>
  );
};

CheckWidget.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  advancedSetting: PropTypes.object,
  hint: PropTypes.string,
  switchSize: PropTypes.string,
  formDisabled: PropTypes.bool,
};

export default memo(CheckWidget, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'formDisabled']),
    _.pick(nextProps, ['value', 'disabled', 'formDisabled']),
  );
});

import React, { Fragment } from 'react';
import { Checkbox } from 'ming-ui';
import styled from 'styled-components';
import { Dropdown, Tooltip } from 'antd';
import cx from 'classnames';
import { useSetState } from 'react-use';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import { DropdownContent, DropdownPlaceholder } from '../../../styled';
import TimeInput from '../DynamicDefaultValue/inputTypes/TimeInput.jsx';

const INTERVAL = [1, 5, 10, 15, 30, 60];

const TimeConfigWrap = styled.div`
  .labelWrap {
    margin-bottom: 6px;
  }
`;

const IntervalWrap = styled(DropdownContent)`
  .item {
    line-height: 36px;
    padding: 0 16px;
  }
`;

function StartEndTime(props) {
  const { data, onChange, allControls } = props;
  const min = getAdvanceSetting(data, 'min');
  const max = getAdvanceSetting(data, 'max');

  const handleValueChange = (value, mode) => {
    onChange(handleAdvancedSettingChange(data, { [mode]: JSON.stringify(value) }));
  };
  return (
    <TimeConfigWrap>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={min}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { min: checked ? '' : JSON.stringify([]) }))}
        >
          <span>{_l('起始时间')}</span>
        </Checkbox>
      </div>
      {min && (
        <TimeInput
          {...props}
          controls={allControls}
          hideSearchAndFun
          dynamicValue={min}
          onDynamicValueChange={value => handleValueChange(value, 'min')}
        />
      )}
      <div className={cx('labelWrap', { mTop15: min })}>
        <Checkbox
          size="small"
          checked={max}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { max: checked ? '' : JSON.stringify([]) }))}
        >
          <span>{_l('结束时间')}</span>
        </Checkbox>
      </div>
      {max && (
        <TimeInput
          {...props}
          hideSearchAndFun
          controls={allControls}
          dynamicValue={max}
          onDynamicValueChange={value => handleValueChange(value, 'max')}
        />
      )}
    </TimeConfigWrap>
  );
}

export default function TimeConfig(props) {
  const { data, onChange } = props;
  const { timeinterval } = getAdvanceSetting(data);

  const [{ timeIntervalVisible }, setVisible] = useSetState({ timeIntervalVisible: false });

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={!!timeinterval}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { timeinterval: checked ? '' : '1' }))}
        >
          <span>{_l('预设分钟间隔')}</span>
          <Tooltip
            placement={'bottom'}
            title={_l('用于控制时间选择器上的分钟按多少间隔显示，但依然可手动输入任意分钟数')}
          >
            <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
          </Tooltip>
        </Checkbox>
      </div>
      {timeinterval && (
        <Dropdown
          trigger={'click'}
          visible={timeIntervalVisible}
          onVisibleChange={v => setVisible({ timeIntervalVisible: v })}
          overlay={
            <IntervalWrap>
              {INTERVAL.map(v => (
                <div
                  key={v}
                  className="item"
                  onClick={() => {
                    onChange(handleAdvancedSettingChange(data, { timeinterval: String(v) }));
                    setVisible({ timeIntervalVisible: false });
                  }}
                >
                  {_l('%0分钟', v)}
                </div>
              ))}
            </IntervalWrap>
          }
        >
          <DropdownPlaceholder className={cx({ active: timeIntervalVisible })} color="#333">
            {_l('%0分钟', timeinterval)}
            <i className="icon-arrow-down-border Font16 Gray_9e"></i>
          </DropdownPlaceholder>
        </Dropdown>
      )}
      <StartEndTime {...props} />
    </Fragment>
  );
}

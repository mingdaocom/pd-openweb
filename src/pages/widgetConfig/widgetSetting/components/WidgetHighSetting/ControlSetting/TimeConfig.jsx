import React, { Fragment } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import { Checkbox, Dropdown, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { DropdownPlaceholder } from '../../../../styled';
import TimeInput from '../../DynamicDefaultValue/inputTypes/TimeInput.jsx';

const INTERVAL = [1, 5, 10, 15, 30, 60];

function StartEndTime(props) {
  const { data, onChange, allControls } = props;
  const min = getAdvanceSetting(data, 'min');
  const max = getAdvanceSetting(data, 'max');

  const handleValueChange = (value, mode) => {
    onChange(handleAdvancedSettingChange(data, { [mode]: JSON.stringify(value) }));
  };

  return (
    <Fragment>
      <div className={cx('labelWrap', { mBottom8: min })}>
        <Checkbox
          checked={min}
          onChange={event =>
            onChange(
              handleAdvancedSettingChange(data, {
                min: !event.target.checked ? '' : JSON.stringify([]),
              }),
            )
          }
          size="small"
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
      <div className={cx('labelWrap', { mTop8: min, mBottom8: max })}>
        <Checkbox
          checked={max}
          onChange={event =>
            onChange(
              handleAdvancedSettingChange(data, {
                max: !event.target.checked ? '' : JSON.stringify([]),
              }),
            )
          }
          size="small"
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
    </Fragment>
  );
}

export default function TimeConfig(props) {
  const { data, onChange } = props;
  const { timeinterval } = getAdvanceSetting(data);

  const [{ timeIntervalVisible }, setVisible] = useSetState({ timeIntervalVisible: false });

  return (
    <Fragment>
      <div className={'labelWrap'}>
        <Checkbox
          checked={!!timeinterval}
          onChange={event =>
            onChange(
              handleAdvancedSettingChange(data, {
                timeinterval: !event.target.checked ? '' : '1',
              }),
            )
          }
          size="small"
        >
          <span>{_l('预设分钟间隔')}</span>
          <Tooltip
            placement="bottom"
            title={_l('用于控制时间选择器上的分钟按多少间隔显示，但依然可手动输入任意分钟数')}
          >
            <i className="icon-help tipsIcon textTertiary Font16 pointer"></i>
          </Tooltip>
        </Checkbox>
      </div>
      {timeinterval && (
        <Dropdown
          trigger={'click'}
          className="mTop8 mBottom8"
          open={timeIntervalVisible}
          onOpenChange={v => setVisible({ timeIntervalVisible: v })}
          menu={{
            items: INTERVAL.map(v => ({
              key: v,
              label: _l('%0分钟', v),
              onClick: () => {
                onChange(handleAdvancedSettingChange(data, { timeinterval: String(v) }));
                setVisible({ timeIntervalVisible: false });
              },
            })),
          }}
        >
          <DropdownPlaceholder className={cx({ active: timeIntervalVisible })} color="var(--color-text-primary)">
            {_l('%0分钟', timeinterval)}
            <i className="icon-arrow-down-border Font16 textTertiary"></i>
          </DropdownPlaceholder>
        </Dropdown>
      )}
      <StartEndTime {...props} />
    </Fragment>
  );
}

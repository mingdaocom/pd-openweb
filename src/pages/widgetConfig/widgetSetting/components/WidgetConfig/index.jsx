import React, { Fragment, useState, useEffect } from 'react';
import { Checkbox } from 'ming-ui';
import styled from 'styled-components';
import { Dropdown, Tooltip } from 'antd';
import cx from 'classnames';
import { useSetState } from 'react-use';
import UserConfig from './UserConfig';
import { DropdownContent, SettingItem, DropdownPlaceholder } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import TelConfig from './TelConfig';

const INTERVAL = [1, 5, 10, 15, 30, 60];

const CASCADER_CONFIG = [
  {
    text: _l('必须选择到最后一级'),
    key: 'anylevel',
  },
  {
    text: _l('选择结果显示层级路径'),
    tip: _l('勾选后，将呈现选项路径。例：上海市/徐汇区/漕河泾'),
    key: 'allpath',
  },
  // {
  //   text: _l('允许查看记录'),
  //   key: 'allowlink',
  // },
];

const IntervalWrap = styled(DropdownContent)`
  .item {
    line-height: 36px;
    padding: 0 16px;
  }
`;

export default function WidgetConfig(props) {
  const { from, data, onChange } = props;
  const { type, enumDefault, advancedSetting = {} } = data;
  const { timeinterval, allowadd, showxy, showtype, checktype } = getAdvanceSetting(data);
  const [{ timeIntervalVisible }, setVisible] = useSetState({ timeIntervalVisible: false });

  const getConfig = () => {
    if (type === 3) {
      return <TelConfig {...props} />;
    }
    if (type === 6) {
      return (
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={enumDefault !== 1}
            onClick={checked => onChange({ enumDefault: checked ? 1 : 0 })}
            text={_l('显示千分位')}
          />
        </div>
      );
    }
    if (type === 11 || (type === 10 && checktype === '1')) {
      return (
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={allowadd === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allowadd: checked ? '0' : '1' }))}>
            <span>{_l('允许用户增加选项')}</span>
            <Tooltip placement={'bottom'} title={_l('勾选后，用户填写时可输入不在备选项中的内容，并添加至选项列表')}>
              <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        </div>
      );
    }
    if (type === 16) {
      return (
        <Fragment>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={timeinterval}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { timeinterval: checked ? '' : '1' }))}>
              <span>{_l('预设分钟间隔')}</span>
              <Tooltip
                placement={'bottom'}
                title={_l('用于控制时间选择器上的分钟按多少间隔显示，但依然可手动输入任意分钟数')}>
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
                      className="item"
                      onClick={() => {
                        onChange(handleAdvancedSettingChange(data, { timeinterval: String(v) }));
                        setVisible({ timeIntervalVisible: false });
                      }}>
                      {_l('%0分钟', v)}
                    </div>
                  ))}
                </IntervalWrap>
              }>
              <DropdownPlaceholder className={cx({ active: timeIntervalVisible })} color="#333">
                {_l('%0分钟', timeinterval)}
                <i className="icon-arrow-down-border Font16 Gray_9e"></i>
              </DropdownPlaceholder>
            </Dropdown>
          )}
        </Fragment>
      );
    }
    if (type === 26 && from !== 'subList') {
      return <UserConfig {...props} />;
    }
    if (type === 40) {
      return (
        <Fragment>
          <div className="labelWrap">
            <Checkbox
              checked={Boolean(enumDefault)}
              size={'small'}
              text={_l('显示地图')}
              onClick={checked => onChange({ enumDefault: +!checked })}
            />
          </div>
          <div className="labelWrap">
            <Checkbox
              checked={showxy === '1'}
              size={'small'}
              text={_l('显示经纬度')}
              onClick={checked => {
                onChange(handleAdvancedSettingChange(data, { showxy: checked ? '0' : '1' }));
              }}
            />
          </div>
        </Fragment>
      );
    }
    if (type === 35) {
      return (String(showtype) === '4' ? CASCADER_CONFIG.slice(1) : CASCADER_CONFIG).map(({ text, tip, key }) => (
        <div key={key} className="labelWrap">
          <Checkbox
            size="small"
            checked={String(advancedSetting[key]) === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { [key]: +!checked }))}>
            <span>{text}</span>
            {tip && (
              <Tooltip placement="topLeft" title={tip} arrowPointAtCenter>
                <i className="icon-help Gray_bd Font15"></i>
              </Tooltip>
            )}
          </Checkbox>
        </div>
      ));
    }
  };
  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('设置')}</div>
      {getConfig()}
    </SettingItem>
  );
}

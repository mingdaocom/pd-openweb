import React, { Fragment } from 'react';
import { Checkbox, RadioGroup } from 'ming-ui';
import { Tooltip } from 'antd';
import WidgetRowHeight from '../WidgetRowHeight';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';

const DISPLAY_LIST = [
  {
    text: _l('经典模式'),
    value: '0',
  },
  {
    text: _l('电子表格模式'),
    value: '1',
  },
];

export default function RelateStyle(props) {
  const { data, onChange } = props;
  const { alternatecolor = '1', sheettype = '0', allowedit = '1' } = getAdvanceSetting(data);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">
          {_l('交互方式')}{' '}
          <Tooltip
            placement="bottom"
            title={
              <span>
                {_l('经典模式：点整行打开记录')}
                <br />
                {_l('电子表格模式：点单元格选中字段，按空格键打开记录')}
              </span>
            }
          >
            <i className="icon-help Gray_9e Font16"></i>
          </Tooltip>
        </div>
        <RadioGroup
          size="middle"
          checkedValue={sheettype}
          data={DISPLAY_LIST}
          onChange={value => onChange(handleAdvancedSettingChange(data, { sheettype: value }))}
        />
      </SettingItem>
      <WidgetRowHeight {...props} />
      <SettingItem>
        <div className="settingItemTitle">{_l('其他')}</div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={allowedit === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allowedit: String(+!checked) }))}
          >
            <span style={{ marginRight: '4px' }}>{_l('允许行内编辑')}</span>
            <Tooltip placement="bottom" title={_l('勾选后可以在单元格直接编辑 Excel')}>
              <i className="icon-help Gray_9e Font16"></i>
            </Tooltip>
          </Checkbox>
        </div>
        <div className="labelWrap mTop16">
          <Checkbox
            size="small"
            checked={alternatecolor === '1'}
            text={_l('显示交替行颜色')}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { alternatecolor: String(+!checked) }))}
          />
        </div>
      </SettingItem>
    </Fragment>
  );
}

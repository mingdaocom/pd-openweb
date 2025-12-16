import React, { Fragment } from 'react';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';

const TIPS = {
  2: [
    _l('勾选后，在移动端App创建记录时会首先调取扫码输入。此功能在自定义按钮填写时也会生效。'),
    _l(
      '勾选后，在移动端App获得扫码结果后会自动提交表单。配合上个功能，用户在扫码录入的特定场景下可以无需中间步骤，一次完成操作。此功能在自定义按钮填写时也会生效。',
    ),
  ],
};
const DEFAULT_TIP = [
  _l('勾选后，在移动端App创建记录时会首先调取拍摄输入。此功能在自定义按钮填写时也会生效。'),
  _l(
    '勾选后，在移动端App获得拍摄结果后会自动提交表单。配合上个功能，用户在拍摄录入的特定场景下可以无需中间步骤，一次完成操作。此功能在自定义按钮填写时也会生效。',
  ),
];

export default function SheetDealDataType({ data, onChange }) {
  const { type } = data;
  const tip = TIPS[type] || DEFAULT_TIP;
  const { getinput, getsave, createnext } = getAdvanceSetting(data);
  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={getinput === '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { getinput: String(+!checked) }))}
        >
          <span style={{ marginRight: '4px' }}>{_l('在显示表单前先获取输入')}</span>
          <Tooltip placement="bottom" title={tip[0]}>
            <i className="icon-help Gray_9e Font16"></i>
          </Tooltip>
        </Checkbox>
      </div>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={getsave === '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { getsave: String(+!checked) }))}
        >
          <span style={{ marginRight: '4px' }}>{_l('获取后直接提交表单')}</span>
          <Tooltip placement="bottom" title={tip[1]}>
            <i className="icon-help Gray_9e Font16"></i>
          </Tooltip>
        </Checkbox>
      </div>
      {getsave === '1' && (
        <div className="labelWrap pLeft24">
          <Checkbox
            size="small"
            checked={createnext !== '0'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { createnext: String(+!checked) }))}
          >
            <span style={{ marginRight: '4px' }}>{_l('提交后继续创建下一条')}</span>
          </Checkbox>
        </div>
      )}
    </Fragment>
  );
}

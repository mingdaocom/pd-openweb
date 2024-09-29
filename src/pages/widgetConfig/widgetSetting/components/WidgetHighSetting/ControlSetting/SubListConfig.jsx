import React from 'react';
import _ from 'lodash';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'antd';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';

export default function SubListConfig(props) {
  const { data, onChange } = props;
  const { showcount = '0' } = getAdvanceSetting(data);
  return (
    <div className="labelWrap">
      <Checkbox
        className="allowSelectRecords"
        size="small"
        text={_l('显示计数')}
        checked={showcount !== '1'}
        onClick={checked =>
          onChange(
            handleAdvancedSettingChange(data, {
              showcount: checked ? '1' : '0',
            }),
          )
        }
      >
        <Tooltip popupPlacement="bottom" title={<span>{_l('在表单中显示子表的数量')}</span>}>
          <i className="icon icon-help Gray_bd Font15 mLeft5 pointer" />
        </Tooltip>
      </Checkbox>
    </div>
  );
}

import React, { Fragment } from 'react';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange, updateConfig } from '../../../../util/setting';

export default function SubListConfig(props) {
  const { data, onChange } = props;
  const { showcount = '0' } = getAdvanceSetting(data);
  const { mode } = window.subListSheetConfig[data.controlId] || {};
  const [isHiddenOtherViewRecord] = (data.strDefault || '000').split('');
  return (
    <Fragment>
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
          <Tooltip placement="bottom" title={_l('在表单中显示子表的数量')}>
            <i className="icon icon-help Gray_bd Font15 mLeft5 pointer" />
          </Tooltip>
        </Checkbox>
      </div>
      {mode === 'relate' && (
        <div className="labelWrap">
          <Checkbox
            size="small"
            text={_l('按用户权限访问')}
            checked={!!+isHiddenOtherViewRecord}
            onClick={checked => {
              onChange({
                strDefault: updateConfig({
                  config: data.strDefault,
                  value: +!checked,
                  index: 0,
                }),
              });
            }}
          >
            <Tooltip
              placement="bottom"
              title={
                <span>
                  {_l(
                    '未勾选时，用户可查看、编辑所有明细。勾选后，按照用户在实体工作表中配置的权限生效，包含对明细的新增、查看，编辑，删除；以及对字段的可见、编辑权限',
                  )}
                </span>
              }
            >
              <i className="icon icon-help Gray_bd Font15 mLeft5 pointer" />
            </Tooltip>
          </Checkbox>
        </div>
      )}
    </Fragment>
  );
}

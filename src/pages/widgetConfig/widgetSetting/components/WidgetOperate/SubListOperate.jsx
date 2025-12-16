import React, { Fragment, useEffect, useState } from 'react';
import { Checkbox, Dropdown } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { SettingItem } from '../../../styled';

export default function SubListOperate(props) {
  const { data, onChange } = props;
  const { advancedSetting = {}, relationControls = [], controlId } = data;
  const {
    allowadd = '1',
    allowedit = '1',
    allowcancel = '1',
    allowsingle,
    allowexport = '1',
    allowlink = '1',
    allowbatch = '1',
    allowimport = '1',
    allowcopy = '1',
  } = advancedSetting;
  const batchcids = getAdvanceSetting(data, 'batchcids') || [];
  const [visible, setVisible] = useState(batchcids.length > 0);

  const worksheetControls = relationControls
    .filter(item => item.type === 29)
    .map(({ controlId: value, controlName: text }) => ({ value, text }));

  useEffect(() => {
    setVisible(batchcids.length > 0);
  }, [controlId]);

  useEffect(() => {
    // 反向清空
    if (allowsingle !== '1' && !batchcids.length && allowimport !== '1' && allowcopy !== '1' && allowadd === '1') {
      onChange(handleAdvancedSettingChange(data, { allowadd: '0' }));
    }
  }, [allowsingle, batchcids, allowimport, allowcopy]);

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          size="small"
          text={_l('允许新增明细')}
          checked={allowadd === '1'}
          onClick={checked => {
            if (checked) {
              onChange(
                handleAdvancedSettingChange(data, {
                  allowadd: '0',
                  allowsingle: '0',
                  batchcids: JSON.stringify([]),
                  allowimport: '0',
                  allowcopy: '0',
                }),
              );
              setVisible(false);
              return;
            }
            onChange(handleAdvancedSettingChange(data, { allowadd: '1', allowsingle: '1' }));
          }}
        />
      </div>
      {allowadd === '1' && (
        <div className="pLeft24">
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={allowsingle === '1'}
              text={_l('单行新增')}
              onClick={checked => {
                onChange(
                  handleAdvancedSettingChange(data, {
                    allowsingle: checked ? '0' : '1',
                  }),
                );
              }}
            />
          </div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={visible}
              text={_l('选择关联记录字段新增')}
              onClick={checked => {
                setVisible(!checked);
                if (checked) {
                  onChange(
                    handleAdvancedSettingChange(data, {
                      batchcids: JSON.stringify([]),
                    }),
                  );
                }
              }}
            >
              <Tooltip
                placement="bottom"
                title={_l(
                  '如：在添加订单明细时需要先选择关联的产品。此时您可以设置为从产品字段添加明细。设置后，您可以直接一次选择多个产品，并为每个产品都添加一行订单明细',
                )}
              >
                <i className="icon-help Gray_bd Font16 pointer"></i>
              </Tooltip>
            </Checkbox>
          </div>
          {visible && (
            <Dropdown
              border
              className="mTop10 w100"
              isAppendToBody
              placeholder={_l('选择子表中的关联记录字段')}
              noneContent={_l('没有可选字段')}
              value={batchcids[0] || undefined}
              data={worksheetControls}
              onChange={value => {
                onChange(
                  handleAdvancedSettingChange(data, {
                    batchcids: JSON.stringify([value]),
                  }),
                );
              }}
            />
          )}
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={allowimport === '1'}
              text={_l('导入新增')}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { allowimport: checked ? '0' : '1' }))}
            />
          </div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={allowcopy === '1'}
              text={_l('复制')}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { allowcopy: checked ? '0' : '1' }))}
            />
          </div>
        </div>
      )}
      <div className="labelWrap">
        <Checkbox
          size="small"
          text={_l('可编辑已有明细')}
          checked={allowedit === '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { allowedit: checked ? '0' : '1' }))}
        />
      </div>
      <div className="labelWrap">
        <Checkbox
          size="small"
          text={_l('可删除已有明细')}
          checked={allowcancel === '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { allowcancel: checked ? '0' : '1' }))}
        />
      </div>
      <SettingItem>
        <div className=" settingItemTitle">{_l('其他')}</div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={allowlink === '1'}
            text={_l('允许弹层打开')}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allowlink: checked ? '0' : '1' }))}
          />
        </div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={allowbatch === '1'}
            text={_l('允许批量操作')}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allowbatch: checked ? '0' : '1' }))}
          />
        </div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={allowexport === '1'}
            text={_l('允许导出')}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allowexport: checked ? '0' : '1' }))}
          />
        </div>
      </SettingItem>
    </Fragment>
  );
}

import React, { Fragment, useEffect, useState } from 'react';
import { Checkbox, Select, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
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
    .map(({ controlId: value, controlName: label }) => ({ value, label }));

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
          checked={allowadd === '1'}
          onChange={event => {
            if (!event.target.checked) {
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

            onChange(
              handleAdvancedSettingChange(data, {
                allowadd: '1',
                allowsingle: '1',
              }),
            );
          }}
          size="small"
        >
          {_l('允许新增明细')}
        </Checkbox>
      </div>
      {allowadd === '1' && (
        <div className="pLeft24">
          <div className="labelWrap">
            <Checkbox
              checked={allowsingle === '1'}
              onChange={event => {
                onChange(
                  handleAdvancedSettingChange(data, {
                    allowsingle: !event.target.checked ? '0' : '1',
                  }),
                );
              }}
              size="small"
            >
              {_l('单行新增')}
            </Checkbox>
          </div>
          <div className="labelWrap">
            <Checkbox
              checked={visible}
              onChange={event => {
                const checked = !event.target.checked;
                setVisible(!checked);
                if (checked) {
                  onChange(
                    handleAdvancedSettingChange(data, {
                      batchcids: JSON.stringify([]),
                    }),
                  );
                }
              }}
              size="small"
            >
              {_l('选择关联记录字段新增')}
              <Tooltip
                placement="bottom"
                title={_l(
                  '如：在添加订单明细时需要先选择关联的产品。此时您可以设置为从产品字段添加明细。设置后，您可以直接一次选择多个产品，并为每个产品都添加一行订单明细',
                )}
              >
                <i className="icon-help textDisabled Font16 pointer"></i>
              </Tooltip>
            </Checkbox>
          </div>
          {visible && (
            <Select
              className="mTop10 w100"
              placeholder={_l('选择子表中的关联记录字段')}
              notFoundContent={_l('没有可选字段')}
              value={batchcids[0] || undefined}
              options={worksheetControls}
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
              checked={allowimport === '1'}
              onChange={event =>
                onChange(
                  handleAdvancedSettingChange(data, {
                    allowimport: !event.target.checked ? '0' : '1',
                  }),
                )
              }
              size="small"
            >
              {_l('导入新增')}
            </Checkbox>
          </div>
          <div className="labelWrap">
            <Checkbox
              checked={allowcopy === '1'}
              onChange={event =>
                onChange(
                  handleAdvancedSettingChange(data, {
                    allowcopy: !event.target.checked ? '0' : '1',
                  }),
                )
              }
              size="small"
            >
              {_l('复制')}
            </Checkbox>
          </div>
        </div>
      )}
      <div className="labelWrap">
        <Checkbox
          checked={allowedit === '1'}
          onChange={event =>
            onChange(
              handleAdvancedSettingChange(data, {
                allowedit: !event.target.checked ? '0' : '1',
              }),
            )
          }
          size="small"
        >
          {_l('可编辑已有明细')}
        </Checkbox>
      </div>
      <div className="labelWrap">
        <Checkbox
          checked={allowcancel === '1'}
          onChange={event =>
            onChange(
              handleAdvancedSettingChange(data, {
                allowcancel: !event.target.checked ? '0' : '1',
              }),
            )
          }
          size="small"
        >
          {_l('可删除已有明细')}
        </Checkbox>
      </div>
      <SettingItem>
        <div className=" settingItemTitle">{_l('其他')}</div>
        <div className="labelWrap">
          <Checkbox
            checked={allowlink === '1'}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  allowlink: !event.target.checked ? '0' : '1',
                }),
              )
            }
            size="small"
          >
            {_l('允许弹层打开')}
          </Checkbox>
        </div>
        <div className="labelWrap">
          <Checkbox
            checked={allowbatch === '1'}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  allowbatch: !event.target.checked ? '0' : '1',
                }),
              )
            }
            size="small"
          >
            {_l('允许批量操作')}
          </Checkbox>
        </div>
        <div className="labelWrap">
          <Checkbox
            checked={allowexport === '1'}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  allowexport: !event.target.checked ? '0' : '1',
                }),
              )
            }
            size="small"
          >
            {_l('允许导出')}
          </Checkbox>
        </div>
      </SettingItem>
    </Fragment>
  );
}

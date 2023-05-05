import React, { Fragment, useState, useEffect } from 'react';
import { RadioGroup, Checkbox } from 'ming-ui';
import Components from '../../components';
import { isEmpty } from 'lodash';
import { Button, SettingItem } from '../../styled';
import { TEMPLATE_TYPE } from '../../config/ocr';
import OcrMap from '../components/OcrMap';
import { updateConfig } from '../../util/setting';
import ApiSearchConfig from '../components/ApiSearchConfig';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';

const API_DISPLAY = [
  {
    text: _l('系统预设'),
    value: '0',
  },
  {
    text: _l('集成中心'),
    value: '1',
  },
];

export default function OcrDisplay(props) {
  const { data, allControls = [], onChange } = props;
  const { enumDefault, strDefault } = data;
  const [visible, setVisible] = useState(false);
  const ocrMap = getAdvanceSetting(data, 'ocrmap');
  const [disableAlbum] = (strDefault || '00').split('');
  const { ocrapitype = '0', ocroriginal = '' } = getAdvanceSetting(data);

  const FILED_LIST = allControls.filter(i => i.type === 14).map(i => ({ text: i.controlName, value: i.controlId }));

  useEffect(() => {
    if (_.isUndefined(enumDefault)) {
      onChange(handleAdvancedSettingChange({ ...data, enumDefault: 1 }, { ocrmap: JSON.stringify([]) }));
    }
  }, [data.controlId]);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('接口服务')}</div>
        <RadioGroup
          size="middle"
          checkedValue={ocrapitype}
          data={API_DISPLAY}
          onChange={value => {
            let newData = handleAdvancedSettingChange(data, { ocrapitype: value });
            if (value === '1' && _.isUndefined(data.hint)) {
              newData = { ...newData, hint: _l('识别文字') };
            }
            onChange(newData);
          }}
        />
      </SettingItem>

      {ocrapitype === '1' ? (
        <Fragment>
          {/**按查询按钮格式来，没有选项列表 */}
          <ApiSearchConfig {...props} />
          <SettingItem>
            <div className="settingItemTitle">{_l('保存识别原件')}</div>
            <Components.Dropdown
              placeholder={_l('选择附件字段')}
              value={ocroriginal}
              data={FILED_LIST}
              onChange={value => {
                onChange(handleAdvancedSettingChange(data, { ocroriginal: value }));
              }}
            />
          </SettingItem>
        </Fragment>
      ) : (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('识别模板')}</div>
            <Components.Dropdown
              placeholder={_l('请选择识别模板')}
              value={enumDefault}
              data={TEMPLATE_TYPE}
              onChange={value => {
                if (value !== enumDefault) {
                  onChange(
                    handleAdvancedSettingChange({ ...data, enumDefault: value }, { ocrmap: JSON.stringify([]) }),
                  );
                }
              }}
            />
          </SettingItem>
          {_.isNumber(enumDefault) && (
            <SettingItem>
              <div className="settingItemTitle">{_l('字段映射')}</div>
              {isEmpty(ocrMap) ? (
                <Button style={{ borderStyle: isEmpty(ocrMap) ? 'dashed' : 'solid' }} onClick={() => setVisible(true)}>
                  {_l('点击设置')}
                </Button>
              ) : (
                <Button onClick={() => setVisible(true)}>
                  <i style={{ position: 'relative', top: '2px' }} className="icon-check_circle active Font18"></i>
                  <span>{_l('已设置')}</span>
                </Button>
              )}
              {visible && <OcrMap {...props} onClose={() => setVisible(false)} />}
            </SettingItem>
          )}
        </Fragment>
      )}

      <SettingItem>
        <div className="settingItemTitle">{_l('移动端设置')}</div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={disableAlbum === '1'}
            onClick={checked =>
              onChange({ strDefault: updateConfig({ config: strDefault || '00', value: +!checked, index: 0 }) })
            }
            text={_l('禁用相册')}
          />
        </div>
      </SettingItem>
    </Fragment>
  );
}

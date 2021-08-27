import React, { Fragment, useState, useEffect } from 'react';
import Components from '../../components';
import { isEmpty } from 'lodash';
import { Button, SettingItem } from '../../styled';
import { TEMPLATE_TYPE } from '../../config/ocr';
import OcrMap from '../components/OcrMap';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';

export default function OcrDisplay(props) {
  const { data, onChange } = props;
  const { enumDefault } = data;
  const [visible, setVisible] = useState(false);
  const ocrMap = getAdvanceSetting(data, 'ocrmap');
  useEffect(() => {
    if (_.isUndefined(enumDefault)) {
      onChange(handleAdvancedSettingChange({ ...data, enumDefault: 1 }, { ocrmap: JSON.stringify([]) }));
    }
  }, [data.controlId]);
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('识别模板')}</div>
        <Components.Dropdown
          placeholder={_l('请选择识别模板')}
          value={enumDefault}
          data={TEMPLATE_TYPE}
          onChange={value => {
            if (value !== enumDefault) {
              onChange(handleAdvancedSettingChange({ ...data, enumDefault: value }, { ocrmap: JSON.stringify([]) }));
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
  );
}

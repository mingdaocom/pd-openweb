import React, { useState } from 'react';
import { Dialog, Radio } from 'ming-ui';
import { useSetState } from 'react-use';
import { SettingItem } from '../../../styled';
import styled from 'styled-components';
import CustomSaveConfig from './CustomSaveConfig';
import { enumWidgetType } from 'src/pages/widgetConfig/util';
import { DEFAULT_DATA } from 'src/pages/widgetConfig/config/widget';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { v4 } from 'uuid';

const DISPLAY_OPTIONS = [
  {
    text: _l('存储字段值'),
    desc: _l('存储数据后字段可以参与搜索、筛选与导出'),
    value: '1',
  },
  {
    text: _l('仅引用其他字段值'),
    desc: _l('以自定义样式呈现本表单其他字段的值'),
    value: '2',
  },
];

const AddCustomWrap = styled.div`
  .ming.Radio {
    margin-right: 0;
    display: inline-block;
    width: 100%;
    &:last-child {
      margin-top: 10px;
    }
  }
  .titleIcon {
    font-size: 80px;
  }
`;

export default function AddCustomDialog(props) {
  const { data, onOk, onCancel } = props;
  const { customtype } = getAdvanceSetting(data);
  const [visible, setVisible] = useState(true);
  const [{ customType, saveType, saveInfo }, setState] = useSetState({
    customType: customtype || '1',
    saveType: 2,
    saveInfo: {},
  });

  const okDisabled = customType === '1' && !saveType;

  const handleOk = () => {
    let nextData;
    const freeId = v4();
    if (customType === '2') {
      nextData = handleAdvancedSettingChange(data, { customtype: customType, freeid: freeId });
    } else {
      const ENUM_TYPE = enumWidgetType[saveType];
      const info = DEFAULT_DATA[ENUM_TYPE] || {};
      const originCustomData = DEFAULT_DATA.CUSTOM;
      nextData = {
        ...data,
        ...info,
        ...originCustomData,
        type: saveType,
        advancedSetting: {
          ...info.advancedSetting,
          ...originCustomData.advancedSetting,
          customtype: customType,
          freeid: freeId,
        },
      };

      if (saveType === 29) {
        nextData = _.omit({ ...nextData, ...saveInfo }, 'relateSelf');
      }
    }

    onOk(nextData, saveInfo.relateSelf);
    setVisible(false);
  };

  return (
    <Dialog
      width={640}
      title={null}
      visible={visible}
      okDisabled={okDisabled}
      className="SearchWorksheetDialog"
      onCancel={onCancel}
      onOk={handleOk}
    >
      <AddCustomWrap>
        <div className="flexCenter flexColumn">
          <span className="icon-custom-01 titleIcon"></span>
          <span className="Font17 mTop20 Bold">{_l('添加自定义字段')}</span>
          <div className="Gray_75 mTop8 ">{_l('与 AI 对话生成代码，创建一个完全自定义样式与交互的字段')}</div>
        </div>

        <SettingItem>
          <div className="settingItemTitle">{_l('字段是否存储数据？')}</div>
          {DISPLAY_OPTIONS.map(({ value, text, desc }) => {
            return (
              <Radio
                size="middle"
                checked={customType === value}
                text={text}
                onClick={() => {
                  if (value === customType) return;
                  if (value === '1') {
                    setState({ customType: value, saveType: 2 });
                  } else {
                    setState({ customType: value, saveType: '' });
                  }
                }}
              >
                <div className="Gray_75 pLeft28">{desc}</div>
              </Radio>
            );
          })}
        </SettingItem>
        {customType === '1' && (
          <CustomSaveConfig {...props} saveType={saveType} setState={info => setState({ ...info })} />
        )}
      </AddCustomWrap>
    </Dialog>
  );
}

export function addCustomDialog(props) {
  functionWrap(AddCustomDialog, props);
}

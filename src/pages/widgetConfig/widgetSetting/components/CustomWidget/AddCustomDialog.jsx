import React, { useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 } from 'uuid';
import { Modal, Radio } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { DEFAULT_DATA } from 'src/utils/domain/control/widget';
import { enumWidgetType } from 'src/utils/domain/control/widgetTypes';
import { SettingItem } from '../../../styled';
import CustomSaveConfig from './CustomSaveConfig';

const getDisplayOptions = () => [
  {
    text: (
      <>
        <span className="textPrimary Font14">{_l('存储字段值')}</span>
        <span className="textSecondary InlineBlock w100">{_l('存储数据后字段可以参与搜索、筛选与导出')}</span>
      </>
    ),
    value: '1',
  },
  {
    text: (
      <>
        <span className="textPrimary Font14">{_l('仅引用其他字段值')}</span>
        <span className="textSecondary InlineBlock w100">{_l('以自定义样式呈现本表单其他字段的值')}</span>
      </>
    ),
    value: '2',
  },
];

const AddCustomWrap = styled.div`
  .hap-radio-group {
    gap: 0;
  }
  .hap-radio-wrapper {
    flex: none;
    align-items: flex-start;
    margin-right: 0;
    width: 100%;
    &:last-child {
      margin-top: 10px;
    }
    .hap-radio {
      align-self: flex-start;
      margin-top: 5px;
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
    <Modal
      width={640}
      title={null}
      open={visible}
      mask={{ closable: true }}
      keyboard
      okDisabled={okDisabled}
      className="SearchWorksheetDialog"
      onCancel={onCancel}
      onOk={handleOk}
    >
      <AddCustomWrap>
        <div className="flexCenter flexColumn">
          <span className="icon-custom-01 titleIcon"></span>
          <span className="Font17 mTop20 Bold">{_l('添加自定义字段')}</span>
          <div className="textSecondary mTop8 ">{_l('与 AI 对话生成代码，创建一个完全自定义样式与交互的字段')}</div>
        </div>

        <SettingItem>
          <div className="settingItemTitle">{_l('字段是否存储数据？')}</div>
          <Radio.Group
            size="middle"
            vertical={true}
            value={customType}
            options={getDisplayOptions().map(({ text, ...option }) => ({ ...option, label: text }))}
            onChange={event => {
              const value = event.target.value;

              setState({
                customType: value,
                saveType: value === '1' ? 2 : '',
              });
            }}
          />
        </SettingItem>
        {customType === '1' && (
          <CustomSaveConfig {...props} saveType={saveType} setState={info => setState({ ...info })} />
        )}
      </AddCustomWrap>
    </Modal>
  );
}

export function useAddCustomDialog() {
  return useFunctionWrapComponent(AddCustomDialog);
}

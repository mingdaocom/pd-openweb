import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import { CardItem } from 'src/pages/widgetConfig/widgetSetting/components/StyleContent/StyleContentItems';

function StyleSettingDialog(props) {
  const { data, values, id, onChange, onClose = () => {} } = props;
  const [styleData, setStyleData] = useState({});

  useEffect(() => {
    const currentControl = _.find(data, c => c.controlId === id);
    const tempValue = _.find(values, v => v.controlId === id);

    if (!tempValue.value) {
      setStyleData({
        ..._.pick(currentControl, ['type', 'controlId', 'controlName']),
        advancedSetting: {
          rowtitlestyle: JSON.stringify({ size: '1', color: 'var(--color-text-title)' }),
          cardtitlestyle: JSON.stringify({ size: '0', color: 'var(--color-text-secondary)' }),
          cardvaluestyle: JSON.stringify({ size: '0', color: 'var(--color-text-primary)' }),
          cardstyle: JSON.stringify({ bordercolor: 'var(--color-border-secondary)' }),
        },
      });
      return;
    }

    setStyleData({
      ..._.pick(currentControl, ['type', 'controlId', 'controlName']),
      advancedSetting: { ...JSON.parse(tempValue.value || '{}') },
    });
  }, []);

  return (
    <Modal
      open
      width={480}
      mask={{ closable: false }}
      keyboard
      title={_l('卡片样式')}
      okText={_l('确认')}
      styles={{ header: { marginBottom: 0 } }}
      onOk={() => {
        const newValues = values.map(v => {
          if (v.controlId === id) {
            return { ...v, value: JSON.stringify(styleData.advancedSetting) };
          }

          return v;
        });
        onChange('controls', newValues);
        onClose();
      }}
      onCancel={() => onClose()}
    >
      <CardItem
        data={styleData}
        onChange={newData => {
          setStyleData(newData);
        }}
        from="rule"
      />
    </Modal>
  );
}

export function useStyleSettingDialog() {
  return useFunctionWrapComponent(StyleSettingDialog);
}

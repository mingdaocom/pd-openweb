import React, { useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import WidgetBase from 'src/pages/widgetConfig/widgetSetting/components/WidgetBase';
import { DEFAULT_DATA, SYS } from 'src/utils/domain/control/widget';
import { enumWidgetType } from 'src/utils/domain/control/widgetTypes';

const QUICK_ADD_MODAL_STYLES = {
  header: { marginBottom: 0 },
  body: { overflow: 'visible' },
};

const Wrap = styled.div(
  ({ $height }) => `
  #widgetConfigSettingWrap {
    height: ${$height}px;
    width: 100%;
    border-left: none;
    margin-top: -20px;
    .settingContentWrap {
      width: 100%;
      height: 100%;
      overflow: auto;
      padding: 0;
    }
  }
  .settingItemTitle{
    justify-content: space-between;
  }
`,
);

export default function AddControlDiaLog(params) {
  const requestPending = useRef(false);
  const { controls = [], setVisible, visible, type, addName, onAdd, enumType, title, worksheetId, onChange } = params;
  let initData = {
    ...DEFAULT_DATA[enumType],
    type: type || enumWidgetType[enumType],
    controlId: uuidv4(),
  };
  const [data, setData] = useState(addName ? { ...initData, controlName: addName } : initData);
  const widgetProps = {
    activeWidget: data,
    data,
    widgets: controls,
    onChange: obj => {
      setData({ ...data, ...obj });
    },
    allControls: controls, // genControlsByWidgets(widgets),
    // 全局表信息
    type, //传入的type
    quickAddControl: true,
  };

  const onSave = () => {
    if (requestPending.current) return;

    let row = Math.max(...controls.filter(o => !SYS.includes(o.controlId)).map(o => o.row));
    let control = { ...data, row: row + 1 };
    requestPending.current = true;
    return worksheetAjax
      .addWorksheetControls({
        worksheetId: worksheetId,
        controls: [_.omit(control, ['controlId'])],
      })
      .then(({ msg }) => {
        onAdd(controls.concat({ ...control, controlId: msg.split(':')[0] }));
        onChange && onChange(msg.split(':')[0]);
        setVisible(false);
      })
      .finally(() => {
        requestPending.current = false;
      });
  };

  return (
    <Modal
      title={title}
      width={360}
      okText={_l('确定')}
      cancelText={_l('取消')}
      className="quickAddControlDialog"
      styles={QUICK_ADD_MODAL_STYLES}
      onCancel={() => setVisible(false)}
      onOk={() => {
        onSave();
      }}
      open={visible}
    >
      <Wrap $height={!widgetProps.type ? 135 : 88}>
        <WidgetBase {...widgetProps} />
      </Wrap>
    </Modal>
  );
}

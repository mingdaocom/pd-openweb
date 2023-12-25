import React, { createRef, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import WidgetBase from 'src/pages/widgetConfig/widgetSetting/components/WidgetBase';
import { DEFAULT_DATA } from 'src/pages/widgetConfig/config/widget';
import { Dialog } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { enumWidgetType } from 'src/pages/widgetConfig/util';
import { v4 as uuidv4 } from 'uuid';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import _ from 'lodash';

const Wrap = styled.div(
  ({ height }) => `
  #widgetConfigSettingWrap {
    height: ${height}px;
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
    let row = Math.max(...controls.filter(o => !SYS.includes(o.controlId)).map(o => o.row));
    let control = { ...data, row: row + 1 };
    worksheetAjax
      .addWorksheetControls({
        worksheetId: worksheetId,
        controls: [_.omit(control, ['controlId'])],
      })
      .then(({ code, data, msg }) => {
        onAdd(controls.concat({ ...control, controlId: msg.split(':')[0] }));
        onChange && onChange(msg.split(':')[0]);
        setVisible(false);
      });
  };
  return (
    <Dialog
      title={title}
      width={360}
      okText={_l('确定')}
      cancelText={_l('取消')}
      className="quickAddControlDialog"
      headerClass="quickAddControlDialogTitle"
      bodyClass="quickAddControlDialogCon"
      onCancel={() => setVisible(false)}
      onOk={() => {
        onSave();
      }}
      visible={visible}
      updateTrigger="fasle"
    >
      <Wrap height={!widgetProps.type ? 135 : 88}>
        <WidgetBase {...widgetProps} />
      </Wrap>
    </Dialog>
  );
}

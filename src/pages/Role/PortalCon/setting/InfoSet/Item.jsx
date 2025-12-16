import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import { Checkbox, Dropdown, Icon } from 'ming-ui';
import { DEFAULT_CONFIG } from 'src/pages/widgetConfig/config/widget';
import ConfigRelate from 'src/pages/widgetConfig/widgetSetting/components/relateSheet/ConfigRelate.jsx';
import { handleAdvancedSettingChange } from 'src/utils/control';
import { WIDGETS_TO_API_TYPE, WIDGETS_TO_API_TYPE_ENUM_N } from './config';
import { WrapSortControls } from './style';
import { initData } from './util';

export default function Item(props) {
  let {
    type,
    showEditDialog,
    deleteBtn,
    onChange,
    required,
    fieldPermission = '111',
    controlId,
    DragHandle,
    appId,
    projectId,
  } = props;
  const [controlName, setControlName] = useState(props.controlName);
  const [{ showCreateRelateControlId }, setState] = useSetState({ showCreateRelateControlId: '' });
  useEffect(() => {
    setControlName(props.controlName);
  }, [props.controlName]);
  return (
    <WrapSortControls className="mBottom10 porTalSort flexRow">
      <DragHandle className="alignItemsCenter flexRow">
        <Icon className="mRight12 Font16 Hand Gray_9e" icon="drag" />
      </DragHandle>
      {type ? (
        <span className="InlineBlock controlN">
          {DEFAULT_CONFIG[WIDGETS_TO_API_TYPE_ENUM_N[type] || 'TEXT'].widgetName}
        </span>
      ) : (
        <Dropdown
          isAppendToBody
          data={WIDGETS_TO_API_TYPE.map(o => {
            return { text: DEFAULT_CONFIG[o].widgetName, value: o };
          })}
          className="InlineBlock controlN"
          onChange={newValue => {
            if (newValue === 'RELATE_SHEET') {
              setState({ showCreateRelateControlId: controlId });
            }
            onChange(initData(newValue, null, controlId));
          }}
          placeholder={_l('类型')}
        />
      )}
      <input
        className={cx('controlName InlineBlock mLeft10 mRight25', { noName: !controlName })}
        value={controlName}
        placeholder={_l('字段标题')}
        onChange={e => {
          setControlName(e.target.value);
        }}
        onBlur={e => {
          let value = e.target.value.trim();
          onChange({ controlName: value, controlId });
          setControlName(value);
        }}
      />
      <Checkbox
        className="TxtLeft InlineBlock Hand cellect"
        text={''}
        checked={fieldPermission === '110'}
        onClick={() => {
          onChange({
            fieldPermission: fieldPermission === '110' ? '111' : '110',
            controlId,
          });
        }}
      />
      <Checkbox
        className="TxtLeft InlineBlock Hand required"
        text={''}
        checked={required}
        onClick={() => {
          onChange({ required: !required, controlId });
        }}
      />
      <Icon
        className="Font18 Hand mRight10 set"
        icon="settings"
        onClick={() => {
          if (!type) {
            alert(_l('请选择字段类型'), 3);
            return;
          }
          showEditDialog(controlId, type);
        }}
      />
      <Icon
        className="Font18 Hand del"
        icon="trash"
        onClick={() => {
          deleteBtn(controlId);
        }}
      />
      {!!showCreateRelateControlId && (
        <ConfigRelate
          allControls={[]}
          fromPortal={true}
          globalSheetInfo={{ appId, projectId }}
          onOk={({ sheetId, sheetName }) => {
            let para = handleAdvancedSettingChange(
              {
                ...initData('RELATE_SHEET', null, showCreateRelateControlId),
                dataSource: sheetId,
              },
              { showtype: '1' },
            );
            para = sheetName ? { ...para, controlName: sheetName } : para;
            onChange(para);
            setState({ showCreateRelateControlId: '' });
            const relateTimer = setTimeout(() => {
              showEditDialog(para.controlId, para.type);
              clearTimeout(relateTimer);
            }, 200);
          }}
          deleteWidget={() => {
            deleteBtn(controlId);
            setState({ showCreateRelateControlId: '' });
          }}
        />
      )}
    </WrapSortControls>
  );
}

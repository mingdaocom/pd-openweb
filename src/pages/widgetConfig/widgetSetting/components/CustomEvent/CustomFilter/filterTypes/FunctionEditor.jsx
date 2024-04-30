import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import FunctionEditorDialog from '../../../FunctionEditorDialog';

export default function FunctionEditor(props) {
  const { filterData = {}, data, handleOk, allControls } = props;
  const { valueType, advancedSetting = {} } = filterData;
  const defaultFunc = advancedSetting.defaultfunc
    ? safeParse(advancedSetting.defaultfunc)
    : { type: 'javascript', expression: '' };

  const [{ visible }, setState] = useSetState({
    visible: true,
  });

  if (!visible) return null;

  return (
    <FunctionEditorDialog
      supportJavaScript
      customTitle={_l('配置自定义函数条件')}
      control={{ ...data, advancedSetting }}
      value={defaultFunc}
      title={data.controlName}
      controls={allControls.filter(c => c.controlId !== data.controlId)}
      onClose={() => setState({ visible: false })}
      onSave={value => {
        handleOk({
          valueType,
          advancedSetting: { ...advancedSetting, defaulttype: '1', defaultfunc: JSON.stringify(value) },
        });
      }}
    />
  );
}

import React, { Fragment, useEffect } from 'react';
import { handleAdvancedSettingChange } from '../../util/setting';
import Formula from '../components/formula/Formula';
import SwitchType from '../components/formula/SwitchType';

export default function FormulaNumber(props) {
  const { data, onChange } = props;
  useEffect(() => {
    // 初始化用老数据unit覆盖suffix
    if (data.unit) {
      onChange(handleAdvancedSettingChange({ ...data, unit: '' }, { suffix: data.unit }));
    }
  }, [data.controlId]);
  return (
    <Fragment>
      <SwitchType {...props} />
      <Formula
        {...props}
        onSave={result => {
          props.onChange({
            dataSource: result.formula,
            enumDefault: result.calType,
          });
        }}
      />
    </Fragment>
  );
}

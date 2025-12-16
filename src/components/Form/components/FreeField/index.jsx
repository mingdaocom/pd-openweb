import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import sheetAjax from 'src/api/worksheet';
import FreeFieldRunner from 'worksheet/common/FreeFieldRunner/FreeFieldRunner';
import { getEnv } from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/util';
import { browserIsMobile } from 'src/utils/common';

export default function FreeField(props) {
  const {
    flag,
    worksheetId,
    controlId,
    recordId,
    disabled,
    value,
    formData,
    onChange,
    advancedSetting = {},
    refreshRecord = () => {},
  } = props;
  const cache = useRef({});
  const { height } = advancedSetting;
  const reference = safeParse(advancedSetting.reference, 'array');
  const [controlHeight, setControlHeight] = useState(height);
  const [code, setCode] = useState('');

  useEffect(() => {
    cache.current.disabled = disabled;
  }, [disabled]);

  useEffect(() => {
    if (!controlId || !worksheetId) return;

    sheetAjax
      .getControlsByIds({ worksheetId, controlIds: [controlId] })
      .then(({ data }) => {
        if (data?.length) {
          const control = data[0];
          const { custom_js } = control.advancedSetting;
          setCode(custom_js);
        }
      })
      .catch(err => {
        console.log('err', err);
      });
  }, [controlId, worksheetId]);

  return (
    <div style={{ height: controlHeight ? `${controlHeight}px` : '200px' }}>
      <FreeFieldRunner
        type="production"
        code={code}
        compReRenderFlag={flag}
        widgetParams={{
          env: getEnv(reference, {
            isMobile: browserIsMobile(),
            isDisabled: disabled,
          }),
          currentControlId: controlId,
          recordId,
          worksheetId,
          value,
          formData: formData.concat([{ controlId: 'rowid', controlName: _l('记录ID'), type: 2, value: recordId }]),
          onChange: (...args) => {
            if (cache.current.disabled) return;
            onChange(...args);
          },
          refreshRecord,
          setControlHeight,
        }}
      />
    </div>
  );
}

FreeField.propTypes = {
  value: PropTypes.any,
  recordId: PropTypes.string,
  onChange: PropTypes.func,
  advancedSetting: PropTypes.object,
  addRefreshEvents: PropTypes.func,
};

import React, { useEffect, useState, useRef } from 'react';
import FreeFieldRunner from 'worksheet/common/FreeFieldRunner/FreeFieldRunner';
import PropTypes from 'prop-types';
import { browserIsMobile } from 'src/util';
import { getEnv } from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/util';
import { useCallback } from 'react';
export default function FreeField(props) {
  const { flag, worksheetId, controlId, recordId, disabled, value, formData, onChange, advancedSetting = {} } = props;
  const cache = useRef({});
  const { custom_js: code, height } = advancedSetting;
  const reference = safeParse(advancedSetting.reference, 'array');
  useEffect(() => {
    cache.current.disabled = disabled;
  }, [disabled]);
  return (
    <div style={{ height: height ? `${height}px` : '200px' }}>
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
          formData,
          onChange: (...args) => {
            if (cache.current.disabled) return;
            onChange(...args);
          },
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

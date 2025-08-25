import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
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
  const { custom_js: code, height } = advancedSetting;
  const reference = safeParse(advancedSetting.reference, 'array');
  const [controlHeight, setControlHeight] = useState(height);
  useEffect(() => {
    cache.current.disabled = disabled;
  }, [disabled]);
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
          formData,
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

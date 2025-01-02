import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import FreeFieldRunner from 'worksheet/common/FreeFieldRunner/FreeFieldRunner';
import { getEnv } from './util';

const Con = styled.div`
  height: 100%;
  padding: 24px 30px;
  display: flex;
  flex-direction: column;
  .controlName {
    font-size: 13px;
    color: #151515;
    margin-bottom: 6px;
    font-weight: bold;
  }
  .emptyHolder {
    border: 1px solid #ddd;
    height: 36px;
  }
`;

export default function ControlPreview({
  className,
  controlName,
  runFlag,
  currentControlId,
  code,
  formData,
  onError,
  reference,
  isDisabled,
  isMobile,
}) {
  const env = useMemo(() => getEnv(reference, { isDisabled, isMobile }), [reference, isDisabled, isMobile]);
  const [value, setValue] = useState();
  useEffect(() => {
    const targetControl = formData.find(item => item.controlId === currentControlId);
    if (targetControl) {
      setValue(targetControl.value);
    }
  }, [formData, currentControlId]);
  return (
    <Con className={className}>
      <div className="controlName">{controlName}</div>
      {!code && <div className="emptyHolder"></div>}
      {code && (
        <FreeFieldRunner
          runFlag={runFlag}
          type="development"
          code={code}
          widgetParams={{
            value,
            env,
            formData,
            currentControlId,
            onChange: setValue,
          }}
          onError={onError}
        />
      )}
    </Con>
  );
}

ControlPreview.propTypes = {
  code: PropTypes.string,
  currentControlId: PropTypes.string,
  className: PropTypes.string,
  reference: PropTypes.arrayOf(PropTypes.shape({})),
  isDisabled: PropTypes.bool,
  isMobile: PropTypes.bool,
  formData: PropTypes.arrayOf(PropTypes.shape({})),
  onError: PropTypes.func,
};

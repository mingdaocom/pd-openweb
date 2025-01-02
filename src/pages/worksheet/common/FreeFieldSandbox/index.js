import React, { useEffect, useCallback, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import MessageBridge from './messageBridge';
import Runner from './Runner';
import { find } from 'lodash';

const root = createRoot(document.querySelector('#app'));

const messageBridge = new MessageBridge();

function FreeFieldSandbox() {
  const [code, setCode] = useState();
  const [value, setValue] = useState();
  const [formData, setFormData] = useState();
  const [env, setEnv] = useState();
  const [currentControl, setCurrentControl] = useState();
  const [compReRenderFlag, setCompReRenderFlag] = useState();
  const sendMessageToMain = useCallback(data => {
    messageBridge.emitter.emit('send-message-to-main', data);
  }, []);
  const handleEmitterEvent = useCallback((payload = {}) => {
    const { event } = payload;
    if (event === 'set-code') {
      setCode(payload.code);
    } else if (event === 'update-params') {
      setValue(payload.value);
      setFormData(payload.formData);
      setEnv(payload.env);
      setCurrentControl(payload.currentControl);
    } else if (event === 'refresh') {
      location.reload();
    } else if (event === 'set-comp-re-render-flag') {
      setCompReRenderFlag(payload.compReRenderFlag);
    }
  }, []);
  useEffect(() => {
    sendMessageToMain({ event: 'container-did-mount' });
    messageBridge.emitter.addListener('container', handleEmitterEvent);
    return () => {
      messageBridge.emitter.removeListener('container', handleEmitterEvent);
    };
  }, []);
  return (
    code && (
      <Runner
        type={messageBridge.type}
        code={code}
        reRenderFlag={compReRenderFlag}
        params={{
          currentControl,
          value,
          formData,
          env,
        }}
        onChange={newValue => {
          sendMessageToMain({ event: 'trigger-on-change', value: newValue });
        }}
        onError={error => {
          sendMessageToMain({ event: 'trigger-error', error });
        }}
      />
    )
  );
}

root.render(<FreeFieldSandbox />);

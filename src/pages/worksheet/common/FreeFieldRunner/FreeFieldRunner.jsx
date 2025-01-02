import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { v4 } from 'uuid';
import { find, get, pick } from 'lodash';
import { MessageHandler } from 'src/util/iframeCommunicate';
import { getRowsRelation } from './functions';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';

const Con = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  .loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
  }
  iframe {
    width: 100%;
    height: 100%;
  }
`;

function pickControl(control) {
  return pick(control, ['controlId', 'controlName', 'value', 'type', 'options']);
}

function formatFormData(formData) {
  const result = {};
  formData.forEach(item => {
    result[item.controlId] = pickControl(item);
  });
  return result;
}

export default function FreeFieldRunner({
  type,
  code,
  runFlag,
  compReRenderFlag,
  className,
  widgetParams = {},
  onError = () => {},
}) {
  const [iframeId] = useState(v4());
  const { currentControlId, value, env, recordId, worksheetId, onChange } = widgetParams;
  const iframeRef = useRef();
  const cache = useRef({});
  cache.current.formData = widgetParams.formData;
  const [loadingForMask, setLoadingForMask] = useState(false);
  const formData = useMemo(() => formatFormData(widgetParams.formData || []), [widgetParams.formData]);
  const currentControl = useMemo(() => {
    const targetControl = find(widgetParams.formData || [], item => item.controlId === currentControlId);
    return targetControl;
  }, [widgetParams.formData, currentControlId]);
  const postToIframe = useCallback(payload => {
    iframeRef.current.contentWindow.postMessage({ source: 'main_web', payload }, '*');
  }, []);
  const showMask = useCallback((delay = 100) => {
    setLoadingForMask(true);
    setTimeout(() => {
      setLoadingForMask(false);
    }, delay);
  }, []);
  const handleMessage = useCallback(event => {
    const { id, source, payload } = event.data;
    if (source === 'free_field' && id === iframeId) {
      if (payload.event === 'container-did-mount') {
        cache.current.didMount = true;
        console.log('container-did-mount');
        if (cache.current.code) {
          postToIframe({ event: 'set-code', code: cache.current.code });
          cache.current.code = undefined;
        }
        if (cache.current.params) {
          postToIframe({ event: 'update-params', ...cache.current.params });
          cache.current.params = undefined;
        }
      } else if (payload.event === 'trigger-on-change') {
        onChange(payload.value);
      } else if (payload.event === 'trigger-error') {
        onError(payload.error);
      }
    }
  }, []);
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);
  useEffect(() => {
    if (cache.current.didMount) {
      postToIframe({ event: 'set-code', code });
      showMask();
    } else {
      cache.current.code = code;
    }
  }, [code]);
  useEffect(() => {
    if (runFlag) {
      postToIframe({ event: 'set-code', code });
      showMask();
    }
  }, [runFlag]);
  useEffect(() => {
    if (compReRenderFlag) {
      postToIframe({ event: 'set-comp-re-render-flag', compReRenderFlag });
      showMask();
    }
  }, [compReRenderFlag]);
  useEffect(() => {
    const params = { currentControl: pickControl(currentControl), value, formData, env };
    if (cache.current.didMount) {
      postToIframe({ event: 'update-params', ...params });
    } else {
      cache.current.params = params;
    }
  }, [value, formData, env]);
  useEffect(() => {
    const messageHandler = new MessageHandler({
      tunnelId: iframeId,
    });
    messageHandler.register('getRowsForRelation', (params = {}) =>
      getRowsRelation(
        { control: currentControl, recordId, formData: cache.current.formData, parentWorksheetId: worksheetId },
        params,
      ),
    );
    messageHandler.register('getTitleOfRecord', record =>
      getTitleTextFromControls(currentControl.relationControls, record),
    );
  }, []);
  return (
    <Con className={className}>
      <iframe
        allow="fullscreen"
        className="previewIframe"
        ref={iframeRef}
        src={`${(get(md, 'global.Config.PluginRuntimeUrl') || '').replace(
          /\/$/,
          '',
        )}/freefield?id=${iframeId}&type=${type}`}
        frameborder="0"
        style={{ width: '100%' }}
      ></iframe>
      {loadingForMask && <div className="loading" />}
    </Con>
  );
}

FreeFieldRunner.propTypes = {
  type: PropTypes.oneOf(['production', 'development']),
  code: PropTypes.string,
  currentControlId: PropTypes.string,
  className: PropTypes.string,
  widgetParams: PropTypes.shape({}),
  onError: PropTypes.func,
};

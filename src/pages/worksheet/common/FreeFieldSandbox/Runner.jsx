import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRunner } from 'react-runner';
import EventEmitter from 'events';
import * as LucideIconComp from 'lucide-react';
import PropTypes, { func } from 'prop-types';
import styled from 'styled-components';
import { ParentBridge } from 'src/utils/iframeCommunicate';

const Con = styled.div`
  width: 100%;
  height: 100%;
`;

const scope = {
  ...React,
  LucideIcon,
};

const useRun = function ({ initialCode, ...rest }) {
  const [code, setCode] = useState(initialCode);
  const { element, error } = useRunner({ code, ...rest });
  return { element, error, setCode };
};

function LucideIcon(props) {
  const { name, ...rest } = props;
  const Comp = LucideIconComp[name] || LucideIconComp.RectangleVertical;
  return <Comp name={name} {...rest} />;
}

LucideIcon.propTypes = {
  name: PropTypes.string,
};

function getFullCode(code) {
  if (!code) {
    return '';
  }
  return `${code.replace(/function +\w+/, 'function FreeField')}
  export default function () {
    const cache = useRef({});
    const [loading, setLoading] = useState(false);
    const [didMount, setDidMount] = useState(false);
    const [currentControl, setCurrentControl] = useState();
    const [value, setValue] = useState();
    const [formData, setFormData] = useState([]);
    const [env, setEnv] = useState({});
    useEffect(() => {
      emitter.removeAllListeners('value-update-from-runner');
      emitter.addListener('value-update-from-runner', params => {
        setValue(params.value);
        setFormData(params.formData);
        setEnv(params.env);
        setCurrentControl(params.currentControl);
        if (!cache.current.didMount) {
          setDidMount(true);
          cache.current.didMount = true;
        }
      });
      emitter.addListener('set-loading', loading => {
        setLoading(loading);
      });
    }, []);
    return (!didMount || loading) ? <span /> : <FreeField value={value} currentControl={currentControl || {}} env={env || {}} formData={formData} onChange={(...args) => {
      emitter.emit('value-update-from-widget', ...args);
    }}/>
  }
  `;
}

export default function Runner({ reRenderFlag, type, code, params, onChange = () => {}, onError = () => {} }) {
  const runnerEmitter = useRef(new EventEmitter());
  const bridge = useRef(
    new ParentBridge({
      tunnelId: new URL(location.href).searchParams.get('id'),
    }),
  );
  const memoizedFunctions = useMemo(() => {
    return {
      getRowsForRelation: apiParams =>
        new Promise((resolve, reject) => {
          bridge.current.call('getRowsForRelation', apiParams).then(res => {
            resolve(res);
          });
        }),
      refreshRecord: apiParams =>
        new Promise((resolve, reject) => {
          bridge.current.call('refreshRecord', apiParams).then(res => {
            resolve(res);
          });
        }),
      getTitleOfRecord: record =>
        new Promise((resolve, reject) => {
          bridge.current.call('getTitleOfRecord', record).then(res => {
            resolve(res);
          });
        }),
      setControlHeight: record =>
        new Promise((resolve, reject) => {
          bridge.current.call('setControlHeight', record).then(res => {
            resolve(res);
          });
        }),
    };
  }, []);
  const memoizedScope = useMemo(() => {
    return {
      ...scope,
      ...memoizedFunctions,
      emitter: runnerEmitter.current,
    };
  }, []);
  const {
    element,
    error,
    setCode: updateCode,
  } = useRun({
    initialCode: getFullCode(code),
    scope: memoizedScope,
  });
  useEffect(() => {
    updateCode(getFullCode(code));
  }, [code]);
  useEffect(() => {
    runnerEmitter.current.emit('value-update-from-runner', params);
  }, [params]);
  useEffect(() => {
    runnerEmitter.current.removeAllListeners('value-update-from-widget');
    runnerEmitter.current.addListener('value-update-from-widget', (...args) => {
      console.log('onChange', args);
      onChange(...args);
    });
  }, [onChange]);
  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error]);
  useEffect(() => {
    runnerEmitter.current.emit('value-update-from-runner', params);
  }, [element]);
  useEffect(() => {
    runnerEmitter.current.emit('set-loading', true);
    setTimeout(() => {
      runnerEmitter.current.emit('set-loading', false);
    }, 0);
  }, [reRenderFlag]);
  return <Con>{error ? <span style={{ color: '#ff2424' }}>{type === 'production' ? '' : error}</span> : element}</Con>;
}

Runner.propTypes = {
  type: PropTypes.oneOf(['production', 'development']),
  code: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onError: PropTypes.func,
};

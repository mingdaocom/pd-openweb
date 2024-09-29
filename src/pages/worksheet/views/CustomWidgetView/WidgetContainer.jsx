import { arrayOf, bool, func, shape, string } from 'prop-types';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import qs from 'query-string';
import { LoadDiv } from 'ming-ui';
import { formatQuickFilter } from 'worksheet/util';
import styled from 'styled-components';
import { get, pick } from 'lodash';
import { emitter } from 'worksheet/util';
import WidgetBridge from './bridge';
import filterXSS from 'xss';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

const Side = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
`;

const CustomWidget = styled.iframe`
  flex: 1;
  height: 100%;
  border: none;
  border-right: 1px solid #e0e0e0;
`;

function getFilters(filters = {}, quickFilter = [], navGroupFilters = []) {
  return {
    ...filters,
    fastFilters: formatQuickFilter(quickFilter),
    navGroupFilters,
  };
}

export default function WidgetContainer(props) {
  const {
    scriptUrl,
    isServerUrl,
    paramsMap,
    appPkg = {},
    appId,
    worksheetId,
    viewId,
    view,
    controls,
    worksheetInfo,
    flag,
    filters,
    quickFilter,
    navGroupFilters,
    onLoadScript = () => {},
  } = props;
  const iframeRef = useRef();
  const cache = useRef({});
  const bridge = useRef(new WidgetBridge({ cache: cache }));
  const [reloadFlag, setReloadFlag] = useState(props.flag);
  const [RecordInfoComponent, setRecordInfoComponent] = useState(null);
  const [side, setSide] = useState();
  cache.current = {
    scriptUrl,
    isServerUrl,
    paramsMap,
    config: {
      customWidgetViewVersion: 1,
      appId,
      projectId: worksheetInfo.projectId,
      themeColor: appPkg.iconColor,
      worksheetId,
      viewId,
      view,
      controls,
      worksheetInfo,
      filters: getFilters(filters, quickFilter, navGroupFilters),
      query: qs.parse(location.search.slice(1)),
      currentAccount: pick(get(md, 'global.Account') || {}, [
        'fullname',
        'avatar',
        'lang',
        'accountId',
        'email',
        'mobilePhone',
      ]),
    },
  };
  const emitWidgetDataUpdate = useCallback(
    value => {
      bridge.current.sendWidgetBridge(Object.assign(value, { type: 'data-update' }));
    },
    [bridge.current],
  );
  useEffect(() => {
    if (reloadFlag && iframeRef.current) {
      bridge.current.sendWidgetBridge({
        action: 'reload',
      });
    }
  }, [scriptUrl, reloadFlag]);
  useEffect(() => {
    setReloadFlag(Math.random().toString());
  }, [JSON.stringify(paramsMap)]);
  useEffect(() => {
    bridge.current.mountPropertyOnWindow('env', {
      ...cache.current.paramsMap,
    });
    bridge.current.mountPropertyOnWindow('config', cache.current.config);
    setReloadFlag(flag + viewId);
  }, [flag, viewId]);
  useEffect(() => {
    // 筛选条件更新，发送更新消息到插件
    emitWidgetDataUpdate({
      action: 'filters-update',
      value: getFilters(filters, quickFilter, navGroupFilters),
    });
  }, [filters, quickFilter, navGroupFilters]);
  useEffect(() => {
    window.customWidgetViewIsActive = true;
    bridge.current.targetWindow = get(iframeRef, 'current.contentWindow');
    bridge.current.init(
      () => {
        bridge.current.mountPropertyOnWindow('env', {
          ...cache.current.paramsMap,
        });
        bridge.current.mountPropertyOnWindow('config', cache.current.config);
      },
      () => onLoadScript(true),
    );
    import('worksheet/common/recordInfo/RecordInfoWrapper').then(component => {
      setRecordInfoComponent(component);
    });
    emitter.addListener('POST_MESSAGE_TO_CUSTOM_WIDGET', emitWidgetDataUpdate);
    return () => {
      window.customWidgetViewIsActive = false;
      bridge.current.destroy();
      emitter.removeListener('POST_MESSAGE_TO_CUSTOM_WIDGET', emitWidgetDataUpdate);
    };
  }, []);
  return (
    <Con>
      <CustomWidget
        allow="geolocation; microphone; camera;"
        ref={iframeRef}
        src={`${(get(md, 'global.Config.PluginRuntimeUrl') || '').replace(/\/$/, '')}/widgetview`}
      />
      {side &&
        (side.type === 'html' ? (
          <Side dangerouslySetInnerHTML={{ __html: filterXSS(side.html) }} />
        ) : (
          <Side>
            {RecordInfoComponent ? (
              <RecordInfoComponent.default
                notDialog
                from={2}
                appId={appId}
                worksheetId={worksheetId}
                recordId={side.recordId}
                hideRecordInfo={() => setSide(undefined)}
              />
            ) : (
              <LoadDiv />
            )}
          </Side>
        ))}
    </Con>
  );
}

WidgetContainer.propTypes = {
  flag: string,
  isServerUrl: bool,
  scriptUrl: string,
  paramsMap: shape({}),
  appPkg: shape({}),
  appId: string,
  worksheetId: string,
  viewId: string,
  view: shape({}),
  controls: arrayOf(shape({})),
  worksheetInfo: shape({}),
  filters: arrayOf(shape({})),
  quickFilter: arrayOf(shape({})),
  navGroupFilters: arrayOf(shape({})),
  onLoadScript: func,
};

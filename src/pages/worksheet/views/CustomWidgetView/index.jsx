import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/worksheet/redux/actions/customWidgetView';
import WidgetContainer from './WidgetContainer';
import Abnormal from './Abnormal';
import _ from 'lodash';
import styled from 'styled-components';
import { string, arrayOf, shape, func, bool } from 'prop-types';
import { browserIsMobile, emitter } from 'src/util';
import { CUSTOM_WIDGET_VIEW_STATUS, PLUGIN_INFO_SOURCE, PLUGIN_INFO_STATE } from 'worksheet/constants/enum';

const Con = styled.div`
  height: 100%;
`;

function getDefaultOfParam(control) {
  try {
    return safeParse(_.get(control, 'advancedSetting.defsource'))[0].staticValue;
  } catch (err) {
    return;
  }
}

function getParamsMap(view = {}) {
  const paramSettings = _.get(view, 'pluginInfo.paramSettings') || [];
  const pluginMap = safeParse(_.get(view, 'advancedSetting.plugin_map') || '');
  const configuration = _.get(view, 'pluginInfo.configuration') || {};
  const result = {
    ...configuration,
  };
  paramSettings.forEach(c => {
    if (![22, 201].includes(c.type)) {
      result[c.fieldId] = pluginMap[c.fieldId] || getDefaultOfParam(c);
    }
  });
  return result;
}

function getViewStatus({ view, scriptUrl }) {
  if (
    _.get(view, 'pluginInfo.state') === PLUGIN_INFO_STATE.DISABLED &&
    _.get(view, 'pluginInfo.source') === PLUGIN_INFO_SOURCE.DEVELOPMENT
  ) {
    return CUSTOM_WIDGET_VIEW_STATUS.DEVELOPING;
  } else if (_.get(view, 'pluginInfo.state') === PLUGIN_INFO_STATE.DISABLED) {
    return CUSTOM_WIDGET_VIEW_STATUS.NOT_PUBLISH;
  } else if (_.get(view, 'pluginInfo.state') === PLUGIN_INFO_STATE.DELETED || _.isUndefined(view.pluginInfo)) {
    return CUSTOM_WIDGET_VIEW_STATUS.DELETED;
  } else if (_.get(view, 'pluginInfo.state') === PLUGIN_INFO_STATE.EXPIRED) {
    return CUSTOM_WIDGET_VIEW_STATUS.EXPIRED;
  } else {
    return scriptUrl ? CUSTOM_WIDGET_VIEW_STATUS.NORMAL : CUSTOM_WIDGET_VIEW_STATUS.NOT_PUBLISH;
  }
}

function CustomWidgetView(props) {
  const {
    isCharge,
    appId,
    worksheetId,
    viewId,
    controls,
    worksheetInfo,
    appPkg,
    view = {},
    customWidgetView = {},
    filters,
    quickFilter,
    navGroupFilters,
    refresh,
  } = props;
  const { isPublished = false, currentScriptUrl } = view;
  const debugUrl = localStorage.getItem('customViewDebugUrl_' + viewId);
  const codeUrl = _.get(view, 'pluginInfo.codeUrl');
  const scriptUrl = isPublished ? currentScriptUrl : debugUrl || codeUrl;
  const { flag } = customWidgetView;
  const pluginIsPublished = _.get(view, 'pluginInfo.source') === 1;
  const showDebugButton = isCharge && !browserIsMobile() && !pluginIsPublished;
  const [status, setStatus] = useState(getViewStatus({ scriptUrl, view }));
  const conRef = useRef();
  useEffect(() => {
    setStatus(getViewStatus({ scriptUrl, view }));
  }, [flag, scriptUrl, viewId]);
  useEffect(() => {
    emitter.addListener('CUSTOM_WIDGET_VIEW_DEBUG_URL_UPDATE', refresh);
    return () => {
      emitter.removeListener('CUSTOM_WIDGET_VIEW_DEBUG_URL_UPDATE', refresh);
    };
  }, []);
  return (
    <Con ref={conRef}>
      {status !== CUSTOM_WIDGET_VIEW_STATUS.NORMAL &&
        !(status === CUSTOM_WIDGET_VIEW_STATUS.DEVELOPING && scriptUrl) && (
          <Abnormal
            status={status}
            showDebugButton={showDebugButton}
            text={
              status === CUSTOM_WIDGET_VIEW_STATUS.LOAD_SCRIPT_ERROR &&
              _l('加载脚本%0失败', scriptUrl ? ' ' + scriptUrl + ' ' : '')
            }
          />
        )}
      {(status === CUSTOM_WIDGET_VIEW_STATUS.NORMAL ||
        (status === CUSTOM_WIDGET_VIEW_STATUS.DEVELOPING && scriptUrl)) && (
        <WidgetContainer
          scriptUrl={scriptUrl}
          isServerUrl={scriptUrl === codeUrl}
          paramsMap={getParamsMap(view)}
          appPkg={appPkg}
          appId={appId}
          view={view}
          viewId={viewId}
          worksheetId={worksheetId}
          controls={controls}
          worksheetInfo={worksheetInfo}
          filters={filters}
          quickFilter={quickFilter}
          navGroupFilters={navGroupFilters}
          flag={flag}
          onLoadScript={err => {
            if (err) {
              setStatus(CUSTOM_WIDGET_VIEW_STATUS.LOAD_SCRIPT_ERROR);
            }
          }}
        />
      )}
    </Con>
  );
}

CustomWidgetView.propTypes = {
  isCharge: bool,
  customWidgetView: shape({}),
  appPkg: shape({}),
  appId: string,
  worksheetId: string,
  viewId: string,
  controls: arrayOf(shape({})),
  worksheetInfo: shape({}),
  filters: arrayOf(shape({})),
  quickFilter: arrayOf(shape({})),
  navGroupFilters: arrayOf(shape({})),
  refresh: func,
};

export default connect(
  state =>
    _.pick(state.sheet, ['customWidgetView', 'controls', 'worksheetInfo', 'filters', 'navGroupFilters', 'quickFilter']),
  dispatch => bindActionCreators({ ...actions }, dispatch),
)(CustomWidgetView);

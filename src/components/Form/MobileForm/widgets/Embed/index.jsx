import React, { memo, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import worksheetAjax from 'src/api/worksheet';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { ADD_EVENT_ENUM } from '../../../core/enum';
import { isPublicLink } from '../../../core/utils';

const EmbedWrap = styled.div`
  width: 100%;
  ${props => (props.isMobileView ? `height: ${props.height}px;` : '')}
  .embedContainer {
    width: 100%;
    border: 1px solid var(--gray-e0);
    border-radius: 4px;
    ${props => (props.viewType === VIEW_DISPLAY_TYPE.sheet && !isPublicLink() ? '' : `height: ${props.height}px;`)}
    ${props =>
      props.isMobileView ? `height: ${props.height}px;position: absolute; transform: translate(0px, 0px);` : ''}
    &.chartPadding {
      padding: 8px 16px 16px;
    }
    .SingleViewHeader.mobile {
      display: none !important;
    }
    .toolBarWrap {
      ${props => (props.isMobileView ? 'left: 12px!important; margin-left: 0; width: 200px;' : '')}
    }
    .fixedTabs {
      display: none;
    }
    .mobileSearchRecordDropdown {
      top: auto !important;
    }
  }
  .viewContainer {
    display: flex;
    & > div {
      padding: 0;
    }

    .SingleViewHeader {
      .searchInputComp {
        ${props =>
          _.includes([VIEW_DISPLAY_TYPE.detail, VIEW_DISPLAY_TYPE.resource], props.viewType)
            ? { display: 'none;' }
            : {}}
      }
    }
  }
`;

const Embed = props => {
  const {
    advancedSetting = {},
    enumDefault,
    enumDefault2,
    dataSource,
    viewId,
    recordId,
    viewIdForPermit,
    isDraft,
    controlId,
    triggerCustomEvent,
    addRefreshEvents,
    appId,
  } = props;
  const iframeRef = useRef(null);
  const embedWatch = useRef(null);
  const latestResultData = useRef('');
  const latestProps = useRef(props);
  const { appid, reportid, wsid } = enumDefault === 1 ? {} : safeParse(dataSource || '{}');
  const { height, rownum = '10' } = advancedSetting;
  const [{ resultData, needUpdate, ChartComponents, viewType, controls }, setState] = useSetState({
    resultData: '',
    needUpdate: Math.random(),
    ChartComponents: null,
    viewType: '',
    controls: [],
  });

  const getControls = component => {
    worksheetAjax.getWorksheetInfo({ worksheetId: wsid, getViews: true }).then(({ template = {}, views = [] }) => {
      const curView = _.find(views, v => v.viewId === reportid);
      setState({
        ChartComponents: component,
        viewType: String(_.get(curView, 'viewType')),
        controls: _.get(template, 'controls') || [],
      });
      setValue();
    });
  };

  const handleReloadIFrame = () => {
    if (_.isFunction(_.get(iframeRef, 'current.contentDocument.location.reload'))) {
      try {
        iframeRef.current.contentDocument.location.reload();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const initFunc = () => {
    if (enumDefault === 2) {
      import('mobile/CustomPage/ChartContent').then(component => {
        setState({ ChartComponents: component });
        setValue();
      });
    } else if (enumDefault === 3) {
      import('./EmbedPreview').then(getControls);
    } else {
      setValue();
    }

    if (_.isFunction(addRefreshEvents)) {
      addRefreshEvents(controlId, handleReloadIFrame);
    }

    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  };

  const setValue = () => {
    const { enumDefault, value, formData, recordId } = latestProps.current;
    const _resultData = latestResultData.current;
    if (enumDefault === 1) {
      if (value && value !== _resultData) {
        setState({ resultData: value });
      }
    } else {
      const filterResult = getFilter({
        control: { ...props, relationControls: controls || [], recordId, ignoreFilterControl: enumDefault === 2 },
        formData,
      }) || [{}];

      if (!_.isEqual(_resultData, filterResult)) {
        setState({ resultData: filterResult, needUpdate: Math.random() });
      }
    }
  };

  useEffect(() => {
    initFunc();
    embedWatch.current = setInterval(setValue, 3000);
    return () => {
      clearInterval(embedWatch.current);
    };
  }, [controls]);

  useEffect(() => {
    latestResultData.current = resultData;
  }, [resultData]);

  useEffect(() => {
    latestProps.current = props;
  }, [props]);

  const getContent = () => {
    const isLegal = enumDefault === 1 ? /^https?:\/\/.+$/.test(resultData) : dataSource;
    const isShareView = _.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage');

    if (!isLegal) {
      return (
        <div className="embedContainer">
          <div className="w100 h100 Gray_9e BGF7F7F7 Font15 flexRow alignItemsCenter justifyContentCenter">
            {_l('嵌入内容无法解析')}
          </div>
        </div>
      );
    }

    if (enumDefault === 3 && (isPublicLink() || viewType === VIEW_DISPLAY_TYPE.detail)) {
      return (
        <div className="embedContainer">
          <div className="w100 h100 Gray_9e BGF7F7F7 Font15 flexRow alignItemsCenter justifyContentCenter">
            {viewType === VIEW_DISPLAY_TYPE.detail ? _l('暂不支持显示详情视图') : _l('暂不支持显示视图')}
          </div>
        </div>
      );
    }

    if (enumDefault === 1) {
      return (
        <div className="embedContainer">
          <iframe
            ref={iframeRef}
            width="100%"
            height="100%"
            frameborder="0"
            allowtransparency="true"
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            allowfullscreen="true"
            src={resultData}
          />
        </div>
      );
    } else {
      if (!ChartComponents || !wsid) return null;

      if (enumDefault === 3) {
        return (
          <div className="embedContainer viewContainer">
            <ChartComponents.default
              appId={appid || appId}
              setting={{
                value: wsid,
                viewId: reportid,
                config: {
                  fromEmbed: true,
                  isAddRecord: enumDefault2 !== 1,
                  searchRecord: true,
                  ...(viewType === VIEW_DISPLAY_TYPE.sheet ? { pageCount: rownum } : {}),
                  fullShowTable: true,
                  minRowCount: 2,
                  isDraft,
                },
              }}
              filtersGroup={resultData}
              needUpdate={needUpdate}
            />
          </div>
        );
      }

      return (
        <div className="embedContainer chartPadding flexColumn">
          <ChartComponents.default
            reportId={reportid}
            pageId={isShareView ? viewId : recordId}
            filters={resultData}
            needUpdate={needUpdate}
            viewId={viewIdForPermit}
          />
        </div>
      );
    }
  };

  return (
    <EmbedWrap height={height || 400} viewType={viewType} isMobileView={enumDefault === 3}>
      {getContent()}
    </EmbedWrap>
  );
};

Embed.propTypes = {
  className: PropTypes.string,
  hint: PropTypes.string,
  flag: PropTypes.string,
  maskPermissions: PropTypes.bool,
  enumDefault: PropTypes.number,
  value: PropTypes.string,
  advancedSetting: PropTypes.object,
  triggerCustomEvent: PropTypes.func,
  disabled: PropTypes.bool,
  formDisabled: PropTypes.bool,
};

export default memo(Embed);

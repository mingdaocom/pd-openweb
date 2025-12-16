import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import worksheetAjax from 'src/api/worksheet';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { isPublicLink } from '../../../core/utils';

const EmbedWrap = styled.div`
  width: 100%;
  .embedContainer {
    width: 100%;
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
    ${props => (props.viewType === VIEW_DISPLAY_TYPE.sheet && !isPublicLink() ? '' : `height: ${props.height}px;`)}
    &.chartPadding {
      padding: 8px 16px 16px;
    }
    .SingleViewHeader.mobile {
      display: none !important;
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
    enumDefault,
    addRefreshEvents,
    controlId,
    dataSource,
    recordId,
    flag,
    advancedSetting = {},
    enumDefault2,
    viewId,
    projectId,
    isCharge,
    viewIdForPermit,
    isDraft,
    appId,
  } = props;

  const [resultData, setResultData] = useState('');
  const [needUpdate, setNeedUpdate] = useState(Math.random());
  const [ChartComponents, setChartComponents] = useState(null);
  const [viewType, setViewType] = useState('');

  const iframeRef = useRef(null);
  const embedWatchRef = useRef(null);
  const viewControlsRef = useRef([]);

  const latestResultData = useRef(resultData);
  const propsRef = useRef(props);
  propsRef.current = props;
  latestResultData.current = resultData;

  const initFunc = callback => {
    if (enumDefault === 2) {
      import('statistics/Card').then(component => {
        setChartComponents(component);
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

    if (_.isFunction(callback)) {
      callback();
    }
  };

  const getControls = useCallback(
    component => {
      const { reportid, wsid } = safeParse(dataSource || '{}');

      worksheetAjax.getWorksheetInfo({ worksheetId: wsid, getViews: true }).then(({ template = {}, views = [] }) => {
        const curView = _.find(views, v => v.viewId === reportid);
        setChartComponents(component);
        setViewType(String(_.get(curView, 'viewType')));
        viewControlsRef.current = _.get(template, 'controls') || [];
        setValue();
      });
    },
    [dataSource],
  );

  const setValue = () => {
    const currentProps = propsRef.current;
    const {
      enumDefault: currentEnumDefault,
      value: currentValue,
      recordId: currentRecordId,
      formData: currentFormData,
    } = currentProps;

    if (currentEnumDefault === 1) {
      if (currentValue && currentValue !== resultData) {
        setResultData(currentValue);
      }
    } else {
      const filterResult = getFilter({
        control: {
          ...currentProps,
          relationControls: viewControlsRef.current || [],
          recordId: currentRecordId,
          ignoreFilterControl: currentEnumDefault === 2,
        },
        formData: currentFormData,
        ignoreEmptyRule: true,
      }) || [{}];

      if (!_.isEqual(latestResultData.current, filterResult)) {
        setResultData(filterResult);
        setNeedUpdate(Math.random());
      }
    }
  };

  const handleReloadIFrame = useCallback(() => {
    if (_.isFunction(_.get(iframeRef, 'current.contentDocument.location.reload'))) {
      try {
        iframeRef.current.contentDocument.location.reload();
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  useEffect(() => {
    initFunc();
    embedWatchRef.current = setInterval(setValue, 3000);

    return () => {
      clearInterval(embedWatchRef.current);
      if (_.isFunction(addRefreshEvents)) {
        addRefreshEvents(controlId, undefined);
      }
    };
  }, []);

  useEffect(() => {
    initFunc(() => {
      // 嵌入链接无法主动刷新，变更src刷新
      if (enumDefault === 1 && iframeRef.current) {
        const tmpUrl = _.get(iframeRef, 'current.src');
        iframeRef.current.src = 'about:blank';
        const _t = setTimeout(() => {
          iframeRef.current.src = tmpUrl;
          clearTimeout(_t);
        }, 300);
      } else {
        setNeedUpdate(Math.random());
      }
    });
  }, [flag, recordId]);

  const { height, rownum = '10' } = advancedSetting;
  const { appid, reportid, wsid } = enumDefault === 1 ? {} : safeParse(dataSource || '{}');

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
                  embedNeedUpdate: needUpdate,
                },
              }}
              filtersGroup={resultData}
            />
          </div>
        );
      }

      return (
        <Fragment>
          <ChartComponents.default
            className="embedContainer chartPadding"
            report={{ id: reportid }}
            pageId={isShareView ? viewId : recordId}
            projectId={projectId}
            appId={appid || appId}
            sourceType={2}
            filters={resultData}
            needUpdate={needUpdate}
            isCharge={isCharge}
            viewId={viewIdForPermit}
          />
        </Fragment>
      );
    }
  };

  return (
    <EmbedWrap height={height || 400} viewType={viewType}>
      {getContent()}
    </EmbedWrap>
  );
};

Embed.propTypes = {
  enumDefault: PropTypes.number,
  addRefreshEvents: PropTypes.func,
  controlId: PropTypes.string,
  dataSource: PropTypes.string,
  value: PropTypes.string,
  formData: PropTypes.array,
  recordId: PropTypes.string,
  flag: PropTypes.any,
  advancedSetting: PropTypes.object,
  enumDefault2: PropTypes.number,
  viewId: PropTypes.string,
  projectId: PropTypes.string,
  isCharge: PropTypes.bool,
  viewIdForPermit: PropTypes.string,
  isDraft: PropTypes.bool,
  appId: PropTypes.string,
};

export default Embed;

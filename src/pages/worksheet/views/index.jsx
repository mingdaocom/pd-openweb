import React, { useEffect, useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import SheetView from 'worksheet/views/SheetView';
import TreeTableView from 'worksheet/views/TreeTableView';
import ViewContext from './ViewContext';
import BoardView from './BoardView';
import HierarchyView from './HierarchyView';
import { navigateTo } from 'src/router/navigateTo';
import GalleryView from 'worksheet/views/GalleryView';
import CalendarView from 'worksheet/views/CalendarView';
import GunterView from 'worksheet/views/GunterView/enter';
import { Skeleton } from 'ming-ui';
import UnNormal from 'worksheet/views/components/UnNormal';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import styled from 'styled-components';
import _, { get } from 'lodash';
import HierarchyVerticalView from './HierarchyVerticalView';
import HierarchyMixView from './HierarchyMixView';
import DetailView from './DetailView';
import CustomWidgetView from './CustomWidgetView';
import MapView from './MapView';
import ResourceView from './ResourceView';
import { hierarchyViewCanSelectFields } from 'src/pages/worksheet/views/HierarchyView/util';

const { board, sheet, calendar, gallery, structure, gunter, detail, customize, resource, map } = VIEW_DISPLAY_TYPE;

const Con = styled.div`
  height: 100%;
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const Loading = styled.div``;

const TYPE_TO_COMP = {
  [board]: BoardView,
  [sheet]: SheetView,
  [gallery]: GalleryView,
  [calendar]: props => <CalendarView watchHeight {...props} />,
  [structure]: HierarchyView,
  [gunter]: GunterView,
  [detail]: DetailView,
  structureVertical: HierarchyVerticalView,
  structureMix: HierarchyMixView,
  treeTableView: TreeTableView,
  [customize]: CustomWidgetView,
  [map]: MapView,
  [resource]: ResourceView,
};

export function updateHierarchyConfigLevel(view) {
  const viewId = view.viewId;
  const defaultlayertime = get(view, 'advancedSetting.defaultlayertime');
  const defaultlayer = get(view, 'advancedSetting.defaultlayer');
  const config = safeParse(localStorage.getItem(`hierarchyConfig-${viewId}`));
  const { levelUpdateTime } = config;
  if (defaultlayer && defaultlayertime) {
    if (!levelUpdateTime || Number(defaultlayertime) > Number(levelUpdateTime)) {
      safeLocalStorageSetItem(`hierarchyConfig-${viewId}`, JSON.stringify({ ...config, level: Number(defaultlayer) }));
    }
  }
}
function View(props) {
  const { loading, error, view, views, showAsSheetView, refreshSheet } = props;
  const { advancedSetting = {} } = view;
  const authRefreshTime = props.authRefreshTime || get(view, 'advancedSetting.refreshtime');
  const cache = useRef({});

  let activeViewStatus = props.activeViewStatus;
  if (loading) {
    return (
      <Con>
        <Loading>
          <Skeleton
            style={{ flex: 1 }}
            direction="column"
            widths={['30%', '40%', '90%', '60%']}
            active
            itemStyle={{ marginBottom: '10px' }}
          />
          <Skeleton
            style={{ flex: 1 }}
            direction="column"
            widths={['40%', '55%', '100%', '80%']}
            active
            itemStyle={{ marginBottom: '10px' }}
          />
          <Skeleton
            style={{ flex: 2 }}
            direction="column"
            widths={['45%', '100%', '100%', '100%']}
            active
            itemStyle={{ marginBottom: '10px' }}
          />
        </Loading>
      </Con>
    );
  }

  const viewProps = _.pick(props, [
    'isCharge',
    'isDevAndOps',
    'appPkg',
    'appId',
    'groupId',
    'worksheetId',
    'view',
    'viewId',
    'chartId',
    'maxCount',
    'showControlIds',
    'openNewRecord',
    'setViewConfigVisible',
    'groupFilterWidth',
    'sheetSwitchPermit',
    'noLoadAtDidMount',
  ]);

  if (_.isEmpty(view) && !props.chartId && !_.get(window, 'shareState.isPublicView')) {
    if (views.length && viewProps.appId && viewProps.groupId && viewProps.worksheetId) {
      navigateTo(`/app/${viewProps.appId}/${viewProps.groupId}/${viewProps.worksheetId}`, true);
    } else {
      activeViewStatus = -10000;
    }
  }

  let viewType = String(showAsSheetView ? sheet : view.viewType);
  if (!showAsSheetView && view.viewType === 2) {
    const { viewControl, viewControls } = view;
    const { controls = [], worksheetId = '' } = props;
    const hierarchyData = hierarchyViewCanSelectFields({
      controls,
      worksheetId,
    });
    const isHaveSelectControl =
      viewControl === 'create' ||
      (viewControl &&
        _.find(controls, item => item.controlId === viewControl) &&
        hierarchyData.map(o => o.value).includes(viewControl)) ||
      !_.isEmpty(viewControls);
    if (isHaveSelectControl) {
      if (advancedSetting.hierarchyViewType === '1') {
        viewType = 'structureVertical';
      } else if (advancedSetting.hierarchyViewType === '2') {
        viewType = 'structureMix';
      } else if (advancedSetting.hierarchyViewType === '3') {
        viewType = 'treeTableView';
      }
    }
  }

  const Component = TYPE_TO_COMP[viewType];

  if (cache.current.viewId !== view.viewId) {
    updateHierarchyConfigLevel(view);
  }

  useEffect(() => {
    if (cache.current.refreshTimer) {
      clearInterval(cache.current.refreshTimer);
    }
    if (authRefreshTime && _.includes(['10', '30', '60', '120', '180', '240', '300'], String(authRefreshTime))) {
      cache.current.refreshTimer = setInterval(() => {
        if (
          document.querySelector('.workSheetNewRecord.mdModal') ||
          document.querySelector('.workSheetRecordInfo.mdModal') ||
          document.querySelector('.fillRecordControls.mdModal')
        ) {
          return;
        }
        refreshSheet(view, { noLoading: true, isAutoRefresh: true });
      }, Number(authRefreshTime) * 1000);
    }
    return () => {
      if (cache.current.refreshTimer) {
        clearInterval(cache.current.refreshTimer);
      }
    };
  }, [view.viewId, authRefreshTime]);

  useLayoutEffect(() => {
    cache.current.viewId = view.viewId;
  }, [view.viewId]);

  return (
    <ViewContext.Provider value={{ isCharge: props.isCharge }}>
      <Con>
        {!Component || activeViewStatus !== 1 ? (
          <UnNormal resultCode={error ? -999999 : activeViewStatus} />
        ) : (
          <Component {...viewProps} />
        )}
      </Con>
    </ViewContext.Provider>
  );
}

View.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.bool,
  view: PropTypes.shape({}),
  activeViewStatus: PropTypes.number,
  refreshSheet: PropTypes.func,
};

export default errorBoundary(View);

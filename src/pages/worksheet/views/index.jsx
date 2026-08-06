import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import cx from 'classnames';
import _, { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Skeleton } from 'ming-ui';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import UnNormal from 'worksheet/views/components/UnNormal';
import SheetView from 'worksheet/views/SheetView';
import TreeTableView from 'worksheet/views/TreeTableView';
import { REFRESH_TIME_VALUES } from 'src/pages/worksheet/common/ViewConfig/config';
import { hierarchyViewCanSelectFields } from 'src/pages/worksheet/views/HierarchyView/util';
import ViewContext from './ViewContext';

const { board, sheet, calendar, gallery, structure, gunter, detail, customize, resource, map } = VIEW_DISPLAY_TYPE;

const Con = styled.div`
  height: 100%;
  flex: 1;
  overflow: hidden;
  position: relative;
  &.viewType-treeTableView {
    .rowIsEmpty {
      border: none !important;
    }
  }
`;

const Loading = styled.div``;

const BoardView = lazy(() => import('./BoardView'));
const CalendarView = lazy(() => import('worksheet/views/CalendarView'));
const CustomWidgetView = lazy(() => import('./CustomWidgetView'));
const DetailView = lazy(() => import('./DetailView'));
const GalleryView = lazy(() => import('worksheet/views/GalleryView'));
const GunterView = lazy(() => import('worksheet/views/GunterView/enter'));
const HierarchyMixView = lazy(() => import('./HierarchyMixView'));
const HierarchyVerticalView = lazy(() => import('./HierarchyVerticalView'));
const HierarchyView = lazy(() => import('./HierarchyView'));
const MapView = lazy(() => import('./MapView'));
const ResourceView = lazy(() => import('./ResourceView'));

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

function ViewLoadingContent() {
  return (
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
  );
}

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
  const { error, view, showAsSheetView, refreshSheet } = props;
  const { advancedSetting = {} } = view;
  const authRefreshTime = props.authRefreshTime || get(view, 'advancedSetting.refreshtime');
  const cache = useRef({});

  let activeViewStatus = props.activeViewStatus;

  const viewProps = _.pick(props, [
    'type',
    'isCharge',
    'allowOpenRecord',
    'allowAddNewRecord',
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
    'printCharge',
    'hideFilter',
  ]);

  if (_.isEmpty(view) && !props.chartId && !_.get(window, 'shareState.isPublicView')) {
    activeViewStatus = -10000;
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

    if (authRefreshTime && _.includes(REFRESH_TIME_VALUES, String(authRefreshTime))) {
      cache.current.refreshTimer = setInterval(
        () => {
          if (
            document.querySelector('.workSheetNewRecord.mdModal') ||
            document.querySelector('.workSheetRecordInfo.mdModal') ||
            document.querySelector('.fillRecordControls.mdModal')
          ) {
            return;
          }

          refreshSheet(view, { noLoading: true, isAutoRefresh: true });
        },
        Number(authRefreshTime) * 1000,
      );
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
      <Con className={cx('viewCon', `viewType-${viewType}`)}>
        {!Component || activeViewStatus !== 1 ? (
          <UnNormal resultCode={error ? -999999 : activeViewStatus} />
        ) : (
          <Suspense fallback={<ViewLoadingContent />}>
            <Component {...viewProps} />
          </Suspense>
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

function ViewWithLoading(props) {
  const { loading } = props;

  if (loading) {
    return (
      <Con>
        <ViewLoadingContent />
      </Con>
    );
  }

  return <View {...props} />;
}

export default ErrorBoundary.wrap(ViewWithLoading);

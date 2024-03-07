import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import SheetView from 'worksheet/views/SheetView';
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
import _ from 'lodash';
import HierarchyVerticalView from './HierarchyVerticalView';
import HierarchyMixView from './HierarchyMixView';
import DetailView from './DetailView';
import CustomWidgetView from './CustomWidgetView';
import MapView from './MapView';
import ResourceView from './ResourceView';

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
  [customize]: CustomWidgetView,
  [map]: MapView,
  [resource]: ResourceView,
};
function View(props) {
  const { loading, error, view, views, showAsSheetView } = props;
  const { advancedSetting = {} } = view;

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
  ]);

  if (_.isEmpty(view) && !props.chartId && !_.get(window, 'shareState.isPublicView')) {
    if (views.length && viewProps.appId && viewProps.groupId && viewProps.worksheetId) {
      navigateTo(`/app/${viewProps.appId}/${viewProps.groupId}/${viewProps.worksheetId}`, true);
    } else {
      activeViewStatus = -10000;
    }
  }

  let viewType = String(showAsSheetView ? sheet : view.viewType);

  if (!showAsSheetView && view.viewType === 2 && advancedSetting.hierarchyViewType === '1') {
    viewType = 'structureVertical';
  } else if (!showAsSheetView && view.viewType === 2 && advancedSetting.hierarchyViewType === '2') {
    viewType = 'structureMix';
  }

  const Component = TYPE_TO_COMP[viewType];

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
};

export default errorBoundary(View);

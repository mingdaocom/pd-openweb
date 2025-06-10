import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { DndProvider } from 'react-dnd-latest';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { LoadDiv } from 'ming-ui';
import { RecordInfoModal } from 'mobile/Record';
import { getIconByType, toEditWidgetPage } from 'src/pages/widgetConfig/util';
import * as baseAction from 'src/pages/worksheet/redux/actions';
import * as viewActions from 'src/pages/worksheet/redux/actions/mapView';
import * as navFilterActions from 'src/pages/worksheet/redux/actions/navFilter';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import { browserIsMobile } from 'src/utils/common';
import { getMapConfig } from 'src/utils/control';
import { handlePushState, handleReplaceState } from 'src/utils/project';
import { updateWorksheetControls } from '../../redux/actions';
import SelectField from '../components/SelectField';
import { filterAndFormatterControls } from '../util';
import Map from './amap/Map';
import PinMarker from './components/PinMarker';
import GMap from './GMap/GMap';
import { calculatePoleCenter, calculateZoomLevel, parseRecord } from './utils';

const Con = styled.div`
  position: relative;
  height: 100vh;
  display: flex;
`;

function MapView(props) {
  const {
    appId,
    mapView,
    sheetSwitchPermit,
    controls,
    projectId,
    isCharge,
    view,
    viewId,
    initMapViewData,
    setViewConfigVisible,
    saveView,
    worksheetInfo,
    groupId,
  } = props;
  const { mapViewState, mapViewLoading, refreshMap } = mapView;
  const isMobile = browserIsMobile();
  const isGoogle = !!getMapConfig();

  const conRef = useRef();
  const [zoom, setZoom] = useState(5);
  const [center, setCenter] = useState([116.4, 39.9]);
  const [markers, setMarkers] = useState([]);
  const [mapViewConfig, setMapViewConfig] = useState({});
  const [recordInfoRowId, setRecordInfoRowId] = useState(null);
  const [mobileCloseCard, setMobileCloseCard] = useState(0);
  const mapViewRequest = useRef(null);

  const handleRefresh = () => {
    initMapViewData(undefined, true, mapViewRequest.current);
  };

  useEffect(() => {
    if (!mapViewRequest.current) mapViewRequest.current = uuidv4();
  }, []);

  useEffect(() => {
    init();
  }, [viewId, view.advancedSetting, view.coverCid]);

  useEffect(() => {
    if (!viewId || !view.viewControl || !mapViewState.searchData) return;

    const coordinate = parseRecord(mapViewState.searchData, mapViewConfig, controls);
    setCenter([coordinate.position.x, coordinate.position.y]);
  }, [mapViewState.searchData]);

  useEffect(() => {
    if (conRef.current) {
      const size = {
        width: conRef.current.clientWidth,
        height: conRef.current.clientHeight,
      };
      const parsedData = mapView.mapViewData
        .map(r => parseRecord(r, mapViewConfig, controls))
        .filter(d => !_.isEmpty(d.position));
      const coordinates = parsedData.map(c => [c.position.y, c.position.x]);
      let newZoom = calculateZoomLevel(coordinates, size.width, size.height, 1) || 5;
      if (newZoom < 5) {
        newZoom = 5;
      } else if (newZoom > 19) {
        newZoom = 19;
      }
      const newCenter = calculatePoleCenter(coordinates);
      setMarkers(parsedData);
      setZoom(Math.floor(newZoom));
      setCenter(newCenter ? newCenter.reverse() : [116.4, 39.9]);
    }
  }, [mapView.mapViewData, mapViewConfig]);

  useEffect(() => {
    window.addEventListener('popstate', onQueryChange);
    return () => {
      window.removeEventListener('popstate', onQueryChange);
    };
  }, []);

  const onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => setRecordInfoRowId(null));
  };

  const init = () => {
    if (!viewId || !view.viewControl) return;

    const { showtitle, viewtitle } = mapViewConfig;
    setMapViewConfig({
      positionId: view.viewControl,
      loadNum: 1000,
      titleId: _.get(view, 'advancedSetting.viewtitle')
        ? _.get(view, 'advancedSetting.viewtitle')
        : (controls.find(l => l.attribute === 1) || {}).controlId,
      abstract: _.get(view, 'advancedSetting.abstract'),
      coverId: _.get(view, 'coverCid'),
      tagcolorid: _.get(view, 'advancedSetting.tagcolorid'),
      tagType: _.get(view, 'advancedSetting.tagType'),
      showtitle: _.get(view, 'advancedSetting.showtitle'),
      viewtitle: _.get(view, 'advancedSetting.viewtitle'),
    });
    initMapViewData(
      undefined,
      showtitle !== _.get(view, 'advancedSetting.showtitle') || viewtitle !== _.get(view, 'advancedSetting.viewtitle'),
      mapViewRequest.current,
    );
  };

  const handleSelectField = obj => {
    if (!isCharge) return;
    const nextView = { ...view, ...obj };
    setViewConfigVisible(true);
    saveView(viewId, nextView, () => {
      initMapViewData(nextView);
    });
  };

  const renderContent = () => {
    const { viewControl } = view;
    const isHaveSelectControl =
      viewControl &&
      _.find(setSysWorkflowTimeControlFormat(controls, sheetSwitchPermit), item => item.controlId === viewControl);

    if (
      !isHaveSelectControl ||
      (isHaveSelectControl.type !== 40 &&
        (isHaveSelectControl.type !== 30 || isHaveSelectControl.sourceControlType !== 40))
    ) {
      return (
        <SelectField
          sheetSwitchPermit={sheetSwitchPermit}
          isCharge={isCharge}
          viewType={8}
          fields={filterAndFormatterControls({
            controls: controls,
            filter: l => l.type === 40 || (l.type === 30 && l.sourceControlType === 40),
            formatter: ({ controlName, controlId, type }) => ({
              text: controlName,
              value: controlId,
              icon: `icon-${getIconByType(type)}`,
            }),
          })}
          handleSelect={handleSelectField}
          toCustomWidget={() => {
            toEditWidgetPage(
              {
                sourceId: worksheetInfo.worksheetId,
                fromURL: `/app/${appId}/${groupId}/${worksheetInfo.worksheetId}/${viewId}`,
              },
              false,
            );
          }}
        />
      );
    }

    const markOptions = {
      ..._.pick(props, [
        'view',
        'isCharge',
        'appId',
        'worksheetInfo',
        'sheetSwitchPermit',
        'viewId',
        'groupId',
        'updateNavGroup',
        'sheetButtons',
        'printList',
      ]),
      mapViewState: mapViewState,
      controls: controls,
      mapViewConfig: mapViewConfig,
      isMobile: isMobile,
      mobileCloseCard: mobileCloseCard,
      onChangeRecordId: value => {
        handlePushState('page', 'recordDetail');
        setRecordInfoRowId(value);
      },
      getData: () => initMapViewData(view),
    };

    return (
      <Con
        onTouchStartCapture={e => {
          if (!isMobile) return;
          $('.mapViewCard.active')[0] && setMobileCloseCard(!mobileCloseCard);
        }}
      >
        {isGoogle ? (
          <GMap zoom={zoom} center={center} markers={markers} markOptions={markOptions} />
        ) : (
          <Map zoom={zoom} center={center}>
            {markers &&
              markers.map((marker, i) => {
                return (
                  <PinMarker
                    {...markOptions}
                    key={`PinMark-${marker.record.rowid}`}
                    isCurrent={_.get(mapViewState, 'searchData.rowid') === marker.record.rowid}
                    marker={marker}
                    handleRefresh={handleRefresh}
                  />
                );
              })}
          </Map>
        )}
      </Con>
    );
  };

  return (
    <div className="mapViewWrap" ref={conRef} style={{ height: '100%' }}>
      {refreshMap ? <LoadDiv /> : renderContent()}
      {recordInfoRowId && isMobile && (
        <RecordInfoModal
          className="full"
          visible={!!recordInfoRowId}
          appId={appId}
          worksheetId={worksheetInfo.worksheetId}
          enablePayment={worksheetInfo.enablePayment}
          viewId={viewId}
          rowId={recordInfoRowId}
          onClose={() => setRecordInfoRowId(null)}
          refreshCollectRecordList={() => init()}
          updateRow={() => init()}
          deleteRow={() => init()}
        />
      )}
    </div>
  );
}

const ConnectedMapView = connect(
  state => ({
    ..._.pick(state.sheet, [
      'mapView',
      'worksheetInfo',
      'filters',
      'controls',
      'sheetSwitchPermit',
      'sheetButtons',
      'printList',
    ]),
  }),
  dispatch =>
    bindActionCreators({ ...viewActions, ...baseAction, ...navFilterActions, updateWorksheetControls }, dispatch),
)(MapView);

export default function MapViewCon(props) {
  return (
    <DndProvider context={window} backend={HTML5Backend}>
      <ConnectedMapView {...props} />
    </DndProvider>
  );
}

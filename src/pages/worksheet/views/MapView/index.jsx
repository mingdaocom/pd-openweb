import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { DndProvider } from 'react-dnd-latest';
import _ from 'lodash';
import styled, { keyframes } from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { LoadDiv } from 'ming-ui';
import { RecordInfoModal } from 'mobile/Record';
import addRecord from 'worksheet/common/newRecord/addRecord';
import useButtonStatusOfRows from 'worksheet/hooks/useButtonStatusOfRows';
import { getIconByType, toEditWidgetPage } from 'src/pages/widgetConfig/util';
import * as baseAction from 'src/pages/worksheet/redux/actions';
import * as viewActions from 'src/pages/worksheet/redux/actions/mapView';
import * as navFilterActions from 'src/pages/worksheet/redux/actions/navFilter';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import { browserIsMobile } from 'src/utils/common';
import { getMapConfig } from 'src/utils/control';
import { handlePushState, handleReplaceState } from 'src/utils/project';
import { filterButtonBySheetSwitchPermit, getSheetOperatesButtons } from 'src/utils/worksheet';
import { updateWorksheetControls } from '../../redux/actions';
import SelectField from '../components/SelectField';
import { filterAndFormatterControls, isDisabledCreate } from '../util';
import Map from './amap/Map';
import PinMarker from './components/PinMarker';
import ToolBar from './components/ToolBar';
import GMap from './GMap/GMap';
import { calculatePoleCenter, calculateZoomLevel, parseRecord } from './utils';

const Con = styled.div`
  position: relative;
  height: 100vh;
  display: flex;
`;

const NewRecordBtn = styled.div`
  position: absolute;
  z-index: 1;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  min-width: 80px;
  height: 30px;
  border-radius: 30px;
  cursor: pointer;
  white-space: nowrap;
  background-color: var(--app-primary-color, var(--color-primary));
  ${({ clickLnglat }) => !clickLnglat && 'display: none;'}
  .icon {
    font-size: 13px;
    margin-right: 5px;
  }
`;

const rippleAnimation = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.25);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
`;

export const Ripple = styled.div`
  position: absolute;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0);
  border-radius: 50%;
  pointer-events: none;

  transform: translate(-50%, -50%) scale(0);
  opacity: 0;

  &.active {
    animation: ${rippleAnimation} 1000ms ease-out;
  }
`;

function MapView(props) {
  const {
    appId,
    mapView,
    sheetSwitchPermit,
    controls,
    isCharge,
    view,
    viewId,
    initMapViewData,
    setViewConfigVisible,
    saveView,
    worksheetInfo,
    groupId,
    appPkg,
    sheetButtons,
    printList,
  } = props;
  const mapLocation = safeParse(_.get(view, 'advancedSetting.maplocation')) || {};
  const { mapViewState, refreshMap } = mapView;
  const { entityName, advancedSetting = {} } = worksheetInfo;
  const isMobile = browserIsMobile();
  const isGoogle = !!getMapConfig();

  const conRef = useRef();
  const aMapRef = useRef();
  const gMapRef = useRef();
  const newRecordBtnRef = useRef();
  const rippleRef = useRef(null);
  const [zoom, setZoom] = useState(5);
  const [center, setCenter] = useState([116.4, 39.9]);
  const [originalCenter, setOriginalCenter] = useState([116.4, 39.9]);
  const [markers, setMarkers] = useState([]);
  const [mapViewConfig, setMapViewConfig] = useState({});
  const [recordInfoRowId, setRecordInfoRowId] = useState(null);
  const [mobileCloseCard, setMobileCloseCard] = useState(0);
  const [isCurrentPosition, setIsCurrentPosition] = useState(false);
  const [clickLnglat, setClickLnglat] = useState(null);
  const [mapControl, setMapControl] = useState({});
  const mapViewRequest = useRef(null);

  // 获取所有记录 ID
  const allRecordIds = useMemo(() => {
    return mapView.mapViewData.map(item => item.rowid).filter(Boolean);
  }, [mapView.mapViewData]);

  // 获取操作按钮
  const operateButtons = useMemo(() => {
    let buttons = getSheetOperatesButtons(view, { buttons: sheetButtons, printList });
    buttons = filterButtonBySheetSwitchPermit(buttons, sheetSwitchPermit, viewId);
    return buttons;
  }, [view, sheetButtons, printList, sheetSwitchPermit, viewId]);

  // 获取按钮 ID
  const btnIds = useMemo(() => operateButtons.map(b => b.btnId).filter(Boolean), [operateButtons]);

  // 获取按钮状态
  const { buttonsCheckStatus } = useButtonStatusOfRows(worksheetInfo.worksheetId, allRecordIds, btnIds);

  const handleRefresh = () => {
    initMapViewData(undefined, true, mapViewRequest.current);
    resetAddRecordBtn();
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
    setIsCurrentPosition(false);
    setCenter([coordinate.position.x, coordinate.position.y]);
    resetAddRecordBtn();
  }, [mapViewState.searchData]);

  useEffect(() => {
    if (conRef.current) {
      resetAddRecordBtn();
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

      setMarkers(parsedData);
      setZoom(Math.floor(newZoom));

      const { type, location = 1, value } = mapLocation;
      const mapLocationValue = safeParse(value) || {};
      let newCenter = [];
      const isSpecified = Number(type) === 2;

      // 是否开启固定位置
      if (isSpecified) {
        if (Number(location) === 1 && value) {
          // 指定位置
          newCenter = [mapLocationValue.x, mapLocationValue.y];
          setIsCurrentPosition(false);
        } else {
          // 当前位置
          setIsCurrentPosition(true);
          return;
        }
      } else {
        newCenter = calculatePoleCenter(coordinates);
        setIsCurrentPosition(false);
      }

      const curCenter = newCenter?.length ? (isSpecified ? newCenter : newCenter.reverse()) : [116.4, 39.9];
      setCenter(curCenter);
      setOriginalCenter(curCenter);
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
    const mapControl = controls.find(l => l.controlId === view.viewControl);
    setMapControl(mapControl);
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
    resetAddRecordBtn();
  };

  const handleSelectField = obj => {
    if (!isCharge) return;
    const nextView = { ...view, ...obj };
    setViewConfigVisible(true);
    saveView(viewId, nextView, () => {
      initMapViewData(nextView);
    });
    resetAddRecordBtn();
  };

  const handleZoom = step => {
    resetAddRecordBtn();

    if (isGoogle) {
      gMapRef.current?.zoomByStep(step);
      return;
    }

    aMapRef.current?.zoomByStep(step);
  };

  const setMapCenter = () => {
    resetAddRecordBtn();

    if (isGoogle) {
      gMapRef.current?.moveCenter(originalCenter);
      return;
    }

    aMapRef.current?.moveCenter(originalCenter);
  };

  const resetAddRecordBtn = () => {
    const button = newRecordBtnRef.current;
    if (!button) return;
    button.style.display = 'none';
  };

  const isShowAddRecord = () => {
    const { allowAdd } = worksheetInfo;
    return allowAdd && !isDisabledCreate(sheetSwitchPermit);
  };

  const getLatLngOnClick = ({ left, top, lnglat }) => {
    if (!isShowAddRecord()) return;

    const button = newRecordBtnRef.current;
    const container = conRef.current;
    if (!button) return;

    const containerRect = container.getBoundingClientRect();

    const btnWidth = button.getBoundingClientRect()?.width || 80;
    const btnHeight = 30;

    let x = left + 20;
    let y = top - 20;

    // 右边不够
    if (left + btnWidth + 40 > containerRect.width) {
      x = left - btnWidth - 20;
    }

    // 下边不够
    if (top + btnHeight + 40 > containerRect.height) {
      y = top - btnHeight - 20;
    }

    // 上边不够
    if (top - btnHeight - 20 < 0) {
      y = top + 20;
    }

    button.style.display = 'flex';
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    showRipple(left, top);
    setClickLnglat(lnglat);
  };

  const showRipple = (x, y) => {
    const el = rippleRef.current;
    if (!el) return;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    // 重新触发动画
    el.classList.remove('active');
    void el.offsetWidth;
    el.classList.add('active');
  };

  const openAddRecord = address => {
    addRecord({
      worksheetId: worksheetInfo.worksheetId,
      defaultFormData:
        clickLnglat && view.viewControl
          ? {
              [view.viewControl]: JSON.stringify({
                x: clickLnglat.lng,
                y: clickLnglat.lat,
                address,
              }),
            }
          : {},
      onAdd: record => {
        if (record) {
          handleRefresh();
          setClickLnglat(null);
        }
      },
    });
  };

  const addNewRecord = () => {
    resetAddRecordBtn();

    if (isGoogle) {
      gMapRef.current?.getAddress(clickLnglat.lng, clickLnglat.lat, address => {
        openAddRecord(address);
      });
      return;
    }

    aMapRef.current?.getAddress(clickLnglat.lng, clickLnglat.lat, address => {
      openAddRecord(address);
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
      buttonsCheckStatus: buttonsCheckStatus,
    };

    const eventProps = isMobile ? {} : { setCenter, getLatLngOnClick, resetAddRecordBtn, setOriginalCenter };

    return (
      <Con
        key={view.viewId}
        onTouchStartCapture={() => {
          if (!isMobile) return;
          $('.mapViewCard.active')[0] && setMobileCloseCard(!mobileCloseCard);
        }}
      >
        {isGoogle ? (
          <GMap
            ref={gMapRef}
            zoom={zoom}
            center={center}
            markers={markers}
            isCurrentPosition={isCurrentPosition}
            markOptions={markOptions}
            {...eventProps}
          />
        ) : (
          <Map
            ref={aMapRef}
            zoom={zoom}
            center={center}
            isCurrentPosition={isCurrentPosition}
            mapControl={mapControl}
            {...eventProps}
          >
            {markers &&
              markers.map(marker => {
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
      {!isMobile && (
        <Fragment>
          <ToolBar setMapCenter={setMapCenter} handleZoom={handleZoom} />
          <NewRecordBtn
            ref={newRecordBtnRef}
            className="addMapRecord"
            appPkg={appPkg}
            clickLnglat={clickLnglat}
            onClick={addNewRecord}
          >
            <span className="Icon icon icon-plus Font13 mRight5 textWhite" />
            <span className="textWhite bold">{advancedSetting.btnname || entityName || _l('记录')}</span>
          </NewRecordBtn>
          <Ripple ref={rippleRef} />
        </Fragment>
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

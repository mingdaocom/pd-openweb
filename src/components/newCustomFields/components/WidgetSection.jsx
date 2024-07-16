import React, { useEffect, useState, useRef } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import SectionTableNav from './SectionTableNav';
import RelateRecordTable from 'worksheet/components/RelateRecordTable';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from '../../../pages/widgetConfig/widgetSetting/components/CustomEvent/config';

const Con = styled.div`
  margin-top: -2px;
  margin: 26px 0 0;
`;

const Drag = styled.div`
  position: absolute;
  width: 100%;
  left: 0;
  top: -5px;
  z-index: 2;
  height: 10px;
  cursor: ns-resize;
`;

const BottomLine = styled.div`
  border-bottom: 1px solid #eaeaea;
`;

function TableContainer(props) {
  const {
    isCharge,
    appId,
    disabled,
    worksheetId,
    recordId,
    isSplit,
    control,
    formdata,
    setRelateNumOfControl,
    updateWorksheetControls,
    onCountChange,
    onUpdateCell,
  } = props;
  return (
    <RelateRecordTable
      isCharge={isCharge}
      appId={appId}
      isSplit={isSplit}
      control={control}
      allowEdit={!disabled}
      recordId={recordId}
      worksheetId={worksheetId}
      formData={formdata}
      setRelateNumOfControl={setRelateNumOfControl}
      updateWorksheetControls={updateWorksheetControls}
      onCountChange={onCountChange}
      onUpdateCell={onUpdateCell}
    />
  );
}

export default function WidgetSection(props) {
  const {
    from,
    disabled,
    tabControlProp = {},
    controlProps = {},
    isCharge,
    appId,
    worksheetId,
    recordId,
    tabControls = [],
    widgetStyle,
    renderForm = () => {},
    sheetSwitchPermit,
    showSplitIcon = false,
    activeTabControlId,
    setActiveTabControlId,
    hasCommon,
  } = props;
  const {
    isSplit,
    setSplit,
    scrollToTable,
    beginDrag,
    formWidth,
    updateRelateRecordTableCount = () => {},
    formdata,
    recordbase,
    updateWorksheetControls,
    // 新建记录
    relateRecordData,
    setRelateNumOfControl,
    onRelateRecordsChange,
  } = tabControlProp;
  const activeControl = _.find(tabControls, i => i.controlId === activeTabControlId) || tabControls[0];
  const [version, setVersion] = useState(Math.random());
  const $sectionControls = useRef([]);
  if (!activeControl) {
    return null;
  }

  const sectionCustomEvent = () => {
    let changeControls = [];
    let triggerType = '';
    const preControls = _.get($sectionControls, 'current') || [];
    if (preControls.length > tabControls.length) {
      // 卸载
      changeControls = _.differenceBy(preControls, tabControls, 'controlId');
      triggerType = ADD_EVENT_ENUM.HIDE;
    } else {
      // 挂载
      changeControls = _.differenceBy(tabControls, preControls, 'controlId');
      triggerType = ADD_EVENT_ENUM.SHOW;
    }
    if (_.isFunction(props.triggerCustomEvent) && changeControls.length && triggerType) {
      changeControls.forEach(itemControl => {
        props.triggerCustomEvent({ ...itemControl, triggerType });
      });
    }
    $sectionControls.current = tabControls;
  };

  useEffect(() => {
    sectionCustomEvent();
  }, [tabControls.length]);

  const renderContent = () => {
    if (activeControl.type === 52) {
      return (
        <div className="customFieldsContainer" style={isSplit ? { margin: 0, padding: '0 12px' } : {}}>
          {activeControl.desc && <div className="Gray_9e WordBreak pLeft12 pRight12 mTop12">{activeControl.desc}</div>}
          {renderForm(activeControl.child)}
        </div>
      );
    }
    if (_.includes([29, 51], activeControl.type)) {
      // 列表多条
      return (
        <TableContainer
          {...{
            isCharge,
            from,
            disabled,
            appId,
            worksheetId,
            recordId,
            formWidth,
            isSplit,
            control: { ...activeControl, ...controlProps },
            sideVisible: controlProps.sideVisible,
            sheetSwitchPermit,
            addRefreshEvents: controlProps.addRefreshEvents,
            formdata,
            recordbase,
            // 新建记录专用
            relateRecordData,
            setRelateNumOfControl,
            onRelateRecordsChange,
            updateWorksheetControls,
          }}
          onCountChange={(newCount, changed) => {
            updateRelateRecordTableCount(activeControl.controlId, newCount, { changed });
            if (changed) {
              props.triggerCustomEvent({ ...activeControl, triggerType: ADD_EVENT_ENUM.CHANGE });
            }
            setVersion(Math.random());
          }}
          onUpdateCell={() => {
            props.triggerCustomEvent({ ...activeControl, triggerType: ADD_EVENT_ENUM.CHANGE });
          }}
        />
      );
    }
  };

  return (
    <Con
      className={cx('relateRecordBlock', { flexColumn: isSplit, mTop0: isSplit || !hasCommon })}
      style={isSplit ? { height: '100%' } : {}}
    >
      <div
        style={{
          position: 'relative',
          marginBottom: '8px',
          ...(isSplit && { borderTop: '3px solid #ddd', padding: '0 24px' }),
        }}
      >
        {isSplit && <Drag onMouseDown={beginDrag} />}
        <SectionTableNav
          version={version}
          style={isSplit ? {} : { borderBottom: '3px solid #ddd' }}
          formWidth={formWidth}
          sideVisible={controlProps.sideVisible}
          showSplitIcon={showSplitIcon}
          widgetStyle={widgetStyle}
          isSplit={isSplit}
          setSplit={setSplit}
          activeControlId={activeControl.controlId}
          controls={tabControls}
          onClick={controlId => {
            setActiveTabControlId(controlId);
            if (_.isFunction(scrollToTable)) {
              scrollToTable();
            }
          }}
        />
        {isSplit && <BottomLine />}
      </div>
      {renderContent()}
    </Con>
  );
}

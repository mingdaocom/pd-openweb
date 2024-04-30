import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import SectionTableNav from './SectionTableNav';
import RelateRecordTable from 'worksheet/components/RelateRecordTable';
import _ from 'lodash';

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
    from,
    disabled,
    appId,
    worksheetId,
    recordId,
    formWidth,
    isSplit,
    sideVisible,
    control,
    sheetSwitchPermit,
    addRefreshEvents,
    relateRecordData,
    formdata,
    recordbase = {},
    setRelateNumOfControl,
    onRelateRecordsChange,
    updateWorksheetControls,
    onCountChange,
  } = props;
  return (
    <RelateRecordTable
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
    />
  );
  // return (
  //   <RelateRecordTable
  //     formWidth={formWidth}
  //     sideVisible={sideVisible}
  //     isSplit={isSplit}
  //     recordbase={recordbase}
  //     formdata={formdata} // 用来给关联查询去筛选动态值
  //     sheetSwitchPermit={sheetSwitchPermit}
  //     control={control}
  //     loading={loading}
  //     setLoading={setLoading}
  //     controls={control.relationControls}
  //     addRefreshEvents={addRefreshEvents}
  //     from={from}
  //     relateRecordData={relateRecordData} // 新建记录关联数据
  //     setRelateNumOfControl={num => {
  //       if (!recordId) {
  //         return;
  //       }
  //       setRelateNumOfControl(num, control.controlId, control);
  //     }} // 新建记录 更新计数
  //     onRelateRecordsChange={records => {
  //       if (control) {
  //         onRelateRecordsChange(control, records);
  //       }
  //     }}
  //     updateWorksheetControls={updateWorksheetControls}
  //   />
  // );
}

export default function WidgetSection(props) {
  const {
    from,
    disabled,
    tabControlProp = {},
    controlProps = {},
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
  if (!activeControl) {
    return null;
  }

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
            setVersion(Math.random());
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

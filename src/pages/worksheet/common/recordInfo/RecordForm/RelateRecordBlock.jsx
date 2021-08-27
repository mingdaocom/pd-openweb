import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';
import RelateRecordTableNav from './RelateRecordTableNav';
import RelateRecordTable from './RelateRecordTable';

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

export default function RelateRecordBlock(props) {
  const {
    formWidth,
    sideVisible,
    isSplit,
    setSplit,
    formdata,
    beginDrag,
    recordbase,
    recordinfo,
    relateRecordData = {},
    sheetSwitchPermit,
    controls,
    activeId,
    registeRefreshEvents,
    scrollToBottom,
    relateNumOfControl,
    navScrollLeft,
    setRelateNumOfControl,
    onScrollLeftChange,
    onRelateRecordsChange = () => {},
  } = props;
  const { recordId } = recordbase;
  const [loading, setLoading] = useState(true);
  const [activeControlId, setActiveControlId] = useState(activeId);
  const activeControl = _.find(controls, c => c.controlId === activeControlId);
  if (!activeControl && controls[0]) {
    setActiveControlId(controls[0].controlId);
  }
  useEffect(() => {
    if (activeId) {
      setActiveControlId(activeId);
      setLoading(true);
    }
  }, [activeId]);
  if (!activeControl) {
    return null;
  }
  return (
    <Con
      className={cx('relateRecordBlock', { flexColumn: isSplit })}
      style={isSplit ? { margin: 0, height: '100%' } : {}}
    >
      <div
        style={{
          position: 'relative',
          ...(isSplit && { borderTop: '3px solid #ddd' }),
          ...(recordId && { padding: '0 24px' }),
        }}
      >
        {isSplit && <Drag onMouseDown={beginDrag} />}
        <RelateRecordTableNav
          style={isSplit ? {} : { borderBottom: '3px solid #ddd' }}
          formWidth={formWidth}
          sideVisible={sideVisible}
          showSplitIcon={!!recordId}
          isSplit={isSplit}
          setSplit={setSplit}
          scrollLeft={navScrollLeft}
          activeControlId={activeControlId}
          controls={
            recordId
              ? controls.map(c =>
                  !_.isUndefined(relateNumOfControl[c.controlId])
                    ? { ...c, value: relateNumOfControl[c.controlId] }
                    : c,
                )
              : controls.map(c =>
                  !_.isUndefined(relateRecordData[c.controlId])
                    ? { ...c, value: relateRecordData[c.controlId].value.length }
                    : c,
                )
          }
          onScrollLeftChange={onScrollLeftChange}
          onClick={controlId => {
            setLoading(true);
            setActiveControlId(controlId);
            scrollToBottom();
          }}
        />
        {isSplit && <BottomLine />}
      </div>
      <RelateRecordTable
        formWidth={formWidth}
        sideVisible={sideVisible}
        isSplit={isSplit}
        recordbase={recordbase}
        recordinfo={recordinfo}
        formdata={formdata}
        relateRecordData={relateRecordData}
        sheetSwitchPermit={sheetSwitchPermit}
        control={activeControl}
        loading={loading}
        controls={activeControl.relationControls}
        registeRefreshEvents={registeRefreshEvents}
        setRelateNumOfControl={num => {
          setRelateNumOfControl({ ...relateNumOfControl, [activeControl.controlId]: num }, activeControl.controlId);
        }}
        setLoading={setLoading}
        onRelateRecordsChange={records => {
          if (activeControl) {
            onRelateRecordsChange(activeControl, records);
          }
        }}
      />
    </Con>
  );
}

RelateRecordBlock.propTypes = {
  isSplit: PropTypes.bool,
  setSplit: PropTypes.func,
  beginDrag: PropTypes.func,
  activeId: PropTypes.string,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  formdata: PropTypes.arrayOf(PropTypes.shape({})),
  recordbase: PropTypes.shape({}),
  recordinfo: PropTypes.shape({}),
  relateRecordData: PropTypes.shape({}),
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  onRelateRecordsChange: PropTypes.func,
  registeRefreshEvents: PropTypes.func,
  scrollToBottom: PropTypes.func,
};

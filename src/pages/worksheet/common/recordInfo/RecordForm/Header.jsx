import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Tooltip } from 'ming-ui';
import styled from 'styled-components';
import { getDiscussionsCount } from 'src/api/discussion';
import { emitter } from 'worksheet/util';
import IconBtn from './IconBtn';
import SwitchRecord from './SwitchRecord';
import Operates from './Operates';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';

const SodeBarIcon = styled(IconBtn)`
  display: flex;
  .discussCount {
    font-size: 14px;
  }
  .text {
    font-size: 13px;
    margin-left: 2px;
  }
`;

export default function InfoHeader(props) {
  const {
    loading,
    sheetSwitchPermit,
    sideVisible,
    recordbase,
    recordinfo,
    iseditting,
    showPrevNext,
    registeRefreshEvents,
    refreshRotating,
    currentSheetRows,
    currentIndex,
    hideRecordInfo,
    switchRecord,
    reloadRecord,
    onCancel,
    onUpdate,
    onSave,
    onRefresh,
    onDelete,
    onSideIconClick,
    handleAddSheetRow,
    viewId,
  } = props;
  let { header } = props;
  const { isSmall, worksheetId, recordId } = recordbase;
  const rowId = useRef(recordId);
  const [discussCount, setDiscussCount] = useState();
  function loadDiscussionsCount() {
    if (sideVisible) {
      return;
    }
    getDiscussionsCount({
      pageIndex: 1,
      pageSize: 1,
      sourceId: worksheetId + '|' + rowId.current,
      sourceType: 8,
    }).then(data => {
      setDiscussCount(data.data);
    });
  }
  useEffect(() => {
    rowId.current = recordId;
    loadDiscussionsCount();
  }, [recordId]);
  useEffect(() => {
    emitter.addListener('RELOAD_RECORDINFO_DISCUSS', loadDiscussionsCount);
    return () => {
      emitter.removeListener('RELOAD_RECORDINFO_DISCUSS', loadDiscussionsCount);
    };
  }, []);
  if (viewId) {
    header = null;
  }
  return (
    <div
      className={cx('recordHeader flexRow Font22', { bottomShadow: header })}
      style={header ? { paddingRight: '56px' } : { zIndex: 10 }}
    >
      {!!header && !loading && (
        <div className="customHeader flex">{React.cloneElement(header, { onSubmit: onSave, isSmall })}</div>
      )}
      {!header && (
        <div className="flex flexRow w100">
          {showPrevNext && (
            <SwitchRecord currentSheetRows={currentSheetRows} currentIndex={currentIndex} onSwitch={switchRecord} />
          )}
          <span
            className={cx('refreshBtn Font20 Gray_9e ThemeHoverColor3 Hand', {
              isLoading: refreshRotating,
              disable: iseditting,
            })}
            onClick={iseditting ? () => {} : onRefresh}
          >
            <Tooltip offset={[0, 0]} text={<span>{_l('刷新')}</span>}>
              <i className="icon icon-task-later"></i>
            </Tooltip>
          </span>
          {!iseditting ? (
            <Operates
              registeRefreshEvents={registeRefreshEvents}
              iseditting={iseditting}
              sideVisible={sideVisible}
              recordbase={recordbase}
              recordinfo={recordinfo}
              hideRecordInfo={hideRecordInfo}
              reloadRecord={reloadRecord}
              onDelete={onDelete}
              onUpdate={onUpdate}
              sheetSwitchPermit={sheetSwitchPermit}
              handleAddSheetRow={handleAddSheetRow}
            />
          ) : (
            <div className="flex"></div>
          )}
          {/* 查看日志权限 查看讨论和文件权限 默认true */}
          {(isOpenPermit(permitList.recordDiscussSwitch, sheetSwitchPermit, viewId) ||
            isOpenPermit(permitList.recordLogSwitch, sheetSwitchPermit, viewId)) && (
            <SodeBarIcon className="Hand ThemeHoverColor3" onClick={onSideIconClick}>
              <span data-tip={sideVisible ? _l('收起') : _l('展开')}>
                <i className={`icon ${sideVisible ? 'icon-sidebar_close' : 'icon-sidebar_open'}`}></i>
              </span>
              {!sideVisible && !!discussCount && (
                <span className="discussCount">
                  {discussCount > 99 ? '99+' : discussCount}
                  <span className="text">{_l('条讨论')}</span>
                </span>
              )}
            </SodeBarIcon>
          )}
          <IconBtn className="Hand ThemeHoverColor3" onClick={onCancel}>
            <i className="icon icon-close"></i>
          </IconBtn>
        </div>
      )}
    </div>
  );
}

InfoHeader.propTypes = {
  loading: PropTypes.bool,
  iseditting: PropTypes.bool,
  sideVisible: PropTypes.bool,
  header: PropTypes.element,
  recordbase: PropTypes.shape({}),
  recordinfo: PropTypes.shape({}),
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  refreshRotating: PropTypes.bool,
  showPrevNext: PropTypes.bool,
  currentSheetRows: PropTypes.arrayOf(PropTypes.shape({})),
  currentIndex: PropTypes.number,
  registeRefreshEvents: PropTypes.func,
  hideRecordInfo: PropTypes.func,
  switchRecord: PropTypes.func,
  reloadRecord: PropTypes.func,
  onCancel: PropTypes.func,
  onUpdate: PropTypes.func,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
  onRefresh: PropTypes.func,
  onSideIconClick: PropTypes.func,
};

import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import discussionAjax from 'src/api/discussion';
import favoriteApi from 'src/api/favorite.js';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import PrintList from 'src/pages/worksheet/common/recordInfo/RecordForm/PrintList';
import { emitter } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import IconBtn from './IconBtn';
import MoreMenu from './MoreMenu';
import Operates from './Operates';
import SwitchRecord from './SwitchRecord';

const SideBarIcon = styled(IconBtn)`
  display: flex;
  flex-shrink: 0;
  .discussCount {
    font-size: 14px;
  }
  .text {
    font-size: 13px;
    margin-left: 2px;
  }
`;

let favCom = null;
export default function InfoHeader(props) {
  const {
    isCharge,
    loading,
    sheetSwitchPermit,
    sideVisible,
    sideBarBtnVisible = true,
    recordbase,
    recordinfo,
    iseditting,
    showPrevNext,
    addRefreshEvents,
    refreshRotating,
    currentSheetRows,
    currentIndex,
    hideRecordInfo,
    switchRecord,
    reloadRecord,
    onCancel,
    onUpdate,
    onSubmit,
    onRefresh,
    onDelete,
    onSideIconClick,
    handleAddSheetRow,
    viewId,
    from,
    isOpenNewAddedRecord,
    customBtnTriggerCb,
    payConfig = {},
    isDraft,
    updateDiscussCount = _.noop,
    printCharge,
    isRecordLock,
    updateRecordLock,
    // allowExAccountDiscuss = false, //允许外部用户讨论
    // exAccountDiscussEnum = 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
    // approved: false, //允许外部用户允许查看审批流转详情
  } = props;
  const { projectId = localStorage.getItem('currentProjectId') } = recordinfo;
  let { renderHeader } = props;
  const { isSmall, worksheetId, recordId, notDialog } = recordbase;
  const rowId = useRef(recordId);
  const [discussCount, setDiscussCount] = useState();
  const [isFavorite, setIsFavorite] = useState(recordinfo.isFavorite);
  const discussVisible = isOpenPermit(permitList.recordDiscussSwitch, sheetSwitchPermit, viewId);
  const logVisible = isOpenPermit(permitList.recordLogSwitch, sheetSwitchPermit, viewId);
  const workflowVisible = isOpenPermit(permitList.approveDetailsSwitch, sheetSwitchPermit, viewId);
  const portalNotHasDiscuss = md.global.Account.isPortal && !props.allowExAccountDiscuss; //外部用户且未开启讨论
  const isPublicShare =
    _.get(window, 'shareState.isPublicRecord') ||
    _.get(window, 'shareState.isPublicView') ||
    _.get(window, 'shareState.isPublicPage') ||
    _.get(window, 'shareState.isPublicQuery') ||
    _.get(window, 'shareState.isPublicForm') ||
    _.get(window, 'shareState.isPublicWorkflowRecord') ||
    _.get(window, 'shareState.isPublicPrint') ||
    _.get(window, 'shareState.isPublicChatbot');

  const project = getCurrentProject(projectId);
  const showFav =
    !window.shareState.shareId &&
    !window.isPublicApp &&
    !md.global.Account.isPortal &&
    !_.isEmpty(project) &&
    viewId !== worksheetId;
  const showOrder = payConfig.rowDetailIsShowOrder;
  const showSideBar =
    sideBarBtnVisible &&
    ((!isPublicShare && showOrder) ||
      (!isPublicShare && !md.global.Account.isPortal && (workflowVisible || discussVisible || logVisible)) ||
      (md.global.Account.isPortal && props.allowExAccountDiscuss && discussVisible) ||
      (md.global.Account.isPortal && props.approved && workflowVisible) ||
      from === RECORD_INFO_FROM.WORKFLOW);
  function loadDiscussionsCount() {
    if (sideVisible || !discussVisible || portalNotHasDiscuss) {
      return;
    }
    let entityType = 0;
    //外部用户且未开启讨论 不能内部讨论
    if (md.global.Account.isPortal && props.allowExAccountDiscuss && props.exAccountDiscussEnum === 1) {
      entityType = 2;
    }
    discussionAjax
      .getDiscussionsCount({
        pageIndex: 1,
        pageSize: 1,
        sourceId: worksheetId + '|' + rowId.current,
        sourceType: 8,
        entityType, // 0 = 全部，1 = 不包含外部讨论，2=外部讨论
      })
      .then(data => {
        setDiscussCount(data.data);
        updateDiscussCount(data.data);
      });
  }
  useEffect(() => {
    rowId.current = recordId;
    if (!isOpenNewAddedRecord) {
      loadDiscussionsCount();
    }
  }, [recordId, props.allowExAccountDiscuss]);

  useEffect(() => {
    setIsFavorite(_.get(props, 'recordinfo.isFavorite'));
  }, [_.get(props, 'recordinfo.isFavorite'), recordId]);

  useEffect(() => {
    emitter.addListener('RELOAD_RECORD_INFO_DISCUSS', loadDiscussionsCount);
    return () => {
      emitter.removeListener('RELOAD_RECORD_INFO_DISCUSS', loadDiscussionsCount);
    };
  }, []);

  let header = renderHeader && renderHeader({ ...recordinfo, isLoading: refreshRotating, onRefresh, isRecordLock });

  if (viewId) {
    header = null;
  }

  // 展开 收起 右侧按钮
  const sideBarBtn = () => {
    return (
      <SideBarIcon className="Hand ThemeHoverColor3" onClick={onSideIconClick}>
        <Tooltip title={sideVisible ? _l('收起') : _l('展开')} placement="bottom" align={{ offset: [0, 0] }}>
          <span>
            <i className={`icon ${sideVisible ? 'icon-sidebar_close' : 'icon-sidebar_open'}`} />
          </span>
        </Tooltip>
        {!sideVisible && !!discussCount && (
          <span className="discussCount">
            {discussCount > 99 ? '99+' : discussCount}
            <span className="text">{_l('条讨论')}</span>
          </span>
        )}
      </SideBarIcon>
    );
  };

  // 关闭
  const closeBtn = () => {
    const btn = (
      <IconBtn
        className="Hand ThemeHoverColor3 closeBtn"
        onClick={e => {
          e.stopPropagation();
          onCancel();
        }}
      >
        <i className="icon icon-close" />
      </IconBtn>
    );
    return notDialog ? (
      btn
    ) : (
      <Tooltip title={_l('关闭')} placement="bottom" align={{ offset: [0, 0] }} shortcut={'Esc'}>
        {btn}
      </Tooltip>
    );
  };

  const onFav = () => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    if (loading || _.get(props, 'recordinfo.isFavorite') === undefined) {
      return;
    }
    if (favCom) {
      favCom.abort();
    }
    if (!isFavorite) {
      favCom = favoriteApi.addFavorite({
        worksheetId,
        rowId: recordId,
        viewId,
      });
    } else {
      favCom = favoriteApi.removeFavorite({
        projectId,
        rowId: recordId,
        worksheetId,
        viewId,
      });
    }
    favCom.then(res => {
      setIsFavorite(!isFavorite);
      favCom = null;
      if (res) {
        if (!isFavorite) {
          alert(_l('收藏成功'));
        } else {
          alert(_l('已取消收藏'));
        }
      } else {
        alert(_l('操作失败，稍后再试'), 3);
      }
    });
  };

  const favBtn = () => {
    const btn = (
      <IconBtn
        className={cx('Hand favBtn', { ThemeHoverColor3: !isFavorite })}
        style={{ color: isFavorite ? '#FFC402' : '#757575' }}
        onClick={onFav}
      >
        <Icon className="Font22 Hand" icon={!isFavorite ? 'star_outline' : 'star'} />
      </IconBtn>
    );
    return (
      <Tooltip title={isFavorite ? _l('取消收藏') : _l('收藏')} placement="bottom" align={{ offset: [0, 0] }}>
        {btn}
      </Tooltip>
    );
  };

  return (
    <div className="recordHeader flexRow Font22" style={{ zIndex: 10 }}>
      {!!header && !loading && (
        <div className="customHeader flex flexRow">
          {from === RECORD_INFO_FROM.DRAFT && (
            <SwitchRecord currentSheetRows={currentSheetRows} currentIndex={currentIndex} onSwitch={switchRecord} />
          )}
          {React.cloneElement(header, { onSubmit: onSubmit, isSmall })}
          {showSideBar && from !== RECORD_INFO_FROM.DRAFT && sideBarBtn()}
          {!notDialog && closeBtn()}
        </div>
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
            onClick={() => {
              if (iseditting) return;
              onRefresh();
            }}
          >
            <Tooltip title={_l('刷新')} placement="bottom" align={{ offset: [0, 0] }}>
              <i className="icon icon-task-later" />
            </Tooltip>
          </span>
          {!isPublicShare ? (
            <Operates
              isCharge={isCharge}
              addRefreshEvents={addRefreshEvents}
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
              customBtnTriggerCb={customBtnTriggerCb}
              isDraft={isDraft}
              isRecordLock={isRecordLock}
            />
          ) : (
            <div className="flex" />
          )}
          {!isPublicShare && (
            <PrintList
              type={1}
              isCharge={isCharge || printCharge}
              {..._.pick(recordbase, ['appId', 'workId', 'instanceId', 'worksheetId', 'viewId', 'recordId'])}
              projectId={projectId}
              controls={_.get(recordinfo, 'formData') || []}
              sheetSwitchPermit={sheetSwitchPermit}
              onItemClick={() => {}}
            />
          )}
          {showFav && favBtn()}
          {showSideBar && sideBarBtn()}
          {!isPublicShare && (
            <MoreMenu
              hideFav
              recordbase={recordbase}
              recordinfo={recordinfo}
              isRecordLock={isRecordLock}
              updateRecordLock={updateRecordLock}
              sheetSwitchPermit={sheetSwitchPermit}
              reloadRecord={reloadRecord}
              onUpdate={onUpdate}
              onDelete={onDelete}
              handleAddSheetRow={handleAddSheetRow}
              hideRecordInfo={hideRecordInfo}
              isDraft={from === RECORD_INFO_FROM.DRAFT || isDraft}
              printCharge={printCharge}
            />
          )}
          {!notDialog && closeBtn()}
        </div>
      )}
    </div>
  );
}

InfoHeader.propTypes = {
  loading: PropTypes.bool,
  iseditting: PropTypes.bool,
  sideVisible: PropTypes.bool,
  renderHeader: PropTypes.func,
  recordbase: PropTypes.shape({}),
  recordinfo: PropTypes.shape({}),
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  refreshRotating: PropTypes.bool,
  showPrevNext: PropTypes.bool,
  currentSheetRows: PropTypes.arrayOf(PropTypes.shape({})),
  currentIndex: PropTypes.number,
  addRefreshEvents: PropTypes.func,
  hideRecordInfo: PropTypes.func,
  switchRecord: PropTypes.func,
  reloadRecord: PropTypes.func,
  onCancel: PropTypes.func,
  onUpdate: PropTypes.func,
  onSubmit: PropTypes.func,
  onDelete: PropTypes.func,
  onRefresh: PropTypes.func,
  onSideIconClick: PropTypes.func,
};

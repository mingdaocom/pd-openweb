import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Tooltip, Icon } from 'ming-ui';
import styled from 'styled-components';
import _ from 'lodash';
import discussionAjax from 'src/api/discussion';
import { emitter } from 'worksheet/util';
import IconBtn from './IconBtn';
import SwitchRecord from './SwitchRecord';
import Operates from './Operates';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import favoriteApi from 'src/api/favorite.js';
import { getCurrentProject } from 'src/util';

const SideBarIcon = styled(IconBtn)`
  display: flex;
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
    view,
    from,
    isOpenNewAddedRecord,
    customBtnTriggerCb,
    // allowExAccountDiscuss = false, //允许外部用户讨论
    // exAccountDiscussEnum = 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
    // approved: false, //允许外部用户允许查看审批流转详情
  } = props;
  const { projectId = localStorage.getItem('currentProjectId') } = recordinfo;
  let { header } = props;
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
    _.get(window, 'shareState.isPublicPrint');
  const isPublicRecordLand = isPublicShare && notDialog;
  const project = getCurrentProject(projectId);
  const showFav =
    !window.shareState.shareId && !window.isPublicApp && !md.global.Account.isPortal && !_.isEmpty(project); //&& !_.isEmpty(recordinfo);
  const showSideBar =
    (!isPublicShare && !md.global.Account.isPortal && (workflowVisible || discussVisible || logVisible)) ||
    (md.global.Account.isPortal && props.allowExAccountDiscuss && discussVisible) ||
    (md.global.Account.isPortal && props.approved && workflowVisible) ||
    from === RECORD_INFO_FROM.WORKFLOW;
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

  if (viewId) {
    header = null;
  }

  // 展开 收起 右侧按钮
  const sideBarBtn = () => {
    return (
      <SideBarIcon className="Hand ThemeHoverColor3" onClick={onSideIconClick}>
        <Tooltip offset={[0, 0]} text={<span>{sideVisible ? _l('收起') : _l('展开')}</span>}>
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
      <IconBtn className="Hand ThemeHoverColor3 closeBtn" onClick={onCancel}>
        <i className="icon icon-close" />
      </IconBtn>
    );
    return notDialog ? (
      btn
    ) : (
      <Tooltip offset={[0, 0]} text={<span className="nowrap">{_l('关闭（esc）')}</span>}>
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
        style={{ color: isFavorite ? '#FFC402' : '#9E9E9E' }}
        onClick={onFav}
      >
        <Icon className="Font22 Hand" icon={!isFavorite ? 'star_outline' : 'star'} />
      </IconBtn>
    );
    return (
      <Tooltip offset={[0, 0]} text={<span>{isFavorite ? _l('取消收藏') : _l('收藏')}</span>}>
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
          {closeBtn()}
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
            onClick={iseditting ? () => {} : onRefresh}
          >
            <Tooltip offset={[0, 0]} text={<span>{_l('刷新')}</span>}>
              <i className="icon icon-task-later" />
            </Tooltip>
          </span>
          {!isPublicShare && !iseditting ? (
            <Operates
              isCharge={isCharge}
              hideFav
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
            />
          ) : (
            <div className="flex" />
          )}
          {showFav && favBtn()}
          {showSideBar && sideBarBtn()}
          {(!isPublicRecordLand ||
            _.get(window, 'shareState.isPublicView') ||
            _.get(window, 'shareState.isPublicPage')) &&
            closeBtn()}
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

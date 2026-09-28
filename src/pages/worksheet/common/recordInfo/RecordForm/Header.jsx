import React, { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _, { isEmpty, isFunction } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import discussionAjax from 'src/api/discussion';
import favoriteApi from 'src/api/favorite.js';
import worksheetAjax from 'src/api/worksheet';
import CreateByMingDaoYun from 'src/components/CreateByMingDaoYun';
import PublicAppLangDropdown from 'src/components/PublicAppLangDropdown';
import RecordPrintButton from 'src/pages/worksheet/common/recordInfo/RecordForm/RecordPrint/RecordPrintButton';
import {
  getRecordDiscussionsCountArgs,
  shouldLoadRecordHeaderDiscussionCount,
} from 'src/pages/worksheet/components/DiscussLogFile/utils';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { RECORD_INFO_FROM } from 'src/utils/domain/worksheet/constants';
import { emitter } from 'src/utils/platform/browser/dom';
import { getCurrentProject, getFeatureStatus } from 'src/utils/services/project';
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
const LoadableAiActionChatBot = lazy(() => import('src/components/Mingo/modules/AiActionChatBot'));

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
    view,
    from,
    isOpenNewAddedRecord,
    customBtnTriggerCb,
    payConfig = {},
    isDraft,
    updateDiscussCount = _.noop,
    discussCount: latestDiscussCount,
    printCharge,
    recordTitle,
    isRecordLock,
    updateRecordLock,
    setModalRightComp,
    allowExAccountDiscuss = false, //允许外部用户讨论
    exAccountDiscussEnum = 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
    approved = false, //允许外部用户允许查看审批流转详情
  } = props;
  const { projectId = localStorage.getItem('currentProjectId') } = recordinfo;
  let { renderHeader } = props;
  const { isSmall, worksheetId, recordId, notDialog, workId, instanceId } = recordbase;
  const rowId = useRef(recordId);
  const operatesRef = useRef(null);
  const updateDiscussCountRef = useRef(updateDiscussCount);
  const discussionCountReqId = useRef(0);
  const [discussCount, setDiscussCount] = useState();
  const [aiActionActive, setAiActionActive] = useState(false);
  const [aiActionButtons, setAiActionButtons] = useState([]);
  const [worksheetInfo, setWorksheetInfo] = useState(props.worksheetInfo);
  const [favoriteOverride, setFavoriteOverride] = useState(null);
  const isFavorite =
    favoriteOverride && favoriteOverride.recordId === recordId && favoriteOverride.baseValue === recordinfo.isFavorite
      ? favoriteOverride.value
      : recordinfo.isFavorite;
  const displayDiscussCount = !_.isUndefined(latestDiscussCount) ? latestDiscussCount : discussCount;
  const discussVisible = isOpenPermit(permitList.recordDiscussSwitch, sheetSwitchPermit, viewId);
  const logVisible = isOpenPermit(permitList.recordLogSwitch, sheetSwitchPermit, viewId);
  const workflowVisible = isOpenPermit(permitList.approveDetailsSwitch, sheetSwitchPermit, viewId);
  const portalNotHasDiscuss = md.global.Account.isPortal && !allowExAccountDiscuss; //外部用户且未开启讨论

  const isPublicShare =
    _.get(window, 'shareState.isPublicRecord') ||
    _.get(window, 'shareState.isPublicView') ||
    _.get(window, 'shareState.isPublicPage') ||
    _.get(window, 'shareState.isPublicQuery') ||
    _.get(window, 'shareState.isPublicForm') ||
    _.get(window, 'shareState.isPublicWorkflowRecord') ||
    _.get(window, 'shareState.isPublicPrint') ||
    _.get(window, 'shareState.isPublicChatbot');

  const isPublicRecordLand = isPublicShare && notDialog;

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
      (md.global.Account.isPortal && allowExAccountDiscuss && discussVisible) ||
      (md.global.Account.isPortal && logVisible) ||
      (md.global.Account.isPortal && approved && workflowVisible) ||
      from === RECORD_INFO_FROM.WORKFLOW);
  useEffect(() => {
    if (!isFunction(setModalRightComp)) {
      return;
    }

    if (aiActionActive) {
      setModalRightComp(
        <Suspense fallback={null}>
          <LoadableAiActionChatBot
            allowResize={!notDialog}
            isCharge={isCharge}
            appId={recordbase.appId}
            worksheetId={worksheetId}
            recordId={recordId}
            buttons={aiActionButtons}
            recordTitle={recordTitle}
            worksheetInfo={worksheetInfo}
            onReloadButtons={() => {
              operatesRef.current.loadBtns();
            }}
            onClose={() => setAiActionActive(false)}
          />
        </Suspense>,
      );
    } else {
      setModalRightComp(null);
    }
  }, [
    aiActionActive,
    aiActionButtons,
    isCharge,
    notDialog,
    recordbase.appId,
    recordId,
    recordTitle,
    setModalRightComp,
    worksheetId,
    worksheetInfo,
  ]);

  const loadDiscussionsCount = useCallback(() => {
    if (
      !shouldLoadRecordHeaderDiscussionCount({
        loading,
        sideVisible,
        discussVisible,
        portalNotHasDiscuss,
      })
    ) {
      return;
    }

    // 自增请求序号，切换记录后旧请求若晚返回则丢弃，避免污染当前记录的计数。
    const reqId = ++discussionCountReqId.current;

    discussionAjax
      .getDiscussionsCount({
        ...getRecordDiscussionsCountArgs({
          worksheetId,
          rowId: rowId.current,
          isPortal: md.global.Account.isPortal,
          allowExAccountDiscuss,
          exAccountDiscussEnum,
          workId,
          instanceId,
        }),
      })
      .then(data => {
        if (reqId !== discussionCountReqId.current) {
          return;
        }

        setDiscussCount(data.data);
        updateDiscussCountRef.current(data.data);
      })
      .catch(() => {});
  }, [
    allowExAccountDiscuss,
    discussVisible,
    exAccountDiscussEnum,
    instanceId,
    loading,
    portalNotHasDiscuss,
    sideVisible,
    workId,
    worksheetId,
  ]);
  useEffect(() => {
    updateDiscussCountRef.current = updateDiscussCount;
  }, [updateDiscussCount]);

  useLayoutEffect(() => {
    discussionCountReqId.current += 1;
    rowId.current = recordId;
  }, [
    allowExAccountDiscuss,
    discussVisible,
    exAccountDiscussEnum,
    instanceId,
    loading,
    portalNotHasDiscuss,
    recordId,
    sideVisible,
    workId,
    worksheetId,
  ]);

  useEffect(() => {
    if (!isOpenNewAddedRecord) {
      loadDiscussionsCount();
    }
  }, [isOpenNewAddedRecord, loadDiscussionsCount, recordId]);
  useEffect(() => {
    emitter.addListener('RELOAD_RECORD_INFO_DISCUSS', loadDiscussionsCount);

    if (isEmpty(worksheetInfo)) {
      worksheetAjax
        .getWorksheetInfo({
          worksheetId,
        })
        .then(data => {
          setWorksheetInfo(data);
        });
    }

    return () => {
      emitter.removeListener('RELOAD_RECORD_INFO_DISCUSS', loadDiscussionsCount);
    };
  }, [loadDiscussionsCount, worksheetId, worksheetInfo]);
  let header = renderHeader && renderHeader({ ...recordinfo, isLoading: refreshRotating, onRefresh, isRecordLock });

  if (viewId && from !== RECORD_INFO_FROM.DRAFT) {
    header = null;
  } // 展开 收起 右侧按钮

  const sideBarBtn = () => {
    return (
      <SideBarIcon className="Hand hoverColorPrimary" onClick={onSideIconClick}>
        <Tooltip title={sideVisible ? _l('收起') : _l('展开')} placement="bottom">
          <span>
            <i className={`icon ${sideVisible ? 'icon-sidebar_close' : 'icon-sidebar_open'}`} />
          </span>
        </Tooltip>
        {!sideVisible && !!displayDiscussCount && (
          <span className="discussCount">
            {displayDiscussCount > 99 ? '99+' : displayDiscussCount}
            <span className="text">{_l('条讨论')}</span>
          </span>
        )}
      </SideBarIcon>
    );
  }; // 关闭

  const closeBtn = () => {
    const btn = (
      <IconBtn
        className="Hand hoverColorPrimary closeBtn"
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
      <Tooltip title={_l('关闭')} placement="bottom" shortcut={'Esc'}>
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
      setFavoriteOverride({ recordId, baseValue: recordinfo.isFavorite, value: !isFavorite });
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
        className={cx('Hand favBtn', {
          hoverColorPrimary: !isFavorite,
        })}
        style={{
          color: isFavorite ? 'var(--color-yellow)' : 'var(--color-text-secondary)',
        }}
        onClick={onFav}
      >
        <Icon className="Font22 Hand" icon={!isFavorite ? 'star_outline' : 'star'} />
      </IconBtn>
    );
    return (
      <Tooltip title={isFavorite ? _l('取消收藏') : _l('收藏')} placement="bottom">
        {btn}
      </Tooltip>
    );
  };

  return (
    <div
      className="recordHeader flexRow Font22"
      style={{
        zIndex: 10,
      }}
    >
      {!!header && !loading && (
        <div className="customHeader flex flexRow">
          {from === RECORD_INFO_FROM.DRAFT && (
            <SwitchRecord currentSheetRows={currentSheetRows} currentIndex={currentIndex} onSwitch={switchRecord} />
          )}
          {React.cloneElement(header, {
            onSubmit: onSubmit,
            isSmall,
          })}
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
            className={cx('refreshBtn Font20 textTertiary hoverColorPrimary Hand', {
              isLoading: refreshRotating,
              disable: iseditting,
            })}
            onClick={() => {
              if (iseditting) return;
              onRefresh();
            }}
          >
            <Tooltip title={_l('刷新')} placement="bottom">
              <i className="icon icon-task-later" />
            </Tooltip>
          </span>
          {!isPublicShare ? (
            <Operates
              setRef={target => {
                operatesRef.current = target;
              }}
              isCharge={isCharge}
              addRefreshEvents={addRefreshEvents}
              iseditting={iseditting}
              sideVisible={sideVisible}
              recordbase={recordbase}
              recordinfo={recordinfo}
              view={view}
              hideRecordInfo={hideRecordInfo}
              reloadRecord={reloadRecord}
              onDelete={onDelete}
              onUpdate={onUpdate}
              sheetSwitchPermit={sheetSwitchPermit}
              handleAddSheetRow={handleAddSheetRow}
              customBtnTriggerCb={customBtnTriggerCb}
              isDraft={isDraft}
              isRecordLock={isRecordLock}
              updateAiActionButtons={newButtons => {
                setAiActionButtons(newButtons);
              }}
            />
          ) : (
            <div className="flex" />
          )}
          {/* 记录没有配置AI动作时，管理员、开发者在详情页工具栏也显示AI动作入口 */}
          {(isCharge || !_.isEmpty(aiActionButtons)) &&
            isFunction(setModalRightComp) &&
            !md.global.SysSettings.hideAIBasicFun && (
              <div className="t-flex t-items-center">
                <BgIconButton
                  iconStyle={{
                    fontSize: 18,
                    color: 'var(--color-mingo-light)',
                  }}
                  className="aiActionButtons"
                  text={
                    <div className="t-flex">
                      <span className="t-ml-2">{_l('AI 动作')}</span>
                      {aiActionButtons.length ? <span className="aiButtonsCount">{aiActionButtons.length}</span> : null}
                    </div>
                  }
                  icon="auto_awesome"
                  onClick={() => {
                    setAiActionActive(true);
                  }}
                />
              </div>
            )}
          {!isPublicShare && (
            <RecordPrintButton
              isCharge={isCharge || printCharge}
              {..._.pick(recordbase, ['appId', 'workId', 'instanceId', 'worksheetId', 'viewId', 'recordId'])}
              projectId={projectId}
              controls={_.get(recordinfo, 'formData') || []}
              printCountEnabled={
                getFeatureStatus(projectId, VersionProductType.printCountLimit) !== '2' &&
                _.get(worksheetInfo, 'advancedSetting.print_count_enabled') === '1'
              }
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
          {isPublicRecordLand &&
            !_.get(window, 'shareState.isPublicPage') &&
            !_.get(window, 'shareState.isPublicView') && (
              <PublicAppLangDropdown className="mRight16" appId={recordbase.appId} projectId={projectId} />
            )}
          {isPublicRecordLand && _.get(view, 'viewType') !== 6 && <CreateByMingDaoYun />}
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

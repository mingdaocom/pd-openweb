import React, { useState, useRef, useEffect, Fragment } from 'react';
import { string } from 'prop-types';
import { Tooltip, Icon, LoadDiv, RichText } from 'ming-ui';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import update from 'immutability-helper';
import customApi from 'statistics/api/custom';
import appManagementApi from 'src/api/appManagement';
import { Popover } from 'antd';
import SelectIcon from 'worksheet/common/SelectIcon';
import OperateMenu from './OperateMenu';
import SheetDesc from 'worksheet/common/SheetDesc';
import Share from 'src/pages/worksheet/components/Share';
import { pick } from 'lodash';
import { createFontLink, exportImage } from 'src/pages/customPage/util';
import { saveAs } from 'file-saver';
import SvgIcon from 'src/components/SvgIcon';
import { navigateTo } from 'src/router/navigateTo';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import { deleteSheet } from 'worksheet/redux/actions/sheetList';
import moment from 'moment';
import { canEditData } from 'worksheet/redux/actions/util';
import { EditExternalLink } from 'src/pages/worksheet/common/WorkSheetLeft/ExternalLink';
import store from 'redux/configureStore';
import { updateSheetListAppItem } from 'worksheet/redux/actions/sheetList';
import { replaceColor, isLightColor } from 'src/pages/customPage/util';

export default function CustomPageHeader(props) {
  const {
    currentSheet,
    updateEditPageVisible,
    updatePageInfo,
    ids = {},
    updateSheetListIsUnfold,
    copyCustomPage,
    toggle,
    resetPage,
    pageName,
    apk,
    appPkg,
    ...rest
  } = props;
  //运营者|开发者 均可分享
  const isCharge = props.isCharge || canEditData(_.get(appPkg, ['permissionType']));
  const isSafari = () => {
    var ua = window.navigator.userAgent;
    return ua.indexOf('Safari') != -1 && ua.indexOf('Version') != -1;
  };
  const { groupId } = ids;
  const { appName } = apk;
  const pageConfig = replaceColor(props.config || {}, appPkg.iconColor || apk.iconColor);
  const projectId = appPkg.projectId || apk.projectId;
  const appId = appPkg.id || apk.appId;
  const { icon, workSheetName, urlTemplate, configuration } = currentSheet;
  const pageId = ids.worksheetId;
  const [visible, updateVisible] = useState({ popupVisible: false, editNameVisible: false, editIntroVisible: false });
  const desc = urlTemplate ? configuration.desc : props.desc;
  const { popupVisible, editNameVisible, editIntroVisible } = visible;
  const name = pageName !== workSheetName ? workSheetName || pageName : pageName || workSheetName;
  const [shareDialogVisible, setShareDialogVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [descIsEditing, setDescIsEditing] = useState(false);
  const [externalLinkIsEditing, setExternalLinkIsEditing] = useState(false);
  const [inFull, setInFull] = useState(false);

  useEffect(() => {
    window.editCustomPage = () => {
      handleClick(urlTemplate ? 'editPage' : 'editCanvas');
    };
    return () => {
      delete window.editCustomPage;
    }
  }, [pageId]);

  const saveImage = () => {
    const imageName = `${appName ? `${appName}_` : ''}${name}_${moment().format('_YYYYMMDDHHmmSS')}.png`;
    setExportLoading(true);
    window.customPageWindowResize();
    createFontLink()
      .then(exportImage.bind(this, pageConfig.pageBgColor))
      .then(blob => {
        setExportLoading(false);
        saveAs(blob, imageName);
      });
  };

  const handleUpdatePage = obj => {
    customApi.updatePage({ appId: pageId, ...obj }).then(isSuccess => {
      if (isSuccess) {
        updatePageInfo(obj);
      } else {
        alert(_l('修改失败'), 2);
      }
    });
  };

  const handleUpdateDesc = value => {
    const { currentPcNaviStyle } = store.getState().appPkg;
    const data = {
      configuration: {
        ...configuration,
        desc: value
      }
    }
    appManagementApi.editWorkSheetInfoForApp({
      appId,
      appSectionId: groupId,
      workSheetId: pageId,
      type: 1,
      ...data
    }).then(result => {
      if (currentPcNaviStyle === 1) {
        const singleRef = getAppSectionRef(groupId);
        singleRef.dispatch(updateSheetListAppItem(pageId, data));
      } else {
        rest.updateSheetListAppItem(pageId, data);
      }
    });
  }

  const handleClick = (type, data) => {
    switch (type) {
      case 'editCanvas':
        updateVisible(update(visible, { popupVisible: { $set: false } }));
        updatePageInfo({ components: [], pageId, pageName: name });
        updateEditPageVisible(true);
        break;
      case 'editPage':
        updateVisible(update(visible, { popupVisible: { $set: false } }));
        setExternalLinkIsEditing(true);
        break;
      case 'editName':
      case 'editIntro':
        setDescIsEditing(true);
        updateVisible(update(visible, { [`${type}Visible`]: { $set: true }, popupVisible: { $set: false } }));
        break;
      case 'adjustScreen':
        handleUpdatePage(data);
        break;
      case 'copy':
        copyCustomPage({
          appId,
          appSectionId: groupId,
          id: pageId,
          name: _l('%0-复制', name),
          iconColor: currentSheet.iconColor,
          iconUrl: currentSheet.iconUrl,
        });
        updateVisible(update(visible, { popupVisible: { $set: false } }));
        break;
      case 'move':
        updateVisible(update(visible, { popupVisible: { $set: false } }));
        break;
      case 'delete':
        DeleteConfirm({
          style: { width: '560px' },
          title: <span className="Bold">{_l('删除自定义页面 “%0”', name)}</span>,
          description: (
            <div>
              <span style={{ color: '#333', fontWeight: 'bold' }}>
                {_l('注意：自定义页面下所有配置和数据将被删除。')}
              </span>
              {_l('请务必确认所有应用成员都不再需要此自定义页面后，再执行此操作。')}
            </div>
          ),
          data: [{ text: _l('我确认删除自定义页面和所有数据'), value: 1 }],
          onOk: () => {
            const { currentPcNaviStyle } = appPkg;
            const data = {
              type: 1,
              appId,
              projectId,
              groupId,
              worksheetId: pageId,
              parentGroupId: currentSheet.parentGroupId,
            };
            if (currentPcNaviStyle === 1) {
              const singleRef = getAppSectionRef(groupId);
              singleRef.dispatch(deleteSheet(data));
            } else {
              props.deleteSheet(data);
            }
          },
        });
        updateVisible(update(visible, { popupVisible: { $set: false } }));
        break;
      default:
        updateVisible(update(visible, { popupVisible: { $set: false } }));
        break;
    }
  };
  const handleVisibleChange = (value, type) => {
    updateVisible(update(visible, { [type]: { $set: value } }));
  };
  const isPublicShare = location.href.includes('public/page');
  const isEmbedPage = location.href.includes('embed/page');
  const isEmbed = location.href.includes('#embed');

  return (
    <Fragment>
      <header
        className={cx({
          embedPageHeader: isEmbed || isEmbedPage,
          hide: !(urlTemplate ? configuration.hideHeaderBar === '0' : pageConfig.headerVisible),
          darkTheme: pageConfig.pageBgColor && !isLightColor(pageConfig.pageBgColor)
        })}
        style={{ backgroundColor: appPkg.pcNaviStyle === 1 ? pageConfig.darkenPageBgColor || pageConfig.pageBgColor : pageConfig.pageBgColor }}
      >
        <div className="nameWrap flex">
          {!isPublicShare &&
            !isEmbedPage &&
            (appPkg.currentPcNaviStyle === 2 ? (
              <Tooltip
                text={
                  <span>
                    {_l('退出')} ({navigator.userAgent.toLocaleLowerCase().includes('mac os') ? '⌘ + E' : 'Ctrl + E'})
                  </span>
                }
                popupPlacement="bottom"
              >
                <div
                  className="iconWrap hideSide"
                  onClick={() => {
                    window.disabledSideButton = true;
                    navigateTo(`/app/${appId}/${groupId}`);
                  }}
                >
                  <Icon icon="close_fullscreen" className="hoverGray fullRotate Font20" />
                </div>
              </Tooltip>
            ) : (
              <Tooltip
                text={
                  <span>
                    {inFull ? _l('退出') : _l('展开')} (
                    {navigator.userAgent.toLocaleLowerCase().includes('mac os') ? '⌘ + E' : 'Ctrl + E'})
                  </span>
                }
                popupPlacement="bottom"
              >
                <div
                  className="iconWrap hideSide"
                  onClick={() => {
                    if (inFull) {
                      window.disabledSideButton = true;
                      setInFull(false);
                      document.querySelector('#wrapper').classList.remove('fullWrapper');
                      window.customPageWindowResize();
                    } else {
                      setInFull(true);
                      document.querySelector('#wrapper').classList.add('fullWrapper');
                      window.customPageWindowResize();
                    }
                  }}
                >
                  <Icon
                    icon={inFull ? 'close_fullscreen' : 'open_in_full'}
                    className={cx('hoverGray fullRotate', inFull ? 'Font20' : 'Font17')}
                  />
                </div>
              </Tooltip>
            ))}
          {isPublicShare ? (
            <div className="valignWrapper mLeft10 w100">
              <div className="svgWrap valignWrapper" style={{ backgroundColor: apk.iconColor }}>
                <SvgIcon url={apk.iconUrl} fill="#fff" size={22} />
              </div>
              {(appName || name) && (
                <span className="pageName Font17 ellipsis">
                  {appName}-{name}
                </span>
              )}
            </div>
          ) : (
            <span className="pageName Font17">{name}</span>
          )}
          {desc && !isPublicShare && (
            <Popover
              arrowPointAtCenter={true}
              title={null}
              placement="bottomLeft"
              overlayClassName="sheetDescPopoverOverlay"
              content={
                <div className="popoverContent">
                  <RichText data={desc || ''} disabled={true} />
                </div>
              }
            >
              <Icon
                icon="knowledge-message Font18 Gray_9"
                className="Hand customPageDesc"
                onClick={() => {
                  setDescIsEditing(false);
                  handleVisibleChange(true, 'editIntroVisible');
                }}
              />
            </Popover>
          )}
          {isCharge && (
            <Trigger
              onPopupVisibleChange={value => handleVisibleChange(value, 'popupVisible')}
              popupVisible={popupVisible}
              action={['click']}
              popupAlign={{ points: ['tl', 'bl'] }}
              popup={
                <OperateMenu
                  {...pick(props, ['adjustScreen', 'ids', 'currentSheet', 'appPkg'])}
                  onClick={handleClick}
                />
              }
            >
              <Icon className="Font18 moreOperateIcon" icon="more_horiz" />
            </Trigger>
          )}
        </div>
        {!urlTemplate && (
          <Fragment>
            <Tooltip text={<span>{_l('刷新')}</span>} popupPlacement="bottom">
              <div
                className="iconWrap valignWrapper mLeft20"
                onClick={resetPage}
              >
                <Icon className="Font20 pointer" icon="task-later" />
              </div>
            </Tooltip>
            {!isPublicShare && !isEmbedPage && apk.appId && !md.global.Account.isPortal && pageConfig.shareVisible && (
              <Tooltip text={<span>{_l('分享')}</span>} popupPlacement="bottom">
                <div
                  className="iconWrap valignWrapper mLeft20"
                  onClick={() => {
                    setShareDialogVisible(true);
                  }}
                >
                  <Icon className="Font20 pointer" icon="share" />
                </div>
              </Tooltip>
            )}
            {pageConfig.downloadVisible && (
              exportLoading ? (
                <div className="iconWrap valignWrapper mLeft20">
                  <LoadDiv size="small" />
                </div>
              ) : (
                <Tooltip text={<span>{_l('保存图片')}</span>} popupPlacement="bottom">
                  <div className="iconWrap valignWrapper mLeft20" onClick={saveImage}>
                    <Icon className="Font20 pointer" icon="file_download" />
                  </div>
                </Tooltip>
              )
            )}
          </Fragment>
        )}
        {!isSafari() && !isPublicShare && pageConfig.fullScreenVisible && (
          <Tooltip text={<span>{_l('全屏展示')}</span>} popupPlacement="bottom">
            <div className="iconWrap valignWrapper mLeft20" onClick={() => toggle(true)}>
              <Icon icon="full_screen"  className="Font20 pointer" />
            </div>
          </Tooltip>
        )}
      </header>
      <SheetDesc
        title={_l('自定义页面说明')}
        isCharge={isCharge}
        visible={editIntroVisible}
        desc={desc || ''}
        isEditing={descIsEditing}
        setDescIsEditing={setDescIsEditing}
        onClose={() => {
          handleVisibleChange(false, 'editIntroVisible');
        }}
        onSave={value => {
          if (urlTemplate) {
            handleUpdateDesc(value);
          } else {
            handleUpdatePage({ desc: value });
          }
          // handleVisibleChange(false, 'editIntroVisible');
        }}
      />
      {editNameVisible && (
        <SelectIcon
          {...rest}
          {...ids}
          isActive
          appItem={currentSheet}
          projectId={projectId}
          name={name}
          icon={icon}
          workSheetId={pageId}
          onCancel={() => {
            handleVisibleChange(false, 'editNameVisible');
          }}
        />
      )}
      {shareDialogVisible && (
        <Share
          title={_l('分享页面: %0', name)}
          from="customPage"
          isCharge={isCharge}
          params={{
            appId,
            sourceId: pageId,
            worksheetId: pageId,
            title: name,
          }}
          getCopyContent={(type, url) =>
            type === 'private' ? url : `${url} ${apk.appName}-${currentSheet.workSheetName}`
          }
          onClose={() => setShareDialogVisible(false)}
        />
      )}
      {externalLinkIsEditing && (
        <EditExternalLink
          appId={appId}
          groupId={rest.groupId}
          appItem={currentSheet}
          updateSheetListAppItem={rest.updateSheetListAppItem}
          onCancel={() => setExternalLinkIsEditing(false)}
        />
      )}
    </Fragment>
  );
}

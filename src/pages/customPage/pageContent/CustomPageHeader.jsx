import React, { Fragment, lazy, Suspense, useEffect, useState } from 'react';
import cx from 'classnames';
import { pick } from 'lodash';
import _ from 'lodash';
import moment from 'moment';
import { Icon, LoadDiv, RichText, SvgIcon } from 'ming-ui';
import { DeleteReconfirm as DeleteConfirm, Dropdown, Popover, Tooltip } from 'ming-ui/antd-components';
import appManagementApi from 'src/api/appManagement';
import customApi from 'statistics/api/custom';
import { getReportTypeIcon } from 'statistics/Charts/reportTypeIcons';
import SheetDesc from 'worksheet/common/SheetDesc';
import selectIconDialog from 'worksheet/components/selectIconDialog';
import { deleteSheet } from 'worksheet/redux/actions/sheetList';
import { updateSheetListAppItem } from 'worksheet/redux/actions/sheetList';
import CreateByMingDaoYun from 'src/components/CreateByMingDaoYun';
import PublicAppLangDropdown from 'src/components/PublicAppLangDropdown';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import store from 'src/redux/configureStore';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { htmlEncodeReg } from 'src/utils/core/string';
import { replaceColor } from 'src/utils/domain/customPage/model';
import { canEditData } from 'src/utils/domain/permission/app';
import { isLightThemeColor as isLightColor } from 'src/utils/domain/project/colors';
import { APP_ROLE_TYPE } from 'src/utils/domain/worksheet/constants';
import { getTranslateInfo } from 'src/utils/services/app';
import { getCurrentProject } from 'src/utils/services/project';
import { getOperateMenuItems } from './OperateMenu';

const ConfigSideWrap = lazy(() => import('src/pages/customPage/components/ConfigSideWrap'));
const EditExternalLink = lazy(() =>
  import('src/pages/worksheet/common/WorkSheetLeft/ExternalLink').then(module => ({
    default: module.EditExternalLink,
  })),
);
const Share = lazy(() => import('src/pages/worksheet/components/Share'));

export default function CustomPageHeader(props) {
  const {
    currentSheet,
    updateEditPageVisible,
    updatePageInfo,
    deleteLinkageFiltersGroup,
    ids = {},
    copyCustomPage,
    toggle,
    resetPage,
    pageName,
    apk,
    appPkg,
    linkageFiltersGroup,
    pageTitle,
    ...rest
  } = props;
  //运营者|开发者 均可分享
  const isCharge = props.isCharge || canEditData(_.get(appPkg, ['permissionType']));
  const { groupId } = ids;
  const { appName } = apk;
  const pageConfig = replaceColor(props.config || {}, appPkg.iconColor || apk.iconColor);
  const projectId = appPkg.projectId || apk.projectId;
  const appId = appPkg.id || apk.appId;
  const { icon, workSheetName, urlTemplate, configuration } = currentSheet;
  const pageId = ids.worksheetId;
  const [visible, updateVisible] = useState({ popupVisible: false, editIntroVisible: false });
  const desc = urlTemplate ? configuration?.desc : props.desc;
  const { popupVisible, editIntroVisible } = visible;
  const name = pageName !== workSheetName ? workSheetName || pageName : pageName || workSheetName;
  const showName = getTranslateInfo(appId, null, pageId).name || name;
  const showAppName = getTranslateInfo(appId, null, appId).name || appName;
  const [shareDialogVisible, setShareDialogVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [descIsEditing, setDescIsEditing] = useState(false);
  const [externalLinkIsEditing, setExternalLinkIsEditing] = useState(false);
  const [inFull, setInFull] = useState(window.inFull || false);
  const [configVisible, setConfigVisible] = useState(false);

  useEffect(() => {
    window.editCustomPage = () => {
      handleClick(urlTemplate ? 'editPage' : 'editCanvas');
    };

    return () => {
      updatePageInfo({ linkageFiltersGroup: {} });
      delete window.editCustomPage;
    };
  }, [pageId]);

  const saveImage = () => {
    const imageName = `${showAppName ? `${showAppName}_` : ''}${showName}_${moment().format('_YYYYMMDDHHmmSS')}.png`;
    const isUserWatermark =
      md.global.Account.accountId &&
      (getCurrentProject(projectId, true).enabledWatermark ||
        (md.global.Account.watermark == 1 && md.global.Account.isPortal));
    setExportLoading(true);
    window.customPageWindowResize && window.customPageWindowResize();
    Promise.all([import('file-saver'), import('src/pages/customPage/exportImage')])
      .then(([{ saveAs }, { createFontLink, exportImage }]) => {
        return createFontLink()
          .then(
            exportImage.bind(this, {
              pageBgColor: pageConfig.pageBgColor,
              isUserWatermark,
              currentProject:
                md.global.Account.accountId && projectId !== 'external' ? getCurrentProject(projectId, true) : {},
            }),
          )
          .then(blob => {
            if (!blob) return;
            saveAs(blob, imageName);
          });
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => setExportLoading(false));
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
        desc: value,
      },
    };
    appManagementApi
      .editWorkSheetInfoForApp({
        appId,
        appSectionId: groupId,
        workSheetId: pageId,
        type: 1,
        ...data,
      })
      .then(() => {
        if ([1, 3].includes(currentPcNaviStyle)) {
          const singleRef = getAppSectionRef(groupId);
          singleRef.dispatch(updateSheetListAppItem(pageId, data));
        } else {
          rest.updateSheetListAppItem(pageId, data);
        }
      });
  };

  const handleClick = (type, data) => {
    switch (type) {
      case 'editCanvas':
        updateVisible(prevVisible => ({ ...prevVisible, popupVisible: false }));
        updatePageInfo({ components: [], pageId, pageName: name });
        updateEditPageVisible(true);
        break;
      case 'editPage':
        updateVisible(prevVisible => ({ ...prevVisible, popupVisible: false }));
        setExternalLinkIsEditing(true);
        break;
      case 'editName':
        selectIconDialog({
          ...rest,
          ...ids,
          isActive: true,
          appItem: currentSheet,
          projectId,
          name,
          icon,
          workSheetId: pageId,
        });
        break;
      case 'editIntro':
        setDescIsEditing(true);
        updateVisible(prevVisible => ({ ...prevVisible, editIntroVisible: true, popupVisible: false }));
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
        updateVisible(prevVisible => ({ ...prevVisible, popupVisible: false }));
        break;
      case 'move':
        updateVisible(prevVisible => ({ ...prevVisible, popupVisible: false }));
        break;
      case 'delete':
        DeleteConfirm({
          style: { width: 560 },
          title: _l('删除自定义页面 “%0”', name),
          description: (
            <div>
              <span style={{ color: 'var(--color-text-title)', fontWeight: 'bold' }}>
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

            if ([1, 3].includes(currentPcNaviStyle)) {
              const singleRef = getAppSectionRef(groupId);
              singleRef.dispatch(deleteSheet(data));
            } else {
              props.deleteSheet(data);
            }
          },
        });
        updateVisible(prevVisible => ({ ...prevVisible, popupVisible: false }));
        break;
      default:
        updateVisible(prevVisible => ({ ...prevVisible, popupVisible: false }));
        break;
    }
  };

  const handleVisibleChange = (value, type) => {
    updateVisible(prevVisible => ({ ...prevVisible, [type]: value }));
  };

  const isPublicShare = location.href.includes('public/page');
  const isEmbedPage = location.href.includes('embed/page');
  const isEmbed = location.href.includes('#embed');

  const renderLinkageFiltersPopover = () => {
    const toArray = () => {
      let result = [];

      for (let key in linkageFiltersGroup) {
        const item = linkageFiltersGroup[key];
        result.push({
          key,
          ...item,
        });
      }

      return result;
    };

    const res = toArray();
    return (
      <div className="customPageAutoLinkagePopover">
        <div className="valignWrapper" style={{ padding: '0 4px 0 9px' }}>
          <div className="Font17 bold textPrimary flex">{_l('联动筛选')}</div>
          <Icon
            className="Font24 textTertiary pointer"
            icon="close"
            onClick={() => document.querySelector('.autoLinkageTrigger').click()}
          />
        </div>
        {res.length ? (
          <Fragment>
            <div className="linkageFilterWrap">
              {res.map(item => (
                <div className="linkageFilter mTop10" key={item.reportId}>
                  <div className="flexRow alignItemsCenter mBottom2">
                    <Icon className="Font16 mRight5 colorPrimary" icon={getReportTypeIcon(item.reportType)} />
                    <div className="flex ellipsis bold">{item.reportName}</div>
                    <Icon
                      className="Font17 textTertiary pointer"
                      icon="trash"
                      onClick={() => deleteLinkageFiltersGroup({ value: item.key })}
                    />
                  </div>
                  <div className="flexColumn mLeft20">
                    {item.filters.map(n => (
                      <div
                        key={n.controlId}
                        dangerouslySetInnerHTML={{
                          __html: _l(
                            '%0是%1',
                            `<span class="bold mRight2">${htmlEncodeReg(n.controlName)}</span>`,
                            `<span class="bold mLeft2">${htmlEncodeReg(n.controlValue || '--')}</span>`,
                          ),
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mTop10 TxtRight">
              <span
                className="pointer colorPrimary closeText"
                onClick={() => {
                  updatePageInfo({ linkageFiltersGroup: {} });
                  document.querySelector('.autoLinkageTrigger').click();
                }}
              >
                {_l('清空并关闭')}
              </span>
            </div>
          </Fragment>
        ) : (
          <div className="flexColumn alignItemsCenter justifyContentCenter mTop20 mBottom20">
            <Icon className="Font64 textPlaceholder" icon="linkage_filter" />
            <div className="textTertiary mTop5 Font14">{_l('未发起联动筛选')}</div>
          </div>
        )}
      </div>
    );
  };

  const isDarkTheme = pageConfig.pageBgColor && !isLightColor(pageConfig.pageBgColor);
  const backgroundColor =
    appPkg.pcNaviStyle === 1 ? pageConfig.darkenPageBgColor || pageConfig.pageBgColor : pageConfig.pageBgColor;
  const bgStyleValue = _.isUndefined(pageConfig.bgStyleValue)
    ? pageConfig.pageBgImage
      ? 'shape'
      : ''
    : pageConfig.bgStyleValue;
  const hasPageBg =
    (bgStyleValue === 'shape' && Boolean(pageConfig.pageBgImage)) ||
    (bgStyleValue === 'image' && Boolean(pageConfig.bgImageIndex)) ||
    (bgStyleValue === 'custom' && Boolean(props.previewUrl || props.imageUrl));
  const operateMenuItems = getOperateMenuItems({
    ...pick(props, ['adjustScreen', 'ids', 'currentSheet', 'appPkg']),
    onClick: handleClick,
  });

  return (
    <Fragment>
      <header
        className={cx('customPageHeader', {
          embedPageHeader: isEmbed || isEmbedPage,
          hide:
            appPkg.currentPcNaviStyle === 2
              ? false
              : !(urlTemplate ? configuration?.hideHeaderBar === '0' : pageConfig.headerVisible),
        })}
        style={{
          // zIndex: hasPageBg ? 0 : 2,
          '--title-color': isDarkTheme ? '#ffffffcc' : '#333',
          '--icon-color': isDarkTheme ? '#ffffffcc' : '#757575a1',
          '--icon-hover-color': isDarkTheme ? '#ffffff' : '#1677ff',
          backgroundColor: hasPageBg ? 'transparent' : backgroundColor,
        }}
      >
        <div className="nameWrap flex">
          {!isPublicShare &&
            !isEmbedPage &&
            (appPkg.currentPcNaviStyle === 2 ? (
              <Tooltip title={_l('退出全屏')} shortcut={window.isMacOs ? '⌘/' : 'Ctrl+/'} placement="bottom">
                <div
                  className="iconWrap hideSide"
                  onClick={() => {
                    window.disabledSideButton = true;
                    navigateTo(`/app/${appId}/${groupId}`);
                  }}
                >
                  <Icon icon="close_fullscreen" className="hoverGray pointer fullRotate Font20" />
                </div>
              </Tooltip>
            ) : (
              <Tooltip
                title={inFull ? _l('退出全屏') : _l('应用全屏')}
                shortcut={window.isMacOs ? '⌘/' : 'Ctrl+/'}
                placement="bottom"
              >
                <div
                  className="iconWrap hideSide"
                  onClick={() => {
                    if (inFull) {
                      window.disabledSideButton = true;
                      window.inFull = false;
                      setInFull(false);
                      document.querySelector('#wrapper').classList.remove('fullWrapper');
                      window.customPageWindowResize && window.customPageWindowResize();
                    } else {
                      window.inFull = true;
                      setInFull(true);
                      document.querySelector('#wrapper').classList.add('fullWrapper');
                      window.customPageWindowResize && window.customPageWindowResize();
                    }
                  }}
                >
                  <Icon
                    icon={inFull ? 'close_fullscreen' : 'open_in_full'}
                    className={cx('hoverGray fullRotate pointer', inFull ? 'Font20' : 'Font17')}
                  />
                </div>
              </Tooltip>
            ))}
          {isPublicShare ? (
            <div className="valignWrapper mLeft10 w100">
              <div className="svgWrap valignWrapper" style={{ backgroundColor: apk.iconColor }}>
                <SvgIcon url={apk.iconUrl} fill="#fff" size={22} />
              </div>
              {(showAppName || showName) && (
                <span className="pageName Font17 ellipsis">{pageTitle || `${showAppName}-${showName}`}</span>
              )}
            </div>
          ) : (
            <span className="pageName Font17">{showName}</span>
          )}
          {desc && !isPublicShare && (
            <Popover
              arrow={{ pointAtCenter: true }}
              title={null}
              placement="bottomLeft"
              classNames={{ root: 'sheetDescPopoverOverlay' }}
              content={
                <div className="popoverContent" style={{ maxHeight: document.body.clientHeight / 2 }}>
                  <RichText
                    data={desc ? getTranslateInfo(appId, null, pageId).description || desc || '' : ''}
                    disabled={true}
                  />
                </div>
              }
            >
              <div className="iconWrap valignWrapper mRight5">
                <Icon
                  icon="info Font18"
                  className="Hand customPageDesc"
                  onClick={() => {
                    setDescIsEditing(false);
                    handleVisibleChange(true, 'editIntroVisible');
                  }}
                />
              </div>
            </Popover>
          )}
          {isCharge && (
            <Dropdown
              trigger={['click']}
              open={popupVisible}
              onOpenChange={value => handleVisibleChange(value, 'popupVisible')}
              placement="bottomLeft"
              menu={{ items: operateMenuItems, selectable: false, selectedKeys: [], style: { minWidth: 220 } }}
            >
              <div className="iconWrap valignWrapper">
                <Icon className="Font18 moreOperateIcon pointer" icon="more_horiz" />
              </div>
            </Dropdown>
          )}
        </div>
        {!urlTemplate && (
          <Fragment>
            {isPublicShare && (
              <PublicAppLangDropdown className="iconWrap valignWrapper mLeft20" appId={appId} projectId={projectId} />
            )}
            {pageConfig.autoLinkage && (
              <Tooltip title={_l('联动筛选')} placement="bottom">
                <Popover
                  arrow={true}
                  open={undefined}
                  trigger="click"
                  placement="bottom"
                  classNames={{ root: 'customPageAutoLinkagePopoverWrap' }}
                  content={renderLinkageFiltersPopover()}
                >
                  <div data-event="filter" className="iconWrap valignWrapper mLeft20 autoLinkageTrigger">
                    <Icon className="Font22 pointer" icon="linkage_filter" />
                  </div>
                </Popover>
              </Tooltip>
            )}
            <Tooltip title={_l('刷新')} placement="bottom">
              <div data-event="refresh" className="iconWrap valignWrapper mLeft20" onClick={resetPage}>
                <Icon className="Font20 pointer" icon="task-later" />
              </div>
            </Tooltip>
            {isCharge && !(appPkg.isLock || appPkg.permissionType === APP_ROLE_TYPE.RUNNER_ROLE) && (
              <Tooltip title={_l('页面配置')} placement="bottom">
                <div
                  data-event="pageConfig"
                  className="iconWrap valignWrapper mLeft20"
                  onClick={() => {
                    setConfigVisible(true);
                  }}
                >
                  <Icon className="Font20 pointer" icon="design-services" />
                </div>
              </Tooltip>
            )}
            {!isPublicShare && !isEmbedPage && apk.appId && !md.global.Account.isPortal && pageConfig.shareVisible && (
              <Tooltip title={_l('分享')} placement="bottom">
                <div
                  data-event="share"
                  className="iconWrap valignWrapper mLeft20"
                  onClick={() => {
                    setShareDialogVisible(true);
                  }}
                >
                  <Icon className="Font20 pointer" icon="share" />
                </div>
              </Tooltip>
            )}
            {pageConfig.downloadVisible &&
              (exportLoading ? (
                <div className="iconWrap valignWrapper mLeft20">
                  <LoadDiv size="small" />
                </div>
              ) : (
                <Tooltip title={_l('保存图片')} placement="bottom">
                  <div data-event="savePic" className="iconWrap valignWrapper mLeft20" onClick={saveImage}>
                    <Icon className="Font20 pointer" icon="download" />
                  </div>
                </Tooltip>
              ))}
          </Fragment>
        )}
        {isPublicShare && window.platformENV.isHap && (
          <div className="valignWrapper textSecondary createSource mLeft20">
            <CreateByMingDaoYun />
          </div>
        )}
        {!isPublicShare && pageConfig.fullScreenVisible && (
          <Tooltip title={_l('全屏展示')} placement="bottom">
            <div data-event="fullScreen" className="iconWrap valignWrapper mLeft20" onClick={() => toggle(true)}>
              <Icon icon="full_screen" className="Font20 pointer" />
            </div>
          </Tooltip>
        )}
      </header>
      <SheetDesc
        title={_l('自定义页面说明')}
        permissionType={appPkg.permissionType}
        cacheKey="pageIntroDescription"
        visible={editIntroVisible}
        desc={descIsEditing ? desc || '' : desc ? getTranslateInfo(appId, null, pageId).description || desc : ''}
        remark={props.remark}
        showRemark={!urlTemplate}
        isEditing={descIsEditing}
        setDescIsEditing={setDescIsEditing}
        onClose={() => {
          handleVisibleChange(false, 'editIntroVisible');
        }}
        onSave={({ desc, remark }) => {
          if (urlTemplate) {
            handleUpdateDesc(desc);
          } else {
            handleUpdatePage({ desc, remark });
          }
          // handleVisibleChange(false, 'editIntroVisible');
        }}
      />
      {shareDialogVisible && (
        <Suspense fallback={null}>
          <Share
            title={_l('分享页面: %0', showName)}
            from="customPage"
            isCharge={isCharge}
            params={{
              appId,
              sourceId: pageId,
              worksheetId: pageId,
              title: showName,
            }}
            getCopyContent={(type, url) =>
              type === 'private' ? url : `${url} ${apk.appName}-${currentSheet.workSheetName}`
            }
            onClose={() => setShareDialogVisible(false)}
          />
        </Suspense>
      )}
      {externalLinkIsEditing && (
        <Suspense fallback={null}>
          <EditExternalLink
            appId={appId}
            groupId={rest.groupId}
            appItem={currentSheet}
            updateSheetListAppItem={rest.updateSheetListAppItem}
            onCancel={() => setExternalLinkIsEditing(false)}
          />
        </Suspense>
      )}
      {configVisible && (
        <Suspense fallback={null}>
          <ConfigSideWrap
            {...props}
            className="sideAbsolute"
            onClose={() => {
              setConfigVisible(false);
              const { id, adjustScreen, config, imageUrl, previewUrl, urlParams } = props;
              customApi.updatePage({
                appId: id,
                adjustScreen,
                config: {
                  ...config,
                  webNewCols: config.orightWebCols,
                },
                imageUrl,
                previewUrl,
                urlParams,
              });
            }}
          />
        </Suspense>
      )}
    </Fragment>
  );
}

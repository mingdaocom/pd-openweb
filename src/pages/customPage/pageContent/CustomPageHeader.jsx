import React, { useState, useRef, useEffect, Fragment } from 'react';
import { string } from 'prop-types';
import { Tooltip, Icon, LoadDiv, RichText, SvgIcon } from 'ming-ui';
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
import { navigateTo } from 'src/router/navigateTo';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import { deleteSheet } from 'worksheet/redux/actions/sheetList';
import moment from 'moment';
import { canEditData } from 'worksheet/redux/actions/util';
import { EditExternalLink } from 'src/pages/worksheet/common/WorkSheetLeft/ExternalLink';
import ConfigSideWrap from 'src/pages/customPage/components/ConfigSideWrap';
import store from 'redux/configureStore';
import { updateSheetListAppItem } from 'worksheet/redux/actions/sheetList';
import { replaceColor, isLightColor } from 'src/pages/customPage/util';
import { getTranslateInfo } from 'src/util';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum';
import { chartNav } from 'statistics/common';

export default function CustomPageHeader(props) {
  const {
    currentSheet,
    updateEditPageVisible,
    updatePageInfo,
    deleteLinkageFiltersGroup,
    ids = {},
    updateSheetListIsUnfold,
    copyCustomPage,
    toggle,
    resetPage,
    pageName,
    apk,
    appPkg,
    linkageFiltersGroup,
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
  const [visible, updateVisible] = useState({ popupVisible: false, editNameVisible: false, editIntroVisible: false });
  const desc = urlTemplate ? configuration.desc : props.desc;
  const { popupVisible, editNameVisible, editIntroVisible } = visible;
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
    const imageName = `${appName ? `${appName}_` : ''}${name}_${moment().format('_YYYYMMDDHHmmSS')}.png`;
    setExportLoading(true);
    window.customPageWindowResize && window.customPageWindowResize();
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
      .then(result => {
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
              <span style={{ color: '#151515', fontWeight: 'bold' }}>
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
          <div className="Font17 bold Gray flex">{_l('联动筛选')}</div>
          <Icon
            className="Font24 Gray_9e pointer"
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
                    <Icon
                      className="Font16 mRight5 ThemeColor"
                      icon={_.find(chartNav, { type: item.reportType }).icon}
                    />
                    <div className="flex ellipsis bold">{item.reportName}</div>
                    <Icon
                      className="Font17 Gray_9e pointer"
                      icon="delete2"
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
                            `<span class="bold mRight2">${n.controlName}</span>`,
                            `<span class="bold mLeft2">${n.controlValue || '--'}</span>`,
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
                className="pointer ThemeColor closeText"
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
            <Icon className="Font64 Gray_df" icon="linkage_filter" />
            <div className="Gray_9e mTop5 Font14">{_l('未发起联动筛选')}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Fragment>
      <header
        className={cx({
          embedPageHeader: isEmbed || isEmbedPage,
          hide:
            appPkg.currentPcNaviStyle === 2
              ? false
              : !(urlTemplate ? configuration.hideHeaderBar === '0' : pageConfig.headerVisible),
          darkTheme: pageConfig.pageBgColor && !isLightColor(pageConfig.pageBgColor),
        })}
        style={{
          backgroundColor:
            appPkg.pcNaviStyle === 1 ? pageConfig.darkenPageBgColor || pageConfig.pageBgColor : pageConfig.pageBgColor,
        }}
      >
        <div className="nameWrap flex">
          {!isPublicShare &&
            !isEmbedPage &&
            (appPkg.currentPcNaviStyle === 2 ? (
              <Tooltip
                text={
                  <span>
                    {_l('退出')} ({window.isMacOs ? '⌘ + E' : 'Shift + E'})
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
                    {window.isMacOs ? '⌘ + E' : 'Shift + E'})
                  </span>
                }
                popupPlacement="bottom"
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
                <span className="pageName Font17 ellipsis">
                  {showAppName}-{showName}
                </span>
              )}
            </div>
          ) : (
            <span className="pageName Font17">{showName}</span>
          )}
          {desc && !isPublicShare && (
            <Popover
              arrowPointAtCenter={true}
              title={null}
              placement="bottomLeft"
              overlayClassName="sheetDescPopoverOverlay"
              content={
                <div className="popoverContent" style={{ maxHeight: document.body.clientHeight / 2 }}>
                  <RichText data={getTranslateInfo(appId, null, pageId).description || desc || ''} disabled={true} />
                </div>
              }
            >
              <div className="iconWrap valignWrapper mRight5">
                <Icon
                  icon="knowledge-message Font18"
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
              <div className="iconWrap valignWrapper">
                <Icon className="Font18 moreOperateIcon pointer" icon="more_horiz" />
              </div>
            </Trigger>
          )}
        </div>
        {!urlTemplate && (
          <Fragment>
            {pageConfig.autoLinkage && (
              <Popover
                visible={undefined}
                trigger="click"
                placement="bottom"
                overlayClassName="customPageAutoLinkagePopoverWrap"
                content={renderLinkageFiltersPopover()}
              >
                <Tooltip text={<span>{_l('联动筛选')}</span>} popupPlacement="bottom">
                  <div className="iconWrap valignWrapper mLeft20 autoLinkageTrigger">
                    <Icon className="Font22 pointer" icon="linkage_filter" />
                  </div>
                </Tooltip>
              </Popover>
            )}
            <Tooltip text={<span>{_l('刷新')}</span>} popupPlacement="bottom">
              <div className="iconWrap valignWrapper mLeft20" onClick={resetPage}>
                <Icon className="Font20 pointer" icon="task-later" />
              </div>
            </Tooltip>
            {isCharge && !(appPkg.isLock || appPkg.permissionType === APP_ROLE_TYPE.RUNNER_ROLE) && (
              <Tooltip text={<span>{_l('页面配置')}</span>} popupPlacement="bottom">
                <div
                  className="iconWrap valignWrapper mLeft20"
                  onClick={() => {
                    setConfigVisible(true);
                  }}
                >
                  <Icon className="Font20 pointer" icon="tune" />
                </div>
              </Tooltip>
            )}
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
            {pageConfig.downloadVisible &&
              (exportLoading ? (
                <div className="iconWrap valignWrapper mLeft20">
                  <LoadDiv size="small" />
                </div>
              ) : (
                <Tooltip text={<span>{_l('保存图片')}</span>} popupPlacement="bottom">
                  <div className="iconWrap valignWrapper mLeft20" onClick={saveImage}>
                    <Icon className="Font20 pointer" icon="file_download" />
                  </div>
                </Tooltip>
              ))}
          </Fragment>
        )}
        {!isPublicShare && pageConfig.fullScreenVisible && (
          <Tooltip text={<span>{_l('全屏展示')}</span>} popupPlacement="bottom">
            <div className="iconWrap valignWrapper mLeft20" onClick={() => toggle(true)}>
              <Icon icon="full_screen" className="Font20 pointer" />
            </div>
          </Tooltip>
        )}
      </header>
      <SheetDesc
        title={_l('自定义页面说明')}
        permissionType={appPkg.permissionType}
        visible={editIntroVisible}
        desc={descIsEditing ? desc || '' : getTranslateInfo(appId, null, pageId).description || desc || ''}
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
      {configVisible && (
        <ConfigSideWrap
          {...props}
          className="sideAbsolute"
          onClose={() => {
            setConfigVisible(false);
            const { id, adjustScreen, config, urlParams } = props;
            customApi.updatePage({
              appId: id,
              adjustScreen,
              config,
              urlParams
            });
          }}
        />
      )}
    </Fragment>
  );
}

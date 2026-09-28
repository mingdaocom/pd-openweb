import React, { Fragment, lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DocumentTitle from 'react-document-title';
import { useFullscreen, useToggle } from 'react-use';
import cx from 'classnames';
import { pick } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import customApi from 'statistics/api/custom.js';
import { defaultConfig } from 'src/pages/customPage/components/ConfigSideWrap/defaultConfig';
import {
  deleteLinkageFiltersGroup,
  updateEditPageVisible,
  updateLoading,
  updatePageInfo,
} from 'src/pages/customPage/redux/action';
import { CUSTOM_PAGE_IFRAME_ALLOW, updateLayout } from 'src/pages/customPage/util';
import WebLayout from 'src/pages/customPage/webLayout';
import { getAppSectionData } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import { copyCustomPage } from 'src/pages/worksheet/redux/actions/sheetList';
import { deleteSheet, updateSheetList, updateSheetListAppItem } from 'src/pages/worksheet/redux/actions/sheetList';
import { transferValue } from 'src/utils/domain/control/value';
import { enumWidgetType } from 'src/utils/domain/customPage/model';
import { findSheet } from 'src/utils/domain/worksheet/helpers';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { emitter } from 'src/utils/platform/browser/dom';
import { getTranslateInfo } from 'src/utils/services/app';
import { getEmbedValue } from 'src/utils/services/app/embed';
import { addBehaviorLog } from 'src/utils/services/project';
import { insertPortal, syncThemeConfig } from '../util';
import CustomPageHeader from './CustomPageHeader';

const CustomPageEditor = lazy(() => import('src/pages/customPage'));

const CustomPageContentWrap = styled.div`
  flex: 1;
  position: relative;
  header {
    display: flex;
    justify-content: space-between;
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 44px;
    padding: 0 24px 0 10px;
    background-color: var(--color-background-card);
    box-shadow: var(--shadow-md);
    z-index: 1;
    .customPageDesc {
      padding: 0 4px;
    }
    .nameWrap {
      display: flex;
      align-items: center;
      min-width: 0;
      .pageName {
        color: var(--title-color);
        margin: 0 6px;
        font-size: 18px;
        font-weight: bold;
      }
    }
    .hideSide {
      vertical-align: top;
    }
    .iconWrap {
      color: var(--icon-color);
      &:hover {
        color: var(--icon-hover-color);
      }
      .icon-language {
        color: inherit !important;
      }
    }
    .svgWrap {
      width: 26px;
      height: 26px;
      border-radius: 4px;
      justify-content: center;
      line-height: initial;
    }
    .fullRotate {
      transform: rotate(90deg);
      display: inline-block;
    }
    .hoverGray {
      width: 24px;
      height: 24px;
      display: inline-block;
      text-align: center;
      line-height: 24px;
      border-radius: 3px;
    }
    .hoverGray:hover {
      // background: var(--color-background-secondary);
    }
    .createSource {
      & > div,
      & a {
        color: var(--title-color);
      }
    }
  }
  > .content {
    min-height: 0;
    width: 100%;
    flex: 1;
  }
  .customPageContent {
    padding: 0 8px 0px 8px;
    &.isFullscreen {
      padding-top: 0;
    }
    &.adjustScreen {
      overflow: hidden;
    }
  }
  .selectIconWrap {
    top: 40px;
    left: 10px;
  }
`;

function CustomPageContent(props) {
  const {
    appPkg,
    loading,
    visible,
    adjustScreen,
    config,
    imageUrl,
    previewUrl,
    updatePageInfo,
    updateLoading,
    apk,
    id,
    groupId,
    className,
    pageTitle,
    ids = {},
  } = props;
  const pageId = id;
  const appName = getTranslateInfo(appPkg.id, null, appPkg.id).name || props.appName || apk.appName || '';
  const ref = useRef(document.body);
  const configRef = useRef(config);
  const pageRequestRef = useRef(null);
  const previousPageIdRef = useRef(id);
  const [show, toggle] = useToggle(false);

  const showFullscreen = () => {
    document.body.classList.add('customPageFullscreen');
    toggle(true);
    window.parent.postMessage({ type: 'showFullscreen' }, md.global.Config.MarketUrl);
  };

  const closeFullscreen = useCallback(() => {
    document.body.classList.remove('customPageFullscreen');
    toggle(false);
  }, [toggle]);

  const isFullscreen = useFullscreen(ref, show, { onClose: closeFullscreen });
  const isMobile = browserIsMobile();
  const sheetList = [1, 3].includes(appPkg.currentPcNaviStyle) ? getAppSectionData(groupId) : props.sheetList;
  const currentSheet = findSheet(id, sheetList) || props.currentSheet || {};
  const pageName = getTranslateInfo(appPkg.id, null, pageId).name || props.pageName || currentSheet.workSheetName || '';
  const { urlTemplate } = currentSheet;

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const getPage = useCallback(() => {
    if (_.isFunction(_.get(pageRequestRef, 'current.abort'))) {
      pageRequestRef.current.abort();
    }

    const request = customApi.getPage({
      appId: pageId,
    });

    pageRequestRef.current = request;
    request
      .then(
        ({ components, desc, remark, apk, adjustScreen, urlParams, name, config, imageUrl, previewUrl, version }) => {
          if (pageRequestRef.current !== request) return;

          const componentsData = isMobile
            ? components.filter(item => item.mobile.visible)
            : updateLayout(components, config);
          addBehaviorLog('customPage', pageId, {}, true);
          updatePageInfo({
            components: componentsData,
            desc,
            remark,
            adjustScreen,
            urlParams,
            pageId,
            apk: apk || {},
            imageUrl,
            previewUrl,
            config: syncThemeConfig(
              config ? { ...config, webNewCols: 48, orightWebCols: config.webNewCols } : defaultConfig,
            ),
            pageName: name,
            filterComponents: componentsData.filter(item => item.value && item.type === enumWidgetType.filter),
            version,
          });
          if (window.shareState.shareId && !adjustScreen && className && className.includes('hideHeader')) {
            document.body.classList.add('bodyScroll');
          }
        },
      )
      .finally(() => {
        if (pageRequestRef.current !== request) return;
        pageRequestRef.current = null;
        updateLoading(false);
      });
  }, [className, isMobile, pageId, updateLoading, updatePageInfo]);

  useEffect(() => {
    const handler = value => {
      if (value === _.get(configRef.current, 'pageStyleType') || !configRef.current) return;
      updatePageInfo({
        config: syncThemeConfig(configRef.current, value),
      });
    };

    emitter.addListener('CHANGE_THEME_MODE', handler);
    return () => {
      emitter.removeListener('CHANGE_THEME_MODE', handler);
    };
  }, [updatePageInfo]);

  useEffect(() => {
    const pageChanged = previousPageIdRef.current !== id;
    previousPageIdRef.current = id;

    if (pageChanged && id && isFullscreen) {
      closeFullscreen();
    }
  }, [closeFullscreen, id, isFullscreen]);

  useEffect(() => {
    if (urlTemplate) {
      updatePageInfo({
        config: {
          fullScreenVisible: true,
        },
      });
      updateLoading(false);
    } else {
      updateLoading(true);
      pageId && getPage();
    }

    return () => {
      if (_.isFunction(_.get(pageRequestRef, 'current.abort'))) {
        pageRequestRef.current.abort();
        pageRequestRef.current = null;
      }

      updateLoading(true);
    };
  }, [getPage, pageId, updateLoading, updatePageInfo, urlTemplate]);

  const resetPage = () => {
    updatePageInfo({ loadFilterComponentCount: 0 });
    updateLoading(true);
    getPage();
  };

  const renderContent = () => {
    if (urlTemplate) {
      const dataSource = transferValue(urlTemplate);
      const urlList = [];
      dataSource.map(o => {
        if (o.staticValue) {
          urlList.push(o.staticValue);
        } else {
          const embedValue = getEmbedValue(
            {
              projectId: appPkg.projectId,
              appId: ids.appId,
              groupId: ids.groupId,
              worksheetId: ids.worksheetId,
            },
            o.cid,
          );
          urlList.push(encodeURIComponent(embedValue));
        }
      });
      const url = urlList.join('');
      return (
        <div className="customPageContent h100 pAll0">
          <iframe
            className="w100 h100"
            style={{ border: 'none' }}
            allow={CUSTOM_PAGE_IFRAME_ALLOW}
            allowFullScreen
            src={insertPortal(url)}
          />
        </div>
      );
    }

    if (visible) return null;
    if (loading) return <LoadDiv style={{ marginTop: '60px' }} />;

    return (
      <WebLayout
        layoutType={isMobile ? 'mobile' : 'web'}
        adjustScreen={adjustScreen}
        config={config}
        imageUrl={imageUrl}
        previewUrl={previewUrl}
        appPkg={appPkg}
        className={cx('customPageContent', { isFullscreen })}
        from="display"
        ids={ids}
        isFullscreen={isFullscreen}
        editable={false}
        emptyPlaceholder={
          <div className="empty">
            <div className="iconWrap">
              <i className="icon-widgets"></i>
            </div>
            <p className="mTop16">{_l('暂未添加组件')}</p>
          </div>
        }
      />
    );
  };

  return (
    <Fragment>
      <CustomPageContentWrap className={cx('CustomPageContentWrap flexColumn', className)}>
        {(appName || pageName) && (
          <DocumentTitle title={pageTitle || `${pageName}${pageName && appName ? ' - ' : ''}${appName}`} />
        )}
        {!loading && (
          <CustomPageHeader {...props} currentSheet={currentSheet} toggle={showFullscreen} resetPage={resetPage} />
        )}
        <div className="content">{renderContent()}</div>
      </CustomPageContentWrap>
      {visible && !urlTemplate && (
        <Suspense fallback={<LoadDiv style={{ marginTop: '60px' }} />}>
          <CustomPageEditor name={pageName} ids={ids} currentSheet={currentSheet} />
        </Suspense>
      )}
    </Fragment>
  );
}

export default connect(
  ({ appPkg, customPage, sheet: { isCharge, base }, sheetList: { data } }) => ({
    ...pick(customPage, [
      'loading',
      'visible',
      'desc',
      'remark',
      'adjustScreen',
      'urlParams',
      'apk',
      'pageName',
      'flag',
      'config',
      'imageUrl',
      'previewUrl',
      'version',
      'linkageFiltersGroup',
    ]),
    isCharge,
    appName: appPkg.name,
    sheetList: data,
    appPkg,
    activeSheetId: base.workSheetId,
    groupId: base.groupId,
  }),
  dispatch =>
    bindActionCreators(
      {
        updatePageInfo,
        updateLoading,
        copyCustomPage,
        deleteSheet,
        updateSheetList,
        updateSheetListAppItem,
        updateEditPageVisible,
        deleteLinkageFiltersGroup,
      },
      dispatch,
    ),
)(CustomPageContent);

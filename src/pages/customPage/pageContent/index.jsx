import React, { Fragment, useEffect, useRef } from 'react';
import { string } from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { useToggle, useFullscreen } from 'react-use';
import 'rc-trigger/assets/index.css';
import WebLayout from 'src/pages/customPage/webLayout';
import {
  updatePageInfo,
  updateLoading,
  updateEditPageVisible,
  deleteLinkageFiltersGroup,
} from 'src/pages/customPage/redux/action';
import { copyCustomPage } from 'src/pages/worksheet/redux/actions/sheetList';
import { updateSheetList, deleteSheet, updateSheetListAppItem } from 'src/pages/worksheet/redux/actions/sheetList';
import customApi from 'statistics/api/custom.js';
import CustomPageHeader from './CustomPageHeader';
import CustomPage from 'src/pages/customPage';
import { getAppSectionData } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import { browserIsMobile } from 'src/util';
import { findSheet } from 'worksheet/util';
import { enumWidgetType, updateLayout } from 'src/pages/customPage/util';
import DocumentTitle from 'react-document-title';
import { pick } from 'lodash';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { getEmbedValue } from 'src/components/newCustomFields/tools/formUtils';
import { defaultConfig } from 'src/pages/customPage/components/ConfigSideWrap';
import { getTranslateInfo, addBehaviorLog } from 'src/util';

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
    border-radius: 3px 3px 0 0;
    background-color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
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
      // background: #f5f5f5;
    }
    .createSource {
      & > div,
      & a {
        color: var(--title-color);
      }
    }
  }
  .content {
    min-height: 0;
    width: 100%;
    flex: 1;
  }
  .customPageContent {
    padding: 0 8px 0px 8px;
    &.isFullscreen {
      padding-top: 0;
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
    activeSheetId,
    adjustScreen,
    config,
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
  const [show, toggle] = useToggle(false);

  const showFullscreen = () => {
    document.body.classList.add('customPageFullscreen');
    toggle(true);
    window.parent.postMessage({ type: 'showFullscreen' }, md.global.Config.MarketUrl);
  };
  const closeFullscreen = () => {
    document.body.classList.remove('customPageFullscreen');
    toggle(false);
  };
  const isFullscreen = useFullscreen(ref, show, { onClose: closeFullscreen });
  const isMobile = browserIsMobile();
  const sheetList = [1, 3].includes(appPkg.currentPcNaviStyle) ? getAppSectionData(groupId) : props.sheetList;
  const currentSheet = findSheet(id, sheetList) || props.currentSheet || {};
  const pageName = getTranslateInfo(appPkg.id, null, pageId).name || props.pageName || currentSheet.workSheetName || '';
  const { urlTemplate, configuration } = currentSheet;

  useEffect(() => {
    if (id && isFullscreen) {
      closeFullscreen();
    }
  }, [id]);

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
      updateLoading(true);
    };
  }, []);

  const getPage = () => {
    customApi
      .getPage({
        appId: pageId,
      })
      .then(({ components, desc, apk, adjustScreen, urlParams, name, config, version }) => {
        const componentsData = isMobile
          ? components.filter(item => item.mobile.visible)
          : updateLayout(components, config);
        addBehaviorLog('customPage', pageId, {}, true);
        updatePageInfo({
          components: componentsData,
          desc,
          adjustScreen,
          urlParams,
          pageId,
          apk: apk || {},
          config: config ? { ...config, webNewCols: 48, orightWebCols: config.webNewCols } : defaultConfig,
          pageName: name,
          filterComponents: componentsData.filter(item => item.value && item.type === enumWidgetType.filter),
          version,
        });
      })
      .finally(() => updateLoading(false));
  };

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
        if (!!o.staticValue) {
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
      return (
        <div className="customPageContent h100 pAll0">
          <iframe className="w100 h100" style={{ border: 'none' }} src={urlList.join('')} />
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
        appPkg={appPkg}
        className={cx('customPageContent', { isFullscreen })}
        from="display"
        ids={ids}
        isFullscreen={isFullscreen}
        editable={false}
        emptyPlaceholder={
          <div className="empty">
            <div className="iconWrap">
              <i className="icon-custom_widgets"></i>
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
      {visible && !urlTemplate && <CustomPage name={pageName} ids={ids} currentSheet={currentSheet} />}
    </Fragment>
  );
}

export default connect(
  ({ appPkg, customPage, sheet: { isCharge, base }, sheetList: { data, appSectionDetail } }) => ({
    ...pick(customPage, [
      'loading',
      'visible',
      'desc',
      'adjustScreen',
      'urlParams',
      'apk',
      'pageName',
      'flag',
      'config',
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

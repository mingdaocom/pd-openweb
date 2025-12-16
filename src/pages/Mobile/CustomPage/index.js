import React, { Component } from 'react';
import store from 'redux/configureStore';
import DocumentTitle from 'react-document-title';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { SpinLoading } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { WaterMark } from 'ming-ui';
import homeAppApi from 'src/api/homeApp';
import customApi from 'statistics/api/custom';
import workflowPushSoket from 'mobile/components/socket/workflowPushSoket';
import { getEmbedValue } from 'src/components/Form/core/formUtils';
import { loadSDK } from 'src/components/Form/core/utils';
import {
  getDefaultLayout,
  getEnumType,
  isLightColor,
  reorderComponents,
  replaceColor,
} from 'src/pages/customPage/util';
import { insertPortal } from 'src/pages/customPage/util';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { getTranslateInfo } from 'src/utils/app';
import { compatibleMDJS } from 'src/utils/project';
import AppPermissions from '../components/AppPermissions';
import Back from '../components/Back';
import LinkageBtn from './LinkageBtn';
import { updateFilterComponents } from './redux/actions';
import WidgetDisplay from './WidgetDisplay';

const getLayout = components =>
  components.map((item = {}, index) => {
    const { id } = item;
    const { layout, titleVisible } = item.mobile;
    const layoutType = 'mobile';
    return layout
      ? { ...layout, i: `${id || index}` }
      : { ...getDefaultLayout({ components, index, layoutType, titleVisible }), i: `${id || index}` };
  });

const LayoutContent = styled.div`
  .widgetContent {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 3px;
    overflow: auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
    &.haveTitle {
      height: calc(100% - 40px);
    }
    &.filter,
    &.tabs {
      overflow: inherit;
      box-shadow: none;
      background-color: transparent !important;
    }
    &.richText {
      box-shadow: none;
      background: transparent !important;
    }
  }
  .componentTitle {
    height: 32px;
    line-height: 32px;
    margin-bottom: 4px;
    font-size: 16px;
    color: var(--title-color);
  }
`;

const EmptyData = styled.div`
  .iconWrap {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    margin: 0 auto;
    background-color: #e6e6e6;
    text-align: center;
    padding-top: 35px;
    i {
      font-size: 60px;
      color: #bdbdbd;
    }
  }
`;

@AppPermissions
export default class CustomPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      apk: {},
      pageComponents: [],
      pageConfig: {},
      pageName: '',
      urlTemplate: '',
    };
  }
  componentDidMount() {
    this.getPage(this.props);
    this.getPageInfo(this.props);
    if (!window.isMingDaoApp) {
      workflowPushSoket();
    }
    loadSDK();
  }
  componentWillReceiveProps(nextProps) {
    const { params: newParams } = nextProps.match;
    const { params } = this.props.match;
    if (newParams.worksheetId !== params.worksheetId) {
      this.getPage(nextProps);
      this.getPageInfo(nextProps);
    }
  }
  componentWillUnmount() {
    $(window).off('orientationchange');
    if (!window.IM) return;
    IM.socket.off('workflow_push');
    IM.socket.off('workflow');
  }
  getPage(props) {
    const { params } = props.match;
    const { appNaviStyle, appSection = [] } = props;
    let currentNavWorksheetId = localStorage.getItem('currentNavWorksheetId');
    let currentNavWorksheetInfo =
      currentNavWorksheetId &&
      localStorage.getItem(`currentNavWorksheetInfo-${currentNavWorksheetId}`) &&
      JSON.parse(localStorage.getItem(`currentNavWorksheetInfo-${currentNavWorksheetId}`));
    if (appNaviStyle === 2 && currentNavWorksheetInfo) {
      const components = (currentNavWorksheetInfo || {}).components || [];
      const pageComponents = reorderComponents(components);
      const newPageComponents = (pageComponents ? pageComponents : components).filter(item => item.mobile.visible);
      this.setState({
        pageComponents: newPageComponents,
        loading: false,
        pageName: currentNavWorksheetInfo.name,
      });
      store.dispatch(updateFilterComponents(newPageComponents.filter(item => item.value && item.type === 6)));
    } else {
      this.setState({ loading: true });
      customApi
        .getPage({
          appId: params.worksheetId,
        })
        .then(result => {
          compatibleMDJS('workItemInfo', { item: result });
          if (appNaviStyle === 2) {
            let navSheetList = _.flatten(
              appSection.map(item => {
                item.workSheetInfo.forEach(sheet => {
                  sheet.appSectionId = item.appSectionId;
                });
                return item.workSheetInfo;
              }),
            )
              .filter(item => [1, 3].includes(item.status) && !item.navigateHide) //左侧列表状态为1 且 角色权限没有设置隐藏
              .slice(0, 4);
            navSheetList.forEach(item => {
              if (item.workSheetId === params.worksheetId) {
                safeLocalStorageSetItem(`currentNavWorksheetInfo-${params.worksheetId}`, JSON.stringify(result));
              }
            });
          }
          const components = result.components;
          const pageComponents = reorderComponents(components);
          const newPageComponents = (pageComponents ? pageComponents : components).filter(item => item.mobile.visible);
          this.setState({
            apk: result.apk || {},
            pageComponents: newPageComponents,
            loading: false,
            pageName: result.name,
            pageConfig: replaceColor(result.config || {}, _.get(result.apk, 'iconColor')),
          });
          store.dispatch(updateFilterComponents(newPageComponents.filter(item => item.value && item.type === 6)));
        });
    }
    $(window).bind('orientationchange', () => {
      location.reload();
    });
  }
  getPageInfo(props) {
    const { params } = props.match;
    homeAppApi
      .getPageInfo({
        appId: params.appId,
        groupId: params.groupId,
        id: params.worksheetId,
      })
      .then(data => {
        this.setState({
          pageName: data.name,
          urlTemplate: data.urlTemplate,
        });
      });
  }
  renderLoading() {
    return (
      <div className="flexRow justifyContentCenter alignItemsCenter h100">
        <SpinLoading color="primary" />
      </div>
    );
  }
  renderWithoutData() {
    return (
      <div className="flexRow justifyContentCenter alignItemsCenter h100">
        <EmptyData>
          <div className="iconWrap">
            <i className="icon-widgets"></i>
          </div>
          <p className="Gray_75 TxtCenter mTop16">{_l('没有内容')}</p>
        </EmptyData>
      </div>
    );
  }
  renderContent() {
    const { apk, pageConfig } = this.state;
    const allPageComponents = this.state.pageComponents;
    const pageComponents = this.state.pageComponents.filter(c => !c.sectionId);
    const { params } = this.props.match;
    const layout = getLayout(pageComponents);
    const bgIsDark = pageConfig.pageBgColor && !isLightColor(pageConfig.pageBgColor);
    const widgetIsDark = pageConfig.widgetBgColor && !isLightColor(pageConfig.widgetBgColor);
    return (
      <div
        style={{
          backgroundColor: pageConfig.pageBgColor,
          '--title-color': bgIsDark ? '#ffffffcc' : '#333',
          '--icon-color': bgIsDark ? '#ffffffcc' : '#9e9e9e',
          '--bg-color': bgIsDark ? '#e6e6e633' : '#e6e6e6',
          '--widget-color': pageConfig.widgetBgColor,
          '--widget-title-color': widgetIsDark ? '#ffffffcc' : '#333',
          '--widget-icon-color': widgetIsDark ? '#ffffffcc' : '#9e9e9e',
          '--widget-icon-hover-color': widgetIsDark ? '#ffffff' : '#1677ff',
          '--app-primary-color': apk.iconColor,
        }}
      >
        <GridLayout
          width={document.documentElement.clientWidth}
          className="layout"
          cols={2}
          rowHeight={40}
          margin={[10, 10]}
          isDraggable={false}
          isResizable={false}
          draggableCancel=".componentTitle"
          layout={layout}
        >
          {pageComponents.map((widget, index) => {
            const { id, type } = widget;
            const { title, titleVisible } = widget.mobile;
            const componentType = getEnumType(type);
            const isTransparent =
              (componentType === 'analysis' && _.get(widget, 'config.showType') === 1) ||
              (componentType === 'card' && _.get(widget, 'componentConfig.showType') === 1);
            const translateInfo = getTranslateInfo(
              apk.appId,
              null,
              componentType === 'analysis' ? widget.value : widget.id,
            );
            const widgetConfig = {
              ...pageConfig,
              originWidgetBgColor: pageConfig.widgetBgColor,
              widgetBgColor: isTransparent ? 'transparent' : pageConfig.widgetBgColor,
            };
            return (
              <LayoutContent key={`${id || index}`} className="resizableWrap">
                {titleVisible && (
                  <div className="componentTitle overflow_ellipsis bold">{translateInfo.mobileTitle || title}</div>
                )}
                <div
                  className={cx('widgetContent', componentType, { haveTitle: titleVisible })}
                  style={{
                    backgroundColor: widgetConfig.widgetBgColor,
                  }}
                >
                  <WidgetDisplay
                    pageComponents={allPageComponents}
                    pageConfig={widgetConfig}
                    componentType={componentType}
                    widget={widget}
                    apk={apk}
                    ids={{
                      appId: params.appId,
                      groupId: params.groupId,
                      worksheetId: params.worksheetId,
                    }}
                    updateComponents={newComponents => {
                      this.setState({
                        pageComponents: newComponents,
                      });
                    }}
                  />
                </div>
              </LayoutContent>
            );
          })}
        </GridLayout>
      </div>
    );
  }
  renderUrlTemplate() {
    const { params } = this.props.match;
    const { urlTemplate } = this.state;
    const dataSource = transferValue(urlTemplate);
    const urlList = [];
    dataSource.map(o => {
      if (o.staticValue) {
        urlList.push(o.staticValue);
      } else {
        urlList.push(
          getEmbedValue(
            {
              // projectId: appPkg.projectId,
              appId: params.appId,
              groupId: params.groupId,
              worksheetId: params.worksheetId,
            },
            o.cid,
          ),
        );
      }
    });
    const url = urlList.join('');
    return (
      <div className="h100 w100">
        <iframe className="w100 h100" style={{ border: 'none' }} src={insertPortal(url)} />
      </div>
    );
  }
  render() {
    const { pageTitle, appNaviStyle } = this.props;
    const { pageComponents, loading, pageName, apk, urlTemplate } = this.state;
    return (
      <WaterMark projectId={apk.projectId}>
        <div id="componentsWrap" className="h100 w100 GrayBG" style={{ overflowY: 'auto' }}>
          <DocumentTitle title={pageTitle || pageName || _l('自定义页面')} />
          {urlTemplate
            ? this.renderUrlTemplate()
            : loading
              ? this.renderLoading()
              : pageComponents.length
                ? this.renderContent()
                : this.renderWithoutData()}
          {!window.isMingDaoApp &&
            !(appNaviStyle === 2 && location.href.includes('mobile/app') && md.global.Account.isPortal) &&
            !_.get(window, 'shareState.shareId') &&
            !location.href.includes('embed/page') && (
              <Back
                style={{ bottom: appNaviStyle === 2 ? '70px' : '20px' }}
                className="low"
                icon={appNaviStyle === 2 && location.href.includes('mobile/app') ? 'home' : 'back'}
                onClick={() => {
                  if (appNaviStyle === 2 && location.href.includes('mobile/app')) {
                    window.mobileNavigateTo('/mobile/dashboard');
                    return;
                  }
                  const { params } = this.props.match;
                  window.mobileNavigateTo(`/mobile/app/${params.appId}`);
                }}
              />
            )}
          <LinkageBtn />
        </div>
      </WaterMark>
    );
  }
}

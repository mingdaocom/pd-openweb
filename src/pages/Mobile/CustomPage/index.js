import React, { Component } from 'react';
import cx from 'classnames';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { WaterMark } from 'ming-ui';
import Back from '../components/Back';
import styled from 'styled-components';
import customApi from 'statistics/api/custom';
import homeAppApi from 'src/api/homeApp';
import DocumentTitle from 'react-document-title';
import GridLayout from 'react-grid-layout';
import { getDefaultLayout, getEnumType, reorderComponents, replaceColor, filterSuspensionAiComponent, getSuspensionAiComponent } from 'src/pages/customPage/util';
import { loadSDK } from 'src/components/newCustomFields/tools/utils';
import WidgetDisplay from './WidgetDisplay';
import AppPermissions from '../components/AppPermissions';
import workflowPushSoket from 'mobile/components/socket/workflowPushSoket';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { getEmbedValue } from 'src/components/newCustomFields/tools/utils.js';
import store from 'redux/configureStore';
import { updateFilterComponents } from './redux/actions';
import AiContent from './AiContent';
import LinkageBtn from './LinkageBtn';
import 'react-grid-layout/css/styles.css';
import _ from 'lodash';

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
    &.filter {
      overflow: inherit;
      box-shadow: none;
      background-color: transparent;
    }
  }
  .componentTitle {
    height: 32px;
    line-height: 32px;
    margin-bottom: 4px;
    font-size: 16px;
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
            pageConfig: replaceColor(result.config, _.get(result.apk, 'iconColor'))
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
    homeAppApi.getPageInfo({
      appId: params.appId,
      groupId: params.groupId,
      id: params.worksheetId,
    }).then(data => {
      this.setState({
        pageName: data.name,
        urlTemplate: data.urlTemplate
      });
    });
  }
  renderLoading() {
    return (
      <Flex justify="center" align="center" className="h100">
        <ActivityIndicator size="large" />
      </Flex>
    );
  }
  renderWithoutData() {
    return (
      <Flex justify="center" align="center" className="h100">
        <EmptyData>
          <div className="iconWrap">
            <i className="icon-custom_widgets"></i>
          </div>
          <p className="Gray_75 TxtCenter mTop16">{_l('没有内容')}</p>
        </EmptyData>
      </Flex>
    );
  }
  renderContent() {
    const { apk, pageConfig } = this.state;
    const pageComponents = filterSuspensionAiComponent(this.state.pageComponents);
    const { params } = this.props.match;
    const layout = getLayout(pageComponents);
    return (
      <GridLayout
        width={document.documentElement.clientWidth}
        className="layout mBottom30"
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
          return (
            <LayoutContent key={`${id || index}`} className="resizableWrap">
              {titleVisible && <div className="componentTitle overflow_ellipsis Gray bold">{title}</div>}
              <div className={cx('widgetContent', componentType, { haveTitle: titleVisible })}>
                <WidgetDisplay
                  pageComponents={pageComponents}
                  pageConfig={pageConfig}
                  componentType={componentType}
                  widget={widget}
                  apk={apk}
                  ids={{
                    appId: params.appId,
                    groupId: params.groupId,
                    worksheetId: params.worksheetId,
                  }}
                />
              </div>
            </LayoutContent>
          );
        })}
      </GridLayout>
    );
  }
  renderUrlTemplate() {
    const { params } = this.props.match;
    const { urlTemplate } = this.state;
    const dataSource = transferValue(urlTemplate);
    const urlList = [];
    dataSource.map(o => {
      if (!!o.staticValue) {
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
    return (
      <div className="h100 w100">
        <iframe className="w100 h100" style={{ border: 'none' }} src={urlList.join('')} />
      </div>
    );
  }
  render() {
    const { pageTitle, appNaviStyle } = this.props;
    const { pageComponents, loading, pageName, apk, urlTemplate } = this.state;
    const suspensionAi = getSuspensionAiComponent(pageComponents);
    return (
      <WaterMark projectId={apk.projectId}>
        <div id="componentsWrap" className="h100 w100 GrayBG" style={{ overflowY: 'auto' }}>
          <DocumentTitle title={pageTitle || pageName || _l('自定义页面')} />
          {urlTemplate ? (
            this.renderUrlTemplate()
          ) : (
            loading ? this.renderLoading() : pageComponents.length ? this.renderContent() : this.renderWithoutData()
          )}
          {suspensionAi && (
            <AiContent widget={suspensionAi} />
          )}
          {!window.isMingDaoApp && !(appNaviStyle === 2 && location.href.includes('mobile/app') && md.global.Account.isPortal) && !_.get(window, 'shareState.shareId') && (
            <Back
              style={{ bottom: appNaviStyle === 2 ? '70px' : '20px' }}
              className="low"
              icon={appNaviStyle === 2 && location.href.includes('mobile/app') ? 'home' : 'back'}
              onClick={() => {
                const { params } = this.props.match;
                window.mobileNavigateTo(`/mobile/app/${params.appId}`);
              }}
            />
          )}
          <LinkageBtn isSuspensionAi={suspensionAi}/>
        </div>
      </WaterMark>
    );
  }
}

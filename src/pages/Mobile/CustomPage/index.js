import React, { Component } from 'react';
import cx from 'classnames';
import { withRouter } from 'react-router-dom';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { ScrollView } from 'ming-ui';
import Back from '../components/Back';
import styled from 'styled-components';
import customApi from 'src/pages/worksheet/common/Statistics/api/custom';
import DocumentTitle from 'react-document-title';
import GridLayout from 'react-grid-layout';
import { getDefaultLayout } from 'src/pages/customPage/util';
import WidgetDisplay from './WidgetDisplay';
import AppPermissions from '../components/AppPermissions';
import 'react-grid-layout/css/styles.css';

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
  }
  .componentTitle {
    height: 32px;
    line-height: 32px;
    margin-bottom: 4px;
    font-size: 16px;
  }
`;

@withRouter
@AppPermissions
export default class CustomPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      apk: {},
      pageComponents: [],
      pagName: '',
    };
  }
  componentDidMount() {
    this.getPage(this.props);
  }
  componentWillReceiveProps(nextProps) {
    const { params: newParams } = nextProps.match;
    const { params } = this.props.match;
    if (newParams.worksheetId !== params.worksheetId) {
      this.getPage(nextProps);
    }
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
      this.setState({
        pageComponents: ((currentNavWorksheetInfo || {}).components || []).filter(item => item.mobile.visible),
        loading: false,
        pagName: currentNavWorksheetInfo.name,
      });
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
              .filter(item => item.status === 1 && !item.navigateHide) //左侧列表状态为1 且 角色权限没有设置隐藏
              .slice(0, 4);
            navSheetList.forEach(item => {
              if (item.workSheetId === params.worksheetId) {
                localStorage.setItem(`currentNavWorksheetInfo-${params.worksheetId}`, JSON.stringify(result));
              }
            });
          }
          this.setState({
            apk: result.apk,
            pageComponents: result.components.filter(item => item.mobile.visible),
            loading: false,
            pagName: result.name,
          });
        });
    }
    $(window).bind('orientationchange', () => {
      location.reload();
    });
  }
  componentWillUnmount() {
    $(window).off('orientationchange');
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
        <div>{_l('此页面下暂无内容')}</div>
      </Flex>
    );
  }
  renderContent() {
    const { apk, pageComponents } = this.state;
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
          const { id } = widget;
          const { title, titleVisible } = widget.mobile;
          return (
            <LayoutContent key={`${id || index}`} className="resizableWrap">
              {titleVisible && <div className="componentTitle overflow_ellipsis Gray bold">{title}</div>}
              <div className={cx('widgetContent', { haveTitle: titleVisible })}>
                <WidgetDisplay
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
  render() {
    const { pageTitle } = this.props;
    const { pageComponents, loading, pagName } = this.state;
    return (
      <ScrollView className="h100 w100 GrayBG">
        <DocumentTitle title={pageTitle || pagName || _l('自定义页面')} />
        {loading ? this.renderLoading() : pageComponents.length ? this.renderContent() : this.renderWithoutData()}
        {!location.href.includes('mobile/app') && (
          <Back
            className="low"
            onClick={() => {
              const { params } = this.props.match;
              window.mobileNavigateTo(`/mobile/app/${params.appId}`);
            }}
          />
        )}
      </ScrollView>
    );
  }
}

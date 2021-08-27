import React, { Fragment, Component } from 'react';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import { Tabs, Flex, ActivityIndicator, Modal } from 'antd-mobile';
import { withRouter } from 'react-router-dom';
import homeAppAjax from 'src/api/homeApp';
import sheetAjax from 'src/api/worksheet';
import { Icon, Button } from 'ming-ui';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import SheetRows, { WithoutRows } from './SheetRows';
import Back from '../components/Back';
import PermissionsInfo from '../components/PermissionsInfo';
import FilterModal from './Filter';
import State from './State';
import { VIEW_TYPE_ICON, VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import './index.less';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';

const shieldingViewType = [VIEW_DISPLAY_TYPE.board, VIEW_DISPLAY_TYPE.structure, VIEW_DISPLAY_TYPE.calendar].map(item =>
  Number(item),
);

const getCurrentViewIndex = (id, views) => {
  let index = -1;
  for (let i = 0; i < views.length; i++) {
    index++;
    if (views[i].viewId === id) {
      break;
    }
  }
  return index;
};

@withRouter
class RecordList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      filterVisible: false,
      appStatus: 1,
      switchPermit: _.object(),
    };
  }
  componentDidMount() {
    this.getApp(this.props);
  }
  navigateTo = (url, isReplace) => {
    if (window.isPublicApp && !new URL('http://z.z' + url).hash) {
      url = url + '#publicapp' + window.publicAppAuthorization;
    }
    if (isReplace) {
      this.props.history.replace(url);
    } else {
      this.props.history.push(url);
    }
  }
  getApp(props) {
    const { params } = props.match;
    homeAppAjax
      .checkApp(
        {
          appId: params.appId,
        },
        { silent: true },
      )
      .then(status => {
        this.setState({ appStatus: status });
        if (status == 1) {
          this.props.dispatch(
            actions.getSheet({
              ...params,
            }),
          );
        }
      });
    sheetAjax
      .getSwitchPermit({
        appId: params.appId,
        worksheetId: params.worksheetId,
      })
      .then(res => {
        this.setState({
          switchPermit: res,
        });
      });
  }
  componentWillReceiveProps(nextProps) {
    const { params: newParams } = nextProps.match;
    const { params } = this.props.match;
    if (newParams.viewId !== params.viewId) {
      this.props.dispatch(
        actions.changeSheetRows({
          worksheetId: params.worksheetId,
          appId: params.appId,
          viewId: newParams.viewId,
        }),
      );
    }
    if (newParams.worksheetId !== params.worksheetId) {
      actions.emptySheetRows();
      this.props.dispatch(actions.emptyWorksheetControls());
      this.getApp(nextProps);
    }
  }
  componentWillUnmount() {
    const { pathname } = this.props.history.location;
    if (pathname.indexOf('mobile/searchRecord') == -1) {
      this.props.dispatch(actions.emptyWorksheetControls());
    }
  }
  handleChangeView(view) {
    const { params } = this.props.match;
    this.navigateTo(`/mobile/recordList/${params.appId}/${params.groupId}/${params.worksheetId}/${view.viewId}`, true);
  }
  renderRows() {
    const { switchPermit } = this.state;
    const { currentSheetRows, sheetRowLoading, match, history, currentSheetInfo } = this.props;
    const currentView = currentSheetInfo.currentView || _.object();
    const { params } = match;

    if (currentView && currentView.resultCode !== 1) {
      return <State resultCode={currentView.resultCode} type="view" />;
    }

    return (
      <div className="overflowHidden flex">
        {sheetRowLoading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : (currentView ? (
            shieldingViewType.includes(currentView.viewType)
          ) : (
            false
          )) ? (
          <Flex className="withoutRows" direction="column" justify="center" align="center">
            <div className="text" style={{ width: 300, textAlign: 'center' }}>
              {_l(
                '抱歉，%0视图暂不支持，您可以通过PC端浏览器，或者移动客户端查看',
                _.find(VIEW_TYPE_ICON, { id: VIEW_DISPLAY_TYPE[currentView.viewType] }).text,
              )}
            </div>
          </Flex>
        ) : currentSheetRows.length ? (
          <Fragment>
            {this.renderSearchWrapper()}
            <SheetRows
              currentView={currentView}
              params={params}
              navigateTo={this.navigateTo}
            />
          </Fragment>
        ) : (
          <WithoutRows
            text={_l('此视图下暂无记录')}
            children={
              isOpenPermit(permitList.createButtonSwitch, switchPermit) && currentSheetInfo.allowAdd ? (
                <Button
                  className="addRecordBtn valignWrapper mTop10"
                  onClick={() => {
                    this.navigateTo(
                      `/mobile/addRecord/${params.appId}/${currentSheetInfo.worksheetId}/${currentView.viewId}`,
                    );
                  }}
                >
                  <Icon icon="add" className="Font22 White" />
                  {currentSheetInfo.entityName}
                </Button>
              ) : null
            }
          />
        )}
      </div>
    );
  }
  renderSearchWrapper() {
    const { currentSheetInfo } = this.props;
    const { currentView, appId, worksheetId } = currentSheetInfo;
    return (
      <div className="searchRowsWrapper">
        <div
          className="search"
          onClick={() => {
            this.navigateTo(`/mobile/searchRecord/${appId}/${worksheetId}/${currentView.viewId}`);
          }}
        >
          <Icon icon="h5_search" />
          <input type="text" placeholder={_l('搜索标题')} defaultValue="" />
        </div>
      </div>
    );
  }
  render() {
    const { appStatus, switchPermit } = this.state;
    const { currentSheetInfo, worksheetControls, match, currentSheetRows } = this.props;

    if (_.isEmpty(currentSheetInfo) || currentSheetInfo.resultCode !== 1 || _.isEmpty(worksheetControls)) {
      if (appStatus !== 1) {
        return <PermissionsInfo status={appStatus} isApp={false} appId={match.params.appId} />;
      }
      if (!_.isEmpty(currentSheetInfo) && currentSheetInfo.resultCode !== 1) {
        return <State type="sheet" />;
      }
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }

    const { views, currentView, name } = currentSheetInfo;
    const { params } = match;

    return (
      <div className="flexColumn h100">
        <DocumentTitle title={name} />
        <div className="viewTabs z-depth-1">
          <Tabs
            tabBarInactiveTextColor="#9e9e9e"
            tabs={views}
            page={currentView && currentView.viewId ? getCurrentViewIndex(currentView.viewId, views) : 999}
            onTabClick={view => {
              this.handleChangeView(view);
            }}
            renderTab={tab => <span>{tab.name}</span>}
          ></Tabs>
        </div>
        {this.renderRows()}
        {!location.href.includes('mobile/app') && (
          <Back
            onClick={() => {
              this.navigateTo(`/mobile/app/${params.appId}`);
            }}
          />
        )}
        {this.state.filterVisible && (
          <FilterModal
            visible={this.state.filterVisible}
            currentView={currentView}
            controls={worksheetControls}
            onHideFilter={() => {
              this.setState({ filterVisible: false });
            }}
            onSave={(sortCid, sortType) => {
              this.props.dispatch(
                actions.updateCurrentView({
                  currentView,
                  sortCid,
                  sortType,
                }),
              );
            }}
          />
        )}
        {isOpenPermit(permitList.createButtonSwitch, switchPermit) &&
        currentSheetInfo.allowAdd &&
        currentSheetRows.length &&
        !shieldingViewType.includes(currentView && currentView.viewType) ? (
          <div className="addRecordItemWrapper">
            <Button
              className="addRecordBtn flex valignWrapper"
              onClick={() => {
                this.navigateTo(
                  `/mobile/addRecord/${params.appId}/${currentSheetInfo.worksheetId}/${currentView.viewId}`,
                );
              }}
            >
              <Icon icon="add" className="Font22" />
              {currentSheetInfo.entityName}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }
}

export default connect(state => {
  const { currentSheetInfo, currentSheetRows, worksheetControls, sheetRowLoading } = state.mobile;
  return {
    currentSheetInfo,
    currentSheetRows,
    worksheetControls,
    sheetRowLoading,
  };
})(RecordList);

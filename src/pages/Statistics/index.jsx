import React, { Component, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Icon, LoadDiv, ScrollView, SortableList } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import ClickAway from 'ming-ui/components/ClickAway';
import report from './api/report';
import reportSort from './api/reportSort';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import Card from './Card';
import './index.less';

const ChartDialog = lazy(() => import('./ChartDialog'));
const ClickAwayable = ClickAway;
let globalStatisticsRoot = null;
let globalStatisticsContainer = null;
let globalStatisticsResize = null;

const exceptions = [
  '.mui-dialog-container',
  '.GlobalStatisticsPanel',
  '.dropdownTrigger',
  '.openStatisticsBtn',
  '.selectUserBox',
  '.PositionContainer-active',
  '.addFilterPopup',
  '#dialogBoxSelectUser_container',
  '#dialogSelectDept_container',
  '.ant-tooltip',
  '.ant-cascader-menus',
  '.ant-tree-select-dropdown',
  '.CityPickerPanelTrigger',
  '.ant-modal-mask',
  '.ant-modal-wrap',
  '.ant-select-dropdown',
  '.ant-dropdown',
  '.ant-dropdown-menu',
  '.ant-picker-dropdown',
  '.rc-trigger-popup',
  '#attachemntsPreviewContainer',
  '#quickSelectDept',
  '.selectRoleDialog',
  '.fullScreenMarkdown',
  '.attachmentsPreview',
  '.createRecordSideMask',
  '.mingoWrap',
  '.doNotTriggerClickAway',
];

const renderSortableItem = ({ item, DragHandle, otherProps }) => {
  return (
    <div className="StatisticsPanel-wrapper">
      <Card DragHandle={DragHandle} report={item} {...otherProps} />
    </div>
  );
};

const removeGlobalStatisticsPanel = () => {
  if (globalStatisticsResize) {
    $(window).off('resize', globalStatisticsResize);
    globalStatisticsResize.cancel && globalStatisticsResize.cancel();
    globalStatisticsResize = null;
  }

  if (globalStatisticsRoot) {
    globalStatisticsRoot.unmount();
    globalStatisticsRoot = null;
  }

  if (globalStatisticsContainer) {
    $(globalStatisticsContainer).remove();
    globalStatisticsContainer = null;
  }
};

const renderGlobalStatisticsPanel = node => {
  if (!globalStatisticsContainer || !document.body.contains(globalStatisticsContainer)) {
    globalStatisticsContainer = document.createElement('DIV');
    globalStatisticsContainer.className = 'GlobalStatisticsPanel';
    $('#container').append(globalStatisticsContainer);
  }

  if (!globalStatisticsRoot) {
    globalStatisticsRoot = createRoot(globalStatisticsContainer);
  }

  globalStatisticsRoot.render(node);
};

export default class Statistics extends Component {
  constructor(props) {
    super();
    this.isUnmounted = false;
    const isPortal = md.global.Account.isPortal;
    const showPublic = isOpenPermit(permitList.statisticsSwitch, props.sheetSwitchPermit);
    const showSelf = isOpenPermit(permitList.statisticsSelfSwitch, props.sheetSwitchPermit) && !isPortal; //外部门户只有 公共
    this.state = {
      ownerId: !showPublic ? md.global.Account.accountId : '',
      dialogVisible: false,
      loading: true,
      reports: [],
      newReport: { name: _l('未命名') },
      pageIndex: 1,
      pageLoading: false,
      showPublic,
      showSelf,
    };
  }
  componentDidMount() {
    setTimeout(this.getReportConfigList, 250);
  }
  componentWillUnmount() {
    this.isUnmounted = true;
    if (this.request) {
      this.request.abort();
    }

    if (!this.props.isFullScreen) {
      removeGlobalStatisticsPanel();
    }
  }
  handleScrollEnd = () => {
    this.getReportConfigList();
  };
  getReportConfigList = () => {
    const { worksheetId, isFullScreen } = this.props;
    const { ownerId, pageIndex, pageLoading } = this.state;
    const pageSize = isFullScreen ? 20 : 10;
    const loadingKey = pageIndex > 1 ? 'pageLoading' : 'loading';

    if ((pageIndex > 1 ? pageLoading : false) || !pageIndex) {
      return;
    }

    this.setState({
      [loadingKey]: true,
    });
    if (this.request) {
      this.request.abort();
    }

    const currentPageIndex = pageIndex;

    this.request = report.list({
      appId: worksheetId,
      isOwner: !!ownerId,
      pageIndex: currentPageIndex,
      pageSize,
    });

    this.request
      .then(result => {
        if (this.isUnmounted) {
          return;
        }

        this.setState(prevState => ({
          pageIndex: result.reports.length >= pageSize ? currentPageIndex + 1 : 0,
          reports: prevState.reports.concat(result.reports),
          [loadingKey]: false,
        }));
      })
      .catch(() => {
        if (this.isUnmounted) {
          return;
        }

        this.setState({
          [loadingKey]: false,
        });
      });
  };
  handleSwitchView = (ownerId = this.state.ownerId) => {
    this.setState(
      {
        ownerId,
        pageIndex: 1,
        reports: [],
        loading: true,
        pageLoading: false,
      },
      this.getReportConfigList,
    );
  };
  handleDelete = reportId => {
    const { reports } = this.state;
    this.setState({
      reports: reports.filter(item => item.id !== reportId),
    });
  };
  handleOpenGlobalStatisticsPanel = () => {
    const { isFullScreen } = this.props;

    if (isFullScreen) {
      removeGlobalStatisticsPanel();
    } else {
      renderGlobalStatisticsPanel(this.renderStatistics());

      if (globalStatisticsResize) {
        $(window).off('resize', globalStatisticsResize);
        globalStatisticsResize.cancel && globalStatisticsResize.cancel();
      }

      globalStatisticsResize = _.debounce(() => {
        renderGlobalStatisticsPanel(this.renderStatistics());
      }, 200);
      $(window).on('resize', globalStatisticsResize);
    }
  };
  renderStatistics = () => {
    return <Statistics {...this.props} isFullScreen={true} onClose={_.noop} />;
  };
  handleOpenChartDialog = () => {
    this.setState({ dialogVisible: true });
  };
  handleClickAway = () => {
    this.props.onClose();
  };
  handleSwitchToPublic = () => {
    this.handleSwitchView('');
  };
  handleSwitchToPersonal = () => {
    this.handleSwitchView(md.global.Account.accountId);
  };
  renderSortableListItem = options => {
    const otherProps = {
      ...this.props,
      ownerId: this.state.ownerId,
      onRemove: this.handleDelete,
    };

    return renderSortableItem({ ...options, otherProps });
  };
  handleSortEnd = newReports => {
    const { worksheetId } = this.props;
    const { reports, ownerId } = this.state;
    this.setState({
      reports: newReports,
    });
    reportSort
      .updateReportSort({
        appId: worksheetId,
        isOwner: !!ownerId,
        reportIds: newReports.map(item => item.id),
      })
      .then(
        () => {},
        () => {
          this.setState({
            reports,
          });
        },
      );
  };
  handleUpdateDialogVisible = ({ dialogVisible, isRequest }) => {
    this.setState({
      dialogVisible,
      newReport: { name: _l('未命名') },
    });
    if (isRequest) {
      this.handleSwitchView();
    }
  };
  renderHeader() {
    const { ownerId, showSelf, showPublic } = this.state;
    const { isFullScreen, isCharge } = this.props;
    return (
      <div className="StatisticsPanel-header">
        <div className="title">{!showPublic ? _l('个人统计') : !showSelf ? _l('公共统计') : _l('统计')}</div>
        {/* 功能开关权限影响 */}
        {showPublic && showSelf && (
          <div className="flexRow Relative">
            <div
              className={cx('panelTab commonality', { colorPrimary: !ownerId, active: !ownerId })}
              onClick={this.handleSwitchToPublic}
            >
              {_l('公共')}
            </div>
            <div
              className={cx('panelTab personal', {
                colorPrimary: ownerId,
                active: ownerId,
              })}
              onClick={this.handleSwitchToPersonal}
            >
              {_l('个人')}
            </div>
          </div>
        )}
        <div className="flexRow btns">
          {(isCharge || ownerId) && (
            <Tooltip title={ownerId ? _l('新建个人图表') : _l('新建公共图表')} placement="bottom">
              <Icon onClick={this.handleOpenChartDialog} icon="plus" className="hoverColorPrimary textTertiary" />
            </Tooltip>
          )}
          <Tooltip title={isFullScreen ? _l('小屏') : _l('全屏')} placement="bottom">
            <Icon
              onClick={this.handleOpenGlobalStatisticsPanel}
              icon={isFullScreen ? 'worksheet_narrow' : 'worksheet_enlarge'}
              className="hoverColorPrimary textTertiary"
            />
          </Tooltip>
        </div>
      </div>
    );
  }
  renderContent() {
    const { reports, pageLoading } = this.state;
    return (
      <ScrollView className="flex" onScrollEnd={this.handleScrollEnd}>
        <div className="StatisticsPanel-content">
          <div className="StatisticsPanel-cards">
            <SortableList
              useDragHandle
              dragPreviewImage
              itemKey="id"
              items={reports}
              renderItem={this.renderSortableListItem}
              onSortEnd={this.handleSortEnd}
            />
          </div>
          {pageLoading ? <LoadDiv /> : null}
        </div>
      </ScrollView>
    );
  }
  renderCommonalityNoData() {
    const { roleType } = this.props;
    const { ownerId } = this.state;
    return (
      <div className="StatisticsPanel-nodata">
        <Icon icon="worksheet_public" />
        <div className="prompt Font17 TxtCenter mBottom12">
          {_l('自由定义图表，支持数量或数值统计、维度或周期对比、数据透视等多种分析')}
        </div>
        <div className="prompt Font14 TxtCenter">{_l('管理员可把个人图表转为公共，供成员一同使用')}</div>
        {(roleType === 1 || roleType === 2 || ownerId) && (
          <Button onClick={this.handleOpenChartDialog} type="primary">
            {_l('创建图表')}
          </Button>
        )}
      </div>
    );
  }
  renderPersonageNoData() {
    return (
      <div className="StatisticsPanel-nodata">
        <Icon icon="person" />
        <div className="prompt Font17 TxtCenter">{_l('还没有个人图表')}</div>
        <Button onClick={this.handleOpenChartDialog} type="primary" className="mTop24">
          {_l('创建图表')}
        </Button>
      </div>
    );
  }
  render() {
    const { dialogVisible, newReport, loading, reports, ownerId } = this.state;
    const { worksheetId, viewId, appId, projectId, permissionType } = this.props;
    return (
      <div className="StatisticsPanel">
        <ClickAwayable onClickAway={this.handleClickAway} onClickAwayExceptions={exceptions}>
          {this.renderHeader()}
          {loading ? (
            <div className="StatisticsPanel-nodata">
              <LoadDiv />
            </div>
          ) : reports.length ? (
            this.renderContent()
          ) : ownerId ? (
            this.renderPersonageNoData()
          ) : (
            this.renderCommonalityNoData()
          )}
          {dialogVisible ? (
            <Suspense fallback={null}>
              <ChartDialog
                appType={1}
                worksheetId={worksheetId}
                viewId={ownerId ? viewId : null}
                appId={appId}
                projectId={projectId}
                settingVisible={true}
                ownerId={ownerId}
                permissions={true}
                permissionType={permissionType}
                report={newReport}
                updateDialogVisible={this.handleUpdateDialogVisible}
              />
            </Suspense>
          ) : null}
        </ClickAwayable>
      </div>
    );
  }
}

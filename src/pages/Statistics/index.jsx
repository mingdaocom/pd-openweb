import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Icon, LoadDiv, ScrollView, SortableList } from 'ming-ui';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import report from './api/report';
import reportSort from './api/reportSort';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import Card from './Card';
import ChartDialog from './ChartDialog';
import './index.less';

const ClickAwayable = createDecoratedComponent(withClickAway);
let root;
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
  '.Tooltip-wrapper',
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
];

const renderSortableItem = ({ item, DragHandle, otherProps }) => {
  return (
    <div className="StatisticsPanel-wrapper">
      <Card DragHandle={DragHandle} report={item} {...otherProps} />
    </div>
  );
};

export default class Statistics extends Component {
  constructor(props) {
    super();
    const isPortal = md.global.Account.isPortal;
    const showPublic = isOpenPermit(permitList.statisticsSwitch, props.sheetSwitchPermit);
    const showSelf = isOpenPermit(permitList.statisticsSelfSwitch, props.sheetSwitchPermit) && !isPortal; //外部门户只有 公共
    this.state = {
      ownerId: !showPublic ? md.global.Account.accountId : '',
      dialogVisible: false,
      loading: true,
      reports: [],
      newReport: { name: _l('未命名') },
      chartWidth: 0,
      pageIndex: 1,
      pageLoading: false,
      showPublic,
      showSelf,
    };
  }
  componentDidMount() {
    setTimeout(this.getReportConfigList.bind(this), 250);
  }
  componentWillReceiveProps() {
    this.setState({
      chartWidth: window.innerWidth - 230 - 120,
    });
  }
  componentWillUnmount() {
    const el = document.querySelector('.GlobalStatisticsPanel');
    if (!el) return;
    root && root.unmount();
    $(el).remove();
    $(window).off('resize', window.statisticsResize);
  }
  handleScrollEnd() {
    this.getReportConfigList();
  }
  getReportConfigList() {
    const { worksheetId, isFullScreen } = this.props;
    const { ownerId, pageIndex, reports, pageLoading } = this.state;
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
    this.request = report.list({
      appId: worksheetId,
      isOwner: !!ownerId,
      pageIndex,
      pageSize: isFullScreen ? 20 : 10,
    });
    this.request.then(result => {
      this.setState({
        pageIndex: result.reports.length >= 10 ? pageIndex + 1 : 0,
        reports: reports.concat(result.reports),
        [loadingKey]: false,
        chartWidth: window.innerWidth - 230 - 120,
      });
    });
  }
  handleSwitchView(ownerId = this.state.ownerId) {
    this.setState(
      {
        ownerId,
        pageIndex: 1,
        reports: [],
        loading: false,
      },
      this.getReportConfigList,
    );
  }
  handleDelete(reportId) {
    const { reports } = this.state;
    this.setState({
      reports: reports.filter(item => item.id !== reportId),
    });
  }
  handleOpenGlobalStatisticsPanel() {
    const { isFullScreen } = this.props;
    if (isFullScreen) {
      const el = document.querySelector('.GlobalStatisticsPanel');
      root && root.unmount();
      $(el).remove();
      $(window).off('resize', window.statisticsResize);
    } else {
      const div = document.createElement('DIV');
      div.className = 'GlobalStatisticsPanel';
      $('#container').append(div);

      root = createRoot(document.querySelector('.GlobalStatisticsPanel'));
      root.render(this.renderStatistics());

      window.statisticsResize = _.debounce(() => {
        root = createRoot(document.querySelector('.GlobalStatisticsPanel'));
        root.render(this.renderStatistics());
      }, 200);
      $(window).on('resize', window.statisticsResize);
    }
  }
  renderStatistics() {
    return <Statistics {...this.props} isFullScreen={true} onClose={_.noop} />;
  }
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
  handleUpdateDialogVisible({ dialogVisible, isRequest }) {
    this.setState({
      dialogVisible,
      newReport: { name: _l('未命名') },
    });
    if (isRequest) {
      this.handleSwitchView();
    }
  }
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
              className={cx('panelTab commonality', { ThemeColor3: !ownerId, active: !ownerId })}
              onClick={this.handleSwitchView.bind(this, '')}
            >
              {_l('公共')}
            </div>
            <div
              className={cx('panelTab personal', {
                ThemeColor3: ownerId,
                active: ownerId,
              })}
              onClick={this.handleSwitchView.bind(this, md.global.Account.accountId)}
            >
              {_l('个人')}
            </div>
          </div>
        )}
        <div className="flexRow btns">
          {(isCharge || ownerId) && (
            <Tooltip title={ownerId ? _l('新建个人图表') : _l('新建公共图表')} placement="bottom">
              <Icon
                onClick={() => {
                  this.setState({ dialogVisible: true });
                }}
                icon="plus"
                className="ThemeHoverColor3 Gray_9e"
              />
            </Tooltip>
          )}
          <Tooltip title={isFullScreen ? _l('小屏') : _l('全屏')} placement="bottom">
            <Icon
              onClick={this.handleOpenGlobalStatisticsPanel.bind(this)}
              icon={isFullScreen ? 'worksheet_narrow' : 'worksheet_enlarge'}
              className="ThemeHoverColor3 Gray_9e"
            />
          </Tooltip>
        </div>
      </div>
    );
  }
  renderContent() {
    const { isFullScreen, ...other } = this.props;
    const { reports, chartWidth, ownerId, pageLoading } = this.state;
    const otherProps = {
      ...other,
      ownerId,
      onRemove: this.handleDelete.bind(this),
    };
    const width = isFullScreen ? chartWidth : '';
    return (
      <ScrollView className="flex" onScrollEnd={this.handleScrollEnd.bind(this)}>
        <div className="StatisticsPanel-content">
          <div className="StatisticsPanel-cards" style={{ width }}>
            <SortableList
              useDragHandle
              dragPreviewImage
              itemKey="id"
              items={reports}
              renderItem={options => renderSortableItem({ ...options, otherProps })}
              onSortEnd={this.handleSortEnd}
            />
            {width &&
              Array.from({ length: 6 }).map((item, index) => (
                <div key={index} className="StatisticsPanel-wrapper statisticsCard-empty">
                  <div className="statisticsCard" />
                </div>
              ))}
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
          <Button
            onClick={() => {
              this.setState({ dialogVisible: true });
            }}
            type="primary"
          >
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
        <Button
          onClick={() => {
            this.setState({ dialogVisible: true });
          }}
          type="primary"
          className="mTop24"
        >
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
        <ClickAwayable onClickAway={this.props.onClose.bind(this)} onClickAwayExceptions={exceptions}>
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
              updateDialogVisible={this.handleUpdateDialogVisible.bind(this)}
            />
          ) : null}
        </ClickAwayable>
      </div>
    );
  }
}

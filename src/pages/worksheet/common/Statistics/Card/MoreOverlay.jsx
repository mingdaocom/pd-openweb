import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, Dialog } from 'ming-ui';
import { reportTypes } from '../Charts/common';
import { exportExcel } from '../common';
import ShareDialog from '../components/ShareDialog';
import PageMove from '../components/PageMove';
import reportConfig from '../api/reportConfig';
import { Dropdown, Menu, Divider } from 'antd';
import { connect } from 'react-redux';
import reportApi from 'src/pages/worksheet/common/Statistics/api/report';

const confirm = Dialog.confirm;

@connect(
  state => ({
    ..._.pick(state.sheet, ['isCharge']),
  })
)
export default class MoreOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shareVisible: false,
      showPageMove: false
    }
  }
  handleExportExcel = () => {
    const { report, worksheetId, exportData } = this.props;
    const { filters = [] } = exportData;
    reportApi.export({
      reportId: report.id,
      pageId: worksheetId,
      filters: filters.length ? [filters] : undefined
    }).then(result => {
      if (!result) {
        alert(_l('导出错误'), 2);
      }
    }).fail(error => {
      alert(error, 2);
    });
  }
  handleDelete = () => {
    const { id, name } = this.props.report;
    confirm({
      title: <span className="Red">{_l('您确定要删除表“%0” ?', name)}</span>,
      onOk: () => {
        reportConfig.deleteReport({
          reportId: id,
        }).then(result => {
          this.props.onRemove(id);
        });
      },
    });
  }
  handleUpdateOwnerId = () => {
    const { ownerId, report } = this.props;
    reportConfig.updateOwnerId({
        ownerId: ownerId ? '' : md.global.Account.accountId,
        reportId: report.id,
    }).then(result => {
      if (result) {
        alert(_l('移出成功'));
        this.props.onRemove(report.id);
      }
    });
  }
  renderOverlay() {
    const {
      reportType,
      report,
      ownerId,
      isMove,
      isCharge,
      permissions,
      onOpenFilter,
      onOpenSetting,
      onRemove
    } = this.props;
    const isSheetView = ![reportTypes.PivotTable, reportTypes.NumberChart].includes(reportType);
    return (
      <Menu className="chartMenu" style={{ width: 180 }}>
        {onOpenSetting && (
          <Menu.Item className="pLeft10" onClick={onOpenSetting}>
            <div className="flexRow valignWrapper">
              <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="settings" />
              <span>{_l('设置')}</span>
            </div>
          </Menu.Item>
        )}
        {onOpenFilter && (
          <Menu.Item className="pLeft10" onClick={onOpenFilter}>
            <div className="flexRow valignWrapper">
              <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="filter" />
              <span>{_l('筛选')}</span>
            </div>
          </Menu.Item>
        )}
        {!md.global.Account.isPortal && (
          <Menu.Item
            className="pLeft10"
            onClick={() => {
              this.setState({ shareVisible: true });
            }}
          >
            <div className="flexRow valignWrapper">
              <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="share" />
              <span>{_l('分享')}</span>
            </div>
          </Menu.Item>
        )}
        {reportTypes.NumberChart !== reportType && (
          <Menu.Item
            className="pLeft10"
            onClick={this.handleExportExcel}
          >
            <div className="flexRow valignWrapper">
              <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="file_download" />
              <span>{_l('导出Excel')}</span>
            </div>
          </Menu.Item>
        )}
        {isMove && isCharge && (
          <Fragment>
            <Divider className="mTop5 mBottom5" />
            <Menu.Item
              className="pLeft10"
              onClick={this.handleUpdateOwnerId}
            >
              <div className="flexRow valignWrapper">
                <Icon className="Gray_9e Font18 mLeft5 mRight5" icon={ownerId ? 'worksheet_public' : 'minus-square'} />
                <span>{ownerId ? _l('转为公共图表') : _l('从公共中移出')}</span>
              </div>
            </Menu.Item>
            <Menu.Item
              className="pLeft10"
              onClick={() => {
                this.setState({ showPageMove: true });
              }}
            >
              <div className="flexRow valignWrapper">
                <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="content-copy" />
                <span>{_l('复制到自定义页面')}</span>
              </div>
            </Menu.Item>
          </Fragment>
        )}
        {onRemove && (
          <Fragment>
            <Divider className="mTop5 mBottom5" />
            <Menu.Item className="pLeft10" onClick={this.handleDelete}>
              <div className="flexRow valignWrapper">
                <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="task-new-delete" />
                <span>{_l('删除')}</span>
              </div>
            </Menu.Item>
          </Fragment>
        )}
      </Menu>
    );
  }
  render() {
    const { shareVisible, showPageMove } = this.state;
    const { report, className, permissions, appId, isCharge, getPopupContainer } = this.props;
    return (
      <Fragment>
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          getPopupContainer={getPopupContainer}
          overlay={this.renderOverlay()}
        >
          <Icon className={className} icon="more_horiz" />
        </Dropdown>
        <ShareDialog
          title={_l('分享统计图: %0', report.name)}
          isCharge={permissions || isCharge}
          sourceId={report.id}
          visible={shareVisible}
          onCancel={() => {
            this.setState({ shareVisible: false });
          }}
        />
        {showPageMove && (
          <PageMove
            appId={appId}
            reportId={report.id}
            onCancel={() => {
              this.setState({ showPageMove: false });
            }}
          />
        )}
      </Fragment>
    );
  }
}


import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import './index.less';
import cx from 'classnames';
import { Tooltip, Popover } from 'antd';
import WorkflowInfo from './WorkflowInfo';
import { updateProcess, updatePublishState } from '../../redux/actions';
import process from '../../api/process';
import Switch from '../../components/Switch';
import { Button, Icon, Checkbox } from 'ming-ui';
import DialogBase from 'ming-ui/components/Dialog/DialogBase';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import PublishErrorDialog from '../../components/PublishErrorDialog';
import { APP_TYPE } from '../enum';
import { selectRecord } from 'src/components/recordCardListDialog';
import sheetAjax from 'src/api/worksheet';
import systemFieldsPNG from './images/systemFields.png';
import flowPNG from './images/flow.png';
import _ from 'lodash';
import moment from 'moment';

const TABS_OPTS = [
  { tabIndex: 1, name: _l('流程') },
  { tabIndex: 3, name: _l('配置') },
  { tabIndex: 2, name: _l('历史') },
];

class Header extends Component {
  static defaultProps = {
    tabIndex: 1,
    switchTabs: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      showPublishDialog: false,
      publishErrorVisible: false,
      errorInfo: {},
      isProgressing: false,
      data: {},
      showApprovalFields: false,
      showApprovalDetail: false,
    };
  }

  componentDidMount() {
    const that = this;

    $('.AppAdminWorkflowEdit').on('click', '.publishDialogOpenHistory', () => {
      that.props.switchTabs(2);
      that.setState({ showPublishDialog: false });
    });
  }

  /**
   * 修改流程基本信息
   */
  updateProcess = opts => {
    const { flowInfo } = this.props;

    this.props.dispatch(updateProcess(flowInfo.companyId, flowInfo.id, opts.name, opts.explain));
    this.setState({ visible: false });
  };

  /**
   * 开启关闭流程
   */
  switchStatus = () => {
    const { flowInfo } = this.props;
    this.publishOrCloseFlow(!flowInfo.enabled);
  };

  /**
   * 发布或关闭工作流
   */
  publishOrCloseFlow = (isPublish = true) => {
    const { flowInfo } = this.props;
    const unpublished = !flowInfo.lastPublishDate;

    this.props.dispatch(updatePublishState({ pending: true }));

    process
      .publish({ isPublish, processId: flowInfo.id })
      .then(result => {
        // 关闭
        if (!isPublish) {
          this.props.dispatch(updatePublishState({ pending: false, enabled: false }));
        } else {
          if (result.isPublish) {
            this.props.dispatch(
              updatePublishState({
                pending: false,
                enabled: true,
                publish: true,
                lastPublishDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                publishStatus: 2,
                startAppId: result.process.startNode.appId,
              }),
            );

            // 未发布
            if (unpublished) {
              setTimeout(() => {
                this.setState({ showPublishDialog: true, data: result });
              }, 300);
            }
          } else {
            this.props.dispatch(updatePublishState({ pending: false }));
            this.setState({ publishErrorVisible: true, errorInfo: result });
          }
        }
      })
      .fail(state => {
        this.props.dispatch(updatePublishState({ state, pending: false }));
      });
  };

  /**
   * 错误节点居中显示
   */
  errorNodeCenter() {
    setTimeout(() => {
      const { errorInfo } = this.state;
      const { errorNodeIds, errorNodeMap } = errorInfo;
      const firstNodeId = errorNodeIds[0];
      let $el;

      if (!errorNodeMap[firstNodeId]) {
        $el = $(`.workflowBox[data-id=${firstNodeId}]`);
      } else {
        $el = $(`.approvalProcessBoxBox[data-id=${firstNodeId}]`).find(
          `.workflowBox[data-id=${errorNodeMap[firstNodeId][0]}]`,
        );
      }

      if (!$el.length) return;

      const { top, left } = $el.offset();
      const $box = $('.workflowSettings .workflowEdit');
      const scrollTop = $box.scrollTop();
      const scrollLeft = $box.scrollLeft();

      $box.scrollTop(scrollTop + top - $box.height() / 2 + $el.height() / 2 - 30);
      $box.scrollLeft(scrollLeft + left - $box.width() / 2 + $el.width() / 2);
    }, 1000);
  }

  /**
   * 返回
   */
  back = () => {
    const { workflowDetail, flowInfo } = this.props;
    let { onBack } = this.props;
    const { startEventId, flowNodeMap } = workflowDetail;
    const noSelectWorksheet =
      startEventId &&
      (flowNodeMap[startEventId].appType === APP_TYPE.SHEET || flowNodeMap[startEventId].appType === APP_TYPE.DATE) &&
      !flowNodeMap[startEventId].appId;

    if (!onBack) {
      onBack = () => {
        location.href = `/app/${flowInfo.relationId}/workflow`;
      };
    }

    if (noSelectWorksheet) {
      Confirm({
        className: 'leaveWorkflowConfirm',
        title: _l('是否放弃保存工作流？'),
        description: _l('未设置触发方式的工作流将不会被保存'),
        okText: _l('放弃保存'),
        onOk: () => onBack(flowInfo.enabled),
      });
    } else {
      onBack(flowInfo.enabled);
    }
  };

  /**
   * 恢复
   */
  handleRestoreVisible = () => {
    const { flowInfo } = this.props;

    Confirm({
      title: _l('确定恢复到当前版本吗？'),
      description: _l('执行此操作后，流程将回滚到当前版本。您未发布的流程修改将会被清除，此操作无法撤回'),
      okText: _l('确定恢复'),
      onOk: () => {
        process.goBack({ processId: flowInfo.id }).then(() => {
          location.href = `/workflowedit/${flowInfo.parentId}`;
        });
      },
    });
  };

  /**
   * 渲染执行按钮
   */
  renderActionBtn() {
    const { isProgressing } = this.state;
    const { flowInfo } = this.props;
    const TEXT = {
      [APP_TYPE.LOOP]: {
        tip: _l('立即触发一条流程，执行时间即为系统的当前时间'),
      },
      default: {
        tip: _l('手动选择一条数据源，立即触发一条流程'),
      },
    };
    const btnText = TEXT[flowInfo.startAppType === APP_TYPE.LOOP ? APP_TYPE.LOOP : 'default'];

    if (
      flowInfo.publishStatus === 2 &&
      flowInfo.enabled &&
      _.includes([APP_TYPE.SHEET, APP_TYPE.LOOP, APP_TYPE.DATE, APP_TYPE.CUSTOM_ACTION], flowInfo.startAppType)
    ) {
      return (
        <span
          className="workflowAction ThemeHoverColor3 ThemeHoverBorderColor3 workflowDetailTipsWidth"
          data-tip={btnText.tip}
          onClick={this.action}
        >
          {isProgressing ? _l('执行中...') : _l('立即执行%03000')}
        </span>
      );
    }

    return null;
  }

  /**
   * 立即执行
   */
  action = () => {
    const { flowInfo, tabIndex } = this.props;
    const { isProgressing } = this.state;
    const actionProcess = sourceId => {
      this.setState({ isProgressing: true });

      process.startProcessById({ processId: flowInfo.id, sourceId }).then(result => {
        if (result) {
          alert(_l('执行成功'));
        }

        this.setState({ isProgressing: false });
        // 手动刷新一下历史数据
        if (tabIndex === 2) {
          document.getElementById('historyRefresh') && document.getElementById('historyRefresh').click();
        }
      });
    };

    if (isProgressing) return false;

    if (_.includes([APP_TYPE.SHEET, APP_TYPE.DATE, APP_TYPE.CUSTOM_ACTION], flowInfo.startAppType)) {
      selectRecord({
        canSelectAll: false,
        multiple: false,
        singleConfirm: true,
        relateSheetId: flowInfo.startAppId,
        onText: _l('开始测试'),
        onOk: selectedRecords => {
          actionProcess(selectedRecords[0].rowid);
        },
      });
    } else {
      actionProcess();
    }
  };

  /**
   * 渲染发布成功弹层
   */
  renderPublishDialog() {
    const { showPublishDialog, data, showApprovalFields, showApprovalDetail } = this.state;

    if (!showPublishDialog) return null;

    return (
      <DialogBase visible width={480}>
        <div className="publishSuccessDialog">
          <div className="publishSuccessImg" />

          {!data.apps.length ? (
            <Fragment>
              <div className="Font20 mTop35">{_l('太棒了！流程已自动化运行')}</div>
              <div className="Font14 mTop25 Gray_75">{_l('你再一次为大家节省时间提升了工作效率！')}</div>
              <div
                className="Font14 mTop15 Gray_75"
                dangerouslySetInnerHTML={{
                  __html: _l(
                    '一段时间后，你就可以在%0中看到进入流程的数据和详细的运行状态了',
                    `<span class="mLeft5 mRight5 ThemeColor3 ThemeHoverColor2 pointer publishDialogOpenHistory">${_l(
                      '历史',
                    )}</span>`,
                  ),
                }}
              />
              <Button size="large" onClick={() => this.setState({ showPublishDialog: false })} className="mTop40">
                {_l('我知道了')}
              </Button>
            </Fragment>
          ) : (
            <Fragment>
              <div className="Font20 mTop35">{_l('流程已成功发布！')}</div>
              <div className="Font14 mTop25 Gray_75">
                {_l('是否为%0开启审批功能项（已开启可忽略）', data.apps.map(item => `“${item.name}”`).join('、'))}
              </div>

              <div className="mTop30 flexRow w100 alignItemsCenter" style={{ marginLeft: 180 }}>
                <Checkbox
                  className="mRight5"
                  checked={showApprovalFields}
                  text={_l('在视图上显示审批系统字段')}
                  onClick={checked => this.setState({ showApprovalFields: !checked })}
                />
                <Popover
                  title={null}
                  arrowPointAtCenter={true}
                  placement="bottomLeft"
                  content={<img width={500} src={systemFieldsPNG} />}
                >
                  <Icon type="workflow_help" className="Font16 Gray_9e" />
                </Popover>
              </div>
              <div className="mTop15 flexRow w100 alignItemsCenter" style={{ marginLeft: 180 }}>
                <Checkbox
                  className="mRight5"
                  checked={showApprovalDetail}
                  text={_l('打开记录时显示审批流转详情')}
                  onClick={checked => this.setState({ showApprovalDetail: !checked })}
                />
                <Popover
                  title={null}
                  arrowPointAtCenter={true}
                  placement="bottomLeft"
                  content={<img width={500} src={flowPNG} />}
                >
                  <Icon type="workflow_help" className="Font16 Gray_9e" />
                </Popover>
              </div>
              <Button
                size="large"
                onClick={() => {
                  const switchList = [];

                  if (showApprovalFields) {
                    switchList.push({ state: true, type: 40, roleType: 0 });
                  }

                  if (showApprovalDetail) {
                    switchList.push({ state: true, type: 41, roleType: 0 });
                  }

                  if (switchList.length) {
                    data.apps.forEach(({ id }) => {
                      sheetAjax.batchEditSwitch({ worksheetId: id, switchList }).then(result => {
                        if (!result) {
                          alert(_l('修改失败，请稍后再试！'), 2);
                        }
                      });
                    });
                  }

                  this.setState({ showPublishDialog: false, showApprovalFields: false, showApprovalDetail: false });
                }}
                className="mTop40"
              >
                {_l('确定')}
              </Button>
            </Fragment>
          )}
        </div>
      </DialogBase>
    );
  }

  render() {
    const { visible, publishErrorVisible, errorInfo } = this.state;
    const { tabIndex, switchTabs, flowInfo } = this.props;

    return (
      <div className={cx('workflowSettingsHeader flexRow', { workflowReleaseHeader: flowInfo.parentId })}>
        <i className="icon-backspace Font20 ThemeColor3 workflowReturn" onClick={this.back} />
        <div className="flex relative w100 h100">
          <div className="flexColumn workflowHeaderDesc">
            <div className="Font17 ellipsis pointer" onClick={() => this.setState({ visible: true })}>
              {flowInfo.name}
            </div>
            <Tooltip placement="bottomLeft" title={flowInfo.explain || _l('添加流程说明...')}>
              <div className="Gray_9e ellipsis pointer Font12" onClick={() => this.setState({ visible: true })}>
                {flowInfo.explain || _l('添加流程说明...')}
              </div>
            </Tooltip>
          </div>
        </div>

        {TABS_OPTS.filter(item => flowInfo.startAppType !== APP_TYPE.APPROVAL_START || item.tabIndex !== 3).map(
          (item, i) => {
            return (
              <div
                key={i}
                className={cx('Font16 ThemeColor3 ThemeBorderColor3 workflowHeaderTab', {
                  active: tabIndex === item.tabIndex,
                  mRight60: TABS_OPTS.length - 1 === i,
                })}
                onClick={() => switchTabs(item.tabIndex)}
              >
                {item.name}
              </div>
            );
          },
        )}

        <div className="flex flexRow" style={{ justifyContent: 'flex-end' }}>
          {flowInfo.parentId ? (
            <div className="workflowReleaseBtnBox">
              <div className="workflowReleaseBtn">
                {_l('历史版本')}
                <span className="mLeft5">{createTimeSpan(flowInfo.lastPublishDate)}</span>
                <span data-tip={_l('恢复')}>
                  <Icon
                    className="Font18 mLeft10 White ThemeHoverColor3 pointer"
                    icon="restore2"
                    onClick={this.handleRestoreVisible}
                  />
                </span>
              </div>
            </div>
          ) : (
            <Fragment>
              {this.renderActionBtn()}

              <Switch
                disabledClose={flowInfo.startAppType === APP_TYPE.APPROVAL_START && flowInfo.enabled}
                status={flowInfo.enabled ? 'active' : 'close'}
                pending={!!flowInfo.pending}
                isRefresh={flowInfo.publishStatus === 1 && flowInfo.enabled}
                isNew={!flowInfo.publish}
                switchStatus={this.switchStatus}
                publishFlow={this.publishOrCloseFlow}
                refreshPublish={this.publishOrCloseFlow}
              />
            </Fragment>
          )}
        </div>

        {visible && (
          <WorkflowInfo
            onCancel={() => this.setState({ visible: false })}
            onOk={this.updateProcess}
            flowName={flowInfo.name}
            explain={flowInfo.explain}
          />
        )}

        {publishErrorVisible && (
          <PublishErrorDialog
            info={errorInfo}
            onOk={() => {
              this.props.switchTabs(1);
              this.setState({ publishErrorVisible: false });
              this.errorNodeCenter();
            }}
            onCancel={() => this.setState({ publishErrorVisible: false })}
          />
        )}

        {this.renderPublishDialog()}
      </div>
    );
  }
}

export default connect(state => state.workflow)(Header);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import './index.less';
import cx from 'classnames';
import { Tooltip } from 'antd';
import WorkflowInfo from './WorkflowInfo';
import { updateProcess, updatePublishState } from '../../redux/actions';
import process from '../../api/process';
import Switch from '../../components/Switch';
import { Button, Icon } from 'ming-ui';
import DialogBase from 'ming-ui/components/Dialog/DialogBase';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import PublishErrorDialog from '../../components/PublishErrorDialog';
import { APP_TYPE } from '../enum';

const TABS_OPTS = [
  { tabIndex: 1, name: _l('流程') },
  { tabIndex: 3, name: _l('配置') },
  { tabIndex: 2, name: _l('历史') },
];

class Header extends Component {
  static defaultProps = {
    tabIndex: 1,
    switchTabs: () => {},
    onBack: () => {
      if (history.length === 1) {
        location.href = '/app/my';
      } else {
        history.back();
      }
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      showPublishDialog: false,
      publishErrorVisible: false,
      errorInfo: {},
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
              }),
            );

            // 未发布
            if (unpublished) {
              setTimeout(() => {
                this.setState({ showPublishDialog: true });
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
      const errorNodeId = errorInfo.errorNodeIds[errorInfo.errorNodeIds.length - 1];
      const $el = $(`.workflowBox[data-id=${errorNodeId}]`);
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
    const { workflowDetail, onBack, flowInfo } = this.props;
    const { startEventId, flowNodeMap } = workflowDetail;
    const noSelectWorksheet =
      (flowNodeMap[startEventId].appType === APP_TYPE.SHEET || flowNodeMap[startEventId].appType === APP_TYPE.DATE) &&
      !flowNodeMap[startEventId].appId;

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

  render() {
    const { visible, showPublishDialog, publishErrorVisible, errorInfo } = this.state;
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

        {TABS_OPTS.map((item, i) => {
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
        })}

        <div className="flex">
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
            <Switch
              status={flowInfo.enabled ? 'active' : 'close'}
              pending={!!flowInfo.pending}
              isRefresh={flowInfo.publishStatus === 1 && flowInfo.enabled}
              isNew={!flowInfo.publish}
              switchStatus={this.switchStatus}
              publishFlow={this.publishOrCloseFlow}
              refreshPublish={this.publishOrCloseFlow}
            />
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

        <DialogBase visible={showPublishDialog} width={480}>
          <div className="publishSuccessDialog">
            <div className="publishSuccessImg" />
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
          </div>
        </DialogBase>
      </div>
    );
  }
}

export default connect(state => state.workflow)(Header);

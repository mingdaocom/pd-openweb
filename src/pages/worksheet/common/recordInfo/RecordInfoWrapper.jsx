import React, { Component } from 'react';
import cx from 'classnames';
import _, { isFunction } from 'lodash';
import PropTypes from 'prop-types';
import { LoadDiv, Modal } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import worksheetAjax from 'src/api/worksheet';
import { TextAbsoluteCenter } from 'worksheet/components/StyledComps';
import { emitter } from 'src/utils/common';
import { RECORD_INFO_FROM } from '../../constants/enum';
import RecordInfo from './RecordInfo';

const AutoSizeRecordInfo = autoSize(RecordInfo);

export default class RecordInfoWrapper extends Component {
  static propTypes = {
    from: PropTypes.number,
    notDialog: PropTypes.bool,
    visible: PropTypes.bool,
    sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
    instanceId: PropTypes.string,
    workId: PropTypes.string,
    hideRecordInfo: PropTypes.func,
    onError: PropTypes.func,
    allowEdit: PropTypes.bool,
    allowEmptySubmit: PropTypes.bool,
    allowAiAction: PropTypes.bool,
  };

  static defaultProps = {
    hideRecordInfo: () => {},
  };

  constructor(props) {
    super(props);
    this.didMountTimestamp = Date.now();
    this.state = {
      loading: props.from === RECORD_INFO_FROM.WORKFLOW || _.isEmpty(props.sheetSwitchPermit),
    };
  }

  componentDidMount() {
    if (this.state.loading) {
      this.init();
    }
  }

  recordinfo = React.createRef();

  async init() {
    const { instanceId, workId } = this.props;
    let { worksheetId, recordId, sheetSwitchPermit, viewId = '' } = this.props;
    if (this.props.from === RECORD_INFO_FROM.WORKFLOW && (!worksheetId || !recordId)) {
      // 获取记录信息
      try {
        const res = await worksheetAjax.getWorkItem({
          instanceId,
          workId,
        });
        if (res.worksheetId && res.rowId) {
          worksheetId = res.worksheetId;
          recordId = res.rowId;
          viewId = res.viewId;
        } else {
          throw new Error();
        }
      } catch (err) {
        this.setState({
          error: true,
          errorMsg: _.get(err, 'errorMessage') || _l('流程已关闭或删除'),
        });
        return;
      }
    }
    if ((!sheetSwitchPermit || _.isEmpty(sheetSwitchPermit)) && worksheetId && md.global.Account.accountId) {
      // 获取权限
      try {
        sheetSwitchPermit = await worksheetAjax.getSwitchPermit({ worksheetId });
      } catch (err) {
        console.log(err);
        sheetSwitchPermit = [];
      }
    }
    this.setState({
      loading: false,
      worksheetId,
      recordId,
      viewId,
      sheetSwitchPermit,
    });
  }

  handleCancel = e => {
    e.stopPropagation();
    const { hideRecordInfo } = this.props;
    if (this.recordinfo.current) {
      this.recordinfo.current.handleCancel();
    } else {
      hideRecordInfo();
    }
  };

  render() {
    const { notDialog, width, visible, from, instanceId, workId, allowAiAction = true } = this.props;
    const { loading, error, errorMsg, worksheetId, recordId, viewId, modalRightComp } = this.state;
    const extendsProps = {};
    let dialogWidth = width || (window.innerWidth - 32 * 2 > 1600 ? 1600 : window.innerWidth - 32 * 2);
    if (from === RECORD_INFO_FROM.WORKFLOW) {
      extendsProps.worksheetId = worksheetId;
      extendsProps.recordId = recordId;
      extendsProps.instanceId = instanceId;
      extendsProps.workId = workId;
      extendsProps.viewId = viewId;
    }
    const dialogProps = {
      className: cx('workSheetRecordInfo withSaveShortcut', `createTimestamp-${this.didMountTimestamp}`),
      dislocate: true,
      footer: null,
      onCancel: this.handleCancel,
      type: 'fixed',
      width: dialogWidth,
      visible,
      needRenderRight: true,
      ...(modalRightComp
        ? {
            renderModalRightComp: () => {
              return (
                <div
                  className="t-flex t-items-center flex-shrink-0"
                  style={{ borderLeft: '1px solid var(--color-border-primary)' }}
                >
                  {modalRightComp}
                </div>
              );
            },
            fullScreen: true,
            closeIcon: () => null,
          }
        : {}),
    };
    if (dialogProps.fullScreen) {
      dialogWidth = window.innerWidth;
      dialogProps.width = dialogWidth;
    }
    if (dialogProps.renderModalRightComp) {
      dialogWidth = dialogWidth - 420;
      dialogProps.width = dialogWidth;
    }
    let content;
    let sheetSwitchPermit = this.props.sheetSwitchPermit || this.state.sheetSwitchPermit;
    let RecordInfoComp = notDialog ? AutoSizeRecordInfo : RecordInfo;
    if (error) {
      content = <TextAbsoluteCenter className="error textTertiary">{errorMsg}</TextAbsoluteCenter>;
    } else {
      content = loading ? (
        <LoadDiv className="mTop32" />
      ) : (
        <RecordInfoComp
          ref={this.recordinfo}
          notDialog={notDialog}
          didMountTimestamp={this.didMountTimestamp}
          {...{
            ...this.props,
            ...extendsProps,
            sheetSwitchPermit,
            width: !notDialog ? dialogWidth : undefined,
            hideRecordInfo: (...args) => {
              if (window.customWidgetViewIsActive) {
                emitter.emit('POST_MESSAGE_TO_CUSTOM_WIDGET', {
                  action: 'close-record-info',
                  value: {
                    recordId: this.props.recordId,
                  },
                });
              }
              if (isFunction(this.props.hideRecordInfo)) {
                this.props.hideRecordInfo(...args);
              }
            },
          }}
          setModalRightComp={
            allowAiAction &&
            (comp => {
              this.setState({ modalRightComp: comp });
              if (isFunction(this.props.setLandRightComp)) {
                this.props.setLandRightComp(comp);
              }
            })
          }
        />
      );
    }
    return !notDialog ? (
      <Modal
        {...dialogProps}
        verticalAlign="bottom"
        closeSize={56}
        style={{ minWidth: 900 }}
        bodyStyle={{ padding: 0, position: 'relative' }}
      >
        {content}
      </Modal>
    ) : (
      <div className={cx('workSheetRecordInfo h100 withSaveShortcut', `createTimestamp-${this.didMountTimestamp}`)}>
        {content}
      </div>
    );
  }
}

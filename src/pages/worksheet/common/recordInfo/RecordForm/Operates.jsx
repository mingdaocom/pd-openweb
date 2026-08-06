import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import RecordInfoContext from '../RecordInfoContext';
import CustomButtonsAutoWidth from './CustomButtonsAutoWidth';

export default class Operates extends Component {
  static contextType = RecordInfoContext;
  static propTypes = {
    iseditting: PropTypes.bool,
    recordbase: PropTypes.shape({}),
    recordinfo: PropTypes.shape({}),
    view: PropTypes.shape({}),
    sideVisible: PropTypes.bool,
    sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
    addRefreshEvents: PropTypes.func,
    reloadRecord: PropTypes.func,
    hideRecordInfo: PropTypes.func,
    onUpdate: PropTypes.func,
    onDelete: PropTypes.func,
    hideFav: PropTypes.bool,
  };

  state = {
    btnDisable: {},
    customBtns: [],
  };

  componentDidMount() {
    this.loadBtns();
    this.props.setRef(this);
    this.props.addRefreshEvents('loadcustombtns', () => {
      setTimeout(() => {
        this.setState({ btnDisable: {} });
      }, 500);
      this.loadBtns();
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (
        this.props.recordbase.recordId !== prevProps.recordbase.recordId ||
        (this.props.recordbase.viewId && this.props.recordbase.viewId !== prevProps.recordbase.viewId)
      ) {
        this.loadBtns(this.props.recordbase.recordId, this.props.recordbase.viewId);
        this.setState({
          btnDisable: {},
        });
      }
    }
  }

  componentWillUnmount() {
    if (this.resizeOb) {
      this.resizeOb.unobserve(this.customButtonsCon.current);
      this.resizeOb.disconnect();
      delete this.resizeOb;
    }
  }

  customButtonsCon = React.createRef();

  loadBtns = async (rowId, viewId) => {
    const { updateAiActionButtons } = this.props;
    const { api } = this.context;
    const buttons = await api().getWorksheetBtns(rowId ? { rowId, ...(viewId ? { viewId } : {}) } : {});
    const enabledButtons = buttons.filter(btn => btn.status !== 0);
    updateAiActionButtons(enabledButtons.filter(btn => btn.btnType === 1 && !btn.disabled));
    this.setState({
      customBtns: enabledButtons.filter(btn => btn.btnType === 0),
    });
  };

  disableCustomButton = btnId => {
    this.setState({
      btnDisable: { ...this.state.btnDisable, [btnId]: true },
    });
  };

  render() {
    const {
      isCharge,
      iseditting,
      recordbase,
      recordinfo,
      view,
      reloadRecord,
      hideRecordInfo,
      onUpdate,
      customBtnTriggerCb,
      sheetSwitchPermit,
      isDraft,
      isRecordLock,
    } = this.props;
    const { customBtns, btnDisable } = this.state;
    const { viewId, worksheetId, recordId, appId } = recordbase;
    const advancedSetting = _.get(view, 'advancedSetting') || {};
    if (iseditting) return <div className="flex" style={{ lineHeight: 1, overflowX: 'hidden' }}></div>;
    return (
      <React.Fragment>
        <div className="flex" style={{ lineHeight: 1, overflowX: 'hidden' }} ref={this.customButtonsCon}>
          <div className="customButtons">
            <CustomButtonsAutoWidth
              type="button"
              isCharge={isCharge}
              iseditting={iseditting}
              viewId={viewId}
              appId={appId}
              worksheetId={worksheetId}
              recordId={recordId}
              {..._.pick(recordinfo, ['projectId', 'entityName'])}
              buttons={customBtns}
              detailgroup={advancedSetting.detailgroup}
              detailbtns={advancedSetting.detailbtns}
              btnDisable={btnDisable}
              reloadRecord={reloadRecord}
              isRecordLock={isRecordLock}
              loadBtns={this.loadBtns}
              onUpdate={onUpdate}
              hideRecordInfo={hideRecordInfo}
              onHideMoreBtn={() => {}}
              onButtonClick={this.disableCustomButton}
              triggerCallback={customBtnTriggerCb}
              sheetSwitchPermit={sheetSwitchPermit}
              isDraft={isDraft}
              isEditLock={!!recordbase.editLockedUser}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

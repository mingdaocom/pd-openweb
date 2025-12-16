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
    this.props.addRefreshEvents('loadcustombtns', () => {
      setTimeout(() => {
        this.setState({ btnDisable: {} });
      }, 500);
      this.loadBtns();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.recordbase.recordId !== this.props.recordbase.recordId ||
      (nextProps.recordbase.viewId && nextProps.recordbase.viewId !== this.props.recordbase.viewId)
    ) {
      this.loadBtns(nextProps.recordbase.recordId, nextProps.recordbase.viewId);
      this.setState({ btnDisable: {} });
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
    const { api } = this.context;
    const buttons = await api().getWorksheetBtns(rowId ? { rowId, ...(viewId ? { viewId } : {}) } : {});
    this.setState({
      customBtns: buttons,
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

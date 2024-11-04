import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RecordInfoContext from '../RecordInfoContext';
import CustomButtonsAutoWidth from './CustomButtonsAutoWidth';
import _ from 'lodash';

// TODO 更新记录

function getButtonWidth(button) {
  let width;
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.left = '-10000px';
  div.style.top = '-10000px';
  div.style.zIndex = '99999';
  div.style.border = '1px solid';
  div.innerHTML = `<span class="InlineBlock borderBox"><button type="button" class="ming Button--small Button--ghost Button recordCustomButton overflowHidden"><div class="content ellipsis">${
    button.icon ? `<i class="${`icon icon-${button.icon}`}"></i>` : ''
  }<span class="breakAll overflow_ellipsis">${button.name}</span></div></button></span>`;
  document.body.appendChild(div);
  width = div.offsetWidth;
  document.body.removeChild(div);
  return width;
}

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
    buttonShowNum: 3,
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
    } = this.props;
    const { customBtns, buttonShowNum, btnDisable } = this.state;
    const { viewId, worksheetId, recordId, appId } = recordbase;
    const { projectId } = recordinfo;
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
              projectId={projectId}
              buttons={customBtns}
              btnDisable={btnDisable}
              reloadRecord={reloadRecord}
              loadBtns={this.loadBtns}
              onUpdate={onUpdate}
              hideRecordInfo={hideRecordInfo}
              onHideMoreBtn={() => {}}
              onButtonClick={this.disableCustomButton}
              triggerCallback={customBtnTriggerCb}
              sheetSwitchPermit={sheetSwitchPermit}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

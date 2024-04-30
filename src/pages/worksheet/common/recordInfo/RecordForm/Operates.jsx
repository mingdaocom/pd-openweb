import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import RecordInfoContext from '../RecordInfoContext';
import CustomButtons from './CustomButtons';
import MoreMenu from './MoreMenu';
import { emitter } from 'worksheet/util';
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
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeOb = new ResizeObserver(this.setButtonShowNum);
      this.resizeOb.observe(this.customButtonsCon.current);
    }
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

  componentDidUpdate(prevProps) {
    if (prevProps.sideVisible !== this.props.sideVisible) {
      this.setButtonShowNum();
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

  @autobind
  async loadBtns(rowId, viewId) {
    const { api } = this.context;
    const buttons = await api.getWorksheetBtns(rowId ? { rowId, ...(viewId ? { viewId } : {}) } : {});
    this.setState(
      {
        customBtns: buttons,
      },
      this.setButtonShowNum,
    );
  }

  @autobind
  setButtonShowNum() {
    if (!this.customButtonsCon.current) {
      return;
    }
    const { customBtns } = this.state;
    let buttonShowNum = 3;
    const containerWidth = this.customButtonsCon.current.clientWidth - 20;
    const buttonWidths = customBtns.map(btn => getButtonWidth(btn) + 6);
    const sumWidth = _.sum(buttonWidths);
    if (sumWidth < containerWidth) {
      buttonShowNum = customBtns.length;
    } else {
      let i = 0;
      while (i < buttonWidths.length) {
        if (_.sum(buttonWidths.slice(0, i + 1)) <= containerWidth) {
          buttonShowNum = i + 1;
          i = i + 1;
        } else {
          break;
        }
      }
    }
    this.setState({
      buttonShowNum,
    });
  }

  @autobind
  disableCustomButton(btnId) {
    this.setState({
      btnDisable: { ...this.state.btnDisable, [btnId]: true },
    });
  }

  render() {
    const {
      isCharge,
      iseditting,
      recordbase,
      recordinfo,
      sheetSwitchPermit,
      reloadRecord,
      hideRecordInfo,
      onUpdate,
      onDelete,
      handleAddSheetRow,
      hideFav,
      customBtnTriggerCb,
    } = this.props;
    const { customBtns, buttonShowNum, btnDisable } = this.state;
    const { viewId, worksheetId, recordId, appId } = recordbase;
    const { projectId } = recordinfo;
    return (
      <React.Fragment>
        <div className="flex" style={{ lineHeight: 1 }} ref={this.customButtonsCon}>
          <div className="customButtons">
            <CustomButtons
              isCharge={isCharge}
              iseditting={iseditting}
              viewId={viewId}
              appId={appId}
              worksheetId={worksheetId}
              recordId={recordId}
              projectId={projectId}
              buttons={customBtns.slice(0, buttonShowNum)}
              btnDisable={btnDisable}
              reloadRecord={reloadRecord}
              loadBtns={this.loadBtns}
              onUpdate={onUpdate}
              hideRecordInfo={hideRecordInfo}
              onHideMoreBtn={() => {}}
              onButtonClick={this.disableCustomButton}
              triggerCallback={customBtnTriggerCb}
            />
          </div>
        </div>
        <MoreMenu
          hideFav={hideFav}
          recordbase={recordbase}
          recordinfo={recordinfo}
          sheetSwitchPermit={sheetSwitchPermit}
          buttons={customBtns.slice(buttonShowNum)}
          btnDisable={btnDisable}
          reloadRecord={reloadRecord}
          onUpdate={onUpdate}
          onDelete={onDelete}
          handleAddSheetRow={handleAddSheetRow}
          hideRecordInfo={hideRecordInfo}
        />
      </React.Fragment>
    );
  }
}

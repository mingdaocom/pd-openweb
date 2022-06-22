import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'worksheet/redux/actions/gunterview';
import RecordBlock from './RecordBlock';
import RecordInfo from 'worksheet/views/GunterView/components/RecordInfo';

@connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['viewConfig']),
    ..._.pick(state.sheet, ['isCharge', 'base', 'worksheetInfo', 'controls', 'sheetSwitchPermit']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class RecordWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordInfoVisible: false,
    }
  }
  handleClick = () => {
    if (window.isDrag) {
      return;
    }
    const { row, base, worksheetInfo } = this.props;
    const { appId, worksheetId } = worksheetInfo;
    const ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('mingdao') >= 0) {
      const data = {
        appId,
        worksheetId,
        viewId: base.viewId,
        rowId: row.rowid
      }
      if (_.get(window, ['webkit', 'messageHandlers', 'openSheetRow', 'postMessage'])) {
        window.webkit.messageHandlers.openSheetRow.postMessage(data);
        return;
      }
      if (_.get(window, ['Android', 'openSheetRow'])) {
        const str = JSON.stringify(data);
        window.Android.openSheetRow(str);
        return;
      }
    } else {
      this.setState({
        recordInfoVisible: true
      });
    }
  }
  render() {
    const { recordInfoVisible } = this.state;
    const { row, style } = this.props;
    return (
      <Fragment>
        <RecordBlock
          disable={!row.allowedit}
          row={row}
          style={style}
          onClick={this.handleClick}
        />
        {recordInfoVisible && (
          <RecordInfo
            row={row}
            onClose={() => {
              this.setState({ recordInfoVisible: false });
            }}
          />
        )}
      </Fragment>
    );
  }
}

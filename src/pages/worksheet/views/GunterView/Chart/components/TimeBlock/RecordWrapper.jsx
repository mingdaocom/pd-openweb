import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'worksheet/redux/actions/gunterview';
import RecordBlock from './RecordBlock';
import RecordInfo from 'worksheet/views/GunterView/components/RecordInfo';
import _ from 'lodash';

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
    const isMingdao = navigator.userAgent.toLowerCase().indexOf('mingdao application') >= 0;
    if (isMingdao) {
      window.location.href = `/mobile/record/${appId}/${worksheetId}/${base.viewId}/${row.rowid}`;
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

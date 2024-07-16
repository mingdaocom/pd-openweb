import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'worksheet/redux/actions/gunterview';
import RecordBlock from './RecordBlock';
import { addBehaviorLog } from 'src/util';
import _ from 'lodash';
import { handleRecordClick } from 'worksheet/util';

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
      RecordInfoComponent: null
    };
  }
  componentDidMount() {
    import('worksheet/views/GunterView/components/RecordInfo').then(component => {
      this.setState({
        RecordInfoComponent: component.default
      });
    });
  }
  handleClick = () => {
    if (window.isDrag) {
      return;
    }
    const { row, base, worksheetInfo, viewConfig } = this.props;
    const { appId, worksheetId } = worksheetInfo;
    handleRecordClick(
      {
        advancedSetting: { clicktype: viewConfig.clickType },
      },
      row,
      () => {
        if (window.isMingDaoApp) {
          window.location.href = `/mobile/record/${appId}/${worksheetId}/${base.viewId}/${row.rowid}`;
        } else {
          this.setState({
            recordInfoVisible: true,
          });
        }
        addBehaviorLog('worksheetRecord', worksheetId, { rowId: row.rowid }); // 埋点
      },
    );
  };
  render() {
    const { recordInfoVisible, RecordInfoComponent } = this.state;
    const { row, style } = this.props;
    return (
      <Fragment>
        <RecordBlock disable={!row.allowedit} row={row} style={style} onClick={this.handleClick} />
        {recordInfoVisible && (
          <RecordInfoComponent
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

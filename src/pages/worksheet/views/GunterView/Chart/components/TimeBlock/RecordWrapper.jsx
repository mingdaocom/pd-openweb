import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import * as actions from 'worksheet/redux/actions/gunterview';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/utils/project';
import { handleRecordClick } from 'src/utils/record';
import RecordBlock from './RecordBlock';

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
      RecordInfoComponent: null,
    };
  }
  componentDidMount() {
    import('worksheet/views/GunterView/components/RecordInfo').then(component => {
      this.setState({
        RecordInfoComponent: component.default,
      });
    });
    window.addEventListener('popstate', this.onQueryChange);
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.onQueryChange);
  }
  onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => this.setState({ recordInfoVisible: false }));
  };
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
        if (window.isMingDaoApp && (!window.shareState.shareId || window.APP_OPEN_NEW_PAGE)) {
          window.location.href = `/mobile/record/${appId}/${worksheetId}/${base.viewId}/${row.rowid}`;
        } else {
          this.setState({
            recordInfoVisible: true,
          });
        }
        handlePushState('page', 'recordDetail');
        addBehaviorLog('worksheetRecord', worksheetId, { rowId: row.rowid }); // 埋点
      },
    );
  };
  render() {
    const { recordInfoVisible, RecordInfoComponent } = this.state;
    const { row, style, groupKey } = this.props;
    return (
      <Fragment>
        <RecordBlock disable={!row.allowedit} row={row} style={style} groupKey={groupKey} onClick={this.handleClick} />
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

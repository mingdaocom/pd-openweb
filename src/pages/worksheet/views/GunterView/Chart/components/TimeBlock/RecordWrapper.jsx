import React, { Component, Fragment, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import * as actions from 'worksheet/redux/actions/gunterview';
import { isRecordDragging } from 'worksheet/views/GunterView/scrollState';
import { pathCompletion } from 'src/utils/common';
import { addBehaviorLog } from 'src/utils/project';
import { handleRecordClick } from 'src/utils/record';
import RecordBlock from './RecordBlock';

const LoadableRecordInfo = lazy(() => import('worksheet/views/GunterView/components/RecordInfo'));
let RecordWrapper = class RecordWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordInfoVisible: false,
    };
  }

  handleClick = () => {
    if (isRecordDragging()) {
      return;
    }

    const { row, base, worksheetInfo, viewConfig } = this.props;
    const { appId, worksheetId } = worksheetInfo;
    handleRecordClick(
      {
        advancedSetting: {
          clicktype: viewConfig.clickType,
        },
      },
      row,
      () => {
        if (window.isMingDaoApp && (!window.shareState.shareId || window.APP_OPEN_NEW_PAGE)) {
          window.location.href = pathCompletion(`/mobile/record/${appId}/${worksheetId}/${base.viewId}/${row.rowid}`);
        } else {
          this.setState({
            recordInfoVisible: true,
          });
        }

        addBehaviorLog('worksheetRecord', worksheetId, {
          rowId: row.rowid,
        }); // 埋点
      },
    );
  };

  render() {
    const { recordInfoVisible } = this.state;
    const { row, style, groupKey, buttonsCheckStatus } = this.props;
    return (
      <Fragment>
        <RecordBlock
          disable={!row.allowedit}
          row={row}
          style={style}
          groupKey={groupKey}
          onClick={this.handleClick}
          buttonsCheckStatus={buttonsCheckStatus}
        />
        {recordInfoVisible && (
          <Suspense fallback={null}>
            <LoadableRecordInfo
              row={row}
              onClose={() => {
                this.setState({
                  recordInfoVisible: false,
                });
              }}
            />
          </Suspense>
        )}
      </Fragment>
    );
  }
};
RecordWrapper = connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['viewConfig']),
    ..._.pick(state.sheet, ['isCharge', 'base', 'worksheetInfo', 'controls', 'sheetSwitchPermit']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(RecordWrapper);
export default RecordWrapper;

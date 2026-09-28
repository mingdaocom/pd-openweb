import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import * as actions from 'worksheet/redux/actions/gunterview';
import GroupContent from 'worksheet/views/GunterView/components/GroupContent';
import { getVisibleGunterGroups } from 'worksheet/views/GunterView/virtual';
import RecordWrapper from './RecordWrapper';
import './index.less';

const lineHeight = 32;
const groupingBlockHeight = 7;
const rowBlockHeight = 14;
let TimeBlock = class TimeBlock extends Component {
  constructor(props) {
    super(props);
  }

  renderRow(row, groupKey, index) {
    const { buttonsCheckStatus } = this.props;
    const style = {
      top: index * lineHeight + (lineHeight / 2 - rowBlockHeight / 2),
      left: row.left,
      width: row.width,
    };
    return (
      <RecordWrapper
        key={row.rowid}
        groupKey={groupKey}
        row={row}
        style={style}
        buttonsCheckStatus={buttonsCheckStatus}
      />
    );
  }

  renderGroupingItem(visibleGroup) {
    const { updateGroupSubVisible } = this.props;
    const { groupVisible, group: item, rows } = visibleGroup;
    const { groupingIndex } = item;
    return (
      <Fragment key={item.key}>
        {groupVisible && (
          <div
            className="groupingBlock"
            style={{
              top: groupingIndex * lineHeight + (lineHeight / 2 - groupingBlockHeight / 2),
              left: item.left,
              width: item.width,
              color: item.color,
            }}
            onClick={() => {
              updateGroupSubVisible(item.key);
            }}
          >
            <span className="recordTitle textPrimary">{<GroupContent group={item} />}</span>
          </div>
        )}
        {item.subVisible && rows.map(({ row, rowIndex }) => row.width > 0 && this.renderRow(row, item.key, rowIndex))}
      </Fragment>
    );
  }

  render() {
    const { visibleRange } = this.props;
    const { grouping, withoutArrangementVisible } = this.props.gunterView;
    const visibleGroups = getVisibleGunterGroups(grouping, visibleRange, withoutArrangementVisible);
    return (
      <div className="timeBlockWrapper">
        {visibleGroups.map(item => item.group.width > 0 && this.renderGroupingItem(item))}
      </div>
    );
  }
};
TimeBlock = connect(
  state => ({ ..._.pick(state.sheet, ['gunterView']) }),
  dispatch => bindActionCreators(actions, dispatch),
)(TimeBlock);
export default TimeBlock;

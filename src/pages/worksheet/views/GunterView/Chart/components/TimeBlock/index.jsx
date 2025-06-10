import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'worksheet/redux/actions/gunterview';
import RecordWrapper from './RecordWrapper';
import GroupContent from 'worksheet/views/GunterView/components/GroupContent';
import './index.less';
import _ from 'lodash';

const lineHeight = 32;
const groupingBlockHeight = 7;
const rowBlockHeight = 14;

@connect(
  state => ({
    ..._.pick(state.sheet, ['gunterView']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class TimeBlock extends Component {
  constructor(props) {
    super(props);
  }
  renderRow(row, groupKey, index) {
    const style = { top: index * lineHeight + (lineHeight / 2 - rowBlockHeight / 2), left: row.left, width: row.width };
    return (
      <RecordWrapper
        key={row.rowid}
        groupKey={groupKey}
        row={row}
        style={style}
      />
    );
  }
  renderGroupingItem(item) {
    const { gunterView, updateGroupSubVisible } = this.props;
    const { withoutArrangementVisible } = gunterView;
    const { groupingIndex } = item;
    return (
      <Fragment key={item.key}>
        {
          !item.hide && (
            <div
              className="groupingBlock"
              style={{
                top: groupingIndex * lineHeight + (lineHeight / 2 - groupingBlockHeight / 2),
                left: item.left, width: item.width,
                color: item.color,
              }}
              onClick={() => {
                updateGroupSubVisible(item.key);
              }}
            >
              <span className="recordTitle Gray">{<GroupContent group={item} />}</span>
            </div>
          )
        }
        {
          item.subVisible && (
            item.rows.filter(item => (withoutArrangementVisible ? true : item.diff > 0)).map((row, index) => (
              row.width > 0 && this.renderRow(row, item.key, item.hide ? index : groupingIndex + index + 1)
            ))
          )
        }
      </Fragment>
    );
  }
  render() {
    const { grouping } = this.props.gunterView;
    return (
      <div className="timeBlockWrapper">
        {
          grouping.map(item => (
            item.width > 0 && this.renderGroupingItem(item)
          ))
        }
      </div>
    );
  }
}

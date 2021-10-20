import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import * as actions from './redux/actions';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { Flex, ActivityIndicator, WhiteSpace, WingBlank } from 'antd-mobile';
import RecordCard from 'src/components/recordCard';
import { WithoutRows } from 'src/pages/Mobile/RecordList/SheetRows';
import './index.less';

@withRouter
class RelationList extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const { match, controlId, instanceId, workId } = this.props;
    const { params } = match;
    let newParams = null;
    if (instanceId && workId) {
      const { rowId, worksheetId } = this.props;
      newParams = {
        instanceId,
        workId,
        rowId,
        worksheetId,
        controlId
      };
    } else {
      newParams = {
        ...params,
        controlId,
      };
    }
    this.props.updateBase(newParams);
    this.props.loadRow();
  }
  componentWillUnmount() {
    this.props.reset();
  }
  handleSelect = (record, selected) => {
    const { controlId, rowInfo, relationRow, actionParams, updateActionParams, permissionInfo } = this.props;
    const { worksheet } = relationRow;
    const { isEdit, selectedRecordIds } = actionParams;
    const control = _.find(rowInfo.receiveControls, { controlId });
    if (isEdit) {
      updateActionParams({
        selectedRecordIds: selected ? _.unique(selectedRecordIds.concat(record.rowid)) : selectedRecordIds.filter(id => id !== record.rowid)
      });
    } else {
      const { isSubList, controlPermission } = permissionInfo;
      this.props.history.push(
        `/mobile/record/${worksheet.appId || null}/${worksheet.worksheetId}/${control.viewId || null}/${record.rowid}?isSubList=${
          isSubList
        }&editable=${controlPermission.editable}`,
      );
    }
  }
  renderRow = item => {
    const { relationRow, actionParams } = this.props;
    const { showControls, selectedRecordIds } = actionParams;
    const { controls } = relationRow.template;
    const selected = !!_.find(selectedRecordIds, id => id === item.rowid);
    return (
      <WingBlank size="md" key={item.rowid}>
        <RecordCard
          from={3}
          selected={selected}
          controls={controls}
          showControls={showControls}
          data={item}
          onClick={() => this.handleSelect(item, !selected)}
        />
      </WingBlank>
    );
  }
  render() {
    const { relationRow, relationRows, loadParams, actionParams } = this.props;
    const { loading, pageIndex, isMore } = loadParams;
    const { isEdit } = actionParams;

    if (loading && pageIndex === 1) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }

    return (
      <div className={cx('sheetRelationRow flex', { editRowWrapper: isEdit })}>
        {relationRows.length ? (
          <Fragment>
            <WhiteSpace />
            {
              relationRows.map(item => (
                this.renderRow(item)
              ))
            }
            { isMore && <Flex justify="center">{loading ? <ActivityIndicator animating /> : null}</Flex> }
            <WhiteSpace />
          </Fragment>
        ) : (
          <div className="withoutRowsWrapper flexColumn valignWrapper h100">
            <WithoutRows text={_l('暂无记录')} />
          </div>
        )}
      </div>
    );
  }
}


export default connect(
  state => ({
    ..._.pick(state.mobile, ['rowInfo', 'relationRow', 'relationRows', 'loadParams', 'actionParams', 'permissionInfo'])
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, ['updateBase', 'loadRow', 'updateActionParams', 'reset']),
      dispatch,
  ),
)(RelationList);

import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import * as actions from './redux/actions';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { Flex, ActivityIndicator, WhiteSpace, WingBlank } from 'antd-mobile';
import RecordCard from 'src/components/recordCard';
import { RecordInfoModal } from 'mobile/Record';
import { WithoutRows } from 'mobile/RecordList/SheetRows';
import './index.less';

@withRouter
class RelationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      previewRecordId: undefined
    }
  }
  componentDidMount() {
    const { match, controlId, control, instanceId, workId, worksheetId, rowId } = this.props;
    const { params } = match;
    let newParams = null;
    if (instanceId && workId) {
      newParams = {
        instanceId,
        workId,
        rowId,
        worksheetId,
        controlId,
      };
    } else {
      const { viewId, appId } = this.props;
      newParams = {
        ...params,
        viewId,
        appId,
        worksheetId,
        rowId,
        controlId,
      };
    }
    this.props.updateBase(newParams);
    this.props.loadRow(control);
  }
  componentWillUnmount() {
    this.props.reset();
  }
  handleSelect = (record, selected) => {
    const { controlId, rowInfo, relationRow, actionParams, updateActionParams } = this.props;
    const { worksheet } = relationRow;
    const { isEdit, selectedRecordIds } = actionParams;
    const control = _.find(rowInfo.receiveControls, { controlId }) || {};
    if (isEdit) {
      updateActionParams({
        selectedRecordIds: selected
          ? _.uniqBy(selectedRecordIds.concat(record.rowid))
          : selectedRecordIds.filter(id => id !== record.rowid),
      });
    } else {
      this.setState({
        previewRecordId: record.rowid
      });
    }
  };
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
  };
  render() {
    const { rowInfo, controlId, relationRow, relationRows, loadParams, actionParams, permissionInfo } = this.props;
    const { loading, pageIndex, isMore } = loadParams;
    
    if (loading && pageIndex === 1) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }

    const { previewRecordId } = this.state;
    const { isEdit } = actionParams;
    const { worksheet } = relationRow;
    const control = _.find(rowInfo.receiveControls, { controlId }) || {};

    return (
      <div className={cx('sheetRelationRow flex', { editRowWrapper: isEdit })}>
        {relationRows.length ? (
          <Fragment>
            <WhiteSpace />
            {relationRows.map(item => this.renderRow(item))}
            {isMore && <Flex justify="center">{loading ? <ActivityIndicator animating /> : null}</Flex>}
            <WhiteSpace />
            <RecordInfoModal
              className="full"
              visible={!!previewRecordId}
              appId={worksheet.appId}
              worksheetId={worksheet.worksheetId}
              viewId={control.viewId}
              rowId={previewRecordId}
              isSubList={_.get(permissionInfo, 'isSubList')}
              editable={_.get(permissionInfo, 'controlPermission.editable')}
              onClose={() => {
                this.setState({
                  previewRecordId: undefined
                });
              }}
            />
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
    ..._.pick(state.mobile, ['rowInfo', 'relationRow', 'relationRows', 'loadParams', 'actionParams', 'permissionInfo']),
  }),
  dispatch => bindActionCreators(_.pick(actions, ['updateBase', 'loadRow', 'updateActionParams', 'reset']), dispatch),
)(RelationList);

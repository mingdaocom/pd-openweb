import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import * as actions from './redux/actions';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { SpinLoading } from 'antd-mobile';
import RecordCard from 'src/components/recordCard';
import { RecordInfoModal } from 'mobile/Record';
import { WithoutRows } from 'mobile/RecordList/SheetRows';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/util';
import './index.less';
import _ from 'lodash';

class RelationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      previewRecordId: undefined,
    };
  }
  componentDidMount() {
    this.loadData(this.props);
    if (location.search.indexOf('relateRecord') === -1) {
      localStorage.removeItem('openRecordDetailIds');
    }
    window.addEventListener('popstate', this.onQueryChange);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.controlId !== nextProps.controlId) {
      nextProps.reset();
      this.loadData(nextProps);
    }
  }
  componentWillUnmount() {
    this.props.reset();
    window.removeEventListener('popstate', this.onQueryChange);
  }

  onQueryChange = () => {
    const { previewRecordId } = this.state;
    if (!previewRecordId) return;
    handleReplaceState('page', `relateRecord-${previewRecordId}`, () => this.setState({ previewRecordId: undefined }));
  };

  loadData = props => {
    const { controlId, control, instanceId, workId, worksheetId, rowId, getType, data: formData } = props;
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
      const { viewId, appId } = props;
      newParams = {
        viewId,
        appId,
        worksheetId,
        rowId,
        controlId,
      };
    }
    props.updateBase(newParams);
    props.loadRow({ ...control, formData }, getType);
  };
  handleSelect = (record, selected) => {
    const { relationRow, actionParams, updateActionParams, permissionInfo } = this.props;
    const { worksheet } = relationRow;
    const { isEdit, selectedRecordIds } = actionParams;

    if (isEdit) {
      updateActionParams({
        selectedRecordIds: selected
          ? _.uniqBy(selectedRecordIds.concat(record.rowid))
          : selectedRecordIds.filter(id => id !== record.rowid),
      });
    } else {
      if (permissionInfo.allowLink) {
        addBehaviorLog('worksheetRecord', worksheet.worksheetId, { rowId: record.rowid }); // 埋点
        handlePushState('page', `relateRecord-${record.rowid}`);
        this.setState({
          previewRecordId: record.rowid,
        });
      }
    }
  };
  renderRow = item => {
    const { relationRow, actionParams, permissionInfo, worksheetId, rowInfo, controlId } = this.props;
    const { showControls, selectedRecordIds, coverCid } = actionParams;
    const { controls } = relationRow.template;
    const selected = !!_.find(selectedRecordIds, id => id === item.rowid);
    const control = _.find(rowInfo.templateControls, { controlId }) || {};

    return (
      <div className="mLeft10 mRight10" key={item.rowid}>
        <RecordCard
          from={3}
          control={control}
          selected={selected}
          controls={controls}
          coverCid={coverCid}
          showControls={showControls}
          worksheetId={item.wsid}
          data={item}
          onClick={() => this.handleSelect(item, !selected)}
          disabledLink={!permissionInfo.allowLink}
        />
      </div>
    );
  };
  render() {
    const { rowInfo, controlId, relationRow, relationRows, loadParams, actionParams, permissionInfo } = this.props;
    const { loading, pageIndex, isMore } = loadParams;

    if (loading && pageIndex === 1) {
      return (
        <div className="flexRow justifyContentCenter alignItemsCenter h100">
          <SpinLoading color='primary' />
        </div>
      );
    }

    const { previewRecordId } = this.state;
    const { isEdit } = actionParams;
    const { worksheet } = relationRow;
    const control = _.find(rowInfo.templateControls, { controlId }) || {};

    return (
      <div className={cx('sheetRelationRow flex', { editRowWrapper: isEdit })}>
        {relationRows.length ? (
          <Fragment>
            <div style={{ height: 10 }} />
            {relationRows.map(item => this.renderRow(item))}
            {isMore && <div className="flexRow alignItemsCenter justifyContentCenter">{loading ? <SpinLoading color='primary' /> : null}</div>}
            <div style={{ height: 10 }} />
            <RecordInfoModal
              className="full"
              visible={!!previewRecordId}
              appId={worksheet.appId}
              worksheetId={worksheet.worksheetId}
              enablePayment={worksheet.enablePayment}
              viewId={_.get(control, 'advancedSetting.openview') || control.viewId}
              rowId={previewRecordId}
              isSubList={_.get(permissionInfo, 'isSubList')}
              editable={_.get(permissionInfo, 'controlPermission.editable')}
              onClose={() => {
                this.setState({
                  previewRecordId: undefined,
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

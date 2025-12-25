import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SpinLoading } from 'antd-mobile';
import cx from 'classnames';
import _, { identity } from 'lodash';
import { RecordInfoModal } from 'mobile/Record';
import { WithoutRows } from 'mobile/RecordList/SheetRows';
import RecordCoverCard from 'src/components/Form/MobileForm/components/RelateRecordCards/RecordCoverCard';
import { getCoverUrl } from 'src/components/Form/MobileForm/tools/utils';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/utils/project';
import * as actions from './redux/actions';
import './index.less';

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
      nextProps.reset && nextProps.reset();
      this.setState({ keywords: '' });
      this.loadData(nextProps);
    }
  }
  componentWillUnmount() {
    this.props.reset && this.props.reset();
    window.removeEventListener('popstate', this.onQueryChange);
  }

  onQueryChange = () => {
    const { previewRecordId } = this.state;
    if (!previewRecordId) return;
    handleReplaceState('page', `relateRecord-${previewRecordId}`, () => this.setState({ previewRecordId: undefined }));
  };

  loadData = props => {
    const { controlId, control, instanceId, workId, worksheetId, recordId, rowId, from, formData } = props;
    let newParams = null;
    if (instanceId && workId) {
      newParams = {
        instanceId,
        workId,
        rowId: recordId || rowId,
        worksheetId,
        controlId,
      };
    } else {
      const { viewId, appId } = props;
      newParams = {
        viewId,
        appId,
        worksheetId,
        rowId: recordId || rowId,
        controlId,
      };
    }
    props.updateBase(newParams);
    props.loadRow({ ...control, formData }, from);
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
    const { actionParams, control, viewId } = this.props;
    const { showControls, relationControls, selectedRecordIds, isEdit, coverCid } = actionParams;
    const selected = !!_.find(selectedRecordIds, id => id === item.rowid);

    return (
      <RecordCoverCard
        disabled
        canSelect={isEdit}
        selected={selected}
        viewId={viewId}
        key={item.rowid}
        cover={getCoverUrl(coverCid, item, relationControls)}
        controls={showControls.map(cid => _.find(relationControls, { controlId: cid })).filter(identity)}
        data={item}
        parentControl={{ ...control, relationControls }}
        onClick={() => this.handleSelect(item, !selected)}
      />
    );
  };

  onSearch = _.debounce(() => {
    const { updatePageIndex = () => {} } = this.props;
    const { keywords } = this.state;
    updatePageIndex(1, { keywords });
  }, 500);

  updateRelateRecord = cells => {
    const { relationRows, updateRelationRows = () => {} } = this.props;
    const targetRow = cells.find(item => item.controlId === 'rowid') || {};
    const targetRowId = targetRow.value;

    if (!targetRowId) return;

    const valueObj = {};
    cells.forEach(({ controlId, value }) => {
      if (controlId !== 'rowid') {
        valueObj[controlId] = value;
      }
    });

    const updatedRecords = relationRows.map(item => {
      if (item.rowid === targetRowId) {
        const newItem = { ...item };
        Object.keys(newItem).forEach(key => {
          if (key !== 'rowid' && _.has(valueObj, key)) {
            newItem[key] = valueObj[key];
          }
        });
        return newItem;
      }
      return item;
    });

    updateRelationRows(updatedRecords, 0);
  };

  render() {
    const { rowInfo, controlId, relationRow, relationRows, loadParams, actionParams, permissionInfo } = this.props;
    const { count } = this.props.control || {};
    const { loading, pageIndex, isMore } = loadParams;

    const { previewRecordId, keywords } = this.state;
    const { isEdit } = actionParams;
    const { worksheet } = relationRow;
    const control = _.find(rowInfo.templateControls, { controlId }) || {};

    return (
      <Fragment>
        {!_.isUndefined(keywords) || relationRows.length ? (
          <div className="searchRelationWrap">
            <div className="inputCon">
              <i className="icon icon-search Gray_9e" />
              <input
                className="flex"
                placeholder={_l('搜索')}
                type="search"
                value={keywords}
                onChange={e => {
                  this.setState({ keywords: e.target.value }, this.onSearch);
                }}
              />
              <i
                className={cx('icon icon-workflow_cancel Hand Gray_9e Font16', {
                  none: !keywords,
                })}
                onClick={() => this.setState({ keywords: '' }, this.onSearch)}
              />
            </div>
          </div>
        ) : (
          ''
        )}
        <div className={cx('sheetRelationRow flex', { editRowWrapper: isEdit })}>
          {loading && pageIndex === 1 ? (
            <Fragment>
              {count > 0 && (
                <div className="flexRow justifyContentCenter alignItemsCenter h100">
                  <SpinLoading color="primary" />
                </div>
              )}
            </Fragment>
          ) : relationRows.length ? (
            <Fragment>
              {relationRows.map(item => this.renderRow(item))}
              {isMore && loading && (
                <div className="flexRow alignItemsCenter justifyContentCenter">
                  <SpinLoading color="primary" />
                </div>
              )}
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
                updateRelateRecord={this.updateRelateRecord}
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
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, ['rowInfo', 'relationRow', 'relationRows', 'loadParams', 'actionParams', 'permissionInfo']),
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, [
        'updateBase',
        'loadRow',
        'updateActionParams',
        'updatePageIndex',
        'reset',
        'updateRelationRows',
      ]),
      dispatch,
    ),
)(RelationList);

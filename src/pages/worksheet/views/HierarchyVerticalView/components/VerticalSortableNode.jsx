import React, { Fragment, Component, createRef } from 'react';
import { string, number, func } from 'prop-types';
import cx from 'classnames';
import _ from 'lodash';
import RecordInfoWrapper from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { RecordInfoModal } from 'mobile/Record';
import DraggableRecord from './DraggableRecord';
import styled from 'styled-components';
import { browserIsMobile, emitter } from 'src/util';

const isMobile = browserIsMobile();

const VerticalSortableRecordItemWrap = styled.div`
  position: relative;
  &::before {
    top: -20px;
    left: 0;
    right: -10px;
    position: absolute;
    height: 2px;
    background: #d3d3d3;
    content: '';
  }
  &::after {
    top: -20px;
    left: calc(50% - 1px);
    position: absolute;
    width: 2px;
    height: 20px;
    background: #d3d3d3;
    content: '';
  }
`;

export default class VerticalSortableRecordItem extends Component {
  static propTypes = {
    index: number,
    parentId: string,
    toggleChildren: func,
    handleAddRecord: func,
  };

  static defaultProps = {
    toggleChildren: _.noop,
    handleAddRecord: _.noop,
  };

  constructor(props) {
    super(props);
    this.$itemWrap = createRef(null);
    this.state = {
      recordInfoVisible: false,
      recordInfoRowId: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.recordInfoId &&
      nextProps.recordInfoId !== this.props.recordInfoId &&
      nextProps.recordInfoId === this.props.data.rowId
    ) {
      this.setState({
        recordInfoVisible: true,
        recordInfoRowId: nextProps.recordInfoId,
      });
    }
  }

  getNode = (data, path) => {
    if (!path.length) return {};
    if (path.length === 1) return data[path[0]];
    const cur = path.shift();
    return this.getNode(data[cur].children, path);
  };

  handleRecordVisible = rowId => {
    if (window.isMingDaoApp) {
      const { appId, treeData } = this.props;
      const curInfo = treeData[rowId];
      window.location.href = `/mobile/record/${appId}/${curInfo.wsid}/${rowId}`;
      return;
    }
    this.setState({ recordInfoRowId: rowId, recordInfoVisible: true });
  };
  getRecordInfoPara = () => {
    const { worksheetId, viewId, view, data, controls, hierarchyRelateSheetControls } = this.props;
    const { childType, viewControls } = view;
    if (String(childType) === '2') {
      const configIndex = data.pathId.length - 1;
      const { worksheetId, controlId } = viewControls[configIndex] || {};
      // 第一级 (本表)
      if (configIndex === 0 || viewControls.length === 1) {
        return { worksheetId, viewId };
      }
      // 获取关联控件配置的viewId
      const { worksheetId: relateSheetId } =
        viewControls && viewControls.length && configIndex > 0 ? viewControls[configIndex - 1] || {} : {};
      const currentControls = configIndex > 1 ? hierarchyRelateSheetControls[relateSheetId] : controls;
      const configViewId = _.get(
        _.find(currentControls, item => item.controlId === controlId),
        'viewId',
      );
      const viewControlInfo = viewControls.find(o => o.worksheetId === worksheetId) || {};
      return {
        worksheetId,
        viewId: configViewId,
        cardwidth: _.get(viewControlInfo, 'advancedSetting.cardwidth'),
      };
    }
    return { worksheetId, viewId };
  };
  getCurrentSheetRows = () => {
    const { stateTree = [] } = this.props;

    const getLayerRows = (arr = [], rows = []) => {
      const { data = {}, treeData = {} } = this.props;
      if (arr.length) {
        arr.map(item => {
          if (_.get(item, 'pathId.length') === _.get(data, 'pathId.length')) {
            rows.push({
              index: (_.get(item, 'path') || [])[_.get(item, 'pathId.length') - 1],
              row: treeData[item.rowId],
            });
          }
          if (_.get(item, 'children.length')) {
            getLayerRows(item.children, rows);
          }
        });
      }
      return rows;
    };
    const newRows = getLayerRows(stateTree);
    return _.sortBy(newRows, 'index').map(i => i.row);
  };

  render() {
    const {
      appId,
      data,
      updateHierarchyData,
      deleteHierarchyRecord,
      hideHierarchyRecord,
      sheetSwitchPermit,
      view,
      worksheetInfo,
      broCount = 1,
      isNarrow = false,
      uniqId,
    } = this.props;
    const { recordInfoRowId, recordInfoVisible } = this.state;
    const { rowId, path = [], pathId = [] } = data;
    const { rowId: draggingId } = safeParse(localStorage.getItem('draggingHierarchyItem'));
    const recordInfoPara = this.getRecordInfoPara();
    if (recordInfoPara.worksheetId === worksheetInfo.worksheetId) {
      recordInfoPara.rules = worksheetInfo.rules;
    }

    return (
      <Fragment>
        <VerticalSortableRecordItemWrap
          className={cx(
            'sortableVerticalTreeNodeWrap',
            { isDragging: draggingId === rowId },
            `${isNarrow ? 'w240' : 'w280'}`,
          )}
          id={uniqId ? `${pathId.join('-')}-${uniqId}` : pathId.join('-')}
          ref={this.$itemWrap}
        >
          <DraggableRecord
            {...this.props}
            width={recordInfoPara.cardwidth || _.get(view, 'advancedSetting.cardwidth')}
            viewParaOfRecord={recordInfoPara}
            onDelete={() => deleteHierarchyRecord({ rows: [{ rowid: rowId, allowDelete: true }], path, pathId })}
            onUpdate={(value, relateSheet) =>
              updateHierarchyData({ path, pathId, recordId: rowId, value, relateSheet })
            }
            onClick={() => this.handleRecordVisible(rowId)}
          />
        </VerticalSortableRecordItemWrap>
        {recordInfoVisible &&
          (isMobile ? (
            <RecordInfoModal
              className="full"
              visible
              appId={appId}
              worksheetId={recordInfoPara.worksheetId}
              viewId={recordInfoPara.viewId}
              rowId={recordInfoRowId}
              onClose={() => {
                this.setState({ recordInfoVisible: false });
              }}
            />
          ) : (
            <RecordInfoWrapper
              showPrevNext
              sheetSwitchPermit={sheetSwitchPermit}
              allowAdd={view.allowAdd}
              from={2}
              visible
              recordId={recordInfoRowId}
              projectId={worksheetInfo.projectId}
              currentSheetRows={this.getCurrentSheetRows()}
              hideRecordInfo={() => {
                this.setState({ recordInfoVisible: false });
                emitter.emit('ROWS_UPDATE');
              }}
              updateSuccess={(recordIds, value, relateSheet) => {
                if (!relateSheet.isviewdata) {
                  return;
                }
                updateHierarchyData({ path, pathId, recordId: recordIds[0], value, relateSheet });
              }}
              appId={appId}
              deleteRows={(_, rows) => deleteHierarchyRecord({ rows, path, pathId })}
              hideRows={rowIds => hideHierarchyRecord(rowIds[0], path, pathId)}
              {...recordInfoPara}
            />
          ))}
      </Fragment>
    );
  }
}

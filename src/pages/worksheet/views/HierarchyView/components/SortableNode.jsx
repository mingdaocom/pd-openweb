import React, { Component, createRef, Fragment } from 'react';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import _ from 'lodash';
import { func, number, string } from 'prop-types';
import SVG from 'svg.js';
import { RecordInfoModal } from 'mobile/Record';
import RecordInfoWrapper from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { browserIsMobile, emitter } from 'src/utils/common';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/utils/project';
import { handleRecordClick } from 'src/utils/record';
import { getCardWidth } from 'src/utils/worksheet';
import { getPosition, getRelateSheetId } from '../util';
import DraggableRecord from './DraggableRecord';

const isMobile = browserIsMobile();

export default class SortableRecordItem extends Component {
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
    this.$svg = createRef(null);
    this.state = {
      recordInfoVisible: false,
      recordInfoRowId: '',
    };
    this.isFirstSkip = true;
  }
  componentDidMount() {
    const { hierarchyTopLevelDataCount } = this.props;
    if (hierarchyTopLevelDataCount < 200) {
      this.drawConnector();
    }
    window.addEventListener('popstate', this.onQueryChange);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.onQueryChange);
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

  componentDidUpdate() {
    // if (!isEqual(this.getConnectLinePos(nextProps), this.getConnectLinePos(this.props))) {
    const { hierarchyTopLevelDataCount } = this.props;
    if (!this.isFirstSkip || hierarchyTopLevelDataCount < 200) {
      this.drawConnector();
    }
    // }
  }

  onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => this.setState({ recordInfoVisible: false }));
  };

  getNode = (data, path) => {
    if (!path.length) return {};
    if (path.length === 1) return data[path[0]];
    const cur = path.shift();
    return this.getNode(data[cur].children, path);
  };

  // 获取连接线位置
  getConnectLinePos = ({ stateTree, pid, data, scale, view = {}, isStraightLine = false }) => {
    const { path = [], rowId } = data;
    const { advancedSetting = {} } = view;
    const $ele = _.get(this.$itemWrap, ['current']);

    if ($ele && pid) {
      const getParent = this.getNode(stateTree, path.slice(0, -1));

      if (!getParent || _.isEmpty(getParent)) return {};

      const childrenCount = (_.get(getParent, 'children') || {}).length;

      if (!childrenCount) return {};

      const $parent = $(`#${getParent.pathId.join('-')}-${this.props.uniqId}`)[0];

      if ($parent === $ele) return {};

      const currentIndex =
        _.findIndex(getParent.children, item => item === rowId || item.rowId === rowId || item.rowid === rowId) || 0;

      /* 为了防止连线过于重叠,处理控制点的横坐标
       靠上的记录的控制点靠右 靠下的记录控制点靠左，最右到父子记录间隔的一半即60px,最左为起点0
       */

      const controlPointX = ((childrenCount - currentIndex) / childrenCount) * 60;

      return {
        controlPointX,
        ...getPosition($parent, $ele, scale, isStraightLine || advancedSetting.hierarchyViewConnectLine === '1'),
      };
    }
    return {};
  };

  // 绘制连接线
  drawConnector = () => {
    const { data, view = {}, isStraightLine, uniqId } = this.props;
    const { pathId } = data;
    const { advancedSetting = {} } = view;
    const $svgWrap = document.getElementById(`svg-${view.viewId}${pathId.join('-')}-${uniqId}`);

    const position = this.getConnectLinePos(this.props);

    if (isEmpty(position)) return;

    const { height = 0, top = 0, start = [], end = [], controlPointX, straightLineInflection = [] } = position;
    $($svgWrap).height(height).css({ top: -top });

    // 获取控制点
    const controlPoint = [controlPointX, end[1]];
    if ($svgWrap.childElementCount > 0) {
      $svgWrap.childNodes.forEach(child => $svgWrap.removeChild(child));
    }

    const draw = SVG(`svg-${view.viewId}${pathId.join('-')}-${uniqId}`).size('100%', '100%');

    if (advancedSetting.hierarchyViewConnectLine === '1' || isStraightLine) {
      draw.polyline([start, straightLineInflection, end]).stroke({ width: 2, color: '#d3d3d3' }).fill('none');
    } else {
      const linePath = ['M', ...start, 'Q', ...controlPoint, ...end].join(' ');
      draw.path(linePath).stroke({ width: 2, color: '#d3d3d3' }).fill('none');
    }

    if (this.isFirstSkip) this.isFirstSkip = false;
  };
  handleRecordVisible = rowId => {
    if (window.isMingDaoApp && (!window.shareState.shareId || window.APP_OPEN_NEW_PAGE)) {
      const { appId, treeData } = this.props;
      const curInfo = treeData[rowId];
      window.location.href = `/mobile/record/${appId}/${curInfo.wsid}/${rowId}`;
      return;
    }
    handlePushState('page', 'recordDetail');
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
      const relateSheetId = getRelateSheetId(view, data.pathId);
      const currentControls = configIndex > 1 ? hierarchyRelateSheetControls[relateSheetId] : controls;

      const configViewId = _.get(
        _.find(currentControls, item => item.controlId === controlId),
        'viewId',
      );
      const viewControlInfo = viewControls.find(o => o.worksheetId === worksheetId) || {};
      return {
        worksheetId,
        viewId: configViewId,
        viewControl: viewControlInfo,
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
      view = {},
      treeData,
      worksheetInfo,
      isStraightLine,
      uniqId,
    } = this.props;
    const { recordInfoRowId, recordInfoVisible } = this.state;
    const { rowId, path = [], pathId = [] } = data;
    const { rowId: draggingId } = safeParse(localStorage.getItem('draggingHierarchyItem'));
    const recordInfoPara = this.getRecordInfoPara();
    const { advancedSetting = {} } = view;
    const cardwidth = getCardWidth(recordInfoPara.viewControl || view);

    if (recordInfoPara.worksheetId === worksheetInfo.worksheetId) {
      recordInfoPara.rules = worksheetInfo.rules;
    }

    return (
      <Fragment>
        <div
          className={cx('sortableTreeNodeWrap', { isDragging: draggingId === rowId })}
          id={`${pathId.join('-')}-${uniqId}`}
          ref={this.$itemWrap}
        >
          <div
            id={`svg-${view.viewId}${pathId.join('-')}-${uniqId}`}
            className={
              isStraightLine || advancedSetting.hierarchyViewConnectLine === '1' ? 'svgStraightWrap' : 'svgWrap'
            }
            ref={this.$svg}
          />
          <DraggableRecord
            {...this.props}
            drawConnector={this.drawConnector}
            width={cardwidth}
            viewParaOfRecord={recordInfoPara}
            onDelete={() => deleteHierarchyRecord({ rows: [{ rowid: rowId, allowDelete: true }], path, pathId })}
            onUpdate={(value, relateSheet) =>
              updateHierarchyData({ path, pathId, recordId: rowId, value, relateSheet })
            }
            onClick={() => {
              handleRecordClick(view, treeData[rowId], () => {
                this.handleRecordVisible(rowId);
                addBehaviorLog('worksheetRecord', worksheetInfo.worksheetId, { rowId }); // 埋点
              });
            }}
          />
        </div>
        {recordInfoVisible &&
          (isMobile ? (
            <RecordInfoModal
              className="full"
              visible
              appId={appId}
              worksheetId={recordInfoPara.worksheetId}
              enablePayment={worksheetInfo.enablePayment}
              viewId={recordInfoPara.viewId}
              rowId={recordInfoRowId}
              onClose={() => {
                this.setState({ recordInfoVisible: false });
              }}
            />
          ) : (
            <RecordInfoWrapper
              enablePayment={worksheetInfo.enablePayment}
              showPrevNext
              sheetSwitchPermit={sheetSwitchPermit}
              allowAdd={view.allowAdd}
              from={2}
              visible
              recordId={recordInfoRowId}
              projectId={worksheetInfo.projectId}
              relationWorksheetId={getRelateSheetId(view, data.pathId)}
              currentSheetRows={this.getCurrentSheetRows()}
              hideRecordInfo={() => {
                this.setState({ recordInfoVisible: false });
                emitter.emit('ROWS_UPDATE');
              }}
              updateSuccess={(recordIds, value, relateSheet) => {
                if (!_.isUndefined(relateSheet.isviewdata) && !relateSheet.isviewdata) {
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

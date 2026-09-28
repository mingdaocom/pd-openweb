import React, { createRef } from 'react';
import cx from 'classnames';
import _, { find, includes } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Popover } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import SheetContext from 'worksheet/common/Sheet/SheetContext';
import RelateRecordDropdown from 'worksheet/components/RelateRecordDropdown';
import { formatControlToServer } from 'src/components/Form/core/utils';
import ViewHoverRelateRecordCard from 'src/pages/worksheet/views/components/ViewHoverRelateRecordCard.jsx';
import {
  getTitleTextFromControls,
  getTitleTextFromRelateControl,
  renderText as renderCellText,
} from 'src/utils/domain/control/display';
import { WORKSHEETTABLE_FROM_MODULE } from 'src/utils/domain/worksheet/constants';
import { RELATE_RECORD_SHOW_TYPE } from 'src/utils/domain/worksheet/constants';
import { formatRecordToRelateRecord } from 'src/utils/domain/worksheet/record';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { emitter, isKeyBoardInputChar } from 'src/utils/platform/browser/dom';
import { useChildTableDialog } from '../ChildTableDialog';
import EditableCellCon from '../EditableCellCon';
import { useRelateRecordTableDialog } from '../RelateRecordTableDialog';
import RelateRecordTags from './comps/RelateRecordTags';

const RELATE_RECORD_POPOVER_MOTION = { motionName: '' };
// 编辑浮层要盖住单元格本身（浮层左上角对齐单元格左上角），不能用 bottomLeft + 负 offset 模拟。
// Ant Design 浮层底层的 shiftY 贴边回位时会按 `- popupOffsetY` 把 offset 再补一次，首行触顶后
// 浮层会被额外抬高一个行高，整体跑到单元格上方并被表格容器裁掉。这里直接改写对齐点，offset 保持 0。
const RELATE_RECORD_POPOVER_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'tl'],
    overflow: {
      adjustX: true,
      adjustY: false,
      shiftY: true,
    },
  },
};
const RELATE_RECORD_POPOVER_STYLES = {
  container: {
    background: 'transparent',
    boxShadow: 'none',
  },
};

const RecordCardCellRelateRecord = styled.div`
  display: inline-block;
  line-height: 21px;
  font-size: 13px;
  background-color: var(--color-primary-transparent);
  padding: 0 10px;
  border-radius: 3px;
  margin-right: 6px;
`;
const SingleRelateRecordTag = styled.span`
  display: inline-block;
  max-width: 100%;
  height: 21px;
  line-height: 21px;
  padding: 0 6px;
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  background-color: var(--color-primary-transparent);
  border-radius: 3px;
`;
class RelateRecord extends React.Component {
  static contextType = SheetContext;
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    singleLine: PropTypes.bool,
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    updateCell: PropTypes.func,
    updateFailedFlag: PropTypes.number,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
    openChildTable: PropTypes.func,
    openRelateRelateRecordTable: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const records = props.cell.value ? this.parseValue(props.cell.value) : [];
    this.state = {
      records,
      dialogActive: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (prevProps.cell.value !== this.props.cell.value) {
        this.setState({
          records: this.parseValue(this.props.cell.value),
        });
      }

      // 更新失败时接口没有写入，cell.value 保持原值，
      // 下拉面板内累积的选择不会因为 props 变化被覆盖，这里显式丢弃本地未保存的变更
      if (prevProps.updateFailedFlag !== this.props.updateFailedFlag) {
        this.changed = false;
        this.records = undefined;
        this.setState({
          records: this.parseValue(this.props.cell.value),
        });
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.isediting !== nextProps.isediting ||
      this.props.updateFailedFlag !== nextProps.updateFailedFlag ||
      (nextProps.from === 4 && this.props.cell.value !== nextProps.cell.value) ||
      _.isEqual(this.props.cell.style, nextProps.cell.style)
    );
  }

  dropdownRef = React.createRef();
  relateRecordTagsPopup = createRef();

  // 子表、关联记录表格、嵌入视图里的表格容器本身很矮（嵌入场景实测只有 140px），而下拉面板有 300px 以上。
  // 浮层挂在表格容器内时，这个容器会被当成溢出边界，面板被贴着容器底边摆放，
  // 既盖住触发单元格自己，又向上溢出压住表单里的其他字段。
  // 与 Date / Time / Cascader 的处理一致：这三种嵌套场景直接挂 body，让浮层按视口正常翻转。
  getRelateRecordPopupContainer = () => {
    const { tableFromModule, fromEmbed } = this.props;

    if (
      tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ||
      tableFromModule === WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD ||
      fromEmbed
    ) {
      return document.body;
    }

    const container = this.props.popupContainer?.();
    return container?.closest?.('.sheetViewTable') || container || document.body;
  };

  get isSubList() {
    const { tableFromModule } = this.props;
    return tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST;
  }

  // 必须返回 sid 数组：RelateRecordTags 会以它作为 addedIds 初值，再往里追加 record.rowid 字符串，
  // 失焦时 formatRecordToRelateRecord 用 includes(addedIds, record.rowid) 判定 isNew；
  // 而已保存行保存时 formatControlToServer 走增量分支，只提交带 isNew 的记录。
  // 返回记录对象会让 includes 恒为 false，未保存状态下再次点进单元格编辑时，
  // 上一轮新增的关联会全部丢掉 isNew，保存后只剩最后一次加进来的那条。
  get addedIds() {
    const data = safeParse(_.get(this, 'props.cell.value'), 'array');
    return data.filter(r => r.isNew).map(r => r.sid);
  }
  get deletedIds() {
    const data = safeParse(_.get(this, 'props.cell.value'), 'array');
    return (_.get(data, '0.deletedIds') || []).filter(id => !_.find(data, r => r.sid === id));
  }

  parseValue(value = '') {
    if (!value || value[0] !== '[') {
      return [];
    }

    try {
      return safeParse(value, 'array').map(r =>
        r.sourcevalue ? JSON.parse(r.sourcevalue) : { rowid: r.sid, titleValue: r.name },
      );
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  handleTableKeyDown = e => {
    const { tableId, count = 0, recordId, cell, isediting, updateEditingStatus } = this.props;
    const { records } = this.state;
    const canAdd = cell.enumDefault === 2 ? count < 50 : records.length === 0;

    switch (e.key) {
      case 'Escape':
        if (this.state.dialogActive) {
          return;
        }

        this.handleVisibleChange(false);
        break;
      case 'Enter':
        if (isediting && this.relateRecordTagsPopup.current) {
          if (e.shiftKey) {
            this.relateRecordTagsPopup.current.searchRecords();
          } else if (canAdd) {
            this.relateRecordTagsPopup.current.selectRecords();
          }
        }

        break;
      default: {
        if (!e.isInputValue && (isediting || !e.key || !isKeyBoardInputChar(e.key))) {
          break;
        }

        updateEditingStatus(true);
        setTimeout(() => {
          const cellClass = `cell-${tableId}-${recordId}-${cell.controlId}`;
          const input = document.querySelector(`.${CSS.escape(cellClass)} input`);

          if (this.dropdownRef.current && input) {
            this.dropdownRef.current.setState({ keywords: (input.value = e.key) });
          }
        }, 100);
        e.stopPropagation();
        e.preventDefault();
        break;
      }
    }
  };

  getReordsLength(value) {
    let length = 0;

    if (/^\[(.*)\]$/.test(value)) {
      try {
        length = JSON.parse(value).length;
      } catch (err) {
        console.log(err);
      }
    } else {
      length = parseInt(value, 10);
    }

    return length;
  }
  renderSelected() {
    const { isMobileTable, cell = {}, appId } = this.props;
    const { relationControls = [] } = cell;
    let titleControl = _.find(relationControls, c => c.attribute === 1);
    const matchedTitleControl = find(relationControls, { controlId: cell.advancedSetting.showtitleid });

    if (cell.advancedSetting.showtitleid && matchedTitleControl) {
      titleControl = matchedTitleControl;
    }

    let records = [];

    if (!titleControl) {
      return null;
    }

    if (isMobileTable) {
      records = this.state.records;
      return records.map((record, index) => (
        <RecordCardCellRelateRecord className="mobileRelateRecordWrap" key={index}>
          {getTitleTextFromRelateControl(cell, record)}
        </RecordCardCellRelateRecord>
      ));
    } else {
      try {
        records = JSON.parse(cell.value);
      } catch (err) {
        console.log(err);
      }

      return records.map((record, index) => {
        let controlValue = record.name;

        if (record.sourcevalue) {
          try {
            controlValue = JSON.parse(record.sourcevalue)[titleControl.controlId];
          } catch (err) {
            console.log(err);
          }
        } else {
          titleControl = cell.sourceControl;
          controlValue = record.name;
        }

        return (
          <ViewHoverRelateRecordCard
            record={record.sourcevalue ? JSON.parse(record.sourcevalue) : record}
            control={cell}
            {...this.props}
          >
            <RecordCardCellRelateRecord key={index}>
              {renderCellText({ ...titleControl, value: controlValue }, { appId }) ||
                (typeof controlValue === 'undefined' ? _l('未命名') : '')}
            </RecordCardCellRelateRecord>
          </ViewHoverRelateRecordCard>
        );
      });
    }
  }

  handleVisibleChange = visible => {
    const { cell, updateEditingStatus, updateCell, onValidate } = this.props;

    if (!visible && this.changed) {
      const newValue = JSON.stringify(
        formatRecordToRelateRecord(cell.relationControls, this.records).map(r => ({
          ..._.pick(r, ['sid', 'name', 'sourcevalue', 'row']),
        })),
      );
      const validateResult = onValidate(newValue, true);

      if (validateResult.errorType === 'REQUIRED') {
        this.changed = false;
        this.setState({ records: this.parseValue(this.props.cell.value) || [] });
        updateEditingStatus(false);
        alert(_l('%0不能为空', cell.controlName), 3);
        return;
      }

      updateCell({
        value: newValue,
      });
      this.changed = false;
    }

    updateEditingStatus(visible);
  };

  handleRelateRecordTagChange = ({ changed, addedIds, deletedIds, records = [] } = {}) => {
    const { cell, updateEditingStatus, updateCell, onValidate } = this.props;

    if (!changed) {
      updateEditingStatus(false);
      return;
    }

    const newValue = records.length
      ? JSON.stringify(formatRecordToRelateRecord(cell.relationControls, records, { addedIds, deletedIds }))
      : `deleteRowIds: ${deletedIds.join(',')}`;

    const validateResult = onValidate(newValue, true);

    if (validateResult.errorType === 'REQUIRED') {
      this.changed = false;
      this.setState({ records: this.parseValue(this.props.cell.value) || [] });
      updateEditingStatus(false);
      alert(_l('%0不能为空', cell.controlName), 3);
      return;
    }

    // if (_.isEmpty(addedIds) && _.isEmpty(deletedIds)) {
    //   updateEditingStatus(false);
    //   return;
    // }
    if (this.isSubList) {
      updateCell({
        value: newValue,
      });
    } else {
      const data = formatControlToServer({ ...cell, value: newValue }, { needSourceValue: true });
      updateCell({
        editType: data.editType,
        value: data.value,
      });
    }

    updateEditingStatus(false);
  };

  // 关联记录下拉在 mousedown 阶段就会打开浮层并进入编辑态，单元格随之重渲染，
  // 后续的 click 未必还能派发到单元格上，CellControls.clickHandle 也就不会执行。
  // 子表空行正是靠 clickHandle -> onFocusCell 转成新行并初始化默认值的，
  // 这里在进入编辑态前先补一次 focus，保证空行初始化不被跳过。
  focusCell = () => {
    const { onFocusCell } = this.props;

    if (_.isFunction(onFocusCell)) {
      onFocusCell();
    }
  };

  // 补 focus 只针对子表空行。其他行补了以后：经典模式（点整行打开记录）本身不走单元格聚焦，
  // 表格在进入编辑时也只会清掉「和当前单元格不同」的旧焦点，这份自己补上的焦点就没人回收，
  // 退出编辑后蓝色激活边框一直留在单元格上。
  focusCellOfEmptySubListRow = () => {
    if (/^empty/.test(String(this.props.recordId || ''))) {
      this.focusCell();
    }
  };

  handleDropdownMouseDown = event => {
    // Ant Design 6 在 clear 的 mousedown 阶段执行清空；在冒泡阶段拦截外层事件，
    // 避免 Select 关闭下拉并结束单元格编辑态，导致清除后的状态更新被卸载。
    if (event.target.closest?.('.hap-select-clear')) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // 只有子表空行需要在 mousedown 阶段补 focus：空行靠 onFocusCell 转成新行并初始化默认值。
    // 普通行如果也补，随后的 click 就会命中 CellControls 的「已聚焦 → 进入编辑」分支，
    // 经典模式下第一次点击就展开下拉，丢掉「先聚焦，再点击或回车展开」的两段式交互。
    this.focusCellOfEmptySubListRow();
  };

  render() {
    const {
      projectId,
      appId,
      isCharge,
      viewId,
      tableId,
      isTrash,
      singleLine,
      className,
      style,
      rowIndex,
      from,
      rowFormData = () => [],
      recordId,
      worksheetId,
      rowHeightEnum = 0,
      sheetSwitchPermit,
      count,
      row = {},
      cell,
      editable,
      isediting,
      updateEditingStatus,
      popupContainer,
      onClick,
      isDraft,
      isMobileTable,
      updateFailedFlag,
    } = this.props;
    const { addedIds = [], deletedIds = [] } = this.isSubList ? this : {};
    let { records } = this.state;
    const { isRequestingRelationControls } = this.context || {};
    const { advancedSetting = {} } = cell;
    const isSubList = cell.type === 34;
    const isMultiple = cell.enumDefault === 2;
    const { showtype, allowlink, ddset } = advancedSetting; // 1 卡片 2 列表 3 下拉
    const allowOpenList = !isMobileTable && from !== 21 && !isTrash && worksheetId && recordId;
    const recordsLength = this.getReordsLength(cell.value);
    let showCount = recordsLength >= 1000 ? '999+' : recordsLength;

    if (isSubList && recordsLength >= 1000) {
      showCount = 1000;
    }

    if (isRequestingRelationControls) {
      return <div className={className} style={style} onClick={onClick} />;
    }

    if (advancedSetting.showcount === '1') {
      showCount = _l('查看');
    }

    if (
      includes(
        [RELATE_RECORD_SHOW_TYPE.LIST, RELATE_RECORD_SHOW_TYPE.TABLE, RELATE_RECORD_SHOW_TYPE.TAB_TABLE],
        parseInt(showtype, 10),
      ) ||
      isSubList ||
      (isMobileTable && cell.enumDefault === 2) // h5子表内关联多条呈现计数
    ) {
      return (
        <div className={className} style={style} onClick={onClick}>
          {recordsLength > 0 && (
            <div
              className={cx('cellRelateRecordMultiple', { allowOpenList })}
              onClick={e => {
                if (!allowOpenList || browserIsMobile() || row.fakeCreatedAt) {
                  return;
                }

                e.stopPropagation();
                if (isSubList) {
                  this.props.openChildTable({
                    openFrom: 'cell',
                    allowEdit: editable && from !== 4,
                    title: getTitleTextFromControls(_.isFunction(rowFormData) ? rowFormData() : rowFormData),
                    entityName: cell.sourceEntityName,
                    appId,
                    worksheetId,
                    viewId,
                    from,
                    control: { ...cell, isDraft: from === 21 || isDraft },
                    controls: cell.relationControls,
                    recordId,
                    sheetSwitchPermit,
                    masterData: {
                      worksheetId,
                      appId,
                      formData: (_.isFunction(rowFormData) ? rowFormData() : rowFormData)
                        .map(c =>
                          _.pick(c, ['controlId', 'type', 'value', 'options', 'sourceControl', 'sourceControlType']),
                        )
                        .filter(c => !!c.value),
                    },
                    projectId,
                  });
                } else {
                  this.props.openRelateRelateRecordTable({
                    openFrom: 'cell',
                    title: getTitleTextFromControls(_.isFunction(rowFormData) ? rowFormData() : rowFormData),
                    appId,
                    viewId,
                    worksheetId,
                    recordId,
                    isCharge,
                    control: { ...cell, isDraft: from === 21 || isDraft },
                    allowEdit: editable,
                    formdata: _.isFunction(rowFormData) ? rowFormData() : rowFormData,
                    onUpdateCount: () => {
                      if (!editable) return;
                      emitter.emit('RELOAD_RECORD_INFO', {
                        worksheetId,
                        recordId,
                      });
                    },
                  });
                }
              }}
            >
              <i className={cx('icon', isSubList ? 'icon-table' : 'icon-link_record')}></i>
              {showCount}
            </div>
          )}
        </div>
      );
    } else if (from === 4 || (from === 21 && browserIsMobile())) {
      return this.renderSelected();
    } else if (parseInt(showtype, 10) === RELATE_RECORD_SHOW_TYPE.DROPDOWN) {
      return (
        <EditableCellCon
          className={cx(className, 'cellRelateRecord cellRelateRecordDropdown', {
            canedit: editable,
            focusInput: editable,
          })}
          style={
            isediting && isMultiple
              ? { ...style, overflow: 'visible', zIndex: 3, height: this.isSubList ? style.height : 'auto' }
              : style
          }
          conRef={this.cell}
          hideOutline
          onClick={onClick}
          iconName={'arrow-down-border'}
          isediting={isediting}
          onIconClick={() => {
            this.focusCellOfEmptySubListRow();
            updateEditingStatus(true);
          }}
        >
          <RelateRecordDropdown
            appId={appId}
            // 更新失败后按行数据里的原值重建下拉，清掉面板内累积的选中项和增删标记
            key={`relateRecordDropdown-${updateFailedFlag || 0}`}
            ref={this.dropdownRef}
            insheet
            disabled={!editable || !isediting}
            selected={records}
            cellFrom={from}
            control={{ ...cell, formData: rowFormData, worksheetId, recordId, isDraft }}
            isDraft={isDraft}
            isSubList={this.isSubList}
            formData={rowFormData}
            viewId={cell.viewId}
            worksheetId={worksheetId}
            recordId={recordId}
            dataSource={cell.dataSource}
            entityName={cell.sourceEntityName}
            enumDefault2={cell.enumDefault2}
            parentWorksheetId={worksheetId}
            controlId={cell.controlId}
            controls={cell.relationControls}
            coverCid={cell.coverCid}
            required={cell.required}
            showControls={cell.showControls}
            allowOpenRecord={allowlink === '1'}
            showCoverAndControls={ddset === '1' || parseInt(showtype, 10) === RELATE_RECORD_SHOW_TYPE.CARD}
            isediting={isediting}
            popupContainer={this.getRelateRecordPopupContainer}
            multiple={isMultiple}
            isMobileTable={isMobileTable}
            sheetSwitchPermit={sheetSwitchPermit}
            onVisibleChange={this.handleVisibleChange}
            selectedClassName={cx('sheetview', `cell-${tableId}-${recordId}-${cell.controlId}`, {
              canedit: editable,
              singleLine,
            })}
            // 宽度固定成单元格宽度（多行行高下扣掉左右各 5px 外边距）：
            // 一来宽度确定后标签的 max-width 百分比才有可靠基准，标签可以自己省略，
            // 不必靠 flex 收缩限制宽度（见 CellControls.less）；
            // 二来编辑态若按内容撑开（width: auto），没有关联记录时整个输入区只剩搜索框那几个像素。
            selectedStyle={{
              width: isMultiple && !singleLine ? 'calc(100% - 10px)' : '100%',
              // 编辑态撑满单元格：大行高下 Select 只有一行控件高，激活边框会框不住整个单元格
              minHeight: isediting ? style.height : undefined,
            }}
            onChange={newRecords => {
              this.records = newRecords;
              this.changed = true;
              // this.setState({ records: newRecords, changed: true });
            }}
            onClose={() => {
              updateEditingStatus(false);
            }}
            selectProps={{
              onMouseDown: this.handleDropdownMouseDown,
              labelRender: isMultiple
                ? undefined
                : ({ label }) =>
                    singleLine && React.isValidElement(label) ? (
                      label
                    ) : (
                      <SingleRelateRecordTag className="ellipsis">{label}</SingleRelateRecordTag>
                    ),
              styles: {
                root: {
                  '--hap-control-height': isMultiple ? undefined : '34px',
                  // 编辑态不铺自己的底色：单元格本身已经有底色（行 hover、选中行是半透明蓝），
                  // 浮层再刷一层白会和所在行明显不一致
                  background: isediting ? 'transparent' : undefined,
                  borderWidth: '2px',
                  borderRadius: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                  padding: 0,
                  // 多选编辑态不再额外加上下外边距：Select 自身就有 34px 的控件高度，
                  // 再上下各留 5px 会把单元格撑到 44px，比行高高出一截
                  margin: !isMultiple || !singleLine ? '0 5px' : undefined,
                  zIndex: 1,
                },
                item: {
                  '--color-link': 'var(--hap-select-color)',
                  '--hap-select-multi-item-background': 'var(--color-primary-transparent)',
                },
                content: {
                  '--color-link': 'var(--hap-select-color)',
                  '--hap-select-show-arrow-padding-inline-end': '10px',
                },
                clear: {
                  'inset-inline-end': '0px',
                },
              },
            }}
          />
        </EditableCellCon>
      );
    } else if (parseInt(showtype, 10) === RELATE_RECORD_SHOW_TYPE.CARD) {
      // props.count 取自行数据里服务端下发的 rq 计数，是加载时的快照，单元格内新增/删除关联记录后不会同步。
      // 本地明细比它多时说明存在尚未同步的新增（如已保存的子表行在单元格内新建记录），
      // 此时按行高裁剪会让新增的记录既显示不出来，又因为 records.length < count 不成立而不出现“更多”入口，
      // 看起来像记录丢了；编辑浮层同样会拿到半截明细，失焦回写时把没渲染出来的那几条一起丢掉。
      // 这种情况以本地明细为准，与新建行、默认值行保持一致。
      const hasUnsyncedRecords = records.length > (Number(count) || 0);
      records =
        /^temp|default/.test(recordId) || hasUnsyncedRecords ? records : records.slice(0, [5, 10][rowHeightEnum] || 20);
      if (!isediting) {
        return (
          <EditableCellCon
            className={cx(className, 'cellRelateRecord', { canedit: editable })}
            style={style}
            conRef={this.cell}
            onClick={onClick}
            iconName={'link_record'}
            isediting={isediting}
            onIconClick={() => updateEditingStatus(true)}
          >
            <RelateRecordTags
              key={recordId}
              from={from}
              appId={appId}
              projectId={projectId}
              isDraft={isDraft}
              disabled
              count={count}
              style={style}
              control={cell}
              records={records}
              addedIds={addedIds}
              deletedIds={deletedIds}
              recordId={recordId}
              worksheetId={worksheetId}
              allowOpenRecord={allowlink === '1'}
              rowFormData={rowFormData}
              sheetSwitchPermit={sheetSwitchPermit}
            />
          </EditableCellCon>
        );
      } else {
        return (
          <Popover
            builtinPlacements={RELATE_RECORD_POPOVER_PLACEMENTS}
            content={
              <RelateRecordTags
                key={recordId}
                from={from}
                appId={appId}
                projectId={projectId}
                isDraft={isDraft}
                rowIndex={rowIndex}
                isSubList={this.isSubList}
                ref={this.relateRecordTagsPopup}
                isediting
                count={count}
                style={style}
                control={cell}
                records={records}
                addedIds={addedIds}
                deletedIds={deletedIds}
                recordId={recordId}
                worksheetId={worksheetId}
                allowOpenRecord={allowlink === '1'}
                rowFormData={rowFormData}
                sheetSwitchPermit={sheetSwitchPermit}
                onClose={this.handleRelateRecordTagChange}
                onCloseDialog={() => {
                  setTimeout(() => {
                    this.setState({ dialogActive: false });
                  }, 100);
                }}
                onOpenDialog={() => this.setState({ dialogActive: true })}
              />
            }
            getPopupContainer={() =>
              rowIndex === 0 && this.isSubList
                ? document.querySelector(`.worksheetTableComp.id-${tableId}-id`) || document.body
                : popupContainer()
            }
            motion={RELATE_RECORD_POPOVER_MOTION}
            open={isediting}
            placement="bottomLeft"
            noPadding
            styles={RELATE_RECORD_POPOVER_STYLES}
            trigger={[]}
          >
            <div className={className} style={style} onClick={onClick} />
          </Popover>
        );
      }
    } else {
      return <span />;
    }
  }
}

export default withOpeners(RelateRecord, {
  openChildTable: useChildTableDialog,
  openRelateRelateRecordTable: useRelateRecordTableDialog,
});

import React from 'react';
import cx from 'classnames';
import _, { find, get, uniq } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import { RecordFormContext } from 'worksheet/common/recordInfo/RecordForm';
import RelateRecordCards from 'worksheet/components/RelateRecordCards';
import { FROM } from 'src/components/Form/core/config';
import { useSelectRecords } from 'src/components/SelectRecords';
import NewRecord from 'src/pages/worksheet/common/newRecord/NewRecord';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import { updateRelateRecordSorts } from 'src/pages/worksheet/controllers/record';
import ViewHoverRelateRecordCard from 'src/pages/worksheet/views/components/ViewHoverRelateRecordCard.jsx';
import { getTitleTextFromRelateControl } from 'src/utils/domain/control/display';
import { checkIsTextControl } from 'src/utils/domain/control/type';
import { withKeepShowRowIds } from 'src/utils/domain/control/value';
import { getTranslateInfo } from 'src/utils/services/app';
import RelateRecordList from './RelateRecordList';
import './style.less';

const getDefaultPopupContainer = () => document.body;

const OnlyScanTip = styled.div`
  padding: 10px 16px;
  color: var(--color-text-tertiary);
  .clearBtn {
    padding: 6px 16px;
    margin: 0 -16px 6px;
    cursor: pointer;
    color: var(--color-text-tertiary);
    &:hover {
      background: var(--color-primary-transparent);
    }
  }
`;

const MAX_COUNT = 50;
const DEFAULT_SELECT_PROPS = { hideRemoveIconOnBlur: true };

// 仅在下拉由关闭转为展开时自增，避免同一次展开内 openPopup 被重复调用（表格内 didMount 与 didUpdate 各触发一次）时列表二次加载
const getNextPopupKey = ({ listvisible, popupKey }) => (listvisible ? popupKey : popupKey + 1);

class RelateRecordDropdown extends React.Component {
  static propTypes = {
    disableNewRecord: PropTypes.bool,
    isQuickFilter: PropTypes.bool,
    insheet: PropTypes.bool,
    isFormDetail: PropTypes.bool,
    isediting: PropTypes.bool,
    disabled: PropTypes.bool,
    multiple: PropTypes.bool,
    allowOpenRecord: PropTypes.bool, // 是否允许查看记录
    className: PropTypes.string,
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    selected: PropTypes.arrayOf(PropTypes.shape({})),
    selectedClassName: PropTypes.string,
    selectedStyle: PropTypes.shape({}),
    selectProps: PropTypes.shape({}),
    popupContainer: PropTypes.func,
    prefixRecords: PropTypes.arrayOf(PropTypes.shape({})),
    staticRecords: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func,
    onClick: PropTypes.func,
    onVisibleChange: PropTypes.func,
    openSelectRecords: PropTypes.func,
  };

  static defaultProps = {
    onVisibleChange: () => {},
    onChange: () => {},
    onClick: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      listvisible: false,
      // 每次展开自增，作为下拉列表的 key 强制重建：
      // rc-trigger 的 PopupContent 在关闭后会 memo 冻结 popup 内容(cache = !open && !fresh)，
      // 且 antd Select 不透传 fresh，导致条件渲染无法卸载列表，重新展开会复用旧实例而不再拉数据
      popupKey: 0,
      newrecordVisible: false,
      selectDialogVisible: false,
      selected: props.selected || [],
      defaultSelected: props.selected || [],
      keywords: '',
      activeIndex: undefined,
      deletedIds: [],
      addedIds: [],
      newOptionsControlsForRelationControls: [],
    };
    this.initSearchControl(props);
    this.focusInput = this.focusInput.bind(this);
  }

  componentDidMount() {
    if (this.props.isediting) {
      if (this.canSelect) {
        setTimeout(() => {
          this.openPopup();
          this.focusEditingInput();
        }, 10);
      } else if (this.canCreateRecord) {
        if (this.props.selected.length > 0 && this.props.multiple) {
          return;
        }

        if (this.props.multiple && this.props.selected.length >= MAX_COUNT) {
          alert(_l('最多关联%0条', MAX_COUNT), 3);
          return;
        }

        this.openNewRecord();
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      // 表格内退出编辑态，提交面板内累积的变更
      if (prevProps.isediting && !this.props.isediting) {
        this.commitChange();
      }

      if (!_.isEqual(prevProps.selected, this.props.selected)) {
        this.setState({
          selected: this.props.selected,
        });
      }

      if (this.props.flag !== prevProps.flag) {
        this.setState({
          addedIds: [],
          deletedIds: [],
          defaultSelected: this.props.selected || [],
        });
      }

      if (
        _.get(this.props, 'control.advancedSetting.searchcontrol') !==
          _.get(prevProps, 'control.advancedSetting.searchcontrol') ||
        !_.isEqual(_.get(prevProps, 'control.relationControls'), _.get(this.props, 'control.relationControls'))
      ) {
        this.initSearchControl(this.props);
      }

      if (this.props.insheet && prevProps.isediting !== this.props.isediting) {
        if (this.props.isediting && this.canSelect && !this.state.newrecordVisible) {
          this.openPopup();
          this.focusEditingInput();
        } else if (!this.props.isediting && this.state.listvisible) {
          this.setState({ listvisible: false });
        }
      }
    }
  }

  inputForIOSKeyboardRef = React.createRef();
  cell = React.createRef();
  list = React.createRef();
  select = React.createRef();
  // 面板内累积、尚未向外提交的变更
  pendingChange = false;
  // 标记选择弹层是否完成了确认选择，用于区分单选确认和单纯关闭弹层。
  selectDialogHasSelection = false;

  get active() {
    const { isediting } = this.props;
    const { listvisible } = this.state;
    return isediting || listvisible;
  }

  get canSelect() {
    return this.props.enumDefault2 !== 10 && this.props.enumDefault2 !== 11;
  }

  get canCreateRecord() {
    return this.props.enumDefault2 === 10;
  }

  get allowRemove() {
    const { multiple } = this.props;
    return !multiple || _.get(this.props, 'control.advancedSetting.allowcancel') !== '0';
  }

  get control() {
    const { control } = this.props;
    const { newOptionsControlsForRelationControls } = this.state;
    return {
      ...control,
      relationControls: control.relationControls.map(
        c => find(newOptionsControlsForRelationControls, { controlId: c.controlId }) || c,
      ),
    };
  }

  get entityName() {
    const { appId, control } = this.props;
    return getTranslateInfo(appId, null, control.dataSource).recordName || this.props.entityName;
  }

  initSearchControl(props) {
    const { control = {} } = props;
    const { searchcontrol } = control.advancedSetting || {};
    let searchControl;
    // 是否为用户在「用户查询」中指定了具体搜索字段；未指定时（搜索内容=所有文本类型字段）
    // 下面回退到标题字段仅用于新建记录预填，不代表只能搜标题
    let isAssignedSearchControl = false;

    if (searchcontrol) {
      searchControl = _.find(control.relationControls, { controlId: searchcontrol });
      isAssignedSearchControl = !!searchControl;
    }

    if (!searchControl) {
      searchControl = _.find(control.relationControls, { attribute: 1 });
    }

    this.searchControl = searchControl;
    this.isAssignedSearchControl = isAssignedSearchControl;
  }

  getDefaultRelateSheetValue() {
    try {
      const { formData, controlId, recordId, worksheetId } = this.props.control;
      const formDataArray = typeof formData === 'function' ? formData() : formData;
      const titleControl = _.find(formDataArray, control => control.attribute === 1);
      const defaultRelatedSheetValue = {
        name: titleControl.value,
        sid: recordId,
        type: 8,
        sourcevalue: JSON.stringify({
          ..._.assign(...formDataArray.map(c => ({ [c.controlId]: c.value }))),
          [titleControl.controlId]: titleControl.value,
          rowid: recordId,
        }),
      };

      if (titleControl.type === 29) {
        try {
          const cellData = JSON.parse(titleControl.value);
          defaultRelatedSheetValue.name = cellData[0].name;
        } catch (err) {
          console.log(err);
          defaultRelatedSheetValue.name = '';
        }
      }

      return {
        worksheetId,
        relateSheetControlId: controlId,
        value: defaultRelatedSheetValue,
      };
    } catch (err) {
      console.log(err);
      return;
    }
  }

  openPopup = () => {
    if (!this.cell.current) {
      this.setState(
        oldState => ({
          listvisible: true,
          popupKey: getNextPopupKey(oldState),
        }),
        this.focusInput,
      );
      return;
    }

    const cellToTop = this.cell.current.getBoundingClientRect().top;
    let isTop = window.innerHeight - this.cell.current.clientHeight - cellToTop < 360;
    this.setState(
      oldState => ({
        renderToTop: isTop,
        listvisible: true,
        cellToTop,
        popupKey: getNextPopupKey(oldState),
      }),
      this.focusInput,
    );
  };

  // 提供给表单 Tab 事件调用的关闭方法
  closePopup = () => {
    const { onVisibleChange } = this.props;
    this.commitChange();
    this.setState(
      {
        listvisible: false,
      },
      () => {
        onVisibleChange(false);
      },
    );
  };

  handleAdd = (record, cb = () => {}, { defer } = {}) => {
    const { multiple } = this.props;
    const { selected } = this.state;

    if (multiple && selected.length >= MAX_COUNT) {
      alert(_l('最多关联%0条', MAX_COUNT), 3);
      return;
    }

    if (!_.find(selected, r => r.rowid === record.rowid)) {
      this.setState(
        oldState => ({
          selected: multiple ? oldState.selected.concat(record) : [record],
          addedIds: oldState.addedIds.concat(record.rowid),
        }),
        () => {
          this.handleChange({ defer });
          cb();
        },
      );
    }
  };

  // 批量选择记录，合并为一次变更，避免逐条触发表单联动、业务规则和工作表查询
  handleAddRecords = records => {
    const { selected } = this.state;
    const newRecords = _.uniqBy(
      records.filter(record => !_.find(selected, r => r.rowid === record.rowid)),
      'rowid',
    );

    if (_.isEmpty(newRecords)) {
      return;
    }

    const restCount = MAX_COUNT - selected.length;

    if (newRecords.length > restCount) {
      alert(_l('最多关联%0条', MAX_COUNT), 3);
    }

    if (restCount <= 0) {
      return;
    }

    const addedRecords = newRecords.slice(0, restCount);

    this.setState(
      oldState => ({
        selected: oldState.selected.concat(addedRecords),
        addedIds: oldState.addedIds.concat(addedRecords.map(r => r.rowid)),
      }),
      this.handleChange,
    );
  };

  handleClear = () => {
    const { onVisibleChange } = this.props;
    const { selected } = this.state;
    this.setState(
      {
        selected: [],
        deletedIds: selected.map(r => r.rowid),
        listvisible: false,
      },
      () => {
        this.handleChange();
        onVisibleChange(false);
      },
    );
  };

  handleClearMouseDown = event => {
    // Ant Design 6 的单选 Select 会在 clear 按钮 mousedown 时先关闭下拉，
    // showDialogSelect 场景随即卸载 clear 按钮，导致它收不到真正执行清除的 click。
    if (event.target.closest?.('.hap-select-clear')) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.handleClear();
  };

  handleDelete = (record, { defer } = {}) => {
    const { selected, deletedIds = [] } = this.state;
    this.setState(
      {
        selected: selected.filter(r => r.rowid !== record.rowid),
        deletedIds: _.uniq(deletedIds.concat(record.rowid)),
      },
      () => this.handleChange({ defer }),
    );
  };

  handleItemClick = record => {
    const { multiple, onVisibleChange } = this.props;
    const { selected } = this.state;

    if (multiple && record.rowid !== 'isEmpty') {
      const selectedRecord = _.find(selected, r => record.rowid === r.rowid);

      if (selectedRecord) {
        if (this.allowRemove || selectedRecord.isNewAdd) {
          this.handleDelete(record, { defer: true });
        }
      } else {
        this.handleAdd(_.assign({}, record, { isNewAdd: true }), undefined, { defer: true });
      }

      return;
    } else {
      this.setState({ selected: [record], listvisible: false }, () => {
        this.handleChange();
        onVisibleChange(false);
        this.setState({ newrecordVisible: false });
      });
    }
  };

  openNewRecord = () => {
    const { multiple } = this.props;
    const { selected } = this.state;

    if (multiple && selected.length >= MAX_COUNT) {
      alert(_l('最多关联%0条', MAX_COUNT), 3);
      return;
    }

    this.commitChange();
    this.setState({ newrecordVisible: true, listvisible: false });
  };

  handleInputKeyDown = e => {
    const list = get(this, 'list.current');

    if (e.key === 'ArrowUp' && list) {
      e.preventDefault();
      e.stopPropagation();
      list.updateActiveId(-1);
    } else if (e.key === 'ArrowDown' && list) {
      e.preventDefault();
      e.stopPropagation();
      list.updateActiveId(1);
    } else if (e.key === 'Enter' && list) {
      e.preventDefault();
      e.stopPropagation();
      list.handleEnter();
    }
  };

  // 向外提交值变更
  emitChange() {
    const { onChange } = this.props;
    let { selected, addedIds, deletedIds } = this.state;

    if (selected.length > 1 && _.find(selected, { rowid: 'isEmpty' })) {
      selected = selected.filter(r => r.rowid !== 'isEmpty');
    }

    this.pendingChange = false;
    onChange(selected, { addedIds, deletedIds });
  }

  // 提交下拉面板内累积的变更，面板关闭时调用
  commitChange = () => {
    if (this.pendingChange) {
      this.emitChange();
    }
  };

  handleChange({ defer } = {}) {
    const { multiple, doNotClearKeywordsWhenChange } = this.props;

    if (multiple) {
      this.focusInput();
    }

    if (
      !doNotClearKeywordsWhenChange ||
      this.list.current?.areSearchResultsSelected(this.state.keywords, this.state.selected)
    ) {
      this.setState({ keywords: '' });
    }

    // 多选面板内连续勾选时累积变更，等面板关闭再合并提交一次，
    // 避免每勾选一条都触发表单联动、业务规则重算和工作表查询
    if (defer && multiple && this.active) {
      this.pendingChange = true;
      return;
    }

    this.emitChange();
  }

  focusInput() {
    this.select.current?.focus();
  }

  // 表格内的下拉由单元格编辑态（isediting）受控展开，Select 并没有被用户直接点到，
  // 不显式 focus 就拿不到焦点、也落不到搜索框，键盘输入无处可去。
  focusEditingInput() {
    if (!this.props.insheet || this.props.disabled) {
      return;
    }

    this.focusInput();
  }

  canOpenRecord(record) {
    const { allowOpenRecord, isMobileTable } = this.props;
    return !!record && allowOpenRecord && !isMobileTable && !/^temp/.test(record.rowid);
  }

  getSelectValue(record, index) {
    return record.rowid || record.sid || `current-record-${index}`;
  }

  get canDragRecords() {
    const { control, disabled, multiple } = this.props;
    const { selected } = this.state;

    return (
      multiple &&
      get(control, 'advancedSetting.allowdrag') === '1' &&
      this.active &&
      selected.length > 1 &&
      selected.length <= MAX_COUNT &&
      !disabled
    );
  }

  handleSortRecords = (draggedRecord, targetRecord) => {
    const { control, formIsEditing, from, isDraft, isSubList, parentWorksheetId, recordId } = this.props;
    const { selected } = this.state;
    const draggedIndex = selected.indexOf(draggedRecord);
    const targetIndex = selected.indexOf(targetRecord);

    if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) {
      return;
    }

    const newSelected = [...selected];
    const [record] = newSelected.splice(draggedIndex, 1);

    newSelected.splice(targetIndex, 0, record);
    if (formIsEditing || !recordId || isSubList) {
      this.setState({ selected: newSelected }, this.handleChange);
      return;
    }

    this.setState({ selected: newSelected });
    updateRelateRecordSorts({
      worksheetId: parentWorksheetId,
      recordId,
      isDraft: isDraft || from === FROM.DRAFT,
      changes: [
        {
          ...control,
          editType: 31,
          value: JSON.stringify(newSelected.map(item => ({ sid: item.rowid }))),
        },
      ],
    });
  };

  renderRecordLabel(record) {
    const { multiple } = this.props;
    const title = getTitleTextFromRelateControl(this.control, record);
    const text = record.rowid ? title : _l('关联当前%0', this.entityName);
    const canOpenRecord = this.canOpenRecord(record);
    const canDrag = this.canDragRecords;

    if (!canOpenRecord && !canDrag) {
      return text;
    }

    const label = (
      <span
        className={cx('RelateRecordDropdown-recordLabel', { clickable: canOpenRecord, normalSelectedItem: !multiple })}
        title={title}
        draggable={canDrag}
        onMouseDown={e => {
          const canOpenUnfocusedRecord = canOpenRecord && !e.currentTarget.closest('.hap-select-focused');

          if (canOpenUnfocusedRecord || canDrag) {
            e.stopPropagation();
          }

          if (canOpenUnfocusedRecord) {
            e.preventDefault();
          }
        }}
        onClick={e => {
          if (canOpenRecord && !e.currentTarget.closest('.hap-select-focused')) {
            e.stopPropagation();
            this.setState({ previewRecord: { recordId: record.rowid } });
          }
        }}
        onDragStart={e => {
          this.draggedRecord = record;
          e.stopPropagation();
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', record.rowid || 'relate-record');
        }}
        onDragOver={e => {
          if (canDrag) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onDrop={e => {
          e.preventDefault();
          e.stopPropagation();
          this.handleSortRecords(this.draggedRecord, record);
          this.draggedRecord = undefined;
        }}
        onDragEnd={() => {
          this.draggedRecord = undefined;
        }}
      >
        {text}
      </span>
    );

    return canOpenRecord ? (
      <ViewHoverRelateRecordCard record={record} {...this.props}>
        {label}
      </ViewHoverRelateRecordCard>
    ) : (
      label
    );
  }

  getSelectOptions() {
    const { multiple } = this.props;
    const { selected } = this.state;

    return selected.map((record, index) => ({
      value: this.getSelectValue(record, index),
      label: this.renderRecordLabel(record),
      disabled: multiple && !(this.allowRemove || record.isNewAdd),
      record,
    }));
  }

  renderPopup({ disabledManualWrite }) {
    const {
      appId,
      isSubList,
      isQuickFilter,
      getFilterRowsGetType,
      multiple,
      control,
      formData,
      insheet,
      disableNewRecord,
      prefixRecords,
      staticRecords,
      onVisibleChange,
      onChange,
    } = this.props;
    const formDataArray = typeof formData === 'function' ? formData() : formData;
    const {
      keywords,
      selected,
      listvisible,
      popupKey,
      renderToTop,
      cellToTop,
      activeIndex,
      deletedIds,
      defaultSelected,
    } = this.state;
    return (
      <div
        className="scrollInTable"
        onMouseDown={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {disabledManualWrite && (
          <OnlyScanTip>
            {!insheet && !!selected.length && (
              <div className="clearBtn" onClick={this.handleClear}>
                {_l('清除')}
              </div>
            )}
            {_l('请在移动端扫码添加关联')}
          </OnlyScanTip>
        )}
        {listvisible && !disabledManualWrite && (
          <RelateRecordList
            key={popupKey}
            appId={appId}
            ref={this.list}
            isSubList={isSubList}
            getFilterRowsGetType={getFilterRowsGetType}
            isQuickFilter={isQuickFilter}
            activeIndex={activeIndex}
            keyWords={keywords}
            isDraft={control.isDraft}
            isCharge={control.isCharge}
            searchControl={this.searchControl}
            control={control}
            formData={formDataArray}
            prefixRecords={prefixRecords}
            staticRecords={staticRecords}
            ignoreRowIds={
              // 自定义填写、自定义事件清空关联记录后，仍需把源记录原关联的 rowid 放行，服务端才会返回这些记录
              multiple
                ? withKeepShowRowIds(uniq(deletedIds.concat(selected.map(r => r.rowid))), control)
                : withKeepShowRowIds(uniq((defaultSelected || []).map(r => r.rowid)), control)
            }
            maxHeight={renderToTop && cellToTop}
            entityName={this.entityName}
            {..._.pick(this.props, [
              'from',
              'viewId',
              'dataSource',
              'parentWorksheetId',
              'recordId',
              'controlId',
              'multiple',
              'coverCid',
              'showControls',
              'showCoverAndControls',
              'fastSearchControlArgs',
            ])}
            selectedIds={selected.map(r => r.rowid)}
            onItemClick={this.handleItemClick}
            onChange={records => {
              this.setState({ keywords: '' });
              if (multiple) {
                this.handleAddRecords(records.map(record => _.assign({}, record, { isNewAdd: true })));
              } else {
                onChange(records);
                onVisibleChange(false);
              }
            }}
            onClear={this.handleClear}
            allowNewRecord={this.props.enumDefault2 !== 1 && this.props.enumDefault2 !== 11 && !disableNewRecord}
            onNewRecord={this.openNewRecord}
            focusInput={() => {
              this.focusInput();
            }}
          />
        )}
      </div>
    );
  }

  getPlaceholder() {
    const { control, insheet, isQuickFilter } = this.props;

    if (!this.active && !insheet && control.hint) {
      return control.hint;
    }

    if (this.active && this.canSelect && this.searchControl) {
      return this.isAssignedSearchControl ? _l('搜索%0', this.searchControl.controlName) : _l('搜索');
    }

    return isQuickFilter ? _l('请选择') : null;
  }

  renderSelectDialogSuffix() {
    const {
      control,
      recordId,
      coverCid,
      showControls,
      appId,
      parentWorksheetId,
      viewId,
      isediting,
      insheet,
      multiple,
      formData,
      from,
      disabled,
      onChange,
    } = this.props;
    const { selected, deletedIds } = this.state;
    const showDialogSelect =
      get(control, 'advancedSetting.openfastfilters') === '1' || this.props.forceShowDialogSelect;

    if (disabled) {
      return null;
    }

    if (this.canCreateRecord && (!insheet || isediting)) {
      return (
        <i
          className="icon icon-plus hoverColorPrimary"
          onMouseDown={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={e => {
            e.stopPropagation();
            this.openNewRecord();
          }}
        />
      );
    }

    if (!showDialogSelect || (insheet && !isediting)) {
      return undefined;
    }

    const formDataArray = typeof formData === 'function' ? formData() : formData;
    return (
      <i
        className="icon icon-table hoverColorPrimary"
        onMouseDown={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={e => {
          e.stopPropagation();
          this.setState({
            selectDialogVisible: true,
            // 公开表单的弹层与下拉不共用层级容器，展开弹层时需要彻底关闭下拉而不只是让位
            ...(from === FROM.PUBLIC_ADD ? { listvisible: false } : null),
          });
          this.selectDialogHasSelection = false;
          this.props.openSelectRecords({
            control,
            controlId: control.controlId,
            recordId,
            isCharge: control.isCharge,
            multiple,
            coverCid,
            appId,
            viewId,
            formData: formDataArray,
            relateSheetId: control.dataSource,
            parentWorksheetId,
            showControls,
            needHideRowIds: selected.map(r => r.rowid),
            ignoreRowIds: withKeepShowRowIds(deletedIds, control),
            onOk: records => {
              this.selectDialogHasSelection = true;
              this.setState({ keywords: '' });
              if (multiple) {
                this.handleAddRecords(records.map(record => _.assign({}, record, { isNewAdd: true })));
              } else {
                onChange(records);
              }
            },
            onClose: () => {
              const shouldCloseAfterSelect = !multiple && this.selectDialogHasSelection;
              this.selectDialogHasSelection = false;

              if (shouldCloseAfterSelect) {
                // 单选弹层确认选择后结束当前单元格编辑态；
                // 与 listvisible 合并成一次 setState：分两次会有中间帧 selectDialogVisible 已 false
                // 而 listvisible 仍为 true，浮层会闪现一下再收起
                this.commitChange();
                this.setState({ selectDialogVisible: false, listvisible: false }, () => {
                  this.props.onVisibleChange(false);
                });
              } else {
                // 取消弹层或多选操作后保留下拉面板，支持继续选择记录
                this.setState({ selectDialogVisible: false }, () => {
                  this.openPopup();
                });
              }
            },
            isDraft: control.isDraft,
          });
        }}
      />
    );
  }

  render() {
    const {
      from,
      appId,
      multiple,
      isDraft,
      insheet,
      isFormDetail,
      isediting,
      control = {},
      selectedClassName,
      selectedStyle,
      selectProps,
      className,
      disabled,
      dataSource,
      allowOpenRecord,
      isQuickFilter,
      popupContainer,
      onVisibleChange,
    } = this.props;
    const { keywords, selected, listvisible, previewRecord, newrecordVisible, selectDialogVisible } = this.state;
    const [, , onlyRelateByScanCode] = (control.strDefault || '').split('').map(b => !!+b);
    const disabledManualWrite = onlyRelateByScanCode && control.advancedSetting.dismanual === '1';
    const popup = this.renderPopup({ disabledManualWrite });
    // 浮层、新建记录、记录详情和表格选择弹窗都挂在 body 上且互不嵌套，浮层层级天然更高；
    // 表格内浮层只跟随 isediting，弹窗显示期间必须显式让位，否则浮层会压在弹窗上
    const hideForDialog = newrecordVisible || !!previewRecord || selectDialogVisible;
    const popupVisible = this.canSelect && !hideForDialog && (insheet ? isediting : listvisible);
    const showDialogSelect =
      get(control, 'advancedSetting.openfastfilters') === '1' || this.props.forceShowDialogSelect;
    const showClearIcon =
      !disabled &&
      this.allowRemove &&
      !!selected.length &&
      (!insheet || this.active) &&
      (listvisible || !showDialogSelect);
    const showSearch = multiple
      ? this.canSelect || isQuickFilter
      : (_.isEmpty(this.props.staticRecords) && this.canSelect) || isQuickFilter;
    const selectOptions = this.getSelectOptions();
    const selectValue = multiple ? selectOptions.map(option => option.value) : selectOptions[0]?.value;
    const chooseShowIds = safeParse(control.advancedSetting.chooseshowids, 'array').filter(id =>
      _.find(control.relationControls, { controlId: id }),
    );
    let showCards = !multiple && !!chooseShowIds.length && !insheet;
    return (
      <div
        className={cx('RelateRecordDropdown', className)}
        onClick={e => {
          if (isediting) {
            e.stopPropagation();
          }
        }}
      >
        {!(showCards && disabled) && (
          <div ref={this.cell}>
            <Select
              {...DEFAULT_SELECT_PROPS}
              {...selectProps}
              copyable
              ref={this.select}
              mode={multiple ? 'multiple' : undefined}
              className={selectedClassName}
              style={{ width: '100%', ...selectedStyle }}
              popupMatchSelectWidth={320}
              variant={insheet ? 'borderless' : isFormDetail ? 'filled' : 'outlined'}
              disabled={disabled}
              value={selectValue}
              options={selectOptions}
              placeholder={this.getPlaceholder()}
              showSearch={showSearch}
              searchValue={keywords}
              autoClearSearchValue={false}
              filterOption={false}
              open={popupVisible}
              // 让位给弹窗时禁用离场动画，否则弹窗已经盖上来了浮层还在淡出；
              // getTransitionName 对显式传入值直接透传，空串即不走 slide-up 动画
              transitionName={hideForDialog ? '' : undefined}
              // options 仅承载已选记录；保留默认空状态，否则空值时 Select 会阻止 popupRender 打开
              popupRender={() => popup}
              getPopupContainer={popupContainer || getDefaultPopupContainer}
              allowClear={
                showClearIcon
                  ? {
                      clearIcon: <Icon icon="cancel" className="Font16" onMouseDown={this.handleClearMouseDown} />,
                    }
                  : false
              }
              suffix={this.renderSelectDialogSuffix()}
              suffixIcon={disabled || insheet ? null : undefined}
              onSearch={value => this.setState({ keywords: value })}
              onInputKeyDown={this.handleInputKeyDown}
              onDeselect={value => {
                const option = selectOptions.find(item => item.value === value);

                if (option?.record) {
                  this.handleDelete(option.record, { defer: true });
                }
              }}
              onClear={this.handleClear}
              onClick={e => {
                if (insheet && !this.active) {
                  this.props.onClick(e);
                }
              }}
              onOpenChange={visible => {
                if (!visible && this.state.selectDialogVisible) {
                  return;
                }

                if (!disabled && visible) {
                  if (this.canSelect) {
                    this.openPopup();
                    // 处理 iOS 下无法自动激活键盘
                    this.inputForIOSKeyboardRef.current?.focus();
                  } else if (this.canCreateRecord && (!insheet || isediting)) {
                    this.openNewRecord();
                  }
                } else {
                  this.commitChange();
                  this.setState({ listvisible: false });
                }

                onVisibleChange(visible);
              }}
            />
          </div>
        )}
        {showCards && !!selected.length && (
          <div className="mTop10">
            <RelateRecordCards
              hideTitle={!disabled}
              appId={appId}
              recordId={this.props.recordId}
              allowOpenRecord={allowOpenRecord}
              cardClassName={disabled && control.advancedSetting.allowlink === '1' ? 'Hand' : undefined}
              control={{
                ...control,
                disabled: true,
                showControls: chooseShowIds,
                advancedSetting: {
                  ...control.advancedSetting,
                  showtype: '1',
                },
                coverCid: get(control, 'advancedSetting.choosecoverid'),
              }}
              records={selected.slice(0, 1)}
              from={from}
            />
          </div>
        )}
        {window.isIPad && (
          <input
            type="text"
            style={{ width: 0, opacity: 0, height: 0, position: 'absolute', padding: 0, margin: 0 }}
            ref={this.inputForIOSKeyboardRef}
          />
        )}
        {newrecordVisible && !disabledManualWrite && (
          <RecordFormContext.Consumer>
            {({ isMingoCreate } = {}) => (
              <NewRecord
                allowShowMingoCreate={!isMingoCreate}
                showFillNext
                directAdd
                className="worksheetRelateNewRecord"
                worksheetId={dataSource}
                addType={2}
                defaultFormDataEditable
                isDraft={control.isDraft}
                defaultFormData={
                  this.searchControl && checkIsTextControl(this.searchControl.type) && keywords
                    ? {
                        [this.searchControl.controlId]: keywords,
                      }
                    : {}
                }
                defaultRelatedSheet={this.getDefaultRelateSheetValue()}
                visible={newrecordVisible}
                hideNewRecord={() => {
                  this.setState({ newrecordVisible: false }, () => {
                    // 表格内单元格仍处于编辑态时浮层不会重新挂载，需主动恢复被新建记录挤掉的下拉列表
                    if (insheet && isediting && this.canSelect) {
                      this.openPopup();
                    }
                  });
                }}
                onAdd={record => this.handleItemClick(record)}
                updateWorksheetControls={newOptionsControlsForRelationControls => {
                  this.setState({ newOptionsControlsForRelationControls });
                }}
              />
            )}
          </RecordFormContext.Consumer>
        )}
        {from !== FROM.PUBLIC_ADD && previewRecord && (
          <RecordInfoWrapper
            visible
            disableOpenRecordFromRelateRecord={
              _.get(window, 'shareState.isPublicRecord') || _.get(window, 'shareState.isPublicView')
            }
            viewId={_.get(control, 'advancedSetting.openview') || control.viewId}
            from={1}
            isDraft={isDraft || from === FROM.DRAFT}
            hideRecordInfo={() => {
              this.setState({ previewRecord: undefined });
            }}
            recordId={previewRecord.recordId}
            worksheetId={dataSource}
            relationWorksheetId={this.props.parentWorksheetId}
            currentSheetRows={selected}
            showPrevNext
            isRelateRecord={true}
            updateRows={(rowIds = [], updatedRow = {}) => {
              if (rowIds[0]) {
                this.setState(oldState => ({
                  selected: oldState.selected.map(item =>
                    item.rowid === rowIds[0] ? { ...item, ..._.omit(updatedRow, ['allowdelete', 'allowedit']) } : item,
                  ),
                }));
              }
            }}
          />
        )}
      </div>
    );
  }
}

export default withOpeners(RelateRecordDropdown, {
  openSelectRecords: useSelectRecords,
});

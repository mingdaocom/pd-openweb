import React, { act } from 'react';
import cx from 'classnames';
import _, { find, get, uniq } from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { ClickAway, SortableList } from 'ming-ui';
import RelateRecordCards from 'worksheet/components/RelateRecordCards';
import { FROM } from 'src/components/newCustomFields/tools/config';
import { getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import NewRecord from 'src/pages/worksheet/common/newRecord/NewRecord';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import { updateRelateRecordSorts } from 'src/pages/worksheet/controllers/record';
import { getTranslateInfo } from 'src/utils/app';
import { checkIsTextControl } from 'src/utils/control';
import AutoWidthInput from './AutoWidthInput';
import RelateRecordList from './RelateRecordList';
import './style.less';

const OnlyScanTip = styled.div`
  width: 310px;
  padding: 10px 16px;
  color: #9e9e9e;
  border-radius: 3px;
  background-color: #fff;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.24);
  .clearBtn {
    padding: 6px 16px;
    margin: 0 -16px 6px;
    cursor: pointer;
    color: #9e9e9e;
    &:hover {
      background: #e4f4ff;
    }
  }
`;

const PlaceHolder = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  margin-top: -6px;
  color: #bdbdbd;
  line-height: 1em;
  width: calc(100% - 10px);
`;

const MAX_COUNT = 50;

export default class RelateRecordDropdown extends React.Component {
  static propTypes = {
    disableNewRecord: PropTypes.bool,
    isQuickFilter: PropTypes.bool,
    insheet: PropTypes.bool,
    isediting: PropTypes.bool,
    disabled: PropTypes.bool,
    multiple: PropTypes.bool,
    allowOpenRecord: PropTypes.bool, // 是否允许查看记录
    className: PropTypes.string,
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    selected: PropTypes.arrayOf(PropTypes.shape({})),
    selectedClassName: PropTypes.string,
    selectedStyle: PropTypes.shape({}),
    popupContainer: PropTypes.func,
    prefixRecords: PropTypes.arrayOf(PropTypes.shape({})),
    staticRecords: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func,
    onClick: PropTypes.func,
    onVisibleChange: PropTypes.func,
    renderSelected: PropTypes.func,
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
      newrecordVisible: false,
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
        this.openPopup();
      } else {
        if (this.props.selected.length > 0 && this.props.multiple) {
          return;
        }
        if (this.props.multiple && this.props.selected.length >= MAX_COUNT) {
          alert(_l('最多关联%0条', MAX_COUNT), 3);
          return;
        }
        this.setState({ newrecordVisible: true });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.selected, nextProps.selected)) {
      this.setState({
        selected: nextProps.selected,
      });
    }
    if (nextProps.flag !== this.props.flag) {
      this.setState({ addedIds: [], deletedIds: [], defaultSelected: nextProps.selected || [] });
    }
    if (
      _.get(nextProps, 'control.advancedSetting.searchcontrol') !==
        _.get(this.props, 'control.advancedSetting.searchcontrol') ||
      !_.isEqual(_.get(this.props, 'control.relationControls'), _.get(nextProps, 'control.relationControls'))
    ) {
      this.initSearchControl(nextProps);
    }
  }

  inputForIOSKeyboardRef = React.createRef();
  cell = React.createRef();
  list = React.createRef();

  get active() {
    const { isediting } = this.props;
    const { listvisible } = this.state;
    return isediting || listvisible;
  }

  get isMobile() {
    return this.props.from === FROM.H5_ADD || this.props.from === FROM.H5_EDIT;
  }

  get canSelect() {
    return this.props.enumDefault2 !== 10 && this.props.enumDefault2 !== 11;
  }

  get popupWidth() {
    const { insheet, showCoverAndControls, showControls } = this.props;
    const width = showCoverAndControls && showControls.length ? 480 : 313;
    if (!insheet && this.cell.current) {
      return Math.max(this.cell.current.clientWidth, width);
    } else {
      return width;
    }
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
    if (searchcontrol) {
      searchControl = _.find(control.relationControls, { controlId: searchcontrol });
    }
    if (!searchControl) {
      searchControl = _.find(control.relationControls, { attribute: 1 });
    }
    this.searchControl = searchControl;
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
          defaultRelatedSheetValue.name = '';
        }
      }
      return {
        worksheetId,
        relateSheetControlId: controlId,
        value: defaultRelatedSheetValue,
      };
    } catch (err) {
      return;
    }
  }

  getXOffset() {
    const { popupWidth } = this;
    if (
      this.cell &&
      this.cell.current &&
      window.innerWidth - this.cell.current.getBoundingClientRect().left < popupWidth
    ) {
      return window.innerWidth - popupWidth - 10 - this.cell.current.getBoundingClientRect().left;
    }
    return 0;
  }

  openPopup = () => {
    if (!this.cell.current) {
      this.setState({
        listvisible: true,
      });
      return;
    }
    const cellToTop = this.cell.current.getBoundingClientRect().top;
    let isTop = window.innerHeight - this.cell.current.clientHeight - cellToTop < 360;
    this.setState({
      renderToTop: isTop,
      listvisible: true,
      cellToTop,
    });
  };

  handleAdd = (record, cb = () => {}) => {
    const { multiple } = this.props;
    const { selected, addedIds = [] } = this.state;
    if (multiple && selected.length >= MAX_COUNT) {
      alert(_l('最多关联%0条', MAX_COUNT), 3);
      return;
    }
    if (!_.find(selected, r => r.rowid === record.rowid)) {
      this.setState(
        {
          selected: multiple ? selected.concat(record) : [record],
          addedIds: addedIds.concat(record.rowid),
        },
        () => {
          this.handleChange();
          cb();
        },
      );
    }
  };

  handleClear = () => {
    const { onVisibleChange } = this.props;
    const { selected, addedIds = [] } = this.state;
    selected.forEach(this.handleDelete);
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

  handleDelete = record => {
    const { selected, deletedIds = [] } = this.state;
    this.setState(
      {
        selected: selected.filter(r => r.rowid !== record.rowid),
        deletedIds: _.uniq(deletedIds.concat(record.rowid)),
      },
      this.handleChange,
    );
  };

  handleItemClick = record => {
    const { multiple, onVisibleChange } = this.props;
    const { selected } = this.state;
    if (multiple && record.rowid !== 'isEmpty') {
      const selectedRecord = _.find(selected, r => record.rowid === r.rowid);
      if (selectedRecord) {
        if (this.allowRemove || selectedRecord.isNewAdd) {
          this.handleDelete(record);
        }
      } else {
        this.handleAdd(_.assign({}, record, { isNewAdd: true }));
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

  handleInputKeyDown = e => {
    const { control } = this.props;
    const { selected } = this.state;
    if (!get(this, 'list.current')) return;
    if (e.key === 'ArrowUp') {
      this.list.current.updateActiveId(-1);
    } else if (e.key === 'ArrowDown') {
      this.list.current.updateActiveId(1);
    } else if (e.key === 'Enter') {
      this.list.current.handleEnter();
    } else if (e.key === 'Backspace') {
      if (_.get(this, 'inputRef.current.value')) {
        return;
      }
      const needDelete = selected.slice(-1)[0];
      if (needDelete && control.enumDefault !== 1) {
        this.handleDelete(needDelete);
      }
    }
  };

  handleChange() {
    const { multiple, doNotClearKeywordsWhenChange, onChange } = this.props;
    let { selected, addedIds, deletedIds } = this.state;
    if (selected.length > 1 && _.find(selected, { rowid: 'isEmpty' })) {
      selected = selected.filter(r => r.rowid !== 'isEmpty');
    }
    if (multiple) {
      this.focusInput();
    }
    if (!doNotClearKeywordsWhenChange) {
      this.setState({ keywords: '' });
    }
    onChange(selected, { addedIds, deletedIds });
  }

  focusInput() {
    if (this.inputRef && this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  handleClick = () => {
    const { insheet, disabled, onClick } = this.props;
    if (insheet) {
      if (this.active) {
        this.focusInput();
      } else {
        onClick();
      }
    } else {
      this.setState({ listvisible: !disabled });
    }
  };

  renderSingle() {
    const { appId, insheet, isediting, isQuickFilter, control, allowOpenRecord, staticRecords, isMobileTable } =
      this.props;
    const { selected, keywords } = this.state;
    const { canSelect, active } = this;
    const title = getTitleTextFromRelateControl(this.control, selected[0]);
    const entityName = this.entityName;
    return (
      <React.Fragment>
        {!!selected.length && !keywords && (
          <span
            title={title}
            className="normalSelectedItem placeholder ellipsis"
            onClick={e => {
              if (!allowOpenRecord || isMobileTable) {
                return;
              }
              this.setState({ previewRecord: { recordId: selected[0].rowid } });
              e.stopPropagation();
            }}
          >
            {selected[0].rowid ? title : _l('关联当前%0', entityName)}
          </span>
        )}
        {((_.isEmpty(staticRecords) && canSelect) || isQuickFilter) && active && (
          <AutoWidthInput
            mountRef={ref => (this.inputRef = ref)}
            value={keywords}
            onChange={value => this.setState({ keywords: value })}
            onKeyDown={this.handleInputKeyDown}
          />
        )}
        {!active && _.isEmpty(selected) && !insheet && control.hint && (
          <PlaceHolder className="ellipsis" onClick={this.focusInput}>
            {control.hint}
          </PlaceHolder>
        )}
        {_.isEmpty(staticRecords) && canSelect && !selected.length && active && !keywords && this.searchControl && (
          <PlaceHolder className="ellipsis" onClick={this.focusInput}>
            {_l('搜索%0', this.searchControl.controlName)}
          </PlaceHolder>
        )}
        {insheet && isediting && !canSelect && selected.length === 0 && (
          <span
            className="activeSelectedItem addBtn Hand"
            onClick={e => {
              e.stopPropagation();
              if (this.props.multiple && this.props.selected.length >= MAX_COUNT) {
                alert(_l('最多关联%0条', MAX_COUNT), 3);
                return;
              }
              this.setState({ newrecordVisible: true });
            }}
          >
            <i className="icon icon-plus" />
          </span>
        )}
      </React.Fragment>
    );
  }

  renderMultipe() {
    const {
      insheet,
      isSubList,
      isQuickFilter,
      disabled,
      isediting,
      formIsEditing,
      control,
      parentWorksheetId,
      allowOpenRecord,
      recordId,
    } = this.props;
    const canDrag = get(control, 'advancedSetting.allowdrag') === '1';
    const { selected, keywords, activeIndex } = this.state;
    const { active } = this;
    const length = selected.length;
    return (
      <React.Fragment>
        {!active && _.isEmpty(selected) && !insheet && control.hint && (
          <PlaceHolder className="ellipsis">{control.hint}</PlaceHolder>
        )}
        {!!selected.length && (
          <SortableList
            dragPreviewImage
            items={selected}
            itemKey="rowid"
            canDrag={canDrag && active && selected.length > 1 && selected.length <= 50 && !disabled}
            helperClass="draggingItem"
            itemClassName="itemContainer"
            onSortEnd={newItems => {
              if (formIsEditing || !recordId || isSubList) {
                this.setState({ selected: newItems }, this.handleChange);
              } else {
                updateRelateRecordSorts({
                  worksheetId: parentWorksheetId,
                  recordId,
                  changes: [
                    {
                      ...control,
                      editType: 31,
                      value: JSON.stringify(newItems.map(item => ({ sid: item.rowid }))),
                    },
                  ],
                });
              }
            }}
            renderItem={options => {
              const { index, dragging, isLayer } = options;
              const record = options.item;
              const title = getTitleTextFromRelateControl(this.control, record);
              return active || insheet ? (
                <div
                  key={record.rowid}
                  className={cx('activeSelectedItem', { active, allowRemove: this.allowRemove || record.isNewAdd })}
                  onClick={e => {
                    e.stopPropagation();
                    if (!allowOpenRecord || active || /^temp/.test(record.rowid) || active) {
                      return;
                    }
                    this.setState({ previewRecord: { recordId: record.rowid } });
                  }}
                >
                  <span className="name InlineBlock ellipsis">
                    {record.rowid ? title : _l('关联当前%0', this.entityName)}
                  </span>
                  {active && (this.allowRemove || record.isNewAdd) && (
                    <i
                      className="icon icon-close"
                      onClick={e => {
                        e.stopPropagation();
                        this.handleDelete(record);
                      }}
                    ></i>
                  )}
                </div>
              ) : (
                <div
                  key={record.rowid}
                  className={cx('normalSelectedItem ellipsis multiple', { isEnd: index === length - 1 })}
                  title={title}
                  onClick={e => {
                    if (!allowOpenRecord) {
                      return;
                    }
                    this.setState({ previewRecord: { recordId: record.rowid } });
                    e.stopPropagation();
                  }}
                >
                  {title}
                </div>
              );
            }}
          />
        )}
        {(this.canSelect || isQuickFilter) && active && (
          <AutoWidthInput
            mountRef={ref => (this.inputRef = ref)}
            value={keywords}
            onChange={value => this.setState({ keywords: value })}
            onKeyDown={this.handleInputKeyDown}
          />
        )}
        {insheet && isediting && !this.canSelect && (
          <span
            className="activeSelectedItem addBtn Hand"
            onClick={e => {
              e.stopPropagation();
              if (this.props.multiple && this.props.selected.length >= MAX_COUNT) {
                alert(_l('最多关联%0条', MAX_COUNT), 3);
                return;
              }
              this.setState({ newrecordVisible: true });
            }}
          >
            <i className="icon icon-plus" />
          </span>
        )}
      </React.Fragment>
    );
  }

  renderPopup({ disabledManualWrite }) {
    const {
      appId,
      from,
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
    } = this.props;
    const formDataArray = typeof formData === 'function' ? formData() : formData;
    const {
      keywords,
      selected,
      listvisible,
      newrecordVisible,
      renderToTop,
      cellToTop,
      activeIndex,
      deletedIds,
      defaultSelected,
    } = this.state;
    const xOffset = this.isMobile ? 0 : this.getXOffset();
    return (
      <ClickAway
        onClickAway={() => {
          if (!newrecordVisible) {
            onVisibleChange(false);
          }
        }}
        className="scrollInTable"
        style={!this.isMobile ? {} : { position: 'relative', marginLeft: -20 }}
      >
        {(insheet || isQuickFilter) && this.renderSelected(true)}
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
              multiple ? uniq(deletedIds.concat(selected.map(r => r.rowid))) : (defaultSelected || []).map(r => r.rowid)
            }
            maxHeight={renderToTop && cellToTop}
            entityName={this.entityName}
            style={{
              ...(renderToTop
                ? {
                    bottom: (_.get(this, 'cell.current.clientHeight') || 30) + (insheet ? 0 : 3),
                  }
                : {
                    top: '100%',
                  }),
              left: xOffset,
              position: 'absolute',
              width: this.popupWidth,
            }}
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
            isMobile={this.isMobile}
            selectedIds={selected.map(r => r.rowid)}
            onItemClick={this.handleItemClick}
            onClear={this.handleClear}
            allowNewRecord={this.props.enumDefault2 !== 1 && this.props.enumDefault2 !== 11 && !disableNewRecord}
            onNewRecord={() => {
              if (multiple && selected.length >= MAX_COUNT) {
                alert(_l('最多关联%0条', MAX_COUNT), 3);
                return;
              }
              this.setState({ newrecordVisible: true, listvisible: false });
            }}
          />
        )}
      </ClickAway>
    );
  }

  renderSelected(free) {
    const {
      isDark,
      control = {},
      isQuickFilter,
      isediting,
      insheet,
      multiple,
      selectedClassName,
      selectedStyle,
      disabled,
      allowOpenRecord,
      renderSelected,
    } = this.props;
    const { selected, keywords, listvisible } = this.state;
    let content;
    if (_.isFunction(renderSelected) && !(isQuickFilter && listvisible)) {
      content = renderSelected(selected, { handleDelete: this.handleDelete });
    } else if (multiple && !isQuickFilter) {
      content = this.renderMultipe();
    } else {
      content = _.isArray(selected) && selected.length > 1 ? this.renderMultipe() : this.renderSingle();
    }
    return (
      <div
        className={cx('RelateRecordDropdown-selected', selectedClassName, {
          free,
          active: listvisible || isediting,
          emptyRecord: !selected.length,
          readonly: disabled,
          allowOpenRecord: allowOpenRecord,
          isDark,
          'customFormControlBox mobile': this.isMobile,
        })}
        ref={this.cell}
        style={selectedStyle}
        onClick={this.handleClick}
      >
        {content}
        {!disabled && !(this.active && keywords) && (
          <i className={`icon ${this.isMobile ? 'icon-arrow-right-border' : 'icon-arrow-down-border'} dropIcon`}></i>
        )}
        {!disabled && this.allowRemove && (!!selected.length || keywords) && (!insheet || this.active) && (
          <i
            className="icon icon-closeelement-bg-circle Hand clearIcon"
            onClick={e => {
              e.stopPropagation();
              if (keywords) {
                this.setState({ keywords: '' }, () => {
                  this.focusInput();
                });
              } else {
                this.handleClear();
              }
            }}
          ></i>
        )}
      </div>
    );
  }

  render() {
    const {
      from,
      appId,
      multiple,
      isDraft,
      insheet,
      popupOffset,
      zIndex,
      isediting,
      control = {},
      selectedStyle,
      className,
      popupClassName,
      disabled,
      dataSource,
      enumDefault2,
      allowOpenRecord,
      isQuickFilter,
      popupContainer,
      onVisibleChange,
    } = this.props;
    const { keywords, selected, isTop, listvisible, previewRecord, newrecordVisible } = this.state;
    const [, , onlyRelateByScanCode] = (control.strDefault || '').split('').map(b => !!+b);
    const disabledManualWrite = onlyRelateByScanCode && control.advancedSetting.dismanual === '1';
    const popup = this.renderPopup({ disabledManualWrite });
    const popupVisible = insheet ? isediting : listvisible;
    const chooseShowIds = safeParse(control.advancedSetting.chooseshowids, 'array');
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
          <Trigger
            action={insheet ? [] : ['click']}
            popupVisible={popupVisible}
            onPopupVisibleChange={visilbe => {
              if (!disabled && visilbe) {
                this.openPopup();
                // 处理iOS下无法自动激活键盘
                if (this.inputForIOSKeyboardRef.current) {
                  this.inputForIOSKeyboardRef.current.focus();
                }
              } else {
                this.setState({ listvisible: false });
              }
              onVisibleChange(visilbe);
            }}
            popupClassName={cx('relateRecordDropdownPopup filterTrigger', popupClassName, { isQuickFilter })}
            getPopupContainer={popupContainer || (() => document.body)}
            popupAlign={{
              points: insheet || isTop ? ['tl', 'tl'] : ['tl', 'bl'],
              offset: popupOffset || [0, 2],
              overflow: {
                adjustX: !this.isMobile,
                adjustY: true,
              },
            }}
            zIndex={zIndex || (this.isMobile ? 999 : 1000)}
            destroyPopupOnHide
            popup={popup}
          >
            {(!insheet || !isediting) && (!isQuickFilter || !listvisible) ? (
              this.renderSelected()
            ) : (
              <div style={selectedStyle} ref={this.cell} />
            )}
          </Trigger>
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
          <NewRecord
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
              this.setState({ newrecordVisible: false });
            }}
            onAdd={record => this.handleItemClick(record)}
            updateWorksheetControls={newOptionsControlsForRelationControls => {
              this.setState({ newOptionsControlsForRelationControls });
            }}
          />
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
                this.setState({
                  selected: selected.map(item =>
                    item.rowid === rowIds[0] ? { ...item, ..._.omit(updatedRow, ['allowdelete', 'allowedit']) } : item,
                  ),
                });
              }
            }}
          />
        )}
      </div>
    );
  }
}

import React from 'react';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import { ClickAway } from 'ming-ui';
import styled from 'styled-components';
import { FROM } from 'src/components/newCustomFields/tools/config';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import { getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import RelateRecordList from './RelateRecordList';
import NewRecord from 'src/pages/worksheet/common/newRecord/NewRecord';
import AutoWidthInput from './AutoWidthInput';
import './style.less';
import _ from 'lodash';

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
  top: 8px;
  color: #bdbdbd;
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
      keywords: '',
      activeIndex: undefined,
    };
    this.initSearchControl(props);
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
  }

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

  @autobind
  openPopup() {
    const cellToTop = this.cell.current.getBoundingClientRect().top;
    let isTop = window.innerHeight - this.cell.current.clientHeight - cellToTop < 360;
    this.setState({
      renderToTop: isTop,
      listvisible: true,
      cellToTop,
    });
  }

  @autobind
  handleAdd(record, cb = () => {}) {
    const { multiple } = this.props;
    const { selected } = this.state;
    if (multiple && selected.length >= MAX_COUNT) {
      alert(_l('最多关联%0条', MAX_COUNT), 3);
      return;
    }
    if (!_.find(selected, r => r.rowid === record.rowid)) {
      this.setState(
        {
          selected: multiple ? selected.concat(record) : [record],
        },
        () => {
          this.handleChange();
          cb();
        },
      );
    }
  }

  @autobind
  handleClear() {
    const { onVisibleChange } = this.props;
    this.setState(
      {
        selected: [],
        listvisible: false,
      },
      () => {
        this.handleChange();
        onVisibleChange(false);
      },
    );
  }

  @autobind
  handleDelete(record) {
    const { selected } = this.state;
    this.setState(
      {
        selected: selected.filter(r => r.rowid !== record.rowid),
      },
      this.handleChange,
    );
  }

  @autobind
  handleItemClick(record) {
    const { multiple, onVisibleChange } = this.props;
    const { selected } = this.state;
    if (multiple) {
      if (_.find(selected, r => record.rowid === r.rowid)) {
        this.handleDelete(record);
      } else {
        this.handleAdd(record);
      }
      return;
    } else {
      this.setState({ selected: [record], listvisible: false }, () => {
        this.handleChange();
        onVisibleChange(false);
        this.setState({ newrecordVisible: false });
      });
    }
  }

  @autobind
  handleInputKeyDown(e) {
    const { control } = this.props;
    const { selected } = this.state;
    if (e.key === 'ArrowUp') {
      this.list.current.updateActiveId(-1);
    } else if (e.key === 'ArrowDown') {
      this.list.current.updateActiveId(1);
    } else if (e.key === 'Enter') {
      this.list.current.handleEnter();
    } else if (e.key === 'Backspace') {
      const needDelete = selected.slice(-1)[0];
      if (needDelete && control.enumDefault !== 1) {
        this.handleDelete(needDelete);
      }
    }
  }

  handleChange() {
    const { multiple, doNotClearKeywordsWhenChange, onChange } = this.props;
    const { selected } = this.state;
    if (multiple && this.inputRef && this.inputRef.current) {
      this.inputRef.current.focus();
    }
    if (!doNotClearKeywordsWhenChange) {
      this.setState({ keywords: '' });
    }
    onChange(selected);
  }

  @autobind
  handleClick() {
    const { insheet, disabled, onClick } = this.props;
    if (insheet) {
      if (this.active) {
        if (this.inputRef && this.inputRef.current) {
          this.inputRef.current.focus();
        }
      } else {
        onClick();
      }
    } else {
      this.setState({ listvisible: !disabled });
    }
  }

  renderSingle() {
    const { insheet, isediting, control, allowOpenRecord, entityName } = this.props;
    const { selected, keywords } = this.state;
    const { canSelect, active } = this;
    return (
      <React.Fragment>
        {!!selected.length && !keywords && (
          <span
            className="normalSelectedItem placeholder ellipsis"
            onClick={e => {
              if (!allowOpenRecord) {
                return;
              }
              this.setState({ previewRecord: { recordId: selected[0].rowid } });
              e.stopPropagation();
            }}
          >
            {selected[0].rowid ? getTitleTextFromRelateControl(control, selected[0]) : _l('关联当前%0', entityName)}
          </span>
        )}
        {canSelect && active && (
          <AutoWidthInput
            mountRef={ref => (this.inputRef = ref)}
            value={keywords}
            onChange={value => this.setState({ keywords: value })}
            onKeyDown={this.handleInputKeyDown}
          />
        )}
        {canSelect && !selected.length && active && !keywords && this.searchControl && (
          <PlaceHolder>{_l('搜索%0', this.searchControl.controlName)}</PlaceHolder>
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
    const { insheet, isediting, control, allowOpenRecord, entityName, cellFrom } = this.props;
    const { selected, keywords, activeIndex } = this.state;
    const { active } = this;
    const length = selected.length;
    return (
      <React.Fragment>
        {selected.map((record, i) =>
          active || insheet ? (
            <div
              key={i}
              className={cx('activeSelectedItem', { active })}
              style={_.assign({}, i === 0 ? (cellFrom === 4 ? { margin: 0 } : { marginTop: 6 }) : {})}
              onClick={e => {
                if (!allowOpenRecord || active) {
                  return;
                }
                this.setState({ previewRecord: { recordId: record.rowid } });
                e.stopPropagation();
              }}
            >
              <span className="name InlineBlock ellipsis">
                {record.rowid ? getTitleTextFromRelateControl(control, record) : _l('关联当前%0', entityName)}
              </span>
              {active && (
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
            [
              <div
                key={i}
                className="normalSelectedItem ellipsis"
                onClick={e => {
                  if (!allowOpenRecord) {
                    return;
                  }
                  this.setState({ previewRecord: { recordId: record.rowid } });
                  e.stopPropagation();
                }}
              >
                {getTitleTextFromRelateControl(control, record)}
              </div>,
              i !== length - 1 && <span style={{ lineHeight: '34px', marginRight: 2 }}>, </span>,
            ]
          ),
        )}
        {this.canSelect && active && (
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
    const { multiple, control, formData, insheet, disableNewRecord, onVisibleChange } = this.props;
    const formDataArray = typeof formData === 'function' ? formData() : formData;
    const { keywords, selected, listvisible, newrecordVisible, renderToTop, cellToTop, activeIndex } = this.state;
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
        {insheet && this.renderSelected(true)}
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
            ref={this.list}
            activeIndex={activeIndex}
            keyWords={keywords}
            control={control}
            formData={formDataArray}
            maxHeight={renderToTop && cellToTop}
            style={{
              ...(renderToTop
                ? {
                    bottom: this.cell.current.clientHeight + (insheet ? 0 : 3),
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
    if (_.isFunction(renderSelected)) {
      content = renderSelected(selected);
    } else if (multiple && !isQuickFilter) {
      content = this.renderMultipe();
    } else {
      content = this.renderSingle();
    }
    return (
      <div
        className={cx('RelateRecordDropdown-selected', selectedClassName, {
          free,
          active: listvisible || isediting,
          emptyRecord: !selected.length,
          readonly: disabled,
          allowOpenRecord: allowOpenRecord,
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
        {!disabled && (!!selected.length || keywords) && (!insheet || this.active) && (
          <i
            className="icon icon-closeelement-bg-circle Hand clearIcon"
            onClick={e => {
              e.stopPropagation();
              if (keywords) {
                this.setState({ keywords: '' }, () => {
                  if (this.inputRef && this.inputRef.current) {
                    this.inputRef.current.focus();
                  }
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
      insheet,
      zIndex,
      isediting,
      control = {},
      selectedStyle,
      className,
      disabled,
      dataSource,
      enumDefault2,
      popupContainer,
      onVisibleChange,
    } = this.props;
    const { selected, isTop, listvisible, previewRecord, newrecordVisible } = this.state;
    const [, , onlyRelateByScanCode] = (control.strDefault || '').split('').map(b => !!+b);
    const disabledManualWrite = onlyRelateByScanCode && control.advancedSetting.dismanual === '1';
    const popup = this.renderPopup({ disabledManualWrite });
    const popupVisible = insheet ? isediting : listvisible;
    return (
      <div className={cx('RelateRecordDropdown', className)}>
        <Trigger
          action={insheet ? [] : ['click']}
          popupVisible={popupVisible}
          onPopupVisibleChange={visilbe => {
            if (!disabled && visilbe) {
              this.openPopup();
            } else {
              this.setState({ listvisible: false });
            }
            onVisibleChange(visilbe);
          }}
          popupClassName="relateRecordDropdownPopup filterTrigger"
          getPopupContainer={popupContainer || (() => document.body)}
          popupAlign={{
            points: insheet || isTop ? ['tl', 'tl'] : ['tl', 'bl'],
            offset: [0, 0],
            overflow: {
              adjustX: !this.isMobile,
            },
          }}
          zIndex={zIndex || (this.isMobile ? 999 : 1000)}
          destroyPopupOnHide
          popup={popup}
        >
          {!insheet || !isediting ? this.renderSelected() : <div style={selectedStyle} ref={this.cell} />}
        </Trigger>
        {newrecordVisible && !disabledManualWrite && (
          <NewRecord
            showFillNext
            directAdd
            className="worksheetRelateNewRecord"
            worksheetId={dataSource}
            addType={2}
            defaultRelatedSheet={this.getDefaultRelateSheetValue()}
            visible={newrecordVisible}
            hideNewRecord={() => {
              this.setState({ newrecordVisible: false });
            }}
            onAdd={record => this.handleItemClick(record)}
          />
        )}
        {previewRecord && (
          <RecordInfoWrapper
            visible
            viewId={this.props.viewId}
            from={1}
            hideRecordInfo={() => {
              this.setState({ previewRecord: undefined });
            }}
            recordId={previewRecord.recordId}
            worksheetId={dataSource}
            updateRows={(rowIds = [], updatedRow = {}) => {
              if (rowIds[0]) {
                this.setState({
                  selected: selected.map(item =>
                    _.find(selected, r => r.rowid === rowIds[0])
                      ? { ...item, ..._.omit(updatedRow, ['allowdelete', 'allowedit']) }
                      : item,
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

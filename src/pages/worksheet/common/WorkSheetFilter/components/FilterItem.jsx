import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Input, Select } from 'ming-ui/antd-components';
import { filterOnlyShowField, isOtherShowFeild } from 'src/utils/domain/control/filters';
import { checkConditionAvailable, getDefaultCondition, getTypeKey } from 'src/utils/domain/worksheet/filterCondition';
import { CONTROL_FILTER_WHITELIST, FILTER_TYPE } from 'src/utils/domain/worksheet/filterConstants';
import AddCondition from './AddCondition';
import Condition from './Condition';

const OperateSelect = styled(Select)`
  width: 18px;

  .hap-select-selection-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline-end: 0 !important;
  }
`;

const OPERATE_VALUE = 'operate';
const OPERATE_SELECT_STYLES = { popup: { root: { minWidth: 160 } } };

const renderOperateLabel = (iconClassName, label, danger) => (
  <span className={cx('flexRow alignItemsCenter', { colorRed: danger })}>
    <i className={cx('icon', iconClassName)} />
    <span className="mLeft8">{label}</span>
  </span>
);

export default class FilterItem extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    showCustomAddCondition: PropTypes.bool,
    isCharge: PropTypes.bool,
    disableSave: PropTypes.bool,
    expanded: PropTypes.bool,
    selected: PropTypes.bool,
    unsaved: PropTypes.bool,
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    index: PropTypes.number,
    filter: PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.number,
      relationType: PropTypes.number,
      conditions: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    hideFilter: PropTypes.func,
    onExpand: PropTypes.func,
    onDelete: PropTypes.func,
    onCopy: PropTypes.func,
    onRename: PropTypes.func,
    onUpdateFilterType: PropTypes.func,
    onFilter: PropTypes.func,
    onSave: PropTypes.func,
    onSaveNew: PropTypes.func,
    onSaveAs: PropTypes.func,
    addCondition: PropTypes.func,
    updateCondition: PropTypes.func,
    deleteCondition: PropTypes.func,
    updateFilter: PropTypes.func,
  };
  static defaultProps = Object.assign(
    {
      showCustomAddCondition: true,
      index: 0,
    },
    [
      'hideFilter',
      'onExpand',
      'onDelete',
      'onCopy',
      'onRename',
      'onUpdateFilterType',
      'onFilter',
      'onSave',
      'onSaveNew',
      'onSaveAs',
      'addCondition',
      'updateCondition',
      'deleteCondition',
      'updateFilter',
    ].map(() => () => {}),
  );
  constructor(props) {
    super(props);
    this.state = {
      nameIsEditing: false,
      operateVisible: false,
    };
    this.filterNameInputRef = React.createRef();
  }

  focusFilterNameInput = () => {
    this.filterNameInputRef.current?.focus({ cursor: 'all' });
  };

  checkFilterEditable = () => {
    const { filter, isCharge } = this.props;
    return filter.type === FILTER_TYPE.PUBLIC ? isCharge : filter.createAccountId === md.global.Account.accountId;
  };

  renderConditions = () => {
    const { columns, filter, updateCondition, deleteCondition, updateFilter, projectId, appId } = this.props;
    const { relationType, conditions } = filter;
    const canEdit = this.checkFilterEditable();
    return conditions.map((condition, index) => {
      const control = _.find(columns, column => condition.controlId === column.controlId);
      const conditionGroupKey = getTypeKey((control || {}).type);
      const conditionGroupType = control ? CONTROL_FILTER_WHITELIST[conditionGroupKey].value : '';
      const isSheetFieldError = isOtherShowFeild(control);
      return (
        <Condition
          canEdit={filter.type === FILTER_TYPE.TEMP ? true : canEdit}
          projectId={projectId}
          appId={appId}
          key={condition.keyStr}
          index={index}
          condition={condition}
          conditionsLength={conditions.length}
          conditionGroupType={conditionGroupType}
          relationType={relationType}
          isSheetFieldError={isSheetFieldError}
          control={control}
          onChange={value => {
            updateCondition(this.props.filter, index, value);
          }}
          onDelete={() => {
            deleteCondition(this.props.filter, index);
          }}
          onUpdateFilter={value => {
            updateFilter(this.props.filter, value);
          }}
        />
      );
    });
  };

  renderOperate = canSave => {
    const { unsaved, isCharge, filter, onDelete, onCopy, onUpdateFilterType, onSave, onSaveAs } = this.props;
    const { operateVisible } = this.state;
    const canEdit = this.checkFilterEditable();
    const options = [
      {
        value: 'save',
        label: renderOperateLabel('icon-save', _l('保存')),
        disabled: !canSave,
        onSelect: () => onSave(filter),
      },
      unsaved
        ? {
            value: 'saveAs',
            label: renderOperateLabel('icon-content-copy', _l('保存为')),
            onSelect: () => onSaveAs(filter),
          }
        : {
            value: 'copy',
            label: renderOperateLabel('icon-content-copy', _l('复制')),
            onSelect: () => onCopy(filter),
          },
      {
        value: 'rename',
        label: renderOperateLabel('icon-edit', _l('重命名')),
        disabled: !canEdit,
        onSelect: () => {
          this.setState({ nameIsEditing: true }, this.focusFilterNameInput);
        },
      },
      {
        value: 'toggleType',
        label: renderOperateLabel(
          filter.type === FILTER_TYPE.PUBLIC ? 'icon-person' : 'icon-group',
          filter.type === FILTER_TYPE.PUBLIC ? _l('设为个人筛选') : _l('设为公共筛选'),
        ),
        disabled: !isCharge,
        onSelect: () =>
          onUpdateFilterType(filter.type === FILTER_TYPE.PUBLIC ? FILTER_TYPE.PERSONAL : FILTER_TYPE.PUBLIC),
      },
      {
        value: 'delete',
        label: renderOperateLabel('icon-hr_delete', _l('删除'), true),
        disabled: filter.createAccountId !== md.global.Account.accountId && !isCharge,
        onSelect: () => onDelete(filter),
      },
    ];

    return (
      <OperateSelect
        className="moreOperateBtn"
        value={OPERATE_VALUE}
        options={options}
        open={operateVisible}
        placement="topLeft"
        classNames={{ popup: { root: 'worksheetFilterOperateList' } }}
        labelRender={() => <i className="icon icon-more_horiz" />}
        showSearch={false}
        suffixIcon={null}
        variant="borderless"
        popupMatchSelectWidth={false}
        styles={OPERATE_SELECT_STYLES}
        onChange={value => {
          const selectedOption = _.find(options, { value });
          this.setState({ operateVisible: false }, () => {
            selectedOption?.onSelect();
          });
        }}
        onOpenChange={operateVisible => this.setState({ operateVisible })}
      />
    );
  };
  checkNewFilter(filter) {
    const availableConditions = filter.conditions.filter(condition => checkConditionAvailable(condition));
    return !!availableConditions.length;
  }

  renameFilter = value => {
    const { filter, onRename } = this.props;

    if (!value) {
      alert(_l('请输入名称'), 3);
      return;
    }

    this.setState({
      nameIsEditing: false,
    });
    if (filter.name !== value) {
      onRename(value);
    }
  };
  render() {
    const {
      disableSave,
      expanded,
      unsaved,
      showCustomAddCondition,
      selected,
      columns,
      index,
      filter,
      hideFilter,
      onExpand,
      onFilter,
      onSaveNew,
      addCondition,
    } = this.props;
    const { nameIsEditing } = this.state;
    const canSave =
      !disableSave && unsaved && filter.conditions.filter(condition => checkConditionAvailable(condition)).length;
    const canEdit = this.checkFilterEditable();
    return filter.type === FILTER_TYPE.TEMP ? (
      <div className="customFilter">
        <div className="customFilterTitle">
          <span className="filterName">{filter.name}</span>
        </div>
        {this.renderConditions()}
        <div className="flexRow" style={{ width: '100%' }}>
          <div className="flex">
            <AddCondition
              columns={filterOnlyShowField(columns)}
              defaultVisible={showCustomAddCondition}
              onAdd={control => {
                addCondition(filter, getDefaultCondition(control), () => {
                  $('.customFilter .conditionItem').eq(-1).find('input').eq(0).focus();
                });
              }}
            />
          </div>
          {!disableSave && this.checkNewFilter(filter) && (
            <span className="hoverColorPrimary Hand mTop15 mRight6 textSecondary" onClick={onSaveNew}>
              {_l('保存')}
            </span>
          )}
        </div>
      </div>
    ) : (
      <div
        className={cx({ expanded })}
        key={filter.type === FILTER_TYPE.PUBLIC ? `public-${index}` : `personal-${index}`}
      >
        <div
          className={cx('filterItem flexRow bgColorPrimary', { expanded })}
          onClick={e => {
            const $targetTarget = $(e.target).closest('.moreOperateBtn, .worksheetFilterOperateList');

            if ($targetTarget.length) {
              return;
            }

            onFilter();
            hideFilter();
          }}
        >
          <div className={cx('filterTitle flex ellipsis', { colorPrimary: selected })}>
            {nameIsEditing ? (
              <Input
                ref={this.filterNameInputRef}
                className="filterNameInput w100"
                defaultValue={filter.name}
                size="small"
                variant="borderless"
                onClick={e => {
                  e.stopPropagation();
                }}
                onBlur={e => {
                  this.renameFilter(e.target.value.trim());
                }}
                onKeyDown={e => {
                  if (e.keyCode === 13) {
                    this.renameFilter(e.target.value.trim());
                  }
                }}
              />
            ) : (
              <span
                className="filterNameText"
                onClick={e => {
                  if (!expanded || !canEdit) {
                    return;
                  }

                  e.stopPropagation();
                  this.setState({ nameIsEditing: true }, this.focusFilterNameInput);
                }}
              >
                {filter.name}
              </span>
            )}
          </div>
          {expanded && this.renderOperate(canSave)}
          <span
            className="slideIcon"
            onClick={e => {
              e.stopPropagation();
              onExpand();
            }}
          >
            <i
              className={cx('icon Hand', {
                'icon-arrow-down-border': !expanded,
                'icon-arrow-up-border': expanded,
              })}
            ></i>
          </span>
        </div>
        {expanded && (
          <div className="conditionsCon">
            {this.renderConditions()}
            {canEdit && (
              <AddCondition
                columns={filterOnlyShowField(columns)}
                onAdd={control => {
                  addCondition(filter, getDefaultCondition(control), () => {
                    $('.conditionsCon .conditionItem').eq(-1).find('input').eq(0).focus();
                  });
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

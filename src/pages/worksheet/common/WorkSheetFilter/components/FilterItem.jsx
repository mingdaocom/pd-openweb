import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import { Input } from 'ming-ui';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import { filterOnlyShowField, isOtherShowFeild } from 'src/pages/widgetConfig/util';
import { CONTROL_FILTER_WHITELIST, FILTER_TYPE } from '../enum';
import { checkConditionAvailable, getDefaultCondition, getTypeKey } from '../util';
import AddCondition from './AddCondition';
import Condition from './Condition';
import wrapDisableClick from './wrapDisableClick';

const NewMenuItem = wrapDisableClick(MenuItem);

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
  }

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
    return (
      <Trigger
        prefixCls={'Tooltip'}
        action={['click']}
        popupVisible={operateVisible}
        popup={
          <Menu
            className="worksheetFilterOperateList"
            onClickAway={() => {
              this.setState({ operateVisible: false });
            }}
          >
            <NewMenuItem
              className="operateBtn"
              disabled={!canSave}
              onClick={() => {
                if (!canSave) {
                  return;
                }
                onSave(filter);
                this.setState({
                  operateVisible: false,
                });
              }}
            >
              <i className="icon icon-save"></i>
              {_l('保存')}
            </NewMenuItem>
            {unsaved && (
              <NewMenuItem
                className="operateBtn"
                onClick={() => {
                  onSaveAs(filter);
                  this.setState({
                    operateVisible: false,
                  });
                }}
              >
                <i className="icon icon-content-copy"></i>
                {_l('保存为')}
              </NewMenuItem>
            )}
            {!unsaved && (
              <NewMenuItem
                className="operateBtn"
                onClick={() => {
                  onCopy(filter);
                  this.setState({
                    operateVisible: false,
                  });
                }}
              >
                <i className="icon icon-content-copy"></i>
                {_l('复制')}
              </NewMenuItem>
            )}
            <NewMenuItem
              className="operateBtn"
              disabled={!canEdit}
              onClick={() => {
                this.setState(
                  {
                    nameIsEditing: true,
                    operateVisible: false,
                  },
                  () => {
                    if (this.title) {
                      this.title.querySelector('.filterNameInput').select();
                      this.title.querySelector('.filterNameInput').focus();
                    }
                  },
                );
              }}
            >
              <i className="icon icon-edit" on></i>
              {_l('重命名')}
            </NewMenuItem>
            <NewMenuItem
              className="operateBtn"
              disabled={!isCharge}
              onClick={() => {
                onUpdateFilterType(filter.type === FILTER_TYPE.PUBLIC ? FILTER_TYPE.PERSONAL : FILTER_TYPE.PUBLIC);
                this.setState({
                  operateVisible: false,
                });
              }}
            >
              <i className={cx('icon', filter.type === FILTER_TYPE.PUBLIC ? 'icon-person' : 'icon-group')}></i>
              {filter.type === FILTER_TYPE.PUBLIC ? _l('设为个人筛选') : _l('设为公共筛选')}
            </NewMenuItem>
            <hr />
            <NewMenuItem
              className="operateBtn"
              disabled={filter.createAccountId !== md.global.Account.accountId && !isCharge}
              onClick={() => {
                onDelete(filter);
                this.setState({
                  operateVisible: false,
                });
              }}
            >
              <i className="icon icon-hr_delete"></i>
              {_l('删除')}
            </NewMenuItem>
          </Menu>
        }
        getPopupContainer={() => document.body}
        popupAlign={{
          points: ['bl', 'tl'],
          offset: [0, 0],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
      >
        <i className="icon icon-more_horiz moreOperateBtn" onClick={() => this.setState({ operateVisible: true })}></i>
      </Trigger>
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
            <span className="ThemeHoverColor3 Hand mTop15 mRight6 Gray_75" onClick={onSaveNew}>
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
          className={cx('filterItem flexRow ThemeBGColor3', { expanded })}
          onClick={e => {
            const $targetTarget = $(e.target).closest('.moreOperateBtn, .worksheetFilterOperateList');
            if ($targetTarget.length) {
              return;
            }
            onFilter();
            hideFilter();
          }}
        >
          <div
            className={cx('filterTitle flex ellipsis', { ThemeColor3: selected })}
            ref={title => (this.title = title)}
          >
            {nameIsEditing ? (
              <Input
                className="filterNameInput"
                defaultValue={filter.name}
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
                  this.setState({ nameIsEditing: true }, () => {
                    if (this.title) {
                      this.title.querySelector('.filterNameInput').select();
                      this.title.querySelector('.filterNameInput').focus();
                    }
                  });
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

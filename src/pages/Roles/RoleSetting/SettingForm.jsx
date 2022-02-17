import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Button, ScrollView, Input, Radio, Dropdown, Checkbox, LoadDiv } from 'ming-ui';
import SheetTable, { changeSheetModel } from './SheetTable';
import { PERMISSION_WAYS, TEXTS, roleDetailPropType } from '../config';
import styles from './style.less?module';

const PERMISSION_WAYS_WITH_CHECKBOX = [
  PERMISSION_WAYS.OnlyManageSelfRecord,
  PERMISSION_WAYS.OnlyManageSelfAndSubRecord,
  PERMISSION_WAYS.ViewAllAndManageSelfRecord,
  PERMISSION_WAYS.ViewAllAndManageSelfAndSubRecord,
];

const PERMISSION_WAYS_WITH_CHECKED = [
  PERMISSION_WAYS.OnlyManageSelfAndSubRecord,
  PERMISSION_WAYS.ViewAllAndManageSelfAndSubRecord,
];
const PERMISSION_WAYS_WITH_UNCHECKED = [
  PERMISSION_WAYS.OnlyManageSelfRecord,
  PERMISSION_WAYS.ViewAllAndManageSelfRecord,
];

export default class extends PureComponent {
  static propTypes = {
    loading: PropTypes.bool,
    roleDetail: roleDetailPropType,
    closePanel: PropTypes.func,
    onChange: PropTypes.func,
    onSave: PropTypes.func,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.loading && !this.props.loading && !prevProps.roleDetail.roleId && this.input) {
      this.input.select();
    }
  }

  updateSheetAuth = _newSheet => {
    const { onChange, roleDetail } = this.props;
    onChange({
      ...roleDetail,
      sheets: _.map(roleDetail.sheets, sheet => {
        if (sheet.sheetId === _newSheet.sheetId) return _newSheet;
        return sheet;
      }),
    });
  };

  changePermissionWay = permissionWay => {
    const { onChange, roleDetail: { description, permissionWay: oldPermissionWay } = {} } = this.props;
    if (oldPermissionWay !== permissionWay) {
      const payload = {
        permissionWay: permissionWay,
        description: description === TEXTS[oldPermissionWay] ? TEXTS[permissionWay] : description,
      };
      onChange(payload);
    }
  };

  renderAuth() {
    const { roleDetail: { permissionWay } = {}, isForPortal } = this.props;

    const list = [
      PERMISSION_WAYS.ManageAllRecord,
      PERMISSION_WAYS.ViewAllAndManageSelfRecord,
      PERMISSION_WAYS.OnlyManageSelfRecord,
      PERMISSION_WAYS.OnlyViewAllRecord,
    ].map(value => ({
      text: TEXTS[value],
      value,
    }));
    const isCustom = PERMISSION_WAYS.CUSTOM === permissionWay;

    const showCheckbox = PERMISSION_WAYS_WITH_CHECKBOX.indexOf(permissionWay) !== -1;
    const isChecked = showCheckbox && PERMISSION_WAYS_WITH_CHECKED.indexOf(permissionWay) !== -1;

    return (
      <React.Fragment>
        <div className="Font14 mTop25 bold">{_l('分发哪些应用项？')}</div>
        <div className="mTop15 Font14">
          <Radio
            text={_l('分发所有应用项（简单）')}
            checked={!isCustom}
            value={PERMISSION_WAYS.ViewAllAndManageSelfRecord}
            onClick={this.changePermissionWay}
          />
          <Radio
            text={_l('分发有选择的应用项（高级）')}
            className="mLeft40"
            checked={isCustom}
            value={PERMISSION_WAYS.CUSTOM}
            onClick={this.changePermissionWay}
          />
        </div>
        {!isCustom ? (
          <div>
            <div className="Font14 mTop25 bold">{_l('权限')}</div>
            <div className="mTop8">
              <Dropdown
                className="w100 Font14"
                data={list}
                value={permissionWay}
                border
                renderTitle={() => {
                  return TEXTS[permissionWay];
                }}
                menuStyle={{ width: '100%' }}
                onChange={this.changePermissionWay}
              />
            </div>
            {showCheckbox && !isForPortal ? (
              <div className="mTop15">
                <Checkbox
                  className={styles.subCheckbox}
                  checked={isChecked}
                  size="small"
                  onClick={checked => {
                    if (checked) {
                      const index = PERMISSION_WAYS_WITH_CHECKED.indexOf(permissionWay);
                      this.changePermissionWay(PERMISSION_WAYS_WITH_UNCHECKED[index]);
                    } else {
                      const index = PERMISSION_WAYS_WITH_UNCHECKED.indexOf(permissionWay);
                      this.changePermissionWay(PERMISSION_WAYS_WITH_CHECKED[index]);
                    }
                  }}
                >
                  {_l('包含下属拥有的记录')}
                </Checkbox>
              </div>
            ) : null}
          </div>
        ) : (
          this.renderAuthTable()
        )}
      </React.Fragment>
    );
  }

  renderAuthTable() {
    const { roleDetail: { sheets = [], pages = [] } = {} } = this.props;
    const AUTH = [
      { text: _l('查看'), operatorKey: 'READ', key: 'canRead' },
      { text: _l('编辑'), operatorKey: 'EDIT', key: 'canEdit' },
      { text: _l('删除'), operatorKey: 'REMOVE', key: 'canRemove' },
      { text: _l('新增'), operatorKey: 'ADD', key: 'canAdd' },
    ];
    //将工作表和自定义页面 混合排序
    const lists = sheets.concat(pages).sort((a, b) => {
      return a.sortIndex - b.sortIndex;
    });
    return (
      <Fragment>
        <div className="Font14 mTop32 Gray_75">{_l('可以访问的视图和数据操作权限')}</div>
        <div className={cx(styles.authTable, 'mTop12')}>
          <div className={styles.tableHeader}>
            <div className={'TxtLeft pLeft24 boxSizing ' + styles.tableHeaderItemMax}>{_l('应用项')}</div>
            {AUTH.map((item, index) => {
              let clearselected;
              let checked;
              if (item.operatorKey === 'READ') {
                checked =
                  !sheets.filter(obj => obj.views.filter(o => !o[item.key]).length).length &&
                  !pages.filter(o => !o.checked).length;
                clearselected =
                  !checked &&
                  (!!sheets.filter(obj => obj.views.filter(o => o[item.key]).length).length ||
                    !!pages.filter(o => o.checked).length);
              } else if (item.operatorKey === 'ADD') {
                checked = sheets.filter(obj => obj.canAdd).length === sheets.length;
                clearselected =
                  !checked &&
                  sheets.filter(obj => obj.canAdd).length !== sheets.length &&
                  sheets.filter(obj => obj.canAdd).length > 0;
              } else {
                checked = !sheets.filter(obj => obj.views.filter(o => !o[item.key]).length).length;
                clearselected = !checked && !!sheets.filter(obj => obj.views.filter(o => o[item.key]).length).length;
              }
              return (
                <div key={index} className={styles.tableHeaderItem}>
                  <Checkbox
                    className="InlineBlock"
                    checked={checked}
                    clearselected={clearselected}
                    onClick={checked => this.toggleAllViewAuth(item.operatorKey, !checked)}
                  />
                  {item.text}
                </div>
              );
            })}
            <div className={styles.tableHeaderItem + ' mLeft20'}>{_l('数据操作权限')}</div>
          </div>
          {sheets.length ? (
            _.map(lists, list => {
              return (
                <SheetTable
                  isForPortal={this.props.isForPortal}
                  sheet={list}
                  key={list.sheetId || list.pageId}
                  onChange={this.updateSheetAuth}
                  updateLookPages={this.updateLookPages}
                  updateNavigateHide={this.updateNavigateHide}
                  getContainer={() => {
                    return this.container || document.body;
                  }}
                />
              );
            })
          ) : (
            <div className={styles.emptyContent}>{_l('还没有创建工作表')}</div>
          )}
        </div>
      </Fragment>
    );
  }

  toggleAllViewAuth(key, checked) {
    const { roleDetail, onChange } = this.props;
    const sheets = (roleDetail.sheets || []).map(item => changeSheetModel(item, key, checked));
    if (key === 'READ') {
      let pages = _.cloneDeep(roleDetail.pages).map(o => {
        return { ...o, checked, navigateHide: !checked ? false : o.navigateHide };
      });
      onChange({
        ...roleDetail,
        sheets,
        pages,
      });
    } else {
      onChange({
        ...roleDetail,
        sheets,
      });
    }
  }

  updateNavigateHide = (isSheet, id, navigateHide) => {
    const { roleDetail, onChange } = this.props;
    if (isSheet) {
      onChange({
        sheets: _.cloneDeep(roleDetail.sheets).map(o => {
          if (id === o.sheetId) {
            return { ...o, navigateHide };
          } else {
            return o;
          }
        }),
      });
    } else {
      onChange({
        pages: _.cloneDeep(roleDetail.pages).map(o => {
          if (id === o.pageId) {
            return { ...o, navigateHide };
          } else {
            return o;
          }
        }),
      });
    }
  };

  updateLookPages = (id, checked) => {
    const { roleDetail, onChange } = this.props;
    let pages = _.cloneDeep(roleDetail.pages).map(o => {
      if (id === o.pageId) {
        return { ...o, checked, navigateHide: !checked ? false : o.navigateHide };
      } else {
        return o;
      }
    });
    onChange({ pages });
  };

  render() {
    const { roleDetail: { name, description } = {}, loading, closePanel, onChange, onSave } = this.props;

    if (loading) return <LoadDiv className="mTop10" />;

    return (
      <React.Fragment>
        <div className={styles.body}>
          <ScrollView>
            <div
              className={styles.settingForm}
              ref={el => {
                this.container = el;
              }}
            >
              <div className="Font14 bold">{_l('角色名称')}</div>
              <div className="mTop8">
                <Input
                  type="text"
                  value={name}
                  className={styles.nameInput}
                  manualRef={el => {
                    this.input = el;
                  }}
                  maxLength={20}
                  onChange={value => {
                    onChange({
                      name: value,
                    });
                  }}
                />
              </div>
              <div className="Font14 mTop25 bold">{_l('描述')}</div>
              <div className="mTop8">
                <Input
                  type="text"
                  className="w100"
                  value={description || ''}
                  maxLength={300}
                  onChange={value => {
                    onChange({
                      description: value,
                    });
                  }}
                />
              </div>
              {this.renderAuth()}
            </div>
          </ScrollView>
        </div>
        <div className={styles.footer}>
          <Button action={onSave}>{_l('确认')}</Button>
          <Button className="mLeft12" type="ghost" onClick={closePanel}>
            {_l('取消')}
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { ScrollView, Input, Radio, Dropdown, Checkbox, LoadDiv, Tooltip, Icon } from 'ming-ui';
import SheetTable, { changeSheetModel } from './SheetTable';
import { PERMISSION_WAYS, TEXTS, roleDetailPropType, actionList } from 'src/pages/Role/config.js';
import styled from 'styled-components';
import _ from 'lodash';
import { WrapFooter } from 'src/pages/Role/style.jsx';

const WrapCon = styled.div`
  .optionTxt {
    font-size: 12px;
    color: #919191;
  }
  .toUser {
    color: #5a5a5a;
    &:hover {
      color: #2196f3;
    }
  }
  .ming.Input {
    border: 1px solid #ddd;
  }
  .ming.Dropdown .Dropdown--border,
  .dropdownTrigger .Dropdown--border {
    border-color: #ddd;
  }
`;
const Wrap = styled.div`
  width: 52%;
`;

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
    onChange: PropTypes.func,
    onSave: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      actionList: actionList.filter(o =>
        props.isForPortal ? !['gneralShare', 'generalLogging'].includes(o.key) : true,
      ),
    };
  }

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

  changePermissionWay = (permissionWay, clearExtendAttrs = false) => {
    const { onChange, roleDetail: { description, permissionWay: oldPermissionWay } = {} } = this.props;
    if (oldPermissionWay !== permissionWay) {
      let payload = {
        permissionWay: permissionWay,
        description: description === TEXTS[oldPermissionWay] ? TEXTS[permissionWay] : description,
      };
      if (PERMISSION_WAYS.OnlyViewAllRecord === permissionWay) {
        //对所有记录只有查看权限 同时 操作权限 不可新增
        payload = {
          ...payload,
          generalAdd: {
            enable: false,
          },
        };
      } else if (
        [
          PERMISSION_WAYS.ManageAllRecord,
          PERMISSION_WAYS.ViewAllAndManageSelfRecord,
          PERMISSION_WAYS.OnlyManageSelfRecord,
        ].includes(permissionWay)
      ) {
        //对所有记录只有查看权限 之外的选项 操作都初始化勾选
        this.state.actionList.map(o => {
          payload[o.key] = {
            enable: true,
          };
        });
        payload = {
          ...payload,
        };
      }

      if (clearExtendAttrs) {
        payload.extendAttrs = [];
      }

      onChange(payload);
    }
  };

  renderAuth() {
    const {
      roleDetail: { permissionWay, optionalControls, extendAttrs } = {},
      isForPortal,
      onChange,
      roleDetail,
    } = this.props;

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
    let actionListClone = this.state.actionList;
    if (PERMISSION_WAYS.OnlyViewAllRecord === permissionWay) {
      actionListClone = actionListClone.filter(o => o.key !== 'generalAdd');
    }
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
            onClick={value => this.changePermissionWay(value, true)}
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
                onChange={value => this.changePermissionWay(value, true)}
              />
            </div>
            {showCheckbox && !isForPortal ? (
              <div className="mTop15 flexRow alignItemsCenter">
                <Checkbox
                  className={'subCheckbox InlineBlock'}
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
                  {_l('下属加入/拥有的记录')}
                </Checkbox>
                <Tooltip text={<span>{_l('汇报关系中，下属拥有的记录')} </span>} popupPlacement="top">
                  <i className="icon-info_outline Font16 Gray_9e mLeft3 TxtMiddle" />
                </Tooltip>
              </div>
            ) : null}
            {showCheckbox && optionalControls.length > 0 && !isForPortal ? (
              <div className="mTop15 flexRow">
                <div className="left">
                  <span className="flexRow alignItemsCenter">
                    <Checkbox
                      className={'subCheckbox InlineBlock'}
                      checked={optionalControls.filter(l => extendAttrs.includes(l.id)).length > 0}
                      clearselected={
                        optionalControls.filter(l => extendAttrs.includes(l.id)).length > 0 &&
                        optionalControls.filter(l => !extendAttrs.includes(l.id)).length !== 0
                      }
                      size="small"
                      onClick={checked => {
                        if (checked) {
                          onChange({ extendAttrs: [] });
                        } else {
                          onChange({ extendAttrs: optionalControls.map(l => l.id) });
                        }
                      }}
                    >
                      {_l('匹配用户权限标签的记录')}
                    </Checkbox>
                    <Tooltip
                      text={
                        <span>
                          {_l(
                            '可启用的权限标签字段来自于[用户扩展信息]的标签字段。勾选后，可根据[用户扩展信息-人员表]中配置的字段值，查看工作表被关联的字段所属记录。',
                          )}{' '}
                        </span>
                      }
                      popupPlacement="top"
                    >
                      <Icon icon="workflow_error" className="Font16 Gray_9e mLeft3 TxtMiddle" />
                    </Tooltip>
                  </span>
                </div>
                <div className="right mLeft40" style={{ display: 'flex', gap: '10px 46px', flexWrap: 'wrap' }}>
                  {optionalControls.map(item => (
                    <span className="flexRow alignItemsCenter">
                      <Checkbox
                        className="InlineBlock"
                        checked={extendAttrs.indexOf(item.id) > -1}
                        text={item.name}
                        onClick={value => {
                          if (value) {
                            onChange({
                              extendAttrs: extendAttrs.filter(l => l !== item.id),
                            });
                          } else {
                            onChange({
                              extendAttrs: extendAttrs.concat(item.id),
                            });
                          }
                        }}
                      />
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {!isCustom && (
              <React.Fragment>
                <div className="mTop30">
                  <span className="Bold">{_l('操作权限')}</span>
                  <span
                    className="mLeft5 Hand ThemeHoverColor3 optionTxt"
                    onClick={() => {
                      let data = {};
                      actionListClone.map(o => {
                        data[o.key] = {
                          enable: actionListClone.filter(o => !roleDetail[o.key].enable).length > 0,
                        };
                      });
                      onChange(data);
                    }}
                  >
                    {actionListClone.filter(o => !roleDetail[o.key].enable).length > 0 ? _l('全选') : _l('取消全选')}
                  </span>
                </div>
                <div className="actionListCon">
                  {this.state.actionList.map(o => {
                    return (
                      <div className="Width120 mTop20 InlineBlock flexRow alignItemsCenter">
                        <Checkbox
                          className={'subCheckbox InlineBlock TxtMiddle'}
                          disabled={o.key === 'generalAdd' && PERMISSION_WAYS.OnlyViewAllRecord === permissionWay} //对所有记录只有查看权限 同时 操作权限 不可新增
                          checked={
                            o.key === 'generalAdd' && PERMISSION_WAYS.OnlyViewAllRecord === permissionWay
                              ? false
                              : roleDetail[o.key].enable
                          }
                          size="small"
                          onClick={checked => {
                            onChange({
                              [o.key]: {
                                enable: !roleDetail[o.key].enable,
                              },
                            });
                          }}
                        >
                          {o.txt}
                        </Checkbox>
                        {o.tips && (
                          <Tooltip
                            text={
                              <span>
                                {this.props.isForPortal && o.key === 'generalDiscussion' ? _l('包含记录讨论') : o.tips}{' '}
                              </span>
                            }
                            popupPlacement="top"
                          >
                            <i className="icon-info_outline Font16 Gray_9e mLeft3 TxtMiddle" />
                          </Tooltip>
                        )}
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            )}
          </div>
        ) : (
          this.renderAuthTable()
        )}
      </React.Fragment>
    );
  }

  renderAuthTable() {
    const { roleDetail: { sheets = [], pages = [] } = {}, showRoleSet, projectId, appId } = this.props;
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
        <div className={cx('authTable mTop12')}>
          <div className={'tableHeader flexRow'}>
            <div className={'TxtLeft pLeft24 boxSizing tableHeaderItemMax flex'}>{_l('应用项')}</div>
            <Wrap className="con flexRow">
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
                  <div key={index} className={'tableHeaderItem tableHeaderOther'}>
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
            </Wrap>
            <div className={'tableHeaderItem tableHeaderOption TxtCenter'}>{_l('数据操作权限')}</div>
          </div>
          {lists.length ? (
            _.map(lists, list => {
              return (
                <SheetTable
                  projectId={projectId}
                  appId={appId}
                  showRoleSet={showRoleSet}
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
            <div className={'emptyContent'}>{_l('还没有创建工作表或自定义页面')}</div>
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
    let {
      roleDetail: { name, description, roleId, hideAppForMembers } = {},
      loading,
      onChange,
      onSave,
      onDel,
      saveLoading,
      roleDetailCache,
      isForPortal,
      setQuickTag,
      canEditUser,
    } = this.props;
    roleId = roleId === 'new' ? '' : roleId;
    if (loading) return <LoadDiv className="mTop10" />;

    return (
      <React.Fragment>
        <WrapCon className={'setBody'}>
          <ScrollView>
            <div
              className={'settingForm'}
              ref={el => {
                this.container = el;
              }}
            >
              <div className="roleTitle Bold Font17">{!roleId ? _l('创建角色') : _l('编辑角色')}</div>
              <div className="flexRow alignItemsCenter mTop30">
                <div className="Font14 bold flex">{_l('角色名称')}</div>
              </div>
              <div className="mTop8 flexRow">
                <Input
                  type="text"
                  value={name}
                  className={'nameInput'}
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
                {!!roleId && !isForPortal && (
                  <span className="Font14 toUser Hand flexRow alignItemsCenter mLeft30">
                    <Checkbox
                      className="Gray"
                      size="small"
                      checked={hideAppForMembers}
                      onClick={() => {
                        onChange({
                          hideAppForMembers: !hideAppForMembers,
                        });
                      }}
                      text={_l('隐藏应用')}
                    />
                    <Tooltip
                      text={
                        <span>
                          {_l(
                            '对当前角色下的用户仅授予权限，但不显示应用入口。通常用于跨应用关联数据或引用视图时，只需要用户从另一个应用中进行操作的场景。',
                          )}
                        </span>
                      }
                      popupPlacement="top"
                    >
                      <i className="icon-info_outline Font16 Gray_bd mLeft7" />
                    </Tooltip>
                  </span>
                )}
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
        </WrapCon>
        <WrapFooter className={'footer flexRow alignItemsCenter'}>
          <div
            className={cx('saveBtn Hand flexRow alignItemsCenter', {
              disabled: saveLoading || (_.isEqual(this.props.roleDetail, roleDetailCache) && !!roleId),
            })}
            onClick={() => {
              if (saveLoading || (_.isEqual(this.props.roleDetail, roleDetailCache) && !!roleId)) {
                return;
              }
              onSave();
            }}
          >
            {saveLoading ? (roleId ? _l('保存中') : _l('创建中')) : roleId ? _l('保存') : _l('创建')}
          </div>
          <div
            onClick={() => {
              if (_.isEqual(this.props.roleDetail, roleDetailCache) && !!roleId) {
                return;
              } else {
                onDel();
              }
            }}
            className={cx('delBtn Hand', {
              disabled: _.isEqual(this.props.roleDetail, roleDetailCache) && !!roleId,
            })}
          >
            {!roleId ? _l('删除') : _l('取消')}
          </div>
          {!!roleId && canEditUser && (
            <React.Fragment>
              <div className="line"></div>
              <div
                className="toUser Hand Bold"
                onClick={() => {
                  this.props.handleChangePage(() => {
                    setQuickTag({ roleId: roleId, tab: 'user' });
                  });
                }}
              >
                {_l('管理用户')}
              </div>
            </React.Fragment>
          )}
        </WrapFooter>
      </React.Fragment>
    );
  }
}

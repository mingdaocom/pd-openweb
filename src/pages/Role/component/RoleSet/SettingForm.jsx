import React, { Fragment, PureComponent } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Button, Checkbox, Input, Radio, Select, Switch, Tooltip } from 'ming-ui/antd-components';
import { actionList, PERMISSION_WAYS, roleDetailPropType, TEXTS } from 'src/pages/Role/config.js';
import { WrapFooter } from 'src/pages/Role/style.jsx';
import BatchDialog from './batch';
import RecordLoggingSettingDialog, { getRecordLoggingRangeText, LOGGING_RANGE } from './RecordLoggingSettingDialog';
import SheetTable, { changeSheetModel } from './SheetTable';

const WrapCon = styled.div`
  min-height: 0;
  .optionTxt {
    font-size: 12px;
    color: var(--color-text-tertiary);
  }
  .recordLoggingRangeText {
    color: var(--color-text-secondary);
  }
  .recordLoggingSettingIcon:hover {
    color: var(--color-primary) !important;
  }
  .flexShrink {
    flex-shrink: 0;
    min-width: 0;
  }
  .worksheetSearch {
    padding: 0 12px;
  }
`;
const SUB_CHECKBOX_STYLES = {
  label: { paddingInlineStart: 10, paddingInlineEnd: 0 },
};

const CHECKBOX_LABEL_STYLES = {
  label: { paddingInlineEnd: 0 },
};
const SEARCH_INPUT_STYLE = { backgroundColor: 'transparent' };

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
      actionList: actionList.filter(o => (props.isForPortal ? !['gneralShare'].includes(o.key) : true)),
      keyWord: '',
      select: [],
      showBatchDialog: false,
      showGeneralLoggingDialog: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.loading && !this.props.loading && !_.get(prevProps, 'roleDetail.roleId') && this.input) {
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
    const { onChange, roleDetail = {} } = this.props;
    const { description, permissionWay: oldPermissionWay } = roleDetail;

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
          const prev = roleDetail[o.key] || {};
          payload[o.key] =
            o.key === 'generalLogging'
              ? {
                  ...prev,
                  enable: true,
                  Range: prev.Range || LOGGING_RANGE.ALL,
                  AllowExport: _.isBoolean(prev.AllowExport) ? prev.AllowExport : false,
                }
              : {
                  ...prev,
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
      label: TEXTS[value],
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
            checked={!isCustom}
            value={PERMISSION_WAYS.ViewAllAndManageSelfRecord}
            onChange={event => this.changePermissionWay(event.target.value, event)}
            title={_l('分发所有应用项（简单）')}
          >
            {_l('分发所有应用项（简单）')}
          </Radio>
          <Radio
            className="mLeft40"
            checked={isCustom}
            value={PERMISSION_WAYS.CUSTOM}
            onChange={event => this.changePermissionWay(event.target.value, true)}
            title={_l('分发有选择的应用项（高级）')}
          >
            {_l('分发有选择的应用项（高级）')}
          </Radio>
        </div>
        {!isCustom ? (
          <div>
            <div className="Font14 mTop25 bold">{_l('权限')}</div>
            <div className="mTop8">
              <Select
                className="w100 Font14"
                options={list}
                value={permissionWay}
                labelRender={() => {
                  return TEXTS[permissionWay];
                }}
                onChange={value => this.changePermissionWay(value, true)}
              />
            </div>
            {showCheckbox && !isForPortal ? (
              <div className="mTop15 flexRow alignItemsCenter">
                <Switch
                  size="small"
                  className="InlineBlock"
                  checked={isChecked}
                  onClick={(checked, event) => {
                    event.stopPropagation();
                    if (!checked) {
                      const index = PERMISSION_WAYS_WITH_CHECKED.indexOf(permissionWay);
                      this.changePermissionWay(PERMISSION_WAYS_WITH_UNCHECKED[index]);
                    } else {
                      const index = PERMISSION_WAYS_WITH_UNCHECKED.indexOf(permissionWay);
                      this.changePermissionWay(PERMISSION_WAYS_WITH_CHECKED[index]);
                    }
                  }}
                />
                <span className="mLeft10"> {_l('下属加入/拥有的记录')}</span>
                <Tooltip title={_l('在组织管理【汇报关系】中管理用户的下属')}>
                  <i className="icon-info_outline Font16 textTertiary mLeft3 TxtMiddle" />
                </Tooltip>
              </div>
            ) : null}
            {showCheckbox && optionalControls.length > 0 ? (
              <div className="mTop15 flexRow">
                <div className="left">
                  <span className="flexRow alignItemsCenter">
                    <Switch
                      className="InlineBlock"
                      checked={optionalControls.filter(l => extendAttrs.includes(l.id)).length > 0}
                      size="small"
                      onClick={(checked, event) => {
                        event.stopPropagation();
                        if (!checked) {
                          onChange({
                            extendAttrs: [],
                          });
                        } else {
                          onChange({
                            extendAttrs: optionalControls.map(l => l.id),
                          });
                        }
                      }}
                    />
                    <span className="mLeft10">{_l('匹配用户权限标签的记录')}</span>
                    {!isForPortal && (
                      <Tooltip title={_l('在本应用【用户-扩展】中管理用户的权限标签')}>
                        <Icon icon="info_outline" className="Font16 textTertiary mLeft3 TxtMiddle" />
                      </Tooltip>
                    )}
                  </span>
                </div>
                <div className="right mLeft40" style={{ display: 'flex', gap: '10px 46px', flexWrap: 'wrap' }}>
                  {optionalControls.map(item => (
                    <span className="flexRow alignItemsCenter">
                      <Checkbox
                        checked={extendAttrs.indexOf(item.id) > -1}
                        onChange={event => {
                          if (!event.target.checked) {
                            onChange({
                              extendAttrs: extendAttrs.filter(l => l !== item.id),
                            });
                          } else {
                            onChange({
                              extendAttrs: extendAttrs.concat(item.id),
                            });
                          }
                        }}
                      >
                        {item.name}
                      </Checkbox>
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
                    className="mLeft5 Hand hoverColorPrimary optionTxt"
                    onClick={() => {
                      let data = {};
                      const turnOn = actionListClone.filter(it => !(roleDetail[it.key] || {}).enable).length > 0;
                      actionListClone.map(o => {
                        const prev = roleDetail[o.key] || {};
                        const nextEnable = turnOn;
                        data[o.key] =
                          o.key === 'generalLogging' && nextEnable
                            ? {
                                ...prev,
                                enable: true,
                                Range: prev.Range || LOGGING_RANGE.ALL,
                                AllowExport: _.isBoolean(prev.AllowExport) ? prev.AllowExport : false,
                              }
                            : {
                                ...prev,
                                enable: nextEnable,
                              };
                      });
                      onChange(data);
                    }}
                  >
                    {actionListClone.filter(it => !(roleDetail[it.key] || {}).enable).length > 0
                      ? _l('全选')
                      : _l('取消全选')}
                  </span>
                </div>
                <div className="actionListCon">
                  {this.state.actionList.map(o => {
                    return (
                      <div className="mRight30 mTop20 InlineFlex flexRow alignItemsCenter">
                        <Checkbox
                          className={'subCheckbox TxtMiddle'}
                          disabled={o.key === 'generalAdd' && PERMISSION_WAYS.OnlyViewAllRecord === permissionWay} //对所有记录只有查看权限 同时 操作权限 不可新增
                          checked={
                            o.key === 'generalAdd' && PERMISSION_WAYS.OnlyViewAllRecord === permissionWay
                              ? false
                              : !!(roleDetail[o.key] || {}).enable
                          }
                          onChange={() => {
                            const prev = roleDetail[o.key] || {};
                            const nextEnable = !prev.enable;
                            onChange({
                              [o.key]:
                                o.key === 'generalLogging' && nextEnable
                                  ? {
                                      ...prev,
                                      enable: true,
                                      Range: prev.Range || LOGGING_RANGE.ALL,
                                      AllowExport: _.isBoolean(prev.AllowExport) ? prev.AllowExport : false,
                                    }
                                  : {
                                      ...prev,
                                      enable: nextEnable,
                                    },
                            });
                          }}
                          size="small"
                          styles={SUB_CHECKBOX_STYLES}
                        >
                          {o.txt}
                          {o.tips && (
                            <Tooltip
                              title={
                                <span>
                                  {this.props.isForPortal && o.key === 'generalDiscussion'
                                    ? _l('包含记录讨论')
                                    : o.tips}
                                </span>
                              }
                            >
                              <i className="icon-info_outline Font16 textTertiary mLeft3 TxtMiddle" />
                            </Tooltip>
                          )}
                        </Checkbox>
                        {o.key === 'generalLogging' && !!(roleDetail[o.key] || {}).enable && (
                          <Fragment>
                            <span className="recordLoggingRangeText mLeft5">
                              {getRecordLoggingRangeText(roleDetail[o.key])}
                            </span>
                            <Icon
                              icon="settings"
                              className="recordLoggingSettingIcon Font16 Hand textTertiary mLeft8 TxtMiddle InlineBlock"
                              onClick={e => {
                                e.stopPropagation();
                                this.setState({ showGeneralLoggingDialog: true });
                              }}
                            />
                          </Fragment>
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
        <RecordLoggingSettingDialog
          visible={this.state.showGeneralLoggingDialog}
          value={roleDetail.generalLogging}
          onChange={next => this.props.onChange({ generalLogging: next })}
          onClose={() => this.setState({ showGeneralLoggingDialog: false })}
        />
      </React.Fragment>
    );
  }

  renderAuthTable() {
    const {
      roleDetail: { sheets = [], pages = [], chatbots = [] } = {},
      showRoleSet,
      projectId,
      appId,
      isForPortal,
      onChange,
    } = this.props;
    const { keyWord = '', showBatchDialog } = this.state;
    const AUTH = [
      { text: _l('查看'), operatorKey: 'READ', key: 'canRead' },
      { text: _l('编辑'), operatorKey: 'EDIT', key: 'canEdit' },
      { text: _l('删除'), operatorKey: 'REMOVE', key: 'canRemove' },
      { text: _l('新增'), operatorKey: 'ADD', key: 'canAdd' },
    ];
    //将工作表和自定义页面 混合排序
    const lists = sheets
      .concat(pages)
      .concat(chatbots)
      .sort((a, b) => {
        return a.sortIndex - b.sortIndex;
      })
      .filter(
        o =>
          (o.sheetName || '').toLowerCase().indexOf(keyWord.toLowerCase()) >= 0 ||
          (o.name || '').toLowerCase().indexOf(keyWord.toLowerCase()) >= 0 ||
          (o.views || []).find(a => (a.viewName || '').toLowerCase().indexOf(keyWord.toLowerCase()) >= 0),
      );
    return (
      <Fragment>
        <div className="Font14 mTop32 textSecondary">{_l('可以访问的视图和数据操作权限')}</div>
        <div className={cx('authTable mTop12')}>
          <div className={'tableHeader flexRow Bold'}>
            <div className="flexRow flex flex-shrink-0">
              <div className={'TxtLeft pLeft24 boxSizing flexRow w35'}>
                <span className="flexShrink">{_l('应用项')}</span>
                <div className="worksheetSearch flexShrink flex">
                  <Input
                    allowClear
                    className="flex"
                    value={keyWord}
                    placeholder={_l('搜索')}
                    prefix={<Icon icon="search" className="textSecondary Font16" />}
                    variant="underlined"
                    style={SEARCH_INPUT_STYLE}
                    onChange={event => this.setState({ keyWord: event.target.value })}
                  />
                </div>
              </div>
              <div className="con flexRow flex">
                {AUTH.map((item, index) => {
                  let clearselected;
                  let checked;

                  if (item.operatorKey === 'READ') {
                    checked =
                      !sheets.filter(obj => obj.views.filter(o => !o[item.key]).length).length &&
                      ![...pages, ...chatbots].filter(o => !o.checked).length;
                    clearselected =
                      !checked &&
                      (!!sheets.filter(obj => obj.views.filter(o => o[item.key]).length).length ||
                        !![...pages, ...chatbots].filter(o => o.checked).length);
                  } else if (item.operatorKey === 'ADD') {
                    checked = sheets.filter(obj => obj.canAdd).length === sheets.length && sheets.length > 0;
                    clearselected =
                      !checked &&
                      sheets.filter(obj => obj.canAdd).length !== sheets.length &&
                      sheets.filter(obj => obj.canAdd).length > 0;
                  } else {
                    let viewsData = [];
                    let allViews = [];
                    sheets.map(obj => {
                      viewsData.push(...obj.views.filter(o => o[item.key]));
                      allViews.push(...obj.views);
                    });
                    checked = viewsData.length === allViews.length && allViews.length > 0;
                    clearselected = !checked && viewsData.length !== allViews.length && viewsData.length > 0;
                  }

                  return (
                    <div key={index} className={'tableHeaderItem tableHeaderOther'}>
                      <Checkbox
                        checked={checked}
                        indeterminate={clearselected}
                        styles={CHECKBOX_LABEL_STYLES}
                        onChange={event => this.toggleAllViewAuth(item.operatorKey, event.target.checked)}
                      >
                        {item.text}
                      </Checkbox>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={'tableHeaderItem tableHeaderOption TxtCenter flexRow'}>
              <span className="flex flexShrink overflow_ellipsis" title={_l('数据操作权限')}>
                {_l('数据操作权限')}
              </span>
              <Tooltip title={_l('批量编辑')}>
                <i
                  className={cx('icon-align_setting Font20 textSecondary mLeft8 mRight8 TxtMiddle', {
                    'Hand hoverColorPrimary': sheets.length > 0,
                  })}
                  onClick={() => {
                    if (sheets.length <= 0) return;
                    this.setState({ showBatchDialog: true });
                  }}
                />
              </Tooltip>
              {showBatchDialog && (
                <BatchDialog
                  isForPortal={isForPortal}
                  show={showBatchDialog}
                  sheets={sheets.sort((a, b) => {
                    return a.sortIndex - b.sortIndex;
                  })}
                  onClose={() => {
                    this.setState({ showBatchDialog: false });
                  }}
                  onOk={data => {
                    onChange({
                      ...(_.get(this.props, 'roleDetail') || {}),
                      sheets: sheets.map(o => {
                        const info = data.find(it => it.sheetId === o.sheetId);

                        if (info) {
                          return { ...o, ...info };
                        } else {
                          return o;
                        }
                      }),
                    });
                    this.setState({ showBatchDialog: false });
                  }}
                />
              )}
            </div>
          </div>
          {lists.length ? (
            _.map(lists, list => {
              const isShow = !keyWord
                ? false
                : !!(list.views || []).find(a => (a.viewName || '').toLowerCase().indexOf(keyWord.toLowerCase()) >= 0);
              return (
                <SheetTable
                  projectId={projectId}
                  isShow={isShow}
                  appId={appId}
                  showRoleSet={showRoleSet}
                  isForPortal={this.props.isForPortal}
                  sheet={list}
                  key={list.sheetId || list.pageId || list.id}
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
            <div className={'emptyContent'}>
              {keyWord ? _l('没有搜索到工作表或自定义页面') : _l('还没有创建工作表或自定义页面')}
            </div>
          )}
        </div>
      </Fragment>
    );
  }

  toggleAllViewAuth(key, checked) {
    const { roleDetail, onChange } = this.props;
    const sheets = (roleDetail.sheets || []).map(item => changeSheetModel(item, key, checked));

    if (key === 'READ') {
      const getDatas = data => {
        return _.cloneDeep(data).map(o => {
          return { ...o, checked, navigateHide: !checked ? false : o.navigateHide };
        });
      };

      onChange({
        ...roleDetail,
        sheets,
        pages: getDatas(roleDetail?.pages || []),
        chatbots: getDatas(roleDetail?.chatbots || []),
      });
    } else {
      onChange({
        ...roleDetail,
        sheets,
      });
    }
  }

  updateNavigateHide = (type, id, navigateHide) => {
    const { roleDetail, onChange } = this.props;
    const data = roleDetail[type];
    onChange({
      [type]: _.cloneDeep(data).map(o => {
        if (id === o.sheetId || id === o.pageId || id === o.id) {
          return { ...o, navigateHide };
        } else {
          return o;
        }
      }),
    });
  };

  updateLookPages = (id, checked, type) => {
    const { roleDetail, onChange } = this.props;
    const data = _.cloneDeep(roleDetail[type]).map(o => {
      if (id === o.pageId || id === o.id) {
        return { ...o, checked, navigateHide: !checked ? false : o.navigateHide };
      } else {
        return o;
      }
    });
    onChange({ [type]: data });
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
                  ref={el => {
                    this.input = el;
                  }}
                  maxLength={100}
                  onChange={event => {
                    onChange({
                      name: event.target.value,
                    });
                  }}
                />
                {!!roleId && !isForPortal && (
                  <span className="Font14 toUser Hand flexRow alignItemsCenter mLeft30">
                    <Checkbox
                      className="textPrimary"
                      checked={hideAppForMembers}
                      onChange={() => {
                        onChange({
                          hideAppForMembers: !hideAppForMembers,
                        });
                      }}
                      size="small"
                    >
                      {_l('隐藏应用')}
                    </Checkbox>
                    <Tooltip
                      title={_l(
                        '对当前角色下的用户仅授予权限，但不显示应用入口。通常用于跨应用关联数据或引用视图时，只需要用户从另一个应用中进行操作的场景。',
                      )}
                    >
                      <i className="icon-info_outline Font16 textDisabled mLeft7" />
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
                  onChange={event => {
                    onChange({
                      description: event.target.value,
                    });
                  }}
                />
              </div>
              {this.renderAuth()}
            </div>
          </ScrollView>
        </WrapCon>
        <WrapFooter className={'footer flexRow alignItemsCenter'}>
          <Button
            type="primary"
            loading={saveLoading}
            disabled={_.isEqual(this.props.roleDetail, roleDetailCache) && !!roleId}
            onClick={() => {
              if (saveLoading || (_.isEqual(this.props.roleDetail, roleDetailCache) && !!roleId)) {
                return;
              }

              onSave();
            }}
          >
            {saveLoading ? (roleId ? _l('保存中') : _l('创建中')) : roleId ? _l('保存') : _l('创建')}
          </Button>
          <Button
            className="mLeft24"
            disabled={_.isEqual(this.props.roleDetail, roleDetailCache) && !!roleId}
            onClick={() => {
              if (_.isEqual(this.props.roleDetail, roleDetailCache) && !!roleId) {
                return;
              } else {
                onDel();
              }
            }}
          >
            {!roleId ? _l('删除') : _l('取消')}
          </Button>
          {!!roleId && canEditUser && (
            <React.Fragment>
              <div className="line"></div>
              <Button
                onClick={() => {
                  this.props.handleChangePage(() => {
                    setQuickTag({ roleId: roleId, tab: 'user' });
                  });
                }}
              >
                {_l('管理用户')}
              </Button>
            </React.Fragment>
          )}
        </WrapFooter>
      </React.Fragment>
    );
  }
}

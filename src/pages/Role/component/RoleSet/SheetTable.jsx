import React, { PureComponent } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Icon, SvgIcon, Tooltip } from 'ming-ui';
import RoleSetTool from 'src/pages/Role/component/RoleSet/TooltipSetting';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum';
import ViewGroup from './ViewGroup';

const Wrap = styled.div`
  flex: 52;
`;
export const changeSheetModel = (sheet, type, checked) => {
  const KEYS = {
    READ: 'canRead',
    EDIT: 'canEdit',
    REMOVE: 'canRemove',
    ADD: 'canAdd',
  };
  const viewAuth = KEYS[type];
  if ('canAdd' === KEYS[type]) {
    return {
      ...sheet,
      canAdd: checked,
      views: _.map(sheet.views, view => {
        return {
          ...view,
          canRead: checked && getViewSize(sheet.views, 'canRead') <= 0 ? true : view.canRead,
        };
      }),
    };
  }
  return {
    ...sheet,
    canAdd: 'canRead' === KEYS[type] && !checked ? false : sheet.canAdd,
    views: _.map(sheet.views, view => {
      if (viewAuth !== 'canRead') {
        return {
          ...view,
          [viewAuth]: checked,
          canRead: checked ? true : view.canRead,
          navigateHide: !checked ? false : view.navigateHide,
        };
      } else {
        return {
          ...view,
          [viewAuth]: checked,
          canEdit: false,
          canRemove: false,
        };
      }
    }),
  };
};

const changeViewModel = (sheet, viewId, payload) => {
  return {
    ...sheet,
    views: _.map(sheet.views, view => {
      if (view.viewId === viewId) {
        return {
          ...view,
          ...payload,
        };
      } else {
        return view;
      }
    }),
  };
};

const isExist = (views, keyName) => {
  return _.some(views, view => view[keyName]);
};

const getViewSize = (views, keyName) => {
  return _.filter(views, view => view[keyName]).length;
};

export default class extends PureComponent {
  state = {
    show: false,
    showRoleSet: false,
  };

  componentDidMount() {
    this.setState({
      show: this.props.isShow,
    });
  }

  componentWillReceiveProps(prevProps) {
    if (this.props.isShow !== prevProps.isShow) {
      this.setState({
        show: prevProps.isShow,
      });
    }
  }

  formatViews = views => {
    const readSize = getViewSize(views, 'canRead');
    const editSize = getViewSize(views, 'canEdit');
    const removeSize = getViewSize(views, 'canRemove');
    // 逻辑表达式 短路
    const showRead = isExist(views, 'canRead');
    const showEdit = isExist(views, 'canEdit');
    const showRemove = isExist(views, 'canRemove');

    return { readSize, editSize, removeSize, showRead, showEdit, showRemove };
  };

  toggleViewAuth = (key, checked) => {
    const { sheet, onChange } = this.props;
    onChange(changeSheetModel(sheet, key, checked));
  };

  toggleViewLevel = (viewId, payload, isAllNoRead) => {
    const { sheet, onChange } = this.props;
    onChange(changeViewModel({ ...sheet, canAdd: isAllNoRead ? false : sheet.canAdd }, viewId, payload));
  };

  changeSheetLevel = payload => {
    const { sheet, onChange } = this.props;
    onChange({
      ...sheet,
      ...payload,
    });
  };

  changeSheetOptionInfo = payload => {
    const { sheet, onChange } = this.props;
    onChange({
      ...sheet,
      ...payload,
    });
  };

  setShowRole = () => {
    this.setState({
      showRoleSet: true,
    });
  };

  render() {
    const { showRoleSet } = this.state;
    const { sheet, updateLookPages, updateNavigateHide, projectId, appId } = this.props;
    const { readSize, editSize, removeSize, showRead, showEdit, showRemove } = this.formatViews(sheet.views);
    const showToolTipSetting = showRead || showEdit || showRemove;
    const viewList = _.filter(sheet.views, l => l.viewId !== sheet.sheetId);
    const AUTH = [
      { size: readSize, key: 'READ' },
      { size: editSize, key: 'EDIT' },
      { size: removeSize, key: 'REMOVE' },
      { key: 'ADD' },
    ];

    return (
      <div className={'tableRow w100 flexRow'}>
        <div className="viewsGroup flex w100">
          <div
            className={classNames('Hand viewSetting flexRow w100')}
            onClick={() => {
              this.setState({
                show: !this.state.show,
              });
            }}
          >
            <div className={classNames('boxSizing TxtLeft Hand  flexRow w35')} title={sheet.sheetName}>
              <span className={classNames(sheet.sheetId && viewList && viewList.length ? 'pLeft5' : 'pLeft25')}></span>
              {!!(sheet.sheetId && viewList && viewList.length) && (
                <Icon
                  icon="arrow-right-tip"
                  className={classNames('Gray_75 arrowIcon', {
                    rotated: this.state.show,
                  })}
                />
              )}
              <span className="mRight6 InlineBlock">
                <SvgIcon url={sheet.iconUrl} fill={'#757575'} size={18} />
              </span>
              <span className="flex overflow_ellipsis ThemeHoverColor3 InlineBlock">
                {sheet.sheetName || sheet.name}
              </span>
              <Tooltip
                popupPlacement="top"
                disable={!(sheet.checked || readSize > 0)}
                text={<span>{_l('在导航中隐藏')}</span>}
              >
                <span
                  className={classNames('mLeft7 arrowIconShow', {
                    show: sheet.navigateHide,
                    canShow: sheet.checked || readSize > 0,
                  })}
                  onClick={e => {
                    if (sheet.checked || readSize > 0) {
                      updateNavigateHide(!!sheet.sheetId, sheet.pageId || sheet.sheetId, !sheet.navigateHide);
                      e.stopPropagation();
                    }
                  }}
                >
                  <Icon icon="public-folder-hidden" />
                </span>
              </Tooltip>
            </div>
            <Wrap className="con flexRow">
              {sheet.sheetId ? (
                AUTH.map((item, index) => (
                  <div key={index} className={'viewSettingItem'} style={{ height: 45 }}>
                    <Checkbox
                      className="InlineBlock"
                      checked={
                        item.key === 'ADD' ? (readSize <= 0 ? false : sheet.canAdd) : item.size === viewList.length
                      }
                      clearselected={item.key !== 'ADD' && item.size > 0 && item.size !== viewList.length}
                      onClick={(checked, value, event) => {
                        this.toggleViewAuth(item.key, !checked);
                        event.stopPropagation();
                      }}
                    />
                    {!!item.size && <div>{item.size === viewList.length ? _l('全部') : _l('%0个', item.size)}</div>}
                  </div>
                ))
              ) : (
                <div className={'viewSettingItem'} style={{ height: 45 }}>
                  <Checkbox
                    className="InlineBlock"
                    checked={sheet.checked}
                    onClick={() => updateLookPages(sheet.pageId, !sheet.checked)}
                  />
                </div>
              )}
            </Wrap>
          </div>
          {sheet.sheetId && this.state.show && (
            <ViewGroup className={'viewGroup'} hasViews={!!(viewList && viewList.length)}>
              {_.map(viewList, view => {
                return (
                  <div className={'viewSetting'} key={view.viewId}>
                    <div className={'boxSizing TxtLeft overflow_ellipsis w35'}>
                      <div className="mLeft52 overflow_ellipsis WordBreak">
                        <Icon
                          className="Gray_bd mRight8 Font14"
                          icon={_.find(VIEW_TYPE_ICON, { id: VIEW_DISPLAY_TYPE[view.type] }).icon}
                        />
                        {view.viewName}
                      </div>
                    </div>
                    <Wrap className="con flexRow">
                      <div className={'viewSettingItem'} style={{ height: 45 }}>
                        <Checkbox
                          checked={view.canRead}
                          className="InlineBlock"
                          onClick={checked => {
                            const payload = checked
                              ? {
                                  canEdit: false,
                                  canRead: false,
                                  canRemove: false,
                                }
                              : {
                                  canRead: true,
                                };
                            this.toggleViewLevel(view.viewId, payload, (!checked ? readSize + 1 : readSize - 1) <= 0);
                          }}
                        />
                      </div>
                      <div className={'viewSettingItem'} style={{ height: 45 }}>
                        <Checkbox
                          checked={view.canEdit}
                          className="InlineBlock"
                          onClick={checked => {
                            const payload = checked
                              ? {
                                  canEdit: false,
                                  canRead: true,
                                }
                              : {
                                  canEdit: true,
                                  canRead: true,
                                };
                            this.toggleViewLevel(view.viewId, payload);
                          }}
                        />
                      </div>
                      <div className={'viewSettingItem'} style={{ height: 45 }}>
                        <Checkbox
                          checked={view.canRemove}
                          className="InlineBlock"
                          onClick={checked => {
                            const payload = checked
                              ? {
                                  canRemove: false,
                                  canRead: true,
                                }
                              : {
                                  canRemove: true,
                                  canRead: true,
                                };
                            this.toggleViewLevel(view.viewId, payload);
                          }}
                        />
                      </div>
                      <div className={'viewSettingItem'} style={{ height: 45 }}></div>
                    </Wrap>
                  </div>
                );
              })}
            </ViewGroup>
          )}
        </div>
        <div className={classNames('settingGroup', { showSet: showToolTipSetting })}>
          {showToolTipSetting ? (
            <span className="ThemeColor3 ThemeHoverColor2 Hand" onClick={this.setShowRole}>
              {_l('设置')}
            </span>
          ) : (
            <span className="Gray_9">-</span>
          )}
        </div>
        {showRoleSet && (
          <RoleSetTool
            showRoleSet={showRoleSet}
            onClose={() => {
              this.setState({
                showRoleSet: false,
              });
            }}
            projectId={projectId}
            appId={appId}
            key={sheet.sheetId}
            formatViews={this.formatViews}
            canAdd={sheet.canAdd}
            fields={sheet.fields}
            sheet={sheet}
            onChange={this.changeSheetLevel}
            changeSheetOptionInfo={this.changeSheetOptionInfo}
            isForPortal={this.props.isForPortal}
          />
        )}
      </div>
    );
  }
}

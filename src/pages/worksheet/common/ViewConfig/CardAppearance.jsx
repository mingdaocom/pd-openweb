import React, { Component, Fragment } from 'react';
import { Dropdown, Icon, Checkbox, Tooltip, RadioGroup } from 'ming-ui';
import { Text, FlexCenter } from 'worksheet/styled';
import styled from 'styled-components';
import { getAdvanceSetting } from 'src/util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { filterAndFormatterControls } from 'src/pages/worksheet/views/util';
import { hierarchyViewCanSelectFields } from 'src/pages/worksheet/views/HierarchyView/util';
import { ViewSettingWrap } from './util';
import { Abstract, CoverSetting, DisplayControl, NavSort } from './components';
import NavShow from 'src/pages/worksheet/common/ViewConfig/components/navGroup/NavShow';
import {
  NAVSHOW_TYPE,
  HIERARCHY_VIEW_TYPE,
  CONNECT_LINE_TYPE,
  HIERARCHY_MIX_LEVEL,
} from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
import _ from 'lodash';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
const DisplayControlOption = styled(FlexCenter)`
  .icon {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.4);
    margin-right: 4px;
  }
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 4px;
  }
`;

const WrapBoard = styled.div`
  .inputCon {
    padding-left: 34px;
  }
  input {
    margin-left: 13px;
    height: 36px;
    background: #ffffff;
    border-radius: 3px 3px 3px 3px;
    line-height: 36px;
    border: 1px solid #dddddd;
    padding: 0 13px;
  }
`;

const SwitchStyle = styled.div`
  display: inline-block;
  .switchText {
    margin-right: 6px;
    line-height: 24px;
  }
  .icon {
    vertical-align: middle;
    &-ic_toggle_on {
      color: #00c345;
    }
    &-ic_toggle_off {
      color: #bdbdbd;
    }
  }
`;

const SelectValue = styled(DisplayControlOption)`
  &：hover {
    .icon {
      color: #2196f3;
    }
  }
`;

const Wrap = styled.div`
  .Dropdown {
    .Dropdown--input {
      padding: 0 5px 0 12px !important;
    }
  }
`;

const HierarchyViewConfigWrap = styled.div`
  text-align: center;
  justify-content: space-between;
  .hierachyViewCard {
    width: 120px;
    height: 70px;
    border-radius: 6px;
    color: #9e9e9e;
    line-height: 70px;
    background: #f8f8f8;
    &:hover {
      box-shadow: rgba(0, 0, 0, 0.1) 0 3px 6px;
    }
    & + .activeIcon {
      display: none;
    }
    &.active {
      background: #f2f9ff;
      color: #2196f3;
      & + .activeIcon {
        display: flex;
        background-color: #2196f3;
        border: 2px solid #fff;
        border-radius: 50%;
        color: #fff;
        height: 18px;
        position: absolute;
        right: -8px;
        top: -6px;
        width: 18px;
      }
    }
  }
`;

const HierarchyViewConnectLineConfigWrap = styled(RadioGroup)`
  .ming.Radio:first-child {
    margin-right: 60px;
  }
`;

const DetailRecordTypeRadioGroup = styled(RadioGroup)`
  .ming.Radio:first-child {
    margin-right: 128px;
  }
  .ming.Radio:last-child {
    margin-right: 0;
  }
`;

export default class CardAppearance extends Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);
    const { advancedSetting = {}, childType } = props.view;
    this.state = {
      relateControls: [],
      emptyname: '',
      showChangeName: false,
      hierarchyViewType: advancedSetting.hierarchyViewType || '0',
      hierarchyViewConnectLine: advancedSetting.hierarchyViewConnectLine || '0',
      minHierarchyLevel: advancedSetting.minHierarchyLevel || '0',
      detailRecordType: childType || 2,
    };
  }

  componentDidMount() {
    const { view } = this.props;
    const { emptyname = '' } = getAdvanceSetting(view);
    this.setState({
      emptyname,
      detailRecordType: view.childType || 2,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { view } = nextProps;
    const { emptyname = '' } = getAdvanceSetting(view);
    if (emptyname !== getAdvanceSetting(this.props.view || {}).emptyname) {
      this.setState({
        emptyname,
      });
    }
    this.setState({ detailRecordType: view.childType || 2 });
  }

  render() {
    const { showChangeName, hierarchyViewType, hierarchyViewConnectLine, minHierarchyLevel, detailRecordType } =
      this.state;
    const { worksheetControls, currentSheetInfo, updateCurrentView, view, appId, columns } = this.props;
    const allCanSelectFieldsInBoardControls = filterAndFormatterControls({
      controls: worksheetControls,
      formatter: ({ controlName, controlId, type }) => ({
        value: controlId,
        text: controlName,
        icon: getIconByType(type, false),
      }),
    });
    const { viewControl, childType, viewType, advancedSetting } = view;
    const viewControlData = worksheetControls.find(o => o.controlId === viewControl) || {};
    const {
      hidenone = '0',
      navshow = [26].includes(viewControlData.type) ? '1' : '0',
      navempty = '1', //默认显示
      freezenav = '0', //默认关闭
    } = getAdvanceSetting(view);
    const isBoardView = String(viewType) === '1';
    const isHierarchyView = String(viewType) === '2';
    const isGallery = String(viewType) === '3';
    const isDetailView = String(viewType) === '6';
    const isMultiHierarchyView = isHierarchyView && String(childType) === '2';
    let navfilters = getAdvanceSetting(view).navfilters;
    // const isShowDisplayConfig = () => {
    //   // 人员看板不显示此配置
    //   const { type } = find(worksheetControls, item => item.controlId === viewControl) || {};
    //   return type !== 26;
    // };

    const getViewSelectFields = () => {
      if (viewControl === 'create') {
        return [
          {
            text: _l('父-子'),
            value: 'create',
            icon: 'link-worksheet',
          },
        ];
      }
      return isHierarchyView
        ? hierarchyViewCanSelectFields({
            worksheetId: currentSheetInfo.worksheetId,
            controls: worksheetControls,
          })
        : allCanSelectFieldsInBoardControls;
    };
    return (
      <ViewSettingWrap>
        {!isMultiHierarchyView && !isGallery && !isDetailView && (
          <Fragment>
            <div className="title withSwitchConfig" style={{ marginTop: '0px' }}>
              {isHierarchyView ? _l('关联本表字段') : _l('分组字段')}
            </div>
            <div className="settingContent">
              <Dropdown
                data={getViewSelectFields()}
                value={viewControl}
                className="allCanSelectFields"
                hoverTheme
                renderTitle={obj => {
                  const { icon, text } = obj || {};
                  return (
                    <SelectValue>
                      <Icon icon={icon} />
                      <span>{text}</span>
                    </SelectValue>
                  );
                }}
                onChange={value => {
                  if (viewControl === value) {
                    return;
                  }
                  let advanced = {
                    navsorts: '',
                    customitems: '',
                  };
                  const viewControlData = worksheetControls.find(o => o.controlId === value) || {};
                  if (
                    (!['0'].includes(navshow) && ![26].includes(viewControlData.type)) ||
                    (!['1'].includes(navshow) && [26].includes(viewControlData.type))
                  ) {
                    //显示指定项和全部 不重置显示项设置
                    advanced = {
                      ...advanced,
                      navshow: [26].includes(viewControlData.type) ? '1' : '0',
                      navfilters: JSON.stringify([]),
                    };
                  }
                  updateCurrentView({
                    ...view,
                    appId,
                    viewControl: value,
                    advancedSetting: advanced,
                    editAdKeys: Object.keys(advanced),
                    editAttrs: ['viewControl', 'advancedSetting'],
                  });
                }}
                border
                style={{ width: '100%' }}
                placeholder={_l('请选择')}
              />
            </div>
            {isBoardView && (
              <Wrap>
                <NavShow
                  params={{
                    types: NAVSHOW_TYPE.filter(o =>
                      viewControlData.type === 29
                        ? true //关联记录 4项
                        : [9, 10, 11, 28].includes(viewControlData.type) // 排除筛选
                        ? o.value !== '3'
                        : [26].includes(viewControlData.type) //分组字段为人员时，显示设置只有 显示有数据的项，显示指定项
                        ? ['1', '2'].includes(o.value)
                        : true,
                    ),
                    txt: _l('显示项'),
                  }}
                  value={navshow}
                  onChange={newValue => {
                    let param = newValue;
                    if (newValue.navshow === '2') {
                      param = { ...param, navsorts: '', customitems: '' };
                    }
                    updateCurrentView({
                      ...view,
                      appId,
                      advancedSetting: param,
                      editAttrs: ['advancedSetting'],
                      editAdKeys: Object.keys(param),
                    });
                  }}
                  advancedSetting={advancedSetting}
                  navfilters={navfilters}
                  filterInfo={{
                    allControls: (worksheetControls.find(o => o.controlId === viewControl) || {}).relationControls,
                    globalSheetInfo: _.pick(currentSheetInfo, [
                      'appId',
                      'groupId',
                      'name',
                      'projectId',
                      'roleType',
                      'worksheetId',
                      'switches',
                    ]),
                    columns,
                    viewControl,
                  }}
                />
                {/*  支持排序的字段：关联记录、人员、选项、等级*/}
                {[29, 26, 9, 10, 11, 28].includes(
                  (worksheetControls.find(o => o.controlId === viewControl) || {}).type,
                ) &&
                  !['2'].includes(navshow) && (
                    <NavSort
                      view={view}
                      appId={_.get(currentSheetInfo, 'appId')}
                      projectId={_.get(currentSheetInfo, 'projectId')}
                      controls={worksheetControls}
                      advancedSetting={advancedSetting}
                      onChange={newValue => {
                        updateCurrentView({
                          ...view,
                          appId,
                          advancedSetting: newValue,
                          editAttrs: ['advancedSetting'],
                          editAdKeys: Object.keys(newValue),
                        });
                      }}
                    />
                  )}
              </Wrap>
            )}
            {isBoardView && (
              <WrapBoard>
                <div className="flexRow alignItemsCenter">
                  <div className="flex">
                    <SwitchStyle>
                      <Icon
                        icon={navempty === '1' ? 'ic_toggle_on' : 'ic_toggle_off'}
                        className="Font28 Hand"
                        onClick={() => {
                          updateCurrentView({
                            ...view,
                            appId,
                            advancedSetting: {
                              navempty: navempty === '0' ? '1' : '0',
                            },
                            editAttrs: ['advancedSetting'],
                            editAdKeys: ['navempty'],
                          });
                        }}
                      />
                      <div className="switchText InlineBlock Normal mLeft12 mTop8">
                        {_l('启用“未指定”看板')}
                        <Tooltip
                          text={
                            <span>
                              {_l(
                                '开启后，第1个看板显示“未指定”。将所有未设置分组的记录显示在“未指定”看板中。当没有未分组数据时，自动隐藏此看板',
                              )}
                            </span>
                          }
                          popupPlacement="top"
                        >
                          <i className="icon-help Font16 Gray_9e mLeft3 TxtMiddle" />
                        </Tooltip>
                      </div>
                    </SwitchStyle>
                  </div>
                  {navempty === '1' && (
                    <Tooltip text={<span>{_l('重命名')}</span>} popupPlacement="top">
                      <i
                        className="icon-rename_input Font18 Gray_9e mLeft3 TxtMiddle Hand pRight5"
                        onClick={() => {
                          this.setState({ showChangeName: true });
                        }}
                      />
                    </Tooltip>
                  )}
                </div>
                <div className="mTop4" />
                <SwitchStyle>
                  <Icon
                    icon={freezenav === '1' ? 'ic_toggle_on' : 'ic_toggle_off'}
                    className="Font28 Hand"
                    onClick={() => {
                      updateCurrentView({
                        ...view,
                        appId,
                        advancedSetting: { freezenav: freezenav === '0' ? '1' : '0' },
                        editAttrs: ['advancedSetting'],
                        editAdKeys: ['freezenav'],
                      });
                    }}
                  />
                  <div className="switchText InlineBlock Normal mLeft12">
                    {_l('固定第1个看板')}
                    <Tooltip
                      text={<span>{_l('当看板滚动时，始终固定第1个看板在左侧，方便向其他看板中拖拽记录。')} </span>}
                      popupPlacement="top"
                    >
                      <i className="icon-help Font16 Gray_9e mLeft3 TxtMiddle" />
                    </Tooltip>
                  </div>
                </SwitchStyle>
              </WrapBoard>
            )}
            <div
              className="line mTop32 mBottom32"
              style={{
                borderBottom: '1px solid #EAEAEA',
              }}
            />
          </Fragment>
        )}
        {isHierarchyView && (
          <Fragment>
            <div className="title withSwitchConfig" style={{ marginTop: '0px' }}>
              {_l('显示样式')}
            </div>
            <div className="settingContent">
              <HierarchyViewConfigWrap className="valignWrapper flex">
                {HIERARCHY_VIEW_TYPE.map(item => {
                  return (
                    <div className="Relative">
                      <div
                        className={`hierachyViewCard mBottom8 Font48 ${item.icon} ${
                          (hierarchyViewType || '0') === item.value ? 'active' : ''
                        }`}
                        onClick={() => {
                          if (hierarchyViewType === item.value) {
                            return;
                          }
                          const hadnleCoverPosition = {};
                          if (hierarchyViewType === '0' && [0, 1].includes(view.coverType)) {
                            hadnleCoverPosition.coverposition = '2';
                          }
                          hadnleCoverPosition.hierarchyViewType = item.value;
                          this.setState(
                            {
                              hierarchyViewType: item.value,
                            },
                            () => {
                              updateCurrentView({
                                ...view,
                                appId,
                                advancedSetting: {
                                  ...hadnleCoverPosition,
                                },
                                editAttrs: ['advancedSetting'],
                                editAdKeys: Object.keys(hadnleCoverPosition),
                              });
                            },
                          );
                        }}
                      ></div>
                      <div className="activeIcon">
                        <span className="icon-done"></span>
                      </div>
                      <div>{item.text}</div>
                    </div>
                  );
                })}
              </HierarchyViewConfigWrap>
            </div>
            {hierarchyViewType === '0' && (
              <div className="title mTop32 mBottom18 valignWrapper">
                <span className="Font13 bold mRight60">{_l('连接线样式')}</span>
                <HierarchyViewConnectLineConfigWrap
                  size="middle"
                  checkedValue={hierarchyViewConnectLine}
                  data={CONNECT_LINE_TYPE}
                  onChange={value => {
                    if (hierarchyViewConnectLine === value) {
                      return;
                    }
                    this.setState(
                      {
                        hierarchyViewConnectLine: value,
                      },
                      () => {
                        updateCurrentView({
                          ...view,
                          appId,
                          advancedSetting: {
                            ...getAdvanceSetting(view),
                            hierarchyViewConnectLine: value,
                          },
                          editAttrs: ['advancedSetting'],
                          editAdKeys: ['hierarchyViewConnectLine'],
                        });
                      },
                    );
                  }}
                />
              </div>
            )}
            {hierarchyViewType === '2' && (
              <Fragment>
                <div className="title title Font13 bold mTop32 mBottom18">{_l('竖向层级数')}</div>
                <Dropdown
                  className=""
                  data={HIERARCHY_MIX_LEVEL}
                  value={minHierarchyLevel}
                  style={{ width: '100%' }}
                  border
                  onChange={value => {
                    if (minHierarchyLevel === value) {
                      return;
                    }
                    this.setState(
                      {
                        minHierarchyLevel: value,
                      },
                      () => {
                        updateCurrentView({
                          ...view,
                          appId,
                          advancedSetting: {
                            ...getAdvanceSetting(view),
                            minHierarchyLevel: value,
                          },
                          editAttrs: ['advancedSetting'],
                        });
                      },
                    );
                  }}
                  placeholder={_l('2级')}
                />
              </Fragment>
            )}
            <div
              className="line mTop32 mBottom32"
              style={{
                borderBottom: '1px solid #EAEAEA',
              }}
            />
          </Fragment>
        )}

        {isDetailView && (
          <Fragment>
            <div className="bold mBottom20">{_l('记录数量')}</div>
            <div className="flexRow alignItemsCenter">
              <DetailRecordTypeRadioGroup
                size="middle"
                checkedValue={detailRecordType}
                data={[
                  { text: _l('多条'), value: 2 },
                  { text: _l('一条'), value: 1 },
                ]}
                onChange={value => {
                  if (detailRecordType === value) {
                    return;
                  }
                  this.setState(
                    {
                      detailRecordType: value,
                    },
                    () => {
                      updateCurrentView({
                        ...view,
                        appId,
                        childType: value,
                        editAttrs: value === 1 ? ['childType', 'fastFilters'] : ['childType'],
                        ...(value === 1 ? { fastFilters: [] } : {}),
                      });
                    },
                  );
                }}
              />
              <span className="Gray_9e singleDesc">{_l('（第一条记录）')}</span>
            </div>
          </Fragment>
        )}

        {(!isDetailView || childType === 2) && (
          <Fragment>
            <div className="title mBottom24 mTop24 bold">{_l('卡片外观')}</div>
            {/* abstract：摘要控件ID */}
            <Abstract
              {...this.props}
              advancedSetting={advancedSetting}
              handleChange={value => {
                updateCurrentView({
                  ...view,
                  appId,
                  advancedSetting: { abstract: value },
                  editAttrs: ['advancedSetting'],
                  editAdKeys: ['abstract'],
                });
              }}
            />
            {/* 显示字段 */}
            <DisplayControl
              {...this.props}
              handleChange={data => {
                updateCurrentView({ ...view, appId, ...data }, false);
              }}
              handleChangeSort={({ newControlSorts, newShowControls }) => {
                if (['board', 'gallery'].includes(VIEW_DISPLAY_TYPE[view.viewType])) {
                  let showcount = _.get(view, 'advancedSetting.showcount');
                  showcount = !!showcount
                    ? newShowControls.length <= 0
                      ? undefined
                      : Number(showcount) > newShowControls.length
                      ? newShowControls.length
                      : showcount
                    : undefined;
                  updateCurrentView(
                    {
                      ...view,
                      appId,
                      controlsSorts: newControlSorts,
                      displayControls: newShowControls,
                      advancedSetting: {
                        showcount,
                      },
                      editAttrs: ['advancedSetting', 'controlsSorts', 'displayControls'],
                      editAdKeys: ['showcount'],
                    },
                    false,
                  );
                } else {
                  updateCurrentView(
                    {
                      ...view,
                      appId,
                      controlsSorts: newControlSorts,
                      displayControls: newShowControls,
                      editAttrs: ['controlsSorts', 'displayControls'],
                    },
                    false,
                  );
                }
              }}
              canShowCount={['board', 'gallery'].includes(VIEW_DISPLAY_TYPE[view.viewType])}
            />
            {/* 封面图片 */}
            <CoverSetting
              {...this.props}
              advancedSetting={advancedSetting}
              // 是否显示
              handleChangeIsCover={value =>
                updateCurrentView({
                  ...view,
                  appId,
                  coverCid: value === 'notDisplay' ? '' : value,
                  editAttrs: ['coverCid'],
                })
              }
              // 显示位置
              handleChangePosition={(value, coverTypeValue) => {
                updateCurrentView({
                  ...view,
                  appId,
                  coverType: coverTypeValue,
                  advancedSetting: { coverposition: value },
                  editAttrs: ['coverType', 'advancedSetting'],
                  editAdKeys: ['coverposition'],
                });
              }}
              handleChangeCoverWidth={value => {
                updateCurrentView({
                  ...view,
                  appId,
                  advancedSetting: { cardwidth: value },
                  editAdKeys: ['cardwidth'],
                  editAttrs: ['advancedSetting'],
                });
              }}
              // 显示方式
              handleChangeType={value =>
                updateCurrentView({ ...view, appId, coverType: value, editAttrs: ['coverType'] }, false)
              }
              // 允许点击查看
              handleChangeOpencover={value => {
                updateCurrentView({
                  ...view,
                  appId,
                  advancedSetting: { opencover: value },
                  editAdKeys: ['opencover'],
                  editAttrs: ['advancedSetting'],
                });
              }}
            />
            {showChangeName && (
              <ChangeName
                onChange={value => {
                  updateCurrentView({
                    ...view,
                    appId,
                    advancedSetting: { emptyname: value.trim() },
                    editAttrs: ['advancedSetting'],
                    editAdKeys: ['emptyname'],
                  });
                  this.setState({ showChangeName: false });
                }}
                name={advancedSetting.emptyname}
                onCancel={() => {
                  this.setState({ showChangeName: false });
                }}
              />
            )}
          </Fragment>
        )}
      </ViewSettingWrap>
    );
  }
}

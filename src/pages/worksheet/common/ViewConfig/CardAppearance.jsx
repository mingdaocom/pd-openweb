import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, Icon, Tooltip } from 'ming-ui';
import { FlexCenter } from 'worksheet/styled';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { hierarchyViewCanSelectFields } from 'src/pages/worksheet/views/HierarchyView/util';
import { filterAndFormatterControls } from 'src/pages/worksheet/views/util';
import { getAdvanceSetting } from 'src/utils/control';
import { NavSet } from './components';
import StructureSet from './components/StructureSet';
import { ViewSettingWrap } from './style';

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

export default class CardAppearance extends Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);
    const { advancedSetting = {} } = props.view;
    this.state = {
      relateControls: [],
      emptyname: '',
      showChangeName: false,
    };
  }

  componentDidMount() {
    const { view } = this.props;
    const { emptyname = '' } = getAdvanceSetting(view);
    this.setState({
      emptyname,
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
  }

  render() {
    const { showChangeName } = this.state;
    const { worksheetControls, currentSheetInfo, updateCurrentView, view, appId, columns } = this.props;
    const allCanSelectFieldsInBoardControls = filterAndFormatterControls({
      controls: columns,
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
      navshow = [26, 27, 48].includes(viewControlData.type) ||
      (viewControlData.type === 30 && [26, 27, 48].includes(viewControlData.sourceControlType))
        ? '1'
        : '0',
      navempty = '1', //默认显示
      freezenav = '0', //默认关闭
    } = getAdvanceSetting(view);
    const isBoardView = String(viewType) === '1';
    const isHierarchyView = String(viewType) === '2';
    const isMultiHierarchyView = isHierarchyView && String(childType) === '2';
    // let navfilters = getAdvanceSetting(view).navfilters;
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
        {!isMultiHierarchyView && (
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
                  const type = viewControlData.type === 30 ? viewControlData.sourceControlType : viewControlData.type;
                  if (
                    (!['0'].includes(navshow) && ![26, 27, 48].includes(type)) ||
                    (!['1'].includes(navshow) && [26, 27, 48].includes(type))
                  ) {
                    //显示指定项和全部 不重置显示项设置
                    advanced = {
                      ...advanced,
                      navshow: [26, 27, 48].includes(type) ? '1' : '0',
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
              <NavSet
                {...this.props}
                navGroupId={viewControl}
                viewControlData={worksheetControls.find(o => o.controlId === _.get(view, 'viewControl')) || {}}
              />
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
            <div className="line mTop32 mBottom32" />
          </Fragment>
        )}
        {isHierarchyView && (
          <StructureSet
            updateCurrentView={updateCurrentView}
            view={view}
            appId={appId}
            {..._.pick(this.props, ['worksheetId', 'projectId', 'columns'])}
          />
        )}
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
      </ViewSettingWrap>
    );
  }
}

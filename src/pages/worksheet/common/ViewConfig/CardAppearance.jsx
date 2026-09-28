import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Select, Switch, Tooltip } from 'ming-ui/antd-components';
import { FlexCenter } from 'worksheet/styled';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
import { hierarchyViewCanSelectFields } from 'src/pages/worksheet/views/HierarchyView/util';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { filterAndFormatterControls } from 'src/utils/services/worksheet/view';
import { NavSet } from './components';
import StructureSet from './components/StructureSet';
import { ViewSettingWrap } from './style';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const DisplayControlOption = styled(FlexCenter)`
  .icon {
    font-size: 16px;
    color: var(--color-text-secondary);
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
    background: var(--color-background-primary);
    border-radius: 3px 3px 3px 3px;
    line-height: 36px;
    border: 1px solid var(--color-border-primary);
    padding: 0 13px;
  }
`;

const SelectValue = styled(DisplayControlOption)`
  &:hover {
    .icon {
      color: var(--color-primary);
    }
  }
`;

export default class CardAppearance extends Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);

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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { view } = this.props;
      const { emptyname = '' } = getAdvanceSetting(view);

      if (emptyname !== getAdvanceSetting(prevProps.view || {}).emptyname) {
        this.setState({
          emptyname,
        });
      }
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
      navshow = [26, 27, 48].includes(viewControlData.type) ||
      (viewControlData.type === 30 && [26, 27, 48].includes(viewControlData.sourceControlType))
        ? '1'
        : '0',
      navempty = '1', //默认显示
      freezenav = '0', //默认关闭
      groupsetting,
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

    const viewSelectFields = getViewSelectFields();

    return (
      <ViewSettingWrap>
        {!isMultiHierarchyView && (
          <Fragment>
            <div className="title withSwitchConfig" style={{ marginTop: '0px' }}>
              {isHierarchyView ? _l('关联本表字段') : _l('分组字段')}
            </div>
            <div className="settingContent">
              <Select
                options={viewSelectFields}
                fieldNames={SELECT_FIELD_NAMES}
                value={viewControl}
                className="allCanSelectFields"
                optionRender={option => {
                  const { icon, text } = option.data || {};
                  return (
                    <DisplayControlOption>
                      <Icon icon={icon} />
                      <span>{text}</span>
                    </DisplayControlOption>
                  );
                }}
                labelRender={({ value }) => {
                  const obj = viewSelectFields.find(item => item.value === value);
                  const { icon, text } = obj || {};
                  const groupControl = worksheetControls.find(o => o.controlId === viewControl);
                  const isErr = viewControl && !groupControl;
                  return (
                    <SelectValue className={cx({ Red: isErr })}>
                      <Icon icon={!isErr ? icon : 'error1'} className={cx({ Red: isErr })} />
                      <span>{!isErr ? text : _l('字段已删除')}</span>
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
              <WrapBoard className="mTop8">
                <div className="flexRow alignItemsCenter">
                  <div className="flex">
                    <div className="flexRow alignItemsCenter viewConfigSwitchRow">
                      <Switch
                        size="mini"
                        checked={navempty === '1'}
                        onChange={() => {
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
                      <div className="InlineBlock Normal mLeft12">
                        {_l('启用“未指定”看板')}
                        <Tooltip
                          title={
                            <span>
                              {_l(
                                '开启后，第1个看板显示“未指定”。将所有未设置分组的记录显示在“未指定”看板中。当没有未分组数据时，自动隐藏此看板',
                              )}
                            </span>
                          }
                          placement="top"
                        >
                          <i className="icon-help Font16 textTertiary mLeft3 TxtMiddle" />
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  {navempty === '1' && (
                    <Tooltip title={_l('重命名')}>
                      <i
                        className="icon-rename_input Font18 textTertiary mLeft3 TxtMiddle Hand pRight5"
                        onClick={() => {
                          this.setState({ showChangeName: true });
                        }}
                      />
                    </Tooltip>
                  )}
                </div>
                <div className="mTop4" />
                <div className="flexRow alignItemsCenter viewConfigSwitchRow">
                  <Switch
                    size="mini"
                    checked={freezenav === '1'}
                    className={_.get(safeParse(groupsetting, 'array'), '[0].controlId') ? 'cursorNotAllowed' : 'Hand'}
                    onChange={() => {
                      if (_.get(safeParse(groupsetting, 'array'), '[0].controlId')) return;
                      updateCurrentView({
                        ...view,
                        appId,
                        advancedSetting: { freezenav: freezenav === '0' ? '1' : '0' },
                        editAttrs: ['advancedSetting'],
                        editAdKeys: ['freezenav'],
                      });
                    }}
                  />
                  <div className="InlineBlock Normal mLeft12">
                    {_l('固定第1个看板')}
                    <Tooltip title={_l('当看板滚动时，始终固定第1个看板在左侧，方便向其他看板中拖拽记录。')}>
                      <i className="icon-help Font16 textTertiary mLeft3 TxtMiddle" />
                    </Tooltip>
                  </div>
                </div>
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

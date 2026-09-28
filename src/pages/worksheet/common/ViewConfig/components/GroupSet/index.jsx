import React, { useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Button, Select, Switch, Tooltip } from 'ming-ui/antd-components';
import ChangeName from 'src/pages/integration/components/ChangeName';
import ButtonTabs from 'src/pages/worksheet/common/ViewConfig/components/ButtonTabs';
import { getSetDefault } from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
import NavSet from 'src/pages/worksheet/common/ViewConfig/components/NavSet';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import { filterOnlyShowField } from 'src/utils/domain/control/filters';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { canSetGroup } from 'src/utils/domain/worksheet/board';
import { getGroupControlId } from 'src/utils/domain/worksheet/helpers';
import { setSysWorkflowTimeControlFormat } from 'src/utils/services/worksheet/calendar';
import { filterAndFormatterControls } from 'src/utils/services/worksheet/view';
import { GROUP_OPEN_OPTIONS } from './config';
import bg from './img/bg.png';
import { SelectValue, Wrap } from './style';

const NAV_GROUP_MAPPING = {
  navfilters: 'groupfilters',
  navshow: 'groupshow',
  navsorts: 'groupsorts',
  customitems: 'groupcustom',
};

const mapAdvancedSettings = (source, direction = 'toNav') => {
  const result = {};
  Object.entries(NAV_GROUP_MAPPING).forEach(([navKey, groupKey]) => {
    if (direction === 'toNav') {
      result[navKey] = _.get(source, groupKey);
    } else {
      result[groupKey] = _.get(source, navKey);
    }
  });
  return result;
};

export default function (props) {
  const [{ showChangeName }, setState] = useSetState({
    showChangeName: false,
  });
  const {
    worksheetControls = [],
    view = {},
    updateCurrentView,
    columns,
    currentSheetInfo = {},
    worksheetId = '',
    forBoard,
    hideSort,
  } = props;
  let [showAddCondition, setShowAddCondition] = useState(false);

  const updateAdvancedSetting = data => {
    updateCurrentView(
      Object.assign(view, {
        advancedSetting: data,
        editAdKeys: Object.keys(data),
        editAttrs: ['advancedSetting'],
      }),
    );
  };

  const getInfo = data => {
    const groupshow = _.get(view, 'advancedSetting.groupshow');
    data = { ...data, type: data.type === 30 ? data.sourceControlType : data.type };
    const d = getSetDefault(data);
    const info = {
      groupsetting: JSON.stringify([{ ..._.pick(d, ['controlId', 'isAsc', 'viewId', 'filterType']) }]),
      groupsorts: '',
      groupcustom: '',
      groupshow:
        [26, 27, 48].includes(data.type) || (data.type === 29 && forBoard)
          ? '1'
          : !['0', '1'].includes(groupshow + '')
            ? '0'
            : groupshow,
      groupfilters: JSON.stringify([]),
      groupopen: '',
    };

    if (view.viewType === 1) {
      //看板视图设置了分组，则第一个看板不固定
      info.freezenav = '';
    }

    return info;
  };

  const addGroupSetting = data => {
    updateAdvancedSetting(getInfo(data));
    setShowAddCondition(false);
  };

  const renderAdd = ({ width, comp }) => {
    return (
      <AddCondition
        renderInParent
        className="addControl"
        columns={setSysWorkflowTimeControlFormat(
          filterOnlyShowField(worksheetControls).filter(o => canSetGroup(o, worksheetId, view)),
          currentSheetInfo.switches || [],
        )}
        onAdd={addGroupSetting}
        style={{
          width: width || '440px',
        }}
        offset={[0, 0]}
        classNamePopup="addControlDrop"
        comp={comp}
        from="fastFilter" //样式
        defaultVisible={showAddCondition}
      />
    );
  };

  const getViewSelectFields = () => {
    return filterAndFormatterControls({
      controls: columns,
      filter: o => canSetGroup(o, worksheetId, view),
      formatter: ({ controlName, controlId, type }) => ({
        label: controlName,
        value: controlId,
        icon: getIconByType(type, false),
      }),
    });
  };

  const tipTxt = forBoard
    ? _l('将所选字段的字段值作为分组显示记录。看板添加分组后最多加载1000条记录')
    : _l('将所选字段的字段值作为分组显示记录（显示前50个）');

  const groupControlId = getGroupControlId(view);
  const groupControl = _.find(worksheetControls, { controlId: groupControlId });
  const viewSelectFields = getViewSelectFields();
  const isValidField = !!groupControl && viewSelectFields.find(o => o.value === groupControlId);

  return (
    <Wrap>
      {_.get(safeParse(_.get(view, 'advancedSetting.groupsetting'), 'array'), '[0].controlId') ? (
        <div className="hasData">
          <div className="viewSetTitle">{_l('分组')}</div>
          <div className="textSecondary mTop8 mBottom4">{tipTxt}</div>
          <React.Fragment>
            <div className="con">
              <div className="title mTop25 textPrimary Bold">{_l('分组字段')}</div>
              <div className="settingContent mTop8">
                <Select
                  allowClear
                  options={viewSelectFields}
                  value={_.get(safeParse(_.get(view, 'advancedSetting.groupsetting'), 'array'), '[0].controlId')}
                  className="allCanSelectFields"
                  optionRender={option => {
                    const { icon, label } = option.data || {};
                    return (
                      <SelectValue>
                        <Icon icon={icon} />
                        <span>{label}</span>
                      </SelectValue>
                    );
                  }}
                  labelRender={({ value }) => {
                    const obj = viewSelectFields.find(item => item.value === value);
                    const { icon, label } = obj || {};
                    return (
                      <SelectValue className={cx({ Red: !isValidField })}>
                        <Icon icon={isValidField ? icon : 'error1'} className={cx({ Red: !isValidField })} />
                        <span>{isValidField ? label : !groupControl ? _l('字段已删除') : _l('该字段不支持')}</span>
                      </SelectValue>
                    );
                  }}
                  onChange={value => {
                    if (
                      _.get(safeParse(_.get(view, 'advancedSetting.groupsetting'), 'array'), '[0].controlId') === value
                    ) {
                      return;
                    }

                    if (!value) {
                      updateAdvancedSetting({
                        groupsetting: '',
                        groupsorts: '',
                        groupcustom: '',
                        groupshow: '',
                        groupfilters: '',
                      });
                      return;
                    }

                    let advanced = getInfo(worksheetControls.find(o => o.controlId === value) || {});
                    updateAdvancedSetting(advanced);
                  }}
                  style={{ width: '100%' }}
                  placeholder={_l('请选择')}
                />
              </div>
              {isValidField && (
                <NavSet
                  {..._.pick(props, ['appId', 'currentSheetInfo', 'columns', 'worksheetControls', 'worksheetId'])}
                  forBoard={forBoard}
                  updateCurrentView={view => {
                    let advancedSetting = {};
                    view.editAdKeys.map(o => {
                      advancedSetting[NAV_GROUP_MAPPING[o]] = _.get(view, `advancedSetting.${o}`);
                    });
                    updateAdvancedSetting(advancedSetting);
                  }}
                  view={{
                    ...view,
                    advancedSetting: {
                      ...view.advancedSetting,
                      ...mapAdvancedSettings(view.advancedSetting),
                    },
                  }}
                  navGroupId={_.get(safeParse(_.get(view, 'advancedSetting.groupsetting'), 'array'), '[0].controlId')}
                  viewControlData={
                    worksheetControls.find(
                      o =>
                        o.controlId ===
                        _.get(safeParse(_.get(view, 'advancedSetting.groupsetting'), 'array'), '[0].controlId'),
                    ) || {}
                  }
                  hideSort={hideSort}
                />
              )}
            </div>
            {isValidField && (
              <div className="flexRow alignItemsCenter mTop8">
                <div className="flex flexRow alignItemsCenter viewConfigSwitchRow">
                  <Switch
                    size="mini"
                    checked={_.get(view, 'advancedSetting.groupempty') === '1'}
                    onChange={() => {
                      updateAdvancedSetting({
                        groupempty: _.get(view, 'advancedSetting.groupempty') === '1' ? '' : '1',
                      });
                    }}
                  />
                  <div className="InlineBlock Normal mLeft12">{_l('显示“未分组”')}</div>
                </div>
                <Tooltip title={_l('重命名')}>
                  <i
                    className="icon-rename_input Font18 mLeft3 TxtMiddle Hand"
                    onClick={() => setState({ showChangeName: true })}
                  />
                </Tooltip>
              </div>
            )}
            <div className="">
              <div className="title mTop30 textPrimary Bold">{_l('分组默认状态')}</div>
              <div className="flexRow cardWidthWrap">
                <ButtonTabs
                  className="mTop8 w100"
                  data={GROUP_OPEN_OPTIONS}
                  value={_.get(view, 'advancedSetting.groupopen') || '2'}
                  onChange={value => {
                    if ((_.get(view, 'advancedSetting.groupopen') || '2') !== value) {
                      updateAdvancedSetting({ groupopen: value });
                    }
                  }}
                />
              </div>
            </div>
          </React.Fragment>
        </div>
      ) : (
        <div className="noData">
          <div className="cover">
            <img src={bg} alt="" srcset="" />
          </div>
          <h6 className="">{_l('分组')}</h6>
          <p className="text textSecondary">{tipTxt}</p>
          {renderAdd({
            comp: () => {
              return (
                <Button wide color="primary" variant="solid" size="large" icon={<Icon icon="add" className="Font16" />}>
                  {_l('添加分组字段')}
                </Button>
              );
            },
          })}
        </div>
      )}
      {showChangeName && (
        <ChangeName
          onChange={value => {
            updateAdvancedSetting({
              groupemptyname: value.trim(),
            });
            setState({ showChangeName: false });
          }}
          name={_.get(view, 'advancedSetting.groupemptyname')}
          onCancel={() => setState({ showChangeName: false })}
        />
      )}
    </Wrap>
  );
}

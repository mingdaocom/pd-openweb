import React, { useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import ChangeName from 'src/pages/integration/components/ChangeName';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import ButtonTabs from 'src/pages/worksheet/common/ViewConfig/components/ButtonTabs';
import { getSetDefault } from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
import NavSet from 'src/pages/worksheet/common/ViewConfig/components/NavSet';
import { SwitchStyle } from 'src/pages/worksheet/common/ViewConfig/style';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util';
import { filterAndFormatterControls } from 'src/pages/worksheet/views/util';
import { getGroupControlId } from 'src/utils/worksheet';
import { GROUP_OPEN_OPTIONS } from './config';
import bg from './img/bg.png';
import { SelectValue, Wrap } from './style';
import { canSetGroup } from './util';

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
        text: controlName,
        value: controlId,
        icon: getIconByType(type, false),
      }),
    });
  };

  const tipTxt = forBoard
    ? _l('将所选字段的字段值作为分组显示记录。看板添加分组后最多加载1000条记录')
    : _l('将所选字段的字段值作为分组显示记录');

  const groupControlId = getGroupControlId(view);
  const groupControl = _.find(worksheetControls, { controlId: groupControlId });
  const isValidField = !!groupControl && getViewSelectFields().find(o => o.value === groupControlId);

  return (
    <Wrap>
      {_.get(safeParse(_.get(view, 'advancedSetting.groupsetting'), 'array'), '[0].controlId') ? (
        <div className="hasData">
          <div className="viewSetTitle">{_l('分组')}</div>
          <div className="Gray_75 mTop8 mBottom4">{tipTxt}</div>
          <React.Fragment>
            <div className="con">
              <div className="title mTop25 Gray Bold">{_l('分组字段')}</div>
              <div className="settingContent">
                <Dropdown
                  cancelAble
                  data={getViewSelectFields()}
                  value={_.get(safeParse(_.get(view, 'advancedSetting.groupsetting'), 'array'), '[0].controlId')}
                  className="allCanSelectFields"
                  hoverTheme
                  renderTitle={obj => {
                    const { icon, text } = obj || {};
                    return (
                      <SelectValue className={cx({ Red: !isValidField })}>
                        <Icon icon={isValidField ? icon : 'error1'} className={cx({ Red: !isValidField })} />
                        <span>{isValidField ? text : !groupControl ? _l('字段已删除') : _l('该字段不支持')}</span>
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
                  border
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
              <div className="flexRow alignItemsCenter">
                <SwitchStyle className="flex">
                  <Icon
                    icon={_.get(view, 'advancedSetting.groupempty') === '1' ? 'ic_toggle_on' : 'ic_toggle_off'}
                    className="Font28 Hand"
                    onClick={() => {
                      updateAdvancedSetting({
                        groupempty: _.get(view, 'advancedSetting.groupempty') === '1' ? '' : '1',
                      });
                    }}
                  />
                  <div className="switchText InlineBlock Normal mLeft12 mTop8">{_l('显示“未分组”')}</div>
                </SwitchStyle>
                <Tooltip title={_l('重命名')}>
                  <i
                    className="icon-rename_input Font18 mLeft3 TxtMiddle Hand"
                    onClick={() => setState({ showChangeName: true })}
                  />
                </Tooltip>
              </div>
            )}
            <div className="">
              <div className="title mTop30 Gray Bold">{_l('分组默认状态')}</div>
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
          <p className="text Gray_75">{tipTxt}</p>
          {renderAdd({
            comp: () => {
              return (
                <span className="addIcon">
                  <i className="icon icon-add Font16 mRight5"></i>
                  {_l('添加分组字段')}
                </span>
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

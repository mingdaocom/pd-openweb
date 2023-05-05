import React, { createRef, useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, Dropdown, Checkbox, Tooltip } from 'ming-ui';
import { FilterItemTexts, FilterDialog } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import { handleCondition } from 'src/pages/widgetConfig/util/data';
import Input from 'src/pages/worksheet/common/Sheet/QuickFilter/Inputs';
import sheetAjax from 'src/api/worksheet';
import ScoreInput from './ScoreInput';
import { formatFilterValues } from 'src/pages/worksheet/common/Sheet/QuickFilter/utils.js';
import _ from 'lodash';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
const Wrap = styled.div`
  .icon-rename_input {
    color: #9e9e9e;
    padding-right: 10px;
    &:hover {
      color: #2196f3;
    }
  }
  .Dropdown {
    width: 100%;
    display: flex;
    line-height: 36px;
    height: 36px;
    opacity: 1;
    background: #ffffff;
    border-radius: 4px;
    margin: 8px 0;
    box-sizing: border-box;
    .actionIcon {
      width: 13px;
    }
    & > div {
      flex: 1;
    }
    .Dropdown--input {
      padding: 0 12px 0 12px !important;
      width: 100%;
      display: flex;
      border: 1px solid #dddddd;
      border-radius: 4px;
      height: 36px;
      &.active {
        border: 1px solid #2196f3;
      }
      .value,
      .Dropdown--placeholder {
        flex: 1;
        max-width: 100% !important;
      }
      .Icon {
        line-height: 34px;
      }
      .List {
        width: 100%;
        top: 104% !important;
      }
    }
  }
  .navInputWrap {
    min-height: 36px !important;
  }
  .RelateRecordDropdown-selected,
  .ant-select {
    min-height: 36px !important;
    line-height: 34px !important;
    .normalSelectedItem {
      line-height: 34px !important;
    }
  }
  .RelateRecordDropdown-selected .clearIcon,
  .RelateRecordDropdown-selected .dropIcon {
    font-size: 14px;
    margin: 11px 12px 0;
  }
  .customAntDropdownTitle,
  .customAntDropdownTitleWithBG {
    height: 26px;
    line-height: 26px;
    .icon-close {
      line-height: 26px !important;
    }
  }
  .ant-select:hover {
    border-color: #dddddd !important;
  }
  .ant-select-arrow {
    color: #9e9e9e !important;
  }
  .RelateRecordDropdown-selected:not(.active) {
    border-color: #ddd !important;
  }
`;
const SwitchStyle = styled.div`
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
export default function NavShow(props) {
  const { params, onChange, value = '0', filterInfo = {}, advancedSetting = {}, canShowNull, canShowAll } = props;
  const [
    { filterVisible, filters, relateControls, data, showSysWorkflow, showChangeName, showName, loading },
    setState,
  ] = useSetState({
    filterVisible: false,
    filters: [],
    relateControls,
    data: {},
    showSysWorkflow: true,
    showChangeName: false,
    showName: '',
    loading: false,
  });
  useEffect(() => {
    let navfilters = [];
    try {
      navfilters = JSON.parse(props.navfilters);
    } catch (error) {
      navfilters = [];
    }
    setState({
      filters: navfilters,
    });
    const { columns = [], viewControl, relateControls } = filterInfo;
    if (relateControls) {
      setState({ relateControls });
    }
    setState({ data: columns.find(o => o.controlId === viewControl) || {} });
    if (!isOpenPermit(permitList.sysControlSwitch, _.get(filterInfo, 'globalSheetInfo.switches') || [])) {
      setState({
        showSysWorkflow: false,
      });
    }
  }, [props]);

  useEffect(() => {
    if (value === '3') {
      if (!data.dataSource) {
        return;
      }
      const { relateControls } = filterInfo;
      if (relateControls) {
        setState({ relateControls });
      } else {
        sheetAjax.getWorksheetInfo({ worksheetId: data.dataSource, getViews: true, getTemplate: true }).then(res => {
          setState({ relateControls: _.get(res, ['template', 'controls']) || [], loading: false });
        });
      }
    }
  }, [value, filterInfo, data]);

  const onFormatChange = newValue => {
    const { navfilters } = newValue;
    if (!!navfilters) {
      onChange(newValue);
    } else {
      //显示制定项，人员部门等字段处理
      onChange({
        ...newValue,
        navfilters:
          value === '3'
            ? JSON.stringify(filters.map(handleCondition))
            : JSON.stringify(
                filters.map(info => {
                  if ([19, 23, 24, 26, 27, 29, 35, 48].includes(data.type) && value === '2') {
                    return safeParse(info).id;
                  } else {
                    return info;
                  }
                }),
              ),
      });
    }
  };
  return (
    <Wrap>
      {params.txt && <div className="title mTop30 Gray Bold">{params.txt}</div>}
      <Dropdown
        data={
          filterInfo.viewControl === 'wfstatus' && !showSysWorkflow
            ? params.types.filter(o => o.value === '0')
            : params.types
        }
        value={filterInfo.viewControl === 'wfstatus' && !showSysWorkflow ? '0' : value || '0'}
        className="flex settingContent mBottom0"
        onChange={value => {
          onFormatChange({
            navshow: value,
            navfilters: JSON.stringify([]),
          });
          setState({
            filters: [],
          });
          setTimeout(() => {
            if (value === '3') {
              setState({
                filterVisible: true,
              });
            }
          }, 500);
        }}
      />
      {(value === '2' || (filters.length > 0 && value === '3' && !loading)) && <div className="mTop12"></div>}
      {value === '2' &&
        (data.type === 28 ? (
          <ScoreInput
            control={data}
            values={filters}
            onChange={values => {
              onFormatChange({
                navfilters: JSON.stringify(values),
              });
            }}
          />
        ) : (
          <Input
            className="navInputWrap"
            {...filterInfo.globalSheetInfo}
            controlId={data.controlId}
            active={false}
            from={'NavShow'}
            control={data}
            advancedSetting={{ direction: '2', allowitem: '2' }}
            values={formatFilterValues(data.type, filters)}
            onChange={info => {
              let values = [];
              switch (data.type) {
                case 29:
                  values = info.values.map(o => o.rowid);
                  break;
                case 26:
                  values = info.values.map(o => o.accountId);
                  break;
                default:
                  values = info.values;
                  break;
              }
              onFormatChange({
                navfilters: JSON.stringify(values),
              });
            }}
          />
        ))}
      {filterVisible && value === '3' && !loading && (
        <FilterDialog
          // allowEmpty
          data={data}
          overlayClosable={false}
          relationControls={relateControls || []}
          title={'筛选'}
          filters={filters}
          allControls={filterInfo.allControls}
          globalSheetInfo={filterInfo.globalSheetInfo}
          onChange={({ filters }) => {
            onFormatChange({ navfilters: JSON.stringify(filters.map(handleCondition)) });
            setState({ filterVisible: false });
          }}
          onClose={() => setState({ filterVisible: false })}
        />
      )}
      {filters.length > 0 && value === '3' && !loading && (
        <FilterItemTexts
          className={'mBottom0'}
          data={data}
          filters={filters}
          loading={false}
          globalSheetInfo={filterInfo.globalSheetInfo}
          controls={relateControls || []}
          allControls={filterInfo.allControls}
          editFn={() => setState({ filterVisible: true })}
        />
      )}
      {/* showallitem, //是否显示全部
      allitemname, //全部的重命名
      shownullitem, //是否显示为空
      nullitemname, //为空的重命名 */}
      {canShowAll && (
        <div className="flexRow alignItemsCenter">
          <SwitchStyle className="flex">
            <Icon
              icon={advancedSetting.showallitem !== '1' ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font30 Hand"
              onClick={() => {
                onFormatChange({
                  showallitem: advancedSetting.showallitem === '1' ? '' : '1',
                });
              }}
            />
            <div className="switchText InlineBlock Normal mLeft12 mTop8">{_l('显示“全部”项')}</div>
          </SwitchStyle>
          <Tooltip text={<span>{_l('重命名')}</span>} popupPlacement="top">
            <i
              className="icon-rename_input Font18 mLeft3 TxtMiddle Hand"
              onClick={() => {
                setState({ showChangeName: true, showName: 'showallitem' });
              }}
            />
          </Tooltip>
        </div>
      )}
      {canShowNull && (
        <div className="flexRow alignItemsCenter">
          <SwitchStyle className="flex">
            <Icon
              icon={advancedSetting.shownullitem === '1' ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font30 Hand"
              onClick={() => {
                onFormatChange({
                  shownullitem: advancedSetting.shownullitem === '1' ? '' : '1',
                });
              }}
            />
            <div className="switchText InlineBlock Normal mLeft12 mTop8">{_l('显示“空”项')}</div>
          </SwitchStyle>
          <Tooltip text={<span>{_l('重命名')}</span>} popupPlacement="top">
            <i
              className="icon-rename_input Font18 mLeft3 TxtMiddle Hand"
              onClick={() => {
                setState({ showChangeName: true, showName: 'shownullitem' });
              }}
            />
          </Tooltip>
        </div>
      )}
      {showChangeName && (
        <ChangeName
          onChange={value => {
            if (showName !== 'shownullitem') {
              onFormatChange({
                allitemname: value.trim(),
              });
            } else {
              onFormatChange({
                nullitemname: value.trim(),
              });
            }
            setState({ showChangeName: false, showName: '' });
          }}
          name={showName !== 'shownullitem' ? advancedSetting.allitemname : advancedSetting.nullitemname}
          onCancel={() => {
            setState({ showChangeName: false, showName: '' });
          }}
        />
      )}
    </Wrap>
  );
}

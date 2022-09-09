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
const Wrap = styled.div`
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
  }
`;
export default function NavShow(props) {
  const { params, onChange, value = '0', filterInfo } = props;
  const [{ filterVisible, filters, relateControls, data }, setState] = useSetState({
    filterVisible: false,
    filters: [],
    relateControls: [],
    data: {},
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
          setState({ relateControls: _.get(res, ['template', 'controls']) || [] });
        });
      }
    }
  }, [value, filterInfo]);
  return (
    <Wrap>
      {params.txt && <div className="title mTop30 Gray Bold">{params.txt}</div>}
      <Dropdown
        data={params.types}
        value={value || '0'}
        className="flex settingContent"
        onChange={value => {
          onChange({
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
      {value === '2' &&
        (data.type === 28 ? (
          <ScoreInput
            control={data}
            values={filters}
            onChange={values => {
              onChange({
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
              onChange({
                navfilters: JSON.stringify(values),
              });
            }}
          />
        ))}
      {filterVisible && value === '3' && (
        <FilterDialog
          data={data}
          overlayClosable={false}
          relationControls={relateControls}
          title={'筛选'}
          filters={filters}
          allControls={filterInfo.allControls}
          globalSheetInfo={filterInfo.globalSheetInfo}
          onChange={({ filters }) => {
            onChange({ navfilters: JSON.stringify(filters.map(handleCondition)) });
            setState({ filterVisible: false });
          }}
          onClose={() => setState({ filterVisible: false })}
        />
      )}
      {filters.length > 0 && value === '3' && (
        <FilterItemTexts
          data={data}
          filters={filters}
          loading={false}
          globalSheetInfo={filterInfo.globalSheetInfo}
          controls={relateControls}
          allControls={filterInfo.allControls}
          editFn={() => setState({ filterVisible: true })}
        />
      )}
    </Wrap>
  );
}

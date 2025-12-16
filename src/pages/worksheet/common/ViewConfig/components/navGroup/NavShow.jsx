import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import sheetAjax from 'src/api/worksheet';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
import { EditInfo } from 'src/pages/widgetConfig/styled/index.js';
import { handleCondition } from 'src/pages/widgetConfig/util/data';
import { FilterDialog, FilterItemTexts } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import SortCustom from 'src/pages/worksheet/common/ViewConfig/components/NavSort/customSet/index.jsx';

const Wrap = styled.div`
  .icon-rename_input {
    color: #9e9e9e;
    padding-right: 10px;
    &:hover {
      color: #1677ff;
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
        border: 1px solid #1677ff;
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

let pendingFilterVisible = false;

export default function NavShow(props) {
  const {
    params,
    onChange,
    value = '0',
    filterInfo = {},
    advancedSetting = {},
    canShowNull,
    canShowAll,
    canShowAllNavLayer,
    fromCondition,
  } = props;
  const [
    { filterVisible, filters, relateControls, data, showSysWorkflow, showChangeName, showName, loading, showCustom },
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
    showCustom: false,
  });

  useEffect(() => {
    () => {
      pendingFilterVisible = false;
    };
  }, []);

  useEffect(() => {
    if (pendingFilterVisible && value === '3' && !loading) {
      setState({ filterVisible: true });
      pendingFilterVisible = false;
    }
  }, [value, loading]);

  useEffect(() => {
    let navfilters = [];
    try {
      navfilters = safeParse(props.navfilters, 'array');
    } catch (error) {
      console.log(error);
      navfilters = [];
    }
    setState({
      filters: navfilters,
    });
    const { columns = [], navGroupId, relateControls } = filterInfo;
    if (relateControls) {
      setState({ relateControls });
    }
    setState({ data: columns.find(o => o.controlId === navGroupId) || {} });
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
        sheetAjax
          .getWorksheetInfo({
            worksheetId: data.dataSource,
            getViews: true,
            getTemplate: true,
            relationWorksheetId: _.get(props, 'filterInfo.globalSheetInfo.worksheetId'),
          })
          .then(res => {
            setState({ relateControls: _.get(res, ['template', 'controls']) || [], loading: false });
          });
      }
    }
  }, [value, filterInfo, data]);

  const onFormatChange = newValue => {
    const { navfilters } = newValue;
    if (navfilters) {
      onChange(newValue);
    } else {
      //显示制定项，人员部门等字段处理
      onChange({
        ...newValue,
        navfilters:
          value === '3'
            ? JSON.stringify(filters.map(o => handleCondition(o)))
            : JSON.stringify(
                filters.map(info => {
                  if (
                    [19, 23, 24, 26, 27, 29, 35, 48].includes(data.type === 30 ? data.sourceControlType : data.type) &&
                    value === '2'
                  ) {
                    return safeParse(info).id;
                  } else {
                    return info;
                  }
                }),
              ),
      });
    }
  };

  const handleDropdownChange = valueNew => {
    onFormatChange({
      navshow: valueNew,
      navfilters: JSON.stringify([]),
      showNextGroup: valueNew === '2' && canShowAllNavLayer ? '999' : undefined,
    });
    setState({
      filters: [],
      filterVisible: valueNew === '3',
    });
    pendingFilterVisible = valueNew === '3';
  };

  const onCloseFilterDialog = () => {
    pendingFilterVisible = false;
    setState({
      filterVisible: false,
    });
  };

  return (
    <Wrap>
      {params.txt && <div className="title mTop30 Gray Bold">{params.txt}</div>}
      <Dropdown
        data={
          filterInfo.navGroupId === 'wfstatus' && !showSysWorkflow
            ? params.types.filter(o => o.value === '0')
            : params.types
        }
        value={filterInfo.navGroupId === 'wfstatus' && !showSysWorkflow ? '0' : value || '0'}
        className="flex settingContent mBottom0"
        onChange={handleDropdownChange}
      />
      {(value === '2' || (filters.length > 0 && value === '3' && !loading)) && <div className="mTop12"></div>}
      {value === '2' && (
        <EditInfo className="pointer flexRow" onClick={() => setState({ showCustom: true })}>
          <div className={cx('overflow_ellipsis flex', filters.length <= 0 ? 'Gray_75' : 'Gray')}>
            {filters.length <= 0 ? _l('设置指定项') : _l('选中%0个', filters.length)}
          </div>
          <div className="edit">
            <i className="icon-edit"></i>
          </div>
        </EditInfo>
      )}
      {showCustom && (
        <SortCustom
          {...props}
          maxCount={50}
          view={{ advancedSetting }}
          projectId={_.get(filterInfo, 'globalSheetInfo.projectId')}
          appId={_.get(filterInfo, 'globalSheetInfo.appId')}
          controlInfo={data}
          title={_l('设置显示项')}
          advancedSettingKey="navfilters"
          onChange={infos => {
            let values = [];
            const type = data.type === 30 ? data.sourceControlType : data.type;
            switch (type) {
              case 29:
              case 26:
              case 27:
              case 48:
                const key =
                  29 === type ? 'rowid' : 26 === type ? 'accountId' : 27 === type ? 'departmentId' : 'organizeId';
                values = infos.map(o => o[key]);
                break;
              default:
                values = infos;
                break;
            }
            onChange({
              navfilters: JSON.stringify(values),
            });
          }}
          onClose={() => {
            setState({ showCustom: false });
          }}
          addTxt={_l('显示项')}
        />
      )}
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
          globalSheetControls={filterInfo.globalSheetControls}
          onChange={({ filters }) => {
            onFormatChange({ navfilters: JSON.stringify(filters.map(handleCondition)) });
            onCloseFilterDialog();
          }}
          fromCondition={fromCondition}
          onClose={() => onCloseFilterDialog()}
        />
      )}
      {filters.length > 0 && value === '3' && !loading && (
        <FilterItemTexts
          fromCondition={fromCondition}
          className={'mBottom0'}
          data={data}
          filters={filters}
          loading={false}
          globalSheetControls={filterInfo.globalSheetControls}
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
              className="Font28 Hand"
              onClick={() => {
                onFormatChange({
                  showallitem: advancedSetting.showallitem === '1' ? '' : '1',
                });
              }}
            />
            <div className="switchText InlineBlock Normal mLeft12 mTop8">{_l('显示“全部”项')}</div>
          </SwitchStyle>
          <Tooltip title={_l('重命名')}>
            <i
              className="icon-rename_input Font18 mLeft3 TxtMiddle Hand"
              onClick={() => {
                setState({ showChangeName: true, showName: 'showallitem' });
              }}
            />
          </Tooltip>
        </div>
      )}
      {canShowAllNavLayer && (
        <div className="flexRow alignItemsCenter">
          <SwitchStyle className="flex">
            <Icon
              icon={advancedSetting.navlayer === '999' ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font28 Hand"
              onClick={() => {
                onFormatChange({
                  navlayer: advancedSetting.navlayer === '999' ? '' : '999',
                });
              }}
            />
            <div className="switchText InlineBlock Normal mLeft12 mTop8">{_l('显示所有下级部门')}</div>
          </SwitchStyle>
        </div>
      )}
      {canShowNull && (
        <div className="flexRow alignItemsCenter">
          <SwitchStyle className="flex">
            <Icon
              icon={advancedSetting.shownullitem === '1' ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font28 Hand"
              onClick={() => {
                onFormatChange({
                  shownullitem: advancedSetting.shownullitem === '1' ? '' : '1',
                });
              }}
            />
            <div className="switchText InlineBlock Normal mLeft12 mTop8">{_l('显示“空”项')}</div>
          </SwitchStyle>
          <Tooltip title={_l('重命名')}>
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

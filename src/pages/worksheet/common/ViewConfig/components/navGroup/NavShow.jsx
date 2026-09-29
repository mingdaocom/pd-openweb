import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Select, Switch, Tooltip } from 'ming-ui/antd-components';
import sheetAjax from 'src/api/worksheet';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
import { EditInfo } from 'src/pages/widgetConfig/styled/index.js';
import FilterDialog from 'src/pages/widgetConfig/widgetSetting/components/FilterData/FilterDialog';
import FilterItemTexts from 'src/pages/widgetConfig/widgetSetting/components/FilterData/FilterItemTexts';
import SortCustom from 'src/pages/worksheet/common/ViewConfig/components/NavSort/customSet/index.jsx';
import { handleCondition } from 'src/utils/domain/control/conditions';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { replaceControlsTranslateInfo } from 'src/utils/services/translation/app';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };
const EMPTY_OBJECT = {};

const Wrap = styled.div`
  .icon-rename_input {
    color: var(--color-text-tertiary);
    padding-right: 10px;
    &:hover {
      color: var(--color-primary);
    }
  }
  .navInputWrap {
    min-height: 36px !important;
  }
  .customAntDropdownTitle,
  .customAntDropdownTitleWithBG {
    height: 26px;
    line-height: 26px;
    .icon-close {
      line-height: 26px !important;
    }
  }
`;
let pendingFilterVisible = false;

export default function NavShow(props) {
  const {
    params,
    onChange,
    value = '0',
    filterInfo = EMPTY_OBJECT,
    advancedSetting = EMPTY_OBJECT,
    navfilters: navfiltersValue,
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
    relateControls: [],
    data: {},
    showSysWorkflow: true,
    showChangeName: false,
    showName: '',
    loading: false,
    showCustom: false,
  });

  useEffect(() => {
    return () => {
      pendingFilterVisible = false;
    };
  }, []);

  useEffect(() => {
    if (pendingFilterVisible && value === '3' && !loading) {
      setState({ filterVisible: true });
      pendingFilterVisible = false;
    }
  }, [value, loading, setState]);

  useEffect(() => {
    let parsedNavfilters = [];

    try {
      parsedNavfilters = safeParse(navfiltersValue, 'array');
    } catch (error) {
      console.log(error);
      parsedNavfilters = [];
    }

    setState({
      filters: parsedNavfilters,
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
  }, [navfiltersValue, filterInfo, setState]);

  useEffect(() => {
    if (value === '3') {
      if (!data.dataSource) {
        return;
      }

      const { relateControls } = filterInfo;

      if (relateControls) {
        setState({ relateControls });
      } else {
        const relationWorksheetId = _.get(filterInfo, 'globalSheetInfo.worksheetId');
        const appId = _.get(filterInfo, 'globalSheetInfo.appId');
        sheetAjax
          .getWorksheetInfo({
            worksheetId: data.dataSource,
            getViews: true,
            getTemplate: true,
            relationWorksheetId,
          })
          .then(res => {
            const relateControls = _.get(res, ['template', 'controls']) || [];
            setState({
              relateControls: replaceControlsTranslateInfo(appId, res.worksheetId, relateControls),
              loading: false,
            });
          });
      }
    }
  }, [value, filterInfo, data, setState]);

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
    if (value === '3' && valueNew === '3') {
      pendingFilterVisible = false;
      setState({ filterVisible: true });
      return;
    }

    onFormatChange({
      navshow: valueNew,
      navfilters: JSON.stringify([]),
      showNextGroup: valueNew === '2' && canShowAllNavLayer ? '999' : undefined,
    });
    // 切换到「筛选」时只清空 filters，不立刻打开弹层，避免弹层在 props 未同步前挂载导致内容错误
    setState({
      filters: [],
      filterVisible: false,
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
      {params.txt && <div className="title mTop30 textPrimary Bold">{params.txt}</div>}
      <Select
        options={
          filterInfo.navGroupId === 'wfstatus' && !showSysWorkflow
            ? params.types.filter(o => o.value === '0')
            : params.types
        }
        fieldNames={SELECT_FIELD_NAMES}
        value={filterInfo.navGroupId === 'wfstatus' && !showSysWorkflow ? '0' : value || '0'}
        className="w100 settingContent mBottom0 mTop12"
        onChange={handleDropdownChange}
        styles={{ popup: { root: { minWidth: 160 } } }}
      />
      {(value === '2' || (filters.length > 0 && value === '3' && !loading)) && <div className="mTop12"></div>}
      {value === '2' && (
        <EditInfo className="pointer flexRow" onClick={() => setState({ showCustom: true })}>
          <div className={cx('overflow_ellipsis flex', filters.length <= 0 ? 'textSecondary' : 'textPrimary')}>
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
          title={_l('筛选')}
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
      {(canShowAll || canShowAllNavLayer || canShowNull) && <div className="mTop8" />}
      {canShowAll && (
        <div className="flexRow alignItemsCenter">
          <div className="flex flexRow alignItemsCenter viewConfigSwitchRow">
            <Switch
              size="mini"
              checked={advancedSetting.showallitem !== '1'}
              onChange={() => {
                onFormatChange({
                  showallitem: advancedSetting.showallitem === '1' ? '' : '1',
                });
              }}
            />
            <div className="InlineBlock Normal mLeft12">{_l('显示“全部”项')}</div>
          </div>
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
          <div className="flex flexRow alignItemsCenter viewConfigSwitchRow">
            <Switch
              size="mini"
              checked={advancedSetting.navlayer === '999'}
              onChange={() => {
                onFormatChange({
                  navlayer: advancedSetting.navlayer === '999' ? '' : '999',
                });
              }}
            />
            <div className="InlineBlock Normal mLeft12">{_l('显示所有下级部门')}</div>
          </div>
        </div>
      )}
      {canShowNull && (
        <div className="flexRow alignItemsCenter">
          <div className="flex flexRow alignItemsCenter viewConfigSwitchRow">
            <Switch
              size="mini"
              checked={advancedSetting.shownullitem === '1'}
              onChange={() => {
                onFormatChange({
                  shownullitem: advancedSetting.shownullitem === '1' ? '' : '1',
                });
              }}
            />
            <div className="InlineBlock Normal mLeft12">{_l('显示“空”项')}</div>
          </div>
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

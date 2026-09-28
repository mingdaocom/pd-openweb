import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Radio } from 'ming-ui/antd-components';
import SortColumns from 'src/pages/worksheet/components/SortColumns/';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/utils/domain/worksheet/view';
import { getDefaultReturnControlIds, getReturnFieldColumns } from './util';

const Wrap = styled.div`
  .returnFieldRadio {
    line-height: 20px;
    display: flex;
    align-items: center;
    .hap-radio {
      top: 0;
    }
  }
  .returnFieldDefaultTag {
    color: var(--color-error);
  }
`;

const SystemFieldsWrap = styled.div`
  .workSheetChangeColumn {
    .searchBar,
    .quickOperate {
      display: none;
    }
  }
  .showControlsColumnCheckItem {
    padding: 0;
    &:hover {
      background-color: initial;
    }
  }
`;

const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];
const getHeight = () => document.documentElement.clientHeight - 342;

// 字段声明不是“显示列”配置，这里单独覆盖字段选择器里的操作和统计文案。
const FIELD_DECLARATION_COLUMN_TEXTS = {
  selectAll: _l('选择全部'),
  clearAll: _l('清除全部'),
  selectedTitle: count => _l('已选择%0', count),
  unselectedTitle: count => _l('未选择%0', count),
};

export default function FieldDeclaration(props) {
  const { appId, saveViewSetLoading, sheetSwitchPermit, updateCurrentView } = props;
  const columns = props.columns || EMPTY_ARRAY;
  const view = props.view || EMPTY_OBJECT;
  const controls = view.controls || EMPTY_ARRAY;
  const { customdisplay = '0' } = getAdvanceSetting(view);
  const customShowControls = getAdvanceSetting(view, 'customShowControls') || view.showControls || EMPTY_ARRAY;
  const [height, setHeight] = useState(getHeight);
  const isCustom = customdisplay === '1';

  // 字段声明复用视图显示列配置字段：customdisplay 控制默认/自定义，showControls 存自定义字段。
  const returnColumns = useMemo(() => getReturnFieldColumns(columns, controls), [columns, controls]);
  const defaultControlIds = useMemo(() => getDefaultReturnControlIds(returnColumns), [returnColumns]);
  const currentShowControlsSource = view.showControls?.length ? view.showControls : customShowControls;
  const currentShowControls = currentShowControlsSource.filter(controlId =>
    returnColumns.find(column => column.controlId === controlId),
  );
  const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
  const systemFieldConfig = useMemo(() => {
    const defaultSysSort = isShowWorkflowSys
      ? [...WORKFLOW_SYSTEM_FIELDS_SORT, ...NORMAL_SYSTEM_FIELDS_SORT]
      : NORMAL_SYSTEM_FIELDS_SORT;
    const syssort =
      getAdvanceSetting(view, 'syssort') || defaultSysSort.filter(controlId => !controls.includes(controlId));
    const sysids = getAdvanceSetting(view, 'sysids') || EMPTY_ARRAY;
    const availableSystemFieldIds = isShowWorkflowSys
      ? [...new Set([...syssort, ...WORKFLOW_SYSTEM_FIELDS_SORT])]
      : syssort.filter(controlId => !WORKFLOW_SYSTEM_FIELDS_SORT.includes(controlId));

    return {
      columns: columns.filter(column => availableSystemFieldIds.includes(column.controlId)),
      sysids,
      syssort,
    };
  }, [columns, controls, isShowWorkflowSys, view]);

  useEffect(() => {
    const resize = () => setHeight(getHeight());

    $(window).on('resize', resize);
    return () => $(window).off('resize', resize);
  }, []);

  const switchMode = useCallback(
    mode => {
      if (mode === '0') {
        updateCurrentView({
          ...view,
          appId,
          editAttrs: ['showControls', 'advancedSetting'],
          editAdKeys: ['customdisplay', 'customShowControls'],
          advancedSetting: {
            customdisplay: '0',
            customShowControls: JSON.stringify(view.showControls || EMPTY_ARRAY),
          },
          showControls: [],
        });
        return;
      }

      // 首次切到自定义时没有历史选择，按“前 50 个可声明字段 + 表单顺序”初始化。
      updateCurrentView({
        ...view,
        appId,
        editAttrs: ['showControls', 'advancedSetting'],
        editAdKeys: ['customdisplay'],
        advancedSetting: {
          customdisplay: '1',
        },
        showControls: customShowControls.length ? customShowControls : defaultControlIds,
      });
    },
    [appId, customShowControls, defaultControlIds, updateCurrentView, view],
  );

  const onChangeColumns = useCallback(
    ({ newShowControls }) => {
      updateCurrentView({
        ...view,
        appId,
        editAttrs: ['advancedSetting', 'showControls'],
        editAdKeys: ['customShowControls'],
        showControls: newShowControls,
        advancedSetting: { customShowControls: JSON.stringify(newShowControls) },
      });
    },
    [appId, updateCurrentView, view],
  );

  const onChangeSystemColumns = useCallback(
    ({ newShowControls, newControlSorts }) => {
      updateCurrentView({
        ...view,
        appId,
        editAttrs: ['advancedSetting'],
        editAdKeys: ['sysids', 'syssort'],
        showControls: [],
        advancedSetting: {
          sysids: JSON.stringify(newShowControls),
          syssort: JSON.stringify(newControlSorts),
        },
      });
    },
    [appId, updateCurrentView, view],
  );

  return (
    <Wrap className="commonConfigItem w100 mTop4 hideColumns">
      <div className="textSecondary Font13 mBottom16">{_l('插件返回的字段数据')}</div>
      <div>
        <Radio className="returnFieldRadio" checked={!isCustom} onChange={() => switchMode('0')}>
          <span>{_l('与表单中的字段保持一致（前50个）')}</span>
        </Radio>
      </div>
      <div className="mTop15 mBottom20">
        <Radio className="returnFieldRadio" checked={isCustom} onChange={() => switchMode('1')}>
          {_l('自定义')}
        </Radio>
      </div>
      {isCustom ? (
        <SortColumns
          layout={2}
          placeholder={_l('搜索字段')}
          noempty={false}
          maxHeight={height}
          showControls={currentShowControls}
          columns={returnColumns}
          controlsSorts={currentShowControls}
          onChange={onChangeColumns}
          isShowColumns
          sortAutoChange
          disabled={saveViewSetLoading}
          columnTexts={FIELD_DECLARATION_COLUMN_TEXTS}
        />
      ) : (
        <SystemFieldsWrap>
          <div className="commonConfigItem Font13 bold">{_l('显示系统字段')}</div>
          <SortColumns
            layout={2}
            noempty={false}
            showControls={systemFieldConfig.sysids}
            dragable={false}
            columns={systemFieldConfig.columns}
            controlsSorts={systemFieldConfig.syssort}
            maxHeight={height}
            onChange={onChangeSystemColumns}
            sortAutoChange
            disabled={saveViewSetLoading}
          />
        </SystemFieldsWrap>
      )}
    </Wrap>
  );
}

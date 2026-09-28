import React from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Radio, Select } from 'ming-ui/antd-components';
import { Button } from 'worksheet/styled';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import StructureType from 'src/pages/worksheet/common/ViewConfig/components/StructureType';
import HierarchyRelateMultiSheet from './hierarchyRelateMultiSheet';

const RELATE_TYPE = [
  { text: _l('本表关联'), value: 1 },
  { text: _l('多表关联'), value: 2 },
];
const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };
const VerifyButton = styled(Button)`
  margin-top: 12px;
`;
const HierarchyViewConfigWrap = styled.div`
  .viewStructureType {
    .settingContent {
      .flexRow {
        justify-content: left !important;
        gap: 30px !important;
      }
    }
  }
  padding: 0 30px 24px;
  .relateTypeRadio {
    display: flex;
    .hap-radio-wrapper {
      flex: 1;
      margin-inline-end: 0;
    }
  }
  .multiSheetRelate {
    .grade {
      margin-right: 30px;
    }
    .controlName {
      margin: 0 4px 0 12px;
      color: var(--color-text-title);
    }
    li {
      display: flex;
      margin-top: 10px;
      align-items: center;
      line-height: 36px;

      .gradeName {
        width: 56px;
      }
      .controlInfo {
        width: 260px;
        position: relative;
        background-color: var(--color-background-secondary);
        margin-left: 10px;
        border-radius: 3px;
      }

      .deleteWrap {
        position: absolute;
        top: 0;
        right: -24px;
      }
    }
    .addRelate {
      margin-top: 6px;
      width: 280px;
      color: var(--color-primary);
      font-weight: bold;
    }
  }
  .currentSheetRelate {
    .itemText {
      margin-left: 12px;
    }
    .emptyHint {
      border-radius: 3px;
      color: var(--color-text-secondary);
      line-height: 34px;
      padding: 0 12px;
      background: var(--color-background-secondary);
    }
  }
  .settingItemTitle {
    margin-bottom: 10px;
  }
`;

export default function HierarchyViewConfig({
  fields,
  handleSelect,
  worksheetInfo = {},
  updateView,
  viewControls,
  childType = 1,
}) {
  const [{ relateType, singleRelate, hierarchyControls }, setRelate] = useSetState({
    hierarchyControls: viewControls || [
      {
        worksheetId: worksheetInfo.worksheetId,
        worksheetName: worksheetInfo.name,
      },
    ],
    relateType: childType,
    singleRelate: _.get(_.head(fields), 'value'),
  });
  const isRelateOtherSheet = relateType === 2;

  const handleClick = () => {
    if (isRelateOtherSheet) {
      handleSelect({ childType: relateType, viewControls: hierarchyControls, viewControl: '' });
      return;
    }

    if (singleRelate) {
      handleSelect({ viewControl: singleRelate, childType: 1 });
      return;
    }

    // 当前工作表中没有符合的字段，将自动为您添加一个时，需主动清除缓存
    if (!isRelateOtherSheet && fields.length <= 0) {
      window.clearLocalDataTime({
        requestData: { worksheetId: worksheetInfo.worksheetId },
        clearSpecificKeys: ['Worksheet_GetWorksheetInfo', 'Worksheet_GetWorksheetById'],
      });
    }

    handleSelect({ viewControl: 'create', childType: 1 });
  };

  return (
    <HierarchyViewConfigWrap>
      <SettingItem>
        <div className="settingItemTitle">{_l('层级结构关系')}</div>
        <Radio.Group
          className="relateTypeRadio"
          size="small"
          options={(RELATE_TYPE || []).map(({ text, ...option }) => ({ ...option, label: text }))}
          value={relateType}
          onChange={event => {
            const value = event.target.value;

            if (value !== relateType) {
              setRelate({
                relateType: value,
              });
              updateView({
                childType: value,
                advancedSetting: {
                  hierarchyViewType: 0,
                },
                editAttrs: ['advancedSetting', 'childType'],
                editAdKeys: ['hierarchyViewType'],
              });
            }
          }}
        />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">
          {isRelateOtherSheet ? _l('选择与上一级工作表关联的字段') : _l('本表关联字段')}
        </div>
        {isRelateOtherSheet ? (
          <HierarchyRelateMultiSheet
            worksheetInfo={worksheetInfo}
            viewControls={hierarchyControls}
            updateViewControls={controls => setRelate({ hierarchyControls: controls })}
          />
        ) : (
          <div className="currentSheetRelate">
            {fields.length > 0 ? (
              <Select
                style={{ width: '100%', maxWidth: '400px' }}
                placeholder={_l('选择关联字段')}
                value={singleRelate}
                options={fields}
                fieldNames={SELECT_FIELD_NAMES}
                onChange={value => setRelate({ singleRelate: value })}
              />
            ) : (
              <div className="emptyHint">{_l('当前工作表中没有符合的字段，将自动为您添加一个')}</div>
            )}
          </div>
        )}
      </SettingItem>
      <div className="mTop24 viewStructureType">
        <StructureType isRelateMultiSheetHierarchyView={isRelateOtherSheet} />
      </div>
      <VerifyButton onClick={handleClick}>{_l('确认')}</VerifyButton>
    </HierarchyViewConfigWrap>
  );
}

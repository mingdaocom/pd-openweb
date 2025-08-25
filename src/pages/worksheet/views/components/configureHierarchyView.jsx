import React from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, RadioGroup } from 'ming-ui';
import { Button } from 'worksheet/styled';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import StructureType from 'src/pages/worksheet/common/ViewConfig/components/StructureType';
import HierarchyRelateMultiSheet from './hierarchyRelateMultiSheet';

const RELATE_TYPE = [
  { text: _l('本表关联'), value: 1 },
  { text: _l('多表关联'), value: 2 },
];
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
    .Radio:last-child {
      margin-left: 88px;
    }
  }
  .multiSheetRelate {
    .grade {
      margin-right: 30px;
    }
    .controlName {
      margin: 0 4px 0 12px;
      color: #151515;
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
        background-color: #f8f8f8;
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
      color: #1677ff;
      font-weight: bold;
    }
  }
  .currentSheetRelate {
    .itemText {
      margin-left: 12px;
    }
    .emptyHint {
      border-radius: 3px;
      color: #757575;
      line-height: 34px;
      padding: 0 12px;
      background: #f5f5f5;
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
    handleSelect({ viewControl: 'create', childType: 1 });
  };
  return (
    <HierarchyViewConfigWrap>
      <SettingItem>
        <div className="settingItemTitle">{_l('层级结构关系')}</div>
        <RadioGroup
          className="relateTypeRadio"
          size="small"
          data={RELATE_TYPE}
          checkedValue={relateType}
          onChange={value => {
            if (value !== relateType) {
              setRelate({ relateType: value });
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
              <Dropdown
                style={{ maxWidth: '400px' }}
                border
                placeholder={_l('选择关联字段')}
                value={singleRelate}
                data={fields}
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

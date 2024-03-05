import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import { RadioGroup } from 'ming-ui';
import styled from 'styled-components';
import { Button } from 'worksheet/styled';
import worksheetAjax from 'src/api/worksheet';
import { Dropdown, Menu } from 'antd';
import { InfoWrap, SettingItem } from 'src/pages/widgetConfig/styled';
import { useSetState } from 'react-use';
import _ from 'lodash';

const RELATE_TYPE = [
  { text: _l('本表关联'), value: 0 },
  { text: _l('多表关联'), value: 1 },
];
const VerifyButton = styled(Button)`
  margin-top: 12px;
`;
const HierarchyViewConfigWrap = styled.div`
  padding: 0 32px 32px 32px;
  .multiSheetRelate {
    .grade {
      margin-right: 30px;
    }
    .controlName {
      margin: 0 4px 0 12px;
      color: #333;
    }
    li {
      display: flex;
      margin-top: 10px;
      align-items: center;
      line-height: 36px;

      .controlInfo {
        width: 260px;
        position: relative;
        background-color: #f8f8f8;
        margin-left: 20px;
        border-radius: 3px;
      }
      .addRelate {
        width: 280px;
        color: #2196f3;
        font-weight: bold;
      }
      .deleteWrap {
        position: absolute;
        top: 0;
        right: -24px;
      }
    }
  }
`;

export default function HierarchyViewConfig({ fields, handleSelect, currentSheetInfo, worksheetControls }) {
  // 可选控件为关联表且关联他表
  const getSelectableControls = sheetInfo => {
    const { controls = [] } = _.get(sheetInfo, 'template') || {};
    return _.filter(controls, item => item.type === 29 && item.dataSource !== currentSheetInfo.worksheetId);
  };

  const [{ relateType, currentRelate, multiRelate }, setRelate] = useSetState({
    relateType: 0,
    currentRelate: '',
    multiRelate: [],
  });
  const [{ selectableControls, selectableSheet }, setSelectable] = useSetState({
    selectableControls: getSelectableControls(currentSheetInfo),
    selectableSheet: currentSheetInfo,
  });

  const isRelateCurrentSheet = relateType === 0;

  const getNextGradeControls = (...para) => {
    worksheetAjax.getWorksheetInfo({ ...para, getTemplate: true }).then(data => {
      setSelectable({ selectableControls: getSelectableControls(data), selectableSheet: data });
    });
  };

  const renderRelate = () => {
    return (
      <Menu>
        {selectableControls.map(item => {
          const { appId, controlId, dataSource, controlName } = item;
          return (
            <Menu.Item
              key={controlId}
              onClick={() => {
                setRelate({ multiRelate: multiRelate.concat(item) });
                getNextGradeControls({ worksheetId: dataSource, appId });
              }}>
              <i className="icon-close"></i>
              <span className="controlName">{controlName}</span>
              <span>{_l('工作表: %0', selectableSheet.name)}</span>
            </Menu.Item>
          );
        })}
      </Menu>
    );
  };

  return (
    <HierarchyViewConfigWrap>
      <SettingItem>
        <div className="settingItemTitle">{_l('层级结构关系')}</div>
        <RadioGroup data={RELATE_TYPE} checkedValue={relateType} onChange={value => setRelate({ relateType: value })} />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">
          {isRelateCurrentSheet ? _l('本表关联字段') : _l('选择与上一级工作表关联的字段')}
        </div>
        {relateType === 0 ? (
          <div className="currentSheetRelate">
            {fields.length > 0 ? (
              <Dropdown
                placeholder={_l('选择')}
                value={currentRelate}
                data={fields}
                onChange={value => setRelate({ currentRelate: value })}
              />
            ) : (
              <InfoWrap>{_l('当前工作表中没有符合的字段，将自动为您添加一个')}</InfoWrap>
            )}
          </div>
        ) : (
          <ul className="multiSheetRelate">
            <li>
              <span className="grade Gray_9e">{_l('第一级')}</span>
              <i className="icon-1_worksheet Gray_9e Font15"></i>
              <span className="controlName">{currentSheetInfo.name}</span>
              <span className="Gray_9e">{_l('( 本表 )')}</span>
            </li>
            {multiRelate.map((item, index) => (
              <li>
                <span className="Gray_9e">{_l('第%0级', index + 2)}</span>
                <div className="controlInfo">
                  <i className="icon-link_worksheet"></i>
                  <span className="controlName">{item.controlName}</span>
                  <span>{_l('工作表: %0', 'a')}</span>
                  <div
                    className="deleteWrap"
                    onClick={() => setRelate({ multiRelate: multiRelate.slice(0, index + 1) })}>
                    <i className="icon-delete_12"></i>
                  </div>
                </div>
              </li>
            ))}
            {selectableControls.length > 0 && (
              <Dropdown trigger={['click']} overlay={renderRelate()} placement="bottomLeft">
                <li className="addRelate">
                  <i className="icon-add"></i>
                  <span>{_l('下一级关联')}</span>
                </li>
              </Dropdown>
            )}
          </ul>
        )}
      </SettingItem>
      <VerifyButton onClick={() => handleSelect(currentRelate)}>{_l('确认')}</VerifyButton>
    </HierarchyViewConfigWrap>
  );
}

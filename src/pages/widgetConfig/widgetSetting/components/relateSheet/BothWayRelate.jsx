import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import { Checkbox, Dialog, Input, Dropdown, RadioGroup } from 'ming-ui';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import { getWorksheetControlsQuantity } from 'src/api/worksheet';
import { SettingItem } from '../../../styled';
import { RELATE_COUNT, RELATE_COUNT_TEXT, DISPLAY_TYPE_TEXT } from '../../../config/setting';
import { getDisplayType } from '../../../util/setting';
import { toEditWidgetPage } from '../../../util';
import { useSheetInfo } from '../../../hooks';

const ConfigWrap = styled.div`
  padding-bottom: 10px;
  .configItem {
    display: flex;
    align-items: center;
    margin-top: 24px;
    .title {
      flex-basis: 20%;
      flex-shrink: 0;
      color: #333;
    }
    .configContent {
      flex-grow: 1;
      .ming.Radio {
        width: calc(50% - 20px);
      }
    }
  }
  .ming.Menu {
    width: 100%;
  }
`;

const BothRelateInfo = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  padding: 10px 12px;
  background-color: #fff;
  .displayType {
    margin-top: 8px;
  }
  span {
    margin: 0 4px;
  }
  .sourceName {
    color: #2196f3;
  }
`;
const RelateInfo = styled.div`
  display: inline-flex;
  line-height: 18px;
  .sheetName {
    max-width: 80px;
    font-weight: bold;
    margin: 0 4px;
  }
`;

export default function BothWayRelate(props) {
  const { data, worksheetInfo, globalSheetInfo = {}, onOk } = props;
  const { sourceControl = {}, controlId } = data;
  const { controlId: sourceControlId, controlName, enumDefault = 2, advancedSetting = {} } = sourceControl;
  const [sourceName, setSourceName] = useState(globalSheetInfo.name);
  const { name: sheetName, worksheetId, roleType } = worksheetInfo;
  const [{ name, count, displayType, configVisible }, setConfig] = useSetState({
    configVisible: false,
    name: controlName || sourceName,
    count: enumDefault || 2,
    displayType: advancedSetting.showtype || '2',
  });

  useEffect(() => {
    setSourceName(globalSheetInfo.name);
    setConfig({ name: controlName || sourceName });
  }, [controlId]);

  const handleClick = () => {
    // getWorksheetControlsQuantity({ worksheetId }).then(({ data }) => {
    //   const { totalNum, relationNum } = data;
    //   if (totalNum > 200) {
    //     alert(_l('???????????????200????????????????????????'));
    //     return;
    //   }
    //   if (relationNum > 20) {
    //     alert(_l('???????????????20??????????????????????????????'));
    //     return;
    //   }
    setConfig({ configVisible: true });
    // });
  };

  return (
    <SettingItem className="withSplitLine">
      <div className="settingItemTitle">{_l('????????????')}</div>
      {_.isEmpty(data.sourceControl) || configVisible ? (
        <div className="labelWrap">
          <Checkbox size="small" disabled={roleType !== 2} checked={false} onClick={handleClick}>
            <RelateInfo>
              {_l('???')} <div className="sheetName overflow_ellipsis">{sheetName}</div>
              {_l(' ??????????????????')}
              <div className="sheetName overflow_ellipsis">{sourceName}</div>
            </RelateInfo>
          </Checkbox>
        </div>
      ) : (
        <BothRelateInfo>
          <div className="relateInfo">
            {_l('???')}
            <span className="Bold">{sheetName}</span>
            {_l('??????????????????')}
            <span
              className="sourceName pointer Bold"
              onClick={() =>
                toEditWidgetPage({ sourceId: worksheetId, targetControl: sourceControlId, fromURL: 'newPage' })
              }
            >
              {name || sourceName}
            </span>
          </div>
          <div className="displayType">
            {_l('??????: %0 ( %1 )', DISPLAY_TYPE_TEXT[displayType], RELATE_COUNT_TEXT[enumDefault])}
          </div>
        </BothRelateInfo>
      )}
      {configVisible && (
        <Dialog
          className="customWidgetForWorksheetWrap"
          visible
          title={_l('??????????????????')}
          onCancel={() => setConfig({ configVisible: false })}
          onOk={() => {
            if (!name) {
              alert(_l('????????????????????????'), 3);
              return;
            }
            onOk({
              controlName: name,
              enumDefault: count,
              advancedSetting: { showtype: displayType },
            });
            setConfig({ configVisible: false });
          }}
        >
          <div className="hint Gray_75">
            {_l('??? ???%0???????????????????????????%1??? ?????????????????????????????????', sheetName, sourceName)}
          </div>
          <ConfigWrap>
            <div className="configItem">
              <div className="title">{_l('????????????')}</div>
              <div className="configContent">
                <Input style={{ width: '100%' }} value={name} onChange={value => setConfig({ name: value })} />
              </div>
            </div>
            <div className="configItem">
              <div className="title">{_l('????????????')}</div>
              <div className="configContent">
                <RadioGroup
                  size="middle"
                  checkedValue={count || 2}
                  data={RELATE_COUNT}
                  onChange={value => setConfig({ count: value, displayType: String(value) })}
                />
              </div>
            </div>
            <div className="configItem">
              <div className="title">{_l('????????????')}</div>
              <div className="configContent">
                <Dropdown
                  isAppendToBody
                  style={{ width: '100%' }}
                  border
                  defaultValue={count}
                  value={displayType}
                  data={getDisplayType({ type: count })}
                  onChange={value => setConfig({ displayType: value })}
                />
              </div>
            </div>
          </ConfigWrap>
        </Dialog>
      )}
    </SettingItem>
  );
}

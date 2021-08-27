import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import { Dialog, RadioGroup } from 'ming-ui';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import cx from 'classnames';
import { addSheet } from 'src/api/appManagement';
import SelectSheetFromApp from './SelectSheetFromApp';

const DATA_SOURCE_MODE = [
  {
    text: _l('新建数据源'),
    value: 0,
    children: (
      <div style={{ margin: '0 0 4px 28px', fontWeight: 'normal' }} className="Font12 Gray_9e">
        {_l('我们将为您新建一个表与层级视图，用来管理级联选择的数据')}
      </div>
    ),
  },
  { text: _l('选择已有表作为数据源'), value: 1 },
];
const SelectDataSourceWrap = styled.div`
  padding-bottom: 24px;
  label {
    margin-top: 12px;
  }
  .selectSheetWrap.canSwitchSelectType {
    margin-left: 30px;
  }
`;

export default function SelectDataSource({ onClose, onOk, editType, appId, worksheetId, viewId, globalSheetInfo }) {
  const [dataSourceMode, setMode] = useState(editType);
  const { appId: currentAppId, worksheetId: sourceId } = globalSheetInfo;
  const [ids, setIds] = useSetState(
    editType === 0 ? { appId: currentAppId, sheetId: '', viewId: '' } : { appId, sheetId: worksheetId, viewId },
  );
  const handleOk = () => {
    if (dataSourceMode === 0) {
      const currentTime = moment();
      addSheet({
        name: _l('数据源 %0', `${currentTime.format('M-D HH:mm')}`),
        worksheetId: sourceId,
        worksheetType: 1,
        createLayer: true,
      }).then(data => {
        const { worksheetId, views, appId } = data;
        const { viewId } = _.head(views);
        onOk({ viewId, sheetId: worksheetId, appId });
      });
    } else {
      onOk(ids);
    }
  };
  return (
    <Dialog
      style={{ width: '560px' }}
      visible
      okDisabled={dataSourceMode !== 0 && !ids.viewId}
      title={editType === 0 ? _l('选择数据源') : _l('修改数据源')}
      onCancel={onClose}
      onOk={handleOk}>
      <SelectDataSourceWrap>
        <div className="intro Gray_9e">
          {_l(
            '选择一个层级视图作为级联选择的数据源，将按照此视图下数据的层级关系来选择目标表记录。仅支持本表的层级结构',
          )}
        </div>
        {editType === 0 && (
          <RadioGroup
            vertical
            size="middle"
            data={DATA_SOURCE_MODE}
            checkedValue={dataSourceMode === 3 ? 1 : dataSourceMode}
            onChange={value => setMode(value)}
          />
        )}
        {_.includes([1, 3], dataSourceMode) && (
          <div className={cx('selectSheetWrap', { canSwitchSelectType: editType === 0 })}>
            <SelectSheetFromApp
              config={[
                {
                  text: _l('应用'),
                  key: 'app',
                  disabled: editType === 3,
                },
                {
                  text: _l('工作表'),
                  key: 'sheet',
                  disabled: editType === 3,
                  filter: item => item.value !== sourceId,
                },
                {
                  text: _l('层级视图'),
                  key: 'view',
                  filter: view => view.viewType === 2 && String(view.childType) !== '2',
                },
              ]}
              onChange={setIds}
              globalSheetInfo={globalSheetInfo}
              {...ids}
            />
          </div>
        )}
      </SelectDataSourceWrap>
    </Dialog>
  );
}

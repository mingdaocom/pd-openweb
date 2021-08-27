import React, { useState } from 'react';
import { Dialog, Button, Dropdown, RadioGroup, Support } from 'ming-ui';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import SelectSheetFromApp from '../SelectSheetFromApp';

const AddSubListWrap = styled.div`
  .intro {
    color: #9e9e9e;
    span {
      margin-left: 6px;
      color: #2196f3;
    }
  }
  label {
    margin-top: 16px;
  }
  .footerBtn {
    text-align: right;
    margin-top: 32px;
  }
  .Radio-text {
    font-weight: bold;
  }
  .radioIntro {
    margin-left: 28px;
    font-weight: normal;
    margin-top: 4px;
  }
  .selectSheetWrap {
    margin-left: 30px;
  }
`;
const OPTIONS = [
  {
    text: _l('从空白添加'),
    value: '1',
    children: <div className="radioIntro Font12 Gray_9e">{_l('之后您也可以将它转为一个实体工作表，显示在应用中')}</div>,
  },
  {
    text: _l('将已有工作表作为子表'),
    value: '2',
  },
];

export default function AddSubList(props) {
  const { data, deleteWidget, globalSheetInfo, onOk } = props;
  const { appId: currentAppId, worksheetId: currentSheetId } = globalSheetInfo;
  const [{ appId, sheetId, sheetName }, setSelected] = useSetState({ appId: currentAppId, sheetId: '', sheetName: '' });
  const [visible, setVisible] = useState(true);
  const [createType, setType] = useState('1');

  const closeSubListConfig = () => {
    setVisible(false);
    deleteWidget(data.controlId);
  };

  const handleCreate = () => {
    onOk({ createType, appId, sheetId, controlName: sheetName });
    setVisible(false);
  };

  return (
    <Dialog width={560} visible={visible} title={_l('添加子表')} onCancel={closeSubListConfig} footer={null}>
      <AddSubListWrap>
        <div className="intro">
          {_l(
            '在标签页中显示从属于当前记录的多条记录，并支持在创建时一次填入多个信息。如：在创建订单时一次添加多个订单明细，在客户中显示关联的客户订单等。',
          )}
          <Support type={3} href="https://help.mingdao.com/sheet22.html" text={_l('帮助')} />
        </div>
        <RadioGroup vertical data={OPTIONS} checkedValue={createType} onChange={setType} />
        <div className="selectSheetWrap">
          {createType === '2' && (
            <SelectSheetFromApp
              config={[
                {
                  text: _l('应用'),
                  key: 'app',
                },
                {
                  text: _l('工作表'),
                  key: 'sheet',
                  filter: item => item.worksheetId !== currentSheetId,
                },
              ]}
              globalSheetInfo={globalSheetInfo}
              onChange={setSelected}
              appId={appId}
              sheetId={sheetId}
            />
          )}
        </div>

        <div className="footerBtn">
          <Button type="link" onClick={closeSubListConfig}>
            {_l('取消')}
          </Button>
          <Button type="primary" disabled={createType === '2' && !sheetId} onClick={handleCreate}>
            {_l('确定')}
          </Button>
        </div>
      </AddSubListWrap>
    </Dialog>
  );
}

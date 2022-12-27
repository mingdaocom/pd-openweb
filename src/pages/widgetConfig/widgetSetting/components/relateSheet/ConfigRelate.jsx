import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { useSetState } from 'react-use';
import { LoadDiv, Dialog, Button, Support } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import SelectSheetFromApp from '../SelectSheetFromApp';
import _ from 'lodash';

const AddRelate = styled.div`
  .intro {
    color: #9e9e9e;
    span {
      margin-left: 6px;
      color: #2196f3;
    }
  }
  .relateWrap {
    position: relative;
    margin-top: 40px;
    height: 300px;
    border: 1px solid #ededed;
    padding: 20px 18px;
  }
  .relateTypeTab {
    display: flex;
    position: absolute;
    top: -16px;
    border: 1px solid #ededed;
    background: #fff;
    li {
      line-height: 32px;
      padding: 0 12px;
      transition: all 0.25s;
      border-right: 1px solid #ededed;
      cursor: pointer;
      color: #9e9e9e;
      &:last-child {
        border-right: none;
      }

      &.active,
      &:hover {
        color: #2196f3;
      }
    }
  }
  .footerBtn {
    text-align: right;
    margin-top: 32px;
  }
  .existRelateWrap {
    .emptyHint {
      margin-top: 120px;
      text-align: center;
    }
    li {
      line-height: 36px;
      padding: 0 12px;
      border-radius: 3px;
      &:hover {
        background-color: #f5f5f5;
      }
      &.active {
        background-color: #e5f3ff;
      }
    }
  }
  .relateListWrap {
    max-height: 260px;
    overflow: auto;
    .title {
      margin: 12px 0;
      span {
        margin: 0 4px;
      }
    }
  }
`;

const RELATE_TYPE = [
  { key: 'new', text: _l('新建关联') },
  { key: 'exist', text: _l('已有关联') },
];
export default function ConfigRelate(props) {
  const { globalSheetInfo, value = '', deleteWidget, onOk } = props;
  const { appId: defaultAppId, worksheetId: sourceId, name: sourceName } = globalSheetInfo;
  const [{ appId, sheetId, sheetName }, setSelectedId] = useSetState({
    appId: defaultAppId,
    sheetId: value,
    sheetName: '',
  });
  const [{ relateControls, selectedControl, loading }, setControls] = useSetState({
    relateControls: [],
    selectedControl: {},
    loading: false,
  });
  const [relateType, setType] = useState('new');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (relateType !== 'exist' || loading) return;
    setControls({ loading: true });
    worksheetAjax.getWorksheetControls({
      worksheetId: sourceId,
      getControlType: 1,
    })
      .then(({ data }) => {
        setControls({ relateControls: data.controls });
      })
      .always(() => setControls({ loading: false }));
  }, [relateType]);

  const closeRelateConfig = () => {
    setVisible(false);
    deleteWidget();
  };

  const renderContent = () => {
    if (relateType === 'new') {
      return (
        <div className="selectSheetWrap">
          <SelectSheetFromApp
            onChange={setSelectedId}
            globalSheetInfo={globalSheetInfo}
            appId={appId}
            sheetId={sheetId}
          />
        </div>
      );
    }
    if (loading) return <LoadDiv />;
    return (
      <div className="existRelateWrap">
        {_.isEmpty(relateControls) ? (
          <div className="emptyHint">{_l('没有与当前工作表关联的表')}</div>
        ) : (
          <div className="relateListWrap">
            <div className="title Gray_9e">
              {_l('添加与')}
              <span className="Bold ">{sourceName}</span>
              {_l('关联的')}
            </div>
            <ul>
              {relateControls.map(item => (
                <li
                  className={cx({ active: item.controlId === selectedControl.controlId })}
                  key={item.controlId}
                  onClick={() => {
                    setControls({ selectedControl: item });
                    setSelectedId({ sheetId: item.dataSource, appId: '' });
                  }}>
                  <span>{item.sourceEntityName}</span>
                  <span className="Gray_9e">{_l(' - %0', _.get(item, ['sourceControl', 'controlName']))}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog
      style={{ width: '560px' }}
      visible={visible}
      title={_l('添加关联记录')}
      footer={null}
      onCancel={closeRelateConfig}>
      <AddRelate>
        <div className="intro">
          {_l('在表单中显示关联的记录。如：订单关联客户')}
          <Support type={3} href="https://help.mingdao.com/sheet2.html" text={_l('帮助')} />
        </div>
        <div className="relateWrap">
          <ul className="relateTypeTab">
            {RELATE_TYPE.map(({ key, text }) => (
              <li
                key={key}
                className={cx({ active: relateType === key })}
                onClick={() => {
                  setType(key);
                  setSelectedId({});
                  setControls({ selectedControl: {} });
                }}>
                {text}
              </li>
            ))}
          </ul>
          {renderContent()}
        </div>
        <div className="footerBtn">
          <Button type="link" onClick={closeRelateConfig}>
            {_l('取消')}
          </Button>
          <Button
            type="primary"
            disabled={!sheetId}
            onClick={() => onOk({ sheetId, control: selectedControl, sheetName })}>
            {_l('确定')}
          </Button>
        </div>
      </AddRelate>
    </Dialog>
  );
}

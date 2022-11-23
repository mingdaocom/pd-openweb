import React, { Fragment, useEffect, useState } from 'react';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import { Checkbox, Dialog } from 'ming-ui';
import { EditInfo } from '../../../styled';
import styled from 'styled-components';
import { getStringBytes } from 'src/util';
import { getStrBytesLength } from 'src/pages/Role/PortalCon/tabCon/util.js';

const ItemName = styled.div`
  display: flex;
  align-items: center;
  height: 36px;
  margin-bottom: 12px;
  div {
    &:first-child {
      width: 72px;
      margin-right: 12px;
    }
    &:last-child {
      flex: 1;
    }
  }
  .scoreIndex {
    width: 100%;
    height: 100%;
    line-height: 34px;
    padding-left: 14px;
    box-sizing: border-box;
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 3px;
  }
  .scoreText {
    flex: 1;
    height: 36px;
    border: 1px solid #e0e0e0;
    border-radius: 3px;
    padding: 0 12px;
  }
`;

const defaultNames = [
  { key: '1', value: '很差' },
  { key: '2', value: '差' },
  { key: '3', value: '一般' },
  { key: '4', value: '好' },
  { key: '5', value: '非常好' },
];

export default function ScoreConfig({ data, onChange }) {
  const [visible, setVisible] = useState(false);
  const { showvalue, max } = getAdvanceSetting(data);
  const itemnames = getAdvanceSetting(data, 'itemnames') || [];
  const [names, setNames] = useState(itemnames);

  const getNames = () => {
    return itemnames.length
      ? itemnames
      : Array.from({ length: max }).map((i, index) => ({ key: `${index + 1}`, value: '' }));
  };

  useEffect(() => {
    setNames(getNames());
  }, [data.controlId]);

  useEffect(() => {
    if (Number(max) === 5 && itemnames.length !== 5) {
      setNames(defaultNames);
      return;
    }
    // 文案与数值不等，无值清空
    if (max && Number(max) !== itemnames.length) {
      setNames(getNames());
      onChange(handleAdvancedSettingChange(data, { itemnames: '' }));
    }
  }, [max]);

  const updateNames = (value, it) => {
    const newItemNames = names.map(n => (n.key === it.key ? Object.assign({}, n, { value }) : n));
    setNames(newItemNames);
  };

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={showvalue === '1'}
          text={_l('显示选中结果')}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { showvalue: checked ? '0' : '1' }))}
        />
      </div>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={itemnames.length}
          text={_l('自定义等级文案')}
          onClick={checked => {
            if (!checked) {
              if (!names.length && Number(max) === 5) {
                setNames(defaultNames);
              }
              setVisible(true);
            } else {
              onChange(handleAdvancedSettingChange(data, { itemnames: '' }));
            }
          }}
        />
      </div>

      {itemnames.length > 0 && (
        <EditInfo style={{ margin: '12px 0' }} onClick={() => setVisible({ visible: true })}>
          <div className="text overflow_ellipsis Gray">
            {itemnames
              .filter(i => i.value)
              .map(i => i.value)
              .join('、')}
          </div>
          <div className="edit">
            <i className="icon-edit"></i>
          </div>
        </EditInfo>
      )}

      <Dialog
        width={500}
        visible={visible}
        title={_l('设置等级说明')}
        onCancel={() => {
          setNames(getNames());
          setVisible(false);
        }}
        onOk={() => {
          onChange(handleAdvancedSettingChange(data, { itemnames: JSON.stringify(names) }));
          setVisible(false);
        }}
      >
        <Fragment>
          <div className="Gray_9e mBottom24">
            {_l('为每个等级设置说明文案。当鼠标悬停在对应等级或在选中后，显示对等级的描述文案。')}
          </div>
          <ItemName style={{ marginBottom: 0 }}>
            <div>{_l('等级')}</div>
            <div>{_l('文字')}</div>
          </ItemName>
          {names.map(it => {
            return (
              <ItemName>
                <div className="scoreIndex">{it.key}</div>
                <input
                  className="scoreText"
                  value={it.value}
                  onChange={e => {
                    updateNames(e.target.value.trim(), it);
                  }}
                  onBlur={e => {
                    const newVal =
                      getStringBytes(e.target.value.trim()) <= 60 //30个中文字符
                        ? e.target.value.trim()
                        : getStrBytesLength(e.target.value.trim(), 60);
                    updateNames(newVal, it);
                  }}
                />
              </ItemName>
            );
          })}
        </Fragment>
      </Dialog>
    </Fragment>
  );
}

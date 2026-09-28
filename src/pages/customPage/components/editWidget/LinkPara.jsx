import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Checkbox, Dropdown, Input, Space, Tooltip } from 'ming-ui/antd-components';
import { LINK_PARA_FIELDS } from '../../config';

const DEFAULT_PARA_ITEM = { key: '', value: { type: 'static', data: '' } };
const LinkParaWrap = styled.div`
  padding: 16px 0;
  .title {
    margin-top: 16px;
  }
  input {
    font-size: 13px;
    height: 32px;
    border-radius: 3px;
  }
  .paraItem {
    margin-top: 12px;
  }
  .add {
    margin-top: 16px;
    font-weight: bold;
    color: var(--color-primary);
    &:hover {
      color: var(--color-primary-dark);
    }
  }
  .deleteWrap {
    color: var(--color-text-tertiary);
    &:hover {
      color: var(--color-text-secondary);
    }
  }
  .hap-checkbox-input {
    position: absolute;
  }
`;

function ParaItem({ deleteItem, item, updateItem }) {
  const { key, value } = item;
  const { type, data } = value;
  const [visible, setVisible] = useState(false);
  return (
    <div className="paraItem flexCenter">
      <Input
        style={{ width: '100px' }}
        value={key}
        placeholder={_l('参数名')}
        onChange={e => {
          updateItem({ key: e.target.value });
        }}
      />
      <Space.Compact block className="flex mLeft6 mRight6">
        {type === 'static' ? (
          <Input
            value={data}
            placeholder={_l('值')}
            onChange={e => {
              updateItem({ value: { type: 'static', data: e.target.value } });
            }}
          />
        ) : (
          <Input readOnly value={`{{${data}}}`} />
        )}
        <Dropdown
          open={visible}
          trigger={['click']}
          placement="bottomRight"
          onOpenChange={setVisible}
          menu={{
            style: { minWidth: 180 },
            items: LINK_PARA_FIELDS.map(({ type, title, fields }) => ({
              type: 'group',
              key: type,
              label: title,
              children: fields.map(({ text, value }) => ({
                key: `${type}-${value}`,
                label: text,
                onClick: () => {
                  updateItem({ value: { type, data: value } });
                  setVisible(false);
                },
              })),
            })),
          }}
        >
          <Button
            aria-label={_l('使用动态参数')}
            color={visible ? 'primary' : 'default'}
            icon={
              <Tooltip title={_l('使用动态参数')}>
                <i className="icon-workflow_other Font18" />
              </Tooltip>
            }
          />
        </Dropdown>
      </Space.Compact>
      <Tooltip title={_l('删除')}>
        <div className="deleteWrap pointer" onClick={deleteItem}>
          <i className="icon-delete_12"></i>
        </div>
      </Tooltip>
    </div>
  );
}

export default function LinkPara(props) {
  const { paras = [], setParas, config = {}, setConfig = () => {}, showActionBar } = props;
  let { reload = false, newTab = false } = config;

  return (
    <LinkParaWrap>
      <Checkbox
        checked={paras.length > 0}
        onChange={e => {
          const { checked } = e.target;
          setParas(!checked ? [] : [DEFAULT_PARA_ITEM]);
        }}
      >
        {_l('对链接目标传参')}
      </Checkbox>

      {paras.length > 0 && (
        <div className="paraListWrap">
          <div className="title Bold">{_l('查询参数')}</div>
          <div className="paraList">
            {paras.map((item, index) => (
              <ParaItem
                key={index}
                index={index}
                item={item}
                updateItem={obj =>
                  setParas(paras.map((data, itemIndex) => (itemIndex === index ? { ...data, ...obj } : data)))
                }
                deleteItem={() => setParas(paras.filter((_, itemIndex) => itemIndex !== index))}
              />
            ))}
          </div>
          <div className="add pointer" onClick={() => setParas([...paras, DEFAULT_PARA_ITEM])}>
            <i className="icon-add"></i>
            {_l('添加')}
          </div>
        </div>
      )}
      {showActionBar && (
        <div className="pTop16 pBottom16">
          <Checkbox
            checked={reload && newTab}
            onChange={e => {
              const { checked } = e.target;
              setConfig({ reload: checked, newTab: checked });
            }}
          >
            {_l('显示操作栏')}
          </Checkbox>
          {(reload || newTab) && (
            <div className="pTop8 pLeft24">
              <div className="mBottom8">
                <Checkbox
                  checked={reload}
                  onChange={e => {
                    const { checked } = e.target;
                    setConfig({ newTab, reload: checked });
                  }}
                >
                  {_l('刷新')}
                </Checkbox>
              </div>
              <div>
                <Checkbox
                  checked={newTab}
                  onChange={e => {
                    const { checked } = e.target;
                    setConfig({ reload, newTab: checked });
                  }}
                >
                  {_l('新页面打开')}
                </Checkbox>
              </div>
            </div>
          )}
        </div>
      )}
    </LinkParaWrap>
  );
}

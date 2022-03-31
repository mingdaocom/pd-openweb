import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import update from 'immutability-helper';
import cx from 'classnames';
import { Checkbox } from 'ming-ui';
import { DropdownContent } from '../../../widgetConfig/styled';
import { Dropdown, Input } from 'antd';
const SELECTABLE_FIELD = [
  {
    title: _l('当前用户信息'),
    type: 'user',
    fields: [
      { text: _l('用户ID'), value: 'userId' },
      { text: _l('手机号'), value: 'phone' },
      { text: _l('邮箱'), value: 'email' },
      // { text: _l('工号'), value: 'workId' },
    ],
  },
  {
    title: _l('系统信息'),
    type: 'sys',
    fields: [
      { text: _l('组织ID'), value: 'projectId' },
      { text: _l('应用ID'), value: 'appId' },
      { text: _l('分组ID'), value: 'groupId' },
      { text: _l('应用项ID'), value: 'itemId' },
      { text: _l('UserAgent'), value: 'ua' },
      { text: _l('时间戳'), value: 'timestamp' },
    ],
  },
];

const DEFAULT_PARA_ITEM = { key: '', value: { type: 'static', data: '' } };
const LinkParaWrap = styled.div`
  padding: 16px 0;
  .title {
    margin-top: 16px;
  }
  input {
    height: 36px;
  }
  .valueWrap {
    flex: 1;
    margin: 0 6px;
    .icon-workflow_other {
      color: #9e9e9e !important;
    }
  }
  .paraItem {
    margin-top: 12px;
    .selectField {
      flex-shrink: 0;
      width: 36px;
      line-height: 34px;
      border: 1px solid #d9d9d9;
      border-left: none;
      text-align: center;
      background: #fff;
      &.active,
      &:hover {
        i {
          color: #2196f3;
        }
      }
      i {
        vertical-align: sub;
        color: #757575;
      }
    }
  }
  .fieldWrap {
    line-height: 34px;
    flex: 1;
    padding-left: 12px;
    border: 1px solid #d9d9d9;
    background: #fff;
  }
  .add {
    margin-top: 16px;
    font-weight: bold;
    color: #2196f3;
    &:hover {
      color: #1b83d6;
    }
  }
  .deleteWrap {
    color: #9e9e9e;
    &:hover {
      color: #757575;
    }
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
      <div className="valueWrap flexCenter">
        {type === 'static' ? (
          <Input
            value={data}
            placeholder={_l('值')}
            onChange={e => {
              updateItem({ value: { type: 'static', data: e.target.value } });
            }}
          />
        ) : (
          <div className="fieldWrap">{`{{${data}}}`}</div>
        )}
        <Dropdown
          visible={visible}
          trigger={'click'}
          placement={'bottomRight'}
          onVisibleChange={setVisible}
          overlay={
            <DropdownContent style={{ width: '180px' }}>
              {SELECTABLE_FIELD.map(({ type, title, fields }) => {
                return (
                  <Fragment key={type}>
                    <div className="title">{title}</div>
                    {fields.map(({ text, value }) => (
                      <div
                        key={value}
                        className="item"
                        onClick={() => {
                          updateItem({ value: { type, data: value } });
                          setVisible(false);
                        }}
                      >
                        {text}
                      </div>
                    ))}
                  </Fragment>
                );
              })}
            </DropdownContent>
          }
        >
          <div data-tip={_l('使用动态参数')} className={cx('selectField pointer', { active: visible })}>
            <i className="icon-workflow_other Font18 "></i>
          </div>
        </Dropdown>
      </div>
      <div className="deleteWrap pointer" data-tip={_l('删除')} onClick={deleteItem}>
        <i className="icon-delete_12"></i>
      </div>
    </div>
  );
}
export default function LinkPara(props) {
  const { paras, setParas, config = {}, setConfig = () => {}, showActionBar } = props;
  let { reload = false, newTab = false } = config;

  return (
    <LinkParaWrap>
      <Checkbox
        size="small"
        checked={paras.length > 0}
        text={_l('对链接目标传参')}
        onClick={checked => {
          setParas(checked ? [] : [DEFAULT_PARA_ITEM]);
        }}
      />

      {paras.length > 0 && (
        <div className="paraListWrap">
          <div className="title Bold">{_l('查询参数')}</div>
          <div className="paraList">
            {paras.map((item, index) => (
              <ParaItem
                key={index}
                index={index}
                item={item}
                updateItem={obj => setParas(update(paras, { [index]: { $apply: data => ({ ...data, ...obj }) } }))}
                deleteItem={() => setParas(update(paras, { $splice: [[index, 1]] }))}
              />
            ))}
          </div>
          <div className="add pointer" onClick={() => setParas(update(paras, { $push: [DEFAULT_PARA_ITEM] }))}>
            <i className="icon-add"></i>
            {_l('添加')}
          </div>
        </div>
      )}
      {showActionBar && (
        <div className="pTop16 pBottom16">
          <Checkbox
            size="small"
            checked={reload && newTab}
            text={_l('显示操作栏')}
            onClick={checked => {
              setConfig({ reload: !checked, newTab: !checked });
            }}
          />
          {(reload || newTab) && (
            <div className="pTop8 pLeft24">
              <Checkbox
                size="small"
                className="mBottom8"
                checked={reload}
                text={_l('刷新')}
                onClick={checked => {
                  setConfig({ newTab, reload: !checked });
                }}
              />
              <Checkbox
                size="small"
                checked={newTab}
                text={_l('新页面打开')}
                onClick={checked => {
                  setConfig({ reload, newTab: !checked });
                }}
              />
            </div>
          )}
        </div>
      )}
    </LinkParaWrap>
  );
}

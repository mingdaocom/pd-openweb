import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import update from 'immutability-helper';
import cx from 'classnames';
import { DropdownContent } from '../../../widgetConfig/styled';
import { Checkbox, Dropdown, Input } from 'antd';
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
  .valueWrap {
    flex: 1;
    margin: 0 6px;
    .icon-workflow_other {
      color: #9e9e9e !important;
    }
    input {
      border-radius: 3px 0 0 3px !important;
    }
  }
  .paraItem {
    margin-top: 12px;
    .selectField {
      flex-shrink: 0;
      width: 32px;
      line-height: 30px;
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
  .ant-checkbox-input {
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
              {LINK_PARA_FIELDS.map(({ type, title, fields }) => {
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

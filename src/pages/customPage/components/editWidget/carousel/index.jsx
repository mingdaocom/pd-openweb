import React, { useState, Fragment, useEffect } from 'react';
import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import { Icon } from 'ming-ui';
import { ConfigProvider, Button, Tooltip } from 'antd';
import { Header, EditWidgetContent } from '../../../styled';
import styled from 'styled-components';
import Preview from './Preview';
import Setting from './Setting';

const Wrap = styled.div`
  background-color: #eee;
  height: 100%;
  display: flex;

  .btnStyle {
    display: flex;
    border-radius: 3px;
    padding: 3px;
    background-color: #e6e6e6;
    .item {
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      height: 30px;
      line-height: 30px;
      padding: 0 10px;
      color: #9e9e9e;
      font-size: 20px;
      cursor: pointer;
      &:last-child {
        border: none;
      }
      &.active {
        color: #2196f3;
        font-weight: bold;
        border-radius: 3px;
        background-color: #fff;
      }
    }
  }
`;

const defaultComponentConfig = {
  count: 20,
  action: 1,
  openMode: 1,
};

const defaultConfig = {
  effect: 'scrollx',
  autoplaySpeed: 3,
  fill: 1,
  fillColor: '#333333',
  displayMode: 0,
};

export default function Carousel(props) {
  const { ids, widget, onEdit, onClose } = props;

  const [componentConfig, setComponentConfig] = useState(widget.componentConfig || defaultComponentConfig);
  const [config, setConfig] = useState(widget.config || defaultConfig);

  const handleSave = () => {
    onEdit({
      config,
      componentConfig,
    });
  };

  return (
    <Dialog
      maskStyle={{ zIndex: 999 }}
      wrapClassName="customPageCarouselWrap"
      className="editWidgetDialogWrap"
      visible
      onClose={onClose}
    >
      <Header>
        <div className="typeName">{_l('轮播图')}</div>
        <div className="flexRow valignWrapper">
          <ConfigProvider autoInsertSpaceInButton={false}>
            <Button block className="save" shape="round" type="primary" onClick={handleSave}>
              {_l('保存')}
            </Button>
          </ConfigProvider>
          <Tooltip title={_l('关闭')} placement="bottom">
            <Icon icon="close" className="Font24 pointer mLeft16 Gray_9e" onClick={onClose} />
          </Tooltip>
        </div>
      </Header>
      <EditWidgetContent>
        <Wrap>
          <Preview
            {...props}
            config={config}
            componentConfig={componentConfig}
            setConfig={data => {
              setConfig({
                ...config,
                ...data,
              });
            }}
          />
          <Setting
            {...props}
            componentConfig={componentConfig}
            setComponentConfig={data => {
              setComponentConfig({
                ...componentConfig,
                ...data,
              });
            }}
            config={config}
            setConfig={data => {
              setConfig({
                ...config,
                ...data,
              });
            }}
          />
        </Wrap>
      </EditWidgetContent>
    </Dialog>
  );
}

import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button, Modal, Tooltip } from 'ming-ui/antd-components';
import { EditWidgetContent, Header } from '../../../styled';
import Preview from './Preview';
import Setting from './Setting';

const Wrap = styled.div`
  height: 100%;
  display: flex;
`;

const defaultComponentConfig = {
  count: 20,
  action: 1,
  openMode: 1,
};

const defaultConfig = {
  effect: 'scrollx',
  autoplaySpeed: 3,
  fill: 2,
  fillColor: '#454545',
  displayMode: 0,
};

export default function Carousel(props) {
  const { widget, onEdit, onClose } = props;

  const [componentConfig, setComponentConfig] = useState(widget.componentConfig || defaultComponentConfig);
  const [config, setConfig] = useState(widget.config || defaultConfig);

  const handleSave = () => {
    onEdit({
      config,
      componentConfig,
    });
  };

  return (
    <Modal
      className="editWidgetDialogWrap"
      classNames={{ container: 'pAll0', body: 'pAll0' }}
      styles={{ body: { padding: 0, position: 'relative' } }}
      verticalAlign="bottom"
      open
      width="100%"
      type="fixed"
      footer={null}
      closable={false}
      centered={true}
      onCancel={onClose}
    >
      <Header>
        <div className="typeName">{_l('轮播图')}</div>
        <div className="flexRow valignWrapper">
          <Button block className="save" shape="round" type="primary" onClick={handleSave}>
            {_l('保存')}
          </Button>
          <Tooltip title={_l('关闭')} placement="bottom">
            <Icon icon="close" className="Font24 pointer mLeft16 textTertiary" onClick={onClose} />
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
    </Modal>
  );
}

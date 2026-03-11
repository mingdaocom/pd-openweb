import React from 'react';
import { Button, Input } from 'antd';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import { dialogSelectIcon } from 'ming-ui/functions';

const ButtonWrap = styled.div`
  .ant-btn,
  .ant-btn:hover,
  .ant-btn:focus {
    width: 80px;
    background: ${props => props.color};
    border-color: ${props => props.color};
  }
  .ant-btn:hover {
    .arrowWrap {
      opacity: 1;
    }
  }
  .ant-btn {
    text-shadow: none;
    box-shadow: none;
    height: 36px;
    border-radius: 0 3px 3px 0 !important;
  }
  .arrowWrap {
    opacity: 0;
    justify-content: center;
    position: absolute;
    right: 9px;
    top: 10px;
    background: #00000042;
    border-radius: 50%;
    font-size: 12px;
    padding: 2px;
    .icon {
      position: relative;
      top: 1px;
    }
  }
`;

export default function BtnName(props) {
  const { pageId, projectId, btnSetting, btnConfig, setBtnSetting } = props;
  const { name, color, config } = btnSetting;
  const { btnType = 1 } = btnConfig || {};
  const defaultConfig =
    btnType === 2 ? { iconUrl: `${md.global.FileStoreConfig.pubHost}/customIcon/custom_actions.svg` } : {};
  const { icon, iconUrl } = config || defaultConfig;

  const onEditIcon = () => {
    dialogSelectIcon({
      hideInput: true,
      iconColor: color,
      icon,
      projectId,
      workSheetId: pageId,
      onModify: data => {
        const { iconColor, icon, iconUrl } = data;
        setBtnSetting({
          ...btnSetting,
          color: iconColor,
          config: icon && iconUrl ? { ...config, icon, iconUrl } : config,
        });
      },
      onClearIcon:
        btnType === 1
          ? () => {
              setBtnSetting({
                ...btnSetting,
                icon: '',
                config: { ...config, icon: '', iconUrl: '' },
              });
            }
          : undefined,
    });
  };

  return (
    <div className="settingItem">
      <div className="settingTitle">{_l('按钮名称')}</div>
      <Input.Group compact>
        <Input
          value={name}
          style={{ width: 'calc(100% - 80px)' }}
          onChange={e => {
            const name = e.target.value;
            setBtnSetting({ ...btnSetting, name });
          }}
        />
        <ButtonWrap color={color}>
          <Button type="primary" onClick={onEditIcon}>
            <SvgIcon url={iconUrl} fill="#fff" size={22} />
            <div className="arrowWrap valignWrapper">
              <Icon icon="arrow-down-border" />
            </div>
          </Button>
        </ButtonWrap>
      </Input.Group>
    </div>
  );
}

import React, { Fragment, useState } from 'react';
import { Icon } from 'ming-ui';
import { Input, Button, ConfigProvider } from 'antd';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import SvgIcon from 'src/components/SvgIcon';

const ButtonWrap = styled.div`
  .ant-btn, .ant-btn:hover, .ant-btn:focus {
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
  const { btnType = 1  } = btnConfig || {};
  const defaultConfig = btnType === 2 ? { iconUrl: `${md.global.FileStoreConfig.pubHost}/customIcon/custom_actions.svg` } : {};
  const { icon, iconUrl } = config || defaultConfig;

  const [visible, setVisible] = useState(false);

  const onCancel = () => {
    setVisible(false);
  }

  return (
    <div className="settingItem">
      <div className="settingTitle">{_l('按钮名称')}</div>
      <Input.Group compact>
        <Input
          value={name}
          style={{ width: 'calc(100% - 80px)' }}
          onChange={(e) => {
            const name = e.target.value;
            setBtnSetting({ ...btnSetting, name });
          }}
        />
        <Trigger
          action={['click']}
          zIndex={1000}
          popupAlign={{ points: ['tl', 'bl'], offset: [-570, 5], overflow: { adjustX: true, adjustY: true } }}
          popup={(
            <SelectIcon
              hideInput={true}
              iconColor={color}
              workSheetId={pageId}
              projectId={projectId}
              icon={icon}
              className="customPageBtnSelectIcon"
              onModify={(data) => {
                const { iconColor, icon, iconUrl } = data;
                if (iconColor) {
                  setBtnSetting({ ...btnSetting, color: iconColor });
                }
                if (icon || iconUrl) {
                  setBtnSetting({
                    ...btnSetting,
                    config: {
                      ...config,
                      icon,
                      iconUrl,
                    }
                  });
                }
              }}
              onClearIcon={btnType === 1 ? () => {
                setBtnSetting({
                  ...btnSetting,
                  config: {
                    ...config,
                    icon: '',
                    iconUrl: '',
                  }
                });
              } : undefined}
              onClickAway={onCancel}
              onClose={onCancel}
            />
          )}
        >
          <ButtonWrap color={color}>
            <Button type="primary" onClick={() => { setVisible(true); }}>
              <SvgIcon url={iconUrl} fill="#fff" size={22} />
              <div className="arrowWrap valignWrapper"><Icon icon="arrow-down-border"/></div>
            </Button>
          </ButtonWrap>
        </Trigger>
      </Input.Group>
    </div>
  );
}

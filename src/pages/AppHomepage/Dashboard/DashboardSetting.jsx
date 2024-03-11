import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon, Switch, Button, Radio, QiniuUpload, Slider } from 'ming-ui';
import { Drawer, Input } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';
import BulletinSetting from './BulletinSetting';
import projectSettingApi from 'src/api/projectSetting';
import { themeColors } from './utils';

const SettingDrawer = styled(Drawer)`
  .ant-drawer-header {
    border-bottom: none;
    padding: 24px;
  }
  .ant-drawer-header-title {
    flex-direction: row-reverse;
    .ant-drawer-title {
      font-size: 18px !important;
      font-weight: bold !important;
    }
    .ant-drawer-close {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 44px;
      height: 44px;
      border-radius: 3px;
      color: #757575;
      &:hover {
        background: #f8f8f8;
      }
    }
  }
  .ant-drawer-content-wrapper {
    .ant-drawer-body {
      padding: 0 24px;
    }
  }

  .sectionTitle {
    font-size: 15px;
    font-weight: bold;
    color: #000;
  }
`;

const SettingItem = styled.div`
  padding: 18px 0;
  border-bottom: 1px solid #eaeaea;

  .settingHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .titleText {
      font-size: 14px;
      font-weight: bold;
      color: #555;
    }
    .descriptionText {
      margin-top: 4px;
      font-size: 12px;
      color: #a7a7a7;
    }
  }
  .settingRadioGroup {
    display: flex;
    margin-top: 16px;
    .ming.Radio {
      width: 200px;
    }
  }
  .logoBoxBorder {
    height: 40px;
    display: inline-block;
    position: relative;
    cursor: pointer;
    &:hover {
      .logoIconBox {
        display: block;
      }
    }
    .logoIconBox {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      text-align: center;
      line-height: 40px;
      z-index: 2;
    }
    img {
      height: 100%;
    }
  }
  .logoHeightSet {
    display: flex;
    align-items: center;
    margin-top: 16px;
    height: 36px;
    .contentText {
      font-size: 14px;
      color: #555;
    }
  }
  .themeColorWrapper {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    .colorItem {
      display: flex;
      align-items: center;
      width: 28px;
      height: 28px;
      border-radius: 3px;
      cursor: pointer;
      .insideBlock {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 8px;
        height: 20px;
        border-radius: 3px;
        margin-left: 4px;
        transition: width 0.2s ease;
        .icon-done {
          color: #fff;
          font-size: 18px;
        }
      }
      &:hover {
        .insideBlock {
          width: 20px;
        }
      }
      &.isActive {
        .insideBlock {
          width: 20px;
        }
      }
    }
  }
`;

const SloganInput = styled(Input)`
  &.ant-input-affix-wrapper {
    transition: none !important;
    padding: 6px 12px !important;
    &:hover {
      border-color: #1e88e5 !important;
    }
  }
  &.ant-input-affix-wrapper-focused {
    box-shadow: none !important;
    border-color: #1e88e5 !important;
  }
`;

const HeightSlider = styled(Slider)`
  padding: 0;
  input {
    width: 50px;
    margin-left: 2px;
  }
`;

export default function DashboardSetting(props) {
  const {
    currentProject = {},
    platformSetting = {},
    homeSetting = {},
    updatePlatformSetting,
    updateHomeSetting,
    onClose,
  } = props;
  const { slogan, bulletinBoards, color, boardSwitch, logoSwitch, logo, logoHeight } = platformSetting;
  const { markedAppDisplay, displayCommonApp, rowCollect, todoDisplay } = homeSetting;
  const [uploadLoading, setUploadLoading] = useState(false);
  const [bulletinSetVisible, setBulletinSetVisible] = useState(false);
  const [enableSlider, setEnableSlider] = useState(false);

  const isAdmin = currentProject.isSuperAdmin || currentProject.isProjectAdmin;
  const currentColor = !color || !_.includes(themeColors, color) ? '#2196F3' : color;

  const collectRadios = [
    { value: 0, text: _l('显示当前组织') },
    { value: 1, text: _l('显示所有组织') },
  ];

  const todoRadios = [
    { value: 0, text: _l('计数') },
    { value: 1, text: _l('列表') },
  ];

  const updateLogo = logoName => {
    projectSettingApi.setLogo({ logoName, projectId: currentProject.projectId }).then(res => {
      if (res) {
        updatePlatformSetting({ logo: logoName, editingKey: 'logo' });
      }
    });
  };

  return (
    <React.Fragment>
      <SettingDrawer
        visible
        maskStyle={{ backgroundColor: 'transparent' }}
        width={480}
        title={_l('自定义工作台')}
        placement="right"
        afterVisibleChange={visible => setEnableSlider(visible)}
        closeIcon={<i className="icon-close Font24" />}
        onClose={onClose}
      >
        {isAdmin && (
          <div className="mBottom32">
            <div className="sectionTitle">{_l('组织设置')}</div>
            <SettingItem>
              <div className="settingHeader">
                <div className="titleText">Logo</div>
                <Switch
                  size="small"
                  checked={logoSwitch}
                  onClick={() => updatePlatformSetting({ logoSwitch: !logoSwitch })}
                />
              </div>
              <div className="mTop8">
                <div className="logoBoxBorder">
                  <img
                    src={`${md.global.FileStoreConfig.pictureHost}ProjectLogo/${
                      logo || 'emptylogo.png'
                    }?imageView2/2/h/200/q/90`}
                    alt="logo"
                  />
                  <div className="logoIconBox">
                    <QiniuUpload
                      className="w100"
                      options={{
                        multi_selection: false,
                        filters: {
                          mime_types: [{ title: 'image', extensions: 'jpg,jpeg,png,gif' }],
                        },
                        type: 4,
                        max_file_size: '0.5m',
                      }}
                      onUploaded={(up, file, response) => {
                        up.disableBrowse(false);
                        setUploadLoading(false);
                        updateLogo(file.fileName);
                      }}
                      onAdd={(up, files) => {
                        setUploadLoading(true);
                        up.disableBrowse();
                      }}
                      onError={(up, err, errTip) => {
                        alert(errTip, 2);
                      }}
                    >
                      <span className="Font15 icon-upload_pictures"></span>
                    </QiniuUpload>
                  </div>
                </div>
                <div className="Gray_9e Font13 mTop10">{_l('建议尺寸 400*180 px，512 KB以内')}</div>
              </div>

              {logoSwitch && (
                <div className="logoHeightSet">
                  <div className="contentText mRight16">{_l('高度')}</div>
                  <div className="flex">
                    <HeightSlider
                      min={20}
                      max={80}
                      step={1}
                      disabled={!enableSlider}
                      value={logoHeight || 40}
                      liveUpdate={false}
                      onChange={value => {
                        updatePlatformSetting({ logoHeight: Number(value) });
                      }}
                    />
                  </div>
                  <div className="contentText mLeft8">px</div>
                </div>
              )}

              <div className="mTop16">
                <div className="settingHeader">
                  <div className="titleText Normal">{_l('标语')}</div>
                </div>
                <div className="mTop8">
                  <SloganInput
                    showCount={true}
                    maxLength={20}
                    defaultValue={slogan}
                    onBlur={e => updatePlatformSetting({ slogan: e.target.value.trim() })}
                  />
                </div>
              </div>
            </SettingItem>

            <SettingItem>
              <div className="settingHeader">
                <div>
                  <div className="titleText">{_l('宣传栏')}</div>
                  <div className="descriptionText">{_l('可以在宣传栏中添加图片链接，展示组织重要信息')}</div>
                </div>
                <Switch
                  size="small"
                  checked={boardSwitch}
                  onClick={() => updatePlatformSetting({ boardSwitch: !boardSwitch })}
                />
              </div>
              <Button type="ghost" className="mTop16" onClick={() => setBulletinSetVisible(true)}>
                {_l('设置')}
              </Button>
            </SettingItem>

            <SettingItem>
              <div className="settingHeader">
                <div className="titleText">{_l('主题色')}</div>
              </div>
              <div className="themeColorWrapper">
                {themeColors.map(item => {
                  return (
                    <div
                      className={cx('colorItem', { isActive: currentColor === item })}
                      style={{ backgroundColor: getRgbaByColor(item, '0.12') }}
                      onClick={() => {
                        updatePlatformSetting({ color: item });
                      }}
                    >
                      <div className="insideBlock" style={{ backgroundColor: item }}>
                        {currentColor === item && <Icon icon="done" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SettingItem>
          </div>
        )}

        <div className="sectionTitle">{_l('个人设置')}</div>
        <SettingItem>
          <div className="settingHeader">
            <div className="titleText">{_l('流程待办')}</div>
          </div>
          <div className="settingRadioGroup">
            {todoRadios.map((item, i) => (
              <Radio
                key={i}
                {...item}
                size="small"
                checked={todoDisplay === item.value}
                onClick={() => updateHomeSetting({ todoDisplay: item.value })}
              />
            ))}
          </div>
        </SettingItem>
        <SettingItem>
          <div className="settingHeader">
            <div className="titleText">{_l('应用收藏')}</div>
          </div>
          <div className="settingRadioGroup">
            {collectRadios.map((item, i) => (
              <Radio
                key={i}
                {...item}
                size="small"
                checked={markedAppDisplay === item.value}
                onClick={() => updateHomeSetting({ markedAppDisplay: item.value, editingKey: 'markedAppDisplay' })}
              />
            ))}
          </div>
        </SettingItem>

        <SettingItem>
          <div className="settingHeader">
            <div className="titleText">{_l('最近使用')}</div>
            <Switch
              size="small"
              checked={displayCommonApp}
              onClick={() => updateHomeSetting({ displayCommonApp: !displayCommonApp })}
            />
          </div>
        </SettingItem>

        <SettingItem>
          <div className="settingHeader">
            <div className="titleText">{_l('记录收藏')}</div>
            <Switch size="small" checked={rowCollect} onClick={() => updateHomeSetting({ rowCollect: !rowCollect })} />
          </div>
        </SettingItem>
      </SettingDrawer>

      {bulletinSetVisible && (
        <BulletinSetting
          bulletinBoards={bulletinBoards}
          updatePlatformSetting={updatePlatformSetting}
          onClose={() => setBulletinSetVisible(false)}
        />
      )}
    </React.Fragment>
  );
}

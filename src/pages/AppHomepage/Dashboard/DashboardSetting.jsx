import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, QiniuUpload, Slider, SortableList } from 'ming-ui';
import { Button, Drawer, Input, Modal, Radio, Switch } from 'ming-ui/antd-components';
import projectSettingApi from 'src/api/projectSetting';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import { getRgbaByColor } from 'src/utils/platform/theme/color';
import BulletinSetting from './BulletinSetting';
import { DASHBOARD_MODULES, normalizeSortModuleIds, themeColors } from './utils';

const SettingDrawer = styled(({ className, rootClassName, width, height, size, ...props }) => (
  <Drawer
    rootClassName={[className, rootClassName].filter(Boolean).join(' ') || undefined}
    size={size ?? width ?? height}
    {...props}
  />
))`
  .hap-drawer-header {
    padding: 24px;
  }
  .hap-drawer-header-title {
    .hap-drawer-title {
      font-size: 18px !important;
    }
  }
  .hap-drawer-content-wrapper {
    .hap-drawer-body {
      padding: 0 24px 24px;
    }
  }

  .sectionTitle {
    font-size: 15px;
    font-weight: bold;
    color: var(--color-text-primary);
  }
`;

const SettingItem = styled.div`
  padding: 18px 0;
  border-bottom: 1px solid var(--color-border-secondary);

  .settingHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .titleText {
      font-size: 14px;
      font-weight: bold;
      color: var(--color-text-title);
    }
    .descriptionText {
      margin-top: 4px;
      font-size: 12px;
      color: var(--color-text-tertiary);
    }
  }
  .settingRadioGroup {
    display: flex;
    margin-top: 16px;
    .hap-radio-wrapper {
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
      color: var(--color-white);
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
      color: var(--color-text-title);
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
          color: var(--color-white);
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
  &.hap-input-affix-wrapper {
    transition: none !important;
    padding: 6px 12px !important;
    &:hover {
      border-color: var(--color-primary-focus) !important;
    }
  }
  &.hap-input-affix-wrapper-focused {
    box-shadow: none !important;
    border-color: var(--color-primary-focus) !important;
  }
`;

const HeightSlider = styled(Slider)`
  padding: 0;
  input {
    width: 50px;
    margin-left: 2px;
  }
`;

const SortItem = styled.div`
  z-index: 1000;
  background: var(--color-background-primary);
  display: flex;
  align-items: center;
  height: 48px;
  font-size: 14px;
  font-weight: bold;
  border: 1px solid var(--color-border-tertiary);
  border-radius: 3px;
  padding: 0 12px;
  cursor: pointer;
  &:hover {
    border-color: var(--color-primary);
  }
`;

const AdvancedThemeItem = styled.div`
  position: relative;
  cursor: pointer;
  img {
    width: 28px;
    height: 28px;
  }
  .themeMask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;

    i {
      color: var(--color-white);
      font-size: 18px;
    }
  }
`;

const collectRadios = [
  { value: 0, text: _l('显示当前组织') },
  { value: 1, text: _l('显示所有组织') },
];
const todoRadios = [
  { value: 0, text: _l('计数') },
  { value: 1, text: _l('列表') },
];

const renderItem = ({ item }) => {
  return (
    <SortItem>
      <Icon className="mRight8 Font14 textTertiary" icon="drag" />
      <span>{item.text}</span>
    </SortItem>
  );
};

export default function DashboardSetting(props) {
  const {
    currentProject = {},
    platformSetting = {},
    homeSetting = {},
    updatePlatformSetting,
    updateHomeSetting,
    onClose,
    onSetAdvancedTheme,
    currentTheme,
    advancedThemes,
    hasProjectSetting,
    hasBasicSettingAuth,
  } = props;
  const { slogan, bulletinBoards, color, boardSwitch, logoSwitch, logo, logoHeight } = platformSetting;
  const { markedAppDisplay, displayCommonApp, rowCollect, todoDisplay, displayApp, displayChart, sortItems } =
    homeSetting;
  const [bulletinSetVisible, setBulletinSetVisible] = useState(false);
  const [enableSlider, setEnableSlider] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [sortModuleIds, setSortModuleIds] = useState(normalizeSortModuleIds(sortItems));

  const currentColor = _.isEmpty(currentTheme)
    ? !color || !_.includes(themeColors, color)
      ? '#1677ff'
      : color
    : currentTheme.themeKey;

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
        open
        styles={{ mask: { backgroundColor: 'transparent' } }}
        width={480}
        title={_l('自定义工作台')}
        placement="right"
        afterOpenChange={visible => setEnableSlider(visible)}
        closeIcon={<i className="icon-close Font24" />}
        onClose={onClose}
      >
        {hasProjectSetting && (
          <div className="mBottom32">
            <div className="sectionTitle">{_l('组织设置')}</div>
            <SettingItem>
              <div className="settingHeader">
                <div className="titleText">Logo</div>
                <Switch
                  size="small"
                  checked={logoSwitch}
                  onClick={(checked, event) => {
                    event.stopPropagation();
                    return updatePlatformSetting({
                      logoSwitch: !logoSwitch,
                    });
                  }}
                />
              </div>
              <div className="mTop8">
                <div className="logoBoxBorder">
                  <img
                    src={`${md.global.FileStoreConfig.pictureHost}/ProjectLogo/${
                      logo || 'emptylogo.png'
                    }?imageView2/2/h/200/q/90`}
                    alt="logo"
                  />
                  <div
                    className="logoIconBox"
                    onClick={() => {
                      if (!hasBasicSettingAuth) {
                        alert(_l('没有权限，无法上传'), 3);
                        return;
                      }

                      currentProject.licenseType === 0 &&
                        upgradeVersionDialog({
                          projectId: currentProject.projectId,
                          explainText: _l('请升级至付费版解锁开启'),
                          isFree: true,
                        });
                    }}
                  >
                    {currentProject.licenseType === 0 || !hasBasicSettingAuth ? (
                      <span className="Font15 icon-upload_pictures"></span>
                    ) : (
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
                        onUploaded={(up, file) => {
                          up.disableBrowse(false);
                          updateLogo(file.fileName);
                        }}
                        onAdd={up => {
                          up.disableBrowse();
                        }}
                        onError={(up, err, errTip) => {
                          alert(errTip, 2);
                        }}
                      >
                        <span className="Font15 icon-upload_pictures"></span>
                      </QiniuUpload>
                    )}
                  </div>
                </div>
                <div className="textTertiary Font13 mTop10">{_l('建议尺寸 400*180 px，512 KB以内')}</div>
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
                    maxLength={50}
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
                  onClick={(checked, event) => {
                    event.stopPropagation();
                    return updatePlatformSetting({
                      boardSwitch: !boardSwitch,
                    });
                  }}
                />
              </div>
              <Button color="primary" variant="outlined" className="mTop16" onClick={() => setBulletinSetVisible(true)}>
                {_l('设置')}
              </Button>
            </SettingItem>

            <SettingItem>
              <div className="settingHeader">
                <div className="titleText">{_l('主题色')}</div>
              </div>
              <div className="themeColorWrapper">
                {themeColors.map((item, i) => {
                  return (
                    <div
                      key={i}
                      className={cx('colorItem', { isActive: currentColor === item })}
                      style={{ backgroundColor: getRgbaByColor(item, '0.12') }}
                      onClick={() => {
                        updatePlatformSetting({ color: item, advancedSetting: {} });
                      }}
                    >
                      <div className="insideBlock" style={{ backgroundColor: item }}>
                        {currentColor === item && <Icon icon="done" />}
                      </div>
                    </div>
                  );
                })}
                {!window.platformENV.isOverseas &&
                  !window.platformENV.isLocal &&
                  advancedThemes.map((item, i) => (
                    <AdvancedThemeItem
                      key={i}
                      onClick={() => currentColor !== item.themeKey && onSetAdvancedTheme(item)}
                    >
                      <img src={item.themeIcon} />
                      {currentColor === item.themeKey && (
                        <div className="themeMask">
                          <Icon icon="done" />
                        </div>
                      )}
                    </AdvancedThemeItem>
                  ))}
              </div>
            </SettingItem>
          </div>
        )}

        <div className="flexRow alignItemsCenter">
          <div className="sectionTitle flex">{_l('个人设置')}</div>
          <Button color="primary" variant="outlined" onClick={() => setSortVisible(true)}>
            {_l('排序')}
          </Button>
        </div>
        <SettingItem>
          <div className="settingHeader">
            <div className="titleText">{_l('流程待办')}</div>
          </div>
          <div className="settingRadioGroup">
            {todoRadios.map(item => (
              <Radio
                key={item.value}
                value={item.value}
                size="small"
                checked={todoDisplay === item.value}
                onChange={() =>
                  updateHomeSetting({
                    todoDisplay: item.value,
                  })
                }
              >
                {item.text}
              </Radio>
            ))}
          </div>
        </SettingItem>
        <SettingItem>
          <div className="settingHeader">
            <div className="titleText">{_l('应用收藏')}</div>
          </div>
          <div className="settingRadioGroup">
            {collectRadios.map(item => (
              <Radio
                key={item.value}
                value={item.value}
                size="small"
                checked={markedAppDisplay === item.value}
                onChange={() =>
                  updateHomeSetting(
                    {
                      markedAppDisplay: item.value,
                    },
                    'markedAppDisplay',
                  )
                }
              >
                {item.text}
              </Radio>
            ))}
          </div>
        </SettingItem>

        <SettingItem>
          <div className="settingHeader">
            <div className="titleText">{_l('最近使用')}</div>
            <Switch
              size="small"
              checked={displayCommonApp}
              onClick={(checked, event) => {
                event.stopPropagation();
                return updateHomeSetting({
                  displayCommonApp: !displayCommonApp,
                });
              }}
            />
          </div>
        </SettingItem>
        <SettingItem>
          <div className="settingHeader">
            <div className="titleText">{_l('记录收藏')}</div>
            <Switch
              size="small"
              checked={rowCollect}
              onClick={(checked, event) => {
                event.stopPropagation();
                return updateHomeSetting({
                  rowCollect: !rowCollect,
                });
              }}
            />
          </div>
        </SettingItem>
        <SettingItem>
          <div className="settingHeader">
            <div className="titleText">{_l('图表收藏')}</div>
            <Switch
              size="small"
              checked={displayChart}
              onClick={(checked, event) => {
                event.stopPropagation();
                return updateHomeSetting({
                  displayChart: !displayChart,
                });
              }}
            />
          </div>
        </SettingItem>
        <SettingItem>
          <div className="settingHeader">
            <div className="titleText">{_l('应用')}</div>
            <Switch
              size="small"
              checked={displayApp}
              onClick={(checked, event) => {
                event.stopPropagation();
                return updateHomeSetting({
                  displayApp: !displayApp,
                });
              }}
            />
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

      {sortVisible && (
        <Modal
          open
          mask={{ closable: true }}
          keyboard
          width={480}
          title={_l('排序')}
          onCancel={() => setSortVisible(false)}
          onOk={() => {
            const sortItems = sortModuleIds.map(item => ({ moduleType: item }));
            updateHomeSetting({ sortItems });
            setSortVisible(false);
          }}
        >
          <div className="flexColumn mTop16">
            <SortableList
              renderBody
              items={sortModuleIds.map(id => _.find(DASHBOARD_MODULES, { value: id })).filter(Boolean)}
              itemKey="value"
              renderItem={renderItem}
              itemClassName="mBottom16"
              onSortEnd={newItems => {
                const newSortIds = newItems.map(item => item.value);
                setSortModuleIds(newSortIds);
              }}
            />
          </div>
        </Modal>
      )}
    </React.Fragment>
  );
}

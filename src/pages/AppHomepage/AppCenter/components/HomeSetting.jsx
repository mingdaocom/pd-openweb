import React, { useState } from 'react';
import _ from 'lodash';
import { func, shape } from 'prop-types';
import styled from 'styled-components';
import { Drawer, Radio, Switch, Tooltip } from 'ming-ui/antd-components';
import { FlexCenter } from 'worksheet/components/Basics';

const BaseBtnCon = styled(FlexCenter)`
  margin-left: 12px;
  display: inline-flex;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 32px;
  &:hover {
    background: var(--color-background-hover);
  }
`;

const Hr = styled.div`
  border-top: 1px solid var(--color-border-secondary);
`;

const ConfigItem = styled.div`
  padding: 24px 0;
  .switchItem {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .radioItem {
    height: 36px;
    line-height: 36px;
    margin-left: -4px;
    padding-left: 4px;
    cursor: pointer;
    &:hover {
      background: var(--color-background-hover);
    }
  }
`;

const CustomDrawer = styled(({ className, rootClassName, width, height, size, ...props }) => (
  <Drawer
    rootClassName={[className, rootClassName].filter(Boolean).join(' ') || undefined}
    size={size ?? width ?? height}
    {...props}
  />
))`
  .hap-drawer-header {
    padding: 12px 24px;
  }
  .hap-drawer-content-wrapper {
    box-shadow: -8px 8px 24px rgba(0, 0, 0, 0.16) !important;
    .hap-drawer-body {
      padding: 0 24px;
    }
  }
`;

const config = {
  starApp: [
    {
      value: 0,
      text: _l('仅看当前组织'),
    },
    {
      value: 1,
      text: _l('显示所有组织'),
    },
  ],
  starAppGroup: [
    {
      value: 0,
      text: _l('平铺显示'),
    },
    {
      value: 1,
      text: _l('选项卡显示'),
    },
  ],
};

export default function HomeSetting(props) {
  const { setting = {}, onUpdate = _.noop } = props;
  const [customDrawerVisible, setCustomDrawerVisible] = useState(false);

  function handleUpdate(key, value) {
    onUpdate({ ...setting, [key]: value });
  }

  return (
    <React.Fragment>
      <Tooltip title={_l('自定义')} placement="bottom">
        <BaseBtnCon onClick={() => setCustomDrawerVisible(!customDrawerVisible)}>
          <i className="icon-tune Font20 textSecondary"></i>
        </BaseBtnCon>
      </Tooltip>
      <CustomDrawer
        styles={{ mask: { backgroundColor: 'transparent' } }}
        width={360}
        title={_l('自定义')}
        placement="right"
        open={customDrawerVisible}
        closeIcon={<i className="icon-close Font20" />}
        onClose={() => setCustomDrawerVisible(false)}
      >
        {/* <ConfigItem>
          <div className="switchItem">
            <span className="bold">{_l('显示最近使用')}</span>
            <Switch
              size="small"
              checked={setting.displayCommonApp}
              onClick={() => handleUpdate('displayCommonApp', !setting.displayCommonApp)}
            />
          </div>
        </ConfigItem>
        <Hr />

        <ConfigItem>
          <div className="bold mBottom6">{_l('星标应用')}</div>
          {config.starApp.map((item, i) => (
            <div className="radioItem" onClick={() => handleUpdate('markedAppDisplay', item.value)}>
              <Radio value={item.value} size="small" checked={setting.markedAppDisplay === item.value}>
                {item.text}
              </Radio>
            </div>
          ))}
        </ConfigItem>
        <Hr /> */}

        <ConfigItem>
          <div className="bold mBottom6">{_l('星标分组')}</div>
          {config.starAppGroup.map((item, i) => (
            <div key={i} className="radioItem" onClick={() => handleUpdate('displayType', item.value)}>
              <Radio value={item.value} size="small" checked={setting.displayType === item.value}>
                {item.text}
              </Radio>
            </div>
          ))}
        </ConfigItem>

        <Hr />

        <ConfigItem>
          <div className="switchItem">
            <div>
              <div className="bold">{_l('显示组织分组')}</div>
              <div className="textSecondary Font12 mTop5">{_l('在"我的应用"分类中以选项卡显示所有组织分组')}</div>
            </div>
            <Switch
              size="small"
              checked={setting.isAllAndProject}
              onClick={(checked, event) => {
                event.stopPropagation();
                return handleUpdate('isAllAndProject', !setting.isAllAndProject);
              }}
            />
          </div>
        </ConfigItem>
        <Hr />

        <ConfigItem>
          <div className="switchItem">
            <div>
              <div className="bold">{_l('显示外部协作')}</div>
              <div className="textSecondary Font12 mTop5">{_l('我以外协身份加入的其他组织的应用')}</div>
            </div>
            <Switch
              size="small"
              checked={setting.exDisplay}
              onClick={(checked, event) => {
                event.stopPropagation();
                return handleUpdate('exDisplay', !setting.exDisplay);
              }}
            />
          </div>
        </ConfigItem>
      </CustomDrawer>
    </React.Fragment>
  );
}

HomeSetting.propTypes = {
  setting: shape({}),
  onUpdate: func,
};

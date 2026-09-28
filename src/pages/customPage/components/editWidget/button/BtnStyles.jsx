import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { ColorPicker, Icon } from 'ming-ui';
import { Input, InputNumber, Segmented } from 'ming-ui/antd-components';
import { defaultTitleStyles, replaceTitleColor } from 'src/pages/customPage/components/ConfigSideWrap/util';

const Wrap = styled.div`
  .label {
    width: 80px;
  }
  .colorWrap {
    position: relative;
    cursor: pointer;
    margin-right: 10px;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    border: 1px solid var(--color-border-tertiary);
    transition: border 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      border-color: var(--color-primary);
    }
  }
`;

export default props => {
  const { widgetBtnSetting, setSetting, appPkg, config: customPageConfig = {} } = props;
  const { iconColor } = appPkg;
  const { title, explain, config } = widgetBtnSetting;
  const pageTitleStyles = customPageConfig.titleStyles || {};
  const { titleStyles = { ...defaultTitleStyles, textAlign: 'center' } } = config || {};
  const newTitleStyles = pageTitleStyles.index >= titleStyles.index ? pageTitleStyles : titleStyles;
  const { color } = replaceTitleColor(newTitleStyles, iconColor);

  const handleChange = data => {
    setSetting({
      config: {
        ...config,
        titleStyles: {
          ...newTitleStyles,
          ...data,
          index: Date.now(),
        },
      },
    });
  };

  return (
    <Wrap className="settingItem mTop24">
      <div className="settingTitle">{_l('标题与样式')}</div>
      <div className="flexColumn">
        <div className="flexRow alignItemsCenter mBottom12">
          <div className="label">{_l('标题')}</div>
          <div className="flex">
            <Input className="w100" value={title} onChange={e => setSetting({ title: e.target.value })} />
          </div>
        </div>
        <div className="flexRow alignItemsCenter mBottom12">
          <div className="label">{_l('文本')}</div>
          <div className="flex flexRow alignItemsCenter">
            <ColorPicker
              isPopupBody={true}
              sysColor={true}
              themeColor={iconColor}
              value={color}
              onChange={value => {
                const data = { color: value };
                handleChange(data);
              }}
            >
              <div className="colorWrap" style={{ backgroundColor: color }}></div>
            </ColorPicker>
            <InputNumber
              className="mRight10"
              style={{ width: 100 }}
              min={13}
              max={32}
              value={newTitleStyles.fontSize}
              formatter={value => `${value} px`}
              parser={value => (value || '').replace(/\s?px/g, '')}
              onChange={value => {
                if (value === null) return;
                handleChange({ fontSize: value });
              }}
            />
            <div
              className="colorWrap"
              style={{ backgroundColor: 'var(--color-background-input)' }}
              onClick={() => {
                handleChange({
                  fontBold: !newTitleStyles.fontBold,
                });
              }}
            >
              <Icon icon="format_bold" className={cx('Font20 mTop2', { colorPrimary: newTitleStyles.fontBold })} />
            </div>
            <div
              className="colorWrap"
              style={{ backgroundColor: 'var(--color-background-input)' }}
              onClick={() => {
                handleChange({
                  fontItalic: !newTitleStyles.fontItalic,
                });
              }}
            >
              <Icon icon="format_italic" className={cx('Font20 mTop2', { colorPrimary: newTitleStyles.fontItalic })} />
            </div>
          </div>
        </div>
        <div className="flexRow alignItemsCenter mBottom12">
          <div className="label">{_l('说明')}</div>
          <div className="flex">
            <Input className="w100" value={explain} onChange={e => setSetting({ explain: e.target.value })} />
          </div>
        </div>
        <div className="flexRow alignItemsCenter mBottom12">
          <div className="label">{_l('对齐方式')}</div>
          <Segmented
            className="bgDisabled"
            options={[
              { icon: <Icon icon="format_align_left" className="Font18" />, value: 'left' },
              { icon: <Icon icon="format_align_center" className="Font18" />, value: 'center' },
            ]}
            value={newTitleStyles.textAlign}
            onChange={textAlign => handleChange({ textAlign })}
          />
        </div>
      </div>
    </Wrap>
  );
};

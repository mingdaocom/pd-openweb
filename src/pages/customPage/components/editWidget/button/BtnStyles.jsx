import React from 'react';
import cx from 'classnames';
import { Icon, ColorPicker } from 'ming-ui';
import { Input } from 'antd';
import styled from 'styled-components';
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
    border: 1px solid #E0E0E0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pageInput {
    &.ant-input-affix-wrapper {
      padding: 0;
      .ant-input {
        height: 30px;
      }
    }
    &.ant-input-affix-wrapper:hover, &:hover {
      border-color: #2196F3 !important;
    }
    &.ant-input-affix-wrapper, &.ant-input-affix-wrapper-focused, & {
      border-radius: 4px !important;
      box-shadow: none !important;
    }
    .ant-input-suffix {
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0 4px 4px 0;
      border-left: 1px solid #d9d9d9;
      background-color: #fff;
    }
    .icon-expand_less, .icon-expand_more {
      line-height: 10px;
    }
    &.ant-picker-range .ant-picker-input > input {
      font-size: 13px;
    }
  }
  .countInput {
    .disabled {
      color: #ddd;
    }
    .ant-input-suffix {
      width: 38px !important;
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
          index: Date.now()
        }
      }
    });
  }
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
              <div
                className="colorWrap"
                style={{ backgroundColor: color }}
              >
              </div>
            </ColorPicker>
            <Input
              className="pageInput countInput mRight10"
              style={{ width: 100 }}
              value={`${newTitleStyles.fontSize} px`}
              readOnly={true}
              suffix={
                <div className="flexColumn">
                  <Icon
                    icon="expand_less"
                    className={cx('Font20 pointer mBottom2', newTitleStyles.fontSize === 32 ? 'disabled' : 'Gray_9e')}
                    onClick={() => {
                      let value = Number(newTitleStyles.fontSize) + 1;
                      handleChange({
                        fontSize: newTitleStyles.fontSize === 32 ? 32 : value
                      });
                    }}
                  />
                  <Icon
                    icon="expand_more"
                    className={cx('Font20 pointer mBottom2', newTitleStyles.fontSize === 13 ? 'disabled' : 'Gray_9e')}
                    onClick={() => {
                      let value = Number(newTitleStyles.fontSize) - 1;
                      handleChange({
                        fontSize: newTitleStyles.fontSize === 13 ? 13 : value
                      });
                    }}
                  />
                </div>
              }
            />
            <div
              className="colorWrap"
              style={{ backgroundColor: '#fff' }}
              onClick={() => {
                handleChange({
                  fontBold: !newTitleStyles.fontBold
                });
              }}
            >
              <Icon icon="format_bold" className={cx('Font20 mTop2', { ThemeColor: newTitleStyles.fontBold })} />
            </div>
            <div
              className="colorWrap"
              style={{ backgroundColor: '#fff' }}
              onClick={() => {
                handleChange({
                  fontItalic: !newTitleStyles.fontItalic
                });
              }}
            >
              <Icon icon="format_italic" className={cx('Font20 mTop2', { ThemeColor: newTitleStyles.fontItalic })} />
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
          <div className="typeSelect flexRow valignWrapper">
            <div
              className={cx('centerAlign pLeft10 pRight10 pointer Gray_75', { active: newTitleStyles.textAlign === 'left' })}
              onClick={() => {
                handleChange({
                  textAlign: 'left'
                });
              }}
            >
              <Icon icon="format_align_left" className="Font18" />
            </div>
            <div
              className={cx('centerAlign pLeft10 pRight10 pointer Gray_75', { active: newTitleStyles.textAlign === 'center' })}
              onClick={() => {
                handleChange({
                  textAlign: 'center'
                });
              }}
            >
              <Icon icon="format_align_center" className="Font18" />
            </div>
          </div>
        </div>
      </div>
    </Wrap>
  );
}

import React from 'react';
import { Input } from 'antd';
import { defaultTitleStyles, replaceTitleColor } from 'src/pages/customPage/components/ConfigSideWrap/util';

export default props => {
  const { themeColor, currentReport, customPageConfig = {}, onChangeCurrentReport, onChangeStyle } = props;
  const pageTitleStyles = customPageConfig.titleStyles || {};
  const { name, desc, style } = currentReport;
  const { titleStyles = defaultTitleStyles } = style;
  const newTitleStyles = pageTitleStyles.index >= titleStyles.index ? pageTitleStyles : titleStyles;
  // eslint-disable-next-line no-unused-vars
  const { color } = replaceTitleColor(newTitleStyles, themeColor);
  // eslint-disable-next-line no-unused-vars
  const handleChange = data => {
    onChangeStyle({
      titleStyles: {
        ...newTitleStyles,
        ...data,
        index: Date.now(),
      },
    });
  };
  return (
    <div className="mBottom12">
      <div className="mBottom8">{_l('显示标题')}</div>
      <Input
        value={name}
        className="chartInput w100 mBottom12"
        placeholder={_l('添加图表标题')}
        onChange={event => {
          onChangeCurrentReport(
            {
              name: event.target.value,
            },
            false,
          );
        }}
      />
      {/*
      <div className="mBottom8">{_l('文本')}</div>
      <div className="flexRow mBottom12">
        <ColorPicker
          isPopupBody={true}
          sysColor={true}
          themeColor={themeColor}
          value={color}
          onChange={value => {
            const data = { color: value };
            if (newTitleStyles.index) {
              data.index = newTitleStyles.index + 1;
            }
            handleChange(data);
          }}
        >
          <div className="colorWrap pointer">
            <div className="colorBlock" style={{ backgroundColor: color }}></div>
          </div>
        </ColorPicker>
        <Input
          className="chartInput columnCountInput mLeft10"
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
      </div>
      <div className="flexRow mBottom12">
        <div className="colorWrap flexRow pointer mRight10" onClick={() => handleChange({ fontBold: !newTitleStyles.fontBold })}>
          <Icon icon="format_bold" className={cx('Font20 mTop2', { ThemeColor: newTitleStyles.fontBold })} />
        </div>
        <div className="colorWrap flexRow pointer mRight10" onClick={() => handleChange({ fontItalic: !newTitleStyles.fontItalic })}>
          <Icon icon="format_italic" className={cx('Font20 mTop2', { ThemeColor: newTitleStyles.fontItalic })} />
        </div>
        <div className="chartTypeSelect flexRow valignWrapper">
          <div
            className={cx('flex centerAlign pLeft10 pRight10 pointer Gray_75', { active: newTitleStyles.textAlign === 'left' })}
            onClick={() => handleChange({ textAlign: 'left' })}
          >
            <Icon icon="format_align_left" className="Font18" />
          </div>
          <div
            className={cx('flex centerAlign pLeft10 pRight10 pointer Gray_75', { active: newTitleStyles.textAlign === 'center' })}
            onClick={() =>  handleChange({ textAlign: 'center' })}
          >
            <Icon icon="format_align_center" className="Font18" />
          </div>
        </div>
      </div>
      */}
      <div className="mBottom8">{_l('显示说明')}</div>
      <Input.TextArea
        rows={4}
        className="chartInput w100"
        autoSize={{ minRows: 4, maxRows: 6 }}
        placeholder={_l('添加图表描述')}
        value={desc}
        onChange={event => {
          onChangeCurrentReport(
            {
              desc: event.target.value,
            },
            false,
          );
        }}
      />
    </div>
  );
};

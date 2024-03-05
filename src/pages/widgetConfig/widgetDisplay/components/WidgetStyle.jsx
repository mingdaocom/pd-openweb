import React, { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon, Dropdown, Checkbox } from 'ming-ui';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue';
import cx from 'classnames';
import styled from 'styled-components';
import { SettingItem } from '../../styled';
import QuickArrange from './quickArrange';
import './FieldRecycleBin.less';
import img from 'staticfiles/images/colour.png';
import _ from 'lodash';
import { AnimationWrap } from '../../styled';
import StyleSetting from '../../widgetSetting/components/SplitLineConfig/StyleSetting';

const FILL_TYPE = [
  { value: '0', text: _l('填满') },
  { value: '1', text: _l('完整显示') },
];

const ANIMATION_TYPE = [
  { value: '1', text: _l('滚动播放') },
  { value: '2', text: _l('淡入淡出') },
];

export const FILL_COLOR = [
  { value: '3', text: _l('黑色'), color: '#333333' },
  { value: '1', text: _l('白色'), color: '#ffffff' },
  { value: '2', text: _l('灰色'), color: '#F5F5F5' },
  { value: '4', text: _l('模糊图片'), img: img },
];

const AUTO_PLAY = Array.from({ length: 11 }).map((item, index) => ({
  value: `${index}`,
  text: index ? _l('%0秒', index) : _l('关闭'),
}));

const WIDGET_TITLE = [
  { title: _l('PC端'), displayKey: 'titlelayout_pc', widthKey: 'titlewidth_pc', alignKey: 'align_pc', maxWidth: 300 },
  {
    title: _l('移动Web端'),
    displayKey: 'titlelayout_app',
    widthKey: 'titlewidth_app',
    alignKey: 'align_app',
    maxWidth: 200,
  },
];

const TITLE_TYPE = [{ value: '1', text: _l('顶部对齐') }];

const ALIGN_TYPE = [
  { value: '1', text: _l('左对齐') },
  { value: '2', text: _l('右对齐') },
];

const IntroWrap = styled.div`
  .title {
    display: flex;
    align-items: center;
    .icon {
      font-size: 18px;
      color: #757575;
    }
    > span {
      margin-left: 8px;
      font-size: 15px;
      font-weight: 700;
    }
  }
`;

const WidgetStyleWrap = styled.div`
  position: absolute;
  background: #fff;
  top: 0;
  left: 0;
  width: 100%;
  padding: 17px 20px;
  bottom: 0;
  z-index: 9;
  overflow: auto;
  overflow-x: hidden;
`;

const DropItemWrap = styled.div`
  .itemBox {
    width: 18px;
    height: 18px;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    ${props => (props.backgroundColor ? `background: ${props.backgroundColor}` : '')}
    opacity: 1;
    border-radius: 2px;
    margin-right: 10px;
  }
`;

function WidgetStyleSetting(props) {
  const { allControls = [], styleInfo: { info = {} } = {}, handleChange } = props;
  const {
    coverid,
    covertype = '0',
    covercolor = '3',
    coverheight = '600',
    animation = '1',
    autosecond = '3',
    showicon = '1',
    sectionstyle = '0',
    showthumbnail = '1',
  } = info;

  const [tempInfo, setTempInfo] = useState({
    coverHeight: coverheight,
    titlewidth_pc: info.titlewidth_pc || '80',
    titlewidth_app: info.titlewidth_app || '80',
  });

  useEffect(() => {
    setTempInfo({
      coverHeight: coverheight,
      titlewidth_pc: info.titlewidth_pc || '80',
      titlewidth_app: info.titlewidth_app || '80',
    });
  }, [info]);

  const filterControls = allControls.filter(i => i.type === 14).map(i => ({ value: i.controlId, text: i.controlName }));

  const renderShowValue = item => {
    return (
      <DropItemWrap className="flexCenter" backgroundColor={item.color}>
        {item.color ? <div className="itemBox"></div> : <img src={item.img} className="itemBox" />}
        {item.text}
      </DropItemWrap>
    );
  };

  return (
    <WidgetStyleWrap>
      <IntroWrap>
        <div className="title relative">
          <i className="icon Font20 icon-style" />
          <span>{_l('表单样式')}</span>
        </div>
      </IntroWrap>
      <QuickArrange {...props} />
      <SettingItem className="settingItem withSplitLine">
        <div className="settingItemTitle Font14">{_l('字段标题')}</div>
        {WIDGET_TITLE.map(item => {
          return (
            <Fragment>
              <div className="settingItemTitle Normal">{item.title}</div>
              <AnimationWrap className="mBottom16">
                {TITLE_TYPE.map(i => (
                  <div
                    className={cx('animaItem', { active: (info[item.displayKey] || '1') === i.value })}
                    onClick={() => {
                      handleChange({ [item.displayKey]: i.value, [item.alignKey]: '' });
                    }}
                  >
                    {i.text}
                  </div>
                ))}
                {ALIGN_TYPE.map(i => (
                  <div
                    className={cx('animaItem', { active: info[item.alignKey] === i.value })}
                    onClick={() => {
                      handleChange({ [item.alignKey]: i.value, [item.displayKey]: '2' });
                    }}
                  >
                    {i.text}
                  </div>
                ))}
              </AnimationWrap>
              {info[item.displayKey] === '2' && (
                <div className="flexCenter mBottom16">
                  <div className="flex mRight10">
                    <div className="settingItemTitle Normal">{_l('标题宽度')}</div>
                    <div className="labelWrap flexCenter">
                      <InputValue
                        className="mRight12 Width110"
                        type={2}
                        value={(tempInfo[item.widthKey] || '').toString()}
                        onChange={value => {
                          setTempInfo({ ...tempInfo, [item.widthKey]: value });
                        }}
                        onBlur={value => {
                          if (value > item.maxWidth) {
                            value = item.maxWidth;
                          }
                          if (value < 40) {
                            value = 40;
                          }
                          setTempInfo({ ...tempInfo, [item.widthKey]: value });
                          handleChange({ [item.widthKey]: value });
                        }}
                      />
                      <span>px</span>
                    </div>
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </SettingItem>

      <SettingItem className="withSplitLine">
        <div className="settingItemTitle Font14">{_l('分段样式')}</div>
        <StyleSetting sectionstyle={sectionstyle} onChange={value => handleChange({ sectionstyle: value })} />
      </SettingItem>

      <SettingItem className="withSplitLine">
        <div className="settingItemTitle Font14">{_l('标签页样式')}</div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={showicon === '1'}
            onClick={checked => handleChange({ showicon: checked ? '0' : '1' })}
          >
            <span>{_l('显示图标')}</span>
          </Checkbox>
        </div>
      </SettingItem>

      <SettingItem className="withSplitLine">
        <div className="settingItemTitle Font14">{_l('封面')}</div>
        <div className="Gray_9e">{_l('将所选附件字段中的图片、视频作为记录详情封面')}</div>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle Normal">{_l('附件字段')}</div>
        <Dropdown
          border
          cancelAble
          data={filterControls}
          value={coverid}
          onChange={value => handleChange({ coverid: value })}
        />
      </SettingItem>
      <SettingItem>
        <div className="flexCenter">
          <div className="flex">
            <div className="settingItemTitle Normal">{_l('填充方式')}</div>
            <Dropdown
              border
              data={FILL_TYPE}
              value={covertype}
              onChange={value => handleChange({ covertype: value, covercolor: value === '0' ? '' : covercolor || '3' })}
            />
          </div>
          {covertype === '1' && (
            <div className="flex mLeft10">
              <div className="settingItemTitle Normal">{_l('背景色')}</div>
              <Dropdown
                border
                renderTitle={(i = {}) => i.text}
                data={[FILL_COLOR.map(item => ({ text: renderShowValue(item), value: item.value }))]}
                value={covercolor}
                onChange={value => handleChange({ covercolor: value })}
              />
            </div>
          )}
        </div>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle Normal">{_l('高度')}</div>
        <div className="labelWrap flexCenter">
          <InputValue
            className="mRight12 Width110"
            type={2}
            value={(tempInfo.coverHeight || '').toString()}
            onChange={value => {
              setTempInfo({ ...tempInfo, coverHeight: value });
            }}
            onBlur={value => {
              if (value > 1000) {
                value = 1000;
              }
              if (value < 100) {
                value = 100;
              }
              setTempInfo({ ...tempInfo, coverHeight: value });
              handleChange({ coverheight: value });
            }}
          />
          <span>px</span>
        </div>
      </SettingItem>
      <SettingItem>
        <div className="flexCenter">
          <div className="Width200 mRight10">
            <div className="settingItemTitle Normal">{_l('动画效果')}</div>
            <AnimationWrap>
              {ANIMATION_TYPE.map(item => (
                <div
                  className={cx('animaItem', { active: animation === item.value })}
                  onClick={() => {
                    handleChange({ animation: item.value });
                  }}
                >
                  {item.text}
                </div>
              ))}
            </AnimationWrap>
          </div>
          <div className="flex">
            <div className="settingItemTitle Normal">{_l('自动播放')}</div>
            <Dropdown
              border
              data={AUTO_PLAY}
              value={autosecond}
              onChange={value => handleChange({ autosecond: value })}
            />
          </div>
        </div>
      </SettingItem>
      <SettingItem>
        <Checkbox
          size="small"
          checked={showthumbnail === '1'}
          text={_l('显示缩略图')}
          onClick={checked => handleChange({ showthumbnail: checked ? '0' : '1' })}
        />
      </SettingItem>
    </WidgetStyleWrap>
  );
}

export default function WidgetStyle(props) {
  const {
    styleInfo: { activeStatus = false, info = {} } = {},
    setStyleInfo = () => {},
    setActiveWidget = () => {},
    setBatchActive = () => {},
  } = props;

  const handleChange = obj => {
    setStyleInfo({ info: Object.assign({}, info, obj) });
  };

  return (
    <Fragment>
      <div
        className={cx('fieldRecycleBinText', { active: activeStatus })}
        onClick={() => {
          setStyleInfo({ activeStatus: !activeStatus });
          setActiveWidget({});
          setBatchActive([]);
        }}
      >
        <Icon icon="style" />
        <div className="recycle">{_l('表单样式')}</div>
      </div>
      {activeStatus &&
        createPortal(
          <WidgetStyleSetting {...props} handleChange={handleChange} />,
          document.getElementById('widgetConfigSettingWrap'),
        )}
    </Fragment>
  );
}

import React, { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon, Dropdown, Checkbox, Support } from 'ming-ui';
import { getHelpUrl } from 'src/common/helpUrls';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse, Input, Tooltip } from 'antd';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue';
import cx from 'classnames';
import styled from 'styled-components';
import { SettingItem } from '../../styled';
import QuickArrange from './QuickArrange';
import './FieldRecycleBin.less';
import img from 'staticfiles/images/colour.png';
import _ from 'lodash';
import { AnimationWrap, DisplayMode } from '../../styled';
import StyleSetting from '../../widgetSetting/components/SplitLineConfig/StyleSetting';
import { SettingCollapseWrap } from 'src/pages/widgetConfig/widgetSetting/content/styled.js';
import { SectionItem } from '../../widgetSetting/components/SplitLineConfig/style';
import IconSetting from '../../widgetSetting/components/SplitLineConfig/IconSetting';
import { resetWidgets, canSetAsTitle } from '../../util';
import update from 'immutability-helper';
import WidgetWarning from '../../widgetSetting/components/WidgetBase/WidgetWarning';
import { SUPPORT_RELATE_SEARCH } from '../../config';

const { Panel } = Collapse;

const FILL_TYPE = [
  { value: '0', text: _l('填满') },
  { value: '1', text: _l('完整显示') },
];

const ANIMATION_TYPE = [
  { value: '1', text: _l('滚动播放') },
  { value: '2', text: _l('淡入淡出') },
];

const TAB_POSITION_TYPE = [
  { value: '1', text: _l('底部'), img: 'bottom1' },
  { value: '2', text: _l('顶部'), img: 'top' },
  { value: '3', text: _l('左侧'), img: 'left1' },
  // { value: '4', text: _l('右侧') },
];

export const FILL_COLOR = [
  { value: '3', text: _l('黑色'), color: '#151515' },
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

const TITLE_TYPE = [
  { value: '1', text: _l('垂直'), img: 'vertical', key: 'title' },
  { value: '1', text: _l('水平'), img: 'horizontal1' },
  { value: '2', text: _l('右对齐'), img: 'align-right' },
];

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
  .introTitle {
    display: flex;
    align-items: center;
    font-size: 17px;
    font-weight: 700;
  }
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
  const {
    allControls = [],
    styleInfo: { info = {} } = {},
    handleChange,
    globalSheetInfo = {},
    widgets = [],
    setWidgets,
  } = props;
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
    tabposition = '1',
    deftabname = _l('详情'),
    tabicon = '',
    hidetab,
    titlestorage,
  } = info;

  const [expandKeys, setExpandKeys] = useState(['widgetTitle', 'formCover', 'widgetDisplay', 'splitStyle', 'tabStyle']);

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
  const titleControls = allControls
    .filter(a => canSetAsTitle(a))
    .map(a => ({ text: a.controlName, value: a.controlId }));
  const titleControl = _.find(allControls, a => a.attribute === 1);
  // 关联表支持搜索的控件
  const relateSearchUnSupport = controlData => {
    const tempData = controlData || titleControl;
    return tempData && !_.includes(SUPPORT_RELATE_SEARCH, _.get(tempData, 'type'));
  };

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
      <div className="introTitle">{_l('表单样式')}</div>
      <SettingCollapseWrap
        bordered={false}
        activeKey={expandKeys}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        onChange={value => {
          setExpandKeys(value);
        }}
      >
        <Panel header={_l('标题字段')} key="widgetTitle">
          <div className="Gray_9e">
            {_l('标题字段可以快速识别一条记录。用于记录详情、关联记录、和消息通知等功能场景中。')}
          </div>
          <SettingItem>
            <Dropdown
              border
              data={titleControls}
              value={_.get(titleControl, 'controlId')}
              onChange={value => {
                const selectControl = _.find(allControls, t => t.controlId === value);
                if (selectControl) {
                  const newWidgets = resetWidgets(widgets, { attribute: 0 });
                  setWidgets(
                    update(newWidgets, {
                      [selectControl.row]: { [selectControl.col]: { $apply: item => ({ ...item, attribute: 1 }) } },
                    }),
                  );
                  if (relateSearchUnSupport(selectControl)) {
                    handleChange({ titlestorage: '0' });
                  }
                }
              }}
            />
            <div className="labelWrap mTop16">
              <Checkbox
                size="small"
                disabled={titlestorage === '0' && relateSearchUnSupport()}
                checked={titlestorage !== '0'}
                onClick={checked => handleChange({ titlestorage: checked ? '0' : '1' })}
              >
                <span style={{ marginRight: '4px', paddingTop: '2px' }} className="Gray">
                  {_l('在关联表中可以被搜索')}
                </span>
                <Tooltip
                  popupPlacement="bottom"
                  title={
                    <span>
                      {_l(
                        '当其他工作表关联本表记录时（关联单条)，可搜索关联记录标题。如：订单关联了客户，可在订单表中搜索客户名称来查询订单。',
                      )}
                      <br />
                      {_l(
                        '- 此功能会在工作表冗余存储关联记录标题，当标题内容频繁变更或不需要此功能时建议不勾选，避免性能浪费。',
                      )}
                      <br />
                      {_l('- 仅文本类型字段作为标题时支持此功能')}
                      <Support
                        type={3}
                        href={getHelpUrl('worksheet', 'fieldPropertyAlias')}
                        text={_l('【点击了解更多】')}
                      />
                    </span>
                  }
                >
                  <i className="icon-help Gray_9e Font16 Hand"></i>
                </Tooltip>
              </Checkbox>
            </div>
            {relateSearchUnSupport() && (
              <Fragment>
                {titlestorage === '0' ? (
                  <div className="Gray_9e pLeft24" style={{ paddingLeft: '22px' }}>
                    {_l('当前字段类型不支持此功能')}
                  </div>
                ) : (
                  <WidgetWarning type="widgetStyle" />
                )}
              </Fragment>
            )}
          </SettingItem>
        </Panel>
        <Panel header={_l('表单封面')} key="formCover">
          <div className="Gray_9e">{_l('将所选附件字段中的图片、视频作为封面，显示在记录详情上方。')}</div>
          <SettingItem>
            <Dropdown
              border
              cancelAble
              data={filterControls}
              value={coverid}
              onChange={value => handleChange({ coverid: value })}
            />
          </SettingItem>
          {coverid && (
            <Fragment>
              <SettingItem>
                <div className="flexCenter">
                  <div className="flex">
                    <div className="settingItemTitle">{_l('填充方式')}</div>
                    <Dropdown
                      border
                      data={FILL_TYPE}
                      value={covertype}
                      onChange={value =>
                        handleChange({ covertype: value, covercolor: value === '0' ? '' : covercolor || '3' })
                      }
                    />
                  </div>
                  {covertype === '1' && (
                    <div className="flex mLeft10">
                      <div className="settingItemTitle">{_l('背景色')}</div>
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
                <div className="settingItemTitle">{_l('高度')}</div>
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
                    <div className="settingItemTitle">{_l('动画效果')}</div>
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
                    <div className="settingItemTitle">{_l('自动播放')}</div>
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
            </Fragment>
          )}
        </Panel>
        <Panel header={_l('字段布局')} key="widgetDisplay">
          <QuickArrange {...props} />
          <SettingItem>
            <div className="settingItemTitle">{_l('字段名称位置')}</div>
            {WIDGET_TITLE.map(item => {
              return (
                <SettingItem>
                  <div className="settingItemTitle Normal">{item.title}</div>
                  <DisplayMode>
                    {TITLE_TYPE.map(i => {
                      const active =
                        (i.key === 'title' ? info[item.displayKey] || '1' : info[item.alignKey]) === i.value;
                      return (
                        <div
                          className={cx('displayItem', { active: active })}
                          onClick={() => {
                            if (i.key === 'title') {
                              handleChange({ [item.displayKey]: i.value, [item.alignKey]: '' });
                            } else {
                              handleChange({ [item.alignKey]: i.value, [item.displayKey]: '2' });
                            }
                          }}
                        >
                          <div className="mBottom4">
                            <Icon icon={i.img} className="Font28" />
                          </div>
                          <span className="text">{i.text}</span>
                        </div>
                      );
                    })}
                  </DisplayMode>
                  {info[item.displayKey] === '2' && (
                    <div className="flexCenter mTop10">
                      <div className="settingItemTitle mBottom0 Normal">{_l('名称宽度')}</div>
                      <InputValue
                        className="mLeft12 mRight12 Width110"
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
                  )}
                </SettingItem>
              );
            })}
          </SettingItem>
        </Panel>
        <Panel header={_l('分段样式')} key="splitStyle">
          <StyleSetting sectionstyle={sectionstyle} onChange={value => handleChange({ sectionstyle: value })} />
        </Panel>
        <Panel header={_l('标签页')} key="tabStyle">
          <SettingItem className="mTop0">
            <div className="settingItemTitle">{_l('标签页位置')}</div>
            <div className="Gray_9e mBottom8">
              {_l('标签页显示在顶部、左侧时，默认分组作为第一个标签页。移动端始终在顶部。')}
            </div>
            <DisplayMode>
              {TAB_POSITION_TYPE.map(item => (
                <div
                  className={cx('displayItem', { active: tabposition === item.value })}
                  onClick={() => {
                    handleChange({ tabposition: item.value });
                  }}
                >
                  <div className="mBottom4">
                    <Icon icon={item.img} className="Font28" />
                  </div>
                  <span className="text">{item.text}</span>
                </div>
              ))}
            </DisplayMode>
          </SettingItem>
          <SettingItem className="mTop12">
            <div className="settingItemTitle">{_l('默认分组名称')}</div>
            <SectionItem>
              <div className="label">{_l('名称')}</div>
              <Input
                value={deftabname}
                className="flex"
                onChange={e => handleChange({ deftabname: e.target.value.trim() })}
              />
            </SectionItem>

            <SectionItem>
              <div className="label">{_l('图标')}</div>
              <IconSetting
                type={52}
                icon={tabicon}
                iconColor="#9e9e9e"
                projectId={globalSheetInfo.projectId}
                handleClick={value => handleChange({ tabicon: value ? JSON.stringify(value) : '' })}
              />
            </SectionItem>
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">{_l('其他')}</div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={showicon !== '1'}
                onClick={checked => handleChange({ showicon: checked ? '1' : '0' })}
              >
                <span>{_l('隐藏标签页图标')}</span>
              </Checkbox>
            </div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={hidetab === '1'}
                onClick={checked => handleChange({ hidetab: checked ? '0' : '1' })}
              >
                <span style={{ marginRight: '4px' }}>{_l('当只有一个标签页时隐藏')}</span>
                <Tooltip placement="bottom" title={_l('勾选后，当只有一个标签页时隐藏此标签页标题。直接显示内部内容')}>
                  <i className="icon-help Gray_9e Font16 Hand"></i>
                </Tooltip>
              </Checkbox>
            </div>
          </SettingItem>
        </Panel>
      </SettingCollapseWrap>
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
        <Icon icon="design-services" />
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

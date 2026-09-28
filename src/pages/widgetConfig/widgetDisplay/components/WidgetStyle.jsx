import React, { Fragment, useState } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import cx from 'classnames';
import update from 'immutability-helper';
import _ from 'lodash';
import img from 'staticfiles/images/colour.png';
import styled from 'styled-components';
import { Icon, Support } from 'ming-ui';
import { Checkbox, Input, Segmented, Select, Tooltip } from 'ming-ui/antd-components';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue';
import { SettingCollapseWrap } from 'src/pages/widgetConfig/widgetSetting/content/styled.js';
import { SUPPORT_RELATE_SEARCH } from 'src/utils/domain/control/config';
import { resetWidgets } from 'src/utils/domain/control/editorLayout';
import { canSetAsTitle } from 'src/utils/domain/control/metadata';
import { DisplayMode, SettingItem } from '../../styled';
import IconSetting from '../../widgetSetting/components/SplitLineConfig/IconSetting';
import { SectionItem } from '../../widgetSetting/components/SplitLineConfig/style';
import StyleSetting from '../../widgetSetting/components/SplitLineConfig/StyleSetting';
import WidgetWarning from '../../widgetSetting/components/WidgetBase/WidgetWarning';
import QuickArrange from './QuickArrange';
import './FieldRecycleBin.less';

const FILL_TYPE = [
  { value: '0', label: _l('填满') },
  { value: '1', label: _l('完整显示') },
];

const getAnimationTypeOptions = () => [
  { value: '1', label: _l('滚动播放') },
  { value: '2', label: _l('淡入淡出') },
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
  label: index ? _l('%0秒', index) : _l('关闭'),
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

const COLOR_PREVIEW_STYLE = {
  width: 18,
  height: 18,
  boxShadow: 'var(--shadow-lg)',
  borderRadius: 2,
  marginRight: 10,
};

const getTempInfo = info => ({
  coverHeight: info.coverheight ?? '600',
  titlewidth_pc: info.titlewidth_pc || '80',
  titlewidth_app: info.titlewidth_app || '80',
});

const IconWrap = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  cursor: pointer;
  color: ${props => (props.$isActive ? 'var(--color-text-secondary)' : 'var(--color-text-disabled)')};
  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

export function FixedIcon(props) {
  const { fixedKey, setPanelFixed } = props;
  const value = props[fixedKey];
  return (
    <Tooltip title={value ? _l('取消固定') : _l('固定')} placement="bottom">
      <IconWrap $isActive={value} onClick={() => setPanelFixed(fixedKey)}>
        <Icon icon="folder-top" className="Font18" />
      </IconWrap>
    </Tooltip>
  );
}

export function CloseIcon(props) {
  return (
    <IconWrap className="closeIcon" onClick={() => props.onClose()} $isActive={true}>
      <Icon icon="close" className="Font16" />
    </IconWrap>
  );
}

const renderShowValue = item => {
  return (
    <span className="flexRow alignItemsCenter">
      {item.color ? (
        <span style={{ ...COLOR_PREVIEW_STYLE, backgroundColor: item.color }} />
      ) : (
        <img src={item.img} style={COLOR_PREVIEW_STYLE} alt="" />
      )}
      {item.text}
    </span>
  );
};

const FILL_COLOR_OPTIONS = FILL_COLOR.map(item => ({ value: item.value, label: renderShowValue(item) }));

export function WidgetStyleSetting(props) {
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

  const [tempInfoState, setTempInfoState] = useState(() => ({ source: info, value: getTempInfo(info) }));
  const tempInfo = tempInfoState.source === info ? tempInfoState.value : getTempInfo(info);
  const setTempInfo = value => setTempInfoState({ source: info, value });

  const filterControls = allControls
    .filter(i => i.type === 14)
    .map(i => ({ value: i.controlId, label: i.controlName }));
  const titleControls = allControls
    .filter(a => canSetAsTitle(a))
    .map(a => ({ label: a.controlName, value: a.controlId }));
  const titleControl = _.find(allControls, a => a.attribute === 1);

  // 关联表支持搜索的控件
  const relateSearchUnSupport = controlData => {
    const tempData = controlData || titleControl;
    return tempData && !_.includes(SUPPORT_RELATE_SEARCH, _.get(tempData, 'type'));
  };

  return (
    <Fragment>
      <SettingCollapseWrap
        bordered={false}
        activeKey={expandKeys}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        items={[
          {
            key: 'widgetTitle',
            label: _l('标题字段'),
            children: (
              <Fragment>
                <div className="textTertiary">
                  {_l('标题字段可以快速识别一条记录。用于记录详情、关联记录、和消息通知等功能场景中。')}
                </div>
                <SettingItem>
                  <Select
                    className="w100"
                    options={titleControls}
                    value={_.get(titleControl, 'controlId')}
                    placeholder={_l('请选择')}
                    onChange={value => {
                      const selectControl = _.find(allControls, t => t.controlId === value);

                      if (selectControl) {
                        const newWidgets = resetWidgets(widgets, { attribute: 0 });
                        setWidgets(
                          update(newWidgets, {
                            [selectControl.row]: {
                              [selectControl.col]: { $apply: item => ({ ...item, attribute: 1 }) },
                            },
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
                      disabled={titlestorage === '0' && relateSearchUnSupport()}
                      checked={titlestorage !== '0'}
                      onChange={event =>
                        handleChange({
                          titlestorage: !event.target.checked ? '0' : '1',
                        })
                      }
                      size="small"
                    >
                      <span style={{ marginRight: '4px', paddingTop: '2px' }} className="textPrimary">
                        {_l('在关联表中可以被搜索')}
                      </span>
                      <Tooltip
                        placement="bottom"
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
                              href="https://help.mingdao.com/worksheet/title-field"
                              text={_l('【点击了解更多】')}
                            />
                          </span>
                        }
                      >
                        <i className="icon-help textTertiary Font16 Hand"></i>
                      </Tooltip>
                    </Checkbox>
                  </div>
                  {relateSearchUnSupport() && (
                    <Fragment>
                      {titlestorage === '0' ? (
                        <div className="textTertiary pLeft24" style={{ paddingLeft: '22px' }}>
                          {_l('当前字段类型不支持此功能')}
                        </div>
                      ) : (
                        <WidgetWarning type="widgetStyle" />
                      )}
                    </Fragment>
                  )}
                </SettingItem>
              </Fragment>
            ),
          },
          {
            key: 'formCover',
            label: _l('表单封面'),
            children: (
              <Fragment>
                <div className="textTertiary">{_l('将所选附件字段中的图片、视频作为封面，显示在记录详情上方。')}</div>
                <SettingItem>
                  <Select
                    className="w100"
                    allowClear
                    options={filterControls}
                    value={coverid || undefined}
                    placeholder={_l('请选择')}
                    onChange={value => handleChange({ coverid: value })}
                  />
                </SettingItem>
                {coverid && (
                  <Fragment>
                    <SettingItem>
                      <div className="flexCenter">
                        <div className="flex">
                          <div className="settingItemTitle">{_l('填充方式')}</div>
                          <Select
                            className="w100"
                            options={FILL_TYPE}
                            value={covertype}
                            onChange={value =>
                              handleChange({ covertype: value, covercolor: value === '0' ? '' : covercolor || '3' })
                            }
                          />
                        </div>
                        {covertype === '1' && (
                          <div className="flex mLeft10">
                            <div className="settingItemTitle">{_l('背景色')}</div>
                            <Select
                              className="w100"
                              options={FILL_COLOR_OPTIONS}
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
                          <Segmented
                            block
                            value={animation}
                            options={getAnimationTypeOptions()}
                            onChange={value => handleChange({ animation: value })}
                          />
                        </div>
                        <div className="flex">
                          <div className="settingItemTitle">{_l('自动播放')}</div>
                          <Select
                            className="w100"
                            options={AUTO_PLAY}
                            value={autosecond}
                            onChange={value => handleChange({ autosecond: value })}
                          />
                        </div>
                      </div>
                    </SettingItem>
                    <SettingItem>
                      <Checkbox
                        checked={showthumbnail === '1'}
                        onChange={event =>
                          handleChange({
                            showthumbnail: !event.target.checked ? '0' : '1',
                          })
                        }
                        size="small"
                      >
                        {_l('显示缩略图')}
                      </Checkbox>
                    </SettingItem>
                  </Fragment>
                )}
              </Fragment>
            ),
          },
          {
            key: 'widgetDisplay',
            label: _l('字段布局'),
            children: (
              <Fragment>
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
              </Fragment>
            ),
          },
          {
            key: 'splitStyle',
            label: _l('分段样式'),
            children: (
              <StyleSetting sectionstyle={sectionstyle} onChange={value => handleChange({ sectionstyle: value })} />
            ),
          },
          {
            key: 'tabStyle',
            label: _l('标签页'),
            children: (
              <Fragment>
                <SettingItem className="mTop0">
                  <div className="settingItemTitle">{_l('标签页位置')}</div>
                  <div className="textTertiary mBottom8">
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
                      onChange={e => handleChange({ deftabname: e.target.value })}
                    />
                  </SectionItem>

                  <SectionItem>
                    <div className="label">{_l('图标')}</div>
                    <IconSetting
                      type={52}
                      icon={tabicon}
                      iconColor="var(--color-text-tertiary)"
                      projectId={globalSheetInfo.projectId}
                      handleClick={value => handleChange({ tabicon: value ? JSON.stringify(value) : '' })}
                    />
                  </SectionItem>
                </SettingItem>
                <SettingItem>
                  <div className="settingItemTitle">{_l('其他')}</div>
                  <div className="labelWrap">
                    <Checkbox
                      checked={showicon !== '1'}
                      onChange={event =>
                        handleChange({
                          showicon: !event.target.checked ? '1' : '0',
                        })
                      }
                      size="small"
                    >
                      <span>{_l('隐藏标签页图标')}</span>
                    </Checkbox>
                  </div>
                  <div className="labelWrap">
                    <Checkbox
                      checked={hidetab === '1'}
                      onChange={event =>
                        handleChange({
                          hidetab: !event.target.checked ? '0' : '1',
                        })
                      }
                      size="small"
                    >
                      <span style={{ marginRight: '4px' }}>{_l('当只有一个标签页时隐藏')}</span>
                      <Tooltip
                        placement="bottom"
                        title={_l('勾选后，当只有一个标签页时隐藏此标签页标题。直接显示内部内容')}
                      >
                        <i className="icon-help textTertiary Font16 Hand"></i>
                      </Tooltip>
                    </Checkbox>
                  </div>
                </SettingItem>
              </Fragment>
            ),
          },
        ]}
        onChange={value => {
          setExpandKeys(value);
        }}
      />
    </Fragment>
  );
}

export function WidgetStyle(props) {
  const {
    styleInfo: { activeStatus = false } = {},
    setPanelVisible = () => {},
    setStyleInfo = () => {},
    setActiveWidget = () => {},
    setBatchActive = () => {},
  } = props;

  return (
    <Fragment>
      <div
        className={cx('fieldRecycleBinText', { active: activeStatus })}
        onClick={() => {
          setStyleInfo({ activeStatus: !activeStatus });
          setActiveWidget({});
          setBatchActive([]);
          setPanelVisible({ settingVisible: !activeStatus });
        }}
      >
        <Icon icon="design-services" />
        <div className="recycle">{_l('表单样式')}</div>
      </div>
    </Fragment>
  );
}

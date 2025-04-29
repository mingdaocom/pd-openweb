import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ClipboardButton from 'react-clipboard.js';
import { Drawer } from 'antd';
import cx from 'classnames';
import update from 'immutability-helper';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Checkbox, Dialog, Dropdown, Radio, Tabs } from 'ming-ui';
import { H1, H3, Hr, Tip75, Tipbd, TipBlock } from 'worksheet/components/Basics';
import AddControlDialog from '../../components/AddControlDialog';
import SourceKeys from '../../components/SourceKeys';
import {
  BUTTON_POSITION_OPTIONS,
  DISPLAY_CONTENT_OPTIONS,
  FILL_OBJECT_OPTIONS,
  PUBLISH_CONFIG_TABS,
  TIME_PERIOD_TYPE,
  TIME_TYPE,
  WECHAT_FIELD_KEY,
} from '../../enum';
import * as actions from '../../redux/actions';
import AbilityExpandSettings from './AbilityExpandSettings';
import DataCollectionSettings from './DataCollectionSettings';
import FillSettings from './FillSettings';
import ReceiptSettings from './ReceiptSettings';
import SectionTitle from './SectionTitle';
import WeChatEnhance from './WeChatEnhance';
import WeChatSettings from './WeChatSettings';

const NewDropdown = styled(Dropdown)`
  width: 250px;
  .ming.Menu.List {
    width: 250px;
  }
`;
const AddControl = styled.div`
  :hover {
    color: #fff !important;
  }
  :hover .icon {
    color: #fff !important;
  }
`;

const DEFAULT_TEXT = {
  ipControlId: _l('IP地址'),
  browserControlId: _l('浏览器'),
  deviceControlId: _l('设备'),
  systemControlId: _l('系统'),
  extendSourceId: _l('扩展值'),
};
class PublicConfig extends React.Component {
  static propTypes = {
    originalControls: PropTypes.arrayOf(PropTypes.shape({})),
    worksheetSettings: PropTypes.shape({}),
    shareUrl: PropTypes.string,
    onClose: PropTypes.func,
    addWorksheetControl: PropTypes.func,
    updateSettings: PropTypes.func,
    refreshShareUrl: PropTypes.func,
    hideControl: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const settings = props.worksheetSettings;
    this.cacheSettings = props.worksheetSettings;
    this.state = {
      addControlVisible: false,
      activeTab: 1,
      sourceKeys: settings.extends || [],
      isEditing: false,
      daySelectPopupVisible: false,
      mappingDialogVisible: false,
      confirmDialog: { visible: false },
      fieldSearchKeyWords: '',
      weChatBind: { isBind: false },
      titleFolded: {
        writeScope: false,
        dataCollect: false,
        fillSetting: false,
        weChatSetting: false,
        abilityExpand: false,
        receipt: false,
      },
      ..._.pick(settings, [
        'ipControlId',
        'browserControlId',
        'deviceControlId',
        'systemControlId',
        'receipt',
        'needCaptcha',
        'smsVerificationFiled',
        'extendSourceId',
        'smsVerification',
        'writeScope',
        'linkSwitchTime',
        'limitWriteTime',
        'limitWriteCount',
        'limitPasswordWrite',
        'cacheDraft',
        'cacheFieldData',
        'weChatSetting',
        'abilityExpand',
        'extendDatas',
      ]),
      smsSignature: settings.smsSignature || '',
      timeRange: this.getTimeRange(settings),
      settingChanged: false,
      limitWriteFrequencySetting:
        _.get(settings, 'limitWriteFrequencySetting.isEnable') &&
        _.get(settings, 'limitWriteFrequencySetting.limitRangType') === 0
          ? { ...settings.limitWriteFrequencySetting, limitRangType: 1 }
          : settings.limitWriteFrequencySetting,
      displayContent: [1, 2, 3, 4],
      buttonPosition: 'center',
    };
  }

  getTimeRange = settings => {
    const { monthSetting = {}, daySetting = {}, hourSetting = {} } = _.get(settings, 'limitWriteTime');
    const { defineMonth = [], monthType } = monthSetting;
    const { defineDay = [], dayType } = daySetting;
    const { rangHour = [], hourType } = hourSetting;

    const timeRange = {
      month:
        monthType === TIME_PERIOD_TYPE.SPECIFY_RANGE_MONTH
          ? { start: defineMonth[0], end: defineMonth[defineMonth.length - 1] }
          : { start: null, end: null },
      day:
        dayType === TIME_PERIOD_TYPE.SPECIFY_RANGE_DAY
          ? { start: defineDay[0], end: defineDay[defineDay.length - 1] }
          : { start: null, end: null },
      hour:
        hourType === TIME_PERIOD_TYPE.SPECIFY_RANGE_HOUR
          ? rangHour.map(item => {
              return { start: item.split('-')[0], end: item.split('-')[1] };
            })
          : [{ start: null, end: null }],
    };
    return timeRange;
  };

  resetInitState = () => {
    const settings = this.cacheSettings;
    this.setState({
      ..._.pick(settings, [
        'limitWriteFrequencySetting',
        'receipt',
        'needCaptcha',
        'smsVerificationFiled',
        'smsVerification',
        'writeScope',
        'linkSwitchTime',
        'limitWriteTime',
        'limitWriteCount',
        'limitPasswordWrite',
        'cacheDraft',
        'cacheFieldData',
        'weChatSetting',
        'abilityExpand',
      ]),
      smsSignature: settings.smsSignature || '',
      timeRange: this.getTimeRange(settings),
    });
  };

  getChangedIds() {
    const { worksheetSettings } = this.props;
    const { ipControlId, browserControlId, deviceControlId, systemControlId, extendSourceId } = this.state;
    const oldIds = _.uniqBy(
      [
        worksheetSettings.ipControlId,
        worksheetSettings.browserControlId,
        worksheetSettings.deviceControlId,
        worksheetSettings.systemControlId,
        worksheetSettings.extendSourceId,
      ].filter(_.identity),
    );
    return oldIds.filter(
      id => [ipControlId, browserControlId, deviceControlId, systemControlId, extendSourceId].indexOf(id) < 0,
    );
  }

  validateConfigData = () => {
    const { originalControls = [] } = this.props;
    const {
      linkSwitchTime,
      limitWriteTime,
      timeRange,
      limitWriteCount,
      limitWriteFrequencySetting,
      limitPasswordWrite,
      cacheFieldData,
      weChatSetting,
      abilityExpand,
      extendDatas,
      activeTab,
      weChatBind,
    } = this.state;

    //开启"设置链接开启/停止时间",未设置时间
    if (linkSwitchTime.isEnable) {
      if (!linkSwitchTime.startTime || linkSwitchTime.startTime.substr(0, 4) === '0001') {
        alert(_l('已开启链接时间设置，但未选择开始/停止时间'), 3);
        return false;
      }
    }
    //填写时段校验
    if (limitWriteTime.isEnable) {
      const monthType = limitWriteTime.monthSetting.monthType;
      const dayType = limitWriteTime.daySetting.dayType;
      const hourType = limitWriteTime.hourSetting.hourType;

      if (monthType !== TIME_PERIOD_TYPE.MONTHLY) {
        if (_.isEmpty(limitWriteTime.monthSetting.defineMonth)) {
          alert(
            monthType === TIME_PERIOD_TYPE.SPECIFY_RANGE_MONTH ? _l('请完整填写月份指定范围') : _l('请选择指定月份'),
            3,
          );
          return false;
        }
      }

      if (dayType !== TIME_PERIOD_TYPE.DAILY) {
        if (dayType === TIME_PERIOD_TYPE.WEEKLY) {
          if (_.isEmpty(limitWriteTime.daySetting.defineWeek)) {
            alert(_l('请选择指定星期'), 3);
            return false;
          }
        } else {
          if (_.isEmpty(limitWriteTime.daySetting.defineDay)) {
            alert(
              dayType === TIME_PERIOD_TYPE.SPECIFY_RANGE_DAY ? _l('请完整填写日期指定范围') : _l('请选择指定日期'),
              3,
            );
            return false;
          }
        }
      }

      if (hourType === TIME_PERIOD_TYPE.SPECIFY_RANGE_HOUR) {
        const isNoValidRange = timeRange[TIME_TYPE.HOUR].filter(item => item.start && item.end).length === 0;
        if (isNoValidRange) {
          alert(_l('请至少完整填写一个时间指定范围'), 3);
          return false;
        } else {
          const rangeHour = timeRange[TIME_TYPE.HOUR]
            .filter(item => item.start && item.end)
            .map(item => `${item.start}-${item.end}`);
          const newLimitWriteTime = limitWriteTime;
          newLimitWriteTime.hourSetting.rangHour = rangeHour;
          this.setState({ limitWriteTime: newLimitWriteTime });
        }
      }
    }

    //数量上限设置校验
    if (limitWriteCount.isEnable) {
      if (!limitWriteCount.limitWriteCount) {
        alert(_l('请填写收集数量上限'), 3);
        return false;
      }
    }

    //填写次数校验
    if (limitWriteFrequencySetting.isEnable) {
      if (!limitWriteFrequencySetting.limitWriteCount) {
        alert(_l('请填写限制次数'), 3);
        return false;
      }
    }

    //密码设置校验
    if (limitPasswordWrite.isEnable) {
      if (!limitPasswordWrite.limitPasswordWrite) {
        alert(_l('已开启凭密码填写，请设置密码'), 3);
        return false;
      }
      if (!/^\w{4,8}$/.test(limitPasswordWrite.limitPasswordWrite)) {
        alert(_l('密码必须为4-8位的英文或数字'), 3);
        return false;
      }
    }

    //缓存设置校验
    if (cacheFieldData.isEnable) {
      const cacheFieldArr = cacheFieldData.cacheField || [];
      const selectedCount = originalControls.filter(item => _.includes(cacheFieldArr, item.controlId)).length;
      if (!cacheFieldArr.length || !selectedCount) {
        alert(_l('已开启本地填写数据缓存，请选择需要缓存的字段'), 3);
        return false;
      }
    }

    //微信设置校验
    if (weChatSetting.isCollectWxInfo && activeTab === 2) {
      if (_.isEmpty(weChatSetting.fieldMaps) || !weChatSetting.fieldMaps[WECHAT_FIELD_KEY.OPEN_ID]) {
        alert(_l('微信OpenID不能为空'), 3);
        return false;
      }
      if (weChatSetting.collectChannel === 2 && !weChatBind.isBind) {
        alert(_l('微信登录必须绑定微信服务号'), 2);
        return false;
      }
    }

    //功能增强校验
    if (abilityExpand.autoFillField.isAutoFillField) {
      const autoFillFieldArr = abilityExpand.autoFillField.autoFillFields || [];
      const selectedCount = originalControls.filter(item => _.includes(autoFillFieldArr, item.controlId)).length;
      if (!autoFillFieldArr.length || !selectedCount) {
        alert(_l('请选择自动填充字段'), 3);
        return false;
      }
    }

    if (abilityExpand.allowViewChange.isAllowViewChange && abilityExpand.allowViewChange.changeSetting) {
      if (
        abilityExpand.allowViewChange.changeSetting.changeType === 2 &&
        !abilityExpand.allowViewChange.changeSetting.expireTime
      ) {
        alert(_l('请填写修改时效'), 3);
        return false;
      }
    }

    // 微信分享卡片消息
    const shareConfig = safeParse(_.get(extendDatas, 'shareConfig'));
    if (!shareConfig.title) {
      alert(_l('请填写分享标题'), 3);
      return false;
    }

    const afterSubmit = safeParse(_.get(extendDatas, 'afterSubmit'));
    if (afterSubmit.action === 2 && !afterSubmit.content) {
      alert(_l('请填写跳转链接'), 3);
      return false;
    }

    return true;
  };

  saveSetting = (cb = () => {}) => {
    const {
      limitWriteFrequencySetting,
      ipControlId,
      browserControlId,
      deviceControlId,
      systemControlId,
      receipt,
      extendSourceId,
      sourceKeys,
      needCaptcha,
      smsVerification,
      smsVerificationFiled,
      smsSignature,
      writeScope,
      linkSwitchTime,
      limitWriteTime,
      limitWriteCount,
      limitPasswordWrite,
      cacheDraft,
      cacheFieldData,
      weChatSetting,
      abilityExpand,
      extendDatas,
    } = this.state;
    const { updateSettings, hideControl } = this.props;
    const changesIds = this.getChangedIds();
    if (changesIds && changesIds.length) {
      hideControl(changesIds);
    }
    const setWechatSetting = !weChatSetting.isRequireAuth
      ? Object.assign({}, weChatSetting, { fieldMaps: _.pick(weChatSetting.fieldMaps, [WECHAT_FIELD_KEY.OPEN_ID]) })
      : weChatSetting;
    const newSettings = {
      limitWriteFrequencySetting,
      ipControlId,
      browserControlId,
      deviceControlId,
      systemControlId,
      receipt,
      extendSourceId,
      needCaptcha,
      smsVerification,
      smsVerificationFiled,
      smsSignature,
      extends: sourceKeys,
      writeScope,
      linkSwitchTime,
      limitWriteTime,
      limitWriteCount,
      limitPasswordWrite,
      cacheDraft,
      cacheFieldData,
      weChatSetting: setWechatSetting,
      abilityExpand,
      extendDatas,
    };
    updateSettings(newSettings, isSuccess => {
      if (isSuccess) {
        cb();
        this.cacheSettings = newSettings;
      }
    });
  };

  handleChange = (key, value, cb = () => {}) => {
    const changed = {};
    changed[key] = value;
    this.setState(changed, () => {
      cb();
      this.saveSetting();
    });
  };

  handleLinkSettingChange = (stateObj, changeSettingChange = true) => {
    this.setState({ ...stateObj, settingChanged: changeSettingChange || this.state.settingChanged });
  };

  handleGenUrl = () => {
    const { sourceKeys, extendDatas } = this.state;
    const value = this.keyinput.value;
    if (value.trim() === '') {
      alert(_l('参数不能为空'), 3);
      return;
    }

    const configs = safeParse(extendDatas.pageConfigs);
    this.handleChange('sourceKeys', update(sourceKeys, { $push: [value] }), () => {
      this.keyinput.value = '';
    });
    this.handleUpdateExpandDatas({ pageConfigs: JSON.stringify(configs.concat({ ...configs[0], key: value })) }, true);
  };

  handleRemoveUrl = index => {
    const { sourceKeys } = this.state;
    this.handleChange('sourceKeys', update(sourceKeys, { $splice: [[index, 1]] }));
  };

  handleShowControl = key => {
    this.setState({ addControlVisible: true, activeSourceKey: key });
  };

  handleAddControl = controlName => {
    const { addWorksheetControl } = this.props;
    const { activeSourceKey } = this.state;
    addWorksheetControl(controlName, control => {
      if (activeSourceKey) {
        this.handleChange(activeSourceKey, control.controlId);
        this.setState({
          activeSourceKey: undefined,
        });
      }
    });
  };

  handleUpdateExpandDatas = (value, immediately = false) => {
    const { extendDatas } = this.state;
    const newValue = { ...extendDatas, ...value };

    if (immediately) {
      this.handleChange('extendDatas', newValue);
    } else {
      this.setState({ extendDatas: newValue, settingChanged: true });
    }
  };

  getIframeUrl() {
    const { displayContent, buttonPosition } = this.state;
    const coverPic = displayContent.includes(1) ? '' : `&cover=no`;
    const logo = displayContent.includes(2) ? '' : `&logo=no`;
    const title = displayContent.includes(3) ? '' : `&title=no`;
    const description = displayContent.includes(4) ? '' : `&description=no`;
    return `${this.props.shareUrl}?bg=no&submit=${buttonPosition}${coverPic}${logo}${title}${description}`;
  }

  getDropdownControls(key) {
    const { originalControls, worksheetSettings } = this.props;
    const { extendSourceId, ipControlId, browserControlId, deviceControlId, systemControlId, weChatSetting } =
      this.state;
    const wxMapControlIds = Object.values(weChatSetting.fieldMaps || {});
    const needFilterIds = [extendSourceId, ipControlId, browserControlId, deviceControlId, systemControlId]
      .concat(wxMapControlIds)
      .concat(worksheetSettings.boundControlIds);

    return [{ style: { color: '#757575' }, text: <span>{_l('清除')}</span>, value: 'clear' }]
      .concat(
        originalControls
          .filter(
            control =>
              control.type === 2 &&
              (!_.find(needFilterIds, id => control.controlId === id) || control.controlId === this.state[key]),
          )
          .map(control => ({
            text: <span>{control.controlName}</span>,
            value: control.controlId,
          })),
      )
      .concat({
        style: { borderTop: '1px solid #ddd', paddingTop: '4px', height: '36px' },
        text: (
          <AddControl className="hand ThemeColor3" onClick={() => this.handleShowControl(key)}>
            <i className="icon icon-plus mRight5 ThemeColor3"></i>
            {_l('新建文本字段')}
          </AddControl>
        ),
      });
  }

  render() {
    const { onClose, shareUrl, originalControls = [], addWorksheetControl, controls, worksheetSettings } = this.props;
    const {
      addControlVisible,
      activeTab,
      sourceKeys,
      extendSourceId,
      activeSourceKey,
      ipControlId,
      browserControlId,
      deviceControlId,
      systemControlId,
      writeScope,
      weChatSetting = {},
      abilityExpand = {},
      confirmDialog,
      titleFolded,
      settingChanged,
      extendDatas,
      displayContent,
      buttonPosition,
    } = this.state;

    return (
      <Drawer
        width={640}
        className="publicConfigSettingDrawer"
        title={_l('发布设置')}
        placement="right"
        visible
        push={false}
        closeIcon={<i className="icon-close Font18" />}
        onClose={() => {
          settingChanged
            ? this.setState({ confirmDialog: { visible: true, isOnClose: true }, settingChanged: false })
            : onClose();
        }}
      >
        <Tabs
          className="headerTab"
          tabs={PUBLISH_CONFIG_TABS}
          active={activeTab}
          tabStyle={{ lineHeight: '34px' }}
          onChange={tab => {
            [1, 2].includes(activeTab) && settingChanged
              ? this.setState({ confirmDialog: { visible: true, tabValue: tab.value } })
              : this.setState({ activeTab: tab.value });
          }}
        />
        <div className="settingContent">
          {activeTab === 1 && (
            <React.Fragment>
              <SectionTitle
                title={_l('填写人群')}
                isFolded={titleFolded.writeScope}
                onClick={() => {
                  this.handleLinkSettingChange({
                    titleFolded: Object.assign({}, titleFolded, { writeScope: !titleFolded.writeScope }),
                  });
                }}
              />
              {!titleFolded.writeScope && (
                <div className="mLeft25">
                  {FILL_OBJECT_OPTIONS.map((item, i) => (
                    <Radio
                      key={i}
                      {...item}
                      disableTitle
                      checked={item.value === writeScope}
                      onClick={() => this.handleLinkSettingChange({ writeScope: item.value })}
                    />
                  ))}
                </div>
              )}

              <DataCollectionSettings
                data={_.pick(this.state, [
                  'linkSwitchTime',
                  'limitWriteTime',
                  'limitWriteCount',
                  'limitPasswordWrite',
                  'limitWriteFrequencySetting',
                  'timeRange',
                  'titleFolded',
                ])}
                setState={this.handleLinkSettingChange}
              />

              <FillSettings
                data={{
                  ..._.pick(this.state, [
                    'needCaptcha',
                    'smsVerification',
                    'smsVerificationFiled',
                    'smsSignature',
                    'cacheDraft',
                    'cacheFieldData',
                    'extendSourceId',
                    'titleFolded',
                    'weChatSetting',
                    'extendDatas',
                  ]),
                  originalControls,
                  controls,
                }}
                setState={this.handleLinkSettingChange}
              />

              {!md.global.SysSettings.hideWeixin && (
                <AbilityExpandSettings
                  data={{
                    abilityExpand,
                    originalControls,
                    writeScope,
                    weChatSetting,
                    extendSourceId,
                    controls,
                    titleFolded,
                  }}
                  setState={this.handleLinkSettingChange}
                />
              )}

              <ReceiptSettings
                titleFolded={titleFolded}
                data={_.get(extendDatas, 'afterSubmit')}
                controls={originalControls}
                setState={this.handleLinkSettingChange}
                handleUpdateExpandDatas={this.handleUpdateExpandDatas}
              />
            </React.Fragment>
          )}
          {activeTab === 2 && (
            <WeChatEnhance
              worksheetInfo={this.props.worksheetInfo}
              data={{
                weChatSetting,
                originalControls,
                writeScope,
                extendSourceId,
                ipControlId,
                browserControlId,
                deviceControlId,
                systemControlId,
                titleFolded,
                boundControlIds: worksheetSettings.boundControlIds,
              }}
              shareConfig={_.get(extendDatas, 'shareConfig')}
              setState={this.handleLinkSettingChange}
              addWorksheetControl={addWorksheetControl}
              handleUpdateExpandDatas={this.handleUpdateExpandDatas}
            />
          )}
          {activeTab === 3 && (
            <React.Fragment>
              <H1>{_l('扩展参数')}</H1>
              <Tip75>
                {_l(
                  '为链接地址添加扩展值，并将扩展值记录到工作表字段（文本字段）中。如：表单将会被发布到N个渠道，你可以设置N个带有对应扩展值的表单链接进行发布，来标识收集到的数据的来源渠道。',
                )}
              </Tip75>
              <H3>{_l('选择记录扩展值的文本字段')}</H3>
              <NewDropdown
                isAppendToBody
                border
                value={extendSourceId}
                renderTitle={selected => (selected ? selected.text : <Tipbd>{_l('请选择...')}</Tipbd>)}
                data={this.getDropdownControls('extendSourceId')}
                onChange={value => this.handleChange('extendSourceId', value === 'clear' ? '' : value)}
              />
              <H3>{_l('生成地址')}</H3>
              <Tip75 className="mBottom10">
                {_l(
                  '可以在下方输入生成带扩展值的链接。或自己拼接扩展值，拼接方法https://......?source=微博。https://...为公开表单链接，微博为设置的扩展值',
                )}
              </Tip75>
              <input
                className="ming Input"
                id="publicConfig_extendInput"
                ref={input => (this.keyinput = input)}
                placeholder={_l('输入参数')}
                style={{ width: 250, verticalAlign: 'middle' }}
              />
              <Button className="mLeft10" onClick={this.handleGenUrl}>
                {_l('生成地址')}
              </Button>
              <div className="mTop16"></div>
              <SourceKeys
                sourceKeys={sourceKeys}
                url={shareUrl}
                pageConfigs={_.get(extendDatas, 'pageConfigs')}
                onDelete={this.handleRemoveUrl}
                handleUpdateExpandDatas={value => this.handleUpdateExpandDatas(value, true)}
              />
              <Hr />
              <H1>{_l('设备信息')}</H1>
              <Tip75>
                {_l('将用户填写表单时的IP地址、浏览器、填写设备、操作系统记录到工作表字段中（文本字段）。')}
              </Tip75>
              <H3>{_l('选择记录设备信息的文本字段')}</H3>
              {[
                { name: _l('IP地址'), key: 'ipControlId' },
                { name: _l('浏览器'), key: 'browserControlId' },
                { name: _l('设备'), key: 'deviceControlId' },
                { name: _l('系统'), key: 'systemControlId' },
              ].map((item, i) => (
                <React.Fragment>
                  <div className="mBottom8">{item.name}</div>
                  <NewDropdown
                    isAppendToBody
                    className="mBottom10"
                    border
                    value={this.state[item.key]}
                    renderTitle={selected => (selected ? selected.text : <Tipbd>{_l('请选择...')}</Tipbd>)}
                    data={this.getDropdownControls(item.key)}
                    onChange={value => {
                      this.handleChange(item.key, value === 'clear' ? '' : value);
                    }}
                  />
                </React.Fragment>
              ))}
            </React.Fragment>
          )}
          {activeTab === 4 && (
            <React.Fragment>
              <H3>{_l('嵌入链接')}</H3>
              <TipBlock color="#757575" className="Font14">
                {this.getIframeUrl()}
              </TipBlock>
              <div className="mTop16">
                <ClipboardButton
                  component="span"
                  data-clipboard-text={this.getIframeUrl()}
                  onSuccess={() => alert(_l('复制成功'))}
                >
                  <Button>{_l('复制')}</Button>
                </ClipboardButton>
              </div>
              <div className="bold mTop32">{_l('链接设置')}</div>
              <div className="flexRow alignItemsCenter mTop20">
                <div className="mRight24">{_l('显示内容')}</div>
                {DISPLAY_CONTENT_OPTIONS.map((item, index) => (
                  <Checkbox
                    key={index}
                    className="pRight24"
                    checked={displayContent.includes(item.value)}
                    onClick={() => {
                      const checked = displayContent.includes(item.value);
                      this.setState({
                        displayContent: checked
                          ? displayContent.filter(v => v !== item.value)
                          : [...displayContent, item.value],
                      });
                    }}
                    text={item.text}
                  />
                ))}
              </div>
              <div className="flexRow alignItemsCenter mTop20">
                <div className="mRight24">{_l('按钮位置')}</div>
                <div className="btnPositionSwitch">
                  {BUTTON_POSITION_OPTIONS.map((item, index) => (
                    <div
                      key={index}
                      className={cx('positionItem', { isActive: buttonPosition === item.value })}
                      onClick={() => this.setState({ buttonPosition: item.value })}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </React.Fragment>
          )}
        </div>

        {[1, 2].includes(activeTab) && (
          <div className="footer flexRow">
            <div className="flex">
              <Button
                type="primary"
                onClick={() => {
                  if (this.validateConfigData()) {
                    this.saveSetting(() => {
                      onClose();
                      alert(_l('保存成功'));
                    });
                  }
                }}
              >
                {_l('保存设置')}
              </Button>
              <Button type="link" onClick={onClose}>
                {_l('取消')}
              </Button>
            </div>
          </div>
        )}

        {addControlVisible && (
          <AddControlDialog
            defaultText={DEFAULT_TEXT[activeSourceKey] || ''}
            onOk={this.handleAddControl}
            onClose={() => {
              this.setState({ addControlVisible: false });
            }}
          />
        )}

        {confirmDialog.visible && (
          <Dialog
            visible
            title={activeTab === 1 ? _l('是否保存链接设置的更改？') : _l('是否保存微信增强的更改？')}
            description={_l('当前有尚未保存的更改，你在离开页面前是否需要保存这些更改？')}
            cancelText={_l('否')}
            okText={_l('是%25028')}
            handleClose={() => this.setState({ confirmDialog: { visible: false }, settingChanged: false })}
            onCancel={isOkBtn => {
              if (!isOkBtn) {
                this.resetInitState();
                if (confirmDialog.isOnClose) {
                  this.setState({ confirmDialog: { visible: false }, settingChanged: false });
                  onClose();
                } else {
                  this.setState({
                    activeTab: confirmDialog.tabValue,
                    confirmDialog: { visible: false },
                    settingChanged: false,
                  });
                }
              }
            }}
            onOk={() => {
              if (this.validateConfigData()) {
                this.saveSetting(() => {
                  if (confirmDialog.isOnClose) {
                    this.setState({ confirmDialog: { visible: false }, settingChanged: false });
                    onClose();
                    alert(_l('保存成功'));
                  } else {
                    this.setState({
                      activeTab: confirmDialog.tabValue,
                      confirmDialog: { visible: false },
                      settingChanged: false,
                    });
                  }
                });
              } else {
                this.setState({ confirmDialog: { visible: false }, settingChanged: false });
              }
            }}
          />
        )}
      </Drawer>
    );
  }
}

const mapStateToProps = state => ({
  ..._.pick(state.publicWorksheet, [
    'loading',
    'shareUrl',
    'originalControls',
    'controls',
    'hidedControlIds',
    'worksheetSettings',
    'worksheetInfo',
  ]),
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PublicConfig);

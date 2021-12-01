import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import styled from 'styled-components';
import update from 'immutability-helper';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Dialog, Tabs, Radio, Switch, Dropdown, Button, RichText } from 'ming-ui';
import * as actions from '../redux/actions';
import { Hr, H1, H3, Tip75, Tipbd, TipBlock } from '../components/Basics';
import ShareUrl from '../components/ShareUrl';
import SourceKeys from '../components/SourceKeys';
import CopyBtn from '../components/CopyBtn';
import AddControlDialog from '../components/AddControlDialog';
import { FILL_TIMES } from '../enum';
import cx from 'classnames';

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
const Danger = styled.span`
  color: #f44336;
`;
const Wow = styled.div`
  height: 10px;
`;
const SmallSwitch = styled(Switch)`
  transform: scale(0.7) translate(-6px, -3px);
  margin-left: -4px;
`;
const HelpTip = styled.span`
  margin-left: 10px;
  .icon {
    font-size: 16px;
    color: #9e9e9e;
  }
  &:after {
    white-space: pre;
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
    this.state = {
      addControlVisible: false,
      activeTab: 1,
      sourceKeys: settings.extends || [],
      isEditing: false,
      ..._.pick(settings, [
        'fillTimes',
        'ipControlId',
        'browserControlId',
        'deviceControlId',
        'systemControlId',
        'receipt',
        'needCaptcha',
        'extendSourceId',
      ]),
    };
  }

  getChangedIds() {
    const { worksheetSettings } = this.props;
    const { ipControlId, browserControlId, deviceControlId, systemControlId, extendSourceId } = this.state;
    const oldIds = _.uniq(
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

  @autobind
  saveSetting() {
    const {
      fillTimes,
      ipControlId,
      browserControlId,
      deviceControlId,
      systemControlId,
      receipt,
      extendSourceId,
      sourceKeys,
      needCaptcha,
    } = this.state;
    const { updateSettings, hideControl, onClose } = this.props;
    const changesIds = this.getChangedIds();
    if (changesIds && changesIds.length) {
      hideControl(changesIds);
    }
    updateSettings({
      fillTimes,
      ipControlId,
      browserControlId,
      deviceControlId,
      systemControlId,
      receipt,
      extendSourceId,
      needCaptcha,
      extends: sourceKeys,
    });
  }

  @autobind
  handleChange(key, value, cb = () => {}) {
    const changed = {};
    changed[key] = value;
    this.setState(changed, () => {
      cb();
      this.saveSetting();
    });
  }

  @autobind
  handleGenUrl() {
    const { sourceKeys } = this.state;
    if (this.keyinput.value.trim() === '') {
      alert(_l('参数不能为空'), 3);
      return;
    }
    this.handleChange('sourceKeys', update(sourceKeys, { $push: [this.keyinput.value] }), () => {
      this.keyinput.value = '';
    });
  }

  @autobind
  handleRemoveUrl(index) {
    const { sourceKeys } = this.state;
    this.handleChange('sourceKeys', update(sourceKeys, { $splice: [[index, 1]] }));
  }

  @autobind
  handleShowControl(key) {
    this.setState({ addControlVisible: true, activeSourceKey: key });
  }

  @autobind
  handleAddControl(controlName) {
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
  }

  @autobind
  handleRefreshShareUrl() {
    const { refreshShareUrl } = this.props;
    Dialog.confirm({
      buttonType: 'danger',
      title: <Danger> {_l('确认生成新链接吗？')} </Danger>,
      description: _l('如果您选择生成新链接，则旧链接将不再可用'),
      onOk: refreshShareUrl,
    });
  }

  getIframeHtml() {
    return `<iframe width="100%" height="100%" style="border: none; margin: 0; padding: 0;" src="${this.props.shareUrl}"></iframe>`;
  }

  getDropdownControls(key) {
    const { originalControls } = this.props;
    const { extendSourceId, ipControlId, browserControlId, deviceControlId, systemControlId } = this.state;
    return [
      {
        style: { color: '#757575' },
        text: <span>{_l('清除')}</span>,
        value: 'clear',
      },
    ]
      .concat(
        originalControls
          .filter(
            control =>
              control.type === 2 &&
              (!_.find(
                [extendSourceId, ipControlId, browserControlId, deviceControlId, systemControlId],
                id => control.controlId === id,
              ) ||
                control.controlId === this.state[key]),
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
    const { onClose, shareUrl } = this.props;
    const {
      addControlVisible,
      activeTab,
      sourceKeys,
      receipt,
      fillTimes,
      extendSourceId,
      activeSourceKey,
      isEditing,
      needCaptcha,
    } = this.state;
    const tabs = [
      { text: _l('链接设置'), value: 1 },
      { text: _l('来源参数'), value: 2 },
      { text: _l('嵌入HTML'), value: 3 },
    ];
    return (
      <Dialog
        className="publicConfigSettingDiaLog"
        title={_l('发布设置')}
        width={640}
        visible
        overlayClosable={false}
        anim={false}
        footer={null}
        onCancel={onClose}
      >
        {addControlVisible && (
          <AddControlDialog
            defaultText={DEFAULT_TEXT[activeSourceKey] || ''}
            onOk={this.handleAddControl}
            onClose={() => {
              this.setState({ addControlVisible: false });
            }}
          />
        )}
        <Tabs
          tabs={tabs}
          active={activeTab}
          tabStyle={{ lineHeight: '34px' }}
          onChange={tab => this.setState({ activeTab: tab.value })}
        />
        <Hr color="#ddd" style={{ margin: '0 -24px' }} />
        {activeTab === 1 && (
          <React.Fragment>
            <H3>{_l('公开表单链接')}</H3>
            <ShareUrl
              className="mainShareUrl"
              url={shareUrl}
              customBtns={[{ tip: _l('重新生成链接'), icon: 'refresh', onClick: this.handleRefreshShareUrl }]}
            />
            <H3>{_l('填写次数')}</H3>
            {[
              { text: _l('无限制'), value: FILL_TIMES.UNLIMITED },
              { text: _l('仅一次'), value: FILL_TIMES.ONETIME },
              { text: _l('每天一次'), value: FILL_TIMES.DAILY },
            ].map((item, i) => (
              <Radio
                key={i}
                {...item}
                disableTitle
                checked={item.value === fillTimes}
                onClick={() => this.handleChange('fillTimes', item.value)}
              />
            ))}
            <H3>{_l('提交验证')}</H3>
            <div>
              <SmallSwitch
                checked={needCaptcha}
                onClick={() => {
                  this.handleChange('needCaptcha', !needCaptcha);
                }}
              />
              {_l('表单提交前填写验证码')}
              <HelpTip data-tip={_l('打开后，填写者在提交数据前需要输入\n验证码，用于防止恶意或重复数据提交。')}>
                <i className="icon icon-help"></i>
              </HelpTip>
            </div>
            <H3>{_l('表单填写成功回执')}</H3>
            <RichText
              className="publicRichText"
              data={receipt || ''}
              onSave={value => {
                this.handleChange('receipt', value);
              }}
            />
          </React.Fragment>
        )}
        {activeTab === 2 && (
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
            <SourceKeys sourceKeys={sourceKeys} url={shareUrl} onDelete={this.handleRemoveUrl} />
            <Hr />
            <H1>{_l('设备信息')}</H1>
            <Tip75>{_l('将用户填写表单时的IP地址、浏览器、填写设备、操作系统记录到工作表字段中（文本字段）。')}</Tip75>
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
        {activeTab === 3 && (
          <React.Fragment>
            <H3>{_l('嵌入代码')}</H3>
            <TipBlock color="#757575" className="Font14">
              {this.getIframeHtml()}
            </TipBlock>
            <div className="TxtRight mTop35">
              <CopyBtn copycontent={this.getIframeHtml()}>
                <Button>{_l('复制')}</Button>
              </CopyBtn>
            </div>
          </React.Fragment>
        )}
        {activeTab !== 3 && <Wow />}
      </Dialog>
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
  ]),
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PublicConfig);

import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { generate } from '@ant-design/colors';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Menu, MenuItem, RichText, ScrollView, Skeleton } from 'ming-ui';
import { Absolute, BlackBtn, FormTopImgCon, Hr } from 'worksheet/components/Basics';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';
import BgContainer from '../components/BgContainer';
import EditableButton from '../components/EditableButton';
import EditableText from '../components/EditableText';
import Logo from '../components/Logo';
import { themes } from '../enum';
import * as actions from '../redux/actions';
import { getDisabledControls, getPageConfig, overridePos } from '../utils';
import AppearanceConfig from './AppearanceConfig';
import FormPreview from './FormPreview';

const TopBar = styled.div(
  ({ color }) => `
  height: 10px;
  background: #fff;
  border-radius: 3px 3px 0 0;
  .topBar{
    width: 100%;
    height: 100%;
    background: ${getRgbaByColor(color, 0.4)};
  }
 `,
);
const SubmitCon = styled.div(
  ({ themeBgColor }) => `
  text-align: center;
  margin: 30px 0 30px;
  .text {
    width: 100%;
  }
  .icon {
    margin-left: 6px;
    font-size: 18px;
  }
  input {
    width: 200px;
    max-width: calc(100% - 44px);
    border: 7px solid ${themeBgColor} !important;
    height: 40px !important;
  }
  .Button {
    height: 40px;
    line-height: 40px;
  }
`,
);

class PublicWorksheetConfigForm extends React.Component {
  static propTypes = {
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    originalControls: PropTypes.arrayOf(PropTypes.shape({})),
    loading: PropTypes.bool,
    hidedControlIds: PropTypes.arrayOf(PropTypes.string),
    worksheetInfo: PropTypes.shape({}),
    worksheetSettings: PropTypes.shape({}),
    onHideControl: PropTypes.func,
    changeControls: PropTypes.func,
    updateWorksheetInfo: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      appearanceConfigVisible: false,
      headerPopupVisible: false,
    };
  }

  componentDidMount() {
    window.scrollToFormEnd = () => {
      if (this.con) {
        $(this.con).find('.scrollViewContainer .scroll-viewport').scrollTop(100000);
      }
    };
  }

  componentWillUnmount() {
    delete window.scrollToFormEnd;
  }

  getThemeBgColor = () => {
    const config = getPageConfig(_.get(this.props.worksheetSettings, 'extendDatas.pageConfigs'));
    const { themeBgColor, themeColor } = config;

    if (!themeBgColor) {
      return !themes[themeColor] ? '#1677ff' : (themes[themeColor] || {}).main;
    } else {
      return themeBgColor;
    }
  };

  saveExtendDatas = value => {
    const { worksheetSettings } = this.props;

    this.props.updateSettings({ ...worksheetSettings, extendDatas: { ...worksheetSettings.extendDatas, ...value } });
  };

  renderAddHeader = () => {
    const { headerPopupVisible } = this.state;
    const headerConfig = _.get(this.props, 'worksheetSettings.extendDatas.visibleHeaders');
    const visibleHeaders = _.isUndefined(headerConfig) ? ['logo', 'title', 'description'] : safeParse(headerConfig);

    const menuList = [
      { key: 'logo', text: _l('Logo'), icon: 'picture' },
      { key: 'title', text: _l('标题'), icon: 'H1' },
      { key: 'description', text: _l('说明'), icon: 'title' },
    ];

    return (
      <Trigger
        popup={
          <Menu style={{ width: 240 }} className="Relative">
            {menuList
              .filter(item => !visibleHeaders.includes(item.key))
              .map(item => (
                <MenuItem
                  key="newPage"
                  icon={<Icon icon={item.icon} className="Font16" />}
                  onClick={() => {
                    const newVisibleHeaders = visibleHeaders.concat(item.key);
                    this.saveExtendDatas({ visibleHeaders: JSON.stringify(newVisibleHeaders) });
                  }}
                >
                  <span className="mLeft8">{item.text}</span>
                </MenuItem>
              ))}
          </Menu>
        }
        popupVisible={headerPopupVisible}
        onPopupVisibleChange={visible => this.setState({ headerPopupVisible: visible })}
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 12],
          overflow: { adjustX: true, adjustY: true },
        }}
      >
        <div className={cx('addBtn', { isActive: headerPopupVisible })}>
          <Icon icon="add" />
        </div>
      </Trigger>
    );
  };

  render() {
    const {
      worksheetInfo,
      worksheetSettings,
      shareUrl,
      controls,
      originalControls,
      loading,
      updateWorksheetInfo,
      hidedControlIds,
      changeControls,
      onHideControl,
    } = this.props;
    const { logoUrl, submitBtnName, advancedSetting } = worksheetInfo;
    const { appearanceConfigVisible } = this.state;
    const disabledControlIds = getDisabledControls(originalControls, worksheetSettings);
    const needHidedControlIds = hidedControlIds.concat(disabledControlIds);
    const theme = this.getThemeBgColor();
    const extendDatas = worksheetSettings.extendDatas || {};
    const config = getPageConfig(extendDatas.pageConfigs);
    const visibleHeaders = _.isUndefined(extendDatas.visibleHeaders)
      ? ['logo', 'title', 'description']
      : safeParse(extendDatas.visibleHeaders);

    const hideHeader = key => {
      const newVisibleHeaders = visibleHeaders.filter(item => item !== key);
      this.saveExtendDatas({ visibleHeaders: JSON.stringify(newVisibleHeaders) });
    };

    const renderContent = () => {
      return (
        <Fragment>
          <Absolute top="17" right="24" style={{ zIndex: 9 }}>
            <BlackBtn onClick={() => this.setState({ appearanceConfigVisible: true })}>
              <i className="icon icon-task-color"></i>
              {_l('设置封面')}
            </BlackBtn>
            <BlackBtn
              onClick={() =>
                window.open(`/worksheet/form/preview/${worksheetInfo.worksheetId}?url=${encodeURIComponent(shareUrl)}`)
              }
            >
              <i className="icon icon-eye"></i>
              {_l('预览')}
            </BlackBtn>
          </Absolute>
          <div className={cx('formContent flexColumn', { mTop10: config.layout === 2 })}>
            {config.layout === 2 && config.cover && (
              <FormTopImgCon>
                <img src={config.cover} />
              </FormTopImgCon>
            )}
            <TopBar color={theme} className={cx({ hide: config.layout === 2 && config.cover })}>
              <div className="topBar" />
            </TopBar>

            {loading && (
              <Skeleton direction="column" widths={['30%', '40%', '90%']} active itemStyle={{ marginBottom: '10px' }} />
            )}
            {!loading && (
              <div className="formContentHeader">
                {visibleHeaders.length < 3 && this.renderAddHeader()}

                {visibleHeaders.includes('logo') && (
                  <div className="mLeft20 mTop32">
                    <div className={logoUrl ? '' : 'sectionWrapper'} style={{ width: 'fit-content' }}>
                      <Logo url={logoUrl} onChange={url => updateWorksheetInfo({ logoUrl: url })} />
                      {!logoUrl && (
                        <div className="hideIcon" onClick={() => hideHeader('logo')}>
                          <Icon icon="visibility_off1" className="Font14" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {visibleHeaders.includes('title') && (
                  <div className="worksheetName sectionWrapper">
                    <EditableText
                      turnLine
                      mutiLine
                      minHeight={38}
                      maxLength={200}
                      emptyTip={_l('未命名表单')}
                      value={worksheetInfo.name}
                      onChange={value => updateWorksheetInfo({ name: value.trim() })}
                    />
                    <div className="hideIcon" onClick={() => hideHeader('title')}>
                      <Icon icon="visibility_off1" className="Font14" />
                    </div>
                  </div>
                )}

                {visibleHeaders.includes('description') && (
                  <div className="worksheetDescription WordBreak sectionWrapper">
                    <RichText
                      bucket={2}
                      data={worksheetInfo.desc || ''}
                      minHeight={46}
                      className={`descText-${Math.round(Math.random() * 10)}`}
                      onSave={value => {
                        updateWorksheetInfo({ desc: value });
                      }}
                    />
                    <div className="hideIcon" onClick={() => hideHeader('description')}>
                      <Icon icon="visibility_off1" className="Font14" />
                    </div>
                  </div>
                )}

                <Hr style={{ margin: '16px 0' }} />
              </div>
            )}

            <div className="formMain">
              {loading && (
                <Skeleton
                  direction="column"
                  widths={['40%', '50%', '60%', '70%', '80%', '40%', '50%', '60%', '70%', '80%']}
                  active
                  itemStyle={{ marginBottom: '10px' }}
                />
              )}
              {!loading && (
                <FormPreview
                  advancedSetting={advancedSetting}
                  controls={overridePos(originalControls, controls).filter(
                    c => !_.find(needHidedControlIds, hcid => c.controlId === hcid),
                  )}
                  onHideControl={onHideControl}
                  onChange={newControls => {
                    changeControls(newControls);
                  }}
                />
              )}
            </div>
            {loading && (
              <Skeleton
                className="mBottom30"
                direction="column"
                widths={['60%', '70%', '80%']}
                active
                itemStyle={{ marginBottom: '10px' }}
              />
            )}
            {!loading && (
              <SubmitCon themeBgColor={theme}>
                <EditableButton
                  name={submitBtnName}
                  themeBgColor={theme}
                  onChange={value => updateWorksheetInfo({ submitBtnName: value })}
                />
              </SubmitCon>
            )}
          </div>
        </Fragment>
      );
    };

    return (
      <div
        className="publicWorksheetConfigForm flex"
        ref={con => (this.con = con)}
        style={{ backgroundColor: generate(theme)[0] }}
      >
        <AppearanceConfig
          pageConfigKey=""
          theme={theme}
          open={appearanceConfigVisible}
          pageConfigs={_.get(extendDatas, 'pageConfigs')}
          saveExtendDatas={this.saveExtendDatas}
          onClose={() => this.setState({ appearanceConfigVisible: false })}
        />
        <ScrollView className="flex">
          {config.layout === 2 ? (
            renderContent()
          ) : (
            <BgContainer mask {...{ theme, coverUrl: config.cover }}>
              {renderContent()}
            </BgContainer>
          )}
        </ScrollView>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  ..._.pick(state.publicWorksheet, [
    'loading',
    'shareUrl',
    'worksheetInfo',
    'worksheetSettings',
    'controls',
    'originalControls',
    'hidedControlIds',
  ]),
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PublicWorksheetConfigForm);

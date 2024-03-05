import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ScrollView, RichText, Skeleton } from 'ming-ui';
import * as actions from '../redux/actions';
import { Absolute, BlackBtn, Hr } from 'worksheet/components/Basics';
import Logo from '../components/Logo';
import EditableText from '../components/EditableText';
import EditableButton from '../components/EditableButton';
import BgContainer from '../components/BgContainer';
import AppearanceConfig from './AppearanceConfig';
import FormPreview from './FormPreview';
import { themes } from '../enum';
import { getDisabledControls, overridePos } from '../utils';
import _ from 'lodash';
import { generate } from '@ant-design/colors';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';

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
      isEditing: false,
    };
  }

  componentDidMount() {
    window.scrollToFormEnd = () => {
      if (this.con) {
        $(this.con).find('.nano').nanoScroller({ scroll: 'bottom' });
      }
    };
  }

  componentWillUnmount() {
    delete window.scrollToFormEnd;
  }

  getThemeBgColor = () => {
    const { themeIndex, themeBgColor } = this.props.worksheetInfo;
    if (!themeBgColor) {
      return !themes[themeIndex] ? '#2196f3' : (themes[themeIndex] || {}).main;
    } else {
      return themeBgColor;
    }
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
    const { coverUrl, logoUrl, submitBtnName, advancedSetting } = worksheetInfo;
    const { appearanceConfigVisible, isEditing } = this.state;
    const disabledControlIds = getDisabledControls(originalControls, worksheetSettings);
    const needHidedControlIds = hidedControlIds.concat(disabledControlIds);
    const theme = this.getThemeBgColor();

    return (
      <div
        className="publicWorksheetConfigForm flex"
        ref={con => (this.con = con)}
        style={{ backgroundColor: generate(theme)[0] }}
      >
        <AppearanceConfig
          theme={theme}
          open={appearanceConfigVisible}
          onClose={() => this.setState({ appearanceConfigVisible: false })}
        />
        <ScrollView className="flex">
          <BgContainer mask {...{ theme, coverUrl }}>
            <Absolute top="17" right="24">
              <BlackBtn onClick={() => this.setState({ appearanceConfigVisible: true })}>
                <i className="icon icon-task-color"></i>
                {_l('主题背景')}
              </BlackBtn>
              <BlackBtn
                onClick={() =>
                  window.open(
                    `/worksheet/form/preview/${worksheetInfo.worksheetId}?url=${encodeURIComponent(shareUrl)}`,
                  )
                }
              >
                <i className="icon icon-eye"></i>
                {_l('预览')}
              </BlackBtn>
            </Absolute>
            <div className="formContent flexColumn">
              <TopBar color={theme}>
                <div className="topBar" />
              </TopBar>

              {loading && (
                <Skeleton
                  direction="column"
                  widths={['30%', '40%', '90%']}
                  active
                  itemStyle={{ marginBottom: '10px' }}
                />
              )}
              {!loading && (
                <div className="formContentHeader">
                  <div className="mLeft20">
                    <Logo url={logoUrl} onChange={url => updateWorksheetInfo({ logoUrl: url })} />
                  </div>
                  <div className="worksheetName">
                    <EditableText
                      turnLine
                      mutiLine
                      minHeight={38}
                      maxLength={200}
                      emptyTip={_l('未命名表单')}
                      value={worksheetInfo.name}
                      onChange={value => updateWorksheetInfo({ name: value })}
                    />
                  </div>
                  <div className="worksheetDescription WordBreak">
                    <RichText
                      bucket={2}
                      data={worksheetInfo.desc || ''}
                      minHeight={46}
                      className={`descText-${Math.round(Math.random() * 10)}`}
                      // disabled={disabled}
                      onSave={value => {
                        updateWorksheetInfo({ desc: value });
                      }}
                    />
                  </div>
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
          </BgContainer>
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

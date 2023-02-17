import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ScrollView, RichText } from 'ming-ui';
import Skeleton from 'src/router/Application/Skeleton';
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
import cx from 'classnames';
import _ from 'lodash';

const TopBar = styled.div(
  ({ color }) => `height: 10px; background: ${color}; opacity: .4; border-radius: 3px 3px 0 0;`,
);
const SubmitCon = styled.div`
  text-align: center;
  margin: 15px 0 30px;
  .text {
    max-width: 140px;
  }
  .icon {
    margin-left: 6px;
    font-size: 18px;
  }
  input {
    width: 200px;
    border: 7px solid #2196f3 !important;
    height: 40px !important;
  }
  .Button {
    height: 40px;
    line-height: 40px;
  }
`;
class PublicWorksheetConfigForm extends React.Component {
  static propTypes = {
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    originalControls: PropTypes.arrayOf(PropTypes.shape({})),
    loading: PropTypes.bool,
    hidedControlIds: PropTypes.arrayOf(PropTypes.string),
    worksheetInfo: PropTypes.shape({}),
    worksheetSettings: PropTypes.shape({}),
    hideControl: PropTypes.func,
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
      hideControl,
      changeControls,
    } = this.props;
    const { themeIndex, coverUrl, logoUrl, submitBtnName } = worksheetInfo;
    const { appearanceConfigVisible, isEditing } = this.state;
    const disabledControlIds = getDisabledControls(originalControls, worksheetSettings);
    const needHidedControlIds = hidedControlIds.concat(disabledControlIds);
    const theme = themes[_.isUndefined(themeIndex) ? 4 : themeIndex] || {};
    return (
      <div
        className="publicWorksheetConfigForm flex"
        ref={con => (this.con = con)}
        style={{ backgroundColor: theme.second }}
      >
        <AppearanceConfig
          open={appearanceConfigVisible}
          onClose={() => this.setState({ appearanceConfigVisible: false })}
        />
        <ScrollView className="flex">
          <BgContainer mask {...{ themeIndex, coverUrl }}>
            <Absolute top="17" right="24">
              <BlackBtn onClick={() => this.setState({ appearanceConfigVisible: true })}>
                <i className="icon icon-task-color"></i>
                {_l('主题背景')}
              </BlackBtn>
              <BlackBtn onClick={() => window.open(`/worksheet/form/preview/${worksheetInfo.worksheetId}`)}>
                <i className="icon icon-eye"></i>
                {_l('预览')}
              </BlackBtn>
            </Absolute>
            <div className="formContent flexColumn">
              <TopBar color={theme.main} />
              {loading && (
                <Skeleton
                  direction="column"
                  widths={['30%', '40%', '90%']}
                  active
                  itemStyle={{ marginBottom: '10px' }}
                />
              )}
              {!loading && (
                <div style={{ padding: '0 20px' }}>
                  <div className="mLeft20">
                    <Logo url={logoUrl} onChange={url => updateWorksheetInfo({ logoUrl: url })} />
                  </div>
                  <div className="worksheetName">
                    <EditableText
                      turnLine
                      mutiLine
                      minHeight={38}
                      emptyTip={_l('未命名表单')}
                      value={worksheetInfo.name}
                      onChange={value => updateWorksheetInfo({ name: value })}
                    />
                  </div>
                  <div className="worksheetDescription WordBreak">
                    <RichText
                      data={worksheetInfo.desc || ''}
                      minHeight={46}
                      className={`descText-${Math.round(Math.random() * 10)}`}
                      // disabled={disabled}
                      onSave={value => {
                        updateWorksheetInfo({ desc: value });
                      }}
                    />
                  </div>
                </div>
              )}
              <Hr style={{ margin: '16px 0' }} />
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
                    controls={overridePos(originalControls, controls).filter(
                      c => !_.find(needHidedControlIds, hcid => c.controlId === hcid),
                    )}
                    hideControl={hideControl}
                    changeControls={changeControls}
                    onChange={newControls => {
                      changeControls(newControls);
                    }}
                  />
                )}
              </div>
              <Hr style={{ margin: '16px 0' }} />
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
                <SubmitCon>
                  <EditableButton
                    name={submitBtnName}
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

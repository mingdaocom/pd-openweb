import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Button, ScrollView, Dialog, Switch } from 'ming-ui';
import Skeleton from 'src/router/Application/Skeleton';
import * as actions from '../redux/actions';
import { Hr, H2, Tip9e, TipBlock } from 'worksheet/components/Basics';
import ShareUrl from 'worksheet/components/ShareUrl';
import HidedControls from '../components/HidedControls';
import PublicConfig from './PublicConfig';
import { VISIBLE_TYPE } from '../enum';
import { getDisabledControls, renderLimitInfo, isDisplayPromptText } from '../utils';
import _ from 'lodash';

const BackBtn = styled.span`
  cursor: pointer;
  font-weight: 700;
  margin: 16px 0 0;
  display: inline-block;
  font-size: 13px;
  width: 74px;
  text-align: center;
  line-height: 32px;
  color: #2196f3;
  background: #e3f2ff;
  border-radius: 32px;
  &:hover {
    color: #1c80d0;
    background: #d6edff;
  }
`;

const ShareUrlContainer = styled.div`
  .customShareUrl > :nth-last-child(1) {
    margin-top: 10px;
    justify-content: space-between;
    align-items: center;
  }
`;

const PublishUrlContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .publishUrlSwitch {
    transform: scale(0.8) translate(6px);
  }
`;

class ConfigPanel extends React.Component {
  static propTypes = {
    worksheetInfo: PropTypes.shape({}),
    worksheetSettings: PropTypes.shape({}),
    shareUrl: PropTypes.string,
    hidedControlIds: PropTypes.arrayOf(PropTypes.string),
    originalControls: PropTypes.arrayOf(PropTypes.shape({})),
    showControl: PropTypes.func,
    updateWorksheetVisibleType: PropTypes.func,
    resetControls: PropTypes.func,
    onCloseConfig: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      publicConfigVisible: false,
    };
  }

  @autobind
  changeWOrksheetVisibleType(checked) {
    const { updateWorksheetVisibleType, worksheetInfo } = this.props;
    updateWorksheetVisibleType(
      worksheetInfo.visibleType === VISIBLE_TYPE.CLOSE ? VISIBLE_TYPE.PUBLIC : VISIBLE_TYPE.CLOSE,
    );
  }

  @autobind
  resetControls() {
    const { resetControls } = this.props;
    Dialog.confirm({
      title: _l('重置公开表单字段'),
      description: _l('公开表单重置为原始表单状态，已有的隐藏字段和排序设置将清除'),
      okText: _l('重置字段'),
      onOk: resetControls,
    });
  }

  render() {
    const {
      loading,
      worksheetInfo,
      worksheetSettings,
      originalControls,
      shareUrl,
      hidedControlIds,
      showControl,
      onCloseConfig,
      refreshShareUrl,
      enabled,
      onSwitchChange,
    } = this.props;
    const { publicConfigVisible } = this.state;
    const disabledControlIds = getDisabledControls(originalControls, worksheetSettings);
    const disabledControls = disabledControlIds
      .map(did => _.find(originalControls, c => c.controlId === did))
      .filter(_.identity);
    const hidedControls = hidedControlIds
      .filter(hid => !_.find(disabledControlIds, did => did === hid))
      .map(hcid => _.find(originalControls, c => c.controlId === hcid))
      .filter(_.identity);
    return (
      <div className="publicWorksheetConfigPanel">
        <div className="publicConfig flexColumn">
          <BackBtn onClick={onCloseConfig}>{_l('完成')}</BackBtn>
          <PublishUrlContainer>
            <H2 className="InlineBlock" style={{ fontSize: 16 }}>
              {_l('公开链接')}
            </H2>
            <Switch
              className="publishUrlSwitch"
              checked={enabled}
              onClick={() => {
                onSwitchChange();
                onCloseConfig();
              }}
            />
          </PublishUrlContainer>

          {worksheetInfo.visibleType === VISIBLE_TYPE.PUBLIC && (
            <React.Fragment>
              {isDisplayPromptText(worksheetSettings) && (
                <div className="promptText flexColumn">{renderLimitInfo(worksheetSettings)}</div>
              )}
              <ShareUrlContainer>
                <ShareUrl
                  theme="light"
                  className="customShareUrl"
                  style={{ margin: '16px 0', flexDirection: 'column' }}
                  showPreview={false}
                  url={shareUrl}
                  showCompletely={{ copy: true, qr: true }}
                  refreshShareUrl={refreshShareUrl}
                  customBtns={[
                    {
                      tip: _l('打开'),
                      icon: 'launch',
                      text: _l('打开'),
                      showCompletely: true,
                      onClick: () => window.open(shareUrl),
                    },
                  ]}
                />
              </ShareUrlContainer>

              <Button fullWidth className="mTop8" onClick={() => this.setState({ publicConfigVisible: true })}>
                <i className="icon icon-send Font16 mRight10"></i>
                {_l('发布设置')}
              </Button>
            </React.Fragment>
          )}
          {publicConfigVisible && <PublicConfig onClose={() => this.setState({ publicConfigVisible: false })} />}
          <Hr style={{ margin: '20px -20px 0' }} />
          <div>
            <H2 className="mBottom10 Left" style={{ color: '#757575', fontSize: '14px' }}>
              {_l('隐藏的字段')}
            </H2>
            <span className="Right mTop16" onClick={this.resetControls} data-tip={_l('重置公开表单字段')}>
              <i className="icon icon-refresh1 Gray_9e Font16 Hand"></i>
            </span>
          </div>
          <Tip9e className="tip mBottom10">
            {_l('人员、部门、组织角色、自由连接、扩展值的文本字段不能用于公开表单，原表单内的以上字段将被自动隐藏。')}
          </Tip9e>
          {!hidedControls.length && !disabledControls.length && (
            <TipBlock> {_l('点击右侧表单中字段上的隐藏按钮，被隐藏的字段将放置在这里')} </TipBlock>
          )}
          <div className="flex" style={{ margin: '0 -20px', padding: '0 0 32px' }}>
            <ScrollView>
              {loading && (
                <div>
                  <Skeleton
                    direction="column"
                    widths={['100%', '100%', '100%', '100%', '100%']}
                    active
                    itemStyle={{ marginBottom: '10px' }}
                  />
                </div>
              )}
              <div style={{ padding: '0 25px 0 20px' }}>
                {/* { !!disabledControls.length && <HidedControls controls={disabledControls} disabled /> } */}
                {!!hidedControls.length && <HidedControls controls={hidedControls} onAdd={showControl} />}
              </div>
            </ScrollView>
          </div>
        </div>
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
    'originalControls',
    'controls',
    'hidedControlIds',
  ]),
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ConfigPanel);

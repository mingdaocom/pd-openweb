import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import update from 'immutability-helper';
import { head, isEmpty, last, pick } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Dialog, ScrollView, Skeleton, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { H2, Hr, Tip9e } from 'worksheet/components/Basics';
import ShareUrl from 'worksheet/components/ShareUrl';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { isFullLineControl } from '../../widgetConfig/util/widgets';
import { VISIBLE_TYPE } from '../enum';
import * as actions from '../PublicWorksheetConfig/redux/actions';
import { getDisabledControls, isDisplayPromptText, renderLimitInfo } from '../utils';
import ControlList from './components/ControlList';
import PublicConfig from './PublicConfig';

const WHOLE_SIZE = 12;

const BackBtn = styled.span`
  cursor: pointer;
  font-weight: 700;
  margin: 16px 0 0;
  display: inline-block;
  font-size: 13px;
  width: 74px;
  text-align: center;
  line-height: 32px;
  color: var(--color-primary);
  background: var(--color-primary-transparent);
  border-radius: 32px;
  &:hover {
    color: var(--color-link-hover);
    background: var(--color-primary-transparent);
  }
`;

const ShareUrlContainer = styled.div`
  .customShareUrl > :nth-last-child(1) {
    margin-top: 10px;
    justify-content: space-between;
    align-items: center;
  }
  .customShareUrl {
    .text {
      line-height: initial;
    }
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

const PublishSetBtn = styled(Button)`
  height: 36px !important;
  padding: 0 !important;
`;

const PayButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 36px;
  line-height: 36px;
  margin-left: 10px;
  border-radius: 3px;
  color: var(--color-primary);
  background: var(--color-primary-transparent);
  font-weight: 700;
  cursor: pointer;
  &:hover {
    color: var(--color-link-hover);
    background: var(--color-primary-transparent);
  }
`;

const ColumnSettingWrap = styled.div`
  padding: 12px 0 20px;
  .titleBtn {
    color: var(--color-text-tertiary);
    cursor: pointer;
    font-weight: bold;
    &:hover {
      color: var(--color-primary);
    }
  }
  .columnWrap {
    display: flex;
    padding: 2px;
    background: var(--color-background-disabled);
    border-radius: 3px;
    .columnItem {
      height: 32px;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-weight: bold;
      color: var(--color-text-secondary);
      flex: 1;
      margin-left: 2px;
      &:first-child {
        margin-left: 0;
      }
      &:hover {
        color: var(--color-primary);
        i {
          color: var(--color-primary);
        }
      }
      i {
        color: var(--color-text-secondary);
      }
      &.active {
        background: var(--color-background-primary);
        color: var(--color-primary);
        i {
          color: var(--color-primary);
        }
      }
      &.disabled {
        color: var(--color-text-disabled) !important;
        cursor: not-allowed;
      }
      &.breakText {
        word-break: break-word;
        text-align: center;
        line-height: 12px;
      }
    }
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
    onHideControl: PropTypes.func,
    updateWorksheetVisibleType: PropTypes.func,
    resetControls: PropTypes.func,
    onCloseConfig: PropTypes.func,
    changeControls: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      publicConfigVisible: false,
      activeColumn: -1,
    };
    this.originData = props.controls;
  }

  resetControls = () => {
    const { resetControls } = this.props;
    Dialog.confirm({
      title: _l('重置公开表单字段'),
      description: _l('公开表单重置为原始表单状态，已有的隐藏字段和排序设置将清除'),
      okText: _l('重置字段'),
      onOk: resetControls,
    });
  };

  onChangeColumn = columnNumber => {
    const { changeControls, controls, originalControls } = this.props;
    let newControls = [];
    const data = originalControls
      .filter(control => controls.find(item => item.controlId === control.controlId))
      .map(control => ({ ...control, ...controls.find(item => item.controlId === control.controlId) }));

    this.setState({ activeColumn: columnNumber });

    // 1列排列
    if (columnNumber === 1) {
      newControls = data.map((item, index) => ({ ...item, row: index, col: 0, size: 12 }));
      changeControls(newControls, false);
      return;
    }

    // 多列排列
    const nextWidgets = data.reduce((widgetList, widget) => {
      const lastRow = last(widgetList);

      /**
       * 第一行直接添加
       * 当前控件是整行控件 直接另起一行
       * 当前行的第一个控件是整行控件 也另起一行
       */
      if (isEmpty(lastRow) || isFullLineControl(widget) || isFullLineControl(head(lastRow))) {
        return update(widgetList, { $push: [[widget]] });
      }
      // 如果最后一行还有空位则添加控件 否则另起一行
      if (lastRow.length < columnNumber) {
        return update(widgetList, {
          [widgetList.length - 1]: {
            $apply: list => {
              const nextList = list.concat(widget);
              return nextList.map(item => ({ ...item, size: WHOLE_SIZE / nextList.length }));
            },
          },
        });
      }
      return update(widgetList, { $push: [[widget]] });
    }, []);

    // 将“落单”的控件宽度调整为与当前列数一致
    const adjustedWidgets = nextWidgets.map(row => {
      if (row.length === 1 && !isFullLineControl(row[0]) && columnNumber > 1) {
        return row.map(item => ({ ...item, size: WHOLE_SIZE / columnNumber }));
      }
      return row;
    });

    // 转换回一维数组，并赋予正确的 row 和 col 值
    newControls = adjustedWidgets.reduce((result, row, rowIndex) => {
      return result.concat(
        row.map((item, colIndex) => ({
          ...item,
          row: rowIndex,
          col: colIndex,
        })),
      );
    }, []);

    changeControls(newControls, false);
  };

  onApplyColumn = () => {
    const { changeControls, controls } = this.props;
    changeControls(controls);
    this.originData = controls;
    this.setState({ activeColumn: -1 });
  };

  onRestoreColumn = () => {
    const { changeControls } = this.props;
    changeControls(this.originData);
    this.setState({ activeColumn: -1 });
  };

  render() {
    const {
      loading,
      worksheetInfo,
      worksheetSettings,
      originalControls,
      shareUrl,
      showControl,
      onHideControl,
      onCloseConfig,
      refreshShareUrl,
      enabled,
      onSwitchChange,
      projectId,
    } = this.props;
    const { publicConfigVisible, activeColumn } = this.state;
    const disabledControlIds = getDisabledControls(originalControls, worksheetSettings).concat(
      worksheetSettings.boundControlIds,
    );
    const hidedControlIds = this.props.hidedControlIds.filter(hid => !disabledControlIds.includes(hid));
    const featureType = getFeatureStatus(projectId, VersionProductType.PAY);

    const onFinishClick = () => {
      if (activeColumn > 0) {
        Dialog.confirm({
          title: _l('是否应用每行字段数量设置？'),
          description: _l('您已修改「每行字段数量」但尚未应用。'),
          okText: _l('应用'),
          onOk: () => {
            this.onApplyColumn();
            onCloseConfig();
          },
        });
      } else {
        onCloseConfig();
      }
    };

    return (
      <div className="publicWorksheetConfigPanel">
        <div className="publicConfig flexColumn">
          <BackBtn onClick={onFinishClick}>{_l('完成')}</BackBtn>
          <PublishUrlContainer>
            <H2 className="InlineBlock" style={{ fontSize: 16 }}>
              {_l('公开表单')}
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

              <div className="flexRow mTop8">
                <PublishSetBtn className="flex" onClick={() => this.setState({ publicConfigVisible: true })}>
                  <i className="icon icon-send Font16 mRight10"></i>
                  {_l('发布设置')}
                </PublishSetBtn>
                {featureType && (
                  <PayButton
                    onClick={() => {
                      if (featureType === '2') {
                        buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
                        return;
                      }
                      location.href = `/worksheet/form/edit/${worksheetInfo.worksheetId}/pay`;
                    }}
                  >
                    <i className="icon icon-sp_payment_white Font20 mRight5" />
                    {_l('支付')}
                  </PayButton>
                )}
              </div>
            </React.Fragment>
          )}
          {publicConfigVisible && <PublicConfig onClose={() => this.setState({ publicConfigVisible: false })} />}
          <Hr style={{ margin: '20px -20px 0' }} />
          <div>
            <H2 className="mBottom10 Left" style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              {_l('显示的字段')}
            </H2>
            <Tooltip title={_l('重置公开表单字段')}>
              <span className="Right mTop16" onClick={this.resetControls}>
                <i className="icon icon-refresh1 textTertiary Font16 Hand"></i>
              </span>
            </Tooltip>
          </div>

          <ColumnSettingWrap>
            <div className="flexRow alignItemsCenter mBottom8">
              <div className="bold flex">{_l('每行字段数量')}</div>
              {activeColumn > 0 && (
                <span className="titleBtn mRight16" onClick={this.onRestoreColumn}>
                  {_l('还原')}
                </span>
              )}
              <span className="titleBtn" onClick={() => activeColumn > 0 && this.onApplyColumn()}>
                {_l('应用')}
              </span>
            </div>
            <div className="columnWrap">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className={cx('columnItem', { active: activeColumn === index + 1 })}
                  key={index}
                  onClick={() => this.onChangeColumn(index + 1)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </ColumnSettingWrap>

          <div className="bold mBottom8">{_l('字段')}</div>
          <Tip9e className="tip mBottom10">
            {_l('人员、部门、组织角色、自由连接、扩展值的文本字段不能用于公开表单，原表单内的以上字段将被自动隐藏。')}
          </Tip9e>

          <div className="flex minHeight0" style={{ margin: '0 -20px', padding: '0 0 32px' }}>
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
                <ControlList
                  controls={originalControls}
                  hidedControlIds={hidedControlIds}
                  disabledControlIds={disabledControlIds}
                  onAdd={showControl}
                  onHide={onHideControl}
                />
              </div>
            </ScrollView>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  ...pick(state.publicWorksheet, [
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

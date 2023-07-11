import React from 'react';
import { Dialog, Icon, Checkbox } from 'ming-ui';
import styled from 'styled-components';
import _ from 'lodash';
import OpinionTemplate from 'src/pages/workflow/WorkflowSettings/Detail/Approval/OpinionTemplate.jsx';
const Wrap = styled.div`
  .line {
    border-top: 1px solid #eaeaea;
    margin: 24px 0;
  }
  .btnTxt {
    input {
      flex: 1;
    }
    span {
      width: 80px;
    }
  }
  .icon-ic_toggle_off {
    color: #bdbdbd;
  }
  .icon-ic_toggle_on {
    color: #00c345;
  }
  .bold400 {
    font-weight: 400;
  }
  .remarkWrap {
    background: #f8f8f8;
    border-radius: 3px 3px 3px 3px;
    border: 1px solid #dddddd;
    line-height: 36px;
    padding: 0 12px;
  }
`;

class DoubleConfirmDialog extends React.Component {
  constructor(props) {
    super(props);
    const { info = {} } = props;
    this.state = {
      doubleConfirm: info.doubleConfirm || {
        confirmMsg: _l('你确认对记录执行此操作吗？'),
        cancelName: _l('取消'),
        sureName: _l('确认'),
      },
      advancedSetting: info.advancedSetting,
      visible: props.visible,
      showApprovalTemplate: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.info, nextProps.info)) {
      const { info } = nextProps;
      this.state = {
        doubleConfirm: info.doubleConfirm || {
          confirmMsg: _l('你确认对记录执行此操作吗？'),
          cancelName: _l('取消'),
          sureName: _l('确认'),
        },
        advancedSetting: info.advancedSetting,
      };
    }
  }

  render() {
    const { advancedSetting = {}, showApprovalTemplate } = this.state;
    const { cloneInfo } = this.props;
    const {
      confirmcontent = '',
      enableremark = '',
      remarkname = '',
      remarkhint = '',
      remarkrequired = '',
      remarktype = '',
      remarkoptions = '[]',
    } = advancedSetting;
    return (
      <Dialog
        title={_l('确认层设置')}
        okText={_l('保存')}
        cancelText={_l('取消')}
        className="doubleConfirmDialog"
        width="560px"
        onCancel={() => {
          this.props.onCancel();
        }}
        onOk={() => {
          console.log(advancedSetting);
          const { doubleConfirm = {} } = this.state;
          const { confirmMsg = '', sureName = '', cancelName = '' } = doubleConfirm;
          this.props.onChange({
            doubleConfirm: {
              confirmMsg:
                confirmMsg.trim() || _.get(cloneInfo, 'doubleConfirm.confirmMsg') || _l('你确认对记录执行此操作吗？'),
              sureName: sureName.trim() || _.get(cloneInfo, 'doubleConfirm.sureName') || _l('确认'),
              cancelName: cancelName.trim() || _.get(cloneInfo, 'doubleConfirm.cancelName') || _l('取消'),
            },
            advancedSetting: {
              ...advancedSetting,
              remarkname: remarkname.trim() || _.get(cloneInfo, 'advancedSetting.remarkname') || _l('备注'),
            },
          });
        }}
        visible={this.props.visible}
      >
        <Wrap>
          <p className="Bold">{_l('提示信息')}</p>
          <p className="mTop24 bold400">{_l('标题')}</p>
          <input
            className="mTop10"
            value={_.get(this.state, 'doubleConfirm.confirmMsg')}
            onChange={event => {
              this.setState({
                doubleConfirm: {
                  ...this.state.doubleConfirm,
                  confirmMsg: event.target.value,
                },
              });
            }}
          />
          <p className="mTop24 bold400">{_l('详细内容')}</p>
          <input
            className="mTop10"
            value={confirmcontent}
            onChange={event => {
              this.setState({
                advancedSetting: {
                  ...advancedSetting,
                  confirmcontent: event.target.value,
                },
              });
            }}
          />
          <div className="line"></div>
          <p className="Bold">{_l('按钮文案')}</p>
          <div className="flexRow btnTxt alignItemsCenter mTop10">
            <span className="bold400">{_l('确认按钮')}</span>
            <input
              value={_.get(this.state, 'doubleConfirm.sureName')}
              onChange={event => {
                this.setState({
                  doubleConfirm: {
                    ...this.state.doubleConfirm,
                    sureName: event.target.value,
                  },
                });
              }}
            />
          </div>
          <div className="flexRow btnTxt alignItemsCenter mTop10">
            <span className="bold400">{_l('取消按钮')}</span>
            <input
              value={_.get(this.state, 'doubleConfirm.cancelName')}
              onChange={event => {
                this.setState({
                  doubleConfirm: {
                    ...this.state.doubleConfirm,
                    cancelName: event.target.value,
                  },
                });
              }}
            />
          </div>
          <div className="line"></div>
          <p className="Bold">{_l('填写备注')}</p>
          <p className="Gray_75 mTop16">{_l('开启后，用户可以在二次确认层中对按钮操作进行备注。')}</p>
          <Icon
            icon={enableremark === '1' ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="switchIcon Font50 Hand"
            onClick={() => {
              this.setState({
                advancedSetting: {
                  ...advancedSetting,
                  enableremark: enableremark === '1' ? '' : '1',
                },
              });
            }}
          />
          {enableremark === '1' && (
            <React.Fragment>
              <div className="flexRow btnTxt alignItemsCenter mTop10">
                <span className="bold400">{_l('备注名称')}</span>
                <input
                  value={remarkname}
                  onChange={event => {
                    this.setState({
                      advancedSetting: {
                        ...advancedSetting,
                        remarkname: event.target.value,
                      },
                    });
                  }}
                />
              </div>
              <div className="flexRow btnTxt alignItemsCenter mTop10">
                <span className="bold400">{_l('引导文字')}</span>
                <input
                  value={remarkhint}
                  onChange={event => {
                    this.setState({
                      advancedSetting: {
                        ...advancedSetting,
                        remarkhint: event.target.value,
                      },
                    });
                  }}
                />
              </div>

              <div className="flexRow btnTxt alignItemsCenter mTop10">
                <span></span>
                <Checkbox
                  className="checkBox InlineBlock flex"
                  text={<span>{_l('备注模版')}</span>}
                  checked={!!safeParse(remarkoptions).template}
                  onClick={() => {
                    this.setState({
                      advancedSetting: {
                        ...advancedSetting,
                        remarkoptions: !!safeParse(remarkoptions).template ? '' : JSON.stringify({ template: [] }),
                      },
                      showApprovalTemplate: !safeParse(remarkoptions).template,
                    });
                  }}
                />
              </div>
              {!!safeParse(remarkoptions).template && (
                <div className="flexRow btnTxt alignItemsCenter mTop10">
                  <span></span>
                  <div
                    className="remarkWrap flex flexRow"
                    onClick={() => {
                      this.setState({
                        showApprovalTemplate: true,
                      });
                    }}
                  >
                    <div className="flex">
                      <span className="ho">{_l('已设置')}</span>
                      {remarktype !== '1' && ` (${_l('允许用户修改')})`}
                    </div>
                    <Icon icon={'edit'} className="Gray_9e Hand LineHeight36 ThemeHoverColor3" />
                  </div>
                </div>
              )}
              <div className="flexRow btnTxt alignItemsCenter mTop10">
                <span></span>
                <Checkbox
                  className="checkBox InlineBlock flex"
                  text={<span>{_l('设为必填项')}</span>}
                  checked={remarkrequired === '1'}
                  onClick={() => {
                    this.setState({
                      advancedSetting: {
                        ...advancedSetting,
                        remarkrequired: remarkrequired === '1' ? '' : '1',
                      },
                    });
                  }}
                />
              </div>
            </React.Fragment>
          )}
          {showApprovalTemplate && (
            <OpinionTemplate
              title={_l('备注模版')}
              description={_l('预置常用项作为模板，帮助操作人快捷填写')}
              keys={[{ key: 'template', text: _l('模板') }]}
              opinionTemplate={{ opinions: safeParse(remarkoptions), inputType: remarktype === '1' ? 2 : 1 }}
              onSave={data => {
                this.setState({
                  advancedSetting: {
                    ...advancedSetting,
                    remarktype: data.inputType === 1 ? '' : '1',
                    remarkoptions: JSON.stringify(data.opinions),
                  },
                });
              }}
              onClose={() => this.setState({ showApprovalTemplate: false })}
            />
          )}
        </Wrap>
      </Dialog>
    );
  }
}

export default DoubleConfirmDialog;

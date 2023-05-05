import React from 'react';
import { Dialog, Icon, Checkbox } from 'ming-ui';
import styled from 'styled-components';
import _ from 'lodash';
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
`;

class DoubleConfirmDialog extends React.Component {
  constructor(props) {
    super(props);
    const { info } = props;
    this.state = {
      doubleConfirm: info.doubleConfirm || {
        confirmMsg: _l('你确认对记录执行此操作吗？'),
        cancelName: _l('取消'),
        sureName: _l('确认'),
      },
      advancedSetting: info.advancedSetting,
      visible: props.visible,
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
    const { advancedSetting = {} } = this.state;
    const { cloneInfo } = this.props;
    const {
      confirmcontent = '',
      enableremark = '',
      remarkname = '',
      remarkhint = '',
      remarkrequired = '',
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
          const { doubleConfirm = {} } = this.state;
          const { confirmMsg = '', sureName = '', cancelName = '' } = doubleConfirm;
          this.props.onChange({
            doubleConfirm: {
              confirmMsg:
                confirmMsg.trim() || _.get(cloneInfo, 'doubleConfirm.confirmMsg') || '你确认对记录执行此操作吗？',
              sureName: sureName.trim() || _.get(cloneInfo, 'doubleConfirm.sureName') || '确认',
              cancelName: cancelName.trim() || _.get(cloneInfo, 'doubleConfirm.cancelName') || '取消',
            },
            advancedSetting: {
              ...advancedSetting,
              remarkname: remarkname.trim() || _.get(cloneInfo, 'advancedSetting.remarkname') || '备注',
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
            value={this.state.doubleConfirm.confirmMsg}
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
              value={this.state.doubleConfirm.sureName}
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
              value={this.state.doubleConfirm.cancelName}
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
        </Wrap>
      </Dialog>
    );
  }
}

export default DoubleConfirmDialog;

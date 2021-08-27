import React from 'react';
import { Icon } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import cx from 'classnames';
import { Switch } from 'antd';
import withClickAway from 'ming-ui/decorators/withClickAway';
import styled from 'styled-components';
import { SYS } from 'src/pages/widgetConfig/config/widget';
const ChooseWidgetWrap = styled.div`
   {
    width: 300px;
    padding-bottom: 10px;
    height: auto;
    background: #fff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.15);
    border-radius: 3px;
    position: absolute;
    max-height: 900px;
    .searchWrapper {
      border-bottom: 1px solid #e0e0e0;
      margin: 8px 16px 0;
      display: flex;
      height: 38px;
      line-height: 38px;
      overflow: hidden;
      .cursorText {
        border: none;
        flex: 1;
        margin: 0;
        padding: 0;
      }
      .icon {
        width: 20px;
        line-height: 38px;
        color: #bdbdbd;
      }
    }
    .listBox {
      overflow: auto;
      max-height: 844px;
      &::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      // ::-webkit-scrollbar-thumb {
      //   width: 6px;
      //   height: 6px;
      //   border-radius: 6px;
      //   background: transparent;
      //   background-clip: padding-box;
      //   border: 2px solid transparent;
      // }
      // &.move {
      //   ::-webkit-scrollbar-thumb {
      //     background: rgba(187, 187, 187, 0.8);
      //     background-clip: padding-box;
      //   }
      // }
      .widgetList {
        padding: 8px 16px;
        &:hover {
          background: #f5f5f5;
          border-radius: 4px;
        }
        .widgetIcon {
          margin-right: 13px;
        }
        .ant-switch-small {
          min-width: 18px;
          height: 9px;
          line-height: 9px;
          vertical-align: middle;
          margin-right: 18px;
          .ant-switch-handle {
            width: 5px;
            height: 5px;
          }
          .ant-switch-inner {
            margin: 0;
          }
          &.ant-switch-checked {
            .ant-switch-handle {
              left: calc(100% - 5px - 2px);
            }
            .ant-switch-inner {
              margin: 0;
            }
          }
        }
      }
    }
  }
`;
@withClickAway
export default class ChooseWidget extends React.Component {
  constructor(props) {
    super(props);
    const { writeObject, addRelationControl = [], widgetList = [], writeControls = [], hideFn } = props;
    this.state = {
      data: writeObject !== 1 ? addRelationControl : widgetList,
      keyWords: '',
      initData: writeObject !== 1 ? addRelationControl : widgetList,
      writeControls,
    };
    this.chooseDia = null;
  }
  componentDidMount() {
    const { writeObject, addRelationControl = [], widgetList = [], hideFn, writeControls = [] } = this.props;
    this.setState({
      keyWords: '',
      data: writeObject !== 1 ? addRelationControl : widgetList,
      initData: writeObject !== 1 ? addRelationControl : widgetList,
      writeControls,
    });
    this.setPoint();
    $('.cursorText').focus();
    // $('.listBox').scroll(function() {
    //   $('.listBox').addClass('move');
    //   setTimeout(() => {
    //     $('.listBox').removeClass('move');
    //   }, 500);
    // });
  }
  componentWillReceiveProps(nextProps) {
    const {
      writeObject,
      addRelationControl = [],
      widgetList = [],
      writeControls = [],
      showChooseWidgetDialog,
    } = nextProps;
    if (this.props.writeControls !== writeControls || showChooseWidgetDialog) {
      this.setState({
        data: (writeObject !== 1 ? addRelationControl : widgetList).filter(
          it => it.controlName.indexOf(this.state.keyWords) >= 0,
        ),
        writeControls,
      });
    }
  }
  setPoint = () => {
    let wh = $(window).height();
    let ot = $('.noAppointFilter').offset().top;
    let ol = $('.noAppointFilter').offset().left;
    let ds = $(document.documentElement).scrollTop();
    let icoimg_h = $('.noAppointFilter').height();
    let bh = wh - icoimg_h - [ot - ds];
    let diaH = $(this.chooseDia).height();
    let hh = $(this.chooseDia).find('.listBox').height();
    $(this.chooseDia)
      .css({
        top: diaH + 24 > bh ? 'initial' : ot + icoimg_h,
        bottom: diaH + 24 > bh ? 24 : 'initial',
        left: ol,
      })
      .find('.listBox')
      .css({
        height: wh - 106 > hh ? hh : wh - 106,
      });
  };
  render() {
    const { writeObject, addRelationControl = [], widgetList = [], SwitchFn, hideFn } = this.props;
    const { data = [], keyWords, writeControls = [], initData = [] } = this.state;
    // if (writeObject !== 1 && addRelationControl.length <= 0) {
    //   alert(_l('请选择关联字段'));
    //   hideFn();
    //   return;
    // }
    // if (data.length <= 0) {
    //   alert(_l('请选择有效的关联字段'));
    //   hideFn();
    //   return;
    // }
    return (
      <div
        className="ChooseWidgetDialogWrap"
        style={{ position: 'fixed', top: 0, left: 0, bottom: 0, right: 0, zIndex: 1000 }}
        onClick={() => {
          hideFn();
        }}
      >
        <ChooseWidgetWrap
          ref={chooseDia => {
            this.chooseDia = chooseDia;
          }}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <div className="searchWrapper">
            <Icon icon="search" className="Font18" />
            <input
              type="text"
              className="cursorText"
              placeholder={_l('搜索')}
              onChange={event => {
                const searchValue = _.trim(event.target.value);
                if (!searchValue) {
                  this.setState({
                    keyWords: '',
                    data: writeObject !== 1 ? addRelationControl : widgetList,
                  });
                } else {
                  this.setState({
                    keyWords: searchValue,
                    data: initData.filter(it => it.controlName.indexOf(searchValue) >= 0),
                  });
                }
              }}
              value={keyWords || ''}
            />
            {keyWords && (
              <Icon
                icon="cancel"
                className="Font18 Hand"
                onClick={() => {
                  this.setState({
                    keyWords: '',
                    data: writeObject !== 1 ? addRelationControl : widgetList,
                  });
                }}
              />
            )}
          </div>
          <div className="listBox mTop10">
            {data.length > 0 ? (
              data.map((item, index) => {
                if (
                  (item.type === 29 && item.enumDefault === 2 && item.advancedSetting.showtype === '2') || //排除关联表多条
                  SYS.includes(item.controlId) //排除系统字段
                ) {
                  return '';
                }
                let isChecked = writeControls.map(o => o.controlId).includes(item.controlId);
                return (
                  <div
                    className="widgetList overflow_ellipsis WordBreak Hand"
                    key={`widgetList-${index}`}
                    onClick={() => {
                      if (!isChecked) {
                        let Controls = this.props.writeControls.concat({
                          controlId: item.controlId,
                          type: this.props.isDisable(item.type) ? 1 : item.required ? 3 : 2,
                        });
                        SwitchFn(Controls);
                      } else {
                        SwitchFn(writeControls.filter(o => o.controlId !== item.controlId));
                      }
                    }}
                  >
                    <Switch checked={isChecked} size="small" />
                    <span className="Gray_75">
                      <Icon icon={getIconByType(item.type)} className={cx('Font14 Gray_9e widgetIcon')} />
                      <span className="Font13 Gray">
                        {item.controlName || (item.type === 22 ? _l('分段') : _l('备注'))}
                      </span>
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="Gray_75 TxtCenter pTop20 Font14 pBottom20">{_l('无可填写字段')}</div>
            )}
          </div>
        </ChooseWidgetWrap>
      </div>
    );
  }
}

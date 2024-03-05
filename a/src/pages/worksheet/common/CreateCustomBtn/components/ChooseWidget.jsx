import React from 'react';
import { Icon } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import cx from 'classnames';
import withClickAway from 'ming-ui/decorators/withClickAway';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui';
import { formatControlsChildBySectionId, getRealData } from 'src/pages/worksheet/common/CreateCustomBtn/utils.js';
import _ from 'lodash';

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
      .widgetList {
        padding: 8px 16px;
        .childCon {
          position: relative;
          padding-left: 8px;
          &::before {
            content: '';
            position: absolute;
            left: 6px;
            top: 10px;
            width: 8px;
            height: calc(100% - 30px);
            border-left: 1px solid #e0e0e0;
            border-bottom: 1px solid #e0e0e0;
            border-radius: 2px;
          }
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
    const { writeControls = [] } = props;
    this.state = {
      data: this.getData(props),
      keyWords: '',
      initData: this.getData(props),
      writeControls,
      closeList: [],
    };
    this.chooseDia = null;
  }
  componentDidMount() {
    const { writeControls = [] } = this.props;
    this.setState({
      keyWords: '',
      data: this.getData(this.props),
      initData: this.getData(this.props),
      writeControls,
    });
    this.setPoint();
    $('.cursorText').focus();
  }
  componentWillReceiveProps(nextProps) {
    const { writeControls = [], showChooseWidgetDialog } = nextProps;
    if (this.props.writeControls !== writeControls || showChooseWidgetDialog) {
      this.setState({
        data: this.getData(nextProps).filter(it => it.controlName.indexOf(this.state.keyWords) >= 0),
        writeControls,
      });
    }
  }
  getData = props => {
    const { writeObject, relationControls = [], widgetList = [] } = props;
    return writeObject !== 1 ? relationControls : widgetList; //排除子表
  };
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

  handSet = (item, isAdd) => {
    const controls = this.getData(this.props);
    const writeControlsIds = this.state.writeControls.map(it => it.controlId);
    const list = getRealData(
      item,
      controls.filter(o => writeControlsIds.includes(o.controlId)),
      controls,
      isAdd,
    );
    const othersAdd = list.filter(o => !writeControlsIds.includes(o.controlId) && ![52].includes(o.type));
    const othersDel = this.state.writeControls.filter(o => !list.map(it => it.controlId).includes(o.controlId));
    this.props.SwitchFn(
      isAdd
        ? this.state.writeControls.concat(
            othersAdd.map(o => {
              return {
                controlId: o.controlId,
                type: this.props.isDisable(o.type) ? 1 : o.required ? 3 : 2, //1：只读 2：填写 3：必填
              };
            }),
          )
        : this.state.writeControls.filter(o => !othersDel.map(it => it.controlId).includes(o.controlId)),
    );
  };

  renderCon = item => {
    const { closeList = [], writeControls = [] } = this.state;
    if (
      ([29, 51].includes(item.type) && item.advancedSetting.showtype === '2') || //排除关联表多条
      ALL_SYS.includes(item.controlId) //排除系统字段
    ) {
      return '';
    }
    const ids = writeControls.map(o => o.controlId);
    const { child = [] } = item;
    const checkedChildNum = child.filter(o => ids.includes(o.controlId)).length;
    let isChecked = ids.includes(item.controlId) || (checkedChildNum >= child.length && child.length > 0);
    return (
      <div className="widgetList overflow_ellipsis WordBreak Hand" key={`widgetList-${item.controlId}`}>
        <div className="flexRow alignItemsCenter">
          <div
            className="flex flexRow alignItemsCenter Hand"
            onClick={() => {
              this.handSet(item, !isChecked);
            }}
          >
            <Checkbox
              className="InlineBlock"
              // size="small"
              checked={isChecked}
              clearselected={checkedChildNum > 0 && child.length > checkedChildNum}
              text={null}
            />
            <span className="Gray_75 flex flexRow alignItemsCenter">
              <Icon icon={getIconByType(item.type)} className={cx('Font14 Gray_9e widgetIcon')} />
              <span className="Font13 Gray WordBreak overflow_ellipsis">
                {item.controlName || (item.type === 22 ? _l('分段') : _l('备注'))}
              </span>
            </span>
          </div>
          {child.length > 0 && (
            <Icon
              icon={closeList.includes(item.controlId) ? 'expand_less' : 'expand_more'}
              className={cx('Font18 Hand ThemeHoverColor3 Gray_9e widgetIcon')}
              onClick={e => {
                e.stopPropagation();
                this.setState({
                  closeList: !closeList.includes(item.controlId)
                    ? closeList.concat(item.controlId)
                    : closeList.filter(o => o !== item.controlId),
                });
              }}
            />
          )}
        </div>
        {child.length > 0 && !closeList.includes(item.controlId) && (
          <div className="childCon">
            {child.map(o => {
              return this.renderCon(o);
            })}
          </div>
        )}
      </div>
    );
  };

  render() {
    const { hideFn } = this.props;
    const { data = [], keyWords, initData = [] } = this.state;
    const list = keyWords ? data : formatControlsChildBySectionId(data);
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
                    data: this.getData(this.props),
                  });
                } else {
                  this.setState({
                    keyWords: searchValue,
                    data: initData.filter(
                      it => it.controlName.toLocaleLowerCase().indexOf(searchValue.toLocaleLowerCase()) >= 0,
                    ),
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
                    data: this.getData(this.props),
                  });
                }}
              />
            )}
          </div>
          <div className="listBox mTop10">
            {list.length > 0 ? (
              list
                .sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1))
                .map(item => {
                  return this.renderCon(item);
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

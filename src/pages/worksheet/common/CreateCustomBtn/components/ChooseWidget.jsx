import React from 'react';
import { Icon, Checkbox } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import cx from 'classnames';
import withClickAway from 'ming-ui/decorators/withClickAway';
import styled from 'styled-components';
import {
  formatControlsChildBySectionId,
  getRealData,
  canNotForCustomWrite,
  getFormatCustomWriteData,
} from 'src/pages/worksheet/common/CreateCustomBtn/utils.js';
import _ from 'lodash';

const ChooseWidgetWrap = styled.div`
   {
    z-index: 1;
    width: 300px;
    padding-bottom: 10px;
    height: auto;
    background: #fff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.15);
    border-radius: 3px;
    max-height: ${window.innerHeight - 24}px;
    .searchWrapper {
      border-bottom: 1px solid #e0e0e0;
      margin: 8px 16px 0;
      display: flex;
      height: 38px;
      line-height: 38px;
      overflow: hidden;
      flex-shrink: 0;
      min-height: 0;
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
    .selectAll,
    .clearAll {
      background: #f5f5f5;
      border-radius: 3px;
    }
    .listBox {
      overflow: auto;
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
    const { writeControls = [], writeObject, relationControls, widgetList } = nextProps;
    if (
      this.props.writeControls !== writeControls ||
      this.props.relationControls !== relationControls ||
      this.props.widgetList !== widgetList ||
      writeObject !== this.props.writeObject
    ) {
      const data = this.getData(nextProps).filter(it => it.controlName.indexOf(this.state.keyWords) >= 0);
      this.setState({
        data,
        writeControls,
      });
    }
  }

  setPoint = () => {
    let wh = $(window).height();
    let ot = $('.noAppointFilter').offset().top;
    let ol = $('.noAppointFilter').offset().left;
    let ds = $(document.documentElement).scrollTop();
    let btnH = $('.noAppointFilter').height();
    let bh = wh - btnH - [ot - ds];
    let diaH = $(this.chooseDia).height();
    $(this.chooseDia).css({
      top: diaH + 24 > bh ? 'initial' : ot + btnH,
      bottom: diaH + 24 > bh ? 24 : 'initial',
      left: ol,
    });
  };

  getData = props => {
    const { writeObject, relationControls = [], widgetList = [] } = props;
    return (writeObject !== 1 ? relationControls : widgetList).filter(o => !canNotForCustomWrite(o));
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
    this.props.onChange(
      isAdd
        ? this.state.writeControls.concat(othersAdd.map(o => getFormatCustomWriteData(o)))
        : this.state.writeControls.filter(o => !othersDel.map(it => it.controlId).includes(o.controlId)),
    );
  };

  selectOrClearAll = isSelect => {
    if (!isSelect) {
      this.setState({
        writeControls: [],
      });
      this.props.onChange([]);
    } else {
      let writeControls = [];
      this.state.data
        .filter(
          item =>
            !(
              canNotForCustomWrite(item) || //排除表格类的显示方式
              ALL_SYS.includes(item.controlId)
            ), //排除系统字段
        )
        .map(o => {
          writeControls = writeControls.concat(
            (o.child || []).length > 0 ? o.child.map(it => getFormatCustomWriteData(it)) : getFormatCustomWriteData(o),
          );
        });
      this.props.onChange(writeControls);
    }
  };

  renderCon = item => {
    const { closeList = [], writeControls = [] } = this.state;
    if (
      canNotForCustomWrite(item) || //排除表格类的显示方式
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
    const { onClose } = this.props;
    const { data = [], keyWords, initData = [] } = this.state;
    const list = keyWords ? data : formatControlsChildBySectionId(data);
    return (
      <div
        className="ChooseWidgetDialogWrap"
        style={{ position: 'fixed', top: 0, left: 0, bottom: 0, right: 0, zIndex: 1000 }}
        onClick={onClose}
      >
        <ChooseWidgetWrap
          className="flexColumn Absolute"
          ref={chooseDia => {
            this.chooseDia = chooseDia;
          }}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <div className="searchWrapper h100">
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
          {!keyWords && (
            <div className="con flexRow mTop15">
              <span
                className="selectAll Hand Gray_75 ThemeHoverColor3 pTop8 pBottom8 pLeft16 pRight16 mLeft16"
                onClick={() => this.selectOrClearAll(true)}
              >
                {_l('全选')}
              </span>
              <span
                className="clearAll Hand Gray_75 ThemeHoverColor3 pTop8 pBottom8 pLeft16 pRight16 mLeft10"
                onClick={() => this.selectOrClearAll()}
              >
                {_l('清空')}
              </span>
            </div>
          )}
          <div className="listBox flex mTop10">
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

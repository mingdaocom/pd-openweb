import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Input } from 'ming-ui/antd-components';
import {
  canNotForCustomWrite,
  formatControlsChildBySectionId,
  getFormatCustomWriteData,
  getRealData,
} from 'src/pages/worksheet/common/CreateCustomBtn/utils.js';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { ALL_SYS } from 'src/utils/domain/control/widget';

const ChooseWidgetWrap = styled.div`
  width: 300px;
  padding-bottom: 10px;
  height: auto;
  max-height: calc(100vh - 200px);
  .searchWrapper {
    border-bottom: 1px solid var(--color-border-secondary);
    margin: 8px 16px 0;
    display: flex;
    height: 38px;
    line-height: 38px;
    overflow: hidden;
    flex-shrink: 0;
    min-height: 0;
    .icon {
      width: 20px;
      line-height: 38px;
      color: var(--color-text-disabled);
    }
  }
  .selectAll,
  .clearAll {
    background: var(--color-background-secondary);
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
          border-left: 1px solid var(--color-border-secondary);
          border-bottom: 1px solid var(--color-border-secondary);
          border-radius: 2px;
        }
      }
      .widgetIcon {
        margin-right: 13px;
      }
      .hap-switch-small {
        min-width: 18px;
        height: 9px;
        line-height: 9px;
        vertical-align: middle;
        margin-right: 18px;
        .hap-switch-handle {
          width: 5px;
          height: 5px;
        }
        .hap-switch-inner {
          margin: 0;
        }
        &.hap-switch-checked {
          .hap-switch-handle {
            left: calc(100% - 5px - 2px);
          }
          .hap-switch-inner {
            margin: 0;
          }
        }
      }
    }
  }
`;
class ChooseWidget extends React.Component {
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
  }

  componentDidMount() {
    const { writeControls = [] } = this.props;
    this.setState({
      keyWords: '',
      data: this.getData(this.props),
      initData: this.getData(this.props),
      writeControls,
    });
    $('.cursorText').focus();
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { writeControls = [], writeObject, relationControls, widgetList } = this.props;

      if (
        prevProps.writeControls !== writeControls ||
        prevProps.relationControls !== relationControls ||
        prevProps.widgetList !== widgetList ||
        writeObject !== prevProps.writeObject
      ) {
        const data = this.getData(this.props).filter(it => it.controlName.indexOf(this.state.keyWords) >= 0);
        this.setState({
          data,
          writeControls,
        });
      }
    }
  }

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
            <Checkbox checked={isChecked} indeterminate={checkedChildNum > 0 && child.length > checkedChildNum}>
              {null}
            </Checkbox>
            <span className="textSecondary flex flexRow alignItemsCenter mLeft8">
              <Icon icon={getIconByType(item.type)} className={cx('Font14 textTertiary widgetIcon')} />
              <span className="Font13 textPrimary WordBreak overflow_ellipsis">
                {item.controlName || (item.type === 22 ? _l('分段') : _l('备注'))}
              </span>
            </span>
          </div>
          {child.length > 0 && (
            <Icon
              icon={closeList.includes(item.controlId) ? 'expand_less' : 'expand_more'}
              className={cx('Font18 Hand hoverColorPrimary textTertiary widgetIcon')}
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
    const { data = [], keyWords, initData = [] } = this.state;
    const list = keyWords ? data : formatControlsChildBySectionId(data);
    return (
      <ChooseWidgetWrap className="flexColumn">
        <div className="searchWrapper h100">
          <Input
            className="flex"
            variant="borderless"
            prefix={<Icon icon="search" className="Font18" />}
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
              className="selectAll Hand textSecondary hoverColorPrimary pTop8 pBottom8 pLeft16 pRight16 mLeft16"
              onClick={() => this.selectOrClearAll(true)}
            >
              {_l('全选')}
            </span>
            <span
              className="clearAll Hand textSecondary hoverColorPrimary pTop8 pBottom8 pLeft16 pRight16 mLeft10"
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
            <div className="textSecondary TxtCenter pTop20 Font14 pBottom20">{_l('无可填写字段')}</div>
          )}
        </div>
      </ChooseWidgetWrap>
    );
  }
}
export default ChooseWidget;

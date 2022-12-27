import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Icon, Checkbox, Tooltip } from 'ming-ui';
import './ActionDropDown.less';
import { getTextById, getNewDropDownData, getControlSpecialName, getNewIconByType } from '../config';
import _ from 'lodash';
export default class DropDownItem extends Component {
  static propTypes = {
    values: PropTypes.arrayOf(PropTypes.shape({})),
    dropDownData: PropTypes.array,
    onChange: PropTypes.func,
    className: PropTypes.string,
    actionType: PropTypes.number,
    actionError: PropTypes.bool,
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      extendId: [],
      keyword: '',
      dropDownData: props.dropDownData || [],
      originData: props.dropDownData || [],
    };
  }

  componentDidMount() {
    const { dropDownData = [], actionType } = this.props;
    const newDropDownData = getNewDropDownData(dropDownData, actionType);
    this.setState({
      dropDownData: newDropDownData,
      originData: newDropDownData,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { dropDownData = [], actionType } = nextProps;
    if (nextProps.actionType !== this.props.actionType) {
      const newDropDownData = getNewDropDownData(dropDownData, actionType);
      this.setState({
        dropDownData: newDropDownData,
        originData: newDropDownData,
      });
    }
  }

  handleSearch = _.throttle(() => {
    let { keyword, originData } = this.state;
    let extendId = [];
    let dropDownDataFilter = [];
    if (keyword) {
      originData.map(item => {
        let childFilter = [];
        if (_.includes([29, 34], item.type)) {
          childFilter =
            item.relationControls && item.relationControls.length > 0
              ? item.relationControls.filter(child => child.controlName.indexOf(_.trim(keyword)) > -1)
              : [];
        }
        if (childFilter.length > 0) {
          extendId.push(item.controlId);
        }
        if (item.controlName.indexOf(_.trim(keyword)) > -1 || childFilter.length > 0) {
          dropDownDataFilter.push({ ...item, relationControls: childFilter });
        }
      });
    }
    this.setState({
      dropDownData: keyword ? dropDownDataFilter : originData,
      extendId: keyword ? extendId : this.state.extendId,
    });
  }, 100);

  updateExtendId(item) {
    if (_.includes([29, 34], item.type) && item.relationControls && item.relationControls.length > 0) {
      this.setState({
        extendId: _.includes(this.state.extendId, item.controlId)
          ? this.state.extendId.filter(it => it !== item.controlId)
          : this.state.extendId.concat([item.controlId]),
      });
      return false;
    }
    this.updateValues(item.controlId);
  }
  updateValues(controlId, childControlId) {
    const { values, onChange } = this.props;
    const { originData = [] } = this.state;
    let newValues = _.cloneDeep(values);
    let allRe = null;
    //更新主字段
    const pIndex = _.findIndex(
      newValues,
      val => val.controlId === controlId && val.childControlIds && !val.childControlIds.length,
    );
    if (!childControlId) {
      if (pIndex > -1) {
        newValues.map(val => {});
        newValues = newValues.filter(
          val =>
            val.controlId !== controlId ||
            (val.controlId === controlId && val.childControlIds && val.childControlIds.length > 0),
        );
      } else {
        newValues.push({
          controlId,
          childControlIds: [],
        });
      }
    } else {
      const curIndex = _.findIndex(
        newValues,
        val => val.controlId === controlId && val.childControlIds && val.childControlIds.length,
      );
      const currentItem = newValues[curIndex];
      if (curIndex > -1) {
        if (currentItem.childControlIds && _.includes(currentItem.childControlIds, childControlId)) {
          currentItem.childControlIds = currentItem.childControlIds.filter(child => child !== childControlId);
          if (!currentItem.childControlIds.length) {
            currentItem.controlId = '';
          }
        } else {
          currentItem.childControlIds.push(childControlId);
          originData.map(or => {
            if (or.controlId === controlId && or.showControls) {
              allRe = or.showControls.length;
            }
          });
        }
      } else {
        newValues.push({
          controlId,
          childControlIds: [childControlId],
        });
      }
    }
    newValues = newValues.filter(val => val.controlId || val.childControlIds.length);
    onChange('controls', newValues);
  }

  getTextByValue() {
    const { dropDownData } = this.props;
    const currentArr = getTextById(dropDownData, this.props.values) || [];
    return (
      <Fragment>
        {currentArr.map(item => {
          return (
            <span className={cx('valueText', { disabled: item.isDelete })}>
              <Tooltip
                disable={!item.isDel}
                text={<span>{_l('ID: %0', item.controlId)}</span>}
                popupPlacement="bottom"
              >
                <span className="ellipsis controlNameBox">{item.name}</span>
              </Tooltip>
              <i
                className="icon-close"
                onClick={e => {
                  e.stopPropagation();
                  this.updateValues(item.controlId, item.childControlId);
                }}
              />
            </span>
          );
        })}
      </Fragment>
    );
  }
  render() {
    const { values = [], actionError } = this.props;
    const { extendId, keyword, visible, dropDownData } = this.state;
    const menu = (
      <div className="ruleDropDownItemCon">
        <Fragment>
          <div className="ruleSearchWrap">
            <input
              type="text"
              value={keyword}
              placeholder={_l('搜索字段')}
              onChange={e => this.setState({ keyword: e.target.value }, this.handleSearch)}
            />
            <Icon icon="workflow_find" className="search Gray_9e Font16" />
            {keyword && (
              <Icon
                icon="close"
                onClick={() => this.setState({ keyword: '' }, this.handleSearch)}
                className="close pointer Font16"
              />
            )}
          </div>

          {dropDownData.length > 0 ? (
            dropDownData.map(item => {
              return (
                <Fragment>
                  <div className="ruleDropDownItem Hand" onClick={() => this.updateExtendId(item)}>
                    <Checkbox
                      checked={
                        _.findIndex(
                          values,
                          val => val.controlId === item.controlId && val.childControlIds && !val.childControlIds.length,
                        ) > -1
                      }
                      onClick={(checked, value, e) => {
                        e.stopPropagation();
                        this.updateValues(item.controlId);
                      }}
                    />
                    <Icon icon={getNewIconByType(item)} className="Font14 Gray_9e mLeft14 mRight6" />
                    <span className="ellipsis controlNameBox">
                      {item.controlName || getControlSpecialName(item.type)}
                    </span>
                    {item.relationControls && item.relationControls.length > 0 ? (
                      <i
                        className={cx(
                          'iconDown mLeft5',
                          _.includes(extendId, item.controlId) ? 'icon-arrow-up-border' : 'icon-arrow-down-border',
                        )}
                      />
                    ) : null}
                  </div>
                  {item.relationControls && _.includes(extendId, item.controlId) ? (
                    <Fragment>
                      {item.relationControls.map(child => {
                        return (
                          <div
                            className="childItem Hand"
                            onClick={() => this.updateValues(item.controlId, child.controlId)}
                          >
                            <Checkbox
                              checked={_.some(
                                values,
                                val =>
                                  val.controlId === item.controlId &&
                                  val.childControlIds &&
                                  _.includes(val.childControlIds, child.controlId),
                              )}
                            />
                            <Icon icon={getNewIconByType(child)} className="Font14 Gray_9e mLeft14 mRight6" />
                            <span className="ellipsis controlNameBox">
                              {child.controlName || getControlSpecialName(child.type)}
                            </span>
                          </div>
                        );
                      })}
                    </Fragment>
                  ) : null}
                </Fragment>
              );
            })
          ) : (
            <div className="pTop20 pBottom20 LineHeight80 TxtCenter Gray_9e">{_l('暂无搜索结果')}</div>
          )}
        </Fragment>
      </div>
    );

    return (
      <Trigger
        popupVisible={visible}
        onPopupVisibleChange={visible => {
          this.setState({ visible });
        }}
        action={['click']}
        mouseEnterDelay={0.1}
        popupAlign={{ points: ['tl', 'bl'], offset: [0, 4] }}
        popup={menu}
        getPopupContainer={() => this.box}
      >
        <div className={cx('fixedRuleDropdownSelected', { errorBorder: actionError })} ref={con => (this.box = con)}>
          <span className="dropDownLabel">
            {values.length ? this.getTextByValue() : <span className="Gray_9e LineHeight34">{_l('选择字段')}</span>}
          </span>
          <span className="iconArrow">
            <i className="icon-arrow-down-border Gray_9e" />
          </span>
        </div>
      </Trigger>
    );
  }
}

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Icon, Checkbox, Tooltip } from 'ming-ui';
import './ActionDropDown.less';
import { getTextById, getNewDropDownData, getNewIconByType } from '../config';
import _ from 'lodash';
import { isSheetDisplay } from '../../../../widgetConfig/util';
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

    const defaultData = getNewDropDownData(props.dropDownData, props.actionType) || [];
    this.state = {
      visible: false,
      extendId: [],
      keyword: '',
      dropDownData: defaultData,
      originData: defaultData,
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
    const extendId = [];

    const filterFn = item =>
      (item.controlName || '').search(new RegExp(keyword.trim().replace(/([,.+?:()*\[\]^$|{}\\-])/g, '\\$1'), 'i')) !==
      -1;

    function treeFilter() {
      const filterData = [];
      originData.forEach(item => {
        let newRelationData = [];
        if (!_.isEmpty(item.relationControls)) {
          const childFilter = item.relationControls
            .map(re => ({ ...re, relationControls: (re.relationControls || []).filter(i => filterFn(i)) }))
            .filter(i => {
              if (!_.isEmpty(i.relationControls)) extendId.push(i.controlId);
              return !_.isEmpty(i.relationControls) || filterFn(i);
            });

          newRelationData = _.isEmpty(childFilter)
            ? (item.relationControls || []).filter(i => filterFn(i))
            : childFilter;

          if (!_.isEmpty(newRelationData)) {
            extendId.push(item.controlId);
          }
        }
        if (filterFn(item) || !_.isEmpty(newRelationData)) {
          filterData.push(item.relationControls ? { ...item, relationControls: newRelationData } : item);
        }
      });
      return filterData;
    }

    this.setState({
      dropDownData: keyword ? treeFilter() : originData,
      extendId: keyword ? _.uniq(extendId) : [],
    });
  }, 100);

  updateExtendId(item) {
    this.setState({
      extendId: _.includes(this.state.extendId, item.controlId)
        ? this.state.extendId.filter(it => it !== item.controlId)
        : this.state.extendId.concat([item.controlId]),
    });
  }
  updateValues(parentId, controlId) {
    const { values, onChange } = this.props;
    let newValues = values.concat([]);

    // 更新主字段
    if (!parentId) {
      newValues = _.find(newValues, val => val.controlId === controlId && _.isEmpty(val.childControlIds))
        ? newValues.filter(val => !(val.controlId === controlId && _.isEmpty(val.childControlIds)))
        : newValues.concat([
            {
              controlId,
              childControlIds: [],
            },
          ]);
    } else {
      const currentValue = _.find(newValues, val => val.controlId === parentId && !_.isEmpty(val.childControlIds));
      if (currentValue) {
        const newChildControlIds = _.includes(currentValue.childControlIds || [], controlId)
          ? (currentValue.childControlIds || []).filter(i => i !== controlId)
          : (currentValue.childControlIds || []).concat([controlId]);

        newValues = newValues.filter(i => !(i.controlId === parentId && !_.isEmpty(i.childControlIds)));
        if (!_.isEmpty(newChildControlIds)) {
          newValues.push({
            controlId: parentId,
            childControlIds: newChildControlIds,
          });
        }
      } else {
        newValues.push({
          controlId: parentId,
          childControlIds: [controlId],
        });
      }
    }
    onChange('controls', newValues);
  }

  getTextByValue() {
    const { values = [], actionType, dropDownData } = this.props;
    const currentArr = getTextById(dropDownData, values, actionType) || [];
    return (
      <Fragment>
        {currentArr.map(item => {
          return (
            <span className={cx('valueText', { disabled: item.isDelete })}>
              <Tooltip disable={!item.isDel} text={<span>{_l('ID: %0', item.controlId)}</span>} popupPlacement="bottom">
                <span className="ellipsis controlNameBox">{item.name}</span>
              </Tooltip>
              <i
                className="icon-close"
                onClick={e => {
                  e.stopPropagation();
                  this.updateValues(item.parentId, item.controlId);
                }}
              />
            </span>
          );
        })}
      </Fragment>
    );
  }

  renderChecked(item, parentControl = {}) {
    const { values = [], actionType } = this.props;
    const findChildItem = id => _.find(values, v => v.controlId === id && _.isEmpty(v.childControlIds));

    const hasParentControl = isSheetDisplay(parentControl) || _.get(parentControl, 'type') === 34;

    const checked = !hasParentControl
      ? findChildItem(item.controlId)
      : _.includes(
          _.get(
            _.find(values, v => v.controlId === parentControl.controlId && !_.isEmpty(v.childControlIds)),
            'childControlIds',
          ) || [],
          item.controlId,
        );
    // 关联多条列表必填不能配置
    const disabled =
      (isSheetDisplay(item) && actionType === 5) || (item.type === 52 && _.includes([3, 4, 5, 6], actionType));
    return (
      <Checkbox
        checked={!!checked}
        disabled={disabled}
        onClick={(checked, value, e) => {
          e.stopPropagation();
          if (disabled) return;
          this.updateValues(hasParentControl ? parentControl.controlId : '', item.controlId);
        }}
      />
    );
  }

  renderItem(item = {}, parentControl = {}, deepIndex) {
    const { extendId = [] } = this.state;
    const showArrow = item.relationControls && item.relationControls.length > 0;
    // 标签页内字段按普通字段来存，业务规则针对字段本身，不考虑父子，父子关系随时可变
    const parentId = item.sectionId ? '' : parentControl.controlId;

    return (
      <div
        className="ruleDropDownItem Hand"
        style={{ paddingLeft: `${deepIndex * 26 + 16}px` }}
        onClick={() => {
          // 有子集，只展开操作
          if (showArrow) {
            this.updateExtendId(item);
            return;
          }
          this.updateValues(parentId, item.controlId);
        }}
      >
        {this.renderChecked(item, parentControl)}
        <Icon icon={getNewIconByType(item)} className="Font14 Gray_9e mRight6" />
        <span className="ellipsis controlNameBox">{item.controlName}</span>
        {showArrow ? (
          <i
            className={cx(
              'iconDown mLeft5',
              _.includes(extendId, item.controlId) ? 'icon-arrow-up-border' : 'icon-arrow-down-border',
            )}
          />
        ) : null}
      </div>
    );
  }

  renderList(dropData, parentControl, deepIndex = 0) {
    const { extendId } = this.state;

    return dropData.map(item => {
      return (
        <Fragment>
          {this.renderItem(item, parentControl, deepIndex)}
          {!_.isEmpty(_.get(item, 'relationControls')) && _.includes(extendId, item.controlId)
            ? this.renderList(item.relationControls, item, deepIndex + 1)
            : null}
        </Fragment>
      );
    });
  }

  getAllControls(dropDownData = [], newValue = [], parentItem) {
    dropDownData.forEach(item => {
      if (!parentItem || (parentItem && parentItem.type === 52)) {
        newValue.push({
          controlId: item.controlId,
          childControlIds: [],
        });
      }
      if (item.relationControls && item.relationControls.length > 0) {
        if (_.includes([29, 34], item.type)) {
          newValue.push({
            controlId: item.controlId,
            childControlIds: item.relationControls.map(re => re.controlId),
          });
        }

        this.getAllControls(item.relationControls, newValue, item);
      }
    });
    return newValue;
  }

  renderContent(dropDownData) {
    return (
      <Fragment>
        {!this.state.keyword && (
          <div className="quickOperate">
            <button
              className="ThemeHoverColor3"
              onClick={() => {
                const newValue = this.getAllControls(dropDownData);
                this.props.onChange('controls', newValue);
              }}
            >
              {_l('全选')}
            </button>
            <button className="ThemeHoverColor3" onClick={() => this.props.onChange('controls', [])}>
              {_l('清空')}
            </button>
          </div>
        )}
        {this.renderList(dropDownData)}
      </Fragment>
    );
  }

  render() {
    const { values = [], actionError, activeTab = 0, disabled } = this.props;
    const { keyword, visible, dropDownData } = this.state;
    const menu = (
      <div className="ruleDropDownItemCon">
        <Fragment>
          <div className="ruleSearchWrap">
            <input
              type="text"
              autoFocus
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
            this.renderContent(dropDownData)
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
          if (disabled) return;
          this.setState({ visible });
        }}
        action={['click']}
        mouseEnterDelay={0.1}
        popupAlign={{ points: ['tl', 'bl'], offset: [0, 4] }}
        popup={menu}
        getPopupContainer={() => this.box}
      >
        <div
          className={cx('fixedRuleDropdownSelected', { errorBorder: actionError, disabled })}
          ref={con => (this.box = con)}
        >
          <span className="dropDownLabel">
            {!_.isEmpty(values) ? (
              this.getTextByValue()
            ) : (
              <span className="Gray_9e LineHeight34">{activeTab === 1 ? _l('对指定字段提示') : _l('选择字段')}</span>
            )}
          </span>
          <span className="iconArrow">
            <i className="icon-arrow-down-border Gray_9e" />
          </span>
        </div>
      </Trigger>
    );
  }
}

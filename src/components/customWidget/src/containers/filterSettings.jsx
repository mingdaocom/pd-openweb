/*
 * @Author: cloudZQY
 * @Module: FilterSettings
 * @Description: 筛选设置，任务专用
 * @Date: 2018-03-27 10:40:18
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 10:41:45
 */
/*
 * @Author: cloudZQY
 * @Module: FilterSettings
 * @Description: 筛选设置，任务专用
 * @Date: 2018-03-27 10:40:18
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 10:41:45
 */
/*
 * @Author: cloudZQY
 * @Module: FilterSettings
 * @Description: 筛选设置，任务专用
 * @Date: 2018-03-27 10:40:18
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 10:41:45
 */
/*
 * @Author: cloudZQY
 * @Module: FilterSettings
 * @Description: 筛选设置，任务专用
 * @Date: 2018-03-27 10:40:18
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 10:41:45
 */
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import 'tooltip';
import Checkbox from '../component/common/checkbox';
import { changeWidgetData } from '../redux/actions';
import config from '../config';
import ScrollView from 'ming-ui/components/ScrollView';

/**
 * 筛选设置
 * @class FilterSettings
 * @extends {React.Component}
 */
@connect(state => ({
  editWidgets: state.editWidgets,
  dragState: state.dragState,
  dragingItem: state.dragingItem,
}))
export default class FilterSettings extends React.Component {
  constructor(props) {
    super(props);
  }

  /**
   * 改变widget是否筛选
   * @param {string} id
   * @param {boolean} isFilter
   * @memberOf FilterSettings
   */
  handleChange(id, isFilter) {
    this.props.dispatch(
      changeWidgetData(id, {
        isFilter: isFilter,
      })
    );
  }

  render() {
    let { editWidgets } = this.props;
    let widgets = _.flatten(editWidgets, true);
    // 拖拽中的控件不在widgets中
    if (this.props.dragState === config.DRAG_STATE.MIDDLE_HALF_DRAGGING || this.props.dragState === config.DRAG_STATE.MIDDLE_NORMAL_DRAGGING) {
      widgets = widgets.concat(this.props.dragingItem);
    }
    widgets = widgets.map(item => {
      if (item.data && item.hasFilter !== undefined) {
        return item;
      }
      return null;
    });
    _.remove(widgets, item => item === null);
    return (
      <div className="extraSettings">
        <div className="extraSettingsTitle">
          {_l('可按以下字段筛选任务')}
          <span className="filterSettingsTip" data-tip={_l('勾选后，您可以在项目中筛选符合条件的任务。如：在项目中筛选“优先度”字段为“优先处理”的任务')}>
            <i className="icon-novice-circle fontIcon pointer iconFilterMessage" />
          </span>
        </div>
        {widgets.length === 0 ? (
          <div className="defaultSettings">
            <p>{_l('添加“选项”、“单选下拉菜单”类型的控件后，')}</p>
            <p>{_l('可在项目维度按此筛选任务。')}</p>
          </div>
        ) : (
          <div className="filterSettingsBox flexColumn">
            <ScrollView className="flex">
              {widgets.map((widget, index) => {
                return (
                  <div className="filterSettingsItem clearfix" key={index}>
                    <Checkbox
                      name={widget.data.controlName}
                      checked={widget.data.isFilter}
                      optionKey={widget.id}
                      toggleCheckbox={this.handleChange.bind(this)}
                    />
                  </div>
                );
              })}
            </ScrollView>
          </div>
        )}
      </div>
    );
  }
}

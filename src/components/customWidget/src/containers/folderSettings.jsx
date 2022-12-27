import React from 'react';
import { connect } from 'react-redux';
import 'src/components/tooltip/tooltip';
import Checkbox from '../component/common/checkbox';
import { changeTASKOptions } from '../redux/actions';
import config from '../config';
import ScrollView from 'ming-ui/components/ScrollView';
import _ from 'lodash';

@connect(state => ({
  editWidgets: state.editWidgets,
  dragState: state.dragState,
  dragingItem: state.dragingItem,
}))
export default class FolderSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHover: false,
    };
  }

  /**
   * 改变项目下的筛选项
   * @param {string} id
   */
  handleChange(id) {
    this.props.dispatch(
      changeTASKOptions(id, {
        display: false,
      })
    );
  }

  /**
   * 鼠标经过显示层
   */
  mouseOver() {
    clearTimeout(this.time);
    this.setState({ isHover: true });
  }

  /**
   * 鼠标离开隐藏层
   */
  mouseOut() {
    this.time = setTimeout(() => {
      this.setState({ isHover: false });
    }, 300);
  }

  render() {
    let { editWidgets } = this.props;
    let widgets = _.flatten(editWidgets, true);
    // 拖拽中的控件不在widgets中
    if (this.props.dragState === config.DRAG_STATE.MIDDLE_HALF_DRAGGING || this.props.dragState === config.DRAG_STATE.MIDDLE_NORMAL_DRAGGING) {
      widgets = widgets.concat(this.props.dragingItem);
    }
    widgets = widgets.map(item => {
      if (item.data && item.TASKOptions && item.TASKOptions.display) {
        return item;
      }
      return null;
    });
    _.remove(widgets, item => item === null);
    return (
      <div className="extraSettings">
        <div className="extraSettingsTitle relative">
          {_l('以下字段呈现在任务卡片上')}
          <span className="Font12">({_l('至多显示10个字段')})</span>
          <span
            className={widgets.length === 0 ? 'folderSettingsTip Hidden' : 'folderSettingsTip'}
            onMouseOver={() => this.mouseOver()}
            onMouseOut={() => this.mouseOut()}
          >
            <i className="icon-eye mRight5" />
            {_l('预览')}
          </span>
          <div
            className={this.state.isHover ? 'folderSettingsTipBox' : 'folderSettingsTipBox Hidden'}
            onMouseOver={() => this.mouseOver()}
            onMouseOut={() => this.mouseOut()}
          >
            <div className="Font14 mLeft10">进行中</div>
            <div className="folderSettingsTipMain">
              <div className="folderSettingsTipMainHead relative">
                <i className="icon-check_box Font18 mRight5" />
                任务标题
                <i className="icon-task_custom_personnel Font24" />
                <i className="icon-star-hollow3 Font18" />
                <div className="folderSettingsTipM">
                  <i className="icon-bellSchedule mRight5" />周一
                </div>
              </div>
              <span className="folderSettingsLine" />
              <ul className="customFolderSettingsList">
                {widgets.map((widget, index) => {
                  return (
                    <li>
                      <i className={widget.icon} />
                      {widget.data.controlName}:
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        {widgets.length === 0 ? (
          <div className="defaultSettings defaultFolderSettings">
            <p>{_l('暂未选择字段')}</p>
          </div>
        ) : (
          <div className="filterSettingsBox flexColumn folderSettingsBox">
            <ScrollView className="flex">
              {widgets.map((widget, index) => {
                return (
                  <div className="filterSettingsItem clearfix folderSettingsItem" key={index}>
                    <Checkbox name={widget.data.controlName} checked={true} optionKey={widget.id} toggleCheckbox={this.handleChange.bind(this)} />
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

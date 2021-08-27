/*
 * @Author: cloudZQY
 * @Module: Contents
 * @Description: 对不同情况呈现的组件进行处理
 * @Date: 2018-03-27 09:49:48
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 09:50:11
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import config from '../config';
import Header from '../component/pure/Header';
import _ from 'lodash';
import DragPreview from './dragPreview';
import WidgetBox from './widgetBox';
import EditBox from './editBox';
import FilterSettings from './filterSettings';
import FolderSettings from './folderSettings';
import SettingsBox from './settingsBox';
import OAOptionsBox from '../component/OAoptionsBox/OAoptionsBox';
import TASKOptionsBox from '../component/TASKoptionsBox/TASKoptionsBox';
import WorkoptionsBox from '../component/WorkoptionsBox/WorkoptionsBox';
import { getSettingsModel } from '../component/settingsBox/settingsModels';
import util from '../utils/util';
import { changeOAOptions, changeTASKOptions, setWidgetAttribute } from '../redux/actions';

@connect(
  state => ({
    editWidgets: state.editWidgets,
  }),
  dispatch => ({
    changeOAOptions: bindActionCreators(changeOAOptions, dispatch),
    changeTASKOptions: bindActionCreators(changeTASKOptions, dispatch),
    setWidgetAttribute: bindActionCreators(setWidgetAttribute, dispatch),
  })
)
export default class Contents extends Component {
  static propTypes = {
    isOA: PropTypes.bool,
    isTask: PropTypes.bool,
    isWorkSheet: PropTypes.bool,
  };
  constructor(props) {
    super(props);
    const basicWidgets = Object.assign({}, config.BASIC_WIDGETS);
    const readonlyWidget = Object.assign({}, config.READONLY_WIDGETS);
    let keys = Object.keys(basicWidgets);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (basicWidgets[key].type < 1) {
        delete basicWidgets[key];
        continue;
      }
      // 自定义二期中的明细和公式  任务没有
      if (this.props.isTask && !basicWidgets[key].showInTask) {
        delete basicWidgets[key];
      }
    }
    if (this.props.isOA) {
      // 等级插件oa暂时没有
      delete basicWidgets.SCORE;
      delete basicWidgets.RELATION;
      delete basicWidgets.RELATESHEET;
      delete basicWidgets.SHEETFIELD;
      delete basicWidgets.NEW_FORMULA;
      delete basicWidgets.CONCATENATE;
      delete basicWidgets.AUTOID;
      delete basicWidgets.SWITCH;
      delete basicWidgets.SUBTOTAL;
    }
    if (this.props.isWorkSheet) {
      if (!config.global.projectId) {
        delete basicWidgets.GROUP_PICKER;
        delete basicWidgets.USER_PICKER;
      }
      delete basicWidgets.FORMULA;
      delete basicWidgets.DETAILED;
    }
    this.basicWidgets = basicWidgets;
    this.readonlyWidget = readonlyWidget;
  }
  /**
   * 改变task设置
   * @param {string} id
   * @param {object} data
   * @memberOf SettingsBox
   */
  changeTASKOptions = (id, data) => {
    if (data.display) {
      let count = 0;
      this.props.editWidgets.forEach(list =>
        list.forEach(widget => {
          if (widget.TASKOptions && widget.TASKOptions.display) {
            count++;
          }
        })
      );

      if (count >= 10) {
        alert(_l('在任务卡片上至多呈现10个字段'), 3);
      } else {
        this.props.changeTASKOptions(id, data);
      }
    } else {
      this.props.changeTASKOptions(id, data);
    }
  };
  render() {
    const { sourceName, headText, toggleBackgroundClass, cancelSubmit, submitForm, editboxTitle, effictiveWidgetId, editWidgets } = this.props;
    const choosedWidget = util.findWidgetById(editWidgets, effictiveWidgetId);
    const SettingsModel = getSettingsModel(choosedWidget ? choosedWidget.type : '');
    let widgetGroup;

    // 新用户去除申请单
    if (!md.global.Account.hrVisible) {
      config.BASIC_WIDGETS.RELATION.defaultArr = _.filter(config.BASIC_WIDGETS.RELATION.defaultArr, o => o.value !== 5);
    }

    const basicWidgets = Object.assign({}, config.BASIC_WIDGETS);
    const readonlyWidget = Object.assign({}, config.READONLY_WIDGETS);
    if (this.props.isTask || this.props.isWorkSheet) {
      widgetGroup = [
        {
          title: '',
          widgets: this.basicWidgets,
        },
      ];
    } else if (this.props.isOA) {
      widgetGroup = [
        {
          title: '',
          widgets: this.basicWidgets,
        },
        {
          title: '只读控件',
          widgets: this.readonlyWidget,
        },
      ];
    }
    return (
      <div className="w100 h100 flexColumn">
        <Header
          sourceName={sourceName}
          txt={headText}
          toggleBackgroundClass={toggleBackgroundClass}
          cancelSubmit={cancelSubmit}
          submitForm={submitForm}
          isWorkSheet={this.props.isWorkSheet}
        />
        <div className="flexRow flex customWidgetContainer pBottom15">
          <WidgetBox widgetGroup={widgetGroup} />
          <div className="flexRow handleArea mLeft15">
            <EditBox title={editboxTitle} />
            <div className="customSettings">
              {this.props.isTask ? (
                <FilterSettings />
              ) : null}
              {this.props.isTask ? <FolderSettings /> : undefined}
              <SettingsBox
                choosedWidget={choosedWidget}
                name={_.get(choosedWidget, 'widgetName')}
                tip={_.get(choosedWidget, 'tip')}
                showOAOptions={this.props.isOA}
                showTaskOptions={this.props.isTask}
                isWorkSheet={this.props.isWorkSheet}
              >
                <SettingsModel isWorkSheet={this.props.isWorkSheet} />
                {this.props.isOA && !!_.get(choosedWidget, 'OAOptions') ? (
                  <OAOptionsBox changeOAOptions={this.props.changeOAOptions} widget={choosedWidget} />
                ) : (
                  undefined
                )}
                {this.props.isTask && !!_.get(choosedWidget, 'TASKOptions') ? (
                  <TASKOptionsBox changeTASKOptions={this.changeTASKOptions} widget={choosedWidget} />
                ) : (
                  undefined
                )}
                {this.props.isWorkSheet && !!_.get(choosedWidget, 'OAOptions') ? (
                  <WorkoptionsBox setWidgetAttribute={this.props.setWidgetAttribute} changeOAOptions={this.props.changeOAOptions} widget={choosedWidget} />
                ) : (
                  undefined
                )}
              </SettingsBox>
            </div>
          </div>
          <DragPreview />
        </div>
      </div>
    );
  }
}

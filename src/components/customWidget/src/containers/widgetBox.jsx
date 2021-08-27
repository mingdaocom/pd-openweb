import PropTypes from 'prop-types';
import React from 'react';
import WidgetList from '../component/widgetBox/widgetList';
import cx from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { addBottomWidget, insertFiller, resetEditBox, changeDragState, changeDragPreview } from '../redux/actions';
import config from '../config';
import ScrollView from 'ming-ui/components/ScrollView';
import { classSet } from '../utils/util';

/**
 * 左侧widget表
 * @class WidgetBox
 * @extends {React.Component}
 */
@connect(
  state => ({
    editWidgets: state.editWidgets,
    jDragPreviewWidget: state.jDragPreviewWidget,
    dragState: state.dragState,
    effictiveWidgetId: state.effictiveWidgetId,
    formulaState: state.formulaState,
    formulaEditStatus: state.formulaEditStatus,
  }),
  dispatch => ({
    /**
     * 往底部添加一个控件
     * @param {object} widget widget对象
     * @memberOf WidgetBox
     */
    addBottomWidget: bindActionCreators(addBottomWidget, dispatch),

    /**
     * 还原editbox
     *
     */
    resetEditBox: bindActionCreators(resetEditBox, dispatch),

    /**
     * 插入一个填充块
     * @param {object} filler edit_filler对象
     * @param {number} location.row 行
     * @param {number} location.col 列
     * @param {string} location.position 位置  'LEFT' | 'RIGHT'
     * @param {object} widget
     * @memberOf EditBox
     */
    insertFiller: bindActionCreators(insertFiller, dispatch),
    changeDragPreview: bindActionCreators(changeDragPreview, dispatch),
    changeDragState: bindActionCreators(changeDragState, dispatch),
  })
)
export default class WidgetBox extends React.Component {
  static propTypes = {
    formulaEditStatus: PropTypes.bool,
    widgetGroup: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        widgets: PropTypes.object,
      })
    ),
  };
  constructor(props) {
    super(props);
    this.time = null;
  }

  getwidgetList(WIDGETS) {
    let { jDragPreviewWidget, dragState } = this.props;
    let leftListArr = [];
    Object.keys(WIDGETS).forEach(widgetName => {
      let widget = WIDGETS[widgetName];
      leftListArr.push(widget);
    });
    let leftList = leftListArr.map((widget, index) => {
      let isChoosed = false;
      if (
        jDragPreviewWidget &&
        jDragPreviewWidget.widget.props.widget &&
        jDragPreviewWidget.widget.props.widget.type === widget.type &&
        (dragState === config.DRAG_STATE.LEFT_ANIMATE ||
          dragState === config.DRAG_STATE.LEFT_HALF_DRAGGING ||
          dragState === config.DRAG_STATE.LEFT_NORMAL_DRAGGING)
      ) {
        isChoosed = true;
      }
      return (
        <WidgetList
          enumName={widget.enumName}
          widget={widget}
          key={index}
          dragState={this.props.dragState}
          effictiveWidgetId={this.props.effictiveWidgetId}
          editWidgets={this.props.editWidgets}
          changeDragState={this.props.changeDragState}
          changeDragPreview={this.props.changeDragPreview}
          addBottomWidget={this.props.addBottomWidget}
          insertFiller={this.props.insertFiller}
          resetEditBox={this.props.resetEditBox}
          WIDGETS={WIDGETS}
          isChoosed={isChoosed}
        />
      );
    });
    return leftList;
  }

  render() {
    const content = [];
    this.props.widgetGroup.forEach((item, index) => {
      if (item.title) {
        content.push(
          <div key={`title-${index}`} className={cx('dragTitle editBoxItem', { borderTop: 'index' !== 0 })}>
            {item.title}
          </div>
        );
      }
      content.push(
        <ul key={`list-${index}`} className="widgetList">
          {this.getwidgetList(item.widgets)}
        </ul>
      );
    });
    return (
      <div className="customLeftMenu">
        <div className={classSet({ pointerEvents: this.props.formulaState.formulaEdit || this.props.formulaEditStatus }, 'widgetBox')}>
          <div className="customTitle pLeft10">{_l('可选控件')}</div>
          <ScrollView className="flex">
            <div className="dragHint editBoxItem">{_l('点击或拖拽添加到预览区')}</div>
            {content}
          </ScrollView>
        </div>
      </div>
    );
  }
}

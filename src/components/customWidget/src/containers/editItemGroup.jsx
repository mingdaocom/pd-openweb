import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import config from '../config';
import EditBottomLocation from '../component/editBox/editBottomLocation';
import EditItem from '../component/editBox/editItem';
import global from '../config/globalConfig';
import { classSet, getBindFormula, getBindMoneyCn, showDeleteConfirmModal } from '../utils/util';
import {
  insertWidget,
  insertFiller,
  resetEditBox,
  fillLocation,
  changeEffictiveWidget,
  changeDragingItem,
  changeWidget,
  seleteSingleWidghtFormula,
  changeWidgetWithoutRefresh,
  seleteSingleWidghtCustomFormula,
  changeDragPreview,
  deleteWidget,
  changeDragState,
  changeWidgetData,
} from '../redux/actions';
import { autobind } from 'core-decorators';

@connect(
  state => ({
    editWidgets: state.editWidgets,
    dragState: state.dragState,
    effictiveWidgetId: state.effictiveWidgetId,
    formulaState: state.formulaState,
    formulaEditStatus: state.formulaEditStatus, // 新公式正在编辑判断
    jDragPreviewWidget: state.jDragPreviewWidget, // 拖拽状态的控件
  }),
  dispatch => ({
    /**
     * 还原成快照状态
     * @memberOf EditBox
     */
    resetEditBox: bindActionCreators(resetEditBox, dispatch),

    /**
     * 改变widget的属性
     * @param {string} id
     * @param {object} widget
     * @memberOf SettingsBox
     */
    changeWidget: bindActionCreators(changeWidget, dispatch),

    /**
     * 改变widget的属性不改变选中的widget
     * @param {string} id
     * @param {object} widget
     * @memberOf SettingsBox
     */
    changeWidgetWithoutRefresh: bindActionCreators(changeWidgetWithoutRefresh, dispatch),

    /**
     * 将填充块编程拖动中的widget
     * @param {object} widget
     * @memberOf EditBox
     */
    insertWidget: bindActionCreators(insertWidget, dispatch),

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

    /**
     * 将一个位置换成填充块
     * @param {number} location.row 行
     * @param {number} location.col 列
     * @memberOf EditBox
     */
    fillLocation: bindActionCreators(fillLocation, dispatch),

    /**
     * 改变正在编辑的widgetId
     * @param {string} id
     * @memberOf EditBox
     */
    changeEffictiveWidget: bindActionCreators(changeEffictiveWidget, dispatch),

    /**
     * 改变正在拖拽的widget
     * @param {object} widget
     * @memberOf EditBox
     */
    changeDragingItem: bindActionCreators(changeDragingItem, dispatch),
    changeDragPreview: bindActionCreators(changeDragPreview, dispatch),
    deleteWidget: bindActionCreators(deleteWidget, dispatch),
    changeDragState: bindActionCreators(changeDragState, dispatch),
    seleteSingleWidghtCustomFormula: bindActionCreators(seleteSingleWidghtCustomFormula, dispatch),
    seleteSingleWidghtFormula: bindActionCreators(seleteSingleWidghtFormula, dispatch),
    changeWidgetData: bindActionCreators(changeWidgetData, dispatch),
  })
)
export default class EditItemGroup extends Component {
  /**
   * 拖动widget控件出预览区域时还原
   * @param {any} event
   * @memberOf EditBox
   */
  @autobind
  handleMouseLeave(event) {
    if (this.props.dragState === config.DRAG_STATE.LEFT_HALF_DRAGGING || this.props.dragState === config.DRAG_STATE.LEFT_NORMAL_DRAGGING) {
      this.props.resetEditBox();
    }
  }

  /**
   * 选择控件插入到公式中
   * @param {string} id
   */
  @autobind
  seleteSingleWidghtFormula(id) {
    let isCustomFormula = false;
    this.props.editWidgets.forEach(list =>
      list.forEach(widget => {
        if (widget.id === global.selectFormulaId && widget.data.enumDefault === 1) {
          isCustomFormula = true;
        }
      })
    );

    if (isCustomFormula) {
      this.props.seleteSingleWidghtCustomFormula(id);
    } else {
      this.props.seleteSingleWidghtFormula(id);
    }
  }

  /**
   * 删除控件
   * @param {string} id
   * @memberOf EditBox
   */
  @autobind
  deleteWidget(id) {
    let props = this.props;

    // 检查是否有关联的公式组件
    let formulars = getBindFormula(id, props.editWidgets);
    // 检查是否有关联的大写金额组件
    let moneyCns = getBindMoneyCn(id, props.editWidgets);
    if (formulars.influenceWidgets.length || moneyCns.influenceWidgets.length) {
      showDeleteConfirmModal(formulars.controlName, formulars.influenceWidgets.concat(moneyCns.influenceWidgets), () => {
        props.deleteWidget(id);
      });
    } else {
      props.deleteWidget(id);
    }
  }
  render() {
    return (
      <div className="">
        <div className="editArea" onMouseLeave={this.handleMouseLeave}>
          <div className="editWidgetContainer">
            {this.props.editWidgets.map((widgetList, row) => {
              let sc = classSet(
                {
                  overfull: widgetList.length > 2,
                },
                'editWidgetList'
              );
              return (
                <div className={sc} key={'key' + row}>
                  {widgetList.map((widget, col) => {
                    let location = { row, col };
                    return (
                      <EditItem
                        dragState={this.props.dragState}
                        insertWidget={this.props.insertWidget}
                        insertFiller={this.props.insertFiller}
                        changeDragPreview={this.props.changeDragPreview}
                        resetEditBox={this.props.resetEditBox}
                        changeDragState={this.props.changeDragState}
                        fillLocation={this.props.fillLocation}
                        changeEffictiveWidget={this.props.changeEffictiveWidget}
                        deleteWidget={this.props.deleteWidget}
                        changeDragingItem={this.props.changeDragingItem}
                        changeWidget={this.props.changeWidget}
                        seleteSingleWidghtFormula={this.seleteSingleWidghtFormula}
                        changeWidgetWithoutRefresh={this.props.changeWidgetWithoutRefresh}
                        location={location}
                        widget={widget}
                        changeWidgetData={this.props.changeWidgetData}
                        editWidgets={this.props.editWidgets}
                        effictiveWidgetId={this.props.effictiveWidgetId}
                        key={'keys' + row + col}
                        formulaEdit={this.props.formulaState.formulaEdit}
                        formulaEditStatus={this.props.formulaEditStatus} // 新公式正在编辑判断
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
          <EditBottomLocation
            dragState={this.props.dragState}
            insertWidget={this.props.insertWidget}
            insertFiller={this.props.insertFiller}
            changeDragState={this.props.changeDragState}
          />
          <div
              className="editboxDefault"
              style={{
                marginTop: 60,
                paddingBottom: 60,
                textAlign: 'center',
                width: '100%',
              }}
            >
              <img src={require('../image/editDefault.png')} alt="默认图片" />
              <p
                style={{
                  fontSize: '16px',
                  color: '#333',
                  opacity: 0.4,
                }}
              >
                {_l('将控件拖拽到这里编辑')}
              </p>
            </div>
        </div>
      </div>
    );
  }
}

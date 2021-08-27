/*
 * @Author: cloudZQY
 * @Module: customWidgetContainer
 * @Description: 页面包裹，拖拽Context
 * @Date: 2018-03-27 09:50:24
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 09:50:49
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from '@mdfe/react-dnd-mouse-backend';
import { connect, Provider } from 'react-redux';
import { changeAllWidgets, deleteWidget, refreshAllWidgets, changeDragState, changeDragPreview } from '../redux/actions';
import 'mdDialog';
import Dialog from 'ming-ui/components/Dialog/Dialog';
import config from '../config';
import { clearStorage, getStorage, getEditWidgetByControl, default as util } from '../utils/util';
import store from '../redux/store';
import formControl from 'src/api/form';
import animatePopup from 'animatePopup';
import Header from '../component/pure/Header';
import { autobind } from 'core-decorators';
import '../css/main.less';
import ErrorState from 'src/components/errorPage/errorState';

@DragDropContext(HTML5Backend)
@connect(
  state => {
    let { dragState, editWidgets, formulaState, effictiveWidgetId, formulaEditStatus } = state;
    return {
      dragState,
      editWidgets,
      formulaState,
      effictiveWidgetId,
      formulaEditStatus,
    };
  },
  dispatch => ({
    /**
     * 改变拖动的状态
     * @param {string} state
     * @memberOf SettingsBox
     */
    changeDragState: bindActionCreators(changeDragState, dispatch),
    /**
     * 改变拖拽的呈现
     * @param {object} widget
     * @memberOf SettingsBox
     */
    changeDragPreview: bindActionCreators(changeDragPreview, dispatch),
    /**
     * 删除控件
     * @param {any} id
     * @memberOf CustomWidget
     */
    deleteWidget: bindActionCreators(deleteWidget, dispatch),
    refreshAllWidgets: bindActionCreators(refreshAllWidgets, dispatch),
  })
)
export default class customWidgetContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      controls: [],
      excelContent: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      isAdmin: null,
    };
  }

  componentDidMount() {
    if (config.global.sourceId) {
      this.checkEditAuth();
    }

    // 任务自定义模板传递数据使用
    if (config.taskTemplate) {
      config.global.version = config.taskTemplate.version;
      let widgets = util.getEditWidgetsByControls(config.taskTemplate.controls, config.taskTemplate.formControls);
      config.initalWidgets = _.cloneDeep(widgets);
      this.props.refreshAllWidgets(widgets);
    }

    // 记录鼠标按下的位置
    $(document).on('mousedown.drag', '.widgetListLi, .editWidgetListItem, .dragOptions .dragPreview, .dragDetailOptions .dragPreview', event => {
      config.mouseOffset = {
        left: event.clientX,
        top: event.clientY,
      };
    });

    // 拖拽的手图标
    $('.customWidgetContainer')
      .on('mousedown', '.canDragEl', event => {
        $(event.currentTarget).addClass('cursorDrabbing');
      })
      .on('mouseup', '.canDragEl', event => {
        $(event.currentTarget).removeClass('cursorDrabbing');
      })
      .on('mouseleave', '.canDragEl', event => {
        $(event.currentTarget).removeClass('cursorDrabbing');
      });
  }

  /**
   * check 编辑权限
   */
  checkEditAuth() {
    formControl
      .checkEditAuth({
        sourceId: config.global.sourceId,
        sourceType: parseInt(config.global.sourceType, 10),
      })
      .then(isAdmin => {
        this.setState({ isAdmin });
        if (isAdmin) {
          this.getTemplateControls();
        }
      });
  }

  /**
   * 获取自定义控件
   */
  getTemplateControls() {
    if (config.global.templateId) {
      formControl
        .getTemplateWithControls({
          templateId: config.global.templateId,
          sourceId: config.global.sourceId,
          sourceType: parseInt(config.global.sourceType, 10),
        })
        .then(data => {
          if (data.code === 1) {
            config.global.version = data.data.version;
            let widgets = util.getEditWidgetsByControls(data.data.controls, data.data.formControls);
            config.initalWidgets = _.cloneDeep(widgets);
            this.props.refreshAllWidgets(widgets);
          } else {
            alert(util.getErrorByCode(data), 2);
          }
        });
    }
  }

  /**
   * 返回主页
   */
  returnMasterPage() {
    setTimeout(() => {
      location.href = decodeURIComponent(config.global.fromURL);
    }, 300);
  }

  /**
   * 取消
   * @memberOf CustomWidget
   */
  @autobind
  cancelSubmit() {
    if (
      _.isEqual(config.initalWidgets, this.props.editWidgets) ||
      (config.initalWidgets.length === 1 && config.initalWidgets[0].length === 0 && this.props.editWidgets.length === 0)
    ) {
      this.returnMasterPage();
    } else {
      $.DialogLayer({
        dialogBoxID: 'confirmLoadStorage', // 标示ID
        showClose: true,
        drag: false,
        container: {
          header: _l('您是否保存本次修改？'),
          content: '<div class="Gray_75">' + _l('当前有尚未保存的修改，你在离开页面前是否需要保存这些修改？') + '</div>',
          noText: _l('否，放弃保存'), // 取消按钮的文?
          yesText: _l('是，保存修改'), // 确认按钮的文?
          noFn: evt => {
            if (event.keyCode !== 27 && evt.target.className.indexOf('dialogCloseBtn') === -1) {
              this.returnMasterPage();
            }
          },
          yesFn: () => {
            this.submitForm(true);
          },
        },
        readyFn: () => {
          $('#confirmLoadStorage .yesText').addClass('ThemeHoverBGColor2');
          $('#confirmLoadStorage .noText')
            .removeClass()
            .addClass('noTextBtn ming Button Button--ghost');
        },
      });
    }
  }

  // 提交
  @autobind
  submitForm(isExit) {
    const editWidgets = this.props.editWidgets;
    const formulaState = this.props.formulaState;
    const formulaEditStatus = this.props.formulaEditStatus;
    const data = util.dispooseSubmitData(editWidgets, { formulaState, formulaEditStatus });
    if (!data) {
      return false;
    }
    const { controls, formControls } = data;

    this.props.submitFn(controls, formControls, editWidgets, isExit);
  }

  // 添加背景
  toggleBackgroundClass(evt) {
    $(evt.target).toggleClass('ThemeBGColor2 ThemeBGColor3');
  }

  render() {
    const { isAdmin } = this.state;

    if (isAdmin === false) {
      return (
        <div className="w100 WhiteBG Absolute" style={{ top: 0, bottom: 0 }}>
          <ErrorState text={_l('权限不足，无法编辑')} showBtn btnText={_l('返回')} callback={() => this.returnMasterPage()} />
        </div>
      );
    }

    return (
      <div
        className={
          this.props.dragState !== config.DRAG_STATE.DEFAULT &&
          this.props.dragState !== config.DRAG_STATE.LEFT_ANIMATE &&
          this.props.dragState !== config.DRAG_STATE.MIDDLE_ANIMATE
            ? 'customWidget commonCustomWidget customWidget_noscroll cursorGrabbing'
            : 'customWidget commonCustomWidget customWidget_noscroll'
        }
      >
        {React.cloneElement(this.props.children, {
          sourceName: config.global.sourceName,
          headText: config.txt.txt_1,
          toggleBackgroundClass: this.toggleBackgroundClass,
          cancelSubmit: this.cancelSubmit,
          submitForm: this.submitForm,
          WIDGETS: config.WIDGETS,
          editboxTitle: config.txt.txt_2,
          changeDragState: this.props.changeDragState,
          changeDragPreview: this.props.changeDragPreview,
          deleteWidget: this.props.deleteWidget,
          dragState: this.props.dragState,
          effictiveWidgetId: this.props.effictiveWidgetId,
          editWidgets: this.props.editWidgets,
        })}
      </div>
    );
  }
}

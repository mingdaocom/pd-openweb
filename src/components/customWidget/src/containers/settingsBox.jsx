import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import OAOptionsBox from '../component/OAoptionsBox/OAoptionsBox';
import TASKOptionsBox from '../component/TASKoptionsBox/TASKoptionsBox';
import config from '../config';
import global from '../config/globalConfig';
import util from '../utils/util';
import ScrollView from 'ming-ui/components/ScrollView';
import {
  changeWidgetData,
  changeOAOptions,
  changeWidget,
  emptyToPrev,
  changeFormulaState,
  changeFormulaEditStatus, // 新公式正在编辑判断
  seleteWidgetHighlight,
  seleteSingleWidghtFormula,
  changeWidgetHalf,
  deleteWidget,
  changeDragState,
  changeDragPreview,
  addBottomWidget,
} from '../redux/actions';

/**
 * 设置项
 * @class SettingsBox
 * @extends {React.Component}
 */
@connect(
  state => ({
    editWidgets: state.editWidgets,
    effictiveWidgetId: state.effictiveWidgetId,
    dragingItem: state.dragingItem,
    formulaState: state.formulaState,
    formulaEditStatus: state.formulaEditStatus, // 新公式正在编辑判断
  }),
  dispatch => ({
    seleteSingleWidghtFormula: bindActionCreators(seleteSingleWidghtFormula, dispatch),
    changeOAOptions: bindActionCreators(changeOAOptions, dispatch),
    changeWidget: bindActionCreators(changeWidget, dispatch),
    emptyToPrev: bindActionCreators(emptyToPrev, dispatch),
    seleteWidgetHighlight: bindActionCreators(seleteWidgetHighlight, dispatch),
    deleteWidget: bindActionCreators(deleteWidget, dispatch),
    changeDragState: bindActionCreators(changeDragState, dispatch),
    changeDragPreview: bindActionCreators(changeDragPreview, dispatch),
    changeWidgetData: bindActionCreators(changeWidgetData, dispatch),
    changeFormulaState: bindActionCreators(changeFormulaState, dispatch),
    changeFormulaEditStatus: bindActionCreators(changeFormulaEditStatus, dispatch), // 新公式正在编辑判断
    changeWidgetHalf: bindActionCreators(changeWidgetHalf, dispatch),
    addBottomWidget: bindActionCreators(addBottomWidget, dispatch),
  }),
)
export default class SettingsBox extends React.Component {
  static = {
    choosedWidget: PropTypes.object,
    name: PropTypes.string,
    tip: PropTypes.string,
    showOAOptions: PropTypes.bool,
  };
  constructor(props) {
    super(props);
  }

  /**
   * 改变widget的data
   * @param {string} id   - widget的id
   * @param {object} data - 变更后的data
   * @param {number} popup - 如果有popup则进行提示
   * @param {string} info  - 提示信息
   */
  changeWidgetData = (id, data, popup) => {
    // 数据没变化时不做操作
    var dataChange = false;
    // 限定长度
    if (data.controlName) {
      data.controlName = data.controlName.slice(0, 255);
    } else if (data.hint) {
      data.hint = data.hint.slice(0, 40);
    }
    // 数据是否变化
    this.props.editWidgets.forEach(list =>
      list.forEach(widget => {
        if (widget.id === id) {
          Object.keys(data).forEach(key => {
            if (!_.isEqual(data[key], widget.data[key])) {
              dataChange = true;
            }
          });
        }
      }),
    );
    if (!dataChange) return false;
    this.props.changeWidgetData(id, data);
  };

  /**
   * 高亮widget
   * @param {string} dataSource  - 当前控件公式
   */
  seleteWidgetHighlight = (id, dataSource) => {
    global.selectFormulaId = id;
    global.preDataSource = dataSource;
    this.props.changeFormulaState(true);
    this.props.seleteWidgetHighlight(id);
  };

  /**
   * 删除widget
   * @param {string} id
   * @memberOf SettingsBox
   */
  deleteWidget = id => {
    const choosedWidget = this.props.choosedWidget;
    this.props.changeFormulaState(false);
    this.props.deleteWidget(this.props.effictiveWidgetId);
    // 如果是关联他表控件，删除时候判断关联他的他表字段。清空数据
    if (choosedWidget.type === 29) {
      const enumDefault = choosedWidget.data.enumDefault;
      const dataSource = `$${choosedWidget.data.controlId || choosedWidget.id}$`;
      const allWidgets = _.flatten(this.props.editWidgets);
      const sheetFields = allWidgets.filter(
        widget => widget.enumName === 'SHEETFIELD' && widget.data.dataSource === dataSource,
      );
      if (sheetFields.length > 0) {
        if (enumDefault === 1) {
          sheetFields.forEach(item => {
            this.props.changeWidgetData(item.id, {
              fieldList: [],
              sourceControlId: '',
            });
          });
        } else if (enumDefault === 2) {
          sheetFields.forEach(item => {
            this.props.deleteWidget(item.id);
          });
        }
      }
      // 删除关联本表对应的控件
      if (choosedWidget.data.dataSource === config.global.sourceId) {
        const needDeleteWidget = _.find(
          allWidgets,
          widget => widget.data.sourceControlId === choosedWidget.data.controlId,
        );
        if (needDeleteWidget) {
          this.props.deleteWidget(needDeleteWidget.id);
        }
      }
    }
  };

  componentDidMount() {
    // 输入框变色
    $('.customSettings').on(
      {
        focus: event => {
          $(event.target).addClass('active');
        },
        blur: event => {
          $(event.target).removeClass('active');
        },
      },
      'input[type="text"], textarea',
    );

    // 回车提交
    $('.widgetSettingsBox').on('keypress', 'input[type="text"]', event => {
      if (event.keyCode === 13) {
        event.target.blur();
      }
    });

    // 将正在修改的widget存起来
    $('.widgetSettingsBox').on(
      'focus',
      'input[type="text"]:not(.formulaInput,.customFormulaText,.allowEmpty)',
      event => {
        event.target.select();
        this.props.editWidgets.forEach(list =>
          list.forEach(widget => {
            if (widget.id === this.props.effictiveWidgetId) {
              config.dataCopy = _.cloneDeep(widget);
            }
          }),
        );
      },
    );

    $('.widgetSettingsBox').on(
      'blur',
      'input[type="text"]:not(.formulaInput,.customFormulaText,.allowEmpty)',
      event => {
        // 填入空数据时还原
        if (event.target.value.trim() === '') {
          this.props.emptyToPrev();
        }

        // 修改影响老数据时的提示
        let editComfirm = event.target.getAttribute('data-editcomfirm');
        let oldData = util.loadDataPoint();
        let newData = this.props.editWidgets;
      },
    );
  }

  render() {
    let { editWidgets, choosedWidget, effictiveWidgetId, name, tip } = this.props;
    const disabledDel = choosedWidget && choosedWidget.data && choosedWidget.data.attribute === 1;
    if (!choosedWidget && this.props.dragingItem.id === effictiveWidgetId) {
      // 拖动中
      choosedWidget = this.props.dragingItem;
    } else if (!choosedWidget) {
      choosedWidget = {};
    }
    return (
      <div className="settingsBox flexColumn">
        <ScrollView className="flex">
          <div className="widgetSettingsBox">
            <div className="widgetSettingsTitle">
              <span className="wsLf">{_l('字段设置')}</span>
              {name ? (
                <span>
                  {_l('控件类型')}“{name}”
                </span>
              ) : null}
              {tip ? (
                <span
                  className="tip-bottom tipWidth"
                  data-tip={tip}
                  style={{
                    verticalAlign: 'middle',
                    marginTop: '-5px',
                    marginLeft: '4px',
                    display: 'inline-block',
                    opacity: 1,
                  }}
                >
                  <i
                    className="icon-novice-circle pointer"
                    style={{
                      color: '#b0b0b0',
                    }}
                  />
                </span>
              ) : null}
              <span
                className={`pointer iconDelete ${disabledDel ? 'Hidden' : ''}`}
                data-tip={_l('删除控件')}
                style={{
                  float: 'right',
                  marginRight: '55px',
                  marginTop: '0px',
                  display: choosedWidget.widgetName ? '' : 'none',
                }}
                onClick={this.deleteWidget}
              >
                <i className="icon-task-new-delete fontIcon" />
              </span>
            </div>

            {React.Children.map(this.props.children, child => {
              if (child) {
                return React.cloneElement(child, {
                  widget: choosedWidget,
                  changeWidgetData: this.changeWidgetData,
                  editWidgets: editWidgets,
                  formulaState: this.props.formulaState,
                  formulaEditStatus: this.props.formulaEditStatus, // 新公式正在编辑判断
                  seleteSingleWidghtFormula: this.props.seleteSingleWidghtFormula,
                  changeDragPreview: this.props.changeDragPreview,
                  changeDragState: this.props.changeDragState,
                  changeWidget: this.props.changeWidget,
                  seleteWidgetHighlight: this.seleteWidgetHighlight,
                  changeFormulaState: this.props.changeFormulaState,
                  changeFormulaEditStatus: this.props.changeFormulaEditStatus, // 新公式正在编辑判断
                  changeWidgetHalf: this.props.changeWidgetHalf,
                  addBottomWidget: this.props.addBottomWidget,
                  deleteWidget: this.props.deleteWidget,
                });
              }
              return null;
            })}
          </div>
        </ScrollView>
      </div>
    );
  }
}

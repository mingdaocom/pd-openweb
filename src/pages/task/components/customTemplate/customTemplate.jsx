import React, { Component } from 'react';
import cx from 'classnames';
import './customTemplate.less';
import CustomWidget from 'src/components/customWidget/src/containers/customWidget';
import customWidgetConfig from 'src/components/customWidget/src/config';
import CustomTemplateStage from './customTemplateStage';
import taskCenterAjax from 'src/api/taskCenter';
import formAjax from 'src/api/form';
import { navigateTo } from 'src/router/navigateTo';
import store from 'src/components/customWidget/src/redux/store';
import _ from 'lodash';

export default class CustomTemplate extends Component {
  constructor(props) {
    super(props);
    let stages = [];

    if (props.tempId === '') {
      stages = [{ name: _l('进行中'), taskCount: 3 }];
      // 自定义模板数据
      customWidgetConfig.taskTemplate = {
        controls: [],
        formControls: [],
        version: 0,
      };
    } else {
      this.getTemplateAndStages();
    }

    this.state = {
      tabIndex: 1,
      noDragIndex: -1, // 编辑名称时禁止拖拽
      isAddStage: false,
      stages,
      isCustom: false,
      templateName: '',
      templateId: '',
      version: '',
      controls: [],
    };
  }

  componentWillMount() {
    customWidgetConfig.global.sourceType = '2';
    customWidgetConfig.isTask = true;
    customWidgetConfig.txt = {
      txt_1: _l('项目中的自定义任务内容'),
      txt_2: _l('任务预览'),
    };
  }

  /**
   * 获取数据
   */
  getTemplateAndStages() {
    taskCenterAjax.getTemplateAndStages({
      templateId: this.props.tempId,
    }).then((source) => {
      if (source.status) {
        const stages = source.data.stages.map((stage, i) => {
          const taskCount = 3 - i;
          return {
            name: stage.name,
            taskCount: taskCount > 1 ? taskCount : 1,
          };
        });

        // 自定义模板数据
        customWidgetConfig.taskTemplate = {
          controls: source.data.template.controls,
          formControls: source.data.template.formControls,
          version: source.data.template.version,
        };

        this.setState({
          templateName: source.data.template.templateName,
          isCustom: source.data.isCustom,
          stages,
          templateId: source.data.template.templateId,
          version: source.data.template.version,
          controls: source.data.template.controls,
        });
      } else {
        alert(_l('操作失败，请稍后重试'), 2);
      }
    });
  }

  /**
   * 切换tabs
   * @param  {number} index
   */
  switchTabs(index) {
    if (index === 1 && this.customWidgetBox) {
      this.setState({ controls: this.getControlSource() });
    } else if (index !== 1) {
      customWidgetConfig.taskTemplate.controls = this.state.controls;
    }

    this.setState({ tabIndex: index });
  }

  /**
   * 编辑名称时禁止拖拽 数组下标
   * @param  {number} index
   */
  noDragIndexUpdate(index) {
    this.setState({ noDragIndex: index });
  }

  /**
   * 更改阶段名称
   * @param  {string} name
   * @param  {number} index
   */
  updateStageName(name, index) {
    const stages = this.state.stages;
    stages[index].name = name;
    this.setState({ stages });
  }

  /**
   * 添加看板
   * @param {number|''} index 空的时候插入数组最后
   */
  addStage(index) {
    const stages = this.state.stages;

    if (index) {
      stages.splice(index, 0, 'newStage');
    } else {
      stages.push('newStage');
    }
    this.setState({
      isAddStage: true,
      stages,
    });
  }

  /**
   * 添加看板数据
   */
  addStageItem(name) {
    let stages = this.state.stages;

    if ($.trim(name)) {
      stages = stages.map((item, index) => {
        if (item === 'newStage') {
          const taskCount = stages[index - 1].taskCount - 1 || 1; // 最少一条
          return {
            name,
            taskCount,
          };
        }
        return item;
      });
    } else {
      _.remove(stages, item => item === 'newStage');
    }

    this.setState({
      isAddStage: false,
      stages,
    });
  }

  /**
   * 删除看板
   * @param {number} index
   */
  delStageItem(index) {
    const stages = this.state.stages;
    _.remove(stages, (item, i) => i === index);
    this.setState({ stages });
  }

  /**
   * 拖拽前数据替换
   * @param  {object} item
   * @param {number} index
   */
  beginDrag(item, index) {
    const stages = this.state.stages;
    this.dragItem = item;
    stages.splice(index, 1, 'blank');
    this.setState({ stages });
  }

  /**
   * 经过中数据替换
   * @param {number} index
   */
  itemHover(index) {
    const stages = this.state.stages;
    _.remove(stages, item => item === 'blank');
    stages.splice(index, 0, 'blank');
    this.setState({ stages });
  }

  /**
   * 放开拖拽保存数据
   */
  endDrag() {
    let stages = this.state.stages;

    stages = stages.map((item, index) => {
      if (item === 'blank') {
        return this.dragItem;
      }
      return item;
    });

    this.setState({ stages });
  }

  /**
   * 得到最大的key
   * @param {object} options
   */
  getSqrtOfOptionsMaxKey(options) {
    let maxKey = '';
    options.forEach((item) => {
      if (item.key && item.key > maxKey) {
        maxKey = item.key;
      }
    });
    return maxKey;
  }

  /**
   * 获取自定义数据
   */
  getControlSource() {
    const controls = [];
    const editWidgets = _.cloneDeep(store.getState().editWidgets);

    // 兼容动画未执行完  空占位符引起的数据bug
    editWidgets.forEach((list, row) =>
      list.forEach((widget) => {
        if (
          (list.length === 1 && (widget.type === -1 || widget.type === 0)) ||
          (list.length === 2 && (list[0].type === -1 || list[0].type === 0) && (list[1].type === -1 || list[1].type === 0))
        ) {
          editWidgets.splice(row, 1);
        }
      })
    );

    _.cloneDeep(editWidgets).forEach((list, row) =>
      list.forEach((widget, col) => {
        if (widget.type > 0) {
          // 增加位置信息
          const data = widget.data;
          data.row = row;
          data.col = col;

          // 添加options的key
          if (data.options) {
            const defaultValue = {};
            let maxSqrt = this.getSqrtOfOptionsMaxKey(data.options);
            data.options = data.options.map((item, index) => {
              item.index = index + 1;
              if (!item.key && !item.isDeleted) {
                if (maxSqrt) {
                  item.key = maxSqrt + '0';
                } else {
                  item.key = '1';
                }
                maxSqrt = item.key;
              }
              if (item.checked && item.key) {
                defaultValue[item.key.length] = true;
              } else if (item.key) {
                defaultValue[item.key.length] = false;
              }
              return item;
            });
            let i = 1;
            data.default = '';
            while (i <= maxSqrt.length) {
              if (defaultValue[i]) {
                data.default = '1' + data.default;
              } else {
                data.default = '0' + data.default;
              }
              i++;
            }
            data.default = data.default.replace(/^0*/, '');
          }

          if (widget.TASKOptions) {
            Object.keys(widget.TASKOptions).forEach((key) => {
              data[key] = widget.TASKOptions[key];
            });
          }

          controls.push(data);
        }
      })
    );

    return controls;
  }

  /**
   * 保存
   * @param {boolean} isCover 是否覆盖
   */
  saveTemplate(isCover = false) {
    const customTemplateName = $.trim(this.customTemplateName.value);
    let controls = [];

    // 名称不能为空
    if (customTemplateName === '') {
      alert(_l('模板名称不能为空'), 2);
      this.customTemplateName.focus();
      return false;
    }

    // 自定义字段数据处理
    if (this.customWidgetBox) {
      controls = this.getControlSource();
    } else {
      controls = this.state.controls;
    }

    // 阶段数据处理
    const stages = this.state.stages.map((stage, i) => {
      return {
        name: stage.name,
        sort: i + 1,
      };
    });

    // 保存
    formAjax.saveTemplateWithControls({
      controls,
      sourceType: 3,
      templateId: isCover ? this.state.templateId : '',
      isCreateNew: !isCover,
      uniqueParam: JSON.stringify(stages),
      templateName: customTemplateName,
      version: this.state.version,
    }).then((source) => {
      if (source.code === 1) {
        alert(_l('保存成功'));
        setTimeout(() => {
          this.cancelSubmit();
        }, 300);
      } else if (source.code === 13) {
        alert(_l('保存失败，我的模板至多创建100个'), 2);
      } else {
        alert(_l('操作失败，请稍后重试'), 2);
      }
    });
  }

  /**
   * 返回
   */
  cancelSubmit() {
    navigateTo('/apps/task/center');
  }

  render() {
    // 请求未完成
    if (this.state.stages.length === 0) {
      return <div dangerouslySetInnerHTML={{ __html: LoadDiv() }} />;
    }

    return (
      <div className="customTemplate flexColumn">
        <div className="customTemplateHeadBox">
          <div className="customTemplateHead">
            <span className="goback">
              <i className="icon-arrow-left-border pointer ThemeColor3" onClick={() => this.cancelSubmit()} />
            </span>
            <span className="Font17 mLeft15">{_l('自定义项目模板：')}</span>
            <span className="Font13 mLeft5 customColor">{_l('可编辑和添加看板、自定义任务内容')}</span>
            <div className="customTemplateHeadBtn Font13">
              <span className="customColor ThemeColor3 pointer" onClick={() => this.cancelSubmit()}>
                {_l('取消')}
              </span>
              <span
                className="pointer ThemeColor3 ThemeBorderColor3 ThemeBGColor3 tip-bottom-left"
                data-tip={this.props.tempId ? _l('更改后使用在新建项目中，不会影响到正在进行中的项目') : ''}
                onClick={() => this.saveTemplate()}
              >
                {_l('保存为我的模板')}
              </span>
              {this.state.isCustom ? (
                <span
                  className="pointer ThemeColor3 ThemeBorderColor3 ThemeBGColor3 tip-bottom-left"
                  data-tip={_l('更改后使用在新建项目中，不会影响到正在进行中的项目')}
                  onClick={() => this.saveTemplate(true)}
                >
                  {_l('覆盖原有模板并保存')}
                </span>
              ) : (
                undefined
              )}
            </div>
          </div>
          <div className="customTemplateHead customTemplateBar flexRow">
            <div className="flex">
              <input
                type="text"
                placeholder={_l('输入项目模板名称')}
                className="Font15 ThemeBorderColor3 customTemplateName"
                spellCheck={false}
                ref={(customTemplateName) => {
                  this.customTemplateName = customTemplateName;
                }}
                defaultValue={this.state.templateName}
              />
            </div>
            <ul className="customTemplateTabs Font15">
              <li className={cx(this.state.tabIndex === 1 ? 'ThemeColor3 ThemeBorderColor3' : '')} onClick={() => this.switchTabs(1)}>
                {_l('看板')}
              </li>
              <li className={cx(this.state.tabIndex === 2 ? 'ThemeColor3 ThemeBorderColor3' : '')} onClick={() => this.switchTabs(2)}>
                {_l('自定义任务内容')}
              </li>
            </ul>
            <div className="flex" />
          </div>
        </div>
        {this.state.tabIndex === 1 ? (
          <CustomTemplateStage
            stages={this.state.stages}
            isAddStage={this.state.isAddStage}
            updateStageName={this.updateStageName.bind(this)}
            noDragIndexUpdate={this.noDragIndexUpdate.bind(this)}
            addStage={this.addStage.bind(this)}
            addStageItem={this.addStageItem.bind(this)}
            delStageItem={this.delStageItem.bind(this)}
            beginDrag={this.beginDrag.bind(this)}
            itemHover={this.itemHover.bind(this)}
            endDrag={this.endDrag.bind(this)}
          />
        ) : (
          <CustomWidget
            ref={(customWidgetBox) => {
              this.customWidgetBox = customWidgetBox;
            }}
          />
        )}
      </div>
    );
  }
}

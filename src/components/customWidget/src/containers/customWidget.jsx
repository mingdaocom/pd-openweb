/*
 * @Author: cloudZQY
 * @Module: CustomWidget
 * @Description: 主要容器
 * @Date: 2018-03-27 09:49:30
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 09:49:30
 */
import React, { Component } from 'react';
import preall from 'src/common/preall';
import store from '../redux/store';
import config from '../config';
import 'src/components/mdDialog/dialog';
import Contents from './Contents';
import CustomWidgetContainer from './customWidgetContainer';
import formControl from 'src/api/form';
import util, { clearStorage } from '../utils/util';
import { refreshAllWidgets } from '../redux/actions';
import { autobind } from 'core-decorators';
import { Provider } from 'react-redux';

@preall
export default class CustomWidget extends Component {
  returnMasterPage() {
    setTimeout(() => {
      location.href = decodeURIComponent(config.global.fromURL);
    }, 300);
  }
  postData(controls, formControls, isExit) {
    let dialog = $.DialogLayer({
      DialogBoxID: 'confirmSave', // 标示ID
      showClose: false,
      drag: false,
      className: 'confirmSave',
      width: 200,
      container: {
        header: '',
        content: `<div class="saveLoader">${window.LoadDiv('small')}</div><span class="Font15 savePrompt">${_l('正在保存...')}</span>`,
        noText: '', // 取消按钮的文?
        yesText: '', // 确认按钮的文?
      },
    });
    formControl
      .saveTemplateWithControls({
        isCreateNew: config.global.update === 'false',
        sourceId: config.global.sourceId,
        sourceType: parseInt(config.global.sourceType, 10),
        templateId: config.global.templateId || '',
        version: config.global.version || '',
        projectId: config.global.projectId || '',
        controls: controls,
        formControls: formControls,
        uniqueParam: JSON.stringify(config.uniqueParam),
      })
      .then(data => {
        dialog.closeDialog();
        if (data.code === 1) {
          config.global.version = data.data.version;
          config.global.templateId = data.data.templateId;

          let widgets = util.getEditWidgetsByControls(data.data.controls, data.data.formControls);
          config.initalWidgets = _.cloneDeep(widgets);
          store.dispatch(refreshAllWidgets(widgets));

          clearStorage();
          alert(_l('保存成功'));

          if (isExit) {
            this.returnMasterPage();
          }
        } else {
          alert(util.getErrorByCode(data), 2);
        }
      });
  }

  /**
   * 取得老数据的widget
   * @memberOf CustomWidget
   */
  getOldWigets(widgets) {
    let oldWidgets = [];
    widgets.forEach(list =>
      list.forEach(widget => {
        if (widget.data && widget.data.controlId) {
          oldWidgets.push(widget);
        }
      })
    );
    return oldWidgets;
  }

  @autobind
  submitFn(controls, formControls, editWidgets, isExit) {
    // oa的验证
    if (config.global.sourceType === config.ENVIRONMENT.OA) {
      if (!this.validateAll()) {
        // 未通过验证
        return false;
      }
    }
    // 工作表验证
    if (config.global.sourceType === config.ENVIRONMENT.WORKSHEET) {
      if (!controls.length) {
        alert(_l('字段不可为空'), 3);
        return;
      } else {
        for (let i in editWidgets) {
          let line = editWidgets[i];
          for (let j in line) {
            let widget = line[j];
            if (
              (widget.enumName === 'SHEETFIELD' && (!widget.data.dataSource || !widget.data.sourceControlId)) ||
              (widget.enumName === 'RELATESHEET' && !widget.data.dataSource)
            ) {
              alert(_l('%0字段未配置完成', widget.data.controlName), 3);
              return;
            }
          }
        }
      }
    }

    if (config.global.sourceType === config.ENVIRONMENT.TASK || config.global.sourceType === config.ENVIRONMENT.WORKSHEET) {
      // task和worksheet的验证提示
      let initalWidgets = this.getOldWigets(config.initalWidgets);
      let submitWidgets = this.getOldWigets(editWidgets);
      let wariningTxt = util.validateWidgetChange(config.initalWidgets, editWidgets);
      if (wariningTxt) {
        $.DialogLayer({
          DialogBoxID: 'confirmSave', // 标示ID
          showClose: true,
          drag: false,
          oneScreen: true,
          container: {
            header: config.isWorkSheet ? _l('控件更改会导致现有数据被删除') : _l('控件更改会导致现有任务数据被删除'),
            content: wariningTxt,
            noText: _l('取消'), // 取消按钮的文?
            yesText: _l('确认'), // 确认按钮的文?
            yesFn: () => {
              this.postData(controls, formControls, isExit);
            },
          },
        });
      } else {
        this.postData(controls, formControls, isExit);
      }
    } else {
      this.postData(controls, formControls, isExit);
    }
  }
  render() {
    return (
      <Provider
        store={store}
        ref={customWidget => {
          this.customWidget = customWidget;
        }}
      >
        <CustomWidgetContainer submitFn={this.submitFn}>
          <Contents
            isOA={config.global.sourceType === config.ENVIRONMENT.OA}
            isTask={config.global.sourceType === config.ENVIRONMENT.TASK}
            isWorkSheet={config.global.sourceType === config.ENVIRONMENT.WORKSHEET}
            updateValidate={validateAll => {
              this.validateAll = validateAll;
            }}
            ref="contents"
          />
        </CustomWidgetContainer>
      </Provider>
    );
  }
}

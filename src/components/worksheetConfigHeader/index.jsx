import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Tabs } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import { toEditWidgetPage } from '../../pages/widgetConfig/util';
import './index.less';

/**
 * 控件配置地址
 * /worksheet/field/edit
 * ?projectId={projectId} 网络 id
 * &sourceName={sourceName} 工作表名称
 * &appId={appId}
 * &sourceId={sourceId} 工作表 id
 * &fromURL={fromURL} 返回 url
 * &templateId={templateId} 模板 id
 */

export default class WorksheetConfigHeader extends Component {
  static propTypes = {
    appId: PropTypes.string,
    worksheetId: PropTypes.string,
    showSaveButton: PropTypes.bool,
    saveLoading: PropTypes.bool,
    statusText: PropTypes.string,
    worksheetName: PropTypes.string,
    onBack: PropTypes.func,
    onSave: PropTypes.func,
  };

  static defaultProps = {
    onBack: () => {},
  };

  constructor(props) {
    super(props);
    if (location.href.includes('field/edit')) {
      // 编辑页的参数较多需要保存下来,以便后续切换页面
      this.editPageUrl = location.href;
    }
  }

  currentModuleName = location.pathname.replace(/.*\/worksheet/, '/worksheet').split('/')[2];

  handleRedirect(modulename) {
    // TODO: 跳转逻辑待细化
    const { worksheetId, onBack } = this.props;
    const sheetConfigNavInfo = localStorage.getItem('sheetConfigNavInfo')
      ? JSON.parse(localStorage.getItem('sheetConfigNavInfo'))
      : {};
    const { extensionNav, settingNav } = sheetConfigNavInfo[worksheetId] || {};
    const urlSet = {
      form: `/worksheet/form/edit/${worksheetId}${extensionNav ? '/' + extensionNav : ''}`,
      formSet: `/worksheet/formSet/edit/${worksheetId}${settingNav ? '/' + settingNav : ''}`,
    };
    if (modulename === this.currentModuleName) {
      return;
    }
    if (this.currentModuleName === 'field') {
      onBack({
        redirectfn: () => {
          navigateTo(urlSet[modulename] || '');
        },
        desp: _l('当前表单有尚未保存的修改，是否需要保存表单设计并继续？'),
      });
    } else {
      onBack({
        redirectfn: () => {
          if (modulename === 'field') {
            if (this.editPageUrl) {
              navigateTo(this.editPageUrl);
            } else {
              toEditWidgetPage({ sourceId: worksheetId }, false);
            }
          } else {
            navigateTo(urlSet[modulename] || '');
          }
        },
      });
    }
  }

  render() {
    const { showSaveButton, saveLoading, worksheetName, onBack, onSave, onClose } = this.props;
    return (
      <div className="worksheetConfigHeader">
        <div className="customHeadBox flexRow">
          <span className="goback pointer" onClick={onBack}>
            <i className="ming Icon icon icon-backspace Font24" />
          </span>
          <div className="editDetailWrap">
            <div onClick={onBack} className="flexCenter">
              <span className="overflow_ellipsis pointer InlineBlock" style={{ maxWidth: '360px' }}>
                {worksheetName}
              </span>
            </div>
          </div>
          <Tabs
            className="tabs"
            active={this.currentModuleName}
            tabs={[
              { value: 'field', text: _l('编辑表单') },
              { value: 'formSet', text: _l('更多设置') },
              { value: 'form', text: _l('扩展功能') },
            ]}
            onChange={tab => {
              this.handleRedirect(tab.value);
            }}
          />
          <Button className="closeConfigPage" onClick={onClose}>
            {_l('关闭')}
          </Button>
          {showSaveButton && (
            <Button onClick={onSave} className="btn-loading" loading={saveLoading}>
              {_l('保存')}
            </Button>
          )}
        </div>
      </div>
    );
  }
}

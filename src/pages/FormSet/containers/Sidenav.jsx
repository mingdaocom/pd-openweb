import React from 'react';
import { ScrollView, CardNav } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import { saveSelectExtensionNavType } from 'src/pages/publicWorksheetConfig/utils';

class Sidenav extends React.Component {
  handleClickNav = navType => {
    const { match = { params: {} } } = this.props;
    const { worksheetId } = match.params;
    saveSelectExtensionNavType(worksheetId, 'settingNav', navType);
    navigateTo(`/worksheet/formSet/edit/${worksheetId}/${navType}`);
  };

  render() {
    const { match = { params: {} } } = this.props;
    const { worksheetId, type = '' } = match.params;
    return (
      <ScrollView className="sidenavBox">
        <div className="title">{_l('基础设置')}</div>
        <CardNav
          currentNav={type || 'submitForm'}
          navList={[
            {
              icon: 'task_alt',
              title: _l('提交表单'),
              url: `/worksheet/formSet/edit/${worksheetId}/submitForm`,
              onClick: () => this.handleClickNav('submitForm'),
            },
            {
              icon: 'workflow_write',
              title: _l('数据名称'),
              url: `/worksheet/formSet/edit/${worksheetId}/alias`,
              onClick: () => this.handleClickNav('alias'),
            },
            {
              icon: 'toggle_off',
              title: _l('功能开关'),
              url: `/worksheet/formSet/edit/${worksheetId}/functionalSwitch`,
              onClick: () => this.handleClickNav('functionalSwitch'),
            },
          ]}
        />
        <div className="title">{_l('高级设置')}</div>
        <CardNav
          currentNav={type}
          navList={[
            {
              icon: 'task-list',
              title: _l('业务规则'),
              url: `/worksheet/formSet/edit/${worksheetId}/display`,
              onClick: () => this.handleClickNav('display'),
            },
            {
              icon: 'custom_actions',
              title: _l('自定义动作'),
              url: `/worksheet/formSet/edit/${worksheetId}/customBtn`,
              onClick: () => this.handleClickNav('customBtn'),
            },
            {
              icon: 'print',
              title: _l('打印模板'),
              url: `/worksheet/formSet/edit/${worksheetId}/printTemplate`,
              onClick: () => this.handleClickNav('printTemplate'),
            },
            {
              icon: 'db_index',
              title: _l('检索加速'),
              url: `/worksheet/formSet/edit/${worksheetId}/indexSetting`,
              onClick: () => this.handleClickNav('indexSetting'),
            },
          ]}
        />
      </ScrollView>
    );
  }
}

export default Sidenav;

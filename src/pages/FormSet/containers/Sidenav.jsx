import React from 'react';
import { ScrollView, CardNav } from 'ming-ui';

class Sidenav extends React.Component {
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
              description: _l('设置提交表单的文案和操作'),
              url: `/worksheet/formSet/edit/${worksheetId}/submitForm`,
            },
            {
              icon: 'workflow_write',
              title: _l('数据名称'),
              description: _l('设置标题字段、记录名称、字段别名'),
              url: `/worksheet/formSet/edit/${worksheetId}/alias`,
            },
            {
              icon: 'toggle_off',
              title: _l('功能开关'),
              description: _l('设置启用的系统功能和使用范围'),
              url: `/worksheet/formSet/edit/${worksheetId}/functionalSwitch`,
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
              description: _l('当满足条件时，变更字段的状态或提示错误'),
              url: `/worksheet/formSet/edit/${worksheetId}/display`,
            },
            {
              icon: 'custom_actions',
              title: _l('自定义动作'),
              description: _l('自定义在查看记录时可执行的操作'),
              url: `/worksheet/formSet/edit/${worksheetId}/customBtn`,
            },
            {
              icon: 'print',
              title: _l('打印模板'),
              description: _l('自定义记录打印时的样式'),
              url: `/worksheet/formSet/edit/${worksheetId}/printTemplate`,
            },
            {
              icon: 'db_index',
              title: _l('检索加速'),
              description: _l('自定义工作表索引以加快检索速度'),
              url: `/worksheet/formSet/edit/${worksheetId}/indexSetting`,
            },
          ]}
        />
      </ScrollView>
    );
  }
}

export default Sidenav;

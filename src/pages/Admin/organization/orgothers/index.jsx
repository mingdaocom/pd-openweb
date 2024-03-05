import React, { Component, Fragment } from 'react';
import Config from '../../config';
import AdminCommon from 'src/pages/Admin/common/common';
import ExportDialog from './components/ExportDialog';
import Announce from './components/Announce';
import Stat from './components/stat';
import './index.less';

const indexConfig = [
  {
    label: _l('群发通告'),
    clickValue: _l('发通告'),
    key: 'announce',
    click: 'toggleComp',
    desc: _l('可以在组织内群发通告，支持附件、私信、Email'),
  },
  {
    label: _l('使用统计'),
    clickValue: _l('查看'),
    key: 'stat',
    click: 'toggleComp',
    desc: _l('用户排行、动态更新、文档、图片等统计信息'),
  },
  {
    label: _l('数据导出'),
    clickValue: _l('导出'),
    key: 'exportVisible',
    click: 'handleChangeVisible',
    desc: _l('可以导出用户、群组、任务列表'),
  },
];

export default class Orgothers extends Component {
  constructor(props) {
    super(props);
    Config.setPageTitle(_l('其他'));
    this.state = {
      level: 'index',
      exportVisible: false,
    };
  }

  toggleComp = level => {
    if (Config.project.licenseType === 0) {
      AdminCommon.freeUpdateDialog();
      return;
    }
    this.setState({ level });
  };

  handleChangeVisible = (key, value) => {
    if (Config.project.licenseType === 0) {
      AdminCommon.freeUpdateDialog();
      return;
    }
    this.setState({
      [key]: value,
    });
  };

  render() {
    const { level, exportVisible } = this.state;

    return (
      <div className="orgManagementWrap adminToolsBox">
        {level === 'announce' ? (
          <Announce onClose={() => this.setState({ level: 'index' })} />
        ) : level === 'stat' ? (
          <Stat onClose={() => this.setState({ level: 'index' })} />
        ) : (
          <Fragment>
            <div className="orgManagementHeader">{_l('其他')}</div>
            <div className="orgManagementContent pTop0">
              {indexConfig.map(item => {
                return (
                  <div className="toolItem">
                    <div className="toolItemLabel">{item.label}</div>
                    <div className="toolItemRight">
                      <div>
                        <button
                          type="button"
                          className="ming Button Button--link ThemeColor3 adminHoverColor"
                          onClick={() => this[item.click](item.key, true)}
                        >
                          {item.clickValue}
                        </button>
                      </div>
                      <div className="toolItemDescribe mLeft5">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Fragment>
        )}

        {exportVisible && (
          <ExportDialog
            projectId={Config.projectId}
            visible={exportVisible}
            handleChangeVisible={this.handleChangeVisible}
          />
        )}
      </div>
    );
  }
}

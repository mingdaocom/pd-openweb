import React, { Component } from 'react';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import DiscussLogFile from '../../components/DiscussLogFile';
import './Discussion.less';

const ClickAwayable = createDecoratedComponent(withClickAway);

const clickAwayExceptions = [
  '.Discussion',
  '#folderSelectDialog_container',
  '#addLinkFileDialog_container',
  '#attachemntsPreviewContainer',
];

export default class Discussion extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let hiddenTabs = ['discussPortal', 'approval', 'workflow'];//工作表讨论暂时不支持外部讨论功能
    if (!this.props.logSwitch) {
      // 工作表日志权限
      hiddenTabs.push('logs');
    }
    if (!this.props.discussSwitch) {
      // 工作表讨论权限
      hiddenTabs.push('discuss', 'files');
    }

    return (
      <div className="Discussion">
        <ClickAwayable onClickAway={this.props.onClose} onClickAwayExceptions={clickAwayExceptions}>
          <DiscussLogFile
            hiddenTabs={hiddenTabs}
            title={this.props.title}
            projectId={this.props.projectId}
            worksheetId={this.props.worksheetId}
            appId={this.props.appId}
            appSectionId={this.props.appSectionId}
            viewId={this.props.viewId}
            rowId=""
            // addCallback={this.handelAddDiscussion}
          />
        </ClickAwayable>
      </div>
    );
  }
}

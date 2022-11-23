import React, { Component } from 'react';
import DialogLayer from 'src/components/mdDialog/dialog';
import './less/setFolder.less';
import ajaxRequest from 'src/api/taskCenter';
import RadioGroup from 'ming-ui/components/RadioGroup';
import 'src/components/tooltip/tooltip';

export default class SetFolder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: '',
    };
  }

  componentWillMount() {
    ajaxRequest
      .getFolderConfig({
        folderId: this.props.folderId,
      })
      .then((source) => {
        this.setState({
          data: source.data,
          stageConfig: source.data.stageConfig,
          templateScope: source.data.templateScope,
          folderAuthVisible: source.data.folderAuthVisible,
        });
      });
  }

  componentDidMount() {
    $('#setFolder_container').on(
      {
        mouseover() {
          if ($(this).data('tip')) {
            return false;
          }
          $(this).MD_UI_Tooltip({
            text: _l('默认负责人和管理员可编辑看板；%0项目成员只能查看看板内容，创建任务，对看板没有编辑权限', '<br />'),
            arrowLeft: 190,
            offsetLeft: -199,
            offsetTop: -70,
            location: 'up',
            checkHeight: true,
            width: 430,
          });
          $(this)
            .data('tip', true)
            .mouseenter();
        },
      },
      '.msgTipJs'
    );
  }

  /**
   * 项目下字段义字段，判断是否出现Dialog层
   * @param  {boolean} templateScope
   */
  templateScopeDialog(templateScope) {
    // 模板作用域， false： 全部使用 true：顶层任务使用 ，逻辑默认值设定为true ，数据库历史原因，可以避免刷数据
    if (templateScope) {
      $.DialogLayer({
        dialogBoxID: 'setFolderComfirm',
        showClose: false,
        width: 490,
        container: {
          header: _l('您确定切换到只在项目下1级任务显示自定义任务内容？'),
          content: `<span class="Font13">${_l('切换后1级以下任务中的自定义任务内容所有数据将被删除，无法恢复')}</span>`,
          yesFn: () => {
            this.updateFolderTemplateScope(templateScope);
          },
          noFn: () => {
            this.setState({ templateScope: !templateScope });
          },
        },
      });
    } else {
      this.updateFolderTemplateScope(templateScope);
    }
  }

  /**
   * 项目下字段义字段呈现层级
   * @param  {boolean} templateScope
   */
  updateFolderTemplateScope(templateScope) {
    ajaxRequest
      .updateFolderTemplateScope({
        folderID: this.props.folderId,
        templateScope,
      })
      .then((source) => {
        if (source.status) {
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'));
          this.setState({ templateScope: !templateScope });
        }
      });
  }

  /**
   * 更改权限
   * @param  {number} stageConfig
   */
  updateStageConfig(stageConfig) {
    ajaxRequest
      .updateStageConfig({
        folderID: this.props.folderId,
        stageConfig,
      })
      .then((source) => {
        if (source.status) {
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'));
          this.setState({ stageConfig: stageConfig === 0 ? 1 : 0 });
        }
      });
  }

  /**
   * 项目可见性Dialog
   * @param  {number} auth
   * @param  {number} originalAuth
   */
  folderAuthVisibleDialog(auth, originalAuth) {
    if (auth < originalAuth) {
      $.DialogLayer({
        dialogBoxID: 'setFolderComfirm',
        showClose: false,
        width: 490,
        container: {
          header: _l('注意：'),
          content: `<span class="Font13">${_l('这将导致成员能看到此项目下其当前不可见的任务，请确认其中的信息可以对成员公开。')}</span>`,
          yesFn: () => {
            this.updateFolderAuthVisible(auth);
          },
          noFn: () => {
            this.setState({ folderAuthVisible: originalAuth });
          },
        },
      });
    } else {
      this.updateFolderAuthVisible(auth, originalAuth);
    }
  }

  /**
   * 项目可见性修改
   * @param  {number} auth
   * @param  {number} originalAuth
   */
  updateFolderAuthVisible(auth, originalAuth) {
    ajaxRequest
      .updateFolderAuthVisible({
        folderID: this.props.folderId,
        folderAuthVisible: auth,
      })
      .then((source) => {
        if (source.status) {
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'));
          this.setState({ folderAuthVisible: originalAuth });
        }
      });
  }

  render() {
    const settings = {
      dialogBoxID: 'setFolder',
      container: {
        header: _l('项目配置'),
        yesText: '',
        noText: '',
        noFn: this.props.onClose,
      },
    };

    const stageAuthSetting = {
      data: [
        {
          text: _l('只有负责人和管理员可以编辑'),
          value: 0,
        },
        {
          text: _l('项目成员均可编辑'),
          value: 1,
        },
      ],
      checkedValue: this.state.stageConfig,
      vertical: true,
      onChange: (value) => {
        this.setState({ stageConfig: value });
        this.updateStageConfig(value);
      },
    };

    const customSetting = {
      data: [
        {
          text: _l('只在项目下的1级任务显示自定义任务内容'),
          value: true,
        },
        {
          text: _l('项目下的各级任务都显示自定义任务内容'),
          value: false,
        },
      ],
      checkedValue: this.state.templateScope,
      vertical: true,
      onChange: (value) => {
        this.setState({ templateScope: value });
        this.templateScopeDialog(value);
      },
    };

    const folderSetting = {
      data: [
        {
          text: _l('可见项目下所有任务，可查看所有任务详情'),
          value: 0,
        },
        {
          text: _l('可见项目下所有任务的标题，但不可查看未参与任务的详情'),
          value: 1,
        },
        {
          text: _l('不可见未参与的任务（也无法查看详情）'),
          value: 2,
        },
      ],
      checkedValue: this.state.folderAuthVisible,
      vertical: true,
      onChange: (value) => {
        const originalAuth = this.state.folderAuthVisible;
        this.setState({ folderAuthVisible: value });
        this.folderAuthVisibleDialog(value, originalAuth);
      },
    };

    return (
      <DialogLayer {...settings}>
        {this.state.data ? (
          <div>
            <div className="Font13 mBottom20">
              <div className="mBottom10">
                <span>{_l('1、项目看板的编辑权限')}</span>
                <span className="msgTip msgTipJs">
                  <i className="icon-task-folder-message" />
                </span>
              </div>
              <RadioGroup {...stageAuthSetting} />
            </div>
            <div className="Font13 mBottom20">
              <div className="mBottom10">{_l('2、自定义任务内容在项目下多级任务的呈现')}</div>
              <RadioGroup {...customSetting} />
            </div>
            <div className="Font13 mBottom20">
              <div className="mBottom10">
                <span>{_l('3、成员对项目下任务的可见权限')}</span>
                <span className="msgTip tip-top" data-tip={_l('仅影响项目成员和在公开范围内人员，管理员固定为对项目下所有任务可见且可查看详情')}>
                  <i className="icon-task-folder-message" />
                </span>
              </div>
              <RadioGroup {...folderSetting} />
            </div>
          </div>
        ) : (
          ''
        )}
      </DialogLayer>
    );
  }
}

import React, { Component, Fragment } from 'react';
import { Modal, Radio, Tooltip } from 'ming-ui/antd-components';
import ajaxRequest from 'src/api/taskCenter';
import './less/setFolder.less';

export default class SetFolder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: '',
    };
  }

  componentDidMount() {
    ajaxRequest
      .getFolderConfig({
        folderId: this.props.folderId,
      })
      .then(source => {
        this.setState({
          data: source.data,
          stageConfig: source.data.stageConfig,
          templateScope: source.data.templateScope,
          folderAuthVisible: source.data.folderAuthVisible,
        });
      });
  }

  /**
   * 项目下字段义字段，判断是否出现Dialog层
   * @param  {boolean} templateScope
   */
  templateScopeDialog(templateScope) {
    // 模板作用域， false： 全部使用 true：顶层任务使用 ，逻辑默认值设定为true ，数据库历史原因，可以避免刷数据
    if (templateScope) {
      Modal.confirm({
        width: 490,
        closable: false,
        wrapClassName: 'setFolderComfirm',
        title: <span className="textError">{_l('您确定切换到只在项目下1级任务显示自定义任务内容？')}</span>,
        content: <span class="Font13">{_l('切换后1级以下任务中的自定义任务内容所有数据将被删除，无法恢复')}</span>,
        onCancel: () => {
          this.setState({
            templateScope: !templateScope,
          });
        },
        onOk: () => this.updateFolderTemplateScope(templateScope),
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
      .then(source => {
        if (source.status) {
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'), 2);
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
      .then(source => {
        if (source.status) {
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'), 2);
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
      Modal.confirm({
        wrapClassName: 'setFolderComfirm',
        width: 490,
        closable: false,
        title: _l('注意：'),
        content: (
          <span class="Font13">
            {_l('这将导致成员能看到此项目下其当前不可见的任务，请确认其中的信息可以对成员公开。')}
          </span>
        ),
        onCancel: () => {
          this.setState({
            folderAuthVisible: originalAuth,
          });
        },
        onOk: () => this.updateFolderAuthVisible(auth),
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
      .then(source => {
        if (source.status) {
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'), 2);
          this.setState({ folderAuthVisible: originalAuth });
        }
      });
  }

  render() {
    const stageAuthSetting = {
      options: [
        {
          label: _l('只有负责人和管理员可以编辑'),
          value: 0,
        },
        {
          label: _l('项目成员均可编辑'),
          value: 1,
        },
      ],
      value: this.state.stageConfig,
      vertical: true,
      onChange: event => {
        const value = event.target.value;

        this.setState({ stageConfig: value });
        this.updateStageConfig(value);
      },
    };

    const customSetting = {
      options: [
        {
          label: _l('只在项目下的1级任务显示自定义任务内容'),
          value: true,
        },
        {
          label: _l('项目下的各级任务都显示自定义任务内容'),
          value: false,
        },
      ],
      value: this.state.templateScope,
      vertical: true,
      onChange: event => {
        const value = event.target.value;

        this.setState({ templateScope: value });
        this.templateScopeDialog(value);
      },
    };

    const folderSetting = {
      options: [
        {
          label: _l('可见项目下所有任务，可查看所有任务详情'),
          value: 0,
        },
        {
          label: _l('可见项目下所有任务的标题，但不可查看未参与任务的详情'),
          value: 1,
        },
        {
          label: _l('不可见未参与的任务（也无法查看详情）'),
          value: 2,
        },
      ],
      value: this.state.folderAuthVisible,
      vertical: true,
      onChange: event => {
        const value = event.target.value;
        const originalAuth = this.state.folderAuthVisible;

        this.setState({ folderAuthVisible: value });
        this.folderAuthVisibleDialog(value, originalAuth);
      },
    };

    return (
      <Modal
        open
        rootClassName="setFolder"
        mask={{ closable: true }}
        keyboard
        title={_l('项目配置')}
        footer={null}
        onCancel={this.props.onClose}
      >
        {this.state.data ? (
          <div>
            <div className="Font13 mBottom20">
              <div className="mBottom10">
                <span>{_l('1、项目看板的编辑权限')}</span>
                <Tooltip
                  title={() => {
                    return (
                      <Fragment>
                        <div>{_l('默认负责人和管理员可编辑看板；')}</div>
                        <div>{_l('项目成员只能查看看板内容，创建任务，对看板没有编辑权限')}</div>
                      </Fragment>
                    );
                  }}
                >
                  <span className="msgTip">
                    <i className="icon-error1" />
                  </span>
                </Tooltip>
              </div>
              <Radio.Group {...stageAuthSetting} />
            </div>
            <div className="Font13 mBottom20">
              <div className="mBottom10">{_l('2、自定义任务内容在项目下多级任务的呈现')}</div>
              <Radio.Group {...customSetting} />
            </div>
            <div className="Font13 mBottom20">
              <div className="mBottom10">
                <span>{_l('3、成员对项目下任务的可见权限')}</span>
                <Tooltip title={_l('仅影响项目成员和在公开范围内人员，管理员固定为对项目下所有任务可见且可查看详情')}>
                  <span className="msgTip">
                    <i className="icon-error1" />
                  </span>
                </Tooltip>
              </div>
              <Radio.Group {...folderSetting} />
            </div>
          </div>
        ) : (
          ''
        )}
      </Modal>
    );
  }
}

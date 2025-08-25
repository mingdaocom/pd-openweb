﻿import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import DialogBase from 'ming-ui/components/Dialog/DialogBase';
import { SelectGroupTrigger } from 'ming-ui/functions/quickSelectGroup';
import ajaxRequest from 'src/api/taskCenter';
import { expireDialogAsync } from 'src/components/upgradeVersion';
import './less/createFolder.less';

export default class CreateFolder extends Component {
  static defaultProps = {
    mdAppId: '',
    projectId: '',
    templateId: '',
    templateName: '',
    createFolderCallback: null,
    background: '',
    materials: [],
    scope: undefined,
  };

  constructor(props) {
    super(props);
    let projectId = props.projectId;
    let companyName = _l('个人');

    if (!projectId) {
      const lastProjectId = window.localStorage.getItem('lastProjectId');
      if (lastProjectId !== null) {
        projectId = lastProjectId;
      } else if (md.global.Account.projects.length) {
        projectId = md.global.Account.projects[0].projectId;
      }
    }

    // 监测网络是否过期
    $.map(md.global.Account.projects, project => {
      if (projectId === project.projectId && project.licenseType === 0) {
        projectId = '';
        return;
      }
    });

    // 去除切换网络时的网络id不在自己的网络列表中
    if (_.findIndex(md.global.Account.projects, project => project.projectId === projectId) === -1) {
      projectId = '';
    }

    $.map(md.global.Account.projects, project => {
      if (project.projectId === projectId) {
        companyName = project.companyName;
        return;
      }
    });

    this.state = {
      projectId,
      companyName,
      showNetworkList: false,
      showRangeBox: false,
      onlyMemberLook: true,
      visible: true,
    };
  }

  componentDidMount() {
    const that = this;

    $('#folderName').select();

    $(document)
      .off('.createFolder')
      .on('click.createFolder', event => {
        const $target = $(event.target);

        // 隐藏所属网络
        if (
          !$target.closest('.createFolderNetworkList').length &&
          !$target.closest('.createFolderNetwork').length &&
          $('.createFolderNetworkList').is(':visible')
        ) {
          that.setState({ showNetworkList: false });
        }

        if (
          !$target.closest('.createFolderRangeBox').length &&
          !$target.closest('.createFolderBox').length &&
          $('.createFolderRangeBox').is(':visible')
        ) {
          that.setState({ showRangeBox: false });
        }
      });
  }

  /**
   * 选择网络
   * @param  {string} projectId
   * @param  {string} companyName
   */
  networkSelect(projectId, companyName) {
    if (projectId !== this.state.projectId) {
      // 监测网络是否过期
      expireDialogAsync(projectId)
        .then(() => {
          this.setState({ companyName, projectId });
        })
        .catch(() => {
          this.setState({ companyName: _l('个人'), projectId: '' });
        });
    }

    this.setState({ showNetworkList: false, onlyMemberLook: true });
  }

  /**
   * 分享范围选择
   * @param  {boolean} onlyMemberLook
   */
  rangeSelect(onlyMemberLook) {
    this.setState({ onlyMemberLook });
  }

  /**
   * 回车创建项目
   * @param  {oblect} evt
   */
  folderNameKeyDown(evt) {
    if (evt.keyCode === 13) {
      this.create();
    }
  }

  /**
   * 创建项目
   */
  create() {
    const { scope } = this.state;
    const folderName = $.trim($('#folderName').val());
    let visibility;
    let groupIds = [];

    if (folderName.length === 0) {
      alert(_l('请输入项目名称'), 3);
      return false;
    }

    if (this.state.onlyMemberLook) {
      // 仅成员可见
      visibility = 0;
    } else if (
      !scope ||
      (scope.shareGroupIds.length === 0 && scope.shareProjectIds.indexOf(this.state.projectId) === -1)
    ) {
      // 公开项目未选群组
      alert(_l('请选择公开的范围'), 3);
      return false;
    } else if (scope.shareProjectIds.indexOf(this.state.projectId) > -1) {
      // 全公司可见
      visibility = 2;
      groupIds.push('everyone');
    } else {
      visibility = 1;
      groupIds = scope.shareGroupIds;
    }

    // 创建项目
    ajaxRequest
      .addFolder({
        mdAppId: this.props.mdAppId,
        folderName,
        projectId: this.state.projectId,
        visibility,
        groupID: groupIds.join(','),
        templateId: this.props.templateId,
      })
      .then(source => {
        if (source.status) {
          this.props.onClose();
          safeLocalStorageSetItem('lastProjectId', this.state.projectId);
          alert(_l('创建成功'));

          if ($.isFunction(this.props.createFolderCallback)) {
            this.props.createFolderCallback(source.data);
          }
        } else {
          alert(_l('操作失败，请稍后再试！'), 2);
        }
      });
  }

  handleScope = value => this.setState({ scope: value });

  render() {
    const sliderHeight = {
      height: $(window).height() - 180,
      overflow: 'hidden',
    };
    const dialogOpts = {
      overlayClosable: false,
      visible: this.state.visible,
      width: 1000,
      onClose: this.props.onClose,
    };

    return (
      <DialogBase {...dialogOpts}>
        <div className="flexRow" id="createFolder">
          <div className="flex">
            <div className="createFolderHead relative Font13">
              {_l('模板预览')}
              <span className="createFolderReturn ThemeColor3" onClick={() => this.props.onClose()}>
                <i className="mRight5 icon-backspace" />
                {_l('返回')}
              </span>
            </div>
            <div className="createFolderSlider">
              {this.props.materials
                .filter((o, index) => index === 0)
                .map((material, i) => {
                  return (
                    <div style={{ ...sliderHeight }} key={i}>
                      <img src={material} />
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="folderBox relative">
            <div className="folderBoxImg">
              <img src={this.props.background} />
            </div>
            <div className="folderBoxPadding">
              <input
                type="text"
                id="folderName"
                className="ThemeBorderColor3 boxSizing"
                maxLength="100"
                onKeyDown={evt => this.folderNameKeyDown(evt)}
                placeholder={_l('请输入项目名称')}
                defaultValue={this.props.templateId ? this.props.templateName : ''}
              />
            </div>
            {md.global.Account.projects.length ? (
              <div className="folderBoxPadding">
                <div className="folderBoxDesc">{_l('归属')}</div>
                <div
                  className={cx('createFolderNetwork', { cursorDefault: this.props.projectId })}
                  onClick={() =>
                    !this.props.projectId && this.setState({ showNetworkList: !this.state.showNetworkList })
                  }
                >
                  <span className="createFolderNetworkName">{this.state.companyName}</span>
                  {!this.props.projectId && <i className="icon-arrow-down-border" />}
                </div>
                <ul
                  className={cx('createFolderNetworkList boxShadow5 boderRadAll_3', {
                    Hidden: !this.state.showNetworkList,
                  })}
                >
                  {md.global.Account.projects.map((project, i) => {
                    return (
                      <li
                        className="ThemeBGColor3"
                        key={i}
                        onClick={() => this.networkSelect(project.projectId, project.companyName)}
                      >
                        <i className="icon-business" />
                        {project.companyName}
                      </li>
                    );
                  })}
                  <li className="ThemeBGColor3" onClick={() => this.networkSelect('', _l('个人'))}>
                    <i className="icon-charger" />
                    {_l('个人')}
                  </li>
                </ul>
              </div>
            ) : undefined}

            <div className="folderBoxPadding folderBoxDesc folderBoxMargin">{_l('公开范围：')}</div>
            <div className="folderBoxPadding valignWrapper">
              <span
                className="createFolderBox"
                onClick={() => this.setState({ showRangeBox: !this.state.showRangeBox })}
              >
                <div className="createFolderRange">
                  {this.state.onlyMemberLook ? _l('仅项目成员可见') : _l('公开给指定群组')}
                </div>
                <i className="icon-arrow-down-border" />
                <ul
                  className={cx('createFolderRangeBox boderRadAll_3 boxShadow5', { Hidden: !this.state.showRangeBox })}
                >
                  <li className="ThemeBGColor3" onClick={() => this.rangeSelect(true)}>
                    <div className={cx('text', { ThemeColor3: this.state.onlyMemberLook })}>{_l('仅项目成员可见')}</div>
                    <div className="descTip">{_l('只有添加为项目成员才可以查看项目')}</div>
                  </li>
                  <li className="createFolderLine" />
                  <li className="ThemeBGColor3" onClick={() => this.rangeSelect(false)}>
                    <div className={cx('text', { ThemeColor3: !this.state.onlyMemberLook })}>
                      {_l('公开给指定群组')}
                    </div>
                    <div className="descTip">{_l('所选范围内的所有人都可以查看项目')}</div>
                  </li>
                </ul>
              </span>
              {!this.state.onlyMemberLook && (
                <SelectGroupTrigger
                  hideIcon
                  minHeight={260}
                  projectId={this.state.projectId}
                  isMe={false}
                  everyoneOnly
                  onChange={this.handleScope}
                />
              )}
            </div>
            <div className="createFolderBtn">
              <span className="createFolderBtnCancel ThemeColor3" onClick={() => this.props.onClose()}>
                {_l('取消')}
              </span>
              <span className="createFolderBtnSave ThemeBGColor3" onClick={() => this.create()}>
                {_l('确定')}
              </span>
            </div>
          </div>
        </div>
      </DialogBase>
    );
  }
}

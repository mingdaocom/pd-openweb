import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dropdown, Modal } from 'ming-ui/antd-components';
import { SelectGroupPopover } from 'ming-ui/functions/quickSelectGroup';
import ajaxRequest from 'src/api/taskCenter';
import { expireDialogAsync } from 'src/components/upgradeVersion';
import './less/createFolder.less';

const CREATE_FOLDER_MODAL_STYLES = {
  container: { padding: 0 },
  body: { padding: 0 },
};
const PERSONAL_NETWORK_KEY = 'personal';
const NETWORK_MENU_STYLE = { minWidth: 222, maxHeight: 180, overflowY: 'auto' };
const RANGE_MENU_STYLE = { minWidth: 260 };

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
    _.map(md.global.Account.projects, project => {
      if (projectId === project.projectId && project.licenseType === 0) {
        projectId = '';
        return;
      }
    });

    // 去除切换网络时的网络id不在自己的网络列表中
    if (_.findIndex(md.global.Account.projects, project => project.projectId === projectId) === -1) {
      projectId = '';
    }

    _.map(md.global.Account.projects, project => {
      if (project.projectId === projectId) {
        companyName = project.companyName;
        return;
      }
    });

    this.state = {
      projectId,
      companyName,
      onlyMemberLook: true,
      visible: true,
      submitting: false,
    };
    this.requestPending = false;
  }

  componentDidMount() {
    $('#folderName').select();
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

    this.setState({ onlyMemberLook: true });
  }

  handleNetworkSelect = ({ key }) => {
    if (key === PERSONAL_NETWORK_KEY) {
      this.networkSelect('', _l('个人'));
      return;
    }

    const project = md.global.Account.projects.find(item => item.projectId === key);

    if (project) {
      this.networkSelect(project.projectId, project.companyName);
    }
  };

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
    if (this.requestPending) return;

    const { scope } = this.state;
    const folderName = $('#folderName').val().trim();
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

    this.requestPending = true;
    this.setState({ submitting: true });
    // 创建项目
    return ajaxRequest
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

          if (_.isFunction(this.props.createFolderCallback)) {
            this.props.createFolderCallback(source.data);
          }
        } else {
          alert(_l('操作失败，请稍后再试！'), 2);
        }
      })
      .finally(() => {
        this.requestPending = false;
        this.setState({ submitting: false });
      });
  }

  handleScope = value => this.setState({ scope: value });

  render() {
    const networkItems = [
      ...md.global.Account.projects.map(project => ({
        key: project.projectId,
        icon: <i className="icon-business" />,
        label: project.companyName,
      })),
      { key: PERSONAL_NETWORK_KEY, icon: <i className="icon-charger" />, label: _l('个人') },
    ];
    const rangeItems = [
      {
        key: 'members',
        label: (
          <div>
            <div>{_l('仅项目成员可见')}</div>
            <div className="createFolderRangeDescription">{_l('只有添加为项目成员才可以查看项目')}</div>
          </div>
        ),
      },
      { type: 'divider' },
      {
        key: 'groups',
        label: (
          <div>
            <div>{_l('公开给指定群组')}</div>
            <div className="createFolderRangeDescription">{_l('所选范围内的所有人都可以查看项目')}</div>
          </div>
        ),
      },
    ];
    const networkTrigger = (
      <div className={cx('createFolderNetwork', { cursorDefault: this.props.projectId })}>
        <span className="createFolderNetworkName">{this.state.companyName}</span>
        {!this.props.projectId && <i className="icon-arrow-down-border" />}
      </div>
    );
    const sliderHeight = {
      height: $(window).height() - 180,
      overflow: 'hidden',
    };
    const dialogOpts = {
      open: this.state.visible,
      width: 1000,
      title: null,
      footer: null,
      closable: false,
      mask: { closable: false },
      styles: CREATE_FOLDER_MODAL_STYLES,
    };

    return (
      <Modal {...dialogOpts}>
        <div className="flexRow" id="createFolder">
          <div className="flex">
            <div className="createFolderHead relative Font13">
              {_l('模板预览')}
              <span className="createFolderReturn colorPrimary" onClick={() => this.props.onClose()}>
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
                className="borderColorPrimary boxSizing"
                maxLength="100"
                onKeyDown={evt => this.folderNameKeyDown(evt)}
                placeholder={_l('请输入项目名称')}
                defaultValue={this.props.templateId ? this.props.templateName : ''}
              />
            </div>
            {md.global.Account.projects.length ? (
              <div className="folderBoxPadding">
                <div className="folderBoxDesc">{_l('归属')}</div>
                {this.props.projectId ? (
                  networkTrigger
                ) : (
                  <Dropdown
                    trigger={['click']}
                    placement="bottomLeft"
                    menu={{
                      items: networkItems,
                      selectable: true,
                      selectedKeys: [this.state.projectId || PERSONAL_NETWORK_KEY],
                      style: NETWORK_MENU_STYLE,
                      onClick: this.handleNetworkSelect,
                    }}
                  >
                    {networkTrigger}
                  </Dropdown>
                )}
              </div>
            ) : undefined}

            <div className="folderBoxPadding folderBoxDesc folderBoxMargin">{_l('公开范围：')}</div>
            <div className="folderBoxPadding valignWrapper">
              <Dropdown
                trigger={['click']}
                placement="bottomLeft"
                menu={{
                  items: rangeItems,
                  selectable: true,
                  selectedKeys: [this.state.onlyMemberLook ? 'members' : 'groups'],
                  style: RANGE_MENU_STYLE,
                  onClick: ({ key }) => this.rangeSelect(key === 'members'),
                }}
              >
                <span className="createFolderBox">
                  <div className="createFolderRange">
                    {this.state.onlyMemberLook ? _l('仅项目成员可见') : _l('公开给指定群组')}
                  </div>
                  <i className="icon-arrow-down-border" />
                </span>
              </Dropdown>
              {!this.state.onlyMemberLook && (
                <SelectGroupPopover
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
              <span className="createFolderBtnCancel colorPrimary" onClick={() => this.props.onClose()}>
                {_l('取消')}
              </span>
              <span
                className={cx('createFolderBtnSave bgColorPrimary', { disabled: this.state.submitting })}
                onClick={() => this.create()}
              >
                {_l('确定')}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

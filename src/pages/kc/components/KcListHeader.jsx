import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import cx from 'classnames';
import DocumentTitle from 'react-document-title';
import { Icon } from 'ming-ui';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withHoverState from 'ming-ui/decorators/withHoverState';
import { expireDialogAsync } from 'src/util';
import Trigger from 'rc-trigger';
import { NODE_STATUS, PICK_TYPE } from '../constant/enum';
import _ from 'lodash';

const HoverState = createDecoratedComponent(withHoverState);

export default class KcListHeader extends Component {
  static propTypes = {
    currentRoot: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({}),
    ]),
    baseUrl: PropTypes.string,
    currentFolder: PropTypes.shape({}),
    isGlobalSearch: PropTypes.bool,
    isList: PropTypes.bool,
    isPinDetail: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    isRecycle: PropTypes.bool,
    keywords: PropTypes.string,
    rootNameAndLink: PropTypes.shape({}),
    startGlobalSearch: PropTypes.func,
    loadRecycleBin: PropTypes.func,
    editRoot: PropTypes.func,
    changeKcView: PropTypes.func,
    toggleDetailAndTogglePin: PropTypes.func,
    openUploadAssistant: PropTypes.func,
    addLinkFile: PropTypes.func,
    onShowAddNewFolder: PropTypes.func,
    onSelectAllItems: PropTypes.func,
    onRemoveNode: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      showAddNodeBtnMenu: false,
    };
  }
  getUrlByPosition(position) {
    const { baseUrl } = this.props;
    return baseUrl + position.replace(new RegExp('^/' + md.global.Account.accountId), '/my');
  }

  @autobind
  handleAddNodeBtn() {
    const { currentRoot } = this.props;
    if (typeof currentRoot === 'object' && currentRoot.project) {
      expireDialogAsync(currentRoot.project.projectId)
        .then(() => {
          this.setState({ showAddNodeBtnMenu: true });
        })
        .catch(() => this.setState({ showAddNodeBtnMenu: false }));
    } else {
      this.setState({ showAddNodeBtnMenu: true });
    }
  }
  // 临时
  addNewFolder() {}
  selectAll() {}
  removeNode() {}
  render() {
    const {
      currentRoot,
      isGlobalSearch,
      isList,
      isReadOnly,
      isRecycle,
      isPinDetail,
      currentFolder,
      keywords,
      rootNameAndLink,
      startGlobalSearch,
      loadRecycleBin,
      editRoot,
      changeKcView,
      toggleDetailAndTogglePin,
      openUploadAssistant,
      addLinkFile,
      onShowAddNewFolder,
      onSelectAllItems,
      onRemoveNode,
    } = this.props;
    const { showAddNodeBtnMenu, hoverAddNodeBtn } = this.state;
    return (<div className="kcRightHead Relative boxSizing">
      <DocumentTitle title={_l('%0-知识', _.isEmpty(currentFolder) ? rootNameAndLink.name : currentFolder.name)} />
      {
        keywords && isGlobalSearch
        ? <div className="searchHead boxSizing">{_l('知识中心 中的搜索结果')}</div>
        : <div className="kcRightHeadPosition flexRow boxSizing">
          <span className={cx({ kcPositionFirst: !currentFolder })}>
            <a
              className="kcPosition firstPosition ThemeHoverColor3 ellipsis"
              href={encodeURI(rootNameAndLink.link)}
              title={rootNameAndLink.name}
            >
              {rootNameAndLink.name}
            </a>
          </span>
          <span className={cx({ hide: !isRecycle })}>
            {' '}
            >{' '}
            <a className="kcPosition ellipsis ThemeHoverColor3" onClick={() => loadRecycleBin(true)}>
              {_l('回收站')}
            </a>
          </span>
          {
            currentFolder
            && currentFolder.position
            && currentFolder.position.split('/').map((part, i) => {
                if (i == 0 || i == 1 || !part) {
                  return undefined;
                }
                if (i > currentFolder.position.split('/').length - (keywords && !isGlobalSearch ? 2 : 4)) {
                  const href = this.getUrlByPosition(
                    currentFolder.position
                      .split('/')
                      .slice(0, i + 1)
                      .join('/')
                  );
                  return i === currentFolder.position.split('/').length - 1 ? (
                    <span key={i} className={keywords && !isGlobalSearch ? 'positionSpan' : 'flex relative'}>
                      &nbsp;>{' '}
                      <span className={cx({ lastPosition: !keywords || isGlobalSearch })}>
                        <a
                          className="kcPosition ellipsis ThemeHoverColor3"
                          href={encodeURI(href)}
                          title={part}
                        >
                          {part}
                        </a>
                      </span>
                    </span>
                  ) : (
                    <span className="positionSpan" key={i}>
                      &nbsp;>{' '}
                      <a
                        className="kcPosition ellipsis ThemeHoverColor3"
                        href={encodeURI(href)}
                        title={part}
                      >
                        {part}
                      </a>
                    </span>
                  );
                } else if (i === 2) {
                  return <span className="positionSpan">&nbsp;> ...</span>;
                }
                return '';
            })
          }
          {
            keywords
            && !isGlobalSearch
            && <span className="globalSearch ellipsis Font16">
              &nbsp;&nbsp;{_l('中的搜索结果')}{' '}
              <a
                className="globalSearch"
                onClick={() => { startGlobalSearch(keywords); }}
              >
                &nbsp;&nbsp;{_l('搜索整个知识中心')}
              </a>
            </span>
          }
        </div>
      }

      <div className="kcRightHeadOperate boxSizing">
        <span className="tip-con" data-tip={'共享设置'}>
          <i
            className={cx('icon-group-members ThemeHoverColor3', { hide: !currentRoot.id || isRecycle })}
            onClick={() => {
              editRoot(currentRoot.id);
            }}
          />
        </span>
        <span className="tip-con" data-tip={_l('文件详情')}>
          <i
            className={cx('icon-knowledge-message showDetail ThemeHoverColor3', { ThemeColor3: isPinDetail }, { hide: isRecycle })}
            ref="toggleDetailAndTogglePinBtn"
            onClick={toggleDetailAndTogglePin}
          />
        </span>
        <span className="tip-con" data-tip={isList ? _l('切换为缩略图') : _l('切换为列表')}>
          <i
            className={cx('ThemeHoverColor3', { hide: isRecycle }, isList ? 'icon-home-navigation' : 'icon-task-list')}
            onClick={changeKcView}
          />
        </span>

        <Trigger
          popupVisible={showAddNodeBtnMenu}
          onPopupVisibleChange={visible => {
            this.setState({ showAddNodeBtnMenu: visible });
          }}
          popupClassName="DropdownPanelTrigger"
          action={['click']}
          popupPlacement="bottom"
          builtinPlacements={{
            bottom: {
              points: ['tl', 'bl'],
            }
          }}
          popup={
            <Menu
              className={cx('kcAddNodeBtnMenu', { hide: !showAddNodeBtnMenu || isRecycle })}
            >
              <MenuItem
                icon={<Icon icon="attachment" className="Gray_9e"/>}
                onClick={() => {
                  openUploadAssistant();
                  this.setState({ showAddNodeBtnMenu: false });
                }}
              >
                {_l('上传本地文件')}
              </MenuItem>
              <MenuItem
                icon={<Icon icon="link" className="Gray_9e"/>}
                onClick={() => {
                  addLinkFile();
                  this.setState({ showAddNodeBtnMenu: false });
                }}
              >
                {_l('添加链接文件')}
              </MenuItem>
              <MenuItem
                className="uploadFileForGuide"
                icon={<Icon icon="task-folder-solid" className="Gray_9e"/>}
                onClick={() => {
                  onShowAddNewFolder();
                  this.setState({ showAddNodeBtnMenu: false });
                }}
              >
                {_l('新建文件夹')}
              </MenuItem>
            </Menu>
          }
          popupAlign={{ offset: [-70, 2], overflow: { adjustX: 2, adjustY: 1 } }}
        >
          <span
            className={cx('kcRightAdd ThemeBGColor3 ThemeHoverBGColor2', {
              hide: isRecycle || ((isRecycle || currentRoot === PICK_TYPE.STARED || currentRoot === PICK_TYPE.RECENT || isReadOnly) && currentRoot !== PICK_TYPE.MY),
            })}
          >
            <i className="icon-plus" />
            {_l('添加')}
          </span>
        </Trigger>

        <HoverState
          component="span"
          thisArg={this}
          hoverStateName="hoverAddNodeBtn"
          className={cx('kcRightDel boderRadAll_3', hoverAddNodeBtn ? 'ThemeBGColor2' : 'ThemeBGColor3', { hide: !isRecycle })}
          onClick={() => onSelectAllItems(true, () => onRemoveNode(NODE_STATUS.DELETED))}
        >
          {_l('清空回收站')}
        </HoverState>
      </div>
    </div>);
  }
}

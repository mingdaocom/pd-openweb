import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import Immutable from 'immutable';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { Icon, ScrollView } from 'ming-ui';
import { Divider, Dropdown, Input, Menu, Modal, Tooltip } from 'ming-ui/antd-components';
import service from '../../api/service';
import MDLeftNav from 'src/pages/feed/components/common/mdLeftNav';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { PICK_TYPE, ROOT_FILTER_TYPE, ROOT_PERMISSION_TYPE } from '../../constant/enum';
import * as kcActions from '../../redux/actions/kcAction';
import { getRootByPath, humanFileSize, shallowEqual } from '../../utils';
import { addNewRoot, editRoot, removeRoot } from './rootHandler';
import { getRootLog } from './rootLog';
import './KcLeft.less';

const SEARCH_INPUT_STYLE = { display: 'flex', width: 220, margin: '6px auto' };

const NavMenu = ({ className, items }) => (
  <Menu
    items={items}
    selectable={false}
    mode="vertical"
    className={className}
    styles={{
      root: { border: 0 },
      item: { '--hap-menu-item-height': '40px', margin: 0, width: '100%', borderRadius: 0 },
      itemIcon: { width: 16, fontSize: 16, textAlign: 'center' },
      itemContent: { flex: 1, minWidth: 0, marginLeft: 15 },
    }}
  />
);

NavMenu.propTypes = {
  className: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
};

const stopMenuPropagation = ({ domEvent }) => domEvent.stopPropagation();

class KcLeft extends Component {
  static propTypes = {
    path: PropTypes.string,
    keywords: PropTypes.string,
    usage: PropTypes.shape({}),
    searchNodes: PropTypes.func,
    currentFolder: PropTypes.shape({}),
    getUsage: PropTypes.func,
    currentRoot: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({})]),
  };

  constructor(props) {
    super(props);
    const allProjects = _.chain(md.global.Account.projects)
      .map(p => p.projectId)
      .unshift('');
    let foldedProjects;
    const storedFoldedProjectsStr = window.localStorage.getItem(
      'foldedProjects_' + md.global.Account.accountId + '_kc',
    );

    if (storedFoldedProjectsStr) {
      foldedProjects = Immutable.Set(storedFoldedProjectsStr.split(','));
    } else if (storedFoldedProjectsStr === '') {
      foldedProjects = Immutable.Set();
    } else {
      foldedProjects = Immutable.Set(allProjects.value());
    }

    let loadingProjects = Immutable.Set(allProjects.reject(projectId => foldedProjects.includes(projectId)).value());
    let noneProjects = false;

    if (!md.global.Account.projects.length) {
      foldedProjects = Immutable.Set([]);
      loadingProjects = Immutable.Set(['']);
      noneProjects = true;
    }

    this.state = {
      keywords: props.keywords || '',
      projectRootKeywords: {},
      noneProjects,
      foldedProjects,
      loadingProjects,
      searchName: '',
      roots: Immutable.List(),
      selectOptions: false,
      folderSetting: '',
      settingsOption: '',
      upgradeOffset: null,
      upgradeHint: false,
      filterType: ROOT_FILTER_TYPE.ALL,
      isHover: false,
      isClick: false,
    };
    this.searchNodes = this.searchNodes.bind(this);
  }
  componentDidMount() {
    const { getUsage } = this.props;
    getUsage();
    this._isMounted = true;
    service
      .getRoots({
        accountId: md.global.Account.accountId,
        excludeProjectIds: this.state.foldedProjects.toArray(),
      })
      .then(roots => {
        this.setState({
          roots: Immutable.List(roots),
          loadingProjects: Immutable.Set(),
        });
      });
    if (location.search) {
      const urlSearch = decodeURIComponent(location.search);
      const queryStr = urlSearch.split('?')[1];
      const query = qs.parse(queryStr);

      if (query.set) {
        this.handleEditRoot(query.set);
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(
      shallowEqual(nextProps, this.props) &&
      shallowEqual(nextProps.usage, this.props.usage) &&
      shallowEqual(nextState, this.state) &&
      nextState.roots === this.state.roots
    );
  }
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.keywords !== this.state.keywords) {
        this.setState({
          keywords: this.props.keywords,
        });
      }
    }

    safeLocalStorageSetItem(
      'foldedProjects_' + md.global.Account.accountId + '_kc',
      this.state.foldedProjects.join(','),
    );
    this.updateSearchName();
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  getType = () => {
    const { path } = this.props;
    return getRootByPath(path).type;
  };

  checkRootIsActive = id => {
    const { path } = this.props;

    if (!path) {
      return false;
    }

    const math = path.match(/[a-z0-9]{24}/);
    const rootId = math && math[0];
    return id === rootId;
  };

  fetchRootsByProjectId = (projectId, openProject) => {
    if (!this.state.loadingProjects.includes(projectId)) {
      const loadingProjects = this.state.loadingProjects.add(projectId);
      let foldedProjects = this.state.foldedProjects;

      if (openProject) {
        foldedProjects = foldedProjects.delete(projectId);
      }

      this.setState({ loadingProjects, foldedProjects });
    }

    const query = { accountId: md.global.Account.accountId };

    if (projectId) {
      query.projectId = projectId;
    } else {
      query.excludeProjectIds = _.chain(md.global.Account.projects)
        .map(p => p.projectId)
        .unshift('')
        .reject(ex => ex === projectId)
        .value();
    }

    return service.getRoots(query).then(roots => {
      let newRoots = this.state.roots;

      if (projectId) {
        newRoots = newRoots.filter(root => !root.project || root.project.projectId !== projectId).concat(roots);
      } else {
        newRoots = newRoots
          .filter(root => root.project)
          .filter(existRoot => !_.some(roots, root => root.id === existRoot.id))
          .concat(roots);
      }

      this.setState(
        {
          roots: newRoots,
          loadingProjects: this.state.loadingProjects.delete(projectId),
        },
        this.updateSearchName,
      );
    });
  };

  filterRoots = filterType => {
    if (filterType === this.state.filterType && filterType !== ROOT_FILTER_TYPE.ALL) {
      return;
    }

    this.setState({ loading: true }, () => {
      if (filterType === ROOT_FILTER_TYPE.ALL) {
        service
          .getRoots({ accountId: md.global.Account.accountId })
          .then(roots => this.setState({ filterType, roots: Immutable.Set(roots), loading: false }));
      } else {
        this.setState({ filterType, loading: false });
      }
    });
  };

  /** 回车搜索 */
  searchNodes = evt => {
    const { baseUrl, path } = this.props;

    if (evt.keyCode === 13) {
      navigateTo(encodeURI(`${baseUrl}/${path}?q=${evt.target.value}`));
      evt.preventDefault();
      evt.stopPropagation();
    }
  };

  clearSearch = () => {
    const { baseUrl, path } = this.props;
    navigateTo(encodeURI(`${baseUrl}/${path}`));
  };

  /** 获取搜索框 placeholder 文案*/
  updateSearchName = () => {
    const { currentFolder, currentRoot } = this.props;
    const rootType = this.getType();
    let directoryName = '';

    switch (rootType) {
      case PICK_TYPE.MY:
        directoryName = currentFolder && !_.isEmpty(currentFolder) ? currentFolder.name : _l('我的文件');
        break;
      case PICK_TYPE.RECENT:
        directoryName = _l('最近使用');
        break;
      case PICK_TYPE.STARED:
        directoryName = _l('星标文件');
        break;
      default:
        directoryName = currentFolder && !_.isEmpty(currentFolder) ? currentFolder.name : currentRoot.name;
        break;
    }

    this.setState({
      searchName: directoryName
        ? _l('在“%0”中搜索', directoryName.length < 10 ? directoryName : directoryName.substr(0, 9) + '..')
        : _l('在知识中心中搜索'),
    });
  };

  handleAddNewRoot = () => {
    addNewRoot(root => {
      if (this._isMounted) {
        this.setState({
          roots: this.state.roots.unshift(root),
          settingsOption: '',
          folderSetting: '',
        });
        navigateTo('/apps/kc/' + root.id);
      }
    });
  };

  handleEditRoot = rootId => {
    this.setState({ settingsOption: null, folderSetting: null });
    editRoot(
      rootId,
      root => {
        if (!root) {
          const roots = this.state.roots;

          if (this._isMounted) {
            this.setState(
              {
                roots: roots.remove(roots.findIndex(r => r.id === rootId)),
              },
              this.returnAllFolder,
            );
          }

          navigateTo('/apps/kc/my');
          alert(_l('退出成功'));
        } else {
          alert(_l('编辑成功'));
          this.performUpdateItem(root);
        }
      },
      root => {
        if (root) {
          this.performUpdateItem(root);
        }
      },
    );
  };

  handleRemoveRoot = (item, isCreator, isPermanent) => {
    this.setState({ settingsOption: null });
    removeRoot(item, isCreator, isPermanent, rootId => {
      const roots = this.state.roots;
      this.setState(
        {
          roots: roots.remove(roots.findIndex(root => root.id === rootId)),
        },
        this.returnAllFolder,
      );
      navigateTo('/apps/kc/my');
    });
  };

  handleStarRoot = rootItem => {
    this.setState({ settingsOption: null });
    service.updateRootStar(rootItem.id, !rootItem.isStared).then(result => {
      if (result) {
        this.setState({
          isStared: !rootItem.isStared,
          settingsOption: '',
          folderSetting: '',
        });
        rootItem.isStared = !rootItem.isStared;
        rootItem.staredTime = rootItem.isStared ? moment().format() : null;
        this.performUpdateItem(rootItem);
      }
    });
  };

  getRootSettingItems = root => {
    const isCreator = _.some(
      root.members,
      member => member.permission === 1 && member.accountId === md.global.Account.accountId,
    );

    return [
      {
        key: 'star',
        icon: <Icon icon="task-star" />,
        label: root.isStared ? _l('取消标星') : _l('标星'),
        onClick: () => this.handleStarRoot(root),
      },
      {
        key: 'share',
        icon: <Icon icon="group" />,
        label: _l('共享设置'),
        onClick: () => this.handleEditRoot(root.id),
      },
      {
        key: 'log',
        icon: <Icon icon="knowledge-log" />,
        label: _l('文件夹日志'),
        onClick: () => {
          getRootLog(root.name, root.id);
          this.setState({ settingsOption: '', isClick: false });
        },
      },
      {
        key: 'recycle',
        icon: <Icon icon="knowledge-recycle" />,
        label: _l('回收站'),
        onClick: () => {
          navigateTo('/apps/kc/recycled/' + root.id);
          this.setState({ settingsOption: '' });
        },
      },
      {
        key: 'remove',
        icon: <Icon icon={isCreator ? 'trash' : 'groupExit'} />,
        danger: true,
        label: isCreator ? _l('删除文件夹') : _l('退出文件夹'),
        onClick: () => this.handleRemoveRoot(root, isCreator, false),
      },
    ];
  };

  getMyFolderSettingItems = () => [
    {
      key: 'log',
      icon: <Icon icon="knowledge-log" />,
      label: _l('文件夹日志'),
      onClick: () => {
        getRootLog(_l('我的文件'), PICK_TYPE.MY);
        this.setState({ settingsOption: '', isClick: false });
      },
    },
    {
      key: 'recycle',
      icon: <Icon icon="knowledge-recycle" />,
      label: _l('回收站'),
      onClick: () => {
        navigateTo('/apps/kc/recycled/my');
        this.setState({ isClick: false, isHover: false });
      },
    },
  ];

  getRootFilterItems = () => [
    { key: ROOT_FILTER_TYPE.ALL, label: _l('全部共享文件夹') },
    { key: ROOT_FILTER_TYPE.OWN, label: _l('我拥有的') },
    { key: ROOT_FILTER_TYPE.JOIN, label: _l('我加入的') },
  ];

  getProjectRootItems = (projectRoots, isFolded) => {
    if (!projectRoots.length) {
      return this.state.noneProjects
        ? [
            {
              key: 'addRoot',
              className: 'nullData textSecondary',
              disabled: true,
              label: (
                <span>
                  {_l('点击 " + " 号，创建共享文件夹')}
                  <i className="icon-restart arrow textTertiary" />
                </span>
              ),
            },
          ]
        : [];
    }

    return _.map(projectRoots, root => {
      const isActive = this.checkRootIsActive(root.id);

      return {
        key: root.id,
        icon: <Icon icon={isActive ? 'folder-open' : 'task-folder-solid'} className="Font16 textTertiary" />,
        className: cx('folderItem ani500 fadeIn', {
          bgColorPrimaryTransparent: isActive,
          folded: isFolded,
        }),
        'data-rootid': root.id,
        label: (
          <span>
            <span className="folderListName ellipsis textPrimary">{root.name}</span>
            {(this.state.folderSetting === root.id || this.state.settingsOption === root.id) && (
              <Dropdown
                trigger={['click']}
                open={this.state.settingsOption === root.id}
                placement="bottomLeft"
                menu={{ items: this.getRootSettingItems(root), onClick: stopMenuPropagation }}
                onOpenChange={open => this.setState({ settingsOption: open ? root.id : '' })}
              >
                <span
                  className="folderSetting icon-settings textTertiary hoverTextSecondary"
                  onClick={event => event.stopPropagation()}
                />
              </Dropdown>
            )}
            {root.isStared && this.state.settingsOption !== root.id && this.state.folderSetting !== root.id ? (
              <span className="isStared icon-task-star" />
            ) : undefined}
          </span>
        ),
        onClick: () => navigateTo(`/apps/kc/${root.id}`),
        onMouseEnter: () => this.setState({ folderSetting: root.id }),
        onMouseLeave: () => this.setState({ folderSetting: '' }),
      };
    });
  };

  getTypeMenuItems = () => {
    const type = this.getType();

    return [
      {
        key: 'my',
        icon: <Icon icon="attachment" className="textSecondary hoverColorPrimary" />,
        className: cx('myFileNav', { bgColorPrimaryTransparent: type === PICK_TYPE.MY }),
        label: (
          <>
            <span className="textPrimary Font13">{_l('我的文件')}</span>
            {(this.state.isHover || this.state.isClick) && (
              <Dropdown
                trigger={['click']}
                open={this.state.isClick}
                placement="bottomLeft"
                menu={{ items: this.getMyFolderSettingItems(), onClick: stopMenuPropagation }}
                onOpenChange={isClick => this.setState({ isClick })}
              >
                <span
                  className="myFolderSetting icon-settings textTertiary hoverTextSecondary"
                  onClick={event => event.stopPropagation()}
                />
              </Dropdown>
            )}
          </>
        ),
        onClick: () => navigateTo('/apps/kc/my'),
        onMouseEnter: () => this.setState({ isHover: true }),
        onMouseLeave: () => this.setState({ isHover: false }),
      },
      {
        key: 'recent',
        icon: <Icon icon="access_time" className="textSecondary hoverColorPrimary" />,
        className: cx({ bgColorPrimaryTransparent: type === PICK_TYPE.RECENT }),
        label: <span className="textPrimary Font13">{_l('最近使用')}</span>,
        onClick: () => navigateTo('/apps/kc/recent'),
      },
      {
        key: 'stared',
        icon: <Icon icon="task-star" className="textSecondary hoverColorPrimary" />,
        className: cx({ bgColorPrimaryTransparent: type === PICK_TYPE.STARED }),
        label: <span className="textPrimary Font13">{_l('星标文件')}</span>,
        onClick: () => navigateTo('/apps/kc/stared'),
      },
    ];
  };

  /** 对 rootList 的修改应用到页面上 */
  performUpdateItem = root => {
    const roots = this.state.roots;
    this.setState({
      roots: roots.update(
        roots.findIndex(i => i.id === root.id),
        () => _.clone(root),
      ),
    });
  };

  /* 流量详情*/
  usageDialog = usage => {
    const percent = (usage.used / usage.total) * 100;

    Modal.confirm({
      width: 410,
      className: 'kcDialogBox',
      title: _l('使用详情'),
      styles: { body: { overflow: 'hidden' } },
      content: (
        <div class="usageList">
          <span>
            {_l('本月上传流量已用')}
            <Tooltip
              title={
                <span>
                  {_l(
                    '在各模块上传文件时，会计入每月上传量。免费用户上传流量为300M/月，付费版用户10G/月，多个组织可叠加。',
                  )}
                </span>
              }
              placement="bottom"
            >
              <i class="icon-help colorPrimaryLight"></i>
            </Tooltip>
          </span>
          <span class="usageSize">
            {`${humanFileSize(usage.used)} (${(percent > 100 ? 100 : percent).toFixed(2)}%)/${humanFileSize(usage.total)}`}
          </span>
        </div>
      ),
      footer: null,
    });
  };

  toggleFoldProject = projectId => {
    if (this.state.foldedProjects.includes(projectId)) {
      this.fetchRootsByProjectId(projectId, true);
    } else {
      const foldedProjects = this.state.foldedProjects.add(projectId);
      this.setState({ foldedProjects });
    }
  };

  renderProjectRoots = (projectId, index, filterRoots) => {
    projectId = projectId || '';
    const { projectRootKeywords = {} } = this.state;
    const isFolded = this.state.foldedProjects.includes(projectId);
    const isLoading = this.state.loadingProjects.includes(projectId);
    const project = _.find(md.global.Account.projects, p => p.projectId === projectId);
    const keywords = projectRootKeywords[projectId || 'my'];
    let projectRoots;

    if (projectId) {
      projectRoots = filterRoots.filter(root => ((root.project && root.project.projectId) || '') === projectId);
    } else {
      const projectIds = _.map(md.global.Account.projects, p => p.projectId);
      projectRoots = filterRoots.filter(
        root => projectIds.indexOf((root.project && root.project.projectId) || '') === -1,
      );
    }

    if (keywords) {
      projectRoots = projectRoots.filter(root => root.name.toLowerCase().indexOf(keywords.toLowerCase()) > -1);
    }

    projectRoots = projectRoots
      .toArray()
      .filter(p => p.isStared)
      .concat(projectRoots.toArray().filter(p => !p.isStared));
    const companyNameComp = (
      <div
        className={cx('folderProjectTitle textPrimary', {
          folded: isFolded,
          isLoading,
          hide: this.state.noneProjects,
        })}
        onClick={() => this.toggleFoldProject(projectId)}
      >
        <span
          className={project && project.licenseType === 0 ? 'contentName textTertiary' : 'contentName textSecondary'}
          title={project ? project.companyName : _l('个人')}
        >
          <span className="companyName ellipsis">{project ? project.companyName : _l('个人')}</span>
          {project && project.licenseType === 0 && _l('（到期）')}
        </span>
        {isLoading ? (
          <span className="clipLoader textTertiary" />
        ) : (
          <span className="slide textTertiary">
            {(isFolded ? _l('展开') : isLoading) || (projectRoots.length ? _l('隐藏') : _l('无'))}
          </span>
        )}
      </div>
    );
    const rootListComp =
      !isFolded &&
      (this.state.loadingProjects.includes(projectId) ? undefined : (
        <NavMenu
          className={cx('folderListOfProject', {
            noneProjects: this.state.noneProjects,
            expire: project && project.licenseType === 0,
          })}
          items={this.getProjectRootItems(projectRoots, isFolded)}
        />
      ));
    return (
      <div className="folderProjectItem" key={projectId}>
        {companyNameComp}
        {!isFolded && (projectRoots.length > 10 || keywords) && (
          <Input
            className="rootSearch"
            radius
            variant="filled"
            prefix={<i className="icon-search" />}
            placeholder={_l('搜索文件夹名称')}
            value={keywords}
            onChange={event => {
              this.setState({
                projectRootKeywords: {
                  ...projectRootKeywords,
                  [projectId || 'my']: event.target.value.trim(),
                },
              });
            }}
          />
        )}
        {!isFolded && keywords && !projectRoots.length && (
          <div className="textTertiary TxtCenter mTop20 mBottom10">{_l('没有搜索结果')}</div>
        )}
        {rootListComp}
      </div>
    );
  };

  render() {
    const { searchName, keywords } = this.state;

    let filterRoots;
    let selectName;

    switch (this.state.filterType) {
      case ROOT_FILTER_TYPE.ALL:
        filterRoots = this.state.roots;
        selectName = _l('全部共享文件夹');
        break;
      case ROOT_FILTER_TYPE.JOIN:
        filterRoots = this.state.roots.filter(root => root.permission !== ROOT_PERMISSION_TYPE.OWNER);
        selectName = _l('我加入的');
        break;
      case ROOT_FILTER_TYPE.OWN:
        filterRoots = this.state.roots.filter(root => root.permission === ROOT_PERMISSION_TYPE.OWNER);
        selectName = _l('我拥有的');
        break;
      default:
        break;
    }

    return (
      <div className="kcLeft">
        <div className="leftNavHairGlass bgTertiary Fixed" />
        <MDLeftNav className="yunFileNav bgPrimary snowFixedContainer">
          <div className="flexColumn">
            <div className="fileMenuTop">
              <Input
                allowClear
                variant="underlined"
                id="smartSearchFile"
                value={keywords}
                prefix={<i className="icon-search textSecondary" title={_l('搜索')} />}
                placeholder={searchName}
                style={SEARCH_INPUT_STYLE}
                onKeyDown={this.searchNodes}
                onClear={this.clearSearch}
                onChange={evt => this.setState({ keywords: evt.target.value })}
              />
              <NavMenu className="typeList" items={this.getTypeMenuItems()} />
            </div>
            <Divider className="fileHr" />
            <div className="folderHeader">
              <Dropdown
                trigger={['click']}
                open={this.state.selectOptions}
                placement="bottomLeft"
                menu={{
                  items: this.getRootFilterItems(),
                  style: { minWidth: 116 },
                  onClick: ({ key, domEvent }) => {
                    domEvent.stopPropagation();
                    this.setState({ selectOptions: false });
                    this.filterRoots(Number(key));
                  },
                }}
                onOpenChange={selectOptions => this.setState({ selectOptions })}
              >
                <span className="folderCheckedType left">
                  <span className="selectOptions textTertiary">{selectName}</span>
                  <i className="icon-arrow-down font10 iconArrowDown textSecondary" />
                </span>
              </Dropdown>
              <span className="addNewFolder right">
                <span className="textSecondary hoverTextPrimary" onClick={this.handleAddNewRoot}>
                  +
                </span>
              </span>
            </div>
            <div className="folderList flex minHeight0">
              <ScrollView
                onScrollEnd={() => {
                  this.setState({ settingsOption: '' });
                }}
              >
                {_.chain(md.global.Account.projects)
                  .filter(ele => ele.licenseType !== 0)
                  .concat(md.global.Account.projects.filter(ele => ele.licenseType === 0))
                  .map(p => p.projectId)
                  .push('')
                  .map((projectId, i) => this.renderProjectRoots(projectId, i, filterRoots))
                  .value()}
              </ScrollView>
            </div>
          </div>
        </MDLeftNav>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  usage: state.kc.kcUsage,
  keywords: state.kc.params.get('keywords'),
  currentRoot: state.kc.currentRoot,
  currentFolder: state.kc.currentFolder,
  baseUrl: state.kc.baseUrl,
});

const mapDispatchToProps = dispatch => ({
  getUsage: bindActionCreators(kcActions.updateKcUsage, dispatch),
  searchNodes: bindActionCreators(kcActions.searchNodes, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(KcLeft);

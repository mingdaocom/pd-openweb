import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import Immutable from 'immutable';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { Dialog, Icon, Input, Item, List, Menu, MenuItem, ScrollView, Splitter } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import service from '../../api/service';
import MDLeftNav from 'src/pages/feed/components/common/mdLeftNav';
import { navigateTo } from 'src/router/navigateTo';
import { PICK_TYPE, ROOT_FILTER_TYPE, ROOT_PERMISSION_TYPE } from '../../constant/enum';
import * as kcActions from '../../redux/actions/kcAction';
import { getRootByPath, humanFileSize, shallowEqual } from '../../utils';
import { addNewRoot, editRoot, removeRoot } from './rootHandler';
import { getRootLog } from './rootLog';
import './KcLeft.less';

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
      offset: Immutable.Map({}),
      upgradeOffset: null,
      upgradeHint: false,
      filterType: ROOT_FILTER_TYPE.ALL,
      isCreator: false,
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.keywords !== this.state.keywords) {
      this.setState({
        keywords: nextProps.keywords,
      });
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
  componentDidUpdate() {
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

  handleSelectFile = () => {
    this.setState({ selectOptions: !this.state.selectOptions });
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
        : '在知识中心中搜索',
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

  handleRootSettings = (rootItem, event) => {
    let creator = false;
    const $target = $(event.target);
    if (rootItem) {
      for (let i = 0; i < rootItem.members.length; i++) {
        const member = rootItem.members[i];
        if (member.permission === 1) {
          if (member.accountId === md.global.Account.accountId) {
            creator = true;
            break;
          }
        }
      }
    }

    this.setState(
      {
        settingsOption: rootItem.id,
        offset: this.state.offset.merge($target.offset()),
        isCreator: creator,
      },
      () => {
        if ($target.offset().top + 20 + $target.find('.settingsLayer').height() > $(window).height()) {
          const offset = this.state.offset;
          const newOffset = offset.set('top', $target.offset().top - 20 - $target.find('.settingsLayer').height());
          this.setState({ offset: newOffset });
        }
      },
    );
    event.stopPropagation();
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

    Dialog.confirm({
      width: 410,
      className: 'kcDialogBox',
      title: _l('使用详情'),
      children: (
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
              <i class="icon-help ThemeColor4"></i>
            </Tooltip>
          </span>
          <span class="usageSize">
            {`${humanFileSize(usage.used)} (${(percent > 100 ? 100 : percent).toFixed(2)}%)/${humanFileSize(
              usage.total,
            )}`}
          </span>
        </div>
      ),
      noFooter: true,
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
        className={cx('folderProjectTitle ThemeColor10', {
          folded: isFolded,
          isLoading,
          hide: this.state.noneProjects,
        })}
        onClick={() => this.toggleFoldProject(projectId)}
      >
        <span
          className={project && project.licenseType === 0 ? 'contentName ThemeColor8' : 'contentName ThemeColor9'}
          title={project ? project.companyName : _l('个人')}
        >
          <span className="companyName ellipsis">{project ? project.companyName : _l('个人')}</span>
          {project && project.licenseType === 0 && _l('（到期）')}
        </span>
        {isLoading ? (
          <span className="clipLoader ThemeColor8" />
        ) : (
          <span className="slide ThemeColor8">
            {(isFolded ? _l('展开') : isLoading) || (projectRoots.length ? _l('隐藏') : _l('无'))}
          </span>
        )}
      </div>
    );
    const rootListComp =
      !isFolded &&
      (this.state.loadingProjects.includes(projectId) ? undefined : (
        <List
          className={cx('folderListOfProject', {
            noneProjects: this.state.noneProjects,
            expire: project && project.licenseType === 0,
          })}
        >
          {!projectRoots.length
            ? this.state.noneProjects && (
                <li className="nullData ThemeColor9">
                  <span>
                    {_l('点击 " + " 号，创建共享文件夹')}
                    <i className="icon-restart arrow ThemeColor8" />
                  </span>
                </li>
              )
            : _.map(projectRoots, root => (
                <Item
                  key={root.id}
                  className={cx('folderItem ani500 fadeIn ThemeHoverBGColor7', {
                    ThemeBGColor8: this.checkRootIsActive(root.id),
                    folded: isFolded,
                  })}
                  onClick={() => {
                    navigateTo(`/apps/kc/${root.id}`);
                  }}
                  data-rootid={root.id}
                  onMouseEnter={() => {
                    this.setState({ folderSetting: root.id }); /* this.props.setHoveredItem(root, PICK_TYPE.ROOT);*/
                  }}
                  onMouseLeave={() => {
                    this.setState({ folderSetting: '' }); /* this.props.setHoveredItem(null, null);*/
                  }}
                >
                  <span
                    className={cx(
                      'ThemeColor8 folderListIcon',
                      this.checkRootIsActive(root.id) ? 'icon-folder-open' : 'icon-task-folder-solid',
                    )}
                  />
                  <span>
                    <span className="folderListName ellipsis ThemeColor10">{root.name}</span>
                    {(this.state.folderSetting === root.id || this.state.settingsOption === root.id) && (
                      <span
                        className="folderSetting icon-settings ThemeColor8 ThemeHoverColor9"
                        onClick={event => this.handleRootSettings(root, event)}
                      >
                        {this.state.settingsOption === root.id ? (
                          <Menu
                            className={cx('settingsLayer')}
                            onClickAway={() => {
                              this.setState({ settingsOption: '' });
                            }}
                            onClick={evt => evt.stopPropagation()}
                            style={{ left: this.state.offset.get('left') - 16, top: this.state.offset.get('top') + 24 }}
                          >
                            <MenuItem
                              icon={<Icon icon="task-star" />}
                              className="settingItem ThemeHoverColor3"
                              onClick={() => this.handleStarRoot(root)}
                            >
                              {root.isStared ? _l('取消标星') : _l('标星')}
                            </MenuItem>
                            <MenuItem
                              icon={<Icon icon="group" />}
                              className="settingItem ThemeHoverColor3"
                              onClick={() => this.handleEditRoot(root.id)}
                            >
                              {_l('共享设置')}
                            </MenuItem>
                            <MenuItem
                              icon={<Icon icon="knowledge-log" />}
                              className="settingItem ThemeHoverColor3"
                              onClick={() => {
                                getRootLog(root.name, root.id);
                                this.setState({ settingsOption: '', isClick: false });
                              }}
                            >
                              {_l('文件夹日志')}
                            </MenuItem>
                            <MenuItem
                              icon={<Icon icon="knowledge-recycle" />}
                              className="settingItem ThemeHoverColor3"
                              onClick={() => {
                                navigateTo('/apps/kc/recycled/' + root.id);
                                this.setState({ settingsOption: '' });
                              }}
                            >
                              {_l('回收站')}
                            </MenuItem>
                            <MenuItem
                              icon={<Icon icon={cx(this.state.isCreator ? 'trash' : 'groupExit')} />}
                              className="settingItem ThemeHoverColor3"
                              onClick={() => this.handleRemoveRoot(root, this.state.isCreator, false)}
                            >
                              {this.state.isCreator ? _l('删除文件夹') : _l('退出文件夹')}
                            </MenuItem>
                          </Menu>
                        ) : undefined}
                      </span>
                    )}
                    {root.isStared && this.state.settingsOption !== root.id && this.state.folderSetting !== root.id ? (
                      <span className="isStared icon-task-star" />
                    ) : undefined}
                  </span>
                </Item>
              ))}
        </List>
      ));
    return (
      <div className="folderProjectItem" key={projectId}>
        {companyNameComp}
        {!isFolded && (projectRoots.length > 10 || keywords) && (
          <div className="rootSearch">
            <i className="icon-search" />
            <Input
              placeholder={_l('搜索文件夹名称')}
              value={keywords}
              onChange={value => {
                this.setState({
                  projectRootKeywords: {
                    ...projectRootKeywords,
                    [projectId || 'my']: value.trim(),
                  },
                });
              }}
            />
          </div>
        )}
        {!isFolded && keywords && !projectRoots.length && (
          <div className="Gray_9e TxtCenter mTop20 mBottom10">{_l('没有搜索结果')}</div>
        )}
        {rootListComp}
      </div>
    );
  };

  render() {
    const { searchName, keywords } = this.state;

    const selectOptions = this.state.selectOptions && (
      <Menu className="optionsLayer" onClickAway={() => this.setState({ selectOptions: false })}>
        <MenuItem
          className="allFolder ellipsis ThemeHoverColor3"
          onClick={() => this.filterRoots(ROOT_FILTER_TYPE.ALL)}
        >
          {_l('全部共享文件夹')}
        </MenuItem>
        <MenuItem className="myCreateRoot ThemeHoverColor3" onClick={() => this.filterRoots(ROOT_FILTER_TYPE.OWN)}>
          {_l('我拥有的')}
        </MenuItem>
        <MenuItem className="myAddFolder ThemeHoverColor3" onClick={() => this.filterRoots(ROOT_FILTER_TYPE.JOIN)}>
          {_l('我加入的')}
        </MenuItem>
      </Menu>
    );

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
        <div className="leftNavHairGlass ThemeBG Fixed" />
        <MDLeftNav className="yunFileNav ThemeBGColor9 snowFixedContainer">
          <div className="flexColumn">
            <div className="fileMenuTop">
              <div
                className={cx(
                  'fileSearch Relative boderRadAll_5',
                  this.state.focusSearch ? 'ThemeBorderColor3' : 'ThemeBorderColor8',
                )}
              >
                <span className="icon-search btnFileSearch ThemeColor9" title={_l('搜索')} />
                <input
                  type="text"
                  id="smartSearchFile"
                  className="fileSearchBox boxSizing ThemeColor9"
                  value={keywords}
                  placeholder={searchName}
                  onKeyDown={this.searchNodes}
                  onChange={evt => this.setState({ keywords: evt.target.value })}
                  onFocus={() => this.setState({ focusSearch: true })}
                  onBlur={() => this.setState({ focusSearch: false })}
                />
              </div>
              <List className="typeList">
                <Item
                  icon={<Icon icon="attachment" className="ThemeColor9 ThemeHoverColor3 LineHeight40" />}
                  onClick={() => navigateTo('/apps/kc/my')}
                  className={cx('ThemeHoverBGColor7 myFileNav', { ThemeBGColor8: this.getType() === PICK_TYPE.MY })}
                  onMouseOver={() => this.setState({ isHover: true })}
                  onMouseLeave={() => this.setState({ isHover: false })}
                >
                  <span className="ThemeColor10 Font13">{_l('我的文件')}</span>
                  {this.state.isHover || this.state.isClick ? (
                    <span
                      className="myFolderSetting icon-settings ThemeColor8 ThemeHoverColor9"
                      onClick={evt => {
                        this.setState({ isClick: true });
                        evt.stopPropagation();
                      }}
                    >
                      {this.state.isClick ? (
                        <Menu
                          className="settingsLayer"
                          onClickAway={() => this.setState({ isClick: false })}
                          onClick={evt => evt.stopPropagation()}
                        >
                          <MenuItem
                            icon={<Icon icon="knowledge-log" />}
                            className="settingItem ThemeHoverColor3"
                            onClick={() => {
                              getRootLog(_l('我的文件'), PICK_TYPE.MY);
                              this.setState({ settingsOption: '', isClick: false });
                            }}
                          >
                            {_l('文件夹日志')}
                          </MenuItem>
                          <MenuItem
                            icon={<Icon icon="knowledge-recycle" />}
                            className="settingItem ThemeHoverColor3"
                            onClick={() => {
                              navigateTo('/apps/kc/recycled/my');
                              this.setState({ isClick: false, isHover: false });
                            }}
                          >
                            {_l('回收站')}
                          </MenuItem>
                        </Menu>
                      ) : (
                        ''
                      )}
                    </span>
                  ) : (
                    ''
                  )}
                </Item>
                <Item
                  icon={<Icon icon="access_time" className="ThemeColor9 ThemeHoverColor3 LineHeight40" />}
                  onClick={() => navigateTo('/apps/kc/recent')}
                  className={cx('ThemeHoverBGColor7', { ThemeBGColor8: this.getType() === PICK_TYPE.RECENT })}
                >
                  <span className="ThemeColor10 Font13">{_l('最近使用')}</span>
                </Item>
                <Item
                  icon={<Icon icon="task-star" className="ThemeColor9 ThemeHoverColor3 LineHeight40" />}
                  onClick={() => navigateTo('/apps/kc/stared')}
                  className={cx('ThemeHoverBGColor7', { ThemeBGColor8: this.getType() === PICK_TYPE.STARED })}
                >
                  <span className="ThemeColor10 Font13">{_l('星标文件')}</span>
                </Item>
              </List>
            </div>
            <Splitter className="fileHr ThemeBorderColor7" />
            <div className="folderHeader">
              <span className="folderCheckedType left" onClick={this.handleSelectFile}>
                <span className="selectOptions ThemeColor8">{selectName}</span>
                <i className="icon-arrow-down font10 iconArrowDown ThemeColor9" />
                {selectOptions}
              </span>
              <span className="addNewFolder right">
                <span className="ThemeColor9 ThemeHoverColor10" onClick={this.handleAddNewRoot}>
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

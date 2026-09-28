import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import Immutable from 'immutable';
import _ from 'lodash';
import PropTypes from 'prop-types';
import shallowEqual from 'shallowequal';
import { Icon, ScrollView } from 'ming-ui';
import { Menu as AntdMenu, Divider, Tooltip } from 'ming-ui/antd-components';
import groupController from 'src/api/group';
import createGroup from 'src/pages/Group/createGroup/load';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import postEnum from '../../constants/postEnum';
import { searchAll } from '../../redux/postActions';
import MDLeftNav from '../common/mdLeftNav';
import MDLeftNavSearch from '../common/mdLeftNav/mdLeftNavSearch';
import './feedLeftNav.css';

const NAV_MENU_STYLES = {
  root: { border: 0 },
  item: {
    '--hap-menu-item-height': '40px',
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    width: '100%',
    borderRadius: 0,
  },
  itemIcon: { fontSize: 16, textAlign: 'center' },
  itemContent: { flex: 1, minWidth: 0, marginLeft: 15 },
};

const NavMenu = ({ className, items }) => (
  <AntdMenu selectable={false} mode="vertical" className={className} styles={NAV_MENU_STYLES} items={items} />
);

NavMenu.propTypes = {
  className: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
};

class FeedLeftNav extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    hasNew: PropTypes.bool,
    defaultGroups: PropTypes.array,
    options: PropTypes.shape({
      listType: PropTypes.string,
      projectId: PropTypes.string,
      groupId: PropTypes.string,
      accountId: PropTypes.string,
    }),
  };

  constructor(props) {
    super(props);
    const allProjects = _.chain(md.global.Account.projects)
      .map(p => p.projectId)
      .push('');
    let foldedProjects;
    const storedFoldedProjectsStr = localStorage.getItem('foldedProjects_' + md.global.Account.accountId + '_feed');

    if (storedFoldedProjectsStr) {
      foldedProjects = Immutable.Set(
        _.union(
          storedFoldedProjectsStr.split(','),
          md.global.Account.projects.filter(project => project.licenseType === 0).map(project => project.projectId),
        ),
      );
    } else if (storedFoldedProjectsStr === '') {
      foldedProjects = Immutable.Set();
    } else {
      foldedProjects = Immutable.Set(allProjects.value());
    }

    const noneProjects = !(_.get(md.global, 'Account.projects') || []).length;
    let loadingProjects, groups;

    if (props.defaultGroups) {
      loadingProjects = Immutable.Set();
      groups = Immutable.List(props.defaultGroups);
    } else {
      loadingProjects = Immutable.Set(allProjects.reject(projectId => foldedProjects.includes(projectId)).value());
      if (noneProjects) {
        foldedProjects = Immutable.Set([]);
        loadingProjects = Immutable.Set(['']);
      }

      groups = Immutable.List();
    }

    this.state = {
      noneProjects,
      foldedProjects,
      loadingProjects,
      groups,
    };
  }

  componentDidMount() {
    const foldedProjects = this.state.foldedProjects.toArray();
    if (
      foldedProjects.indexOf('') > -1 &&
      md.global.Account.projects.map(ele => ele.projectId).every(project => foldedProjects.indexOf(project) > -1)
    )
      return;

    if (this.props.defaultGroups && this.props.defaultGroups.size) return;
    groupController
      .getGroupsNameAndIsVerified({
        excludeProjectIds: this.state.foldedProjects.size ? this.state.foldedProjects.join(',') : undefined,
      })
      .then(result => {
        this.setState({
          groups: Immutable.List(result.list),
          loadingProjects: Immutable.Set(),
        });
      });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(nextState, this.state) || !shallowEqual(nextProps, this.props);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.options.keywords !== this.state.searchAllKeywords) {
        this.setState({
          searchAllKeywords: null,
        });
      }
    }

    if (!this.locatedDefaultGroup && $('.avatarList .Item.bgColorPrimaryTransparent').length) {
      $('.groupListContainer .scroll-viewport').scrollTop(
        $('.avatarList .Item.bgColorPrimaryTransparent').position().top,
      );
      this.locatedDefaultGroup = true;
    }

    const key = 'foldedProjects_' + md.global.Account.accountId + '_feed';
    safeLocalStorageSetItem(key, this.state.foldedProjects.join(','));
  }

  getCreateGroupIcon = projectId => {
    return (
      <Tooltip title={_l('创建群组')}>
        <div
          className="right panelIcon Hand textSecondary hoverTextPrimary"
          onClick={e => this.createGroup(e, projectId)}
        >
          +
        </div>
      </Tooltip>
    );
  };

  fetchGroupsByProjectId = (projectId, openProject) => {
    if (!this.state.loadingProjects.includes(projectId)) {
      const loadingProjects = this.state.loadingProjects.add(projectId);
      let foldedProjects = this.state.foldedProjects;

      if (openProject) {
        foldedProjects = foldedProjects.delete(projectId);
      }

      this.setState({ loadingProjects, foldedProjects });
    }

    const query = {};

    if (projectId) {
      query.projectId = projectId;
    } else {
      query.excludeProjectIds = _.chain(md.global.Account.projects)
        .map(p => p.projectId)
        .push('')
        .reject(ex => ex === projectId)
        .value()
        .join(',');
    }

    return groupController.getGroupsNameAndIsVerified(query).then(result => {
      const groups = result.list;
      this.setState({
        groups: this.state.groups
          .filter(existGroup => !_.some(groups, group => group.groupId === existGroup.groupId))
          .concat(groups),
        loadingProjects: this.state.loadingProjects.delete(projectId),
      });
    });
  };

  createGroup = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    createGroup({
      projectId,
      callback(group) {
        window.location.href = pathCompletion(`/feed?groupId=${group.groupId}`);
      },
    });
  };

  toggleFoldProject = projectId => {
    if (this.state.foldedProjects.includes(projectId)) {
      this.fetchGroupsByProjectId(projectId, true);
    } else {
      const foldedProjects = this.state.foldedProjects.add(projectId);
      this.setState({ foldedProjects });
    }
  };

  renderProjectGroups = projectId => {
    projectId = projectId || '';
    const isFolded = this.state.foldedProjects.includes(projectId);
    const isLoading = this.state.loadingProjects.includes(projectId);
    const project = _.find(md.global.Account.projects, p => p.projectId === projectId);
    let projectGroups;

    if (projectId) {
      projectGroups = this.state.groups.filter(group => group.projectId === projectId);
    } else {
      const projectIds = _.map(md.global.Account.projects, p => p.projectId);
      projectGroups = this.state.groups.filter(group => projectIds.indexOf(group.projectId || '') === -1);
    }

    projectGroups = projectGroups.toArray();
    const companyNameComp = (
      <div
        className={cx('folderProjectTitle textPrimary hoverBgTertiary', {
          isLoading,
          folded: isFolded,
          hide: this.state.noneProjects,
          bgColorPrimaryTransparent:
            this.props.options.projectId === projectId &&
            !this.props.options.groupId &&
            this.props.options.listType === postEnum.LIST_TYPE.project,
        })}
        onClick={() => navigateTo(`/feed?projectId=${projectId}`)}
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
          <span
            className="textTertiary slide"
            onClick={evt => {
              evt.stopPropagation();
              this.toggleFoldProject(projectId);
            }}
          >
            {' '}
            {isFolded ? _l('展开') : isLoading || projectGroups.length || projectId === '' ? _l('隐藏') : _l('无')}
          </span>
        )}
      </div>
    );
    const groupMenuItems =
      !projectGroups.length && projectId === '' && !md.global.Account.projects.length
        ? [
            {
              key: 'addGroup',
              className: 'nullData textSecondary',
              disabled: true,
              label: (
                <span>
                  {_l('点击 " + " 号，创建新群组')}
                  <i className="icon-restart arrow textTertiary" />
                </span>
              ),
            },
          ]
        : _.chain(projectGroups)
            .map(g => ({
              key: g.groupId,
              icon: (
                <img
                  className="avatar"
                  src={
                    g.avatar.includes('?') > 0
                      ? g.avatar.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/48/h/48/q/100')
                      : `${g.avatar}?imageView2/1/w/48/h/48/q/100`
                  }
                  placeholder={g.avatar}
                />
              ),
              extra: g.isVerified ? <Icon icon="official-group" title={_l('官方群组')} /> : undefined,
              className: cx({
                bgColorPrimaryTransparent: !!this.props.options.groupId && this.props.options.groupId === g.groupId,
                folded: isFolded,
              }),
              onClick: () => navigateTo(`/feed?groupId=${g.groupId}&projectId=${projectId}`),
              label: g.name,
              title: g.name,
            }))
            .concat(
              projectId
                ? []
                : [
                    {
                      key: 'myself',
                      onClick: () => navigateTo(`/feed?listType=${postEnum.LIST_TYPE.myself}`),
                      className: cx({
                        bgColorPrimaryTransparent:
                          this.props.options.listType === postEnum.LIST_TYPE.myself &&
                          this.props.options.projectId === projectId,
                        folded: isFolded,
                      }),
                      label: _l('我自己'),
                    },
                  ],
            )
            .value();
    const groupListComp =
      !isFolded &&
      (isLoading ? undefined : (
        <NavMenu
          className={cx('avatarList', {
            expire: project && project.licenseType === 0,
          })}
          items={groupMenuItems}
        />
      ));
    return (
      <div className="folderProjectItem" key={projectId}>
        {companyNameComp}
        {groupListComp}
      </div>
    );
  };

  render() {
    const fixedMenuItems = [
      {
        key: 'all',
        icon: <Icon icon="mingdao" />,
        onClick: () => navigateTo('/feed'),
        className: cx({
          bgColorPrimaryTransparent:
            !this.props.options.groupId &&
            !this.props.options.projectId &&
            this.props.options.projectId !== '' &&
            this.props.options.listType === postEnum.LIST_TYPE.project,
        }),
        label: (
          <span className="itemContent textPrimary">
            {_l('全部动态')}
            {this.props.hasNew && (
              <span
                title={_l('有新的动态更新')}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '100%',
                  background: 'red',
                  position: 'absolute',
                  top: 17,
                  right: 20,
                }}
              />
            )}
          </span>
        ),
      },
      {
        key: 'mine',
        icon: <Icon icon="charger" />,
        onClick: () => navigateTo(`/feed?listType=${postEnum.LIST_TYPE.user}&accountId=${md.global.Account.accountId}`),
        className: cx({
          bgColorPrimaryTransparent:
            (this.props.options.listType === postEnum.LIST_TYPE.user ||
              this.props.options.listType === postEnum.LIST_TYPE.ireply) &&
            this.props.options.accountId === md.global.Account.accountId,
        }),
        label: <span className="itemContent textPrimary">{_l('我的动态')}</span>,
      },
      {
        key: 'fav',
        icon: <Icon icon="task-star" />,
        className: cx({
          bgColorPrimaryTransparent: this.props.options.listType === postEnum.LIST_TYPE.fav,
        }),
        onClick: () => navigateTo(`/feed?listType=${postEnum.LIST_TYPE.fav}`),
        label: <span className="textPrimary">{_l('星标动态')}</span>,
      },
    ];

    return (
      <MDLeftNav className="feedLeftNav bgPrimary">
        <MDLeftNavSearch
          value={this.state.searchAllKeywords}
          onChange={evt => {
            this.setState({ searchAllKeywords: evt.target.value });
          }}
          onSearch={keywords => {
            this.props.dispatch(searchAll(keywords));
          }}
        />
        <NavMenu className="iconList feedFixedList" items={fixedMenuItems} />
        <Divider className="Splitter" />
        <div className="clearfix panelHead">
          <div className="left panelTitle textTertiary">{_l('群组')}</div>
          {this.getCreateGroupIcon()}
        </div>
        <ScrollView className="groupListContainer flex" disableParentScroll>
          {_.chain(md.global.Account.projects)
            .map(p => p.projectId)
            .push('')
            .map((projectId, i) => this.renderProjectGroups(projectId, i))
            .value()}
        </ScrollView>
      </MDLeftNav>
    );
  }
}

export default connect(state => {
  const { options } = state.post;
  return { options };
})(FeedLeftNav);

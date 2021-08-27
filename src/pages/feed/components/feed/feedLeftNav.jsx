import React from 'react';
import _ from 'lodash';
import cx from 'classnames';
import PropTypes from 'prop-types';
import shallowEqual from 'shallowequal';
import Immutable from 'immutable';
import MDLeftNav from '../common/mdLeftNav';
import MDLeftNavSearch from '../common/mdLeftNav/mdLeftNavSearch';
import { QiniuImg } from '../common/img';
import List from 'ming-ui/components/List';
import Item from 'ming-ui/components/Item';
import Icon from 'ming-ui/components/Icon';
import Splitter from 'ming-ui/components/Splitter';
import ScrollView from 'ming-ui/components/ScrollView';
import postEnum from '../../constants/postEnum';
import groupController from 'src/api/group'; // TODO 放入 store
import { connect } from 'react-redux';
import { searchAll } from '../../redux/postActions';
import { navigateTo } from 'src/router/navigateTo';
import './feedLeftNav.css';

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
    const allProjects = _(md.global.Account.projects)
      .map(p => p.projectId)
      .push('');
    let foldedProjects;
    const storedFoldedProjectsStr = localStorage.getItem('foldedProjects_' + md.global.Account.accountId + '_feed');
    if (storedFoldedProjectsStr) {
      foldedProjects = Immutable.Set(
        _.union(storedFoldedProjectsStr.split(','), md.global.Account.projects.filter(project => project.licenseType === 0).map(project => project.projectId))
      );
    } else if (storedFoldedProjectsStr === '') {
      foldedProjects = Immutable.Set();
    } else {
      foldedProjects = Immutable.Set(allProjects.value());
    }

    const noneProjects = !md.global.Account.projects.length;
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
    if (foldedProjects.indexOf('') > -1 && md.global.Account.projects.map(ele => ele.projectId).every(project => foldedProjects.indexOf(project) > -1)) return;

    if (this.props.defaultGroups && this.props.defaultGroups.size) return;
    groupController
      .getGroupsNameAndIsVerified({
        excludeProjectIds: this.state.foldedProjects.size ? this.state.foldedProjects.join(',') : undefined,
      })
      .then((result) => {
        this.setState({
          groups: Immutable.List(result.list),
          loadingProjects: Immutable.Set(),
        });
      });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.options.keywords !== this.state.searchAllKeywords) {
      this.setState({ searchAllKeywords: null });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(nextState, this.state) || !shallowEqual(nextProps, this.props);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.locatedDefaultGroup && $('.avatarList .Item.ThemeBGColor8').length) {
      $('.groupListContainer .nano-content').scrollTop($('.avatarList .Item.ThemeBGColor8').position().top);
      this.locatedDefaultGroup = true;
    }
    const key = 'foldedProjects_' + md.global.Account.accountId + '_feed';
    localStorage.setItem(key, this.state.foldedProjects.join(','));
  }

  getCreateGroupIcon = (projectId) => {
    return (
      <div className="right panelIcon Hand ThemeColor9 ThemeHoverColor10" onClick={e => this.createGroup(e, projectId)}>
        +
      </div>
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
      query.excludeProjectIds = _(md.global.Account.projects)
        .map(p => p.projectId)
        .push('')
        .reject(ex => ex === projectId)
        .value()
        .join(',');
    }
    return groupController.getGroupsNameAndIsVerified(query).then((result) => {
      const groups = result.list;
      this.setState({
        groups: this.state.groups.filter(existGroup => !_.some(groups, group => group.groupId === existGroup.groupId)).concat(groups),
        loadingProjects: this.state.loadingProjects.delete(projectId),
      });
    });
  };

  createGroup = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    require(['src/components/group/create/creatGroup'], (CreatGroup) => {
      CreatGroup.createInit({
        projectId,
        callback(group) {
          window.location.href = `/feed?groupId=${group.groupId}`;
        },
      });
    });
  };

  toggleFoldProject = (projectId) => {
    if (this.state.foldedProjects.includes(projectId)) {
      this.fetchGroupsByProjectId(projectId, true);
    } else {
      const foldedProjects = this.state.foldedProjects.add(projectId);
      this.setState({ foldedProjects });
    }
  };

  renderProjectGroups = (projectId, index) => {
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
        className={cx('folderProjectTitle ThemeColor10 ThemeHoverBGColor7', {
          isLoading,
          folded: isFolded,
          hide: this.state.noneProjects,
          ThemeBGColor8:
            this.props.options.projectId === projectId && !this.props.options.groupId && this.props.options.listType === postEnum.LIST_TYPE.project,
        })}
        onClick={() => navigateTo(`/feed?projectId=${projectId}`)}
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
          <span
            className="ThemeColor8 slide"
            onClick={(evt) => {
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
    const groupListComp =
      !isFolded &&
      (isLoading ? (
        undefined
      ) : (
        <List
          className={cx('avatarList', {
            expire: project && project.licenseType === 0,
          })}
        >
          {!projectGroups.length && projectId === '' && !md.global.Account.projects.length ? (
            <li key="addGroup" className="nullData ThemeColor9">
              <span>
                {_l('点击 " + " 号，创建新群组')}
                <i className="icon-restart arrow ThemeColor8" />
              </span>
            </li>
          ) : (
            _(projectGroups)
              .map(g => (
                <Item
                  iconAtEnd={g.isVerified}
                  key={g.groupId}
                  className={cx({
                    ThemeHoverBGColor7: true,
                    ThemeBGColor8: !!this.props.options.groupId && this.props.options.groupId === g.groupId,
                    folded: isFolded,
                  })}
                  onClick={() => navigateTo(`/feed?groupId=${g.groupId}&projectId=${projectId}`)}
                >
                  <QiniuImg className="avatar" src={g.avatar} lazy size={48} quality={100} placeholder={g.avatar} />
                  <span className="ThemeColor10" title={g.name}>
                    {g.name}
                  </span>
                  {g.isVerified && <Icon className="LineHeight40" icon="official-group" title={_l('官方群组')} />}
                </Item>
              ))
              .concat(
                projectId
                  ? []
                  : [
                    <Item
                        key="myself"
                        onClick={() => navigateTo(`/feed?listType=${postEnum.LIST_TYPE.myself}`)}
                        className={cx({
                          ThemeHoverBGColor7: true,
                          ThemeBGColor8: this.props.options.listType === postEnum.LIST_TYPE.myself && this.props.options.projectId === projectId,
                          folded: isFolded,
                        })}
                      >
                      <span className="ThemeColor10">{_l('我自己')}</span>
                    </Item>,
                    ]
              )
              .value()
          )}
        </List>
      ));
    return (
      <div className="folderProjectItem" key={projectId}>
        {companyNameComp}
        {groupListComp}
      </div>
    );
  };

  render() {
    return (
      <MDLeftNav className="feedLeftNav ThemeBGColor9">
        <MDLeftNavSearch
          value={this.state.searchAllKeywords}
          onChange={(evt) => {
            this.setState({ searchAllKeywords: evt.target.value });
          }}
          onSearch={(keywords) => {
            this.props.dispatch(searchAll(keywords));
          }}
        />
          <List className="iconList feedFixedList">
            <Item
            icon={<Icon icon="mingdao LineHeight40" />}
            onClick={() => navigateTo('/feed')}
            className={cx('LineHeight40', {
              ThemeBGColor8:
                !this.props.options.groupId &&
                !this.props.options.projectId &&
                this.props.options.projectId !== '' &&
                this.props.options.listType === postEnum.LIST_TYPE.project,
            })}
          >
            <span className="itemContent ThemeColor10">
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
            </Item>
              <Item
            icon={<Icon icon="charger LineHeight40" />}
            onClick={() => navigateTo(`/feed?listType=${postEnum.LIST_TYPE.user}&accountId=${md.global.Account.accountId}`)}
            className={cx('LineHeight40', {
              ThemeBGColor8:
                (this.props.options.listType === postEnum.LIST_TYPE.user || this.props.options.listType === postEnum.LIST_TYPE.ireply) &&
                this.props.options.accountId === md.global.Account.accountId,
            })}
          >
            <span className="itemContent ThemeColor10">{_l('我的动态')}</span>
              </Item>
                <Item
            icon={<Icon icon="task-star LineHeight40" />}
            className={cx('LineHeight40', {
              ThemeBGColor8: this.props.options.listType === postEnum.LIST_TYPE.fav,
            })}
            onClick={() => navigateTo(`/feed?listType=${postEnum.LIST_TYPE.fav}`)}
          >
            <span className="ThemeColor10">{_l('星标动态')}</span>
                </Item>
          </List>
            <Splitter className="ThemeBorderColor7" />
              <div className="clearfix panelHead">
                <div className="left panelTitle ThemeColor8">{_l('群组')}</div>
                  <div className="right panelIcon Hand ThemeColor9 ThemeHoverColor10" onClick={e => this.createGroup(e)}>
            +
          </div>
              </div>
                <ScrollView className="groupListContainer flex" disableParentScroll>
                  {_(md.global.Account.projects)
            .map(p => p.projectId)
            .push('')
            .map((projectId, i) => this.renderProjectGroups(projectId, i))
            .value()}
                </ScrollView>
      </MDLeftNav>
    );
  }
}

module.exports = connect((state) => {
  const { options } = state.post;
  return { options };
})(FeedLeftNav);

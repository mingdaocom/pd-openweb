import React, { Component } from 'react';
import { connect } from 'react-redux';
import ajaxRequest from 'src/api/taskCenter';
import { errorMessage, setStateToStorage } from '../../utils/utils';
import config from '../../config/config';
import {
  updateStateConfig,
  updateTaskStatus,
  updateFolderRange,
  updateKeyWords,
  updateCompleteTime,
  updateListSort,
  updateNetwork,
  updateTaskAscription,
  updateTaskTags,
  updateCustomFilter,
  updateChargeIds,
} from '../../redux/actions';
import cx from 'classnames';
import moment from 'moment';
import Dropdown from 'ming-ui/components/Dropdown';
import MultipleDropdown from 'ming-ui/components/MultipleDropdown';
import ScrollView from 'ming-ui/components/ScrollView';
import Checkbox from 'ming-ui/components/Checkbox';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAwayable = createDecoratedComponent(withClickAway);

class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openAllCharges: false,
      getTagsComplete: false,
      overNotStarted: 0,
      expiredUnfinished: 0,
      tags: [], // 标签列表
      customs: [], // 自定义列表
      members: [], // 负责人列表
    };
  }

  componentWillMount() {
    const { folderId, filterUserId, taskFilter, projectId } = this.props.taskConfig;

    // 获取标签
    if (taskFilter !== 8) {
      ajaxRequest
        .getTags({
          folderId,
          projectId: 'all',
          fromType: !folderId ? 0 : folderId === 1 ? 2 : 1,
          other: !!filterUserId,
        })
        .then((result) => {
          if (result.status) {
            if (result.data.length) {
              result.data.push({ tagID: 'null', tagName: _l('未关联标签') });
              this.setState({ tags: result.data });
            }
          } else {
            errorMessage(result.error);
          }
          this.setState({ getTagsComplete: true });
        });
    }

    if (folderId && folderId !== 1) {
      ajaxRequest.getTaskOptionsInFolder({ folderId }).then((result) => {
        if (result.status) {
          this.setState({ customs: result.data });
        } else {
          errorMessage(result.error);
        }
      });

      ajaxRequest.getFolderTaskCharges({ folderId }).then((result) => {
        if (result.status) {
          this.setState({ members: result.data });
        } else {
          errorMessage(result.error);
        }
      });
    }

    // 获取计数
    this.getTwoTypeTaskCount();
    this.mounted = true;

    $('#taskList .listStage').css('paddingRight', 270);
  }

  componentDidMount() {
    if (this.props.taskConfig.searchKeyWords) {
      this.search.value = this.props.taskConfig.searchKeyWords;
    }

    // tips
    $('.taskFilterBox').on('mouseover', '.filterMemberItem img', function () {
      const $this = $(this);
      const text = $this.parent().attr('data-tips');

      if ($this.data('bindtip') || !text) {
        return;
      }

      $this.MD_UI_Tooltip({
        text,
        arrowLeft: 0,
        offsetLeft: 0,
        offsetTop: -65,
        location: 'up',
        checkWidth: true,
        width: 200,
      });
      $this.data('bindtip', true).mouseenter();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.taskConfig.searchKeyWords) {
      this.search.value = '';
    }

    if (nextProps.taskConfig.lastMyProjectId !== this.props.taskConfig.lastMyProjectId) {
      // 重新获取计数
      this.getTwoTypeTaskCount();
    }
  }

  componentWillUnmount() {
    $('#taskList .listStage').css('paddingRight', 0);
    this.mounted = false;
  }

  /**
   * 获取逾期延期的任务的计数
   */
  getTwoTypeTaskCount() {
    const { taskFilter, folderId, projectId, lastMyProjectId } = this.props.taskConfig;

    ajaxRequest
      .getTwoTypeTaskCount({
        folderId: folderId !== 1 ? folderId : '',
        projectId: folderId ? projectId : lastMyProjectId,
        fromType: !folderId ? 0 : folderId === 1 ? 2 : 1,
        isStar: taskFilter === 8,
      })
      .then((result) => {
        if (result.status) {
          if (this.mounted) {
            this.setState({
              overNotStarted: result.data.overNotStarted,
              expiredUnfinished: result.data.expiredUnfinished,
            });
          }
        } else {
          errorMessage(result.error);
        }
      });
  }

  /**
   * render babel
   */
  renderLabel(text, clearOptionsFun, tips = '') {
    return (
      <div className="filterLabel relative">
        {text}
        {tips ? (
          <span data-tip={tips} className="mLeft5 Font14">
            <i className="icon-help" />
          </span>
        ) : (
          undefined
        )}
        {clearOptionsFun ? (
          <span className="ThemeColor3 filterClear pointer" onClick={clearOptionsFun}>
            {_l('清除条件')}
          </span>
        ) : (
          undefined
        )}
      </div>
    );
  }

  /**
   * render 网络列表
   */
  renderNetworkList() {
    const { lastMyProjectId, filterUserId } = this.props.taskConfig;
    const data = md.global.Account.projects.map((item) => {
      return {
        text: item.companyName,
        value: item.projectId,
      };
    });

    data.unshift({ text: _l('全部组织'), value: 'all' });
    data.push({ text: _l('个人'), value: '' });

    return (
      <div className="mTop10">
        <Dropdown data={data} value={lastMyProjectId} onChange={this.switchNetwork} disabled={!!filterUserId} />
      </div>
    );
  }

  /**
   * 切换网络
   */
  switchNetwork = (lastMyProjectId) => {
    const { taskFilter } = this.props.taskConfig;

    setStateToStorage(taskFilter, Object.assign({}, this.props.taskConfig, { lastMyProjectId }));
    this.props.dispatch(updateNetwork(lastMyProjectId));
  };

  /**
   * 项目下的搜索范围
   */
  switchFolderRange(folderSearchRange) {
    this.props.dispatch(updateFolderRange(folderSearchRange));
  }

  /**
   * 更新项目搜索内容
   */
  updateKeyWords(value) {
    if (!value && this.search.value) {
      this.search.value = '';
    }
    this.props.dispatch(updateKeyWords(value));
  }

  /**
   * 切换任务状态
   */
  switchTaskStatus = (listStatus) => {
    let { listSort, folderId, taskFilter, filterUserId } = this.props.taskConfig;

    // 非进行中且现在排序是优先级 或 截止日期
    if (listStatus !== 0 && (listSort === 0 || listSort === 2)) {
      listSort = 10;
    }

    // 进行中且现在排序是完成日期
    if (listStatus === 0 && listSort === 8) {
      listSort = 10;
    }

    if (!filterUserId) {
      setStateToStorage(folderId ? '' : taskFilter, Object.assign({}, this.props.taskConfig, { listStatus, listSort }));
    }

    this.props.dispatch(updateTaskStatus(listStatus, listSort));
  };

  /**
   * 已完成列表
   */
  renderCompleteList() {
    const { completeTime } = this.props.taskConfig;
    const data = [
      { text: _l('所有已完成任务'), value: '' },
      { text: _l('查看近期完成任务'), disabled: true },
      { text: _l('今天'), value: moment().format('YYYY-MM-DD') },
      {
        text: _l('昨天'),
        value: moment()
          .add(-1, 'd')
          .format('YYYY-MM-DD'),
      },
      {
        text: _l('一周'),
        value: moment()
          .add(-7, 'd')
          .format('YYYY-MM-DD'),
      },
      {
        text: _l('一个月'),
        value: moment()
          .add(-30, 'd')
          .format('YYYY-MM-DD'),
      },
    ];

    return (
      <div className="mTop10">
        <Dropdown data={data} value={completeTime} onChange={this.switchCompleteTime} />
      </div>
    );
  }

  /**
   * 切换完成时间
   */
  switchCompleteTime = (completeTime) => {
    const { folderId, taskFilter, filterUserId } = this.props.taskConfig;

    if (!filterUserId) {
      setStateToStorage(folderId ? '' : taskFilter, Object.assign({}, this.props.taskConfig, { completeTime }));
    }

    this.props.dispatch(updateCompleteTime(completeTime));
  };

  /**
   * 任务排序
   */
  renderListSort() {
    const { listSort, folderId, listStatus, filterUserId } = this.props.taskConfig;
    const data = [
      { text: _l('优先级'), value: 0 },
      { text: _l('最近更新'), value: 10 },
      { text: _l('结束时间'), value: 2 },
      { text: _l('完成时间'), value: 8 },
      { text: _l('创建时间'), value: 3 },
      { text: _l('负责人'), value: 5 },
      { text: _l('项目'), value: 4 },
      { text: _l('名称A-Z'), value: 1 },
    ];

    // 项目 无按项目排序 无优先级
    if (folderId) {
      _.remove(data, item => item.value === 4 || item.value === 0);
    }

    // 进行中 无按完成日期排序
    if (listStatus === 0) {
      _.remove(data, item => item.value === 8);
    } else if (listStatus === 2 || listStatus === 3 || listStatus === 4 || listStatus === 5) {
      _.remove(data, item => item.value === 0 || item.value === 8);
    } else {
      _.remove(data, item => item.value === 0 || item.value === 2);
    }

    // 查看他人的时候无优先级
    if (filterUserId) {
      _.remove(data, item => item.value === 0);
    }

    return (
      <div className="mTop10">
        <Dropdown data={data} value={listSort} renderValue={`${_l('按%0排序', '{{value}}')}`} onChange={this.switchListSort} />
      </div>
    );
  }

  /**
   * 切换任务排序
   */
  switchListSort = (listSort) => {
    const { folderId, taskFilter, filterUserId } = this.props.taskConfig;

    if (!filterUserId) {
      setStateToStorage(folderId ? '' : taskFilter, Object.assign({}, this.props.taskConfig, { listSort }));
    }

    this.props.dispatch(updateListSort(listSort));
  };

  /**
   * 任务归属
   */
  renderTaskAscription(item, i) {
    const { taskFilter } = this.props.taskConfig;
    return (
      <span
        key={i}
        className={cx('filterTaskSolidBtn', { ThemeBGColor3: taskFilter === item.taskFilter })}
        onClick={() => this.switchTaskAscription(item.taskFilter)}
      >
        {item.value}
      </span>
    );
  }

  /**
   * 切换任务归属
   */
  switchTaskAscription = (taskFilter) => {
    setStateToStorage(taskFilter, Object.assign({}, this.props.taskConfig, { taskFilter }));
    this.props.dispatch(updateTaskAscription(taskFilter));
  };

  /**
   * render 负责人
   */
  renderCharges() {
    const { members, openAllCharges } = this.state;

    if (members.length) {
      return (
        <div className="mTop10">
          {members.slice(0, openAllCharges ? members.length : 12).map((item, i) => this.renderChargeItem(item, i))}
          {openAllCharges && (
            <div className="mTop10">
              <span className="pointer ThemeColor3" onClick={() => this.setState({ openAllCharges: false })}>
                {_l('收起')}
              </span>
            </div>
          )}
        </div>
      );
    }

    return <div className="mTop10">{_l('无')}</div>;
  }

  /**
   * 单个负责人
   */
  renderChargeItem(item, i) {
    const { members, openAllCharges } = this.state;
    const { filterSettings } = this.props.taskConfig;
    const isMoreBtn = !openAllCharges && i === 11;
    const onClickFun = () => {
      if (isMoreBtn) {
        this.setState({ openAllCharges: true });
      } else {
        this.selectCharges(item.accountID);
      }
    };

    return (
      <span
        key={item.accountID}
        data-tips={isMoreBtn ? '' : item.fullName}
        className={cx('filterMemberItem relative', { ThemeBorderColor3: _.includes(filterSettings.selectChargeIds, item.accountID) })}
        onClick={onClickFun}
      >
        <img src={item.avatar} />
        {isMoreBtn && <span className="filterMemberItemMore">+{members.length - 12 > 99 ? 99 : members.length - 12}</span>}
      </span>
    );
  }

  /**
   * 选择负责人
   */
  selectCharges(accountId) {
    const { filterSettings } = this.props.taskConfig;
    const selectChargeIds = _.cloneDeep(filterSettings.selectChargeIds);

    if (_.includes(selectChargeIds, accountId)) {
      _.remove(selectChargeIds, id => id === accountId);
    } else {
      selectChargeIds.push(accountId);
    }

    this.props.dispatch(updateChargeIds(selectChargeIds));
  }

  /**
   * 清除全部负责人
   */
  clearAllCharges = () => {
    this.props.dispatch(updateChargeIds([]));
  };

  /**
   * render 标签
   */
  renderTags() {
    const { getTagsComplete, tags } = this.state;
    const { filterSettings } = this.props.taskConfig;
    const label = filterSettings.tags.length ? _l('已选择%0个标签', filterSettings.tags.length) : _l('请选择标签');
    const options = tags.map((tag) => {
      return {
        label: this.getTagsIcons(tag.tagName, tag.color),
        value: tag.tagID,
      };
    });

    if (tags.length) {
      return (
        <div className="mTop10">
          <MultipleDropdown
            value={filterSettings.tags}
            options={options}
            multipleSelect
            label={label}
            multipleLevel={false}
            multipleHideDropdownNav
            onChange={this.switchTags}
          />
          <div className="mTop10">
            {filterSettings.tags.map(tagId =>
              tags.map((item) => {
                if (item.tagID === tagId) {
                  return (
                    <span key={tagId} className="filterOptions">
                      <span className="filterOptionsBtn ThemeBorderColor3">
                        {item.color && <span className="tagCircle" style={{ background: item.color }} />}
                        {item.tagName}
                      </span>
                      <span className="filterOptionsDel ThemeBGColor3" onClick={() => this.clearTags(tagId)}>
                        <i className="icon-close" />
                      </span>
                    </span>
                  );
                }
                return undefined;
              })
            )}
          </div>
        </div>
      );
    }

    if (getTagsComplete) {
      return <div className="mTop10">{_l('无')}</div>;
    }

    return undefined;
  }

  /**
   * tags color icon
   */
  getTagsIcons(tagName, color) {
    return (
      <span>
        {color && <span className="tagCircle" style={{ background: color }} />}
        <span className="Font13">{tagName}</span>
      </span>
    );
  }

  /**
   * 切换标签
   */
  switchTags = (evt, ids) => {
    this.props.dispatch(updateTaskTags(ids));
  };

  /**
   * 清除标签
   */
  clearTags = (id) => {
    const tags = _.cloneDeep(this.props.taskConfig.filterSettings.tags);
    _.remove(tags, tagId => tagId === id);
    this.props.dispatch(updateTaskTags(tags));
  };

  /**
   * 清除所有标签
   */
  clearAllTags = () => {
    this.props.dispatch(updateTaskTags([]));
  };

  /**
   * render 自定义字段
   */
  renderCustoms(item, i) {
    const { filterSettings } = this.props.taskConfig;
    const customs = filterSettings.customFilter[item.controlId] || [];
    const label = customs.length ? _l('已选择%0项', customs.length) : _l('按%0筛选', item.controlName);
    const options = item.options.map((option) => {
      return {
        label: option.value,
        value: option.key,
      };
    });

    return (
      <div key={i}>
        {this.renderLabel(item.controlName, customs.length > 0 ? () => this.clearAllCustoms(item.controlId) : false)}
        <div className="mTop10">
          <MultipleDropdown
            value={customs}
            options={options}
            multipleSelect
            label={label}
            multipleLevel={false}
            multipleHideDropdownNav
            onChange={(evt, keys) => this.switchCustoms(item.controlId, keys)}
          />
          <div className="mTop10">
            {customs.map((key, i) =>
              options.map((option) => {
                if (option.value === key) {
                  return (
                    <span key={i + option.value} className="filterOptions">
                      <span className="filterOptionsBtn ThemeBorderColor3">{option.label}</span>
                      <span className="filterOptionsDel ThemeBGColor3" onClick={() => this.clearCustoms(item.controlId, option.value)}>
                        <i className="icon-close" />
                      </span>
                    </span>
                  );
                }
                return undefined;
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
   * 自定义字段
   */
  switchCustoms = (controlId, keys) => {
    const customFilter = _.cloneDeep(this.props.taskConfig.filterSettings.customFilter);

    if (keys.length) {
      customFilter[controlId] = keys;
    } else {
      delete customFilter[controlId];
    }

    this.props.dispatch(updateCustomFilter(customFilter));
  };

  /**
   * 清除自定义选中项
   */
  clearCustoms = (controlId, key) => {
    const customFilter = _.cloneDeep(this.props.taskConfig.filterSettings.customFilter);

    _.remove(customFilter[controlId], item => item === key);

    // 清空
    if (!customFilter[controlId].length) {
      delete customFilter[controlId];
    }

    this.props.dispatch(updateCustomFilter(customFilter));
  };

  /**
   * 清除自定义字段
   */
  clearAllCustoms = (controlId) => {
    const customFilter = _.cloneDeep(this.props.taskConfig.filterSettings.customFilter);
    delete customFilter[controlId];
    this.props.dispatch(updateCustomFilter(customFilter));
  };

  /**
   * 恢复筛选状态到默认值
   */
  reset = () => {
    const { folderId, taskFilter, filterUserId } = this.props.taskConfig;
    const newTaskFilter = !filterUserId && (taskFilter === 6 || taskFilter === 1 || taskFilter === 2 || taskFilter === 3) ? 6 : taskFilter;
    const newTaskConfig = Object.assign({}, this.props.taskConfig, config.clearFilterSettings, {
      lastMyProjectId: 'all',
      listStatus: 0,
      completeTime: '',
      taskFilter: newTaskFilter,
      listSort: 10,
    });

    if (!filterUserId) {
      setStateToStorage(newTaskConfig.taskFilter, newTaskConfig);
    }

    this.props.dispatch(updateStateConfig(newTaskConfig));
  };

  /**
   * 点击隐藏
   */
  clickAway = () => {
    this.props.taskFilterLeave();
  };

  render() {
    const { searchKeyWords, folderId, filterSettings, listStatus, taskFilter, filterUserId } = this.props.taskConfig;
    const { folderSearchRange } = filterSettings;
    const { tags, members, customs, overNotStarted, expiredUnfinished } = this.state;
    const taskAscription = [
      { value: _l('我负责'), taskFilter: 2 },
      { value: _l('我参与'), taskFilter: 1 },
      { value: _l('我托付'), taskFilter: 3 },
      { value: _l('全部'), taskFilter: 6 },
    ];

    return (
      <ClickAwayable className="taskFilterBox" onClickAwayExceptions={[$('.taskFilterBtn')]} onClickAway={this.clickAway}>
        <div className="filterHead relative flexRow">
          <span className={cx('Font16', { Hidden: this.props.showReset })}>{_l('筛选与排序')}</span>
          <span
            className={cx('filterHeadReset pointer Font13 ThemeColor3 ThemeBorderColor3 ThemeHoverColor2 ThemeHoverBorderColor2', {
              Hidden: !this.props.showReset,
            })}
            onClick={this.reset}
          >
            {_l('重置选择')}
          </span>
          <div className="flex" />
          <i className="icon-delete Font20 ThemeColor3 pointer" onClick={this.props.taskFilterLeave} />
        </div>
        <ScrollView className="flex">
          <div className="filterContent">
            {!folderId && this.renderNetworkList()}

            <div className={cx('relative mTop5', { Hidden: !folderId })}>
              <i className="icon-search filterSearchIcon" />
              <input
                ref={(search) => {
                  this.search = search;
                }}
                type="text"
                placeholder={_l('搜索任务')}
                className="filterSearch boderRadAll_5 ThemeBorderColor3"
                onBlur={evt => this.updateKeyWords(evt.currentTarget.value)}
                onKeyDown={evt => evt.keyCode === 13 && this.updateKeyWords(evt.currentTarget.value)}
              />
              {searchKeyWords && <i className="icon-closeelement-bg-circle filterSearchClear ThemeColor8" onClick={() => this.updateKeyWords('')} />}
            </div>

            {folderId && folderId !== 1 ? (
              <div className="filterFolderSearch">
                <Checkbox checked={folderSearchRange === 7} onClick={checked => this.switchFolderRange(checked ? 6 : 7)}>
                  {_l('仅看与我有关的任务')}
                </Checkbox>
              </div>
            ) : (
              undefined
            )}

            {this.renderLabel(_l('状态'))}
            <div className="mTop10">
              <div className="flexRow">
                <div className={cx('taskDelayAndOverdue flexColumn taskDelay', { active: listStatus === 4 })} onClick={() => this.switchTaskStatus(4)}>
                  <div className="Font20">{overNotStarted}</div>
                  <div>{_l('延期未开始')}</div>
                </div>
                <div className="flex" />
                <div className={cx('taskDelayAndOverdue flexColumn taskOverdue', { active: listStatus === 5 })} onClick={() => this.switchTaskStatus(5)}>
                  <div className="Font20">{expiredUnfinished}</div>
                  <div>{_l('逾期未完成')}</div>
                </div>
              </div>
              <div className="flexRow">
                <div className={cx('taskStatusNoComplete', { ThemeBGColor3: listStatus === 0 })} onClick={() => this.switchTaskStatus(0)}>
                  {_l('未完成任务')}
                </div>
                <div className="flex" />
                <div className={cx('taskStatusAll', { ThemeBGColor3: listStatus === -1 })} onClick={() => this.switchTaskStatus(-1)}>
                  {_l('所有任务')}
                </div>
              </div>
              <div className="flexRow taskStatusBtns">
                <div
                  className={cx('taskStatusBtn', { active: listStatus === -1 || listStatus === 0 }, { 'ThemeBGColor3 ThemeBorderColor3': listStatus === 2 })}
                  onClick={() => this.switchTaskStatus(2)}
                >
                  {_l('未开始')}
                </div>
                <div className={cx('flex taskStatusLine', { active: listStatus === -1 || listStatus === 0 })} />
                <div
                  className={cx('taskStatusBtn', { active: listStatus === -1 || listStatus === 0 }, { 'ThemeBGColor3 ThemeBorderColor3': listStatus === 3 })}
                  onClick={() => this.switchTaskStatus(3)}
                >
                  {_l('进行中')}
                </div>
                <div className={cx('flex taskStatusLine', { active: listStatus === -1 })} />
                <div
                  className={cx('taskStatusBtn', { active: listStatus === -1 }, { 'ThemeBGColor3 ThemeBorderColor3': listStatus === 1 })}
                  onClick={() => this.switchTaskStatus(1)}
                >
                  {_l('已完成')}
                </div>
              </div>
            </div>
            {listStatus === 1 && this.renderCompleteList()}

            {taskFilter !== 8 && this.renderLabel(_l('排序'))}
            {taskFilter !== 8 && this.renderListSort()}

            {!folderId && taskFilter !== 8 && !filterUserId && this.renderLabel(_l('相关性'))}
            {!folderId &&
              taskFilter !== 8 &&
              !filterUserId && <div className="mTop10">{taskAscription.map((item, i) => this.renderTaskAscription(item, i))}</div>}

            <div className="filterLine" />

            {folderId && folderId !== 1 && this.renderLabel(_l('按任务负责人筛选'), filterSettings.selectChargeIds.length > 0 ? this.clearAllCharges : false)}
            {folderId && folderId !== 1 && this.renderCharges()}

            {taskFilter !== 8 &&
              this.renderLabel(
                _l('按标签筛选'),
                filterSettings.tags.length > 0 ? this.clearAllTags : false,
                _l('你可以为任务添加标签属性，通过标签筛选出任务')
              )}
            {taskFilter !== 8 && this.renderTags()}

            {customs.map((item, i) => this.renderCustoms(item, i))}
          </div>
        </ScrollView>
      </ClickAwayable>
    );
  }
}

export default connect(state => state.task)(Filter);

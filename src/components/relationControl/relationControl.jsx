import PropTypes from 'prop-types';
import React, { Component } from 'react';
import DialogBase from 'ming-ui/components/Dialog/DialogBase';
import './less/relationControl.less';
import cx from 'classnames';
import UserHead from 'src/pages/feed/components/userHead';
import ajaxRequest from 'src/api/form';
import 'src/components/createTask/createTask';
import 'src/components/createCalendar/createCalendar';
import LoadDiv from 'ming-ui/components/LoadDiv';
import DatePicker from 'ming-ui/components/DatePicker';
import { getClassNameByExt } from 'src/util';
import _ from 'lodash';
import moment from 'moment';

const defaultArr = [
  {
    name: _l('任务'),
    icon: 'icon-task-responsible',
    value: 1,
    searchText: _l('搜索任务'),
    sortText: _l('按任务的最近更新排序'),
    createText: _l('新建任务'),
  },
  {
    name: _l('项目'),
    icon: 'icon-knowledge_file',
    value: 2,
    searchText: _l('搜索项目'),
    sortText: _l('按项目的创建时间排序'),
  },
  {
    name: _l('日程'),
    icon: 'icon-task_custom_today',
    value: 3,
    searchText: _l('搜索日程'),
    sortText: _l('按日程的开始时间排序'),
    createText: _l('新建日程'),
  },
  {
    name: _l('申请单'),
    icon: 'icon-content_paste2',
    value: 5,
    searchText: _l('搜索申请单'),
    sortText: _l('按申请单的发起时间排序'),
  },
];

export default class RelationControl extends Component {
  static propTypes = {
    title: PropTypes.string,
    sourceId: PropTypes.string,
    sourceType: PropTypes.string, // 后端过滤用 1：任务 2：审批
    types: PropTypes.array, // 类型 默认全部 可多选 例如：[1, 2, 3]
    onSubmit: PropTypes.func, // 回调方法  item：当前选择的item
    onCancel: PropTypes.func,

    ajaxPost: PropTypes.func,
    ajaxDataFormat: PropTypes.func,
  };

  static defaultProps = {
    title: '',
    createDisable: false,
    types: [],
    sourceId: '',
    sourceType: '',
    onSubmit: () => {},
    onCancel: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: true,
      repeatVisible: false,
      selectIndex: props.types.length ? (props.types[0] !== 4 ? props.types[0] : 1) : 1,
      list: [],
      repeatList: [], // 重复列表
      singleRepeatList: [],
      treeLeft: '',
      listPage: 1,
      repeatPage: 1,
      listMore: false,
      repeatMore: false,
      item: null,
      keywords: '',
      ajaxRequestComplete: false,
    };
  }

  componentWillMount() {
    this.getSources();
  }

  /**
   * 获取数据
   */
  getSources() {
    if (this.props.ajaxPost) {
      this.props.ajaxPost(this.state.keywords).then(result => {
        if (result.status) {
          this.setState({
            ajaxRequestComplete: true,
            list: this.props.ajaxDataFormat(result.data),
          });
        }
      });
    } else {
      this.getRelationSources();
    }

    // 拉取重复日程
    if (this.state.selectIndex === 3) {
      this.getRelationSources(6);
    }
  }

  /**
   * 获取列表
   */
  getRelationSources(type = this.state.selectIndex, pageIndex = 1) {
    const { keywords, selectIndex, treeLeft, list } = this.state;
    const { sourceId, sourceType } = this.props;
    const pageSize = selectIndex === 3 || selectIndex === 6 ? 10 : 20;
    const listMsg = key => {
      return list.length ? list[list.length - 1][key] : '';
    };

    ajaxRequest
      .getRelationSources({
        type,
        keywords,
        sourceId,
        sourceType,
        pageIndex,
        pageSize,
        treeLeft: type === 3 ? `${listMsg('sid')}|${listMsg('ext1')}|${listMsg('sidext')}` : treeLeft,
      })
      .then(source => {
        if (source.code === 1) {
          this.setState({ ajaxRequestComplete: true });
          // 重复日程列表
          if (type === 6) {
            this.setState({
              repeatList: pageIndex === 1 ? source.data : this.state.repeatList.concat(source.data),
              repeatPage: pageIndex,
              repeatMore: source.data.length === pageSize,
            });
          } else if (type === 7) {
            // 重复日程单条列表
            this.setState({ singleRepeatList: source.data });
          } else {
            this.setState({
              list: pageIndex === 1 ? source.data : this.state.list.concat(source.data),
              listPage: pageIndex,
              listMore: source.data.length === pageSize,
            });
          }
        }
      });
  }

  /**
   * 返回左侧tabs
   * @param  {array} types
   */
  returnTypes(types) {
    let typeArr = [];

    types.forEach(type => {
      defaultArr.forEach(item => {
        if (item.value === type) {
          typeArr.push(item);
        }
      });
    });

    let newTypeArr = typeArr.length ? typeArr : defaultArr;

    if (!md.global.Account.hrVisible) {
      _.remove(newTypeArr, o => o.value === 5);
    }

    return newTypeArr;
  }

  /**
   * 切换tabs
   * @param  {number} index
   */
  switchType(index) {
    this.setState(
      {
        selectIndex: index,
        keywords: '',
        list: [],
        repeatList: [],
        singleRepeatList: [],
        treeLeft: '',
        ajaxRequestComplete: false,
      },
      () => {
        this.getSources();
      }
    );
  }

  /**
   * 回车搜索
   * @param  {object} evt
   */
  search(evt) {
    if (evt.keyCode === 13) {
      this.setState(
        {
          keywords: evt.currentTarget.value,
          list: [],
          repeatList: [],
          singleRepeatList: [],
          treeLeft: '',
          ajaxRequestComplete: false,
        },
        () => {
          this.getSources();
        }
      );
    }
  }

  /**
   * 创建
   */
  create() {
    // 新建任务
    if (this.state.selectIndex === 1) {
      $.CreateTask({
        relationCallback: item => {
          let list = this.state.list;
          list.unshift({
            accountId: item.charge.accountID,
            avatar: item.charge.avatar,
            ext1: '',
            ext2: '',
            fullname: '',
            name: item.taskName,
            sid: item.taskID,
            sidext: '',
            type: 1,
            link: md.global.Config.WebUrl + 'apps/task/task_' + item.taskID,
          });
          this.setState({ list });
        },
      });
    }

    // 新建日程
    if (this.state.selectIndex === 3) {
      $.CreateCalendar({
        createShare: false,
        callback: item => {
          let { list, repeatList } = this.state;
          const obj = {
            accountId: md.global.Account.accountId,
            avatar: md.global.Account.avatar,
            ext1: item.startDate,
            ext2: item.endDate,
            fullname: '',
            name: item.name,
            sid: item.calendarID,
            sidext: '',
            type: 3,
            link: md.global.Config.WebUrl + 'apps/calendar/detail_' + item.calendarID,
          };

          if (item.isRecur) {
            repeatList.unshift(obj);
            this.setState({ repeatList });
          } else {
            list.unshift(obj);
            this.setState({ list });
          }
        },
      });
    }
  }

  /**
   * 关闭
   */
  cancel() {
    this.props.onCancel();
    this.setState({ visible: false });
  }

  /**
   * 确定
   */
  save() {
    if (this.state.item !== null) {
      this.props.onSubmit(this.state.item);
      this.setState({ visible: false });
    }
  }

  onCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }

    this.setState({
      visible: false,
    });
  };
  /**
   * render item
   */
  renderItem(item, i) {
    const currentType = _.find(defaultArr, { value: this.state.selectIndex });

    return (
      <li
        key={i}
        className={cx('relative', { ThemeBGColor3: this.state.item && this.state.item.sid === item.sid && this.state.item.sidext === item.sidext })}
        onClick={() => this.setState({ item })}
      >
        <div className="flexRow relationControlItem">
          <i className={item.type === 4 ? getClassNameByExt(item.ext1) + ' relationControlIcon' : currentType.icon} />
          <span className={cx('overflow_ellipsis', { flex: item.type !== 4 })}>{item.name}</span>

          {item.type !== 1 && item.ext1 ? (
            <span className={item.type === 4 ? '' : 'mLeft20'}>
              {item.type === 3 || item.type === 7 ? moment(item.ext1).format('YYYY-MM-DD HH:mm') : item.ext1}
            </span>
          ) : (
            undefined
          )}

          {item.ext2 ? (
            <span className="mLeft20">{item.type === 3 || item.type === 7 ? moment(item.ext2).format('YYYY-MM-DD HH:mm') : item.ext2}</span>
          ) : (
            undefined
          )}

          {item.type === 4 ? <span className="flex" /> : undefined}

          <UserHead
            className="circle userAvarar"
            user={{
              userHead: item.avatar,
              accountId: item.accountId,
            }}
            lazy={'false'}
            size={24}
          />
        </div>
      </li>
    );
  }

  /**
   * show repeat dialog
   */
  repeatDialog(item) {
    const treeLeft = `${item.sid}|${moment(item.ext1).format('YYYY-MM-DD HH:mm')}|${moment(item.ext1)
      .add(1, 'y')
      .format('YYYY-MM-DD HH:mm')}`;
    this.setState({ repeatVisible: true, treeLeft, item: null }, () => {
      this.getRelationSources(7);
    });
  }

  /**
   * 选择时间段
   */
  selectTime = result => {
    const sid = this.state.treeLeft.split('|')[0];
    const treeLeft = `${sid}|${result[0].format('YYYY-MM-DD')}|${result[1].format('YYYY-MM-DD')}`;
    this.setState({ treeLeft, item: null }, () => {
      this.getRelationSources(7);
    });
  };

  render() {
    let types = this.props.types;

    if (types.length === 1 && types[0] === 4) {
      types = [];
    }

    const dialogOpts = {
      overlayClosable: false,
      visible: this.state.visible,
      width: types.length === 1 ? 555 : 700,
      type: 'fixed',
    };
    const repeatDialogOpts = {
      overlayClosable: false,
      visible: this.state.repeatVisible,
      width: 600,
      type: 'fixed',
    };
    const currentType = _.find(defaultArr, { value: this.state.selectIndex });
    const treeLeftArr = this.state.treeLeft.split('|');

    return (
      <DialogBase {...dialogOpts}>
        <div className="flexRow relationControlBox">
          {types.length === 1 ? (
            undefined
          ) : (
            <div className="relationControlBar">
              <div className="relationControlTypeName">{this.props.title}</div>
              <ul className="relationControlType">
                {this.returnTypes(types).map((item, i) => {
                  return (
                    <li key={i} onClick={() => this.switchType(item.value)} className={cx({ active: this.state.selectIndex === item.value })}>
                      <i className={item.icon} />
                      {item.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="flex relative flexColumn">
            <i
              className="icon-delete relationControlClose ThemeColor3"
              onClick={() => {
                this.onCancel();
              }}
            />
            <div className="relationControlSearch">
              <i className="icon-search" />
              <input type="text" placeholder={currentType.searchText} onKeyUp={evt => this.search(evt)} />
            </div>

            {this.state.list.length === 0 && this.state.keywords ? undefined : <div className="relationControlSort">{currentType.sortText}</div>}

            <ul className="flex relationControlList">
              {!this.state.ajaxRequestComplete ? <LoadDiv /> : undefined}

              {this.state.ajaxRequestComplete && !this.state.list.length && !this.state.repeatList.length && this.state.keywords ? (
                <div className="relationControNull">
                  <div className="relationControNullIcon">
                    <i className="icon-search" />
                  </div>
                  {_l('搜索无结果')}
                </div>
              ) : (
                undefined
              )}

              {this.state.ajaxRequestComplete && !this.state.list.length && !this.state.repeatList.length && !this.state.keywords ? (
                <div className="relationControNull">
                  <div className="relationControNull" />
                  {_l('暂无列表')}
                </div>
              ) : (
                undefined
              )}

              {this.state.repeatList.map((item, i) => {
                return (
                  <li key={i} className="relative" onClick={() => this.repeatDialog(item)}>
                    <div className="flexRow relationControlItem">
                      <i className="icon-restore2" />
                      <span className="overflow_ellipsis flex">{_l('【重复日程】') + item.name}</span>
                      <UserHead
                        className="circle userAvarar"
                        user={{
                          userHead: item.avatar,
                          accountId: item.accountId,
                        }}
                        lazy={'false'}
                        size={24}
                      />
                    </div>
                  </li>
                );
              })}

              {this.state.ajaxRequestComplete && this.state.selectIndex === 3 && this.state.repeatMore ? (
                <div>
                  <span className="listMore ThemeColor3" onClick={() => this.getRelationSources(6, this.state.repeatPage + 1)}>
                    {_l('查看更多')}
                  </span>
                </div>
              ) : (
                undefined
              )}

              {this.state.list.map((item, i) => this.renderItem(item, i))}

              {this.state.ajaxRequestComplete && this.state.selectIndex === 3 && this.state.listMore ? (
                <div>
                  <span className="listMore ThemeColor3" onClick={() => this.getRelationSources(3, this.state.listPage + 1)}>
                    {_l('查看更多')}
                  </span>
                </div>
              ) : (
                undefined
              )}
            </ul>
            <div className="relationControlFooter">
              {!this.props.createDisable && currentType.createText ? (
                <span className="relationControlCreate ThemeColor3" onClick={() => this.create()}>
                  <i className="icon-plus" />
                  {currentType.createText}
                </span>
              ) : (
                undefined
              )}
              <span
                className="relationControlCancel ThemeColor3"
                onClick={() => {
                  this.onCancel();
                }}
              >
                {_l('取消')}
              </span>
              <span className={cx('relationControlSave ThemeBGColor3', { relationDisable: this.state.item === null })} onClick={() => this.save()}>
                {_l('确定')}
              </span>
            </div>
          </div>
        </div>

        {this.state.repeatVisible ? (
          <DialogBase {...repeatDialogOpts}>
            <div className="flexColumn relationControlBox relative">
              <i
                className="icon-delete relationControlClose ThemeColor3"
                onClick={() => this.setState({ repeatVisible: false, treeLeft: '', item: null })}
              />
              <div className="relationControlTypeName overflow_ellipsis mRight25 mLeft15">
                {_l('【重复日程】') + _.find(this.state.repeatList, item => item.sid === treeLeftArr[0]).name}
              </div>
              <div className="listDate">
                <DatePicker.RangePicker
                  className="ThemeHoverColor3"
                  onOk={this.selectTime}
                  allowClear={false}
                  selectedValue={[moment(treeLeftArr[1]), moment(treeLeftArr[2])]}
                >
                  <span>
                    {moment(treeLeftArr[1]).format('YYYY-MM-DD')}
                    <i className="icon-arrow-down-border mLeft5 Font14 listDateGray" />
                    <span className="mLeft10 mRight10 listDateGray">{_l('至')}</span>
                    {moment(treeLeftArr[2]).format('YYYY-MM-DD')}
                    <i className="icon-arrow-down-border mLeft5 Font14 listDateGray" />
                  </span>
                </DatePicker.RangePicker>
              </div>
              <ul className="flex relationControlList">
                {this.state.ajaxRequestComplete && !this.state.singleRepeatList.length ? (
                  <div className="relationControNull">
                    <div className="relationControNull" />
                    {_l('暂无列表')}
                  </div>
                ) : (
                  undefined
                )}
                {this.state.singleRepeatList.map((item, i) => this.renderItem(item, i))}
              </ul>
              <div className="relationControlFooter">
                <span className="relationControlCancel ThemeColor3" onClick={() => this.setState({ repeatVisible: false, treeLeft: '', item: null })}>
                  {_l('取消')}
                </span>
                <span className={cx('relationControlSave ThemeBGColor3', { relationDisable: this.state.item === null })} onClick={() => this.save()}>
                  {_l('确定')}
                </span>
              </div>
            </div>
          </DialogBase>
        ) : (
          undefined
        )}
      </DialogBase>
    );
  }
}

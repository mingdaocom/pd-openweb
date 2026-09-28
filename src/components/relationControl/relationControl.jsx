import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { LoadDiv, UserHead } from 'ming-ui';
import { DatePicker, Menu, Modal } from 'ming-ui/antd-components';
import ajaxRequest from 'src/api/form';
import { getClassNameByExt } from 'src/utils/domain/file/classification';
import './less/relationControl.less';

const RELATION_MODAL_STYLES = {
  container: { padding: 0 },
  body: { padding: 0 },
};
const MENU_ICON_STYLE = { fontSize: 16 };
const RELATION_MENU_STYLES = {
  item: { height: 48, lineHeight: '48px' },
  itemIcon: MENU_ICON_STYLE,
};
const RELATION_TYPE_MENU_STYLES = {
  root: { background: 'transparent', borderInlineEnd: 0, marginTop: 15 },
  item: { width: '100%', height: 48, lineHeight: '48px', margin: 0, paddingInline: 20, borderRadius: 0 },
  itemIcon: MENU_ICON_STYLE,
};

const getDefaultArr = () => [
  {
    name: _l('任务'),
    icon: 'icon-task-responsible',
    value: 1,
    searchText: _l('搜索任务'),
    sortText: _l('按任务的最近更新排序'),
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
    multiple: PropTypes.bool,
    onSubmit: PropTypes.func, // 回调方法  item：当前选择的item；多选时为 items 数组
    onCancel: PropTypes.func,

    ajaxPost: PropTypes.func,
    ajaxDataFormat: PropTypes.func,
  };

  static defaultProps = {
    title: '',
    createDisable: false,
    types: [],
    multiple: false,
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
      items: [],
      keywords: '',
      ajaxRequestComplete: false,
    };
  }

  componentDidMount() {
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
      getDefaultArr().forEach(item => {
        if (item.value === type) {
          typeArr.push(item);
        }
      });
    });

    let newTypeArr = typeArr.length ? typeArr : getDefaultArr();

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
      },
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
        },
      );
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
    const value = this.props.multiple ? this.state.items : this.state.item;

    if ((this.props.multiple && value.length) || (!this.props.multiple && value !== null)) {
      this.props.onSubmit(value);
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
  renderItem(item) {
    const currentType = _.find(getDefaultArr(), { value: this.state.selectIndex }) || {};
    const isSelected = this.props.multiple
      ? this.state.items.some(selectedItem => this.getItemKey(selectedItem) === this.getItemKey(item))
      : this.state.item && this.getItemKey(this.state.item) === this.getItemKey(item);
    const iconClassName = item.type === 4 ? `${getClassNameByExt(item.ext1)} relationControlIcon` : currentType.icon;

    return {
      key: this.getItemKey(item),
      icon: <i className={cx(iconClassName, { textTertiary: !isSelected })} />,
      label: <span className="overflow_ellipsis">{item.name}</span>,
      extra: (
        <div className="flexRow alignItemsCenter" style={{ lineHeight: 'normal' }}>
          {item.type !== 1 && item.ext1 ? (
            <span>{item.type === 3 || item.type === 7 ? moment(item.ext1).format('YYYY-MM-DD HH:mm') : item.ext1}</span>
          ) : undefined}

          {item.ext2 ? (
            <span className="mLeft20">
              {item.type === 3 || item.type === 7 ? moment(item.ext2).format('YYYY-MM-DD HH:mm') : item.ext2}
            </span>
          ) : undefined}

          <UserHead
            className="circle mLeft20"
            user={{
              userHead: item.avatar,
              accountId: item.accountId,
            }}
            size={24}
          />
        </div>
      ),
      onClick: () => {
        if (!this.props.multiple) {
          this.setState({ item });
          return;
        }

        this.setState(({ items }) => ({
          items: isSelected
            ? items.filter(selectedItem => this.getItemKey(selectedItem) !== this.getItemKey(item))
            : items.concat(item),
        }));
      },
    };
  }

  getItemKey(item) {
    return `${item.type ?? this.state.selectIndex}-${item.sid}-${item.sidext ?? ''}`;
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
    if (!Array.isArray(result) || !result[0] || !result[1]) return;

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
      open: this.state.visible,
      width: window.innerWidth - 52 * 2 > 1600 ? 1600 : window.innerWidth - 52 * 2,
      type: 'fixed',
      title: null,
      footer: null,
      closable: false,
      mask: { closable: false },
      styles: RELATION_MODAL_STYLES,
    };
    const repeatDialogOpts = {
      open: this.state.repeatVisible,
      width: 600,
      type: 'fixed',
      title: null,
      footer: null,
      closable: false,
      mask: { closable: false },
      styles: RELATION_MODAL_STYLES,
    };
    const currentType = _.find(getDefaultArr(), { value: this.state.selectIndex }) || {};
    const treeLeftArr = this.state.treeLeft.split('|');
    const selectedKeys = this.props.multiple
      ? this.state.items.map(item => this.getItemKey(item))
      : this.state.item
        ? [this.getItemKey(this.state.item)]
        : [];
    const typeMenuItems =
      types.length === 1
        ? []
        : this.returnTypes(types).map(item => ({
            key: String(item.value),
            icon: <i className={cx(item.icon, { textTertiary: this.state.selectIndex !== item.value })} />,
            label: item.name,
            onClick: () => this.switchType(item.value),
          }));
    const menuItems = [
      ...this.state.repeatList.map(item => ({
        key: `repeat-${this.getItemKey(item)}`,
        icon: <i className="icon-restore2 textTertiary" />,
        label: <span className="overflow_ellipsis">{_l('【重复日程】') + item.name}</span>,
        extra: (
          <UserHead
            className="circle"
            user={{
              userHead: item.avatar,
              accountId: item.accountId,
            }}
            size={24}
          />
        ),
        onClick: () => this.repeatDialog(item),
      })),
      ...(this.state.ajaxRequestComplete && this.state.selectIndex === 3 && this.state.repeatMore
        ? [
            {
              key: 'repeat-more',
              label: <span className="colorPrimary">{_l('查看更多')}</span>,
              onClick: () => this.getRelationSources(6, this.state.repeatPage + 1),
            },
          ]
        : []),
      ...this.state.list.map(item => this.renderItem(item)),
      ...(this.state.ajaxRequestComplete && this.state.selectIndex === 3 && this.state.listMore
        ? [
            {
              key: 'list-more',
              label: <span className="colorPrimary">{_l('查看更多')}</span>,
              onClick: () => this.getRelationSources(3, this.state.listPage + 1),
            },
          ]
        : []),
    ];
    const repeatMenuItems = this.state.singleRepeatList.map(item => this.renderItem(item));

    return (
      <Modal {...dialogOpts}>
        <div className="flexRow relationControlBox">
          {types.length === 1 ? undefined : (
            <div className="relationControlBar">
              <div className="relationControlTypeName">{this.props.title}</div>
              <Menu
                className="relationControlType"
                mode="inline"
                styles={RELATION_TYPE_MENU_STYLES}
                items={typeMenuItems}
                selectedKeys={[String(this.state.selectIndex)]}
              />
            </div>
          )}

          <div className="flex relative flexColumn">
            <i
              className="icon-delete relationControlClose colorPrimary"
              onClick={() => {
                this.onCancel();
              }}
            />
            <div className="relationControlSearch">
              <i className="icon-search" />
              <input type="text" placeholder={currentType.searchText} onKeyUp={evt => this.search(evt)} />
            </div>

            {this.state.list.length === 0 && this.state.keywords ? undefined : (
              <div className="relationControlSort">{currentType.sortText}</div>
            )}

            {!this.state.ajaxRequestComplete ? (
              <div className="flex relationControlList">
                <LoadDiv />
              </div>
            ) : !this.state.list.length && !this.state.repeatList.length ? (
              <div className="flex relationControlList">
                {this.state.keywords ? (
                  <div className="relationControNull">
                    <div className="relationControNullIcon">
                      <i className="icon-search" />
                    </div>
                    {_l('搜索无结果')}
                  </div>
                ) : (
                  <div className="relationControNull">
                    <div className="relationControNull" />
                    {_l('暂无列表')}
                  </div>
                )}
              </div>
            ) : (
              <Menu
                className="flex relationControlList"
                mode="inline"
                styles={RELATION_MENU_STYLES}
                items={menuItems}
                multiple={this.props.multiple}
                selectedKeys={selectedKeys}
              />
            )}
            <div className="relationControlFooter">
              <span
                className="relationControlCancel colorPrimary"
                onClick={() => {
                  this.onCancel();
                }}
              >
                {_l('取消')}
              </span>
              <span
                className={cx('relationControlSave bgColorPrimary', {
                  relationDisable: this.props.multiple ? !this.state.items.length : this.state.item === null,
                })}
                onClick={() => this.save()}
              >
                {_l('确定')}
              </span>
            </div>
          </div>
        </div>

        {this.state.repeatVisible ? (
          <Modal {...repeatDialogOpts}>
            <div className="flexColumn relationControlBox relative">
              <i
                className="icon-delete relationControlClose colorPrimary"
                onClick={() => this.setState({ repeatVisible: false, treeLeft: '', item: null })}
              />
              <div className="relationControlTypeName overflow_ellipsis mRight25 mLeft15">
                {_l('【重复日程】') + _.find(this.state.repeatList, item => item.sid === treeLeftArr[0]).name}
              </div>
              <div className="listDate">
                <DatePicker.RangePicker
                  allowClear={false}
                  format="YYYY-MM-DD"
                  value={[moment(treeLeftArr[1]), moment(treeLeftArr[2])]}
                  onChange={this.selectTime}
                />
              </div>
              {!this.state.singleRepeatList.length ? (
                <div className="flex relationControlList">
                  <div className="relationControNull">
                    <div className="relationControNull" />
                    {_l('暂无列表')}
                  </div>
                </div>
              ) : (
                <Menu
                  className="flex relationControlList"
                  mode="inline"
                  styles={RELATION_MENU_STYLES}
                  items={repeatMenuItems}
                  multiple={this.props.multiple}
                  selectedKeys={selectedKeys}
                />
              )}
              <div className="relationControlFooter">
                <span
                  className="relationControlCancel colorPrimary"
                  onClick={() => this.setState({ repeatVisible: false, treeLeft: '', item: null })}
                >
                  {_l('取消')}
                </span>
                <span
                  className={cx('relationControlSave bgColorPrimary', {
                    relationDisable: this.props.multiple ? !this.state.items.length : this.state.item === null,
                  })}
                  onClick={() => this.save()}
                >
                  {_l('确定')}
                </span>
              </div>
            </div>
          </Modal>
        ) : undefined}
      </Modal>
    );
  }
}

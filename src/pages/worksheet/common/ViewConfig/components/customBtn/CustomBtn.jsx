import React, { Component } from 'react';
import './CustomBtn.less';
import { Icon, RadioGroup, Dialog, Checkbox } from 'ming-ui';
import CustomBtnList from './CustomBtnList.jsx';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import sheetAjax from 'src/api/worksheet';
import { COLORS, ICONS, BORDERCOLORS } from 'src/pages/worksheet/common/CreateCustomBtn/config.js';
import cx from 'classnames';
import color from 'color';
import _ from 'lodash';

const SortHandle = SortableHandle(() => <Icon className="mRight10 Font16 mLeft7 Hand" icon="drag" />);

const Item = SortableElement(({ name, icon, color, btnId, editBtn, deleteBtn, isAllView }) => (
  <div className="customBtn mBottom10" style={{}}>
    <SortHandle />
    <span
      className="Hand con"
      onClick={() => {
        editBtn(btnId);
      }}
    >
      <span className="overflow_ellipsis Font13 WordBreak Gray">
        <Icon
          icon={icon || 'custom_actions'}
          style={{ color: color ? color : '#e0e0e0' }}
          className={cx('mRight12 Font18')}
        />
        {name || ''}
      </span>
      <Icon className="Font16 Hand editIcon" icon="new_mail" />
    </span>
    <Icon
      className="Font16 Hand mLeft15 mRight15"
      icon="delete2"
      onClick={() => {
        deleteBtn(btnId, isAllView);
      }}
    />
  </div>
));

const SortableList = SortableContainer(({ items, editBtn, deleteBtn }) => {
  return (
    <div className="mTop24">
      {_.map(items, (item, index) => {
        return (
          <Item
            {...item}
            name={item.name}
            icon={item.icon}
            color={item.color}
            key={'item_' + index}
            index={index}
            editBtn={editBtn.bind(item)}
            deleteBtn={deleteBtn.bind(item)}
          />
        );
      })}
    </div>
  );
});

const deleteStr = isAllView => {
  let list = [
    {
      value: 2,
      text: _l('应用于所有记录中的按钮，无法从当前视图中删除'),
      disabled: true,
    },
    {
      value: 0,
      text: _l('仅从当前视图中移除'),
    },
    {
      value: 1,
      text: _l('彻底删除按钮，与之对应触发的工作流也将被删除'),
    },
  ];
  return list.filter(o => o.value !== (!isAllView ? 2 : 0));
};

class CustomBtn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      btnData: props.btnData || [], // 已添加按钮
      showBtn: false,
      btnList: props.btnList || [], // 已创建按钮
      showDeleteDialog: false,
      value: 0,
      btnId: '',
    };
  }

  componentDidMount() {
    this.fetchBtnByAll(true);
    this.setState({
      btnData: this.props.btnData,
      btnList: this.props.btnList,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.btnData !== this.props.btnData ||
      nextProps.btnData.length !== this.props.btnData.length ||
      nextProps.btnList !== this.props.btnList ||
      nextProps.btnList.length !== this.props.btnList.length
    ) {
      this.setState({
        btnData: nextProps.btnData,
        btnList: nextProps.btnList,
      });
    }
  }

  fetchBtnByAll = () => {
    const { worksheetId, appId, rowId } = this.props;
    this.props.refreshFn(worksheetId, appId, '', rowId);
  };

  fresh = isAll => {
    const { worksheetId, appId, viewId, rowId } = this.props;
    this.props.refreshFn(worksheetId, appId, viewId, rowId);
    if (isAll) {
      this.fetchBtnByAll();
    }
  };

  optionWorksheetBtn = (btnId, optionType, callback) => {
    const { worksheetId, appId, viewId, rowId } = this.props;
    let worksheetIdN = '';
    if (this.state.optionType === 9) {
      worksheetIdN = '';
    } else {
      worksheetIdN = worksheetId;
    }
    sheetAjax
      .optionWorksheetBtn({
        appId, //* @param { string } args.appId 应用iD
        viewId, //* @param { string } args.viewId 视图ID
        btnId: btnId, // * @param { string } args.btnId 按钮ID
        worksheetId: worksheetIdN, // * @param { string } args.worksheetId 工作表ID
        optionType: optionType, // * @param { integer } args.optionType 操作类型 1：视图添加按钮 2：视图删除按钮 9：删除按钮
      })
      .then(data => {
        callback(data);
      });
  };

  handleMoveApp = list => {
    const { worksheetId, appId, viewId } = this.props;
    let displaySort = [];
    let btnIds = [];
    list.map((item, i) => {
      displaySort.push(item);
      btnIds.push(item.btnId);
    });
    this.setState({
      btnData: displaySort,
    });
    sheetAjax
      .sortViewBtns({
        worksheetId, // * @param { string } args.worksheetId 工作表id
        btnIds, // * @param { array } args.btnIds 自定义按钮列表
        appId, // * @param { string } args.appId 应用Id
        viewId, // * @param { string } args.viewId 视图ID
      })
      .then(
        res => {
          this.fresh(false);
        },
        err => {
          alert(err.message || _l('排序失败'));
        },
      );
  };

  handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;

    const list = this.state.btnData.slice();
    const currentItem = list.splice(oldIndex, 1)[0];

    list.splice(newIndex, 0, currentItem);
    this.handleMoveApp(list);
  };

  editBtn = btnId => {
    this.props.showCreateCustomBtnFn(true, true, btnId);
  };

  deleteBtn = (id, isAllView) => {
    this.setState({
      showDeleteDialog: true,
      btnId: id,
      isAllView,
      value: isAllView ? 1 : 0
    });
  };

  renderDeleteDialog = () => {
    const { isAllView } = this.state;
    return (
      <Dialog
        title={_l('删除按钮')}
        okText={_l('删除')}
        cancelText={_l('取消')}
        confirm="danger"
        className="deleteCustomBtnDialog"
        headerClass="deleteCustomBtnDialogTitle"
        bodyClass="deleteCustomBtnDialogCon"
        onCancel={() => {
          this.setState({
            showDeleteDialog: false,
          });
        }}
        onOk={() => {
          this.optionWorksheetBtn(this.state.btnId, this.state.value === 0 ? 2 : 9, data => {
            this.setState(
              {
                showDeleteDialog: false,
              },
              () => {
                this.fresh(true);
              },
            );
          });
        }}
        visible={this.state.showDeleteDialog}
        updateTrigger="fasle"
      >
        <RadioGroup
          data={deleteStr(isAllView)}
          size="small"
          onChange={value => {
            this.setState({
              value: value,
            });
          }}
          checkedValue={this.state.value}
        />
      </Dialog>
    );
  };

  render() {
    const { btnData, btnList } = this.state;
    return (
      <React.Fragment>
        <div className="customBtnBox">
          <p className="Gray_9e Font13">
            {_l('在当前视图下的记录中添加自定义按钮，当用户点击按钮后填写预设的内容或执行一个工作流')}
          </p>
          {btnData && (
            <SortableList
              items={btnData}
              useDragHandle
              onSortEnd={this.handleSortEnd}
              helperClass={'customBtnSortableList'}
              editBtn={this.editBtn}
              deleteBtn={this.deleteBtn}
            />
          )}
          <div
            className="addBtn Hand mTop20 Relative"
            onClick={() => {
              if (btnList.length <= btnData.length) {
                this.props.showCreateCustomBtnFn(true, false);
              } else {
                this.setState(
                  {
                    showBtn: !this.state.showBtn,
                  },
                  () => {
                    if (this.state.showBtn) {
                      var scrollDom = document.querySelector('.btnListBoxMain');
                      scrollDom.scrollIntoView(false);
                    }
                  },
                );
              }
            }}
          >
            <i className="icon icon-add Font18 mRight5 TxtMiddle InlineBlock"></i>
            <span className="Bold TxtMiddle InlineBlock">{_l('添加按钮')}</span>
            {this.state.showBtn && (
              <CustomBtnList
                btnList={btnList}
                btnData={btnData}
                setList={item => {
                  this.optionWorksheetBtn(item.btnId, 1, data => {
                    this.setState(
                      {
                        showBtn: false,
                      },
                      () => {
                        this.fresh(false);
                      },
                    );
                  });
                }}
                onClickAway={() => this.setState({ showBtn: false })}
                showCreateCustomBtnFn={this.props.showCreateCustomBtnFn}
              />
            )}
          </div>
          {this.props.btnData.length > 0 && (
            <Checkbox
              className="mTop15 hideBtn"
              text={_l('隐藏不可用的按钮')}
              checked={this.props.hidebtn === '1'}
              onClick={checked => {
                this.props.hidebtnFn(!checked ? '1' : '');
              }}
            />
          )}
        </div>
        {this.state.showDeleteDialog && this.renderDeleteDialog()}
      </React.Fragment>
    );
  }
}

export default CustomBtn;

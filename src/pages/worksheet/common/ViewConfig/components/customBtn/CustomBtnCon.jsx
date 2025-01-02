import React, { Component } from 'react';
import './CustomBtn.less';
import { Icon, RadioGroup, Dialog, Tooltip, SvgIcon, SortableList } from 'ming-ui';
import CustomBtnList from './CustomBtnList.jsx';
import sheetAjax from 'src/api/worksheet';
import cx from 'classnames';
import _ from 'lodash';

const confirm = Dialog.confirm;

const Item = ({
  name = '',
  icon = '',
  color = '',
  btnId = '',
  appId,
  editBtn,
  clickType,
  writeType,
  writeObject,
  deleteBtn,
  isAllView,
  handleCopy,
  isListOption,
  iconUrl,
  DragHandle,
}) => {
  const disable = (writeObject === 2 || writeType === 2) && clickType === 3 && isListOption; //批量的按钮，不支持填写关联
  return (
    <React.Fragment>
      <DragHandle className="alignItemsCenter flexRow">
        <Icon className="mRight10 Font16 mLeft7 Hand" icon="drag" />
      </DragHandle>
      <span
        className="Hand con overflow_ellipsis alignItemsCenter"
        onClick={() => {
          editBtn(btnId);
        }}
      >
        <span className="Font13 WordBreak Gray Bold flexRow alignItemsCenter">
          {disable ? (
            <Tooltip
              placement="bottom"
              text={<span>{_l('批量操作的按钮不支持关联形态表单填写')}</span>}
            >
              <Icon icon={'error1'} style={{ color: 'red' }} className={cx('mRight12 Font18')} />
            </Tooltip>
          ) : !!iconUrl && !!icon && icon.endsWith('_svg') ? (
            <SvgIcon
              className="mRight12"
              addClassName='TxtMiddle'
              url={iconUrl}
              fill={!icon ? '#bdbdbd' : !color ? '#2196f3' : color === 'transparent' ? '#151515' : color}
              size={18}
            />
          ) : (
            <Icon
              icon={icon || 'custom_actions'}
              style={{ color: color }}
              className={cx(
                'mRight12 Font18',
                !icon ? 'Gray_bd' : !color ? 'ThemeColor3' : color === 'transparent' ? 'Gray' : '',
              )}
            />
          )}
          <span className={cx('flex overflow_ellipsis', { Gray_9e: disable })}>{name || ''}</span>
        </span>
        <Icon
          className="Font16 Hand copyIcon"
          icon="copy"
          onClick={e => {
            e.stopPropagation();
            return confirm({
              title: <span className="WordBreak Block">{_l('复制自定义动作“%0”', name)}</span>,
              description: _l('将复制目标自定义动作的所有节点和配置'),
              onOk: () => {
                handleCopy(btnId);
              },
            });
          }}
        />
        <Icon className="Font16 Hand editIcon mLeft15" icon="new_mail" />
      </span>
      <Icon
        className="Font16 Hand mLeft15 mRight15"
        icon="delete2"
        onClick={() => {
          deleteBtn(btnId, isAllView);
        }}
      />
    </React.Fragment>
  );
};

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
      text: _l('删除按钮，与之对应触发的工作流也将被删除'),
    },
  ];
  return list.filter(o => o.value !== (!isAllView ? 2 : 0));
};

class CustomBtnCon extends Component {
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
    this.setState({
      btnData: this.props.btnData,
      btnList: this.props.btnList,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.btnData, this.props.btnData) || !_.isEqual(nextProps.btnList, this.props.btnList)) {
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
        //21：添加到详情，23：添加到列表 22：详情移除按钮，24：列表移除按钮
      })
      .then(data => {
        callback(data);
      });
  };

  handleMoveApp = list => {
    const { onSortBtns } = this.props;
    let displaySort = [];
    let btnIds = [];
    list.map((item, i) => {
      displaySort.push(item);
      btnIds.push(item.btnId);
    });
    this.setState(
      {
        btnData: displaySort,
      },
      () => {
        onSortBtns(JSON.stringify(btnIds));
        this.props.onFresh();
      },
    );
  };

  editBtn = btnId => {
    this.onShowCustomBtn(true, true, btnId);
  };

  deleteBtn = (id, isAllView) => {
    this.setState({
      showDeleteDialog: true,
      btnId: id,
      isAllView,
      value: isAllView ? 1 : 0,
    });
  };

  handleCopy = btnId => {
    const { worksheetId, appId, viewId } = this.props;
    sheetAjax
      .copyWorksheetBtn({
        appId,
        viewId,
        btnId,
        worksheetId,
      })
      .then(data => {
        if (data) {
          this.props.onFresh();
          alert(_l('复制成功'));
        } else {
          alert(_l('复制失败'), 2);
        }
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
          this.optionWorksheetBtn(
            this.state.btnId,
            this.state.value === 0
              ? this.props.isListOption //添加到详情还是批量操作
                ? 24
                : 22
              : 9,
            data => {
              this.setState(
                {
                  showDeleteDialog: false,
                },
                () => {
                  this.props.onFresh();
                },
              );
            },
          );
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

  onShowCustomBtn = (value, isEdit, btnId = '') => {
    this.props.onShowCreateCustomBtn(value, isEdit, btnId, this.props.isListOption);
  };

  render() {
    const { btnData, btnList } = this.state;
    return (
      <React.Fragment>
        <div className="customBtnBox mTop13">
          <div>
            {btnData && (
              <SortableList
                items={btnData}
                itemKey="btnId"
                useDragHandle
                onSortEnd={list => this.handleMoveApp(list)}
                helperClass={'customBtnSortableList'}
                itemClassName="customBtn alignItemsCenter"
                renderItem={options => (
                  <Item
                    {...options}
                    {...options.item}
                    editBtn={this.editBtn}
                    deleteBtn={this.deleteBtn}
                    handleCopy={this.handleCopy}
                    isListOption={this.props.isListOption}
                    key={'item_' + options.index}
                  />
                )}
              />
            )}
          </div>
          <div
            className="addBtn Hand mTop20 Relative"
            onClick={() => {
              if (btnList.length <= btnData.length) {
                this.onShowCustomBtn(true, false);
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
            <span className="Bold TxtMiddle InlineBlock">{_l('自定义按钮')}</span>
            {this.state.showBtn && (
              <CustomBtnList
                btnList={btnList}
                btnData={btnData}
                setList={item => {
                  this.optionWorksheetBtn(
                    item.btnId, //按钮id
                    this.props.isListOption ? 23 : 21, //添加到详情还是批量操作
                    data => {
                      this.setState(
                        {
                          showBtn: false,
                        },
                        () => {
                          this.props.onFresh();
                        },
                      );
                    },
                  );
                }}
                onClickAway={() => this.setState({ showBtn: false })}
                onShowCreateCustomBtn={this.onShowCustomBtn}
              />
            )}
          </div>
        </div>
        {this.state.showDeleteDialog && this.renderDeleteDialog()}
      </React.Fragment>
    );
  }
}

export default CustomBtnCon;

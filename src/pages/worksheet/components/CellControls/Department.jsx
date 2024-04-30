import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { dialogSelectDept } from 'ming-ui/functions';
import { Tooltip } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import departmentAjax from 'src/api/department';
const ClickAwayable = createDecoratedComponent(withClickAway);
import EditableCellCon from '../EditableCellCon';
import { dealRenderValue } from 'src/components/newCustomFields/tools/utils';
import _ from 'lodash';

// enumDefault 单选 0 多选 1
export default class Text extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    singleLine: PropTypes.bool,
    style: PropTypes.shape({}),
    rowHeight: PropTypes.number,
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    projectId: PropTypes.string,
    updateCell: PropTypes.func,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: safeParse(props.cell.value, 'array'),
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: safeParse(nextProps.cell.value, 'array') });
    }
    const single = nextProps.cell.enumDefault === 0;
    if (single && !this.props.isediting && nextProps.isediting) {
      this.handleSelect();
    }
    if (!single && !this.props.isediting && nextProps.isediting && _.isEmpty(this.props.cell.value)) {
      this.handleSelect();
    }
  }
  @autobind
  handleTableKeyDown(e) {
    const { updateEditingStatus } = this.props;
    switch (e.key) {
      case 'Escape':
        updateEditingStatus(false);
        break;
      case 'Enter':
        if (!this.isSelecting) {
          this.handleSelect();
        }
        break;
      default:
        break;
    }
  }

  @autobind
  handleChange() {
    const { updateCell } = this.props;
    const { value } = this.state;
    updateCell({
      value: JSON.stringify(value),
    });
  }

  @autobind
  selectDepartments(cb) {
    const { cell, projectId } = this.props;
    if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
      alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
      return;
    }
    dialogSelectDept({
      projectId,
      isIncludeRoot: false,
      unique: cell.enumDefault === 0,
      showCreateBtn: false,
      allPath: _.get(cell, 'advancedSetting.allpath') === '1',
      selectFn: cb,
      onClose: () => (this.isSelecting = false),
    });
  }

  @autobind
  handleSelect() {
    const { cell, updateEditingStatus } = this.props;
    const { value } = this.state;
    this.isSelecting = true;
    this.selectDepartments(data => {
      this.isSelecting = false;
      if (cell.enumDefault === 0) {
        // 单选
        this.setState(
          {
            value: data,
          },
          () => {
            this.handleChange();
            updateEditingStatus(false);
          },
        );
      } else {
        let newData = [];
        try {
          newData = _.uniqBy(value.concat(data), 'departmentId');
        } catch (err) {}
        this.setState(
          {
            value: newData,
          },
          this.handleChange,
        );
      }
    });
  }

  @autobind
  handleMutipleEdit() {
    const { updateEditingStatus } = this.props;
    updateEditingStatus(true);
  }

  @autobind
  deleteDepartment(departmentId) {
    const { value } = this.state;
    this.setState(
      {
        value: departmentId
          ? value.filter(department => department.departmentId !== departmentId)
          : value.filter(i => !i.isDelete),
      },
      this.handleChange,
    );
  }

  renderDepartmentTag(department, allowDelete) {
    const { style, isediting, cell = {} } = this.props;
    return (
      <span className={cx('cellDepartment', { isDelete: department.isDelete })} style={{ maxWidth: style.width - 20 }}>
        <div className="flexRow">
          <div className="iconWrap" style={{ backgroundColor: '#2196f3' }}>
            <i className="Font14 icon-department"></i>
          </div>
          <div
            className="departmentName mLeft4 flex ellipsis"
            style={
              _.get(cell, 'advancedSetting.allpath') === '1' && !department.isDelete
                ? { direction: 'rtl', unicodeBidi: 'normal' }
                : {}
            }
          >
            {department.departmentName}
            {department.deleteCount > 1 && <span className="Gray mLeft5">{department.deleteCount}</span>}
          </div>
          {isediting && allowDelete && (
            <i
              className="Font14 Gray_9e icon-close Hand mLeft4"
              onClick={() => this.deleteDepartment(department.departmentId)}
            ></i>
          )}
        </div>
      </span>
    );
  }

  render() {
    const {
      className,
      style,
      rowHeight,
      singleLine,
      popupContainer,
      cell,
      projectId,
      editable,
      isediting,
      updateEditingStatus,
      onClick,
    } = this.props;
    const { allpath } = cell.advancedSetting || {};
    const value = dealRenderValue(this.state.value, cell.advancedSetting);
    const single = cell.enumDefault === 0;
    const editcontent = (
      <ClickAwayable
        onClickAwayExceptions={['#dialogSelectDept']}
        onClickAway={() => {
          updateEditingStatus(false);
        }}
      >
        <div
          className="cellDepartments cellControl cellControlDepartmentPopup cellControlEdittingStatus"
          style={{
            width: style.width,
            minHeight: rowHeight,
          }}
        >
          {value.map(department => this.renderDepartmentTag(department, !(cell.required && value.length === 1)))}
          {!single && (
            <span className="addBtn" onClick={this.handleSelect}>
              <i className="icon icon-add Gray_75 Font14"></i>
            </span>
          )}
        </div>
      </ClickAwayable>
    );
    return (
      <Trigger
        action={['click']}
        popup={editcontent}
        getPopupContainer={popupContainer}
        popupClassName="filterTrigger"
        popupVisible={isediting}
        popupAlign={{
          points: ['tl', 'tl'],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
      >
        <EditableCellCon
          hideOutline={!single}
          onClick={onClick}
          className={cx(className, { canedit: editable })}
          style={style}
          iconName="department"
          isediting={isediting}
          onIconClick={cell.enumDefault === 0 ? this.handleSelect : this.handleMutipleEdit}
        >
          {!!value && (
            <div className={cx('cellDepartments cellControl', { singleLine })}>
              {value.map((department, index) => (
                <Tooltip
                  flag={department.departmentId}
                  mouseEnterDelay={0.6}
                  disable={!projectId}
                  text={
                    !_.get(window, 'shareState.shareId')
                      ? () =>
                          new Promise((resolve, reject) => {
                            if (!projectId) {
                              return reject();
                            }

                            if (department.isDelete) {
                              resolve(
                                _l('%0部门已被删除', department.deleteCount > 1 ? `${department.deleteCount}个` : ''),
                              );
                              return;
                            }

                            if (allpath === '1') {
                              return resolve(department.departmentName);
                            }

                            departmentAjax
                              .getDepartmentFullNameByIds({
                                projectId,
                                departmentIds: [department.departmentId],
                              })
                              .then(res => {
                                resolve(_.get(res, '0.name'));
                              });
                          })
                      : null
                  }
                >
                  {this.renderDepartmentTag(department)}
                </Tooltip>
              ))}
            </div>
          )}
        </EditableCellCon>
      </Trigger>
    );
  }
}

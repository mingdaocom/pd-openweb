import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import ClickAway from 'ming-ui/components/ClickAway';
import { quickSelectRole } from 'ming-ui/functions';
import DisabledDepartmentAndRoleName from 'src/components/DisabledDepartmentAndRoleName';
import { dealUserRange } from 'src/components/Form/core/utils';
import EditableCellCon from '../EditableCellCon';

const ClickAwayable = ClickAway;
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
    onValidate: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: safeParse(props.cell.value, 'array'),
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.cell.value !== prevProps.cell.value) {
        this.setState({
          value: safeParse(this.props.cell.value, 'array'),
        });
      }

      const single = this.props.cell.enumDefault === 0;

      if (this.cell.current && single && !prevProps.isediting && this.props.isediting) {
        this.handleSelect();
      }

      if (!single && !prevProps.isediting && this.props.isediting && _.isEmpty(prevProps.cell.value)) {
        setTimeout(() => {
          this.handleSelect();
        }, 200);
      }
    }
  }
  cell = React.createRef();

  handleTableKeyDown = e => {
    switch (e.key) {
      case 'Escape':
        // updateEditingStatus(false);
        break;
      case 'Enter':
        if (!this.isSelecting) {
          this.handleSelect();
        }

        break;
      default:
        break;
    }
  };

  handleChange = () => {
    const { updateCell, onValidate } = this.props;
    const { value } = this.state;
    const newValue = JSON.stringify(value);
    updateCell({
      value: newValue,
    });
    // 组织角色通过浮层选择即时提交，不走输入/失焦校验流程；必填报错后重新选择需主动重新校验，
    // 以清掉持久化在 cellErrors 中的旧错误，否则错误状态不会重置。
    if (_.isFunction(onValidate)) {
      onValidate(newValue);
    }
  };

  handleSelect = () => {
    const { projectId, cell, rowFormData, masterData = () => {} } = this.props;
    const target = (this.cell && this.cell.current) || (event || {}).target;

    if (!target || this.isSelecting) {
      return;
    }

    const single = cell.enumDefault === 0;
    this.isSelecting = true;

    if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
      alert(_l('您不是该组织成员，无法获取其组织角色列表，请联系组织管理员'), 3);
      return;
    }

    const orgRange = dealUserRange(cell, _.isFunction(rowFormData) ? rowFormData() : rowFormData, masterData());

    quickSelectRole(target, {
      projectId,
      unique: single,
      offset: {
        top: 0,
        left: 0,
      },
      value: this.state.value,
      onSave: this.onSave,
      appointedOrganizeIds: _.get(orgRange, 'appointedOrganizeIds'),
      onClose: () => {
        this.isSelecting = false;
      },
    });
  };

  onSave = (data, isCancel = false) => {
    const { value } = this.state;
    const lastIds = _.sortedUniq(value.map(l => l.organizeId));
    const newIds = _.sortedUniq(data.map(l => l.organizeId));

    if ((_.isEmpty(data) || _.isEqual(lastIds, newIds)) && !isCancel) return;

    this.isSelecting = false;
    const { cell, updateEditingStatus } = this.props;
    const filterData = data.map(i => ({ organizeId: i.organizeId, organizeName: i.organizeName }));

    if (cell.enumDefault === 0) {
      // 单选
      this.setState(
        {
          value: filterData,
        },
        () => {
          this.handleChange();
          updateEditingStatus(false);
        },
      );
    } else {
      let newData = [];

      try {
        newData = isCancel
          ? value.filter(l => l.organizeId !== filterData[0].organizeId)
          : _.uniqBy(value.concat(filterData), 'organizeId');
      } catch (err) {
        console.log(err);
      }

      this.setState(
        {
          value: newData,
        },
        this.handleChange,
      );
    }
  };

  handleMutipleEdit = () => {
    const { updateEditingStatus } = this.props;
    updateEditingStatus(true);
  };

  deleteDepartment = organizeId => {
    const { value } = this.state;
    this.setState(
      {
        value: value.filter(organize => organize.organizeId !== organizeId),
      },
      this.handleChange,
    );
  };

  render() {
    const {
      className,
      style,
      rowHeight,
      singleLine,
      popupContainer,
      cell,
      editable,
      isediting,
      updateEditingStatus,
      onClick,
    } = this.props;
    const { value } = this.state;
    const single = cell.enumDefault === 0;
    const editcontent = (
      <ClickAwayable
        onClickAwayExceptions={['.dialogSelectOrgRole', '.selectRoleDialog']}
        onClickAway={() => {
          updateEditingStatus(false);
        }}
      >
        <div
          className="cellDepartments cellControl cellControlDepartmentPopup cellControlEdittingStatus"
          ref={isediting && !single ? this.cell : () => {}}
          style={{
            width: style.width,
            minHeight: rowHeight,
          }}
        >
          {value.map(organize => (
            <span className="cellDepartment" style={{ maxWidth: style.width - 20 }}>
              <div className="flexRow">
                {organize.disabled ? (
                  <DisabledDepartmentAndRoleName
                    className="departmentName flex ellipsis"
                    disabled={organize.disabled}
                    name={organize.organizeName}
                    isRole={true}
                  />
                ) : (
                  <div className="departmentName flex ellipsis">
                    {organize.organizeName ? organize.organizeName : _l('该组织角色已删除')}
                  </div>
                )}
                {isediting && !(cell.required && value.length === 1) && (
                  <i
                    className="Font14 textTertiary icon-close Hand"
                    onClick={() => this.deleteDepartment(organize.organizeId)}
                  />
                )}
              </div>
            </span>
          ))}
          {!single && (
            <span className="addUserBtn" onClick={this.handleSelect}>
              <i className="icon icon-add textSecondary Font14" />
            </span>
          )}
        </div>
      </ClickAwayable>
    );
    return (
      <Fragment>
        <Trigger
          action={['click']}
          popup={editcontent}
          getPopupContainer={popupContainer}
          popupClassName="filterTrigger LineHeight0"
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
            conRef={single ? this.cell : () => {}}
            hideOutline={!single}
            onClick={onClick}
            className={cx(className, { canedit: editable })}
            style={style}
            iconName="arrow-down-border"
            isediting={isediting}
            onIconClick={this.handleMutipleEdit}
          >
            {!!value && (
              <div className={cx('cellDepartments cellControl', { singleLine })}>
                {value.map(organize => (
                  <span className="cellDepartment" style={{ maxWidth: style.width - 20 }}>
                    <div className="flexRow">
                      {organize.disabled ? (
                        <DisabledDepartmentAndRoleName
                          className="departmentName flex ellipsis"
                          disabled={organize.disabled}
                          name={organize.organizeName}
                          isRole={true}
                        />
                      ) : (
                        <div className="departmentName flex ellipsis">
                          {organize.organizeName ? organize.organizeName : _l('该组织角色已删除')}
                        </div>
                      )}
                    </div>
                  </span>
                ))}
              </div>
            )}
          </EditableCellCon>
        </Trigger>
      </Fragment>
    );
  }
}

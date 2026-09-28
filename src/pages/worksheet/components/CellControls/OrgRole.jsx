import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { RoleSelectPopover } from 'ming-ui/functions/quickSelectRole';
import DisabledDepartmentAndRoleName from 'src/components/DisabledDepartmentAndRoleName';
import { dealUserRange } from 'src/utils/domain/control/selectionRange';
import EditableCellCon from '../EditableCellCon';

export default class Text extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    singleLine: PropTypes.bool,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
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
    if (this.props.cell.value !== prevProps.cell.value) {
      this.setState({
        value: safeParse(this.props.cell.value, 'array'),
      });
    }

    if (!prevProps.isediting && this.props.isediting) {
      this.ensureCanSelectRole();
    }
  }

  handleTableKeyDown = e => {
    if (e.key === 'Escape') {
      this.props.updateEditingStatus(false);
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

  isProjectMember = () => {
    const { projectId } = this.props;
    return _.some(md.global.Account.projects, item => item.projectId === projectId);
  };

  ensureCanSelectRole = () => {
    if (!this.isProjectMember()) {
      alert(_l('您不是该组织成员，无法获取其组织角色列表，请联系组织管理员'), 3);
      this.props.updateEditingStatus(false);
      return false;
    }

    return true;
  };

  getAppointedOrganizeIds = () => {
    const { cell, rowFormData, masterData = () => {} } = this.props;
    const orgRange = dealUserRange(cell, _.isFunction(rowFormData) ? rowFormData() : rowFormData, masterData());
    return _.get(orgRange, 'appointedOrganizeIds');
  };

  handleRoleSelectOpenChange = visible => {
    if (visible) return false;

    this.props.updateEditingStatus(false);
  };

  onSave = (data, isCancel = false) => {
    const { value } = this.state;
    const lastIds = _.sortedUniq(value.map(l => l.organizeId));
    const newIds = _.sortedUniq(data.map(l => l.organizeId));

    if ((_.isEmpty(data) || _.isEqual(lastIds, newIds)) && !isCancel) return;

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

  handleEdit = () => {
    if (this.ensureCanSelectRole()) {
      this.props.updateEditingStatus(true);
    }
  };

  deleteRole = organizeId => {
    this.setState(
      ({ value }) => ({
        value: value.filter(organize => organize.organizeId !== organizeId),
      }),
      this.handleChange,
    );
  };

  render() {
    const { className, style, singleLine, cell, editable, isediting, onClick, projectId } = this.props;
    const { value } = this.state;
    const single = cell.enumDefault === 0;
    const isProjectMember = this.isProjectMember();
    const appointedOrganizeIds = isediting && isProjectMember ? this.getAppointedOrganizeIds() : undefined;
    return (
      <EditableCellCon
        onClick={onClick}
        className={cx(className, { canedit: editable })}
        style={style}
        iconName="arrow-down-border"
        isediting={isediting}
        onIconClick={this.handleEdit}
      >
        <RoleSelectPopover
          projectId={projectId}
          unique={single}
          value={value}
          appointedOrganizeIds={appointedOrganizeIds}
          open={isediting && isProjectMember}
          onOpenChange={this.handleRoleSelectOpenChange}
          onSave={this.onSave}
          placement="bottomLeft"
        >
          {!_.isEmpty(value) ? (
            <div className={cx('cellDepartments cellControl', { singleLine })}>
              {value.map(organize => (
                <span key={organize.organizeId} className="cellDepartment" style={{ maxWidth: style.width - 20 }}>
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
                        className="Font14 textTertiary icon-close Hand mLeft4"
                        onMouseDown={e => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          this.deleteRole(organize.organizeId);
                        }}
                      />
                    )}
                  </div>
                </span>
              ))}
            </div>
          ) : (
            <div className="w100 h100"></div>
          )}
        </RoleSelectPopover>
      </EditableCellCon>
    );
  }
}

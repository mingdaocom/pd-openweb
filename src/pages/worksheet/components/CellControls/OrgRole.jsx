import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { quickSelectRole } from 'ming-ui/functions';
import { dealUserRange } from 'src/components/newCustomFields/tools/utils';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAwayable = createDecoratedComponent(withClickAway);
import EditableCellCon from '../EditableCellCon';
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
  cell = React.createRef();
  @autobind
  handleTableKeyDown(e) {
    const { updateEditingStatus } = this.props;
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
  handleSelect(e) {
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
        top: 10,
        left: 0,
      },
      onSave: this.onSave,
      appointedOrganizeIds: _.get(orgRange, 'appointedOrganizeIds'),
      onClose: () => {
        this.isSelecting = false;
      },
    });
  }

  @autobind
  onSave(data) {
    if (_.isEmpty(data)) return;
    this.isSelecting = false;
    const { cell, updateEditingStatus } = this.props;
    const { value } = this.state;
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
        newData = _.uniqBy(value.concat(filterData), 'organizeId');
      } catch (err) {}
      this.setState(
        {
          value: newData,
        },
        this.handleChange,
      );
    }
  }

  @autobind
  handleMutipleEdit() {
    const { updateEditingStatus } = this.props;
    updateEditingStatus(true);
  }

  @autobind
  deleteDepartment(organizeId) {
    const { value } = this.state;
    this.setState(
      {
        value: value.filter(organize => organize.organizeId !== organizeId),
      },
      this.handleChange,
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
      editable,
      isediting,
      updateEditingStatus,
      onClick,
    } = this.props;
    const { value } = this.state;
    const single = cell.enumDefault === 0;
    const editcontent = (
      <ClickAwayable
        onClickAwayExceptions={['.dialogSelectOrgRole']}
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
          {value.map((organize, index) => (
            <span className="cellDepartment" style={{ maxWidth: style.width - 20 }}>
              <div className="flexRow">
                <div className="iconWrap" style={{ backgroundColor: '#FFAD00' }}>
                  <i className="Font14 icon-user" />
                </div>
                <div className="departmentName mLeft4 flex ellipsis">
                  {organize.organizeName ? organize.organizeName : _l('该组织角色已删除')}
                </div>
                {isediting && !(cell.required && value.length === 1) && (
                  <i
                    className="Font14 Gray_9e icon-close Hand mLeft4"
                    onClick={() => this.deleteDepartment(organize.organizeId)}
                  />
                )}
              </div>
            </span>
          ))}
          {!single && (
            <span className="addBtn" onClick={this.handleSelect}>
              <i className="icon icon-add Gray_75 Font14" />
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
            conRef={single ? this.cell : () => {}}
            hideOutline={!single}
            onClick={onClick}
            className={cx(className, { canedit: editable })}
            style={style}
            iconName="user"
            isediting={isediting}
            onIconClick={cell.enumDefault === 0 ? this.handleSelect : this.handleMutipleEdit}
          >
            {!!value && (
              <div className={cx('cellDepartments cellControl', { singleLine })}>
                {value.map((organize, index) => (
                  <span className="cellDepartment" style={{ maxWidth: style.width - 20 }}>
                    <div className="flexRow">
                      <div className="iconWrap" style={{ backgroundColor: '#FFAD00' }}>
                        <i className="Font14 icon-user" />
                      </div>
                      <div className="departmentName mLeft4 flex ellipsis">
                        {organize.organizeName ? organize.organizeName : _l('该组织角色已删除')}
                      </div>
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

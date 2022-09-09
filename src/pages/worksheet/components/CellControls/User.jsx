import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import 'dialogSelectUser';
import 'quickSelectUser';
import UserHead from 'src/pages/feed/components/userHead';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAwayable = createDecoratedComponent(withClickAway);
import EditableCellCon from '../EditableCellCon';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';

// enumDefault 单选 0 多选 1
export default class User extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    singleLine: PropTypes.bool,
    style: PropTypes.shape({}),
    rowHeight: PropTypes.number,
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    updateCell: PropTypes.func,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    projectId: PropTypes.string,
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
    if (this.cell.current && single && !this.props.isediting && nextProps.isediting) {
      this.pickUser();
    }
    if (!single && !this.props.isediting && nextProps.isediting && _.isEmpty(this.props.cell.value)) {
      setTimeout(() => {
        this.pickUser();
      }, 200);
    }
  }

  cell = React.createRef();

  renderCellUser(user, index) {
    const { isediting, projectId } = this.props;
    return (
      <div className="cellUser" key={index}>
        <div className="flexRow">
          <UserHead
            className="cellUserHead"
            projectId={projectId}
            bindBusinessCard={!_.includes(['user-workflow', 'user-publicform', 'user-api'], user.accountId)}
            user={{
              userHead: user.avatarSmall || user.avatar,
              accountId: user.accountId,
            }}
            lazy={'false'}
            size={21}
          />
          <span className="userName flex ellipsis">{user.fullname || user.name}</span>
          {isediting && (
            <i className="Font14 Gray_9e icon-close Hand mLeft4" onClick={() => this.deleteUser(user.accountId)}></i>
          )}
        </div>
      </div>
    );
  }

  @autobind
  handleChange() {
    const { cell, updateCell } = this.props;
    const { value } = this.state;
    if (cell.controlId === 'ownerid') {
      updateCell({
        value: value[0] && value[0].accountId,
      });
      return;
    }
    updateCell({
      value: JSON.stringify(value),
    });
  }

  @autobind
  pickUser(event) {
    const { worksheetId, cell, projectId, updateEditingStatus, appId } = this.props;
    const { value } = this.state;
    const target = (this.cell && this.cell.current) || (event || {}).target;
    const tabType = getTabTypeBySelectUser(cell);
    if (!target) {
      return;
    }
    if (
      tabType === 1 &&
      md.global.Account.isPortal &&
      !_.find(md.global.Account.projects, item => item.projectId === projectId)
    ) {
      alert(_l('您不是该组织成员，无法获取其成员列表，请联系组织管理员'), 3);
      return;
    }
    const filterAccountIds = value.map(item => item.accountId);
    const callback = data => {
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
          newData = _.uniqBy(this.state.value.concat(data), 'accountId');
        } catch (err) {}
        this.setState(
          {
            value: newData,
          },
          this.handleChange,
        );
      }
    };
    $(target).quickSelectUser({
      isRangeData: !!(cell.advancedSetting && cell.advancedSetting.userrange),
      filterWorksheetId: worksheetId,
      filterWorksheetControlId: cell.controlId,
      rect: target.getBoundingClientRect(),
      showQuickInvite: false,
      tabType,
      appId,
      showMoreInvite: false,
      isTask: false,
      prefixAccounts: !_.includes(filterAccountIds, md.global.Account.accountId)
        ? [
            {
              accountId: md.global.Account.accountId,
              fullname: _l('我自己'),
              avatar: md.global.Account.avatar,
            },
          ]
        : [],
      filterAccountIds,
      offset: {
        top: 0,
        left: 40,
      },
      zIndex: 10001,
      isDynamic: cell.enumDefault === 1,
      SelectUserSettings: {
        unique: cell.enumDefault === 0,
        projectId: projectId,
        filterAccountIds,
        callback,
      },
      selectCb: callback,
    });
  }

  @autobind
  handleMutipleEdit() {
    const { updateEditingStatus } = this.props;
    updateEditingStatus(true);
  }

  @autobind
  handleSingleEdit(event) {
    const { updateEditingStatus } = this.props;
    updateEditingStatus(true);
    this.pickUser(event);
  }

  @autobind
  deleteUser(accountId) {
    const { value } = this.state;
    this.setState(
      {
        value: value.filter(account => account.accountId !== accountId),
      },
      this.handleChange,
    );
  }

  render() {
    const { className, singleLine, style, rowHeight, popupContainer, cell, editable, isediting, updateEditingStatus } =
      this.props;
    const { value } = this.state;
    const single = cell.enumDefault === 0;
    const editcontent = (
      <ClickAwayable
        onClickAwayExceptions={['.selectUserBox', '#dialogBoxSelectUser']}
        onClickAway={() => updateEditingStatus(false)}
      >
        <div
          className="cellUsers cellControl cellControlUserPopup cellControlEdittingStatus"
          ref={isediting && !single ? this.cell : () => {}}
          style={{
            width: style.width,
            minHeight: rowHeight,
          }}
        >
          {value.map((user, index) => this.renderCellUser(user, index))}
          {!single && (
            <span className="addBtn" onClick={this.pickUser}>
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
        popupVisible={isediting && !single}
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
          clickAwayWrap={single}
          onClickAwayExceptions={['.selectUserBox', '#dialogBoxSelectUser']}
          onClickAway={() => isediting && updateEditingStatus(false)}
          onClick={this.props.onClick}
          className={cx(className, { canedit: editable })}
          style={style}
          iconName="people_5"
          isediting={isediting}
          onIconClick={cell.enumDefault === 0 ? this.handleSingleEdit : this.handleMutipleEdit}
        >
          {!!value && (
            <div className={cx('cellUsers cellControl', { singleLine })}>
              {value.map((user, index) => this.renderCellUser(user, index))}
            </div>
          )}
        </EditableCellCon>
      </Trigger>
    );
  }
}

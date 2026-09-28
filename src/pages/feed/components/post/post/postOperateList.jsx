import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Dropdown, Modal, Radio } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import createLinksForMessage from 'src/components/comment/utils/createLinksForMessage';
import createCalendar from 'src/components/createCalendar/load';
import addOldTask from 'src/components/createTask/addOldTask';
import createTask from 'src/components/createTask/load';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import postEnum from '../../../constants/postEnum';
import {
  addTop,
  editShareScopeSuccess,
  editVoteEndTimeSuccess,
  remove,
  removeComment,
  removeTop,
} from '../../../redux/postActions';
import editShareScope from '../postComponent/editShareScope/editShareScope';
import { useEditPostDialog } from './EditPostDialog';
import EditVoteEndTimeDialog from './EditVoteEndTimeDialog';
import './postOperateList.css';

const { POST_TYPE } = postEnum;
const POST_OPERATE_MENU_STYLE = { minWidth: 180 };

/**
 * 动态的操作列表
 */
class PostOperateList extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    postItem: PropTypes.any.isRequired,
    allowOperate: PropTypes.bool,
    children: PropTypes.node,
    open: PropTypes.bool,
    onOpenChange: PropTypes.func,
  };

  closeDropdown = () => this.props.onOpenChange?.(false);

  handleEdit = () => {
    this.closeDropdown();
    this.props.openEditPostDialog({ postItem: this.props.postItem, dispatch: this.props.dispatch });
    return;
  };

  handleRemove() {
    const { dispatch } = this.props;
    this.closeDropdown();
    const postItem = this.props.postItem;
    const isComment = !!postItem.commentID;
    let header;

    if (isComment) {
      header = _l('确认删除此条回复') /* 确认删除此条回复*/ + '?';
    } else {
      header =
        postItem.isMy || !postItem.multiProjects
          ? _l('确认要删除此动态吗？')
          : _l('移除后，该动态在动态墙中不可见，确认继续？');
    }

    Modal.confirm({
      width: 420,
      title: header,
      okText: _l('确定'),
      okButtonProps: { danger: true },
      onOk: () => {
        if (isComment) {
          const { postID, commentID } = postItem;
          dispatch(removeComment(postID, commentID));
        } else {
          dispatch(remove(postItem.postID));
        }
      },
    });
  }

  handleTop = () => {
    const { postItem, dispatch } = this.props;
    let hours = '24';

    this.closeDropdown();
    Modal.confirm({
      width: 450,
      title: _l('请选择置顶时长'),
      content: (
        <Radio.Group
          className="mTop20 Font14"
          defaultValue={hours}
          onChange={event => {
            hours = event.target.value;
          }}
        >
          <Radio value="24">24{_l('小时')}</Radio>
          <Radio value="48">48{_l('小时')}</Radio>
          <Radio value="72">72{_l('小时')}</Radio>
          <Radio value="">{_l('不限时长')}</Radio>
        </Radio.Group>
      ),
      okText: _l('确定'),
      onOk: () => {
        dispatch(
          addTop({
            postId: postItem.postID,
            hours,
          }),
        );
      },
    });
  };

  handleRemoveTop = () => {
    const { postItem, dispatch } = this.props;
    dispatch(removeTop({ postId: postItem.postID }));
    this.closeDropdown();
  };

  handleCreateNewCalender = () => {
    const postItem = this.props.postItem;
    this.closeDropdown();
    const message = createLinksForMessage({
      message: postItem.message,
      rUserList: postItem.rUserList,
      rGroupList: postItem.rGroupList,
      categories: postItem.categories,
      noLink: true,
      doNotEscapeHTML: true,
    });
    createCalendar({
      MemberArray: _.chain(postItem.rUserList)
        .filter(a => a)
        .map(a => ({ accountId: a.aid, avatar: a.avatar || a.userMiddleHead, fullname: a.name }))
        .concat(
          _.chain(postItem.comments)
            .map(c => c.user)
            .filter(a => a)
            .map(a => ({ accountId: a.accountId, avatar: a.userMiddleHead, fullname: a.userName }))
            .value(),
        )
        .concat(
          _.chain(postItem.comments)
            .map(c =>
              _.chain(c.rUserList)
                .filter(a => a)
                .map(a => ({ accountId: a.aid, avatar: a.avatar || a.userMiddleHead, fullname: a.name }))
                .value(),
            )
            .flatten()
            .value(),
        )
        .uniq('accountId')
        .filter(a => a.accountId)
        .value(),
      Message: message.replace(/<[^>]+>/g, ''),
    });
  };

  handleCreateNewTask(param) {
    const postItem = _.clone(this.props.postItem);
    this.closeDropdown();
    const message = createLinksForMessage({
      message: postItem.message,
      rUserList: postItem.rUserList,
      rGroupList: postItem.rGroupList,
      categories: postItem.categories,
      noLink: true,
      doNotEscapeHTML: true,
    });

    if (param === 1) {
      createTask({
        MemberArray: _.chain(postItem.rUserList)
          .uniq('aid')
          .map(a => ({ accountId: a.aid, avatar: a.avatar, fullname: a.name }))
          .value(),
        Description: message.replace(/<[^>]+>/g, ''),
        PostID: postItem.postID,
        isFromPost: true,
        ProjectID: postItem.projectIds && postItem.projectIds.length === 1 ? postItem.projectIds[0] : null,
      });
    } else if (param === 2) {
      addOldTask({
        MemberArray: _.chain(postItem.rUserList)
          .uniq('aid')
          .map(a => ({ accountId: a.aid, avatar: a.avatar, fullname: a.name }))
          .value(),
        Description: message.replace(/<[^>]+>/g, ''),
        PostID: postItem.postID,
      });
    }
  }

  handleEditVoteEndTime = () => {
    const { dispatch } = this.props;
    this.closeDropdown();
    const postItem = _.clone(this.props.postItem);
    EditVoteEndTimeDialog.show(postItem, deadline => {
      dispatch(editVoteEndTimeSuccess({ postId: postItem.postID, deadline }));
    });
  };

  handleEditScope() {
    const { dispatch } = this.props;
    this.closeDropdown();
    const postItem = _.clone(this.props.postItem);
    editShareScope(postItem, scope => {
      dispatch(editShareScopeSuccess({ postId: postItem.postID, scope }));
    });
  }

  renderDropdown(items) {
    const { children, onOpenChange, open } = this.props;

    return (
      <Dropdown
        trigger={['click']}
        open={open}
        onOpenChange={onOpenChange}
        placement="bottomRight"
        menu={{ style: POST_OPERATE_MENU_STYLE, items }}
      >
        {children}
      </Dropdown>
    );
  }

  render() {
    const { open, postItem } = this.props;

    if (!open) {
      return this.renderDropdown([]);
    }

    const canEdit = postItem.isMy;
    const canRemove = this.props.allowOperate;
    const isTop = !!postItem.isFeedtop;
    const canTop = !!postItem.feedtop;
    let taskOption;

    if (postItem.postType != POST_TYPE.video && postItem.postType != POST_TYPE.vote && postItem.postType != '5') {
      if (!postItem.source || postItem.source.id != md.global.APPInfo.taskAppID) {
        taskOption = {
          key: 'task',
          label: _l('加入任务'),
          children: [
            {
              key: 'create-task',
              label: _l('创建为新任务'),
              onClick: () => this.handleCreateNewTask(1),
            },
            {
              key: 'add-to-task',
              label: _l('加入已有任务'),
              onClick: () => this.handleCreateNewTask(2),
            },
          ],
        };
      } else {
        taskOption = {
          key: 'view-task',
          label: (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={pathCompletion('/' + postItem.source.appUrl + '?appDetailID=' + postItem.source.detailID)}
            >
              {_l('查看任务')}
            </a>
          ),
        };
      }
    }

    let calendarOption;

    if (postItem.postType != '7' && postItem.postType != '5') {
      if (postItem.source == undefined || postItem.source.id !== md.global.APPInfo.calendarAppID) {
        calendarOption = {
          key: 'create-calendar',
          label: _l('加入日程'),
          onClick: this.handleCreateNewCalender,
        };
      } else if (postItem.source != undefined) {
        calendarOption = {
          key: 'view-calendar',
          label: (
            <a target="_blank" rel="noopener noreferrer" href={postItem.source.detailUrl}>
              {_l('查看日程')}
            </a>
          ),
        };
      }
    }

    const items = [
      canEdit && {
        key: 'edit',
        label: _l('编辑'),
        onClick: this.handleEdit,
      },
      (postItem.isMy || (postItem.projectIds.length === 1 && this.props.allowOperate)) && {
        key: 'edit-scope',
        label: _l('修改可见范围'),
        onClick: () => this.handleEditScope(),
      },
      postItem.isMy &&
        postItem.postType === '7' &&
        !postItem.isPostVote && {
          key: 'edit-vote-end-time',
          label: _l('修改截止日期'),
          onClick: this.handleEditVoteEndTime,
        },
      canTop && {
        key: isTop ? 'remove-top' : 'add-top',
        label: isTop ? _l('取消此条置顶') : _l('设为置顶动态'),
        onClick: isTop ? this.handleRemoveTop : this.handleTop,
      },
      taskOption,
      calendarOption,
      canRemove && {
        key: 'remove',
        danger: true,
        label: postItem.isMy || !postItem.multiProjects ? _l('删除') : _l('从本组织移除'),
        onClick: () => this.handleRemove(),
      },
    ].filter(Boolean);

    return this.renderDropdown(
      items.length ? items : [{ key: 'no-permission', disabled: true, label: _l('无操作权限') }],
    );
  }
}

export default withOpeners(PostOperateList, {
  openEditPostDialog: useEditPostDialog,
});

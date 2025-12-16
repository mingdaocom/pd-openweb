import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { dialogKeyboardShortcuts } from 'src/pages/chat/components/KeyboardShortcuts';
import AddressBook from 'src/pages/chat/lib/addressBook';
import * as actions from 'src/pages/chat/redux/actions';
import Constant from 'src/pages/chat/utils/constant';
import { createDiscussion } from 'src/pages/chat/utils/group';
import * as socket from 'src/pages/chat/utils/socket';
import GlobalSearch from 'src/pages/PageHeader/components/GlobalSearch/index';

const RenderAddressBook = props => {
  const { showAddressBook } = props;

  useEffect(() => {
    !md.global.Account.isPortal && bindShortcut();
  }, []);

  const bindShortcut = () => {
    const callDialog = _.debounce(which => {
      switch (which) {
        case 119:
          document.querySelector('.toolbarWrap .sessionList').click();
          break;
        case 113:
          createDiscussion(undefined, (result, isGroup) => {
            if (!isGroup) {
              const { accountId, avatar, fullname } = result[0];
              const msg = {
                logo: avatar,
                uname: fullname,
                sysType: 1,
              };
              props.addUserSession(accountId, msg);
            }
          });
          break;
        case 101:
        case 69:
          props.setShowAddressBook(true);
          break;
        case 109:
        case 77:
          document.querySelector('.ChatList-wrapper .mingo').click();
          break;
        case 70:
        case 102:
          // 全局搜索
          let path = location.pathname.split('/');
          GlobalSearch({
            match: {
              params: {
                appId:
                  location.pathname.startsWith('/app/') && path.length > 2 && path[2].length > 20 ? path[2] : undefined,
              },
            },
            onClose: () => {},
          });
          break;
        case 75:
        case 107:
          // 键盘快捷键
          let ele = $('.keyboardShortcutsDialog');
          if (!ele.length) {
            dialogKeyboardShortcuts();
          }

          break;
        default:
          break;
      }
    }, 200);

    $(document).on('keypress', function (e) {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.cmdKey || e.metaKey) return;
      var tag = e.target.tagName && e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || $(e.target).is('[contenteditable]')) return;
      callDialog(e.which);
    });
  };

  const handleAddressBook = data => {
    const { accountId, groupId, type } = data;
    if (accountId) {
      props.addUserSession(accountId, {
        msg: { con: '' },
        sysType: 1,
      });
      return;
    }
    if (groupId) {
      props.addGroupSession(groupId);
      return;
    }
    if (type === 'file-transfer') {
      const { name } = Constant.FILE_TRANSFER;
      const message = {
        uname: name,
        sysType: 1,
      };
      props.addUserSession(type, message);
    } else {
      const message = {
        count: 0,
        id: type,
        type,
        dtype: type,
      };
      switch (type) {
        case 'post':
          message.type = Constant.SESSIONTYPE_POST;
          break;
        case 'system':
          message.type = Constant.SESSIONTYPE_SYSTEM;
          break;
        case 'calendar':
          message.type = Constant.SESSIONTYPE_CALENDAR;
          break;
        case 'task':
          message.type = Constant.SESSIONTYPE_TASK;
          break;
        case 'knowledge':
          message.type = Constant.SESSIONTYPE_KNOWLEDGE;
          break;
        case 'hr':
          message.type = Constant.SESSIONTYPE_HR;
          break;
        case 'worksheet':
          message.type = Constant.SESSIONTYPE_WORKSHEET;
          break;
        case 'workflow':
          message.type = Constant.SESSIONTYPE_WORKFLOW;
          break;
        default:
          break;
      }
      socket.Contact.recordAction({
        id: message,
        type: 3,
      });
      socket.Contact.clearUnread({
        type: message.type,
        value: type,
      }).then(() => {
        props.updateSessionList({
          id: type,
          clearCount: 0,
        });
      });
      props.addSysSession(type, message);
    }
  };

  return (
    <AddressBook
      showAddressBook={showAddressBook}
      closeDialog={data => {
        props.setShowAddressBook(false);
        if (data && !data.target) {
          handleAddressBook(data);
        }
      }}
    />
  );
};

export default connect(
  state => ({
    showAddressBook: state.chat.showAddressBook,
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, [
        'addUserSession',
        'setShowAddressBook',
        'addGroupSession',
        'updateSessionList',
        'addSysSession',
      ]),
      dispatch,
    ),
)(RenderAddressBook);

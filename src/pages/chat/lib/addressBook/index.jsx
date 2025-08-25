import React from 'react';
import shallowEqual from 'react-redux/lib/utils/shallowEqual';
import { default as MingDialog } from 'ming-ui/components/Dialog';
import Icon from 'ming-ui/components/Icon';
import { config } from './config';
import { gatherProjects, SIDER_BAR_LIST, TYPES } from './constants';
import Apps from './containers/Apps';
import Contacts from './containers/Contacts';
import Friends from './containers/Friends';
import Groups from './containers/Groups';
import NewFriends from './containers/NewFriends';
import Others from './containers/Others';
import ProjectContacts from './containers/ProjectContacts';
import SiderBar from './containers/SiderBar';
import './style.less';

const Dialog = MingDialog.DialogBase;

class AddressBook extends React.Component {
  constructor(props) {
    super();

    this.state = {
      type: props.type,
      projectId: null,
      list: SIDER_BAR_LIST.concat(gatherProjects()),
    };

    this.updateHighlightTab = this.updateHighlightTab.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(nextState, this.state);
  }

  renderContent() {
    const { type, projectId } = this.state;
    switch (type) {
      case TYPES.NEW_FRIENDS:
        return <NewFriends />;
      case TYPES.ALL_GROUPS:
      case TYPES.PROJECT_GROUPS:
        return <Groups projectId={projectId} />;
      case TYPES.ALL_CONTACTS:
        return <Contacts />;
      case TYPES.FRIENDS:
        return <Friends />;
      case TYPES.OTHERS:
        return <Others />;
      case TYPES.PROJECT_CONTACTS:
      case TYPES.CONTACTS:
        return <ProjectContacts projectId={projectId} />;
      case TYPES.INBOX:
        return <Apps />;
      default:
        break;
    }
  }

  updateHighlightTab(type, projectId) {
    this.setState({
      type,
      projectId,
    });
  }

  render() {
    const { type, projectId, list } = this.state;
    return (
      <div className="contacts-dialog">
        <SiderBar {...{ type, projectId, list }} updateHighlightTab={this.updateHighlightTab} />
        {this.renderContent()}
      </div>
    );
  }
}

export default function AddressBookDialog(props) {
  const dialogProps = {
    width: 900,
    visible: props.showAddressBook,
    anim: false,
    type: 'scroll',
    className: 'overflowHidden Relative',
    onClose: props.closeDialog,
  };

  config.callback = props.closeDialog;

  if (!props.showAddressBook) return null;
  return (
    <Dialog {...dialogProps}>
      <Icon
        icon={'delete'}
        className="contacts-dialog-close Gray_6 Hand"
        onClick={() => {
          props.closeDialog();
        }}
      />
      <AddressBook {...{ type: props.showNewFriends ? TYPES.NEW_FRIENDS : TYPES.ALL_CONTACTS }} />
    </Dialog>
  );
}

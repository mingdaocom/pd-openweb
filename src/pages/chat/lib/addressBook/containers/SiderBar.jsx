import React from 'react';
import PropTypes from 'prop-types';

import ScrollView from 'ming-ui/components/ScrollView';
import Icon from 'ming-ui/components/Icon';
import Button from 'ming-ui/components/Button';
import addFriends from 'src/components/addFriends';
import SiderBarTabList from '../components/SiderBarTabList';
import SiderBarTabItem from '../components/SiderBarTabItem';
import _ from 'lodash';

export default class SideBar extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    projectId: PropTypes.string,

    list: PropTypes.arrayOf(PropTypes.object),

    updateHighlightTab: PropTypes.func.isRequired,
  };

  getOpenState(list, projectId, type) {
    return !!_.find(list, item => {
      if (projectId) {
        return item.projectId === projectId && item.type === type;
      } else {
        return item.type === type;
      }
    });
  }

  renderItem(item, index) {
    const { type, projectId, updateHighlightTab } = this.props;
    const isProject = !!item.projectId;
    const isActive = isProject ? type === item.type && projectId === item.projectId : type === item.type;
    const props = {
      ...item,
      key: index,
      isActive,
      clickHandler: () => {
        updateHighlightTab(item.type, item.projectId);
      },
    };
    return <SiderBarTabItem {...props} />;
  }

  renderTabs(item, index) {
    const { type, projectId } = this.props;
    if (item.dividor) {
      return <div className="dividor" key={index} />;
    } else {
      if (item.list) {
        const props = {
          key: index,
          name: item.name,
          projectId: item.projectId,
          isOpen: this.getOpenState(item.list, projectId, type),
        };
        return (
          <SiderBarTabList {...props}>
            {_.map(item.list, (childItem, childIndex) => {
              return this.renderItem(childItem, childIndex);
            })}
          </SiderBarTabList>
        );
      } else {
        return this.renderItem(item, index);
      }
    }
  }

  render() {
    const { list } = this.props;
    return (
      <div className="contacts-sidebar">
        <div className="Font20 pLeft24 mTop20 mBottom12">{_l('通讯录')}</div>
        <div className="pLeft24 pRight24 mBottom12 Relative">
          <Button
            type="primary"
            style={{ width: '100%' }}
            className="invite-btn"
            onClick={() => {
              addFriends({ selectProject: true });
            }}
          >
            <Icon icon="plus" className="mRight5 TxtMiddle" />
            <span className="TxtMiddle">{_l('添加联系人')}</span>
          </Button>
        </div>
        <div className="contacts-tabs">
          <ScrollView>
            {_.map(list, (item, index) => {
              return this.renderTabs(item, index);
            })}
          </ScrollView>
        </div>
      </div>
    );
  }
}

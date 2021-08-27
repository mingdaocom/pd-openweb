import React from 'react';

import ScrollView from 'ming-ui/components/ScrollView';
import LoadDiv from 'ming-ui/components/LoadDiv';

import ContactItem from './ContactItem';

export default class ProjectContactList extends React.Component {
  renderSingleList(listProps) {
    const { departmentName, departmentId, isOpen, isLoading, userCount, list } = listProps;

    const clickHandler = (event) => {
      if (isOpen || list.length !== 0) {
        this.props.update(departmentId, {
          isOpen: !isOpen,
        });
      } else {
        this.props.fetch(departmentId);
      }
    };
    return (
      <div className="list-wrapper" key={departmentId}>
        <div className="list-packet Gray_75 Font12 clearfix Hand" onClick={clickHandler}>
          <span className="list-packet-name overflow_ellipsis TxtBottom" title={departmentName}>{departmentName}</span>
          {isOpen ? <span className="icon-arrow-up-border mTop1 Right" /> : <span className="icon-arrow-down-border mTop1 Right" />}
        </div>
        {isOpen ? (
          <div>
            {isLoading ? (
              <LoadDiv />
            ) : list && list.length ? (
              _.map(list, item => (
                <ContactItem
                  {...item}
                  key={item.accountId}
                  isSelected={item.accountId === this.props.selectedAccountId}
                  itemClickHandler={this.props.itemClickHandler}
                />
              ))
            ) : (
              <div className="Gray_bd mTop5 mBottom5 TxtCenter">{_l('部门暂无成员')}</div>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  renderListContent() {
    const { list, isLoading } = this.props;
    const keys = _.keys(list);
    if (!keys.length && isLoading) return <LoadDiv className="mTop10" />;
    return (
      <React.Fragment>
        {_.map(keys, (key) => {
          const props = list[key];
          return this.renderSingleList(props);
        })}
        {isLoading ? <LoadDiv /> : null}
      </React.Fragment>
    );
  }

  render() {
    return <ScrollView>{this.renderListContent()}</ScrollView>;
  }
}

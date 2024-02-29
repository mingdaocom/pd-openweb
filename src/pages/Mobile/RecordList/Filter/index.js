import React, { Component } from 'react';
import cx from 'classnames';
import { List, Flex, Modal } from 'antd-mobile';
import { Icon } from 'ming-ui';
import { fieldCanSort, getSortData } from 'src/pages/worksheet/util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import './index.less';

//   <FilterModal
//     visible={this.state.filterVisible}
//     currentView={currentView}
//     controls={worksheetControls}
//     onHideFilter={() => {
//       this.setState({ filterVisible: false });
//     }}
//     onSave={(sortCid, sortType) => {
//       this.props.dispatch(
//         actions.updateCurrentView({
//           currentView,
//           sortCid,
//           sortType,
//         }),
//       );
//     }}
//   />

const defaultSortCid = 'ctime';
const defaultSortType = 1;

export default class extends Component {
  constructor(props) {
    super(props);
    const { controls } = props;
    const newControls = controls.filter(item => fieldCanSort(item.type));
    this.state = {
      controls: newControls.map(item => {
        item.icon = getIconByType(item.type).replace(/^icon-/gi, '');
        return item;
      }),
      select: null,
      temporarySortType: null,
    };
  }
  renderList() {
    const { controls } = this.state;
    const { currentView } = this.props;
    const { sortCid, sortType } = currentView;
    const cid = sortCid || defaultSortCid;
    return (
      <List
        renderHeader={() => (
          <Flex className="filterHeader">
            <Flex.Item
              className="left"
              onClick={() => {
                this.props.onSave(defaultSortCid, defaultSortType);
                this.props.onHideFilter();
              }}
            >
              {_l('重置')}
            </Flex.Item>
            <Flex.Item className="title">{_l('排序')}</Flex.Item>
            <Flex.Item className="right" onClick={this.props.onHideFilter}>
              {_l('关闭')}
            </Flex.Item>
          </Flex>
        )}
        className="filterModal popup-list"
      >
        <div className="filterList">
          {controls.map((item, index) => (
            <List.Item
              key={item.controlId}
              className={cx('filterItem', { active: item.controlId === cid })}
              onClick={() => {
                this.setState({
                  select: item,
                });
              }}
            >
              <Flex>
                <Icon icon={item.icon} />
                <span className="name">{item.controlName}</span>
                {item.controlId === cid ? (
                  <span className="sortType">{getSortData(item).filter(n => n.value === sortType)[0].text}</span>
                ) : null}
                <Icon icon="arrow-right-border" />
              </Flex>
            </List.Item>
          ))}
        </div>
      </List>
    );
  }
  renderSortType() {
    const { select, temporarySortType } = this.state;
    const sort = getSortData(select);
    const { currentView } = this.props;
    const { sortCid, sortType } = currentView;
    const isCurrentSelect = temporarySortType ? true : select.controlId === (sortCid || defaultSortCid);
    const newSortType = temporarySortType || sortType || defaultSortType;
    return (
      <List
        renderHeader={() => (
          <Flex className="filterHeader">
            <Flex.Item
              className="left"
              onClick={() => {
                this.setState({
                  select: null,
                  temporarySortType: null,
                });
              }}
            >
              <Icon icon="arrow-left-border" />
              <span>{_l('返回')}</span>
            </Flex.Item>
            <Flex.Item className="title">{_l('选择排序规则')}</Flex.Item>
            <Flex.Item
              className={cx('right', {
                hidden: !temporarySortType && select.controlId !== (sortCid || defaultSortCid),
              })}
              onClick={() => {
                this.props.onSave(select.controlId, temporarySortType);
                this.props.onHideFilter();
              }}
            >
              {_l('确认')}
            </Flex.Item>
          </Flex>
        )}
        className="filterModal popup-list"
      >
        <div className="filterList">
          {sort.map(item => (
            <List.Item
              key={item.value}
              className={cx('filterItem', { active: isCurrentSelect && item.value === newSortType })}
              onClick={() => {
                this.setState({
                  temporarySortType: item.value,
                });
              }}
            >
              <Flex>
                <span className="name">{item.text}</span>
                {isCurrentSelect && item.value === newSortType ? <Icon icon="ok" /> : null}
              </Flex>
            </List.Item>
          ))}
        </div>
      </List>
    );
  }
  render() {
    const { select } = this.state;
    const { visible, onHideFilter } = this.props;
    return (
      <Modal popup visible={visible} onClose={onHideFilter} animationType="slide-up">
        {select ? this.renderSortType() : this.renderList()}
      </Modal>
    );
  }
}

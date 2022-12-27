import React, { Component } from 'react';
import cx from 'classnames';
import { Icon, ScrollView } from 'ming-ui';
import { Modal, Button, WingBlank, Checkbox } from 'antd-mobile';
import organizeAjax from 'src/api/organize.js';
import './index.less';
import _ from 'lodash';

const { CheckboxItem } = Checkbox;

export default class SelectOrgRole extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orgRoleList: [],
      isLoading: false,
      isMore: false,
    };
  }
  componentDidMount() {
    this.getData();
  }
  getData = () => {
    const { projectId } = this.props;
    let { keywords, pageIndex = 1, orgRoleList = [] } = this.state;
    organizeAjax.getOrganizes({
      projectId,
      keywords,
      pageIndex,
      pageSize: 20,
    }).then(res => {
      this.setState({
        orgRoleList: pageIndex === 1 ? res.list : orgRoleList.concat(res.list),
        pageIndex: pageIndex + 1,
        isMore: res.list.length >= 20 ? true : false,
        isLoading: false,
      });
    });
  };
  handleSearch = () => {
    this.setState(
      {
        pageIndex: 1,
      },
      () => {
        this.getData();
      },
    );
  };
  handleSave = () => {
    const { selectedOrgRole } = this.state;
    this.props.onSave(selectedOrgRole);
    this.props.onClose();
  };
  renderSearch() {
    const { keywords } = this.state;
    return (
      <div className="searchWrapper">
        <Icon icon="h5_search" />
        <form
          action="#"
          className="flex"
          onSubmit={e => {
            e.preventDefault();
          }}
        >
          <input
            type="text"
            placeholder={_l('搜索组织角色')}
            className="Font14"
            value={keywords}
            onChange={e => {
              this.setState({ keywords: e.target.value });
            }}
            onKeyDown={event => {
              event.which === 13 && this.handleSearch();
            }}
          />
        </form>
        {keywords ? (
          <Icon
            icon="workflow_cancel"
            onClick={() => {
              this.setState(
                {
                  keywords: '',
                },
                this.handleSearch,
              );
            }}
          />
        ) : null}
      </div>
    );
  }
  onScrollEnd = () => {
    let { isMore, isLoading } = this.state;
    if (!isMore || isLoading) return;
    this.getData();
  };
  renderSelected() {
    const { selectedOrgRole = [] } = this.state;
    return (
      <div className={cx('selectedWrapper', { hide: _.isEmpty(selectedOrgRole) })}>
        <ScrollView style={{ maxHeight: 92, minHeight: 46 }}>
          {selectedOrgRole.map(item => (
            <span className="selectedItem" key={item.organizeId}>
              <span>{item.organizeName}</span>
              <Icon
                icon="close"
                className="Gray_9e Font15"
                onClick={() => {
                  const { selectedOrgRole } = this.state;
                  this.setState({
                    selectedOrgRole: selectedOrgRole.filter(it => it.organizeId !== item.organizeId),
                  });
                }}
              />
            </span>
          ))}
        </ScrollView>
      </div>
    );
  }
  checkOrgRoles = item => {
    const { unique } = this.props;
    const { selectedOrgRole = [] } = this.state;
    const selectedOrgRoleIds = selectedOrgRole.map(item => item.organizeId);
    let isSelected = _.includes(selectedOrgRoleIds, item.organizeId);
    let copySelectedOrgRole = [...selectedOrgRole];
    if (!isSelected) {
      !unique && copySelectedOrgRole.push(item);
      this.setState({ selectedOrgRole: !unique ? copySelectedOrgRole : [item] });
    } else {
      this.setState({ selectedOrgRole: selectedOrgRole.filter(it => it.organizeId !== item.organizeId) });
    }
  };
  renderList = () => {
    const { orgRoleList = [], selectedOrgRole = [] } = this.state;
    const selectedOrgRoleIds = selectedOrgRole.map(item => item.organizeId);
    return (
      <ScrollView className="flex orgRolelist" onScrollEnd={this.onScrollEnd}>
        {orgRoleList.map(item => (
          <div className="flexRow orgRoleItem" key={item.organizeId} onClick={() => this.checkOrgRoles(item)}>
            <CheckboxItem
              checked={_.includes(selectedOrgRoleIds, item.organizeId)}
              onChange={() => this.checkOrgRoles(item)}
            ></CheckboxItem>
            <div className="flex organizeName ellipsis Gray">{item.organizeName}</div>
          </div>
        ))}
      </ScrollView>
    );
  };
  renderContent = () => {
    return (
      <div className="flex flexColumn">
        {this.renderSearch()}
        {this.renderSelected()}
        {this.renderList()}
      </div>
    );
  };
  render() {
    const { visible, onClose } = this.props;
    return (
      <Modal popup visible={visible} onClose={onClose} animationType="slide-up" className="h100">
        <div className="selectUserModal flexColumn h100">
          {this.renderContent()}
          <div className="btnsWrapper flexRow">
            <WingBlank className="flex" size="sm">
              <Button className="Gray_75 bold Font14" onClick={onClose}>
                {_l('取消')}
              </Button>
            </WingBlank>
            <WingBlank className="flex" size="sm">
              <Button className="bold Font14" onClick={this.handleSave} type="primary">
                {_l('确定')}
              </Button>
            </WingBlank>
          </div>
        </div>
      </Modal>
    );
  }
}

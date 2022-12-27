import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, Checkbox, Dialog, Input, ScrollView, Switch, LoadDiv } from 'ming-ui';
import { Button } from 'antd';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import SvgIcon from 'src/components/SvgIcon';
import Trigger from 'rc-trigger';
import privateSource from 'src/api/privateSource';
import appManagement from 'src/api/appManagement';
import './index.less';
import _ from 'lodash';

const COLORS = ['#e91e63', '#ff9800', '#4caf50', '#00bcd4', '#2196f3', '#9c27b0', '#3f51b5', '#455a64'];

const SortableItem = SortableElement(({ item, ...other }) => {
  const { onChangeStatus, onEdit, onDelete } = other;
  return (
    <div className="flexRow sourcesItem" key={item.id}>
      <div className="valignWrapper">
        <Icon className="Font17 Gray_9e pointer" icon="drag" />
        <Switch className="mLeft10" checked={item.status === 1} onClick={value => { onChangeStatus(item.id, value) }}/>
      </div>
      <div>
        <SvgIcon size="22" fill={item.color} url={item.iconUrl}/>
      </div>
      <div>{item.name}</div>
      <div className="url ellipsis">{item.linkParams ? item.linkParams.url : '-'}</div>
      <div>
        <span className={item.predefined ? 'Gray_9e' : 'edit pointer'} onClick={() => { onEdit(item.id) }}>{_l('编辑')}</span>
        {!item.predefined && <span className="edit pointer mLeft20" onClick={() => { onDelete(item.id) }}>{_l('删除')}</span>}
      </div>
    </div>
  );
});

const SortableList = SortableContainer(({ sourcesList, ...other }) => {
  return (
    <div>
      {sourcesList.map((item, index) => (
        <SortableItem key={item.id} index={index} item={item} {...other} />
      ))}
    </div>
  );
});

export default class SourceListSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      sourcesList: [],
      listLoading: false,
      creatreItem: {},
      systemIcon: [],
    };
  }
  componentDidMount() {
    this.getSources();
    appManagement.getIcon().then(({ systemIcon }) => {
      this.setState({
        systemIcon,
        creatreItem: {
          color: COLORS[0],
          icon: systemIcon[0].fileName
        }
      });
    });
  }
  getSources() {
    this.setState({ listLoading: true });
    privateSource.getSources().then(result => {
      this.setState({
        listLoading: false,
        sourcesList: result,
      });
    });
  }
  handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const { sourcesList } = this.state;
    const newSourcesList = arrayMove(sourcesList, oldIndex, newIndex);
    const result = {};
    this.setState({
      sourcesList: newSourcesList,
    });
    newSourcesList.forEach((item, index) => {
      result[item.id] = index;
    });
    privateSource.editSourceSort({
      sortMap: result,
    }).then(result => {});
  }
  handleChangeStatus = (id, value) => {
    const { sourcesList } = this.state;
    const status = value ? 2 : 1;
    privateSource.editSourceStatus({
      id,
      status,
    }).then(result => {
      if (result) {
        this.setState({
          sourcesList: sourcesList.map(item => {
            if (item.id === id) {
              item.status = status;
            }
            return item;
          })
        });
      }
    });
  }
  handleEdit = (id) => {
    const { sourcesList } = this.state;
    const sources = _.find(sourcesList, { id });
    this.setState({
      dialogVisible: true,
      creatreItem: {
        id,
        name: sources.name,
        color: sources.color,
        icon: sources.icon,
        url: sources.linkParams.url,
      }
    });
  }
  handleDelete = (id) => {
    const { sourcesList } = this.state;
    Dialog.confirm({
      title: _l('您确定要删除 ?'),
      description: _l('删除后无法恢复'),
      onOk: () => {
        privateSource.removeSource({
          id,
        }).then(result => {
          if (result) {
            alert(_l('删除成功'));
            this.setState({
              sourcesList: sourcesList.filter(item => item.id !== id)
            });
          }
        });
      }
    });
  }
  handleSave = () => {
    const { creatreItem, systemIcon } = this.state;

    if (_.isEmpty(creatreItem.name)) {
      alert(_l('请输入名称'));
      return;
    }
    if (_.isEmpty(creatreItem.url)) {
      alert(_l('跳转链接'));
      return;
    }

    const base = {
      name: creatreItem.name,
      color: creatreItem.color,
      icon: creatreItem.icon,
      linkParams: {
        url: creatreItem.url,
      }
    }

    if (creatreItem.id) {
      privateSource.editSource({
        id: creatreItem.id,
        ...base,
      }).then(result => {
        if (result) {
          this.setState({
            creatreItem: {},
            dialogVisible: false,
            sourcesList: this.state.sourcesList.map(item => {
              if (item.id === creatreItem.id) {
                return {
                  ...item,
                  ...base,
                  iconUrl: _.find(systemIcon, { fileName: base.icon }).iconUrl
                }
              }
              return item;
            })
          });
        }
      });
    } else {
      privateSource.addSource({
        ...base,
      }).then(result => {
        if (result) {
          this.setState({ dialogVisible: false, creatreItem: {} });
          this.getSources();
        }
      });
    }
  }
  shouldCancelStart = ({ target }) => {
    return !target.classList.contains('icon-drag');
  }
  renderDialog() {
    const { dialogVisible, creatreItem, systemIcon } = this.state;
    return (
      <Dialog
        className="createSourcesDialog"
        visible={dialogVisible}
        title={creatreItem.id ? _l('编辑资源') : _l('添加资源')}
        width={520}
        okText={_l('保存')}
        onOk={this.handleSave}
        onCancel={() => this.setState({ dialogVisible: false })}
      >
        <div className="mBottom10 mTop15 Font14">{_l('名称')}</div>
        <div className="flexRow valignWrapper">
          <Input
            className="w100"
            value={creatreItem.name}
            onChange={value => {
              this.setState({ creatreItem: Object.assign({}, creatreItem, { name: value }) });
            }}
          />
        </div>
        <div className="mBottom10 mTop15 Font14">{_l('跳转链接')}</div>
        <div className="flexRow valignWrapper">
          <Input
            className="w100"
            value={creatreItem.url}
            onChange={value => {
              this.setState({ creatreItem: Object.assign({}, creatreItem, { url: value }) });
            }}
          />
        </div>
        <div className="mBottom10 mTop15 Font14">{_l('设计图标')}</div>
        <div className="flexRow valignWrapper">
          {
            COLORS.map((item, index) => (
              <div
                key={index}
                style={{ backgroundColor: item }}
                className={cx('sourcesColor flexRow valignWrapper', { active: item == creatreItem.color })}
                onClick={() => {
                  this.setState({ creatreItem: Object.assign({}, creatreItem, { color: item }) });
                }}
              >
                {item == creatreItem.color && <Icon className="Font17 White" icon="done" />}
              </div>
            ))
          }
        </div>
        <div className="flexRow valignWrapper mTop15 sourcesIconWrapper">
          {
            systemIcon.map((item, index) => (
              <div
                key={index}
                style={{ backgroundColor: creatreItem.icon == item.fileName ? creatreItem.color : null }}
                className={cx('sourcesIcon flexRow valignWrapper pointer')}
                onClick={() => {
                  this.setState({ creatreItem: Object.assign({}, creatreItem, { icon: item.fileName }) });
                }}
              >
                <SvgIcon url={item.iconUrl} fill={creatreItem.icon == item.fileName ? '#fff' : '#9e9e9e'} />
              </div>
            ))
          }
        </div>
      </Dialog>
    );
  }
  render() {
    const { sourcesList, listLoading } = this.state;
    return (
      <Fragment>
        <div className="sourceListContent flex flexColumn h100">
          <div>
            <Button type="primary" onClick={() => { this.setState({ dialogVisible: true }) }}>
              <Icon icon="add" />
              {_l('添加资源')}
            </Button>
          </div>
          <div className="flexRow titleWrapper">
            <div className="title showItem">{_l('状态')}</div>
            <div className="title">{_l('图标')}</div>
            <div className="title">{_l('名称')}</div>
            <div className="title url">{_l('跳转地址')}</div>
            <div className="title">{_l('操作')}</div>
          </div>
          <ScrollView className="flex">
            {listLoading ? (
              <div className="mTop5"><LoadDiv size="small" /></div>
            ) : (
              <SortableList
                axis="xy"
                helperClass="sourcesSortableCard"
                sourcesList={sourcesList}
                onSortEnd={this.handleSortEnd}
                onChangeStatus={this.handleChangeStatus}
                onEdit={this.handleEdit}
                onDelete={this.handleDelete}
                shouldCancelStart={this.shouldCancelStart}
              />
            )}
          </ScrollView>
        </div>
        {this.renderDialog()}
      </Fragment>
    );
  }
}

import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { array, bool, func, string } from 'prop-types';
import { Checkbox, Dialog, Icon, LoadDiv, ScrollView } from 'ming-ui';
import process from '../../api/process';
import './index.less';

export default class SelectWorkflow extends Component {
  static propTypes = {
    visible: bool,
    processId: string,
    relationId: string,
    filterIds: array,
    onSave: func,
    onClose: func,
  };

  static defaultProps = {
    visible: false,
    processId: '',
    relationId: '',
    filterIds: [],
    onSave: () => {},
    onClose: () => {},
  };

  state = {
    data: null,
    keywords: '',
    selectItems: [],
  };

  componentDidMount() {
    const { visible } = this.props;

    if (visible) {
      this.getData();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.getData();
    }
  }

  getData() {
    const { processId } = this.props;

    process.getTriggerProcessList({ processId }).then(data => {
      this.setState({ data });
    });
  }

  /**
   * 渲染列表
   */
  renderList() {
    const { filterIds } = this.props;
    const { keywords } = this.state;
    let data = _.cloneDeep(this.state.data);

    if (filterIds.length) {
      data = data.map(item => {
        item.processList = item.processList.filter(flow => !_.includes(filterIds, flow.id));
        return item;
      });
    }

    if (keywords) {
      data = data.map(item => {
        item.processList = item.processList.filter(flow =>
          _.includes(flow.name.toLocaleLowerCase(), keywords.toLocaleLowerCase()),
        );
        return item;
      });
    }

    _.remove(data, o => !o.processList.length);

    return (
      <ScrollView>
        {!data.length && (
          <div className="TxtCenter Gray_75 Font15" style={{ marginTop: 210 }}>
            {_l('暂无搜索结果')}
          </div>
        )}
        {data.map((item, i) => this.renderListItem(item, i === data.length - 1))}
      </ScrollView>
    );
  }

  /**
   * 渲染单个列表项
   */
  renderListItem(item, isLast) {
    const { relationId } = this.props;
    const { selectItems } = this.state;

    return (
      <Fragment key={item.apkId}>
        <div className="bold ellipsis">{relationId === item.apkId ? _l('当前应用') : item.apkName}</div>
        {item.processList.map((obj, index) => {
          return (
            <Checkbox
              key={index}
              className="mTop15 flexRow"
              checked={!!_.find(selectItems, o => o.id === obj.id)}
              text={obj.name}
              onClick={checked => this.onSelect(item.apkName, obj, !checked)}
            />
          );
        })}
        {!isLast && <div className="selectWorkflowLine" />}
      </Fragment>
    );
  }

  onSelect(apkName, item, checked) {
    const selectItems = _.cloneDeep(this.state.selectItems);

    if (checked) {
      selectItems.push({
        apkName,
        ...item,
      });
    } else {
      _.remove(selectItems, o => o.id === item.id);
    }

    this.setState({ selectItems });
  }

  render() {
    const { visible, onSave, onClose } = this.props;
    const { data, selectItems } = this.state;

    if (!visible) return null;

    return (
      <Dialog
        visible
        width={540}
        className="selectWorkflowDialog"
        title={_l('选择工作流')}
        onOk={() => {
          onSave(selectItems);
          onClose();
        }}
        onCancel={onClose}
      >
        <div className="flexColumn h100">
          <div className="flexRow relative">
            <input
              type="text"
              placeholder={_l('搜索工作流名称')}
              className="selectWorkflowInput"
              onChange={e => this.setState({ keywords: e.target.value })}
            />
            <Icon icon="search" className="selectWorkflowSearch Gray_75 Font16" />
          </div>
          <div className="flex mTop15 minHeight0">
            {data === null ? (
              <LoadDiv />
            ) : !data.length ? (
              <div className="TxtCenter Gray_75 Font15" style={{ marginTop: 210 }}>
                {_l('暂无其他工作流')}
              </div>
            ) : (
              this.renderList()
            )}
          </div>
        </div>
      </Dialog>
    );
  }
}

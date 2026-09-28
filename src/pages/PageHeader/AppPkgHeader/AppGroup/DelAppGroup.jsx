import React, { Component } from 'react';
import cx from 'classnames';
import { Icon, ScrollView } from 'ming-ui';
import { Input, Modal } from 'ming-ui/antd-components';

const DANGER_OK_BUTTON_PROPS = { danger: true };

export default class DelAppGroup extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {
    searchValue: '',
    sourceAppSectionId: '',
  };
  renderGroupingItem(data) {
    const { sourceAppSectionId, searchValue } = this.state;
    const id = data.appSectionId;
    const name = data.name;

    if (searchValue && !name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) {
      return null;
    }

    return (
      <div
        key={id}
        className={cx('groupingItem flexRow alignItemsCenter pointer', { active: sourceAppSectionId === id })}
        onClick={() => {
          this.setState({ sourceAppSectionId: id });
        }}
      >
        <div className="flex mLeft5">
          <span className="ellipsis">{name || _l('未命名分组')}</span>
        </div>
        {sourceAppSectionId === id && <Icon icon="done" className="Font18 colorPrimary" />}
      </div>
    );
  }
  render() {
    const { onOk, onCancel, data } = this.props;
    const { sourceAppSectionId, searchValue } = this.state;
    return (
      <Modal
        className="delAppItemDialog"
        width={640}
        title={<span className="textError">{_l('删除一级分组')}</span>}
        open
        okText={_l('删除')}
        okButtonProps={DANGER_OK_BUTTON_PROPS}
        okDisabled={!sourceAppSectionId}
        onOk={() => onOk(sourceAppSectionId)}
        onCancel={onCancel}
      >
        <div className="explain">{_l('当前一级分组包含内容，必须将他们移到其他一级分组后再进行删除')}</div>
        <div className="moveTo">
          <span>{_l('移动到')}</span>
          <div className="groupingWrap flexColumn mTop10">
            <div className="searchWrap flexRow alignItemsCenter mBottom8 pBottom10">
              <Icon icon="search" className="Font18 textTertiary mRight3" />
              <Input
                variant="borderless"
                className="w100"
                placeholder={_l('搜索')}
                value={searchValue}
                onChange={e => {
                  this.setState({
                    searchValue: e.target.value,
                  });
                }}
              />
            </div>
            <ScrollView className="flex">{data.map(data => this.renderGroupingItem(data))}</ScrollView>
          </div>
        </div>
      </Modal>
    );
  }
}

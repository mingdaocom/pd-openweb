import React, { Component, Fragment } from 'react';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Dialog, Icon, Switch } from 'ming-ui';
import { NODE_TYPE } from '../../../enum';

const READ_TYPE = [20, 22, 25, 30, 31, 32, 33, 34, 37, 38, 45, 47, 51, 52, 53, 54, 10010];

const Box = styled.ul`
  > li {
    align-items: center;
    height: 40px;
    border-bottom: 1px solid #e0e0e0;
    > div.flex {
      min-width: 0;
    }
    > div:not(.flex) {
      width: 84px;
    }
    .tip-bottom-left {
      &:after {
        width: 200px;
        white-space: normal;
      }
    }
  }
`;

const SearchBox = styled.div`
  position: relative;
  input {
    box-sizing: border-box;
    height: 36px;
    padding: 0px 28px;
    border-radius: 4px;
    border: 1px solid #ddd;
    width: 300px;
  }
  .icon {
    position: absolute;
    top: 11px;
    left: 8px;
  }
`;

const DecryptBox = styled.span`
  padding: 3px 5px;
  background: #ffe49b;
  border-radius: 3px;
  font-size: 12px;
  min-width: max-content;
`;

export default class WriteFields extends Component {
  static defaultProps = {
    data: [],
    hideTypes: [],
    readonlyControlTypes: [],
    updateSource: () => {},
    showCard: false,
    addNotAllowView: false,
    allowExport: false,
  };

  state = {
    showTableControls: false,
    selectItem: {},
    foldIds: [],
    keywords: '',
  };

  /**
   * 是否禁用
   */
  isDisabled(item, type) {
    const { readonlyControlTypes, selectNodeType } = this.props;

    if (
      _.includes(READ_TYPE.concat(readonlyControlTypes), item.type) ||
      item.type > 10000 ||
      (item.type === 29 &&
        _.includes(['2', '5', '6'], item.showType) &&
        (type === 'REQUIRED' || selectNodeType === NODE_TYPE.LINK)) ||
      (_.includes([43, 49], item.type) && type === 'REQUIRED')
    ) {
      return true;
    }

    return false;
  }

  /**
   * 全选操作
   */
  updateAllSettings({ key, checked }) {
    const { data, updateSource } = this.props;
    const { showTableControls, selectItem } = this.state;
    const formProperties = _.cloneDeep(showTableControls ? selectItem.subFormProperties : data);

    if (key === 'LOOK') {
      formProperties.forEach(item => {
        if (!checked) {
          item.property = 4;
        } else if (item.property === 4) {
          item.property = 1;
        }
      });
    }

    if (key === 'EDIT') {
      formProperties.forEach(item => {
        if (!this.isDisabled(item)) {
          if (!checked) {
            item.property = 1;
          } else if (_.includes([1, 4], item.property)) {
            item.property = 2;
            item.isdecrypt = '1';
          }
        }
      });
    }

    if (key === 'REQUIRED') {
      formProperties.forEach(item => {
        if (!this.isDisabled(item, 'REQUIRED')) {
          if (!checked) {
            item.property = 2;
          } else if (_.includes([1, 2, 4], item.property)) {
            item.property = 3;
          }

          item.isdecrypt = '1';
        }
      });
    }

    if (key === 'DECRYPT') {
      formProperties.forEach(item => {
        if (item.datamask === '1' && _.includes([1, 4], item.property)) {
          item.isdecrypt = checked;

          if (checked === '0') {
            item.showCard = 0;
          }
        }
      });
    }

    if (showTableControls) {
      this.setState({ selectItem: Object.assign({}, selectItem, { subFormProperties: formProperties }) });
    } else {
      updateSource({ formProperties });
    }
  }

  onChange(item, value, key = 'property') {
    const { data, updateSource } = this.props;
    const { showTableControls, selectItem } = this.state;
    const formProperties = _.cloneDeep(showTableControls ? selectItem.subFormProperties : data);

    formProperties.forEach(o => {
      if (o.id === item.id) {
        o[key] = value;

        if (key === 'property' && _.includes([2, 3], value)) {
          o.isdecrypt = '1';
        }

        // 不勾选解码 不能作为摘要字段
        if (key === 'isdecrypt' && value === '0') {
          o.showCard = 0;
        }
      }
    });

    // 分段
    if (item.type === 52) {
      formProperties.forEach(o => {
        if (o.sectionId === item.id && (!this.isDisabled(o) || _.includes([1, 4], value))) {
          o[key] = value;
        }
      });
    }

    if (showTableControls) {
      this.setState({ selectItem: Object.assign({}, selectItem, { subFormProperties: formProperties }) });
    } else {
      updateSource({ formProperties });
    }
  }

  onChangeCard(id, showCard) {
    const { data, updateSource } = this.props;
    const formProperties = _.cloneDeep(data);

    if (formProperties.filter(item => !!item.showCard).length >= 8 && !!showCard) {
      alert(_l('最多可设置8个字段'), 2);
      return;
    }

    formProperties.forEach(item => {
      if (item.id === id) {
        item.showCard = showCard;

        // 显示摘要 必须解码
        if (showCard && item.datamask === '1') {
          item.isdecrypt = '1';
        }
      }
    });

    updateSource({ formProperties });
  }

  renderContent({ data, showCard = false, isChildTable = false }) {
    const { hideTypes } = this.props;

    return (
      <Box className="mTop15">
        <li className="flexRow">
          <div className="flex bold">{_l('名称')}</div>
          <div className="mLeft16">
            {!_.includes(hideTypes, 1) && (
              <Checkbox
                className="InlineBlock Font12 TxtMiddle"
                text={_l('查看')}
                clearselected={
                  data.filter(item => item.property === 4).length !== data.length &&
                  data.filter(item => item.property === 4).length
                }
                checked={!data.filter(item => item.property === 4).length}
                onClick={checked => this.updateAllSettings({ key: 'LOOK', checked: !checked })}
              />
            )}
          </div>
          <div className="mLeft16">
            {!_.includes(hideTypes, 2) && (
              <Checkbox
                className="InlineBlock Font12 TxtMiddle"
                text={_l('编辑')}
                clearselected={
                  data.filter(item => item.property === 2 || item.property === 3).length &&
                  !(
                    data.filter(item => item.property === 2 || item.property === 3).length ===
                    data.filter(item => !this.isDisabled(item)).length
                  )
                }
                checked={
                  data.filter(item => item.property === 2 || item.property === 3).length ===
                  data.filter(item => !this.isDisabled(item)).length
                }
                onClick={checked => this.updateAllSettings({ key: 'EDIT', checked: !checked })}
              />
            )}
          </div>
          <div className="mLeft16">
            {!_.includes(hideTypes, 3) && (
              <Checkbox
                className="InlineBlock Font12 TxtMiddle"
                text={_l('必填')}
                clearselected={
                  data.filter(item => item.property === 3).length &&
                  !(
                    data.filter(item => item.property === 3).length ===
                    data.filter(item => !this.isDisabled(item, 'REQUIRED')).length
                  )
                }
                checked={
                  data.filter(item => item.property === 3).length ===
                  data.filter(item => !this.isDisabled(item, 'REQUIRED')).length
                }
                onClick={checked => this.updateAllSettings({ key: 'REQUIRED', checked: !checked })}
              />
            )}
          </div>
          <div className="mLeft16">
            {!_.includes(hideTypes, 1) && (
              <Checkbox
                className="InlineBlock Font12 TxtMiddle"
                text={_l('解码')}
                clearselected={
                  data.filter(item => item.datamask === '1' && item.isdecrypt === '1').length &&
                  data.filter(item => item.datamask === '1' && item.isdecrypt === '1').length !==
                    data.filter(item => item.datamask === '1').length
                }
                checked={data.filter(item => item.datamask === '1' && item.isdecrypt === '1').length}
                onClick={checked => this.updateAllSettings({ key: 'DECRYPT', checked: checked ? '0' : '1' })}
              />
            )}
          </div>
          {showCard && (
            <div className="mLeft16 mRight16 cursorDefault" style={{ width: 60 }}>
              <span
                className="tip-bottom-left"
                data-tip={_l('指定摘要字段，使其在流程列表中直接显示，帮助您快速掌握待处理事项的内容。')}
              >
                {_l('摘要')}
              </span>
            </div>
          )}
        </li>
        {this.renderField(data, showCard, isChildTable)}
      </Box>
    );
  }

  /**
   * 渲染字段
   */
  renderField(data, showCard, isChildTable, isSubData) {
    const { hideTypes, selectNodeType } = this.props;
    const { foldIds, keywords } = this.state;

    return data
      .filter(
        item => (item.name || '').toLocaleLowerCase().indexOf(keywords.trim().toLocaleLowerCase()) > -1 || isChildTable,
      )
      .filter(item => !item.sectionId || isChildTable || !!isSubData)
      .map((item, i) => {
        return (
          <Fragment key={i}>
            <li className={cx('flexRow', { mLeft30: isSubData })}>
              <div
                className={cx('flex flexRow alignItemsCenter', { 'ThemeHoverColor3 pointer': item.type === 52 })}
                onClick={() => {
                  if (item.type === 52) {
                    this.setState({
                      foldIds: _.includes(foldIds, item.id)
                        ? foldIds.filter(o => o !== item.id)
                        : foldIds.concat(item.id),
                    });
                  }
                }}
              >
                {item.type === 52 && (
                  <i
                    className={cx(
                      'mRight5 Gray_75',
                      _.includes(foldIds, item.id) ? 'icon-arrow-right-tip' : 'icon-arrow-down',
                    )}
                  />
                )}
                <div className="ellipsis" title={item.name || (item.type === 22 ? _l('分段') : _l('备注'))}>
                  {item.name || (item.type === 22 ? _l('分段') : _l('备注'))}
                </div>
                {item.datamask && !_.includes(hideTypes, 1) && item.type !== 30 && (
                  <DecryptBox className="mLeft5">{_l('脱敏')}</DecryptBox>
                )}
                {item.type === 29 && !!(item.subFormProperties || []).length && selectNodeType !== NODE_TYPE.CC && (
                  <div
                    data-tip={_l('设置子表操作和列权限')}
                    className="mLeft5 Gray_75 ThemeHoverColor3 pointer tip-bottom-right"
                    style={{ display: 'inline-flex' }}
                    onClick={() =>
                      this.setState({
                        showTableControls: true,
                        selectItem: item,
                      })
                    }
                  >
                    <Icon type="settings" className="Font16" />
                  </div>
                )}
              </div>
              <div className="mLeft16">
                {!_.includes(hideTypes, 1) && (
                  <Checkbox checked={item.property !== 4} onClick={checked => this.onChange(item, checked ? 4 : 1)} />
                )}
              </div>
              <div className="mLeft16">
                {!this.isDisabled(item) && (!isChildTable || !item.detailTable) && !_.includes(hideTypes, 2) && (
                  <Checkbox
                    checked={item.property === 2 || item.property === 3}
                    onClick={checked => this.onChange(item, checked ? 1 : 2)}
                  />
                )}
              </div>
              <div className="mLeft16">
                {!this.isDisabled(item, 'REQUIRED') &&
                  (!isChildTable || !item.detailTable) &&
                  !_.includes(hideTypes, 3) && (
                    <Checkbox checked={item.property === 3} onClick={checked => this.onChange(item, checked ? 2 : 3)} />
                  )}
              </div>
              <div className="mLeft16">
                {item.datamask === '1' && !_.includes(hideTypes, 1) && item.type !== 30 && (
                  <Checkbox
                    checked={item.isdecrypt === '1'}
                    disabled={_.includes([2, 3], item.property)}
                    onClick={checked => this.onChange(item, checked ? '0' : '1', 'isdecrypt')}
                  />
                )}
              </div>
              {showCard && (
                <div className="mLeft16 mRight16" style={{ width: 60 }}>
                  {!_.includes([14, 21, 22, 40, 41, 42, 43, 45, 47, 49, 51, 52, 54, 10010], item.type) && (
                    <Checkbox
                      checked={item.showCard}
                      onClick={checked => this.onChangeCard(item.id, checked ? 0 : 1)}
                    />
                  )}
                </div>
              )}
            </li>
            {item.type === 52 &&
              !_.includes(foldIds, item.id) &&
              !!data.filter(o => o.sectionId === item.id).length &&
              this.renderField(
                data.filter(o => o.sectionId === item.id),
                showCard,
                isChildTable,
                true,
              )}
          </Fragment>
        );
      });
  }

  render() {
    const { data, addNotAllowView, showCard, updateSource, hideTypes, allowExport } = this.props;
    const { showTableControls, selectItem } = this.state;

    return (
      <Fragment>
        <div className="flexRow alignItemsCenter">
          <SearchBox>
            <input type="text" placeholder={_l('搜索')} onChange={e => this.setState({ keywords: e.target.value })} />
            <Icon type="search" className="Gray_75 Font16" />
          </SearchBox>
          <div className="flex" />
          {!_.includes(hideTypes, 1) && (
            <Tooltip autoCloseDelay={0} title={_l('勾选时，当工作表中新增字段时，新字段将自动设为允许查看')}>
              <div>
                <Checkbox
                  className="InlineBlock Font12 TxtMiddle"
                  text={_l('新增字段默认可查看')}
                  checked={!addNotAllowView}
                  onClick={checked => updateSource({ addNotAllowView: checked })}
                />
              </div>
            </Tooltip>
          )}
        </div>

        {this.renderContent({ data, showCard })}

        {showTableControls && (
          <Dialog
            visible
            width={680}
            title={_l('子表操作和列权限')}
            onCancel={() => this.setState({ showTableControls: false })}
            onOk={() => {
              updateSource({
                formProperties: data.map(item => {
                  if (item.id === selectItem.id) {
                    item = Object.assign({}, item, selectItem);
                  }

                  return item;
                }),
              });

              this.setState({ showTableControls: false });
            }}
          >
            <div className="flexRow alignItemsCenter">
              <div className="flex bold Font14">{_l('操作')}</div>
              <Switch
                size="small"
                checked={selectItem.workflow}
                onClick={() =>
                  this.setState({ selectItem: Object.assign({}, selectItem, { workflow: !selectItem.workflow }) })
                }
              />
            </div>
            <div className="Gray_75 mTop5">{_l('未开启时按照子表本身权限，开启后可配置子表的细分操作和列权限')}</div>

            {selectItem.workflow && (
              <Fragment>
                {!_.includes(hideTypes, 2) && (
                  <Fragment>
                    <div className="flexRow">
                      {[
                        { text: _l('可新增明细'), key: 'allowAdd' },
                        { text: _l('可编辑已有明细'), key: 'allowEdit' },
                        { text: _l('可删除已有明细'), key: 'allowCancel' },
                      ]
                        .concat(allowExport ? { text: _l('允许导出'), key: 'allowExport' } : [])
                        .map(item => (
                          <Checkbox
                            key={item.key}
                            className="mTop10 flex"
                            text={item.text}
                            checked={selectItem[item.key] === '1'}
                            onClick={checked =>
                              this.setState({
                                selectItem: Object.assign({}, selectItem, { [item.key]: !checked ? '1' : '0' }),
                              })
                            }
                          />
                        ))}
                    </div>
                  </Fragment>
                )}

                <div className="bold Font14 mTop25" style={{ marginBottom: -5 }}>
                  {_l('列权限')}
                </div>
                {this.renderContent({
                  data: selectItem.subFormProperties.filter(o => _.includes(selectItem.showControls, o.id)),
                  isChildTable: true,
                })}
              </Fragment>
            )}
          </Dialog>
        )}
      </Fragment>
    );
  }
}

import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Dropdown } from 'ming-ui';
import { getIcons } from '../../../utils';

export default class SelectNodeObject extends Component {
  /**
   * dropdown title
   */
  renderTitle(item) {
    const { isIntegration } = this.props;

    return (
      <Fragment>
        <span
          className={cx(
            getIcons(item.nodeTypeId, item.appType, item.actionId),
            item.nodeId ? 'Font16 Gray_9e' : 'Font18 errorColor',
          )}
        />
        <span className={cx('Font14 mLeft5', { errorColor: !item.nodeId })}>{item.nodeName || _l('节点已删除')}</span>

        {isIntegration ? null : item.appId ? (
          <Fragment>
            <span className="Font14 mLeft5 bold">{item.appTypeName}</span>
            <span className="Font14 mLeft5 bold">{`“${item.appName}”`}</span>
          </Fragment>
        ) : !_.isEmpty(item) ? (
          <span className="Font14 mLeft5 Gray_9e">{_l('工作表已删除')}</span>
        ) : null}
      </Fragment>
    );
  }

  /**
   * dropdown list item
   */
  renderDropdownItem(item) {
    const { isIntegration } = this.props;

    return (
      <div className="flexRow" style={{ alignItems: 'center' }}>
        <span className={cx('Font16 Gray_9e', getIcons(item.nodeTypeId, item.appType, item.actionId))} />
        <span className={cx('Font14 mLeft5 ellipsis flex', { Gray_9e: !item.appId })}>{item.nodeName}</span>
        {isIntegration ? null : item.appId && item.appName ? (
          <Fragment>
            <span className="Font14 mLeft5 bold flowDropdownGray">{item.appTypeName}</span>
            <span className="Font14 mLeft5 bold flowDropdownGray ellipsis" style={{ maxWidth: 150 }}>{`“${
              item.appName
            }”`}</span>
          </Fragment>
        ) : (
          <span className="Font14 mLeft5 Gray_75">
            <i className="icon-workflow_error Font14 mRight5" />
            {_l('设置此节点后才能选择')}
          </span>
        )}
      </div>
    );
  }

  render() {
    const { isIntegration, appList, selectNodeId, selectNodeObj, onChange, smallBorder, disabled = false } = this.props;
    const list = (appList || []).map(item => {
      return {
        text: this.renderDropdownItem(item),
        value: item.nodeId,
        disabled: (!item.appId || !item.appName) && !isIntegration,
      };
    });

    return (
      <Dropdown
        className={cx(
          'flowDropdown mTop10',
          { 'errorBorder errorBG': selectNodeId && !selectNodeObj.nodeId },
          { flowDropdownBorder: !smallBorder },
        )}
        data={list}
        value={selectNodeId || undefined}
        disabled={disabled}
        border
        renderTitle={() => selectNodeId && this.renderTitle(selectNodeObj)}
        onChange={onChange}
      />
    );
  }
}

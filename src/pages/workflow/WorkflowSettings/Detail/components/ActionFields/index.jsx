import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import './index.less';
import { getIcons } from '../../../utils';
import { APP_TYPE } from 'src/pages/workflow/WorkflowSettings/enum';
import _ from 'lodash';

const ClickAwayable = createDecoratedComponent(withClickAway);

export default class ActionFields extends Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    title: PropTypes.string,
    header: PropTypes.node,
    footer: PropTypes.node,
    noItemTips: PropTypes.string,
    noData: PropTypes.string,
    condition: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        id: PropTypes.string,
        nodeTypeId: PropTypes.number,
        appName: PropTypes.any,
        appType: PropTypes.number,
        appTypeName: PropTypes.any,
        actionId: PropTypes.string,
        nAlias: PropTypes.any,
        items: PropTypes.arrayOf(
          PropTypes.shape({
            type: PropTypes.number,
            value: PropTypes.string,
            field: PropTypes.string,
            text: PropTypes.string,
            cAlias: PropTypes.any,
            sourceType: PropTypes.any,
          }).isRequired,
        ).isRequired,
      }).isRequired,
    ).isRequired,
    handleFieldClick: PropTypes.func,
    onClose: PropTypes.func,
    onClickAwayExceptions: PropTypes.array,
    openSearch: PropTypes.bool,
  };
  static defaultProps = {
    onClickAwayExceptions: [],
  };
  constructor(props) {
    super(props);

    this.state = {
      activeIndex: props.condition.length > 1 ? -1 : 0,
      keywords: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.condition.length !== this.props.condition.length) {
      this.setState({ activeIndex: nextProps.condition.length > 1 ? -1 : 0 });
    }
  }

  /**
   * 点击切换
   */
  handleClick = index => {
    if (this.state.activeIndex === index) index = -1;
    this.setState({ activeIndex: index });
    this.search && this.search.focus();
  };

  render() {
    const {
      header,
      footer,
      className,
      style,
      onClose,
      noItemTips,
      noData,
      onClickAwayExceptions,
      openSearch,
      title,
      handleFieldClick,
    } = this.props;
    const { activeIndex, keywords } = this.state;
    let condition = _.cloneDeep(this.props.condition);

    condition.forEach(obj => {
      obj.items = obj.items.filter(o => o.text.toLowerCase().indexOf(keywords.toLowerCase()) > -1);
    });
    condition = condition.filter(obj => obj.items.length);

    return (
      <ClickAwayable
        style={style}
        className={cx('startConditionWrap', { [className]: className })}
        onClickAwayExceptions={onClickAwayExceptions}
        onClickAway={onClose}
      >
        <div className="conditionWrapContent">
          {title && <div className="pLeft16 pRight16 mTop15">{title}</div>}
          {header && header}
          {openSearch && (
            <div
              className="flexRow mTop5 mBottom5"
              style={{
                padding: '0 16px 0 14px',
                height: 36,
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0',
              }}
            >
              <i className="icon-search Gray_75 Font14" />
              <input
                type="text"
                ref={search => {
                  this.search = search;
                }}
                autoFocus
                className="mLeft5 flex Border0 placeholderColor Gray"
                placeholder={_l('搜索流程节点对象下的字段')}
                onChange={evt => this.setState({ keywords: evt.target.value.trim() })}
              />
            </div>
          )}
          <div className={cx('conditionWrap', { 'pTop6 pBottom6': condition.length || noData || keywords })}>
            <div className="conditionScrollWrap">
              {!condition.length && keywords && (
                <div className="conditionDetail flexRow Gray_75">{_l('无搜索结果')}</div>
              )}
              {!condition.length && noData && !keywords && (
                <div className="conditionDetail flexRow Gray_75">{noData}</div>
              )}
              {condition.map((item, index) => (
                <div key={index} className="conditionBox">
                  <div
                    className={cx('conditionDetail flexRow ThemeHoverColor3', {
                      ThemeColor3: index === activeIndex && !keywords,
                    })}
                    onClick={() => !keywords && this.handleClick(index)}
                  >
                    <Icon
                      icon={
                        item.isSourceApp
                          ? 'workflow_field'
                          : getIcons(item.nodeTypeId, item.appType, item.actionId).replace('icon-', '')
                      }
                      className="Gray_75"
                    />
                    <div className="flex mLeft10 ellipsis">{item.isSourceApp ? _l('选择映射字段') : item.text}</div>
                    {_.includes([APP_TYPE.SHEET, APP_TYPE.CUSTOM_ACTION, APP_TYPE.WORKSHEET_LOG], item.appType) && (
                      <div
                        className="mLeft15 mRight10 Gray_75 ellipsis"
                        style={{ maxWidth: 150 }}
                      >{`${item.appTypeName}“${item.appName}”`}</div>
                    )}
                    <Icon
                      icon={index === activeIndex || keywords ? 'arrow-up-border' : 'arrow-down-border'}
                      className="mLeft10 Gray_75"
                    />
                  </div>
                  {
                    <ul className={cx('conditionFieldBox', { show: index === activeIndex || keywords })}>
                      {!item.items.length && (
                        <li className="flexRow conditionFieldNull Gray_75">
                          <div className="ellipsis">{noItemTips}</div>
                        </li>
                      )}
                      {item.items.map((obj, index) => (
                        <li
                          className="flexRow ThemeHoverBGColor3"
                          key={index}
                          onClick={evt => {
                            evt.stopPropagation();
                            handleFieldClick({
                              nodeId: item.id,
                              fieldValueId: obj.value,
                              nodeName: item.text,
                              fieldValueName: obj.text,
                              fieldValueType: obj.type,
                              nodeTypeId: item.nodeTypeId,
                              appType: item.appType,
                              actionId: item.actionId,
                              isSourceApp: item.isSourceApp,
                              nAlias: item.nAlias,
                              cAlias: obj.cAlias,
                              sourceType: obj.sourceType,
                            });
                          }}
                        >
                          <div className="ellipsis">
                            <span className="field">{`[${obj.field}]`}</span>
                            <span title={obj.text}>{obj.text}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  }
                </div>
              ))}
            </div>
          </div>
          {footer && footer}
        </div>
      </ClickAwayable>
    );
  }
}

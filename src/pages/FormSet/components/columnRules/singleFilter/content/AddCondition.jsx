import React, { Component } from 'react';
import Trigger from 'rc-trigger';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Menu, MenuItem, Icon, Tooltip } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
export default class AddCondition extends Component {
  static propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    onAdd: PropTypes.func,
    iconNode: PropTypes.bool, //默认true,显示+按钮
  };
  static defaultProps = {
    iconNode: true,
  };
  constructor(props) {
    super(props);
    this.state = {
      showAddColumnList: false,
      keyword: '',
      columnsFilter: this.props.columns || [],
    };
  }
  componentWillReceiveProps(nextProps) {
    const { columns = [] } = nextProps;
    this.setState({
      columnsFilter: columns,
    });
  }
  handleSearch = _.throttle(() => {
    this.setState({
      columnsFilter: this.state.keyword
        ? this.props.columns.filter(item => item.controlName.toLowerCase().indexOf(_.trim(this.state.keyword.toLowerCase())) > -1)
        : this.props.columns,
    });
  }, 100);
  renderIconNode = () => {
    return (
      <span className="Gray_75 addConditionIcon Font16">
        <Tooltip text={<span>{_l('添加条件')}</span>} popupPlacement="top">
          <i
            className="icon icon-add mLeft15 Hover_49"
            onClick={() => {
              this.setState({ showAddColumnList: true });
            }}
          ></i>
        </Tooltip>
      </span>
    );
  };
  render() {
    let { onAdd, iconNode } = this.props;
    let { showAddColumnList, keyword, columnsFilter } = this.state;
    return (
      <div className="Hand">
        <Trigger
          popupVisible={showAddColumnList}
          onPopupVisibleChange={showAddColumnList => {
            this.setState({ showAddColumnList });
          }}
          action={['click']}
          mouseEnterDelay={0.1}
          popupAlign={{ points: ['tl', 'tl'], offset: [0, 30], overflow: { adjustX: 1, adjustY: 2 } }}
          popup={
            <div
              className="ruleFilterColumnOptionList"
              onClickAway={() => {
                this.setState({ showAddColumnList: false });
              }}
            >
              <div className="ruleSearchWrap">
                <input
                  type="text"
                  value={keyword}
                  ref={con => (this.search = con)}
                  placeholder={_l('搜索字段')}
                  onChange={e => this.setState({ keyword: e.target.value }, this.handleSearch)}
                />
                <Icon icon="workflow_find" className="search Gray_9e Font16" />
                {keyword && (
                  <Icon
                    icon="close"
                    onClick={() => this.setState({ keyword: '' }, this.handleSearch)}
                    className="close pointer"
                  />
                )}
              </div>
              <Menu>
                {columnsFilter.length ? (
                  _.sortBy(columnsFilter, 'row').map((c, i) => (
                    <MenuItem
                      onClick={() => {
                        onAdd(c);
                        this.setState({ showAddColumnList: false });
                      }}
                      key={i}
                    >
                      <i className={cx('Font16 icon', `icon-${getIconByType(c.type)}`)}></i>
                      <span>{c.controlName}</span>
                    </MenuItem>
                  ))
                ) : (
                  <div className="pTop20 pBottom20 LineHeight80 TxtCenter Gray_9e">{_l('暂无搜索结果')}</div>
                )}
              </Menu>
            </div>
          }
        >
          {iconNode ? (
            this.renderIconNode()
          ) : (
            <span
              className="addCondition"
              onClick={() => {
                this.setState({ showAddColumnList: true });
              }}
            >
              <i className="icon icon-plus mRight8"></i>
              {_l('添加条件')}
            </span>
          )}
        </Trigger>
      </div>
    );
  }
}

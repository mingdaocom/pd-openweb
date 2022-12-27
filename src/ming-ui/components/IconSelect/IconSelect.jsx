import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isShallowEqual from 'react-redux/lib/utils/shallowEqual';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import ScrollView from 'ming-ui/components/ScrollView';
import ICON_LIST from './IconList.js';
import './IconSelect.less';
import _ from 'lodash';

// const ClickAwayable = createDecoratedComponent(withClickAway);
const COLOR_LIST = ['#2196f3', '#01ca83', '#f44336', '#00bcd4', '#4c7d9e', '#ffa340'];

export default class IconSelect extends Component {
  static propTypes = {
    selectedIcon: PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string,
    }),
    defaultIcon: PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string,
    }),
    className: PropTypes.string,
    offset: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
    type: PropTypes.oneOf(['APP', 'WORK_SHEET']),
    onChange: PropTypes.func,
    children: PropTypes.element.isRequired, // 选中图标的预览
    viewport: PropTypes.func,
    style: PropTypes.object,
    popupAlign: PropTypes.shape({
      points: PropTypes.array,
      offset: PropTypes.arrayOf(PropTypes.number),
      overflow: PropTypes.shape({
        adjustX: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
        adjustY: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
      }),
    }),
    preventPropagation: PropTypes.bool,
  };
  static defaultProps = {
    type: 'WORK_SHEET',
    popupAlign: {
      points: ['tc', 'bc'],
      offset: [0, 0],
      overflow: {
        adjustX: true,
        adjustY: true,
      },
    },
    viewport: () => document.body,
    preventPropagation: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      selectedIcon: props.selectedIcon ||
        props.defaultIcon || {
          name: 'task-folder-solid',
          color: COLOR_LIST[0],
        },
    };
  }
  componentWillReceiveProps(nextProps) {
    if (!isShallowEqual(nextProps.selectedIcon, this.props.selectedIcon)) {
      this.setState({
        selectedIcon: nextProps.selectedIcon,
      });
    }
  }
  handleChange(color, icon) {
    const { onChange } = this.props;
    const newIcon = {
      name: icon,
      color,
    };
    this.setState({
      selectedIcon: newIcon,
    });
    if (onChange) {
      onChange(newIcon);
    }
  }

  renderIcons() {
    const { type } = this.props;
    const { selectedIcon } = this.state;
    const icons = ICON_LIST[type].slice();
    const groups = [];
    const PER_LINE_ICON_COUNT = 7;
    while (icons.length) {
      groups.push(icons.splice(0, PER_LINE_ICON_COUNT));
    }
    return (
      <ScrollView className="iconListWrapper">
        <div className="iconList">
          {_.map(groups, (groupIcons, groupIndex) => {
            const phcCount = PER_LINE_ICON_COUNT - groupIcons.length;
            return (
              <div className="iconsRow" key={groupIndex}>
                {_.map(groupIcons, (icon, iconIndex) => (
                  <i
                    className={cx(`Font24 pAll5 Hand icon-${icon}`, { ThemeColor3: selectedIcon.name === icon, Gray_9e: selectedIcon.name !== icon })}
                    key={iconIndex}
                    onClick={() => {
                      this.handleChange(selectedIcon.color, icon);
                    }}
                  />
                ))}
                {_.times(phcCount).map(i => (
                  <i className="phc" key={i} />
                ))}
              </div>
            );
          })}
        </div>
      </ScrollView>
    );
  }

  render() {
    const { className, children, viewport, style, preventPropagation } = this.props;
    const { offset: { x = 0, y = 0 } = {} } = this.props;
    const _props = preventPropagation
      ? {
          onClick(e) {
            e.stopPropagation();
          },
        }
      : {};
    const defaultPopupAlign = {
      points: ['tc', 'bc'],
      offset: [0, 0],
      overflow: {
        adjustX: true,
        adjustY: true,
      },
    };
    const popupAlign = Object.assign({}, defaultPopupAlign, this.props.popupAlign, { offset: [x, y] });
    const { selectedIcon } = this.state;
    const popup = (
      <div className="iconPicker">
        <div className="pLeft15 pRight15 Font13 Gray_9e mTop5 mBottom10">{_l('图标颜色')}</div>
        <div className="pLeft15 pRight15 colorList">
          {COLOR_LIST.map((color, index) => {
            if (color.toLocaleLowerCase() === selectedIcon.color.toLocaleLowerCase()) {
              return (
                <span className="color selected ThemeBorderColor3" key={index}>
                  <span
                    className="InlineBlock w100 h100 circle"
                    style={{
                      backgroundColor: color,
                    }}
                  />
                </span>
              );
            } else {
              return (
                <span
                  className="color Hand ThemeHoverBorderColor3"
                  key={index}
                  onClick={() => {
                    this.handleChange(color, selectedIcon.name);
                  }}
                >
                  <span
                    className="InlineBlock w100 h100 circle"
                    style={{
                      backgroundColor: color,
                    }}
                  />
                </span>
              );
            }
          })}
        </div>
        <div className="pLeft15 pRight15 Font13 Gray_9e mTop10 mBottom5">{_l('图标图形')}</div>
        {this.renderIcons()}
      </div>
    );
    return (
      <div className={cx('iconSelect', className)} style={style} {..._props}>
        <Trigger prefixCls={'Tooltip'} action={['click']} popup={popup} getPopupContainer={viewport} popupAlign={popupAlign}>
          <div
            className="selectedIcon"
            onClick={() => {
              this.setState({ iconPickerVisible: true });
            }}
          >
            {children}
          </div>
        </Trigger>
      </div>
    );
  }
}

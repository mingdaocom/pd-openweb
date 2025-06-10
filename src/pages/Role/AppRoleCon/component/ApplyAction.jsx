import React, { PureComponent } from 'react';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Menu, MenuItem } from 'ming-ui';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';

const Wrap = styled.div`
  .search {
    .conSearch {
      width: auto;
      background: #fff;
      border-bottom: 1px solid #ddd;
      border-radius: 0;
    }
  }
  .conListD {
    max-height: 300px;
    overflow: auto;
  }
`;
const builtinPlacements = {
  topLeft: {
    points: ['bl', 'tl'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
};
export default class ApplyAction extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      popupVisible: false,
      keyWords: '',
      roles: [],
    };
  }

  componentDidMount() {
    this.setState({
      roles: this.props.roles,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.roles, nextProps.roles)) {
      this.setState({
        roles: nextProps.roles,
      });
    }
  }

  renderPopup() {
    const { onChange, placeholder } = this.props;
    const { keyWords, roles } = this.state;
    return (
      <Wrap>
        <Menu style={{ position: 'static' }}>
          <div className="search InlineBlock w100">
            <SearchInput
              className="conSearch"
              placeholder={placeholder || _l('搜索角色名称')}
              value={keyWords}
              onChange={keyWords => {
                this.setState({
                  roles: this.props.roles.filter(
                    o => o.name.toLocaleLowerCase().indexOf(keyWords.toLocaleLowerCase()) >= 0,
                  ),
                });
              }}
            />
          </div>
          <div className="conListD">
            {roles.length <= 0 && <p className="Gray_75 mTop20 TxtCenter">{_l('暂无相关数据')}</p>}
            {_.map(roles, role => {
              return (
                <MenuItem
                  key={role.roleId}
                  onClick={() => {
                    onChange(role);
                    this.setState({
                      popupVisible: false,
                    });
                  }}
                >
                  {role.name}
                </MenuItem>
              );
            })}
          </div>
        </Menu>
      </Wrap>
    );
  }

  render() {
    const { getPopupContainer } = this.props;
    const triggerProps = {
      popupClassName: 'ming Tooltip-white',
      prefixCls: 'Tooltip',
      action: ['click'],
      popup: this.renderPopup(),
      builtinPlacements,
      popupPlacement: 'bottomLeft',
      popupVisible: this.state.popupVisible,
      onPopupVisibleChange: visible => {
        this.setState({
          popupVisible: visible,
        });
      },
      popupAlign: {
        offset: [0, 5],
        overflow: {
          adjustX: 1,
          adjustY: 1,
        },
      },
      getPopupContainer,
    };

    return (
      <Trigger {...triggerProps}>
        <span
          className="ThemeColor3 ThemeHoverColor2 Hand"
          onClick={() => {
            if (!this.state.popupVisible) {
              this.setState({
                popupVisible: true,
              });
            }
          }}
        >
          {this.props.children || (
            <span className="">
              <span className="TxtMiddle InlineBlock ellipsis" style={{ maxWidth: 130 }}>
                {_l('同意')}
              </span>
              <Icon icon="arrow-down" className="font8 TxtMiddle" />
            </span>
          )}
        </span>
      </Trigger>
    );
  }
}

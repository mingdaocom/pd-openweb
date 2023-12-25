import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Icon } from 'ming-ui';
import { sideNavList } from './config';

const Wrap = styled.div`
  width: 241px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #ededed;
  .pLeft18 {
    padding-left: 18px;
  }
  .Height44 {
    height: 44px;
  }
  li {
    width: 230px;
    height: 44px;
    border-radius: 0px 22px 22px 0px;
    padding-left: 18px;

    span {
      font-weight: 600;
      font-size: 14px;
    }
    i {
      color: #757575;
      font-size: 16px;
      margin-right: 8px;
    }

    a {
      display: inline-flex;
      align-items: center;
      width: 100%;
      line-height: 44px;
      color: #333;
    }

    &.isDisabled {
      color: #757575;
      &:hover {
        background: #fff;
      }
    }

    &.isCurrent {
      background: #e3f2fe;
      a {
        color: #2196f3;
        i {
          color: #2196f3;
        }
      }
      &:hover {
        background: #e3f2fe;
      }
    }

    &:hover {
      background: #f5f5f5;
    }
  }
`;

class SideNav extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { params = {} } = nextProps.match;
    !params.type ? localStorage.removeItem('pluginUrl') : safeLocalStorageSetItem(`pluginUrl`, params.type);
  }
  render() {
    const { match = { params: {} } } = this.props;
    const { type = '' } = match.params;
    return (
      <Wrap>
        {sideNavList.map((group, index) => {
          return (
            <React.Fragment>
              {group.title && <div className="Gray_9e mTop28 pLeft18">{group.title}</div>}
              <ul className={index === 0 ? 'mTop16' : 'mTop12'}>
                {group.list.map((item, index) => {
                  return (
                    <li
                      key={index}
                      className={cx({
                        isCurrent: item.type === type || (!type && item.type === 'view'),
                        isDisabled: item.disabled,
                      })}
                    >
                      {item.disabled ? (
                        <div className="flexRow alignItemsCenter Height44">
                          <Icon icon={item.icon} />
                          <span>{item.text}</span>
                        </div>
                      ) : (
                        <Link className="overflow_ellipsis pRight10" to={`/plugin/${item.type}`}>
                          <Icon icon={item.icon} />
                          <span>{item.text}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </React.Fragment>
          );
        })}
      </Wrap>
    );
  }
}

export default SideNav;

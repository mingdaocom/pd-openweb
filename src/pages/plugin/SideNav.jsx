import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Icon } from 'ming-ui';
import { sideNavList } from './config';
import { getFeatureStatus } from 'src/util';
import { VersionProductType } from 'src/util/enum';

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
    &:last-child {
      margin-bottom: 0;
    }

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
    .freeTag {
      display: inline-block;
      line-height: 16px;
      padding: 2px 4px;
      border-radius: 2px;
      background: #f19f39;
      color: #fff;
      margin-left: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .upgradeIcon {
      color: #fdb432;
      margin-left: 6px;
      font-size: 16px;
    }
    .betaIcon {
      color: rgb(76, 175, 80) !important;
      margin-left: 4px;
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
        .upgradeIcon {
          color: #fdb432 !important;
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
    const { match = { params: {} }, noAssistantAuth, currentProjectId } = this.props;
    const { type = '' } = match.params;
    const featureType = getFeatureStatus(currentProjectId, VersionProductType.flowPlugin);

    return (
      <Wrap>
        {sideNavList
          .filter(group => !(group.key === 'aiAssistant' && noAssistantAuth))
          .map((group, index) => {
            return (
              <React.Fragment key={index}>
                {group.title && <div className="Gray_9e mTop28 pLeft18">{group.title}</div>}
                <ul className={index === 0 ? 'mTop16' : 'mTop12'}>
                  {group.list
                    .filter(o => o.type !== 'node' || featureType)
                    .map((item, index) => {
                      return (
                        <li
                          key={index}
                          className={cx({
                            isCurrent: item.type === type || (!type && item.type === 'view'),
                            isDisabled: item.disabled,
                          })}
                        >
                          <Link
                            className="overflow_ellipsis pRight10"
                            to={`/plugin/${item.type}`}
                            onClick={e => e.preventDefault()}
                          >
                            <Icon icon={item.icon} />
                            <span>{item.text}</span>
                            {item.type === 'assistant' && <div className="freeTag">{_l('限免')}</div>}
                            {item.type === 'node' && <Icon icon="beta1" className="betaIcon" />}
                          </Link>
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

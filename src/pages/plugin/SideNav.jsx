import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, MdLink } from 'ming-ui';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { sideNavList } from './config';

const Wrap = styled.div`
  width: 241px;
  height: 100%;
  background: var(--color-background-primary);
  border-right: 1px solid var(--color-border-secondary);
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
      color: var(--color-text-secondary);
      font-size: 16px;
      margin-right: 8px;
    }
    a {
      display: inline-flex;
      align-items: center;
      width: 100%;
      line-height: 44px;
      color: var(--color-text-primary);
    }
    .freeTag {
      display: inline-block;
      line-height: 16px;
      padding: 2px 4px;
      border-radius: 2px;
      background: var(--color-warning);
      color: var(--color-white);
      margin-left: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .upgradeIcon {
      color: var(--color-warning);
      margin-left: 6px;
      font-size: 16px;
    }

    &.isDisabled {
      color: var(--color-text-secondary);
      &:hover {
        background: var(--color-background-primary);
      }
    }

    &.isCurrent {
      background: var(--color-primary-transparent);
      a {
        color: var(--color-primary);
        i {
          color: var(--color-primary);
        }
        .upgradeIcon {
          color: var(--color-warning) !important;
        }
      }
      &:hover {
        background: var(--color-primary-transparent);
      }
    }

    &:hover {
      background: var(--color-background-hover);
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
                {group.title && <div className="textTertiary mTop28 pLeft18">{group.title}</div>}
                <ul className={index === 0 ? 'mTop16' : 'mTop12'}>
                  {group.list
                    .filter(
                      o =>
                        (o.type !== 'node' || featureType) &&
                        !((window.platformENV.isOverseas || window.platformENV.isLocal) && o.type === 'pluginMarket'),
                    )
                    .map((item, index) => {
                      return (
                        <li
                          key={index}
                          className={cx({
                            isCurrent: item.type === type || (!type && item.type === 'view'),
                            isDisabled: item.disabled,
                          })}
                        >
                          <MdLink
                            className="overflow_ellipsis pRight10 stopPropagation"
                            to={`/plugin/${item.type}`}
                            onClick={e => {
                              if (item.type === 'pluginMarket') {
                                e.stopPropagation();
                                e.preventDefault();
                                window.open(`${md.global.Config.MarketUrl}/plugins`);
                              }
                            }}
                          >
                            <Icon icon={item.icon} />
                            <span>{item.text}</span>
                          </MdLink>
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

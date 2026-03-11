import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import Beta from 'src/pages/AppSettings/components/Beta';
import { navigateTo } from 'src/router/navigateTo';
import Icon from './Icon';
import UpgradeIcon from './UpgradeIcon';

const Wrap = styled.ul`
  margin: 12px 14px 0;
  li {
    padding: 14px;
    color: var(--color-text-title);
    font-size: 14px;
    cursor: pointer;
    background: var(--color-background-primary) 0% 0% no-repeat padding-box;
    border: 1px solid var(--color-border-secondary);
    box-sizing: border-box;

    .Icon {
      width: 30px;
      color: var(--color-text-secondary);
      text-align: left;
      font-size: 18px;
      font-weight: normal;
    }
    &.current {
      background: var(--color-primary-transparent-light);
      box-shadow: inset 0 0 0 2px var(--color-primary);
      color: var(--color-primary);
      box-sizing: border-box;
      z-index: 1;
      position: relative;
      .icon {
        color: var(--color-primary);
      }
    }
    p {
      color: var(--color-text-tertiary);
      margin-bottom: 0;
    }
  }
  li + li {
    margin-top: -1px;
  }
  li:first-child {
    border-radius: 3px 3px 0px 0px;
  }
  li:last-child {
    border-radius: 0px 0px 3px 3px;
  }

  .verticalTxtBottom {
    vertical-align: text-bottom;
  }
`;

export default function CardNav(props) {
  const { navList = [], currentNav } = props;

  return (
    <Wrap>
      {navList.map(item => {
        const { icon, title, description, url, showBeta, showUpgradeIcon, onClick } = item;
        const routerKey = url.split('/').pop();

        return (
          <li
            className={cx({ current: currentNav === routerKey })}
            onClick={() => (onClick ? onClick() : navigateTo(url))}
          >
            <div className="">
              <Icon icon={icon} className="aliasIcon" />
              <span className="flex mLeft12 Bold">{title}</span>
              {showBeta && <Beta className="verticalTxtBottom" />}
              {showUpgradeIcon && <UpgradeIcon className="verticalTxtBottom" />}
            </div>
            {description && <p className="mTop5 Font12">{description}</p>}
          </li>
        );
      })}
    </Wrap>
  );
}

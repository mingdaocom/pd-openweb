import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import privateLinkAjax from 'src/api/privateLink.js';

// 私有部署环境放开
// (async () => {
//   try {
//     const module = await import('src/api/privateLink.js');
//     privateLinkAjax = module.default || module;
//   } catch (e) {
//     console.warn(e);
//   }
// })();

const Wrap = styled.div`
  width: 100%;
  height: auto;
  line-height: 22px;
  background: var(--color-background-secondary);
  padding: 8px;
  z-index: 1;
  .hoverTextWhite {
    &:hover {
      color: var(--color-white);
    }
  }
  &.isBd {
    background: #000000;
  }
  .linkCon {
    font-weight: 400;
    font-size: 12px;
  }
  .lineCenter {
    width: 0;
    height: 11px;
    border-right: 1px solid var(--color-text-disabled);
    &.isBd {
      border-right: 1px solid var(--color-text-tertiary);
    }
  }
  .pointCon {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--color-text-disabled);
    vertical-align: middle;
    margin-top: -3px;
    display: inline-block;
    &.isBd {
      background: var(--color-text-tertiary);
    }
  }
`;
export default function Footer() {
  const [links, setState] = useState([]);

  useEffect(() => {
    getLinks();
  }, []);

  const getLinks = () => {
    privateLinkAjax.getLinkList({}).then(res => {
      setState(
        res
          .filter(o => !!o.name && !!o.href)
          .sort((a, b) => {
            return a.sortIndex - b.sortIndex; // 升序排序
          }),
      );
    });
  };

  const showRight = window.platformENV.isPlatform && _.get(md, 'global.Config.IsCobranding');
  return (
    (window.platformENV.isOverseas || window.platformENV.isLocal) &&
    (links.length > 0 || showRight) && (
      <Wrap
        className={cx('TxtCenter', {
          isBd: _.get(md, 'global.SysSettings.footerThemeColor') === 2,
        })}
      >
        {links.length > 0 && (
          <React.Fragment>
            {links.map((o, i) => {
              return (
                <React.Fragment>
                  <span
                    className={cx(
                      'linkCon Hand',
                      _.get(md, 'global.SysSettings.footerThemeColor') === 2
                        ? 'textDisabled hoverTextWhite'
                        : 'textSecondary ThemeHoverColor3',
                    )}
                    onClick={() => window.open(o.href)}
                  >
                    {o.name}
                  </span>
                  {i < links.length - 1 && (
                    <span
                      className={cx('pointCon mLeft8 mRight8', {
                        isBd: _.get(md, 'global.SysSettings.footerThemeColor') === 2,
                      })}
                    />
                  )}
                </React.Fragment>
              );
            })}
            {showRight && (
              <span
                className={cx('lineCenter mLeft16 mRight16 InlineBlock', {
                  isBd: _.get(md, 'global.SysSettings.footerThemeColor') === 2,
                })}
              ></span>
            )}
          </React.Fragment>
        )}
        {showRight && (
          <span
            className={cx(
              'Hand Font12 CreatByText',
              _.get(md, 'global.SysSettings.footerThemeColor') === 2
                ? 'textDisabled hoverTextWhite'
                : 'textSecondary ThemeHoverColor3',
            )}
            onClick={() => window.open('https://www.mingdao.com')}
          >
            {_l('基于')}
            <span className="Bold mLeft3 mRight3" style={{ fontStyle: 'italic' }}>
              HAP
            </span>
            {_l('应用平台内核')}
          </span>
        )}
      </Wrap>
    )
  );
}

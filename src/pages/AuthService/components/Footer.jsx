import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import privateLinkAjax from 'src/api/privateLink.js';
import _ from 'lodash';
import cx from 'classnames';

const Wrap = styled.div`
  width: 100%;
  height: auto;
  line-height: 22px;
  background: #f2f5f7;
  padding: 8px;
  z-index: 1;
  .HoverWhite {
    &:hover {
      color: #fff;
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
    border-right: 1px solid #bdbdbd;
    &.isBd {
      border-right: 1px solid #9e9e9e;
    }
  }
  .pointCon {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #bdbdbd;
    vertical-align: middle;
    margin-top: -3px;
    display: inline-block;
    &.isBd {
      background: #9e9e9e;
    }
  }
`;
export default function Footer(props) {
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

  const showRight = _.get(md, 'global.Config.IsPlatformLocal') && _.get(md, 'global.Config.IsCobranding');
  return (
    _.get(md, 'global.Config.IsLocal') &&
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
                        ? 'Gray_bd HoverWhite'
                        : 'Gray_75 ThemeHoverColor3',
                    )}
                    onClick={e => window.open(o.href)}
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
                ? 'Gray_bd HoverWhite'
                : 'Gray_75 ThemeHoverColor3',
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

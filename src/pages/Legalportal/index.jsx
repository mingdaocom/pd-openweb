import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { RichText, LoadDiv, Markdown, Icon } from 'ming-ui';
import cx from 'classnames';
import privateLegalApi from 'src/api/privateLegal';
import styled from 'styled-components';
import preall from 'src/common/preall';
import { getRequest } from 'src/util/index.js';
import { createRoot } from 'react-dom/client';

const WrapPage = styled.div`
  .headerPage {
    height: 72px;
    background: rgb(255 255 255);
    border-radius: 0px;
    padding: 0px 50px;
    position: fixed;
    top: 0px;
    width: 100%;
    z-index: 1;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 3px;
    @media screen and (max-width: 1024px) {
      padding: 0 25px;
    }
  }
`;
const Wrap = styled.div`
  padding-top: 72px;
  background: #ffffff;
  min-height: 100%;
  .con {
    .rc-md-editor {
      border: none;
      .MdEditorCon {
        max-height: initial;
        height: initial;
        max-height: initial;
      }
    }
    .rc-md-editor .editor-container .sec-html .html-wrap {
      overflow: initial;
      line-height: 1.5;
    }
    .contextTitle {
      font-weight: bold;
      font-size: 32px;
      color: #333333;
      line-height: 56px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
    .rc-md-editor .editor-container > .section > .section-container,
    .disabled .ck-content {
      padding: 0;
      figure.table {
        overflow: auto;
      }
    }
    .titles {
      padding-right: 50px;
      background: #fff;
      padding-bottom: 10px;
      padding-top: 10px;
      .mCon {
        display: none;
      }
      @media screen and (max-width: 1024px) {
        background: #f2f2f2;
        border-radius: 3px 3px 3px 3px;
        padding: 10px;
        margin-bottom: 10px;
        .mCon {
          display: flex;
          font-weight: 400;
        }
      }
      .keyTitle {
        font-weight: bold;
        font-size: 16px;
        line-height: 40px;
        color: #333333;
        padding-left: 12px;
        &:hover {
          color: #2196f3;
        }
        &.isCur {
          position: relative;
          color: #2196f3;
          &::before {
            content: ' ';
            width: 5px;
            height: 15px;
            background: #2196f3;
            border-radius: 0px 0px 0px 0px;
            display: block;
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
          }
        }
      }
      .legalTitles {
        padding-left: 17px;
        max-height: 400px;
        overflow: auto;
        @media screen and (max-width: 1024px) {
          max-height: initial;
          overflow: initial;
        }
      }
      .titlesLi {
        font-weight: 400;
        line-height: 24px;
        padding: 10px 0px;
      }
    }
    @media screen and (max-width: 1024px) {
      padding: 50px 80px;
      .titles,
      .conRich {
        flex: initial;
        line-height: 1.5;
        .titlesLi {
          padding: 5px 0px;
        }
      }
      .rc-md-editor .editor-container > .section > .section-container {
        padding: 0;
      }
      width: 100%;
      margin: 0;
      .editorNull {
        border: none;
      }
      @media screen and (max-width: 600px) {
        padding: 30px 16px;
      }
    }
    @media screen and (min-width: 1024px) {
      padding: 50px 80px;
      display: flex;
      min-width: 0;
      max-width: 1400px;
      .titles {
        flex: 3;
        height: 100%;
        position: sticky;
        top: 122px;
      }
      .conRich {
        flex: 7;
        height: 100%;
        overflow: auto;
      }
    }
  }
  &.hideHeader {
    @media screen and (min-width: 1024px) {
      .titles {
        top: 50px;
      }
    }
  }
  .sideCon {
    display: block;
  }
  @media screen and (max-width: 1024px) {
    .sideCon {
      display: none;
    }
    &.isOpen {
      .sideCon {
        display: block;
      }
    }
  }
`;

const LegalPortalCon = props => {
  const str = 'legalportal/';
  const [{ loading, hLoading, legalInfo, keys, key, isOpen }, setState] = useSetState({
    hLoading: true,
    loading: true,
    legalInfo: {},
    keys: [],
    key: '',
    isOpen: false,
  });

  useEffect(() => {
    getKeys();
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        getSideInfo();
      }, 200);
    }
  }, [loading]);

  const getLastPartOfUrl = url => {
    let lastSlashIndex = url.lastIndexOf(str);
    if (lastSlashIndex === -1) {
      return '';
    }
    return url.substring(lastSlashIndex + str.length);
  };

  const getKeys = () => {
    privateLegalApi.getLegalList({}).then(res => {
      const key = getLastPartOfUrl(location.pathname);
      const list = res.filter(o => o.status === 1);
      setState({
        keys: list,
        key: key ? key : list[0].key,
      });
      getContextBykey(key ? key : res[0].key);
    });
  };

  const getContextBykey = key => {
    privateLegalApi
      .getLegalDetailByKey({
        key,
      })
      .then(data => {
        setState({
          loading: false,
          legalInfo: { ...data, content: data.content },
        });
      });
  };

  const getSideInfo = () => {
    const getContent = () => {
      let contentDiv = document.querySelector('.ck-read-only');
      if (legalInfo.type === 2) {
        contentDiv = document.querySelector('.html-wrap');
      }
      let headingContents = [];
      const headings = contentDiv.querySelectorAll('h1, h2');
      headings.forEach(function (heading, index) {
        const id = `heading-${index}`;
        heading.id = id;
        let tagName = heading.tagName.toLowerCase().slice(1);
        headingContents.push({
          level: tagName,
          content: heading.textContent || heading.innerText,
          heading,
          id,
        });
      });
      return headingContents;
    };
    const headingContents = getContent();
    setState({
      hLoading: false,
      legalInfo: { ...legalInfo, titles: headingContents },
    });
  };
  const { SysSettings } = md.global;
  const request = getRequest();

  const renderSide = () => {
    return (
      <div className="sideCon">
        {keys.map(item => {
          const isCur = item.key === key;
          return (
            <div className="keyItem">
              <div
                className={cx('keyTitle Hand', { isCur })}
                onClick={() => {
                  if (isCur) {
                    const target = document.getElementById(`contextTitle_${key}`);
                    if (target) {
                      window.scrollTo({
                        top: target.offsetTop - 100,
                        behavior: 'smooth', // 平滑滚动
                      });
                    }
                    return;
                  }
                  function getBeforeLegalPortal(url) {
                    let parts = url.split('/legalportal');
                    return parts[0];
                  }
                  let result = getBeforeLegalPortal(location.pathname);
                  history.pushState(
                    {},
                    '',
                    `${result}/legalportal/${item.key}${request.hideHeader ? `?hideHeader=${request.hideHeader}` : ''}`,
                  );
                  setState({ key: item.key, loading: true, legalInfo: {} });
                  getContextBykey(item.key);
                }}
              >
                {item.name}
              </div>
              {isCur && (legalInfo.titles || []).length > 0 && (
                <div className="legalTitles">
                  {legalInfo.titles.map(o => {
                    return (
                      <a href={`#${o.id}`}>
                        <div
                          className={cx('titlesLi Gray Hand ThemeHoverColor3 Font16 TxtLeft', 'titlesLiH' + o.level)}
                          onClick={e => {
                            e.preventDefault(); // 阻止默认行为
                            const target = document.getElementById(o.id);
                            var offsetTop =
                              target.getBoundingClientRect().top +
                              window.pageYOffset -
                              document.documentElement.clientTop;
                            if (target) {
                              window.scrollTo({
                                top: offsetTop - 100,
                                behavior: 'smooth', // 平滑滚动
                              });
                            }
                          }}
                        >
                          {o.content}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <WrapPage className="">
      {request.hideHeader != 1 && (
        <div className="headerPage flexRow alignItemsCenter">
          <img src={SysSettings.brandLogoUrl} height={48} />
          <div className="flex Bold Font24 Gray mLeft24">{_l('法律门户')}</div>
        </div>
      )}
      <Wrap
        className={cx('flexRow alignItemsCenter justifyContentCenter', {
          'pTop0 hideHeader': request.hideHeader == 1,
          isOpen,
        })}
      >
        <div className={cx('con flex')}>
          {keys.length > 0 && (
            <div className="titles">
              <div
                className={cx('flexRow mCon Hand alignItemsCenter', { mBottom10: isOpen })}
                onClick={() =>
                  setState({
                    isOpen: !isOpen,
                  })
                }
              >
                <span className="flex Font16">{_l('目录')}</span>
                <Icon icon={isOpen ? 'arrow-up-border' : 'arrow-down-border'} className="Font18" />
              </div>
              {renderSide()}
            </div>
          )}
          <div
            className={cx('conRich', {
              // Alpha0: hLoading
            })}
          >
            {loading ? (
              <LoadDiv />
            ) : (
              <div>
                <div className="contextTitle" id={`contextTitle_${key}`}>
                  {keys.find(o => o.key === key).name}
                </div>
                {legalInfo.type === 1 ? (
                  <RichText data={legalInfo.content || ' '} className={''} disabled={true} backGroundColor={'#fff'} />
                ) : (
                  <Markdown value={legalInfo.content || ' '} maxHeight={'100%'} minHeight={'100%'} disabled />
                )}
              </div>
            )}
          </div>
        </div>
      </Wrap>
    </WrapPage>
  );
};

const WrappedComp = preall(LegalPortalCon, { allowNotLogin: true });
const root = createRoot(document.querySelector('#legalportal'));

root.render(<WrappedComp />);

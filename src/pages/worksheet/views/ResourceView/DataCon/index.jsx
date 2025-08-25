import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { browserIsMobile } from 'src/utils/common';
import GroupCon from './GroupCon';

const Wrap = styled.div`
  width: ${props => (!props.width ? '100%' : props.width + 'px')};
  height: 100%;
  border-right: 2px solid #ddd;
  background-color: #fff;
  flex-shrink: 0;
  .dataCon {
    .searchBar {
      height: 44px;
      min-height: 44px;
      width: 100%;
      padding: 0 12px;
      .icon {
        line-height: 35px;
        font-size: 20px;
        color: #bdbdbd;
        &.icon-close {
          cursor: pointer;
        }
        &.icon-search {
          &:hover {
            color: #bdbdbd;
          }
        }
        &:hover {
          color: #1677ff;
        }
      }
      input {
        width: 100%;
        height: 36px;
        border: none;
        padding-left: 6px;
        font-size: 13px;
      }
    }
  }
  &.mobileResourceViewLeftCon {
    width: auto;
    max-width: 30%;
  }
`;

export default function DataCon(props) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const isMobile = browserIsMobile();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 200);
  });

  const renderContent = () => {
    const { resourceview, updateKeyWords, view, controls } = props;
    const { keywords } = resourceview;
    const { viewControl } = view;
    const str = (controls.find(o => o.controlId === viewControl) || {}).controlName;
    return (
      <div className="dataCon flexColumn h100">
        {isMobile ? (
          <div className="searchBar"></div>
        ) : (
          <div className={cx('searchBar flexRow', {})}>
            <React.Fragment>
              <i className="icon icon-search"></i>
              <input
                type="text"
                placeholder={_l('搜索%0', str)}
                ref={inputRef}
                className={cx('flex', { placeholderColor: !keywords })}
                value={keywords}
                onChange={e => updateKeyWords(e.target.value)}
              />
            </React.Fragment>
            {keywords && (
              <i
                className="icon icon-cancel Hand"
                onClick={() => {
                  updateKeyWords('');
                }}
              ></i>
            )}
          </div>
        )}
        <GroupCon {...props} />
      </div>
    );
  };
  return (
    <Wrap width={props.directoryWidth} className={cx('resourceViewLeftCon', { mobileResourceViewLeftCon: isMobile })}>
      {!loading &&
        (_.get(props, 'resourceview.loading') && props.renderLoading ? props.renderLoading() : renderContent())}
    </Wrap>
  );
}

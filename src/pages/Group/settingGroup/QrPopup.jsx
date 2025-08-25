import React from 'react';
import { useSetState } from 'react-use';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';

const Popup = styled.div`
  position: relative;
  background-color: #fff;
  padding: 15px 15px 12px;
  width: 230px;
  box-shadow: 0px 1px 6px 1px rgba(0, 0, 0, 0.24);
  border-radius: 6px;
  .error {
    color: #f44336;
    text-align: center;
    line-height: 130px;
  }
  .tip {
    font-size: 14px;
    color: #333;
    margin-bottom: 10px;
    font-weight: bold;
    text-align: center;
  }
  .loadingCon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 130px;
  }
  &::before {
    content: '';
    position: absolute;
    width: 0px;
    height: 0px;
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    border-bottom: 11px solid #eee;
    top: -11px;
    left: calc(50% - 12px);
  }
  &::after {
    content: '';
    position: absolute;
    width: 0px;
    height: 0px;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #fff;
    top: -10px;
    left: calc(50% - 10px);
  }
  &.top {
    &::before {
      border-bottom: none;
      border-top: 11px solid #eee;
      top: auto;
      bottom: -11px;
    }
    &::after {
      border-bottom: none;
      border-top: 10px solid #fff;
      top: auto;
      bottom: -10px;
    }
  }
`;

export default function QrPopup(props) {
  const { popupPosition = 'bottom', tip, getLink, data, children } = props;

  const [{ popupVisible, loading, link }, setState] = useSetState({
    popupVisible: false,
    loading: !data,
    link: data,
  });

  const handleVisible = newVisible => {
    if (newVisible && !link && getLink) {
      setState({ popupVisible: newVisible });
      getLink().then(res => setState({ link: res.linkUrl, loading: false }));
    } else {
      setState({ popupVisible: newVisible });
    }
  };

  return (
    <Trigger
      popupVisible={popupVisible}
      onPopupVisibleChange={newVisible => handleVisible(newVisible)}
      popupAlign={{
        offset: [0, popupPosition === 'bottom' ? 13 : -13],
        points: popupPosition === 'bottom' ? ['tc', 'bc'] : ['bc', 'tc'],
      }}
      destroyPopupOnHide
      action={['click']}
      popup={
        <Popup className={popupPosition}>
          {tip && <div className="tip">{tip}</div>}
          {loading ? (
            <div className="loadingCon">
              <LoadDiv size="small" />
            </div>
          ) : (
            <img src={link} style={{ height: 200, width: 200 }} />
          )}
        </Popup>
      }
    >
      {children}
    </Trigger>
  );
}

QrPopup.propTypes = {
  tip: PropTypes.string,
  data: PropTypes.string,
  popupPosition: PropTypes.string,
  getLink: PropTypes.func,
  children: PropTypes.element.isRequired,
};

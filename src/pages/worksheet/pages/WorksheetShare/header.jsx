import PropTypes from 'prop-types';
import React from 'react';
import { navigateTo } from 'router/navigateTo';
import { Icon } from 'ming-ui';
import color from 'color';
import mingdaoImg from './img/mingdao.png';
import SvgIcon from 'src/components/SvgIcon';
import { SHARE_TYPE } from './config';
import styled from 'styled-components';

const PublicqueryHeader = styled.div`
  width: 100%;
  height: 54px;
  overflow: hidden;
  .btn {
    margin-top: 9px;
    height: 36px;
    opacity: 1;
    background: #2196f3;
    border-radius: 3px;
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    line-height: 36px;
    width: 103px;
    vertical-align: top;
    float: right;
    &:hover {
      background: #2365c0;
    }
  }
`;
class WorksheetShareHeader extends React.Component {
  static propTypes = {
    iconUrl: PropTypes.string,
    relationRowsName: PropTypes.string,
    appName: PropTypes.string,
    iconColor: PropTypes.string,
    count: PropTypes.number,
    setStep: PropTypes.func,
    step: PropTypes.number,
    isSingleRow: PropTypes.bool,
    loading: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      iconUrl,
      iconColor,
      relationRowsName,
      viewName,
      worksheetName,
      appName,
      step,
      count,
      isSingleRow,
      loading,
      isFormDetail,
      isPublicquery,
      publicqueryRes = {},
    } = this.props;
    if (loading || step === SHARE_TYPE.DETAIL || (isSingleRow && step === SHARE_TYPE.WORKSHEETDETAIL)) {
      return '';
    }
    const listStr =
      SHARE_TYPE.WORKSHEET === step
        ? [viewName, worksheetName, appName]
        : [relationRowsName, viewName, worksheetName, appName];
    const str = listStr.filter(o => !!o).join('-');
    return (
      <div className="WorksheetShareHeaderBox">
        <div className="HeaderBox">
          {step === SHARE_TYPE.WORKSHEET &&
            (isPublicquery ? (
              <PublicqueryHeader>
                <span className="Font17">{publicqueryRes.title || _l('公开查询')}</span>
                <div
                  className={'btn'}
                  onClick={() => {
                    this.props.setStep(SHARE_TYPE.PUBLICQUERYINPUT);
                  }}
                >
                  {_l('继续查询')}
                </div>
              </PublicqueryHeader>
            ) : (
              <React.Fragment>
                <div className="appIconWrap">
                  <span
                    className="appIconWrapIcon"
                    style={{
                      backgroundColor: color(iconColor),
                    }}
                  >
                    <SvgIcon url={iconUrl} fill="#fff" size={20} addClassName="mTop3" />
                  </span>
                  <div className="appName Gray Font17 overflow_ellipsis WordBreak">{str}</div>
                  <div className="listNum Font17 Gray_75 mLeft8">({count})</div>
                </div>
           
              </React.Fragment>
            ))}
          {(step === SHARE_TYPE.WORKSHEETDETAIL || step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL) && (
            <div
              className="Font17 Hand back"
              onClick={() => {
                this.props.setStep(isFormDetail ? SHARE_TYPE.WORKSHEETDETAIL : step - 1);
              }}
            >
              <Icon icon="backspace mRight8" />
              {_l('返回')}
            </div>
          )}
          {step === SHARE_TYPE.WORKSHEETDNEXT && (
            <div className="appIconWrap">
              <div
                className="Font17 Hand back"
                onClick={() => {
                  this.props.setStep(step - 1);
                }}
              >
                <Icon icon="backspace" className="backIcon" />
                <div className="appName Gray Font17 overflow_ellipsis WordBreak">{relationRowsName}</div>
                <div className="listNum Font17 Gray_75 mLeft8">({count})</div>
              </div>
            
            </div>
          )}
         
        </div>
      </div>
    );
  }
}

export default WorksheetShareHeader;

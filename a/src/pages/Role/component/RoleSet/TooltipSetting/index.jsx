import React, { PureComponent } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import styled from 'styled-components';
import SheetSet from './sheetSet';
import OptionSet from './optionSet';
import ControlSet from './controlSet';
import SvgIcon from 'src/components/SvgIcon';
import { getCustomWidgetUri } from 'src/pages/worksheet/constants/common';
import worksheetApi from 'src/api/worksheet';

const WrapCon = styled.div`
  .cover {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1;
  }
`;
const Wrap = styled.div`
  padding: 24px 40px;
  width: 880px;
  background: #ffffff;
  box-shadow: 0px 12px 24px 1px rgba(0, 0, 0, 0.16);
  right: 0;
  position: fixed;
  top: 0;
  height: 100%;
  bottom: 0;
  z-index: 1000;
  .headerCon {
    font-weight: 600;
    font-size: 17px;
    margin-bottom: 12px;
  }
  .tabCon {
    border-bottom: 1px solid #dddddd;
    li {
      display: inline-block;
      padding: 13px;
      border-bottom: 3px solid transparent;
      font-weight: 600;
      &.cur {
        color: #2196f3;
        border-bottom: 3px solid #2196f3;
      }
    }
  }
  .setCon {
    overflow: auto;
  }
  .pointer {
    color: #bdbdbd;
    &:hover {
      color: #2196f3;
    }
  }
`;

const tabList = [_l('记录范围'), _l('操作'), _l('字段')];
export default class Con extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showFieldSettingDialog: false,
      tab: 0,
      extendAttrList: [],
    };
  }

  componentDidMount() {
    const { sheet } = this.props;
    worksheetApi.getExtendAttrOptionalControl({ worksheetId: sheet.sheetId }).then(res => {
      this.setState({
        extendAttrList: res
      })
    });
  }

  renderContent = () => {
    switch (this.state.tab) {
      case 0:
        return <SheetSet {...this.props} extendAttrList={this.state.extendAttrList} />;
      case 1:
        return <OptionSet {...this.props} />;
      case 2:
        return <ControlSet {...this.props} />;
    }
  };

  render() {
    const { showRoleSet, onClose, sheet, projectId, appId } = this.props;
    const { iconUrl, sheetName, sheetId } = sheet;
    const { tab = 0 } = this.state;
    return (
      <CSSTransitionGroup
        component={'div'}
        transitionName={'roleSettingSlide'}
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
      >
        {showRoleSet ? (
          <WrapCon>
            <div
              className="cover"
              onClick={() => {
                onClose();
              }}
            ></div>
            <Wrap className="roleSettingWrap flexColumn">
              <div className="">
                <div className="headerCon flexRow">
                  <div className="flex flexRow alignItemsCenter">
                    {iconUrl && <SvgIcon url={sheet.iconUrl} fill={'#757575'} size={24} />}
                    <span className="overflow_ellipsis TxtLeft mLeft5">{sheetName}</span>{' '}
                    <Icon
                      className="Font16 pointer mLeft8 Hand"
                      icon="launch"
                      onClick={() => {
                        getCustomWidgetUri({
                          sourceName: sheetName,
                          templateId: '',
                          sourceId: sheetId,
                          projectId,
                          appconfig: {
                            appId,
                            appSectionId: '',
                          },
                        });
                      }}
                    />
                  </div>
                  <Icon
                    icon="close"
                    className="Right LineHeight25 Gray_9 Hand Font22 ThemeHoverColor3"
                    onClick={onClose}
                  />
                </div>
                <ul className="tabCon TxtLeft">
                  {tabList.map((o, i) => {
                    return (
                      <li
                        className={cx('Hand Font15 mRight24', { cur: i === tab })}
                        onClick={() => {
                          this.setState({
                            tab: i,
                          });
                        }}
                      >
                        {o}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="setCon flex">{this.renderContent()}</div>
            </Wrap>
          </WrapCon>
        ) : null}
      </CSSTransitionGroup>
    );
  }
}

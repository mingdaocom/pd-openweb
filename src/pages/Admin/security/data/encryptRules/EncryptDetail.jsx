import React, { Component } from 'react';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import { Dialog } from 'ming-ui';
import EncryptBaseInfo from './EncryptBaseInfo';
import EncryptFieldList from './EncryptFieldList';
import styled from 'styled-components';
import cx from 'classnames';

const DetailDialog = styled(Dialog)`
  height: unset !important;
  .mui-dialog-header {
    padding: 22px 20px 20px !important;
    .mui-dialog-default-title {
      font-weight: 600;
    }
  }
  .mui-dialog-body {
    padding: 0 !important;
    overflow: hidden !important;
  }
`;

const TabWrap = styled.div`
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid #ddd;
  .tabItem {
    height: 100%;
    font-size: 13px;
    color: #151515;
    margin-right: 26px;
    padding-bottom: 12px;
  }
  .active {
    color: #2196f3;
    font-weight: 600;
    border-bottom: 2px solid #2196f3;
  }
`;

const TabList = [
  { tab: 1, title: _l('基本信息') },
  { tab: 2, title: _l('已加密字段') },
];

class EncryptDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 1,
    };
  }
  render() {
    const { onCancel, projectId, encryptRuleId, ruleDetail } = this.props;
    const { currentTab } = this.state;
    const windowHeight = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;

    return (
      <DetailDialog
        width={780}
        title={_l('加密规则详情')}
        visible
        onCancel={onCancel}
        showFooter={false}
        showCancel={false}
        maxHeight={windowHeight - 70}
      >
        <div className="flexColumn" style={{ height: `${windowHeight - 200}px` }}>
          <TabWrap>
            {TabList.map(item => (
              <div
                key={item.tab}
                className={cx('tabItem Hand', { active: currentTab === item.tab })}
                onClick={() => this.setState({ currentTab: item.tab })}
              >
                {item.title}
              </div>
            ))}
          </TabWrap>
          {currentTab === 1 && (
            <EncryptBaseInfo
              projectId={projectId}
              encryptRuleId={encryptRuleId}
              ruleDetail={ruleDetail}
              updateCurrentRow={this.props.updateCurrentRow}
            />
          )}
          {currentTab === 2 && <EncryptFieldList projectId={projectId} encryptRuleId={encryptRuleId} />}
        </div>
      </DetailDialog>
    );
  }
}

export const encryptDetailCon = props => FunctionWrap(EncryptDetail, { ...props });

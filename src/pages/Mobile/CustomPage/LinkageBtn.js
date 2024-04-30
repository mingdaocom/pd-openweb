import React, { useEffect, useState, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import * as actions from './redux/actions';
import { Popover } from 'antd';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { chartNav } from 'statistics/common';

const Wrap = styled.div`
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #fff;
`;

const AutoLinkagePopover = styled.div`
  width: 300px;
  padding: 5px 0;
  .linkageFilterWrap {
    max-height: 300px;
    overflow-y: auto;
  }
  .linkageFilter {
    padding: 5px 8px;
    border-radius: 4px;
    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

const LinkageBtn = (props) => {
  const { isSuspensionAi, linkageFiltersGroup = {}, deleteLinkageFiltersGroup, deleteAllLinkageFiltersGroup } = props;
  if (_.isEmpty(linkageFiltersGroup)) {
    return null;
  }
  const renderLinkageFiltersPopover = () => {
    const toArray = () => {
      let result = [];
      for(let key in linkageFiltersGroup) {
        const item = linkageFiltersGroup[key];
        result.push({
          key,
          ...item
        });
      }
      return result;
    };
    const res = toArray();
    return (
      <AutoLinkagePopover>
        <div className="valignWrapper" style={{ padding: '0 4px 0 9px' }}>
          <div className="Font17 bold Gray flex">{_l('联动筛选')}</div>
          <Icon className="Font24 Gray_9e pointer" icon="close" onClick={() => document.querySelector('.autoLinkageTrigger').click()} />
        </div>
        {res.length ? (
          <Fragment>
            <div className="linkageFilterWrap">
              {res.map(item => (
                <div className="linkageFilter mTop10" key={item.reportId}>
                  <div className="flexRow alignItemsCenter mBottom2">
                    <Icon className="Font16 mRight5 ThemeColor" icon={_.find(chartNav, { type: item.reportType }).icon} />
                    <div className="flex ellipsis bold">{item.reportName}</div>
                    <Icon className="Font17 Gray_9e pointer" icon="delete2" onClick={() => deleteLinkageFiltersGroup(item.key)} />
                  </div>
                  <div className="flexColumn mLeft20">
                    {item.filters.map(n => (
                      <div
                        key={n.controlId}
                        dangerouslySetInnerHTML={{
                          __html: _l('%0是%1', `<span class="bold mRight2">${n.controlName}</span>`, `<span class="bold mLeft2">${n.controlValue || '--'}</span>`)
                        }}
                      >
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="pointer ThemeColor mTop10 TxtRight"
              onClick={() => {
                deleteAllLinkageFiltersGroup();
                document.querySelector('.autoLinkageTrigger').click();
              }}
            >
              {_l('清空并关闭')}
            </div>
          </Fragment>
        ) : (
          <div className="flexColumn alignItemsCenter justifyContentCenter mTop20 mBottom20">
            <Icon className="Font64 Gray_df" icon="linkage_filter" />
            <div className="Gray_9e mTop5 Font14">{_l('未发起联动筛选')}</div>
          </div>
        )}
      </AutoLinkagePopover>
    );
  }
  return (
    <Popover
      visible={undefined}
      trigger="click"
      placement="topRight"
      arrowPointAtCenter={true}
      content={renderLinkageFiltersPopover()}
    >
      <Wrap
        className="flexRow alignItemsCenter justifyContentCenter card autoLinkageTrigger"
        style={{ bottom: isSuspensionAi ? 140 : undefined }}
      >
        <Icon icon="linkage_filter" className="Font22 ThemeColor" />
      </Wrap>
    </Popover>
  );
};

export default connect(
  state => ({
    linkageFiltersGroup: state.mobile.linkageFiltersGroup,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['deleteLinkageFiltersGroup', 'deleteAllLinkageFiltersGroup']), dispatch),
)(LinkageBtn);

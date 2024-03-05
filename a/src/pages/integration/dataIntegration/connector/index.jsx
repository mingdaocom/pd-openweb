import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Support, ScrollView } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import bg from 'staticfiles/images/banner.png';
import { Button, Icon } from 'ming-ui';
import { Select } from 'antd';
import cx from 'classnames';
import { AddConnector } from './components';
import dataConnectorApi from '../../api/dataConnector';
import dataSourceApi from '../../api/datasource';
import syncTaskApi from '../../api/syncTask';
import _ from 'lodash';
import { ROLE_TYPE } from '../constant';
import './style.less';
import { upgradeVersionDialog, getCurrentProject } from 'src/util';

const ConnectorWrapper = styled.div`
  background: #fff;
  min-height: 100%;

  .headerWrapper {
    height: 400px;
    background-color: rgba(33, 150, 243, 0.04);
    box-sizing: border-box;

    .headerContent {
      padding: 50px 0 0 48px;
      background: url(${bg}) no-repeat 85% center;
      background-size: auto 80%;
      width: 100%;
      height: calc(100% - 80px);
      max-height: calc(100% - 80px);
    }
  }

  .formCardWrapper {
    padding: 0 48px;
  }

  .optionItem {
    .dsTypeIcon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 22px;
      height: 22px;
      margin-left: 2px;
      border-radius: 50%;
      .svg-icon {
        width: 18px;
        height: 18px;
      }
    }
    .nameText {
      margin-left: 10px;
      color: #333;
      font-size: 14px;
    }
  }
`;

const FormCard = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 160px;
  min-width: 800px;
  max-width: 1500px;
  margin: -80px auto 0 auto;
  padding: 48px;
  background: #fff;
  border-radius: 16px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 3px 8px 0px, rgba(0, 0, 0, 0.06) 0px 0px 2px 0px;

  .lineHeight20 {
    line-height: 20px;
  }
  .arrowIcon {
    color: #d0d0d0;
    font-size: 24px;
    margin: 26px 16px 0 16px;
    transform: rotate(-90deg);
  }
  .selectItem {
    width: 100%;
    margin-right: 16px;
    margin-top: 6px;

    .ant-select-selector {
      min-height: 48px;
      padding: 8px 11px !important;
      border: 2px solid #eaeaea !important;
      border-radius: 8px !important;
      box-shadow: none !important;

      .ant-select-selection-search {
        top: 8px !important;
      }
    }

    &.ant-select-focused {
      .ant-select-selector {
        border-color: #2196f3 !important;
      }
    }
  }
  .nextButton {
    width: 180px;
    height: 48px;
    margin-top: 26px;
    margin-left: 16px;
    min-width: 180px;
    max-width: 180px;
    background: #2196f3;
    border-radius: 8px !important;

    &.disabled {
      background: #6dc5fd !important;
    }
  }
`;

const ContentWrapper = styled.div`
  padding: 40px 48px;
  max-width: 1600px;
  margin: 0 auto;
`;

const ConnectorCard = styled.div`
  min-width: 320px;
  margin-bottom: 24px;
  display: inline-block;
  padding: 0 12px;
  &.connectorCardWidth1 {
    width: 100%;
  }

  &.connectorCardWidth2 {
    width: 50%;
  }

  &.connectorCardWidth3 {
    width: 33.33%;
  }

  &.connectorCardWidth4 {
    //临时调整，数据多时改回
    width: 33.33%;
    /* width: 25%; */
  }

  .connectorContent {
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 16px;
    padding: 40px 55px;
    cursor: pointer;

    &:hover {
      box-shadow: rgba(0, 0, 0, 0.12) 0px 2px 5px;
      border: 1px solid #fff;
    }

    .typeIcon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      .svg-icon {
        width: 36px;
        height: 36px;
      }
    }
    .arrowIcon {
      color: #ddd;
      transform: rotate(-90deg);
    }
    .nameText {
      white-space: nowrap;
      margin-top: 15px;
      font-size: 15px;
      line-height: 20px;
      color: #333;
    }
  }
`;

function Connector(props) {
  const [connectorConfigData, setConnectorConfigData] = useSetState({});
  const [addVisible, setAddVisible] = useState(false);
  const [connectorList, setConnectorList] = useState([]);
  const [sourceOptionsData, setSourceOptionsData] = useState([]);
  const selectOptionListRef = useRef();
  const TYPES = [
    { title: _l('数据源类型'), key: 'source' },
    { title: _l('目的地类型'), key: 'dest' },
  ];

  useEffect(() => {
    dataConnectorApi.getCommonTypes({ projectId: props.currentProjectId }).then(res => res && setConnectorList(res));
    dataSourceApi
      .getTypes({
        projectId: props.currentProjectId,
        onlyRelatedTask: false,
        onlyCreated: false,
      })
      .then(res => {
        res && setSourceOptionsData(res);
      });
  }, []);

  const getRowCount = () => {
    const contentWidth = (props.width >= 1600 ? 1600 : props.width) - 50 * 2;
    //每行card数
    const rowCount = Math.floor(contentWidth / (320 + 24)) < 1 ? 1 : Math.floor(contentWidth / (320 + 24));

    return rowCount;
  };

  const onClickNext = () => {
    const { licenseType } = getCurrentProject(props.currentProjectId);

    // 付费版不限量
    if (licenseType === 1) {
      setAddVisible(true);
    } else {
      syncTaskApi.createOnlySyncTaskPreCheck({ projectId: props.currentProjectId }).then(res => {
        if (res.currentTaskNum >= res.maxTaskNum) {
          upgradeVersionDialog({
            projectId: props.currentProjectId,
            hint: _l('余量已达到最大值'),
            explainText: md.global.Config.IsLocal
              ? _l('当前版本最多可创建%0个同步任务, 请升级版本以创建更多同步任务', res.maxTaskNum)
              : _l('免费版最多可创建%0个同步任务, 请升级版本以创建更多同步任务', res.maxTaskNum),
            isFree: true,
          });
        } else {
          setAddVisible(true);
        }
      });
    }
  };

  return (
    <ScrollView>
      <ConnectorWrapper>
        <div className="headerWrapper">
          <div className="headerContent">
            <h3 className="Bold Font24">{_l('创建连接器')}</h3>
            <p className="Font15 flexRow alignItemsCenter">
              {_l('连接到外部数据源进行数据实时同步')}{' '}
              <Support type={3} href="https://help.mingdao.com/integration2" text={_l('使用帮助')} />
            </p>
          </div>
        </div>

        <div className="formCardWrapper">
          <FormCard>
            {TYPES.map((item, i) => {
              return (
                <Fragment key={i}>
                  <div className="flex">
                    <div className="bold lineHeight20">{item.title}</div>
                    <div ref={selectOptionListRef}>
                      <Select
                        className="selectItem"
                        placeholder={_l('请选择')}
                        notFoundContent={_l('暂无数据')}
                        getPopupContainer={() => selectOptionListRef.current}
                        showSearch={true}
                        options={sourceOptionsData
                          .filter(t => _.includes([ROLE_TYPE.ALL, item.key.toUpperCase()], t.roleType))
                          .map(item => {
                            return {
                              ...item,
                              label: (
                                <div className="flexRow alignItemsCenter optionItem">
                                  <div className="dsTypeIcon" style={{ background: item.iconBgColor }}>
                                    <svg className="icon svg-icon" aria-hidden="true">
                                      <use xlinkHref={`#icon${item.className}`} />
                                    </svg>
                                  </div>
                                  <span className="nameText">{item.name}</span>
                                </div>
                              ),
                              value: item.type,
                            };
                          })}
                        value={_.get(connectorConfigData, [item.key, 'type'])}
                        filterOption={(inputValue, option) => {
                          return option.name.toLowerCase().includes(inputValue.toLowerCase());
                        }}
                        onChange={(_, value) => setConnectorConfigData({ [item.key]: value })}
                      />
                    </div>
                  </div>
                  {i === 0 && <Icon icon="arrow_down" className="arrowIcon" />}
                </Fragment>
              );
            })}

            <Button
              type="primary"
              className={cx('nextButton', { disabled: !connectorConfigData.source || !connectorConfigData.dest })}
              disabled={!connectorConfigData.source || !connectorConfigData.dest}
              onClick={onClickNext}
            >
              <span className="Font16 bold">{_l('下一步')}</span>
            </Button>
          </FormCard>
        </div>

        <ContentWrapper>
          <h5 className="Bold Font17 Gray_75 mBottom0">{_l('常用连接器')}</h5>
          <div className="mTop16" style={{ margin: '0 -12px' }}>
            {connectorList.map((item, index) => (
              <ConnectorCard key={index} className={`connectorCardWidth${getRowCount()}`}>
                <div
                  className="connectorContent"
                  onClick={() => {
                    setConnectorConfigData({ source: item.source, dest: item.dest });
                    onClickNext();
                  }}
                >
                  <div className="divCenter TxtCenter flexColumn justifyContentCenter alignItemsCenter">
                    <div className="typeIcon" style={{ background: _.get(item, 'source.iconBgColor') }}>
                      <svg className="icon svg-icon" aria-hidden="true">
                        <use xlinkHref={`#icon${_.get(item, 'source.className')}`} />
                      </svg>
                    </div>
                    <div className="nameText">{_.get(item, 'source.name')}</div>
                  </div>
                  <Icon icon="arrow_down" className="arrowIcon Font20 mBottom30 mLeft24 mRight24" />
                  <div className="divCenter TxtCenter flexColumn justifyContentCenter alignItemsCenter">
                    <div className="typeIcon" style={{ background: _.get(item, 'dest.iconBgColor') }}>
                      <svg className="icon svg-icon" aria-hidden="true">
                        <use xlinkHref={`#icon${_.get(item, 'dest.className')}`} />
                      </svg>
                    </div>
                    <div className="nameText">{_.get(item, 'dest.name')}</div>
                  </div>
                </div>
              </ConnectorCard>
            ))}
          </div>
        </ContentWrapper>
      </ConnectorWrapper>

      {addVisible && (
        <AddConnector {...props} onClose={() => setAddVisible(false)} connectorConfigData={connectorConfigData} />
      )}
    </ScrollView>
  );
}

export default autoSize(Connector);

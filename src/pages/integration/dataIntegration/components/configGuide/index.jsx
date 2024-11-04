import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { DATABASE_TYPE } from '../../constant';
import MySQLGuide from './MySQL';
import SqlServerGuide from './SqlServer';
import PostgreSQLGuide from './PostgreSQL';
import OracleGuide from './Oracle';
import MingDaoYunGuide from './MingDaoYun';
import MongoDBGuide from './MongoDB';
import MariaDBGuide from './MariaDB';
import DB2Guide from './DB2';
import KafkaGuide from './Kafka';
import SapHaNa from './SapHaNa';

const TabList = styled.div`
  box-sizing: border-box;
  border-bottom: 1px solid #ddd;

  ul {
    /* text-align: center; */
    li {
      display: inline-block;
      margin-right: 22px;
      box-sizing: border-box;
      border-bottom: 3px solid rgba(0, 0, 0, 0);
      a {
        color: #9e9e9e;
        display: inline-block;
        font-size: 13px;
        padding-bottom: 8px;
      }
      &.isCur {
        border-bottom: 3px solid #2196f3;
        a {
          color: #2196f3;
        }
      }
    }
  }
`;

export default function ConfigGuide(props) {
  const { source, current } = props;
  const [currentTab, setCurrentTab] = useState(props.current);

  useEffect(() => {
    setCurrentTab(current);
  }, [current]);

  const tabList =
    source.roleType === 'ALL'
      ? [
          { key: 'source', text: _l('作为数据源') },
          { key: 'dest', text: _l('作为数据目的地') },
        ]
      : [{ key: 'source', text: _l('作为数据源') }];

  const renderGuideContent = () => {
    switch (source.type) {
      case DATABASE_TYPE.MYSQL:
      case DATABASE_TYPE.ALIYUN_MYSQL:
      case DATABASE_TYPE.TENCENT_MYSQL:
        return <MySQLGuide type={currentTab} />;
      case DATABASE_TYPE.SQL_SERVER:
      case DATABASE_TYPE.ALIYUN_SQLSERVER:
      case DATABASE_TYPE.TENCENT_SQLSERVER:
        return <SqlServerGuide type={currentTab} />;
      case DATABASE_TYPE.POSTGRESQL:
      case DATABASE_TYPE.ALIYUN_POSTGRES:
      case DATABASE_TYPE.TENCENT_POSTGRES:
        return <PostgreSQLGuide type={currentTab} />;
      case DATABASE_TYPE.ORACLE:
        return <OracleGuide type={currentTab} />;
      case DATABASE_TYPE.MONGO_DB:
      case DATABASE_TYPE.ALIYUN_MONGODB:
      case DATABASE_TYPE.TENCENT_MONGODB:
        return <MongoDBGuide type={currentTab} />;
      case DATABASE_TYPE.MARIADB:
      case DATABASE_TYPE.ALIYUN_MARIADB:
      case DATABASE_TYPE.TENCENT_MARIADB:
        return <MariaDBGuide type={currentTab} />;
      case DATABASE_TYPE.APPLICATION_WORKSHEET:
        return <MingDaoYunGuide type={currentTab} />;
      case DATABASE_TYPE.DB2:
        return <DB2Guide type={currentTab} />;
      case DATABASE_TYPE.KAFKA:
        return <KafkaGuide type={currentTab} />;
      case DATABASE_TYPE.HANA:
        return <SapHaNa type={currentTab} />;
      default:
        <div />;
    }
  };

  return (
    <div>
      <h5 className="Bold Font16 mBottom16">{_l('连接 %0 配置指南', source.name)}</h5>
      <TabList>
        <ul>
          {tabList.map((item, index) => {
            return (
              <li
                key={index}
                className={cx({ isCur: item.key === currentTab })}
                onClick={() => {
                  if (currentTab === item.key) {
                    return;
                  }
                  setCurrentTab(item.key);
                }}
              >
                <a className="pLeft18">{item.text}</a>
              </li>
            );
          })}
        </ul>
      </TabList>

      {renderGuideContent()}
    </div>
  );
}

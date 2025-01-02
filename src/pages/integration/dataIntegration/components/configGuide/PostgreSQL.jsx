import React from 'react';
import './index.less';

export default function PostgreSQLGuide(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 PostgreSQL 数据库的数据通过系统实时同步到工作表或者其它数据目的地。')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li className="pointer textUnderline" onClick={() => document.getElementById('versionId').scrollIntoView()}>
          {_l('支持PostgreSQL的版本：9.6, 10, 11, 12+')}
        </li>
        <li
          className="pointer textUnderline"
          onClick={() => document.getElementById('checkDefaultId').scrollIntoView()}
        >
          {_l('检查 max_replication_slots 和  max_wal_senders 的默认值')}
        </li>
        <li>{_l('确保数据库可以与数据集成通信')}</li>
      </ul>

      <h5 id="versionId">{_l('检查 PostgreSQL 版本')}</h5>
      <div className="sqlText">
        <div>SELECT version();</div>
      </div>

      <h5>{_l('检查现有用户权限')}</h5>
      <div>{_l('是否有对要开启CDC的库以及表的权限')}</div>
      <div className="sqlText">
        <div>{_l('##检查库的连接权限')}</div>
        <div>SELECT has_database_privilege(current_user, 'test_db', 'CONNECT');</div>
        <br />
        <div>{_l('##检查表的连接权限')}</div>
        <div>SELECT has_table_privilege(current_user, 'tb_name', 'SELECT');</div>
      </div>
      <p>
        {_l(
          "返回值 has_database_privilege 列会显示 true/false 代表有权限/无权限，其中 current_user 可以换成自定义用户名  'username' 去查询其他账户是否包含对应的权限",
        )}
      </p>

      <h5>{_l('向用户授予所需的权限')}</h5>
      <div>{_l('执行以下授权语句之前，需要先切换到高权限用户')}</div>
      <div className="sqlText">
        <div>{_l('## 授权连接某个数据库')}</div>
        <div>{'GRANT CONNECT ON DATABASE <database_name> TO <database_username>;'}</div>
        <br />
        <div>{_l('## 授权连接某个SCHEMA')}</div>
        <div>{'GRANT USAGE ON SCHEMA <schema_name> TO <database_username>;'}</div>
        <br />
        <div>{_l('## 授权访问某个表')}</div>
        <div>{'GRANT SELECT ON TABLE <table_name> TO <username>;'}</div>
      </div>

      <h5 id="checkDefaultId">{_l('检查 max_replication_slots 和  max_wal_senders 的默认值')}</h5>
      <div>{_l('建议调整到500以上')}</div>
      <div className="sqlText">
        <div>{`SELECT name, setting FROM pg_settings WHERE name in ('max_replication_slots','max_wal_senders');`}</div>
      </div>

      <h5>{_l('对需要同步的表执行')}</h5>
      <div className="sqlText">
        <div>{`ALTER TABLE <schema>.<table> REPLICA IDENTITY FULL`}</div>
      </div>

      <h5>{_l('修改wal_level的配置项')}</h5>
      <div>{_l('修改 postgresql.conf 文件后，需要重新启动 PostgreSQL 服务以使更改生效。')}</div>
      <div className="sqlText">
        <div>{_l('在postgresql.conf文件中修改或添加 wal_level 配置项为：wal_level = logical')}</div>
      </div>
      <p>
        {_l('更多配置项参考')}
        <a href="https://debezium.io/documentation/reference/stable/connectors/postgresql.html" className="mLeft8">
          Debezium Documentation
        </a>
      </p>

      <h5>{_l('测试连接')}</h5>
      <p>
        {_l(
          '测试连接创建数据源时，检查数据库服务器的连通性、账户密码等正确性、数据库是否可用、以及检查是否可以作为源或者目的地。只有数据源通过全部测试才能够正常使用数据源。',
        )}
      </p>

      <h5>{_l('其他连接器选项')}</h5>
      <p>
        {_l(
          '如果数据源的连接器选项配置和数据库服务器配置不一致时，可能会出现同步错误或者创建同步任务失败的情况。此时可尝试添加额外的连接器选项参数配置。',
        )}
        <a
          href="https://ververica.github.io/flink-cdc-connectors/master/content/connectors/postgres-cdc.html#connector-options"
          target="_blank"
          className="mLeft8"
        >
          {_l('查看连接器选项')}
        </a>
      </p>

      <div>
        {_l('阿里云PostgreSQL产品，')}
        <a href="https://www.aliyun.com/product/rds/postgresql" target="_blank" className="mLeft8">
          {_l('点击购买')}
        </a>
      </div>
      <div>
        {_l('腾讯云PostgreSQL产品，')}
        <a href="https://cloud.tencent.com/product/postgres" target="_blank" className="mLeft8">
          {_l('点击购买')}
        </a>
      </div>
    </div>
  ) : (
    <div className="guideContent">
      <p>{_l('你可以将其它数据源的数据实时同步到 PostgreSQL')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('当前账号具有写数据的权限')}</li>
        <li>{_l('确保数据库可以与数据集成通信')}</li>
      </ul>

      <h5>{_l('查看现有用户权限')}</h5>
      <div className="sqlText">
        <div>{_l('##检查写入权限')}</div>
        <div>SELECT has_table_privilege(current_user, 'table_name', 'INSERT');</div>
      </div>

      <h5>{_l('向用户授予所需的权限')}</h5>
      <div className="sqlText">
        <div>{_l('## 授权连接某个数据库')}</div>
        <div>{'GRANT CONNECT ON DATABASE <database_name> TO <database_username>;'}</div>
        <br />
        <div>{_l('## 授权连接某个SCHEMA')}</div>
        <div>{'GRANT USAGE ON SCHEMA <schema_name> TO <database_username>;'}</div>
        <br />
        <div>{_l('## 授权访问某个表')}</div>
        <div>{'GRANT SELECT ON TABLE <table_name> TO <username>;'}</div>
      </div>

      <h5>{_l('测试连接')}</h5>
      <p>
        {_l(
          '测试连接创建数据源时，检查数据库服务器的连通性、账户密码等正确性、数据库是否可用、以及检查是否可以作为源或者目的地。只有数据源通过全部测试才能够正常使用数据源。',
        )}
      </p>

      <div>
        {_l('阿里云PostgreSQL产品，')}
        <a href="https://www.aliyun.com/product/rds/postgresql" target="_blank" className="mLeft8">
          {_l('点击购买')}
        </a>
      </div>
      <div>
        {_l('腾讯云PostgreSQL产品，')}
        <a href="https://cloud.tencent.com/product/postgres" target="_blank" className="mLeft8">
          {_l('点击购买')}
        </a>
      </div>
    </div>
  );
}

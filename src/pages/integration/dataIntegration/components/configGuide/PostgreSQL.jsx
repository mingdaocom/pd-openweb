import React from 'react';
import './index.less';

export default function PostgreSQLGuide(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 PostgreSQL 数据库的数据通过系统实时同步到工作表或者其它数据目的地')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>
          {_l('支持PostgreSQL的版本')}
          <li>9.6, 10, 11, 12</li>
        </li>
        <li>{_l('检查 max_replication_slots 和  max_wal_senders 的默认值')}</li>
        <li>{_l('将系统 IP 添加到 PostgreSQL 服务器的访问白名单')}</li>
      </ul>

      <h5>{_l('检查 PostgreSQL 版本')}</h5>
      <div className="sqlText">
        <div>postgres --version</div>
      </div>

      <h5>{_l('检查 max_replication_slots 和  max_wal_senders 的默认值')}</h5>
      <div className="sqlText">
        <div>{`SELECT name, setting FROM pg_settings WHERE name in ('max_replication_slots','max_wal_senders');`}</div>
      </div>
      <p>{_l('建议调整到500以上')}</p>

      <h5>{_l('查看现有用户权限')}</h5>
      <div className="sqlText">
        <div>psql -U postgres \\du</div>
      </div>

      <h5>{_l('向用户授予所需的权限')}</h5>
      <div className="sqlText">
        <div>{`GRANT CONNECT ON DATABASE <database_name> TO <database_username>;`}</div>
        <div>{`GRANT USAGE ON SCHEMA <schema_name> TO <database_username>;`}</div>
      </div>
      <h5>{_l('修改schema的默认权限，将表上的SELECT权限授予数据库用户')}</h5>
      <div className="sqlText">
        <div>{`ALTER DEFAULT PRIVILEGES IN SCHEMA <schema_name> GRANT SELECT ON TABLE`}</div>
        <div>{`S TO <database_username>;`}</div>
      </div>

      <h5>{_l('对需要同步的表执行')}</h5>
      <div className="sqlText">
        <div>{`ALTER TABLE <schema>.<table> REPLICA IDENTITY FULL`}</div>
      </div>

      <h5>{_l('修改schema的配置项')}</h5>
      <div className="sqlText">
        <div>{_l('在postgresql.conf文件中修改或添加 wal_level 配置项为：wal_level = logical')}</div>
      </div>
      <h5>{_l('测试连接')}</h5>
      <p>
        {_l(
          '创建数据源时，检查数据库服务器的连通性、账户密码等正确性、数据库是否可用、以及检查是否可以作为源或者目的地。只有数据源通过全部测试才能够正常使用数据源。',
        )}
      </p>

      <h5>{_l('其他连接器选项')}</h5>
      <p>
        {_l(
          '如果数据源的连接器选项配置和数据库服务器配置不一致时，可能会出现同步错误或者创建同步任务失败的情况。此时可尝试添加额外的连接器选项参数配置。',
        )}
        <a
          href="https://ververica.github.io/flink-cdc-connectors/master/content/connectors/mysql-cdc%28ZH%29.html#id6"
          target="_blank"
          className="mLeft8"
        >
          {_l('查看连接器选项')}
        </a>
      </p>

      <h5>decoding.plugin.name</h5>
      <div>{_l('PostgreSQL数据库的逻辑解码插件名称，10+版本自带pgoutput，可不指定')}</div>
      <div className="sqlText">
        <div>decoding.plugin.name=wal2json</div>
        <div>{_l('另外可选：')} wal2json,wal2json_rds,wal2json_streaming,wal2json_rds_streaming,pgoutput</div>
        <div></div>
      </div>
    </div>
  ) : (
    <div className="guideContent">
      <p>{_l('你可以将其它数据源的数据实时同步到 PostgreSQL')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('当前账号具有读写数据库的权限')}</li>
        <li>{_l('将系统 IP 添加到 PostgreSQL 服务器的访问白名单 ')}</li>
      </ul>

      <h5>{_l('查看现有用户权限')}</h5>
      <div className="sqlText">
        <div>psql -U postgres \\du</div>
      </div>

      <h5>{_l('向用户授予所需的权限')}</h5>
      <div className="sqlText">
        <div>{`GRANT CONNECT ON DATABASE <database_name> TO <database_username>;`}</div>
        <div>{`GRANT USAGE ON SCHEMA <schema_name> TO <database_username>;`}</div>
      </div>

      <h5>{_l('修改schema的默认权限，将表上的SELECT权限授予数据库用户')}</h5>
      <div className="sqlText">
        <div>{`ALTER DEFAULT PRIVILEGES IN SCHEMA <schema_name> GRANT SELECT ON TABLE`}</div>
        <div>{`S TO <database_username>;`}</div>
      </div>

      <h5>{_l('测试连接')}</h5>
      <p>
        {_l(
          '创建数据源时，检查数据库服务器的连通性、账户密码等正确性、数据库是否可用、以及检查是否可以作为源或者目的地。只有数据源通过全部测试才能够正常使用数据源。',
        )}
      </p>
    </div>
  );
}

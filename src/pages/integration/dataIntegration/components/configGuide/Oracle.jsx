import React from 'react';
import './index.less';

export default function OracleGuide(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 Oracle 数据库的数据通过系统实时同步到工作表或者其它数据目的地。')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('支持Oracle的版本： 9i、10g、11g、12c+')}</li>
        <li>{_l('启用Oracle数据库的日志归档')}</li>
        <li>{_l('确保数据库可以与数据集成通信')}</li>
      </ul>

      <h5>{_l('非容器数据库（Non-CDB database）')}</h5>
      <p>
        {_l(
          '在 Oracle 12c 之前的版本中，数据库被组织为一个个独立的实例，每个实例可以包含一个或多个数据库。这些数据库被称为非容器数据库，每个数据库都有自己的系统表空间和用户表空间。简而言之，Oracle 12c 之后的版本都是容器数据库CDB。',
        )}
      </p>
      <p className="subTitle">{_l('1. 启用日志归档')}</p>
      <div className="subTitle indent">{_l('1.1 以DBA身份连接到数据库')}</div>
      <div className="sqlText">
        <div>ORACLE_SID=SID</div>
        <div>export ORACLE_SID</div>
        <div>sqlplus /nolog</div>
        <div className="indent">CONNECT sys/password AS SYSDBA</div>
      </div>
      <div className="subTitle indent">{_l('1.2 检查是否启用了日志归档功能')}</div>
      <div className="sqlText">
        <div>-- Should now "Database log mode: Archive Mode"</div>
        <div>archive log list;</div>
      </div>
      <div className="subTitle indent">{_l('1.3 如果未启动，则按照如下启用日志归档')}</div>
      <div className="sqlText">
        <div>alter system set db_recovery_file_dest_size = 10G;</div>
        <div>alter system set db_recovery_file_dest = '/opt/oracle/oradata/recovery_area' scope=spfile;</div>
        <div>shutdown immediate;</div>
        <div>startup mount;</div>
        <div>alter database archivelog;</div>
        <div>alter database open;</div>
      </div>
      <div>{_l('注意')}</div>
      <ul>
        <li>{_l('启用日志归档需要重新启动数据库；')}</li>
        <li>{_l('要注意归档的日志会占用大量的磁盘空间，所以考虑定期清理过期的日志。')}</li>
      </ul>

      <p className="subTitle">{_l('2. 启用补充日志')}</p>
      <p>
        {_l(
          '为了捕获数据库数据变化之前的状态，请务必在表和数据库级别启用补充日志。以下是在表/数据库层面上进行配置的说明：',
        )}
      </p>
      <div className="subTitle indent">{_l('2.1 启用表和库的补充日志记录')}</div>
      <div className="sqlText">
        <div>{_l('##启用表的补充日志记录')}</div>
        <div>ALTER TABLE inventory.customers ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;</div>
        <br />
        <div>{_l('##启用数据库的补充日志记录')}</div>
        <div>ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;</div>
      </div>

      <p className="subTitle">{_l('3. 创建一个Oracle用户并配置权限')}</p>
      <p>{_l('在创建同步任务的时候使用这个用户去配置连接')}</p>
      <div className="subTitle indent">{_l('3.1 创建表空间')}</div>
      <div className="sqlText">
        <div>sqlplus sys/password@host:port/SID AS SYSDBA;</div>
        <div>
          CREATE TABLESPACE logminer_tbs DATAFILE '/opt/oracle/oradata/SID/logminer_tbs.dbf' SIZE 25M REUSE AUTOEXTEND
          ON MAXSIZE UNLIMITED;
        </div>
        <div>exit;</div>
      </div>
      <div className="subTitle indent">{_l('3.2 创建一个用户并授予权限')}</div>
      <div className="sqlText">
        <div>sqlplus sys/password@host:port/SID AS SYSDBA;</div>
        <div className="indent">
          CREATE USER flinkuser IDENTIFIED BY flinkpw DEFAULT TABLESPACE LOGMINER_TBS QUOTA UNLIMITED ON LOGMINER_TBS;
        </div>
        <div className="indent">GRANT CREATE SESSION TO flinkuser;</div>
        <div className="indent">GRANT SET CONTAINER TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$DATABASE to flinkuser;</div>
        <div className="indent">GRANT FLASHBACK ANY TABLE TO flinkuser;</div>
        <div className="indent">GRANT SELECT ANY TABLE TO flinkuser;</div>
        <div className="indent">GRANT SELECT_CATALOG_ROLE TO flinkuser;</div>
        <div className="indent">GRANT EXECUTE_CATALOG_ROLE TO flinkuser;</div>
        <div className="indent">GRANT SELECT ANY TRANSACTION TO flinkuser;</div>
        <div className="indent">GRANT LOGMINING TO flinkuser;</div>
        <div className="indent">GRANT CREATE TABLE TO flinkuser;</div>
        <div className="indent">-- need not to execute if set scan.incremental.snapshot.enabled=true(default)</div>
        <div className="indent">GRANT LOCK ANY TABLE TO flinkuser;</div>
        <div className="indent">GRANT ALTER ANY TABLE TO flinkuser;</div>
        <div className="indent">GRANT CREATE SEQUENCE TO flinkuser;</div>
        <div className="indent">GRANT EXECUTE ON DBMS_LOGMNR TO flinkuser;</div>
        <div className="indent">GRANT EXECUTE ON DBMS_LOGMNR_D TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$LOG TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$LOG_HISTORY TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$LOGMNR_LOGS TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$LOGMNR_CONTENTS TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$LOGMNR_PARAMETERS TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$LOGFILE TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$ARCHIVED_LOG TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$ARCHIVE_DEST_STATUS TO flinkuser;</div>
        <div className="indent">exit;</div>
      </div>

      <h5>{_l('容器数据库（CDB database）')}</h5>
      <div className="subTitle">{_l('1. 启用日志归档')}</div>
      <div className="sqlText">
        <div>ORACLE_SID=ORCLCDB</div>
        <div>export ORACLE_SID</div>
        <div>sqlplus /nolog</div>
        <div className="indent">CONNECT sys/password AS SYSDBA</div>
        <div className="indent">alter system set db_recovery_file_dest_size = 10G;</div>
        <div className="indent">-- should exist</div>
        <div className="indent">
          alter system set db_recovery_file_dest = '/opt/oracle/oradata/recovery_area' scope=spfile;
        </div>
        <div className="indent">shutdown immediate</div>
        <div className="indent">startup mount</div>
        <div className="indent">alter database archivelog;</div>
        <div className="indent">alter database open;</div>
        <div className="indent">-- Should show "Database log mode: Archive Mode"</div>
        <div className="indent">archive log list</div>
        <div className="indent">exit;</div>
      </div>
      <div>{_l('也可以这样启用日志归档')}</div>
      <div className="sqlText">
        <div>{_l('## 为表启用补充日志记录:')}</div>
        <div>ALTER TABLE inventory.customers ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;</div>
        <br />
        <div>{_l('## 为数据库启用补充日志记录')}</div>
        <div>ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;</div>
      </div>

      <p className="subTitle">{_l('2. 创建一个Oracle用户并配置权限')}</p>
      <div>{_l('在创建同步任务的时候使用这个用户去连接')}</div>
      <div className="sqlText">
        <div>sqlplus sys/password@//localhost:1521/ORCLCDB as sysdba</div>
        <div className="indent">
          CREATE TABLESPACE logminer_tbs DATAFILE '/opt/oracle/oradata/ORCLCDB/logminer_tbs.dbf' SIZE 25M REUSE
          AUTOEXTEND ON MAXSIZE UNLIMITED;
        </div>
        <div className="indent">exit</div>
        <br />
        <div>sqlplus sys/password@//localhost:1521/ORCLPDB1 as sysdba</div>
        <div className="indent">
          CREATE TABLESPACE logminer_tbs DATAFILE '/opt/oracle/oradata/ORCLCDB/ORCLPDB1/logminer_tbs.dbf' SIZE 25M REUSE
          AUTOEXTEND ON MAXSIZE UNLIMITED;
        </div>
        <div className="indent">exit</div>
        <br />
        <div>sqlplus sys/password@//localhost:1521/ORCLCDB as sysdba</div>
        <div className="indent">
          CREATE USER flinkuser IDENTIFIED BY flinkpw DEFAULT TABLESPACE logminer_tbs QUOTA UNLIMITED ON logminer_tbs
          CONTAINER=ALL;
        </div>
        <div className="indent">GRANT CREATE SESSION TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SET CONTAINER TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$DATABASE to flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT FLASHBACK ANY TABLE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ANY TABLE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT_CATALOG_ROLE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT EXECUTE_CATALOG_ROLE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ANY TRANSACTION TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT LOGMINING TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT CREATE TABLE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">-- need not to execute if set scan.incremental.snapshot.enabled=true(default)</div>
        <div className="indent">GRANT LOCK ANY TABLE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT CREATE SEQUENCE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT EXECUTE ON DBMS_LOGMNR TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT EXECUTE ON DBMS_LOGMNR_D TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$LOG TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$LOG_HISTORY TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$LOGMNR_LOGS TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$LOGMNR_CONTENTS TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$LOGMNR_PARAMETERS TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$LOGFILE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$ARCHIVED_LOG TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$ARCHIVE_DEST_STATUS TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">exit</div>
      </div>
      <p>
        {_l('更多配置项参考')}
        <a
          href="https://debezium.io/documentation/reference/stable/connectors/oracle.html#setting-up-oracle"
          className="mLeft8"
        >
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
          href="https://ververica.github.io/flink-cdc-connectors/master/content/connectors/oracle-cdc.html#connector-options"
          target="_blank"
          className="mLeft8"
        >
          {_l('查看连接器选项')}
        </a>
      </p>
    </div>
  ) : (
    <div className="guideContent">
      <p>{_l('你可以将其它数据源的数据实时同步到 Oracle')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('拥有Oracle数据库的写入权限')}</li>
        <li>{_l('将系统 IP 添加到 Oracle 服务器的访问白名单')}</li>
      </ul>

      <h4>{_l('当前账号具有读写数据库的权限：')}</h4>
      <h5>{_l('对于非CDB数据库')}</h5>
      <div>{_l('创建一个具有权限的Oracle用户')}</div>
      <div>1. {_l('创建表空间')}</div>
      <div className="sqlText">
        <div>sqlplus sys/password@host:port/SID AS SYSDBA;</div>
        <div>
          CREATE TABLESPACE logminer_tbs DATAFILE '/opt/oracle/oradata/SID/logminer_tbs.dbf' SIZE 25M REUSE AUTOEXTEND
          ON MAXSIZE UNLIMITED;
        </div>
        <div>exit;</div>
      </div>
      <div>2. {_l('创建一个用户并授予权限')}</div>
      <div className="sqlText">
        <div>sqlplus sys/password@host:port/SID AS SYSDBA;</div>
        <div className="indent">
          CREATE USER flinkuser IDENTIFIED BY flinkpw DEFAULT TABLESPACE LOGMINER_TBS QUOTA UNLIMITED ON LOGMINER_TBS;
        </div>
        <div className="indent">GRANT CREATE SESSION TO flinkuser;</div>
        <div className="indent">GRANT SET CONTAINER TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$DATABASE to flinkuser;</div>
        <div className="indent">GRANT FLASHBACK ANY TABLE TO flinkuser;</div>
        <div className="indent">GRANT SELECT ANY TABLE TO flinkuser;</div>
        <div className="indent">GRANT SELECT_CATALOG_ROLE TO flinkuser;</div>
        <div className="indent">GRANT EXECUTE_CATALOG_ROLE TO flinkuser;</div>
        <div className="indent">GRANT SELECT ANY TRANSACTION TO flinkuser;</div>
        <div className="indent">GRANT LOGMINING TO flinkuser;</div>
        <div className="indent">GRANT CREATE TABLE TO flinkuser;</div>
        <div className="indent">GRANT LOCK ANY TABLE TO flinkuser;</div>
        <div className="indent">GRANT CREATE SEQUENCE TO flinkuser;</div>
        <div className="indent">GRANT EXECUTE ON DBMS_LOGMNR TO flinkuser;</div>
        <div className="indent">GRANT EXECUTE ON DBMS_LOGMNR_D TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$LOG TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$LOG_HISTORY TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$LOGMNR_LOGS TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$LOGMNR_CONTENTS TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$LOGMNR_PARAMETERS TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$LOGFILE TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$ARCHIVED_LOG TO flinkuser;</div>
        <div className="indent">GRANT SELECT ON V_$ARCHIVE_DEST_STATUS TO flinkuser;</div>
        <div className="indent">exit;</div>
      </div>

      <h5>{_l('对于CDB数据库')}</h5>
      <div>{_l('创建一个具有权限的Oracle用户')}</div>
      <div className="sqlText">
        <div>sqlplus sys/password@//localhost:1521/ORCLCDB as sysdba</div>
        <div className="indent">
          CREATE TABLESPACE logminer_tbs DATAFILE '/opt/oracle/oradata/ORCLCDB/logminer_tbs.dbf' SIZE 25M REUSE
          AUTOEXTEND ON MAXSIZE UNLIMITED;
        </div>
        <div className="indent">exit</div>
      </div>

      <div className="sqlText">
        <div>sqlplus sys/password@//localhost:1521/ORCLPDB1 as sysdba</div>
        <div className="indent">
          CREATE TABLESPACE logminer_tbs DATAFILE '/opt/oracle/oradata/ORCLCDB/ORCLPDB1/logminer_tbs.dbf' SIZE 25M REUSE
          AUTOEXTEND ON MAXSIZE UNLIMITED;
        </div>
        <div className="indent">exit</div>
      </div>

      <div className="sqlText">
        <div>sqlplus sys/password@//localhost:1521/ORCLCDB as sysdba</div>
        <div className="indent">
          CREATE USER flinkuser IDENTIFIED BY flinkpw DEFAULT TABLESPACE logminer_tbs QUOTA UNLIMITED ON logminer_tbs
          CONTAINER=ALL;
        </div>
        <div className="indent">GRANT CREATE SESSION TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SET CONTAINER TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$DATABASE to flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT FLASHBACK ANY TABLE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ANY TABLE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT_CATALOG_ROLE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT EXECUTE_CATALOG_ROLE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ANY TRANSACTION TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT LOGMINING TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT CREATE TABLE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT LOCK ANY TABLE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT CREATE SEQUENCE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT EXECUTE ON DBMS_LOGMNR TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT EXECUTE ON DBMS_LOGMNR_D TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$LOG TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$LOG_HISTORY TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$LOGMNR_LOGS TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$LOGMNR_CONTENTS TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$LOGMNR_PARAMETERS TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$LOGFILE TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$ARCHIVED_LOG TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">GRANT SELECT ON V_$ARCHIVE_DEST_STATUS TO flinkuser CONTAINER=ALL;</div>
        <div className="indent">exit</div>
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

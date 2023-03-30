import React from 'react';
import './index.less';

export default function OracleGuide(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 Oracle 数据库的数据通过系统实时同步到工作表或者其它数据目的地。')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('支持Oracle版本： 9i, 10g, 11g，12c')}</li>
        <li>{_l('启用Oracle数据库的日志存档')}</li>
        <li>{_l('将系统 IP 添加到 Oracle 服务器的访问白名单 ')}</li>
      </ul>

      <h5>{_l('对于非CDB数据库')}</h5>
      <div>1. {_l('以DBA身份连接到数据库')}</div>
      <div className="sqlText">
        <div>ORACLE_SID=SID</div>
        <div>export ORACLE_SID</div>
        <div>sqlplus /nolog</div>
        <div className="indent">CONNECT sys/password AS SYSDBA</div>
      </div>
      <div>2. {_l('启用日志归档')}</div>
      <div className="sqlText">
        <div>alter system set db_recovery_file_dest_size = 10G;</div>
        <div>alter system set db_recovery_file_dest = '/opt/oracle/oradata/recovery_area' scope=spfile;</div>
        <div>shutdown immediate;</div>
        <div>startup mount;</div>
        <div>alter database archivelog;</div>
        <div>alter database open;</div>
      </div>
      <p>{_l('启用日志归档需要重新启动数据库，在尝试这样做时要注意')}</p>
      <p>{_l('归档的日志会占用大量的磁盘空间，所以考虑定期清理过期的日志。')}</p>
      <div>3. {_l('检查是否启用了日志归档功能')}</div>
      <div className="sqlText">
        <div>-- Should now "Database log mode: Archive Mode"</div>
        <div>archive log list;</div>
      </div>
      <div>4. {_l('启用补充日志')}</div>
      <p>
        {_l(
          '必须为表或数据库启用补充日志，以使数据变化能够捕获变化的数据库行的之前状态。下面说明了如何在表/数据库层面上进行配置。',
        )}
      </p>
      <div className="indent">4.1 {_l('启用特定表的补充日志记录。')}</div>
      <div className="sqlText">
        <div>ALTER TABLE inventory.customers ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;</div>
      </div>
      <div className="indent">4.2 {_l('启用数据库的补充日志记录。')}</div>
      <div className="sqlText">
        <div>ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;</div>
      </div>
      <div>5. {_l('创建一个具有权限的Oracle用户')}</div>
      <div className="indent">5.1 {_l('创建表空间')}</div>
      <div className="sqlText">
        <div>sqlplus sys/password@host:port/SID AS SYSDBA;</div>
        <div>
          CREATE TABLESPACE logminer_tbs DATAFILE '/opt/oracle/oradata/SID/logminer_tbs.dbf' SIZE 25M REUSE AUTOEXTEND
          ON MAXSIZE UNLIMITED;
        </div>
        <div>exit;</div>
      </div>
      <div className="indent">5.2 {_l('创建一个用户并授予权限')}</div>
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
      <div>1. {_l('启用日志归档')}</div>
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
      <div>2. {_l('另外一种方式启用日志归档')}</div>
      <div className="indent">2.1 {_l('启用特定表的补充日志记录。')}</div>
      <div className="sqlText">
        <div>ALTER TABLE inventory.customers ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;</div>
      </div>
      <div className="indent">2.2 {_l('启用数据库的补充日志记录')}</div>
      <div className="sqlText">
        <div>ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;</div>
      </div>
      <div>3. {_l('创建一个具有权限的Oracle用户')}</div>
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
  ) : (
    <div className="guideContent">
      <p>{_l('你可以将其它数据源的数据实时同步到 Oracle')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('拥有Oracle数据库的写入权限')}</li>
        <li>{_l('将系统 IP 添加到 Oracle 服务器的访问白名单 ')}</li>
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

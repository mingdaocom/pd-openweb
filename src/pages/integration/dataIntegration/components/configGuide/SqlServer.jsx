import React, { useState } from 'react';
import accountAuth from './images/accountAuth.png';
import createAdminAccount from './images/createAdminAccount.png';
import enableAuth from './images/enableAuth.png';
import enableCDC from './images/enableCDC.png';
import queryAgentState from './images/queryAgentState.png';
import restartDb from './images/restartDb.png';
import startAgent from './images/startAgent.png';
import './index.less';

export default function SqlServerGuide(props) {
  const { type } = props;
  const [currentPic, setCurrentPic] = useState('');

  return type === 'source' ? (
    <div className="guideWrapper">
      <div className="guideContent">
        <p>{_l('你可以把 SQL Server 数据库的数据通过系统实时同步到工作表或者其它数据目的地。')}</p>
        <h5>{_l('先决条件')}</h5>
        <ul>
          <li>{_l('支持 SQL Server 的版本：2012, 2014, 2016, 2017, 2019')}</li>
          <li>{_l('在 SQL Server 数据库上启用CDC')}</li>
          <li>{_l('SQL Server代理任务（CDC Agent）是启动状态')}</li>
          <li>{_l('确保数据库可以与数据集成通信')}</li>
          <li>{_l('确保连接数据库时的账号具有当前数据库的 db_owner 或以上权限')}</li>
        </ul>

        <h5>{_l('查询SQLServer数据库版本')}</h5>
        <div className="sqlText">
          <div>SELECT @@VERSION</div>
        </div>

        <h5>{_l('查询数据库是否已经启用CDC(变更数据捕获)')}</h5>
        <div>{_l('返回0代表未启用；1代表已启用')}</div>
        <div className="sqlText">
          <div>select is_cdc_enabled, name from sys.databases where name = 'db_name'</div>
        </div>

        <h5>{_l('启用数据库的CDC')}</h5>
        <div className="sqlText">
          <div>{'USE  ${your_db_name}'}</div>
          <div>GO</div>
          <div>EXEC sys.sp_cdc_enable_db</div>
          <div>GO</div>
        </div>
        <ul>
          <li>{_l('your_db_name：数据库名称')}</li>
        </ul>
        <div>{_l('如果启用 数据库CDC 提示权限不足，请使用sysadmin权限的账号去执行上述SQL')}</div>
        <div className="sqlText">
          <div>{_l('##查询指定的服务器角色 sysadmin 列表')}</div>
          <div>exec sp_helpsrvrolemember 'sysadmin'</div>
        </div>

        <h5>{_l('SQLServer账号的权限说明')}</h5>
        <p>{_l('只有开启数据库CDC才需要sysadmin权限，其余场景下无需sysadmin权限。')}</p>
        <img id="accountAuth" src={accountAuth} onClick={() => setCurrentPic('accountAuth')} />
        <p>TIPS：{_l('如使用数据库读写权限创建同步任务，需在创建数据源的时候必须指定数据库')}</p>

        <h5>{_l('创建专用用户并授权')}</h5>
        <div className="sqlText">
          <div>-- {_l('创建用户')}</div>
          <div>CREATE LOGIN flinkuser WITH PASSWORD = 'Flink@123';</div>
          <div>CREATE USER flinkuser FOR LOGIN flinkuser;</div>
          <div>-- {_l('授予数据库访问权限')}</div>
          <div>ALTER ROLE db_owner ADD MEMBER flinkuser; --{_l('生产环境建议细化权限')}</div>
          <div>GRANT SELECT ON ALL TABLES IN SCHEMA dbo TO flinkuser;</div>
          <div>-- {_l('授予CDC相关权限')}</div>
          <div>GRANT VIEW SERVER STATE TO flinkuser;</div>
          <div>GRANT SELECT ON sys.change_tables TO flinkuser;</div>
          <div>GO</div>
        </div>

        <h5>{_l('查询表是否已经启用CDC(变更数据捕获)')}</h5>
        <div>{_l('返回0代表未启用；1代表已启用')}</div>
        <div className="sqlText">
          <div>select name,is_tracked_by_cdc from sys.tables where name ='table_name';</div>
        </div>

        <h5>{_l('启用表的CDC')}</h5>
        <div className="sqlText">
          <div>EXEC sys.sp_cdc_enable_table</div>
          <div>@source_schema='schema_name',</div>
          <div>@source_name='table_name',</div>
          <div>@role_name=NULL,</div>
          <div>@supports_net_changes=0;</div>
        </div>
        <ul>
          <li>{_l('source_schema：表所在的schema名称')}</li>
          <li>{_l('source_name：表名')}</li>
          <li>{_l('role_name：访问控制角色名称，此处为null不设置访问控制')}</li>
          <li>{_l('supports_net_changes：是否为捕获实例生成一个净更改函数，0：否；1：是')}</li>
        </ul>

        <h5>{_l('查看CDC Agent（代理） 是否正常启动：')}</h5>
        <div className="sqlText">
          <div>EXEC master.dbo.xp_servicecontrol N'QUERYSTATE', N'SQLSERVERAGENT'</div>
        </div>
        <div className="subTitle">{_l('1. 启动agent')}</div>
        <div className="sqlText">
          <div>EXEC master.dbo.xp_servicecontrol N'START', N'SQLSERVERAGENT'</div>
        </div>
        <div className="subTitle">{_l('2. 停止agent')}</div>
        <div className="sqlText">
          <div>EXEC master.dbo.xp_servicecontrol N'STOP', N'SQLSERVERAGENT'</div>
        </div>
        <p className="subTitle">{_l('3. Windows 环境操作开启 CDC agent，点击下图位置代理开启：')}</p>
        <img id="startAgent" src={startAgent} onClick={() => setCurrentPic('startAgent')} />
        <p>{_l('重新启动数据库')}</p>
        <img id="restartDb" src={restartDb} onClick={() => setCurrentPic('restartDb')} />
        <p>{_l('再次查询Agent 状态，确认状态变更为Running')}</p>
        <img id="queryAgentState" src={queryAgentState} onClick={() => setCurrentPic('queryAgentState')} />
        <p>
          {_l('参考微软官方文档关于')}
          <a
            href="https://learn.microsoft.com/zh-cn/sql/relational-databases/track-changes/enable-and-disable-change-data-capture-sql-server?view=sql-server-ver16"
            target="_blank"
            className="mLeft8"
          >
            {_l('启用和禁用“更改数据捕获”')}
          </a>
        </p>

        <h5>{_l('腾讯云SQLServer')}</h5>
        <p>{_l('这里是关于腾讯云上开启CDC的补充，其余部分参考上方配置')}</p>
        <p>
          {_l('腾讯云SQLServer 产品')}
          <a href="https://cloud.tencent.com/product/sqlserver" target="_blank" className="mLeft8">
            https://cloud.tencent.com/product/sqlserver
          </a>
        </p>
        <p className="subTitle">{_l('1. 创建账号，如需要开启数据库CDC，则需要权限为 System Admin')}</p>
        <img id="createAdminAccount" src={createAdminAccount} onClick={() => setCurrentPic('createAdminAccount')} />
        <p className="subTitle">{_l('2. 腾讯云如何开启数据库的CDC')}</p>
        <p>{_l('路径：实例列表-数据库管理-其他-「开启/关闭数据库变更数据库捕获」')}</p>
        <p>{_l('这里只能开启 数据库的CDC，创建表之后 还需要根据表的状态，在确定是否需要开启表的CDC')}</p>
        <img id="enableCDC" src={enableCDC} className="mBottom10" onClick={() => setCurrentPic('enableCDC')} />

        <h5>{_l('阿里云SQLServer')}</h5>
        <p>{_l('这里是关于阿里云上开启CDC的补充，其余部分参考上方配置')}</p>
        <p>
          {_l('阿里云SQLServer产品')}
          <a href="https://www.aliyun.com/product/rds/sqlserver" target="_blank" className="mLeft8">
            https://www.aliyun.com/product/rds/sqlserver
          </a>
        </p>
        <p className="subTitle">{_l('1. 创建账号，如需要开启数据库CDC，则需要权限为 System Admin')}</p>
        <p>
          {_l('根据不同示例和服务资源的不同规格会有无法开启 System Admin权限的问题，具体参见：')}{' '}
          <a href="https://help.aliyun.com/document_detail/170736.html" target="_blank" className="mLeft8">
            https://help.aliyun.com/document_detail/170736.html
          </a>
        </p>
        <img id="enableAuth" src={enableAuth} onClick={() => setCurrentPic('enableAuth')} />
        <p>
          {_l('更多配置项参考')}
          <a
            href="https://ververica.github.io/flink-cdc-connectors/master/content/connectors/sqlserver-cdc.html#connector-options"
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
            href="https://ververica.github.io/flink-cdc-connectors/master/content/connectors/sqlserver-cdc.html#connector-options"
            target="_blank"
            className="mLeft8"
          >
            {_l('查看连接器选项')}
          </a>
        </p>

        <h5>{_l('常见问题')}</h5>
        <div>{_l('创建连接过程出现SSL验证报错，可尝试在 其他连接串参数 增加如下配置')}</div>
        <div className="sqlText">
          <div>encrypt=false</div>
        </div>
      </div>
      {!!currentPic && (
        <div class="markImg" onClick={() => setCurrentPic('')}>
          <div className="h100 flexRow alignItemsCenter">
            <img src={require(`./images/${currentPic}.png`)} />
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="guideContent">
      <p>{_l('你可以将其它数据源的数据实时同步到 SQL Server')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('当前账号是数据库db_owner固定角色的成员')}</li>
        <li>{_l('将系统 IP 添加到 SQL Server 服务器的访问白名单')}</li>
      </ul>

      <h5>{_l('检查 SQL Server 版本')}</h5>
      <div className="sqlText">
        <div>{_l('在 SQL Server 的菜单中找到"帮助-版本"，点击查看对应版本信息。')}</div>
      </div>

      <h5>{_l('授予用户查询,插入,更新,删除表权限')}</h5>
      <div className="sqlText">
        <div>GRANT SELECT,INSERT,UPDATE,DELETE ON [TableName] to [DatabaseUserName]</div>
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

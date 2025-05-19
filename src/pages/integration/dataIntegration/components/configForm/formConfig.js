import { DATABASE_TYPE } from '../../constant';
import { ROLE_TYPE } from '../../constant';
import _ from 'lodash';

export const customFormData = (databaseType, dbRoleType, isCreateConnector, formData = {}, allFieldDisabled) => {
  const pg_sql = [DATABASE_TYPE.POSTGRESQL, DATABASE_TYPE.ALIYUN_POSTGRES, DATABASE_TYPE.TENCENT_POSTGRES];

  const getPostHintText = () => {
    switch (databaseType) {
      case DATABASE_TYPE.MYSQL:
      case DATABASE_TYPE.ALIYUN_MYSQL:
      case DATABASE_TYPE.TENCENT_MYSQL:
      case DATABASE_TYPE.MARIADB:
      case DATABASE_TYPE.ALIYUN_MARIADB:
      case DATABASE_TYPE.TENCENT_MARIADB:
        return '3306';
      case DATABASE_TYPE.SQL_SERVER:
      case DATABASE_TYPE.ALIYUN_SQLSERVER:
      case DATABASE_TYPE.TENCENT_SQLSERVER:
        return '1433';
      case DATABASE_TYPE.POSTGRESQL:
      case DATABASE_TYPE.ALIYUN_POSTGRES:
      case DATABASE_TYPE.TENCENT_POSTGRES:
        return '5432';
      case DATABASE_TYPE.DB2:
        return '50000';
      case DATABASE_TYPE.ORACLE:
        return '1521';
      case DATABASE_TYPE.MONGO_DB:
      case DATABASE_TYPE.ALIYUN_MONGODB:
      case DATABASE_TYPE.TENCENT_MONGODB:
        return '27017';
      case DATABASE_TYPE.KAFKA:
        return '';
      case DATABASE_TYPE.HANA:
        return '30015';
      default:
        return '';
    }
  };

  const commonNameRoleTypeFields = [
    {
      controlId: 'name',
      controlName: _l('数据源名称'),
      type: 2,
      row: 0,
      col: 0,
      required: true,
      size: 6,
      value: _.get(formData, 'name') || '',
      advancedSetting: {
        regex: '{"type":"custom","regex":"^[^\\\\r\\\\n\\\\s-]+$","err":"名称不能包含换行符、空格或-"}',
      },
    },
    {
      controlId: 'roleType',
      controlName: _l('作为'),
      type: 10,
      row: 0,
      col: 1,
      options:
        dbRoleType === 'ALL'
          ? [
              {
                key: ROLE_TYPE.SOURCE,
                value: _l('源'),
                index: 1,
                isDeleted: false,
                score: 0,
              },
              {
                key: ROLE_TYPE.DEST,
                value: _l('目的地'),
                index: 2,
                isDeleted: false,
                score: 0,
              },
            ]
          : [
              {
                key: dbRoleType,
                value: dbRoleType === ROLE_TYPE.SOURCE ? _l('源') : _l('目的地'),
                index: 1,
                isDeleted: false,
                score: 0,
              },
            ],
      required: false,
      value: Object.keys(formData).length !== 0 ? _.get(formData, 'roleType') : `["${ROLE_TYPE.SOURCE}"]`,
      advancedSetting: {
        direction: '0',
        checktype: '0',
      },
      size: 6,
    },
  ];

  const commonRestFields = [
    {
      controlId: 'address',
      controlName: _l('数据库地址'),
      type: 2,
      row: 4,
      col: 0,
      required: true,
      size: 6,
      hint: _l('例如：10.0.0.1'),
      value: _.get(formData, 'address') || '',
    },
    {
      controlId: 'post',
      controlName: _l('端口号'),
      type: 2,
      row: 4,
      col: 1,
      required: true,
      size: 6,
      hint: getPostHintText(),
      value: _.get(formData, 'post') || '',
    },
    {
      controlId: 'user',
      controlName: _l('账号'),
      type: 2,
      row: 5,
      col: 0,
      required: databaseType !== DATABASE_TYPE.ORACLE,
      size: 6,

      value: _.get(formData, 'user') || '',
    },
    {
      controlId: 'password',
      controlName: _l('密码'),
      type: 2,
      row: 5,
      col: 1,
      required: databaseType !== DATABASE_TYPE.ORACLE,
      desc: _l('保存密码后将加密存储，不可查看密码原文'),
      size: 6,
      value: _.get(formData, 'password') || '',
      enumDefault: 2,
      advancedSetting: allFieldDisabled
        ? {}
        : {
            masktype: 'all',
            datamask: '1',
            isdecrypt: '1',
          },
    },
    {
      controlId: 'connectOptions',
      controlName: _l('其他连接串参数'),
      type: 2,
      row: 7,
      col: 0,
      required: false,
      size: 12,
      hint: _l('例如：key1=value1&key2=value2'),
      value: _.get(formData, 'connectOptions') || '',
    },
    {
      controlId: 'cdcParams',
      controlName: _l('其他连接器选项'),
      type: 2,
      row: 8,
      col: 0,
      required: false,
      size: 12,
      hint: _l('例如：key1=value1&key2=value2'),
      value: _.get(formData, 'cdcParams') || '',
    },
  ];

  const basicFormData = [
    ...commonNameRoleTypeFields,
    ...commonRestFields,
    {
      controlId: 'initDb',
      controlName: pg_sql.indexOf(databaseType) !== -1 ? _l('初始数据库') : _l('数据库名称'),
      type: 2,
      row: 6,
      col: 0,
      required: [...pg_sql, DATABASE_TYPE.DB2].indexOf(databaseType) !== -1 ? true : false,
      size: 12,
      value: _.get(formData, 'initDb') || '',
    },
  ];

  const oracleFormData = [
    ...commonNameRoleTypeFields,
    {
      controlId: 'serviceType',
      controlName: _l('服务名类型'),
      type: 11,
      row: 1,
      col: 0,
      options: [
        {
          key: 'ServiceName',
          value: 'ServiceName',
          index: 1,
          isDeleted: false,
          color: '#2196F3',
          score: 0,
        },
        {
          key: 'SID',
          value: 'SID',
          index: 2,
          isDeleted: false,
          color: '#08C9C9',
          score: 0,
        },
      ],
      required: true,
      value: _.get(formData, ['extraParams', 'SID']) !== undefined ? '["SID"]' : `["ServiceName"]`,
      size: 12,
    },
    {
      controlId: 'serviceName',
      controlName: 'ServiceName/SID',
      type: 2,
      row: 2,
      col: 0,
      required: true,
      size: 12,
      value: _.get(formData, ['extraParams', 'serviceName']) || _.get(formData, ['extraParams', 'SID']) || '',
    },

    ...commonRestFields,
  ];

  const mangoDBFormData = [
    ...commonNameRoleTypeFields,
    {
      controlId: 'isSrvProtocol',
      controlName: _l('启用 SRV 记录'),
      type: 36,
      row: 3,
      col: 0,
      required: false,
      size: 6,
      value: _.get(formData, ['extraParams', 'isSrvProtocol']),
    },
    ...commonRestFields,
    {
      controlId: 'initDb',
      controlName: _l('数据库名称'),
      type: 2,
      row: 6,
      col: 0,
      required: false,
      size: 12,
      value: _.get(formData, 'initDb') || '',
    },
  ];

  const kafkaFormData = [
    ...commonNameRoleTypeFields,
    {
      controlId: 'address',
      controlName: _l('服务器地址'),
      type: 2,
      row: 1,
      col: 0,
      required: true,
      size: 6,
      hint: _l('例如：10.0.0.1'),
      value: _.get(formData, 'address') || '',
    },
    {
      controlId: 'post',
      controlName: _l('端口号'),
      type: 2,
      row: 1,
      col: 1,
      required: true,
      size: 6,
      hint: getPostHintText(),
      value: _.get(formData, 'post') || '',
    },
    {
      controlId: 'topic',
      controlName: _l('主题表达式（topic）'),
      type: 2,
      row: 2,
      col: 0,
      required: true,
      size: 12,
      value: _.get(formData, ['extraParams', 'topic']) || '',
    },
    {
      controlId: 'authType',
      controlName: _l('认证方式'),
      type: 11,
      row: 3,
      col: 0,
      size: 6,
      options: [
        {
          key: 'PLAINTEXT',
          value: _l('无认证'),
          index: 1,
          isDeleted: false,
          color: '#08C9C9',
          score: 0,
        },
        {
          key: 'SASL_PLAINTEXT',
          value: _l('账号密码（SASL）'),
          index: 2,
          isDeleted: false,
          color: '#2196F3',
          score: 0,
        },
      ],
      required: true,
      value: _.get(formData, ['extraParams', 'authType']) === 'SASL_PLAINTEXT' ? '["SASL_PLAINTEXT"]' : `["PLAINTEXT"]`,
    },
    ...(_.get(formData, ['extraParams', 'authType']) === 'SASL_PLAINTEXT'
      ? [
          {
            controlId: 'saslMechanism',
            controlName: _l('加密方式'),
            type: 11,
            row: 3,
            col: 1,
            size: 6,
            options: [
              {
                key: 'PLAIN',
                value: 'PLAIN',
                index: 1,
                isDeleted: false,
                color: '#2196F3',
                score: 0,
              },
              {
                key: 'SCRAM-SHA-256',
                value: 'SCRAM-SHA-256',
                index: 2,
                isDeleted: false,
                color: '#08C9C9',
                score: 0,
              },
              {
                key: 'SCRAM-SHA-512',
                value: 'SCRAM-SHA-512',
                index: 3,
                isDeleted: false,
                color: '#00C345',
                score: 0,
              },
            ],
            required: false,
            value: `["${_.get(formData, ['extraParams', 'saslMechanism']) || 'PLAIN'}"]`,
          },
          {
            controlId: 'user',
            controlName: _l('账号'),
            type: 2,
            row: 4,
            col: 0,
            required: false,
            size: 6,
            value: _.get(formData, 'user') || '',
          },
          {
            controlId: 'password',
            controlName: _l('密码'),
            type: 2,
            row: 4,
            col: 1,
            required: false,
            desc: _l('保存密码后将加密存储，不可查看密码原文'),
            size: 6,
            value: _.get(formData, 'password') || '',
            enumDefault: 2,
            advancedSetting: allFieldDisabled
              ? {}
              : {
                  masktype: 'all',
                  datamask: '1',
                  isdecrypt: '1',
                },
          },
        ]
      : []),

    {
      controlId: 'enableSsl',
      controlName: 'SSL',
      hint: _l('使用 SSL 连接'),
      type: 36,
      row: 5,
      col: 0,
      required: false,
      size: 6,
      value: _.get(formData, ['extraParams', 'enableSsl']),
    },
    ...(_.get(formData, ['extraParams', 'enableSsl']) === '1'
      ? [
          {
            controlId: 'sslVerifyType',
            controlName: _l('验证方式'),
            type: 11,
            row: 5,
            col: 1,
            size: 6,
            options: [
              { key: '0', value: _l('单向'), index: 1, isDeleted: false },
              { key: '1', value: _l('双向'), index: 2, isDeleted: false },
            ],
            required: true,
            value: `["${_.get(formData, ['extraParams', 'sslVerifyType']) || '0'}"]`,
          },
          {
            controlId: 'trustStorePath',
            controlName: _l('Truststore文件'),
            type: 14,
            row: 6,
            col: 0,
            required: true,
            size: 6,
            value: _.get(formData, ['extraParams', 'trustStorePath']) || '',
            hint: _l('点击上传.jks文件'),
            advancedSetting: {
              maxcount: '1',
              filetype: '{"type":"0","values":["jks"]}',
            },
          },
          {
            controlId: 'trustStorePwd',
            controlName: _l('Truststore密码'),
            type: 2,
            row: 6,
            col: 1,
            required: true,
            desc: _l('保存密码后将加密存储，不可查看密码原文'),
            size: 6,
            value: _.get(formData, ['extraParams', 'trustStorePwd']) || '',
            enumDefault: 2,
            advancedSetting: allFieldDisabled
              ? {}
              : {
                  masktype: 'all',
                  datamask: '1',
                  isdecrypt: '1',
                },
          },
          ...(_.get(formData, ['extraParams', 'sslVerifyType']) === '1'
            ? [
                {
                  controlId: 'keyStorePath',
                  controlName: _l('Keystore文件'),
                  type: 14,
                  row: 7,
                  col: 0,
                  required: true,
                  size: 6,
                  value: _.get(formData, ['extraParams', 'keyStorePath']) || '',
                  hint: _l('点击上传.jks文件'),
                  advancedSetting: {
                    maxcount: '1',
                    filetype: '{"type":"0","values":["jks"]}',
                  },
                },
                {
                  controlId: 'keyStorePwd',
                  controlName: _l('Keystore密码'),
                  type: 2,
                  row: 7,
                  col: 1,
                  required: true,
                  desc: _l('保存密码后将加密存储，不可查看密码原文'),
                  size: 6,
                  value: _.get(formData, ['extraParams', 'keyStorePwd']) || '',
                  enumDefault: 2,
                  advancedSetting: allFieldDisabled
                    ? {}
                    : {
                        masktype: 'all',
                        datamask: '1',
                        isdecrypt: '1',
                      },
                },
                {
                  controlId: 'keyPrivatePwd',
                  controlName: _l('Keystore私钥密码'),
                  type: 2,
                  row: 8,
                  col: 0,
                  required: false,
                  desc: _l('保存密码后将加密存储，不可查看密码原文'),
                  size: 12,
                  value: _.get(formData, ['extraParams', 'keyPrivatePwd']) || '',
                  enumDefault: 2,
                  advancedSetting: allFieldDisabled
                    ? {}
                    : {
                        masktype: 'all',
                        datamask: '1',
                        isdecrypt: '1',
                      },
                },
              ]
            : []),
        ]
      : []),
  ];

  let data;
  switch (databaseType) {
    case DATABASE_TYPE.ORACLE:
      data = oracleFormData;
      break;
    case DATABASE_TYPE.MONGO_DB:
    case DATABASE_TYPE.ALIYUN_MONGODB:
    case DATABASE_TYPE.TENCENT_MONGODB:
      data = mangoDBFormData;
      break;
    case DATABASE_TYPE.KAFKA:
      data = kafkaFormData;
      break;
    case DATABASE_TYPE.HANA:
      data = basicFormData.filter(item => item.controlId !== 'cdcParams');
      break;
    default:
      data = basicFormData;
      break;
  }

  return data
    .filter((_, index) => !isCreateConnector || index > 1)
    .map(item => {
      return allFieldDisabled ? { ...item, disabled: true } : item;
    });
};

export const getCardDescription = databaseType => {
  switch (databaseType) {
    case DATABASE_TYPE.MYSQL:
    case DATABASE_TYPE.ALIYUN_MYSQL:
    case DATABASE_TYPE.TENCENT_MYSQL:
    case DATABASE_TYPE.MARIADB:
    case DATABASE_TYPE.ALIYUN_MARIADB:
    case DATABASE_TYPE.TENCENT_MARIADB:
      return _l('系统将通过 BinLog 实时同步数据库的所有变动');
    case DATABASE_TYPE.SQL_SERVER:
    case DATABASE_TYPE.ALIYUN_SQLSERVER:
    case DATABASE_TYPE.TENCENT_SQLSERVER:
      return _l('系统将通过 Change Tracking 实时同步数据库的所有变动');
    case DATABASE_TYPE.POSTGRESQL:
    case DATABASE_TYPE.ALIYUN_POSTGRES:
    case DATABASE_TYPE.TENCENT_POSTGRES:
    case DATABASE_TYPE.DB2:
      return _l('系统将实时同步数据库的所有变动');
    case DATABASE_TYPE.ORACLE:
      return _l('系统将通过 Log Archiving 实时同步数据库的所有变动');
    case DATABASE_TYPE.MONGO_DB:
    case DATABASE_TYPE.ALIYUN_MONGODB:
    case DATABASE_TYPE.TENCENT_MONGODB:
      return _l('系统将通过 Change Streams 实时同步数据库的所有变动');
    case DATABASE_TYPE.APPLICATION_WORKSHEET:
      return _l('系统将实时同步数据到所选工作表');
    case DATABASE_TYPE.KAFKA:
      return _l('系统将实时同步Kafka的所有数据');
    case DATABASE_TYPE.HANA:
      return _l('此类型数据库仅支持定时同步');
    default:
      return _l('');
  }
};

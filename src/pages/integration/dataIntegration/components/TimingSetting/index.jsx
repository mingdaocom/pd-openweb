import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Input, Radio, Button, LoadDiv, Dropdown, Icon } from 'ming-ui';
import CommonSelect from '../CommonSelect';
import cx from 'classnames';
import scheduleConfigApi from 'src/pages/integration/api/scheduleConfig';
import _ from 'lodash';
import datasourceApi from 'src/pages/integration/api/datasource';
import { navigateTo } from 'src/router/navigateTo';
import { Tooltip, TimePicker } from 'antd';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import en_US from 'antd/es/date-picker/locale/en_US';
import ja_JP from 'antd/es/date-picker/locale/ja_JP';
import dayjs from 'dayjs';

const SettingWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .content {
    position: relative;
    &.showInDrawer {
      flex: 1;
      .mask {
        top: 98px;
      }
    }

    .mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.3);
      z-index: 2;
    }
    .sectionTitle {
      font-weight: bold;
      margin-bottom: 16px;
    }
    .tipsText {
      color: #757575;
      margin-top: 8px;
    }
    .intervalInput {
      width: 60px;
      margin: 0 12px;
    }
    .firstReadInput {
      width: 200px;
    }
    .timePicker {
      width: 100px;
      height: 36px;
      border-radius: 4px;
      border-color: #ddd;
      margin-right: 8px;
      transition: unset;
      box-shadow: none;
      &:hover {
        border-color: #2196f3;
      }
      &.ant-picker-focused {
        border-color: #2196f3;
      }
    }
  }
  .footer {
    .tipsBlock {
      width: fit-content;
      height: 36px;
      line-height: 36px;
      padding: 0 12px;
      border-radius: 3px;
      background: #f7f7f7;
      margin-bottom: 16px;
    }
  }
`;

const RADIO_LIST = [
  { text: _l('每次读取全部数据'), value: 0 },
  { text: _l('每次仅读取新增/修改的数据'), value: 1 },
];

export default function TimingSetting(props) {
  const {
    showInDrawer = true,
    projectId,
    scheduleConfigId,
    sourceId,
    dbName,
    schema,
    tableName,
    onClose = () => {},
    sourceFields,
    settingValue,
    onChange = () => {},
    onUpdateSuccess = () => {},
    noGetDefault = false,
    forTaskNode = false,
  } = props;
  const [setting, setSetting] = useState(settingValue || { readIntervalType: 0, readType: 0, config: {} });
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState(sourceFields);
  const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;

  useEffect(() => {
    onGetTimingSetting();
  }, [scheduleConfigId, dbName, tableName]);

  useEffect(() => {
    sourceFields && setFields(sourceFields);
  }, [sourceFields]);

  useEffect(() => {
    setSetting(settingValue || { readIntervalType: 0, readType: 0, config: {} });
  }, [dbName, tableName]);

  const onChangeSetting = (updateObj, isUpdate = true) => {
    const newSetting = Object.assign({}, setting, updateObj);
    setSetting(newSetting);
    isUpdate && onChange(newSetting);
  };

  const onGetTimingSetting = () => {
    setLoading(true);

    if (!scheduleConfigId && (!dbName || !tableName)) {
      return;
    }

    (scheduleConfigId
      ? scheduleConfigApi.get({ projectId, scheduleConfigId })
      : scheduleConfigApi.find({ projectId, datasourceId: sourceId, dbName, schema, tableName })
    )
      .then(res => {
        if (res && !res.errorMsgList) {
          !_.isEmpty(res) && onChangeSetting(res, !noGetDefault);
          res.readType === 1 && !sourceFields ? onSetSourceFields(() => setLoading(false)) : setLoading(false);
        } else {
          setLoading(false);
          alert((res || {}).errorMsgList[0] || res.errorMsg || _l('获取失败'), 2);
        }
      })
      .catch(error => {
        setLoading(false);
        forTaskNode && onChangeSetting({ readTime: null, isUpdate: false, ...setting }, true);
      });
  };

  const onSetSourceFields = (cb = () => {}) => {
    datasourceApi.getTableFields({ projectId, datasourceId: sourceId, dbName, schema, tableName }).then(res => {
      if (res && _.isArray(res)) {
        setFields(res);
        cb();
      }
    });
  };

  const onChangeReadType = value => {
    if (value === setting.readType) return;

    onChangeSetting({ readType: value, config: {} });

    value === 1 && !fields && onSetSourceFields();
  };

  const onChangeField = (value, option) => {
    onChangeSetting({ config: { basisField: option.field } });
    scheduleConfigApi
      .getLastValue({
        projectId,
        datasourceId: sourceId,
        dbName,
        schema,
        tableName,
        fieldName: option.field.name,
      })
      .then(res => {
        if (res) {
          onChangeSetting({ config: { basisField: option.field, firstValue: res } });
        }
      });
  };

  const onSave = () => {
    if (setting.readIntervalType === 1 && !setting.readTime) {
      alert(_l('请选择每天读取具体时间'), 3);
      return;
    }

    if (setting.readType === 1) {
      if (!setting.config.basisField) {
        alert(_l('请选择依据字段'), 3);
        return;
      }
    }

    scheduleConfigApi.update({ projectId, ...setting }).then(res => {
      if (res && !res.errorMsgList) {
        alert(_l('保存成功'));
        onUpdateSuccess(setting);
        onClose();
      } else {
        alert(res.errorMsgList[0] || res.errorMsg || _l('保存失败'), 2);
      }
    });
  };

  if (loading) {
    return <LoadDiv />;
  }

  return (
    <SettingWrapper>
      <div className={cx('content', { showInDrawer })}>
        <div className="sectionTitle">{_l('读取数据间隔')}</div>
        <div className="flexRow alignItemsCenter mBottom24">
          <span>{_l('每')}</span>
          <Dropdown
            className="mLeft5 mRight5"
            placeholder={_l('请选择')}
            value={setting.readIntervalType}
            onChange={readIntervalType => {
              onChangeSetting({ readIntervalType, readTime: null });
            }}
            border
            data={[
              { value: 0, text: _l('小时') },
              { value: 1, text: _l('天') },
            ]}
          />
          {setting.readIntervalType === 1 && (
            <TimePicker
              className="timePicker"
              locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN}
              format="HH:mm"
              placeholder="HH:mm"
              value={setting.readTime ? dayjs(setting.readTime, 'HH:mm') : null}
              onChange={(time, timeString) => {
                onChangeSetting({ readTime: timeString });
              }}
            />
          )}

          <span>{_l('从数据源加载数据')}</span>
        </div>
        <div className="sectionTitle">{_l('读取方式')}</div>
        {RADIO_LIST.map((item, i) => {
          return (
            <React.Fragment key={i}>
              <Radio
                text={item.text}
                checked={setting.readType === item.value}
                onClick={() => onChangeReadType(item.value)}
              />

              {item.value === 0 && (
                <div className="mLeft30 mBottom20 tipsText">
                  {_l('读取数据源完整数据覆盖写入目的地，如果数据量较多，不推荐此方式。')}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {setting.readType === 1 && (
          <div className="mLeft30">
            <div className="mBottom12 mTop16">{_l('依据字段')}</div>
            <CommonSelect
              width={200}
              placeholder={_l('请选择')}
              value={_.get(setting, 'config.basisField.id')}
              options={
                !!(fields || []).length
                  ? [
                      {
                        label: _l('有序主键'),
                        title: _l('有序主键'),
                        options: fields
                          .filter(item => item.isPk)
                          .map(item => ({ label: item.name, value: item.id, field: item })),
                      },
                      {
                        label: _l('日期时间'),
                        title: _l('日期时间'),
                        options: fields
                          .filter(item => [91, 93].includes(item.jdbcTypeId) && !item.isPk)
                          .map(item => ({
                            label: item.name,
                            value: item.id,
                            field: { ...item, basisFieldType: 'date' },
                          })),
                      },
                      {
                        label: _l('数值'),
                        title: _l('数值'),
                        options: fields
                          .filter(item => [-6, -5, 4, 5].includes(item.jdbcTypeId) && !item.isPk)
                          .map(item => ({
                            label: item.name,
                            value: item.id,
                            field: { ...item, basisFieldType: 'number' },
                          })),
                      },
                    ].filter(item => !!item.options.length)
                  : []
              }
              onChange={onChangeField}
            />
            {setting.config.basisField &&
              (_.get(setting, 'config.basisField.basisFieldType') !== 'date' ? (
                <React.Fragment>
                  <div className="tipsText">{_l('例如，上次同步范围是1至100，本次将从大于100开始。')}</div>
                  <div>{_l('注意：此方式无法同步修改的数据')}</div>
                </React.Fragment>
              ) : (
                <div className="tipsText">{_l('例如，上次同步到2024年6月14日00:29:49，本次将从此时间点后开始。')}</div>
              ))}

            <div className="mBottom12 mTop16">{_l('首次读取开始值')}</div>
            <div className="flexRow alignItemsCenter">
              <Input
                className="firstReadInput"
                value={setting.config.firstValue}
                onChange={firstValue => onChangeSetting({ config: { ...setting.config, firstValue } })}
                onBlur={e => {
                  onChangeSetting({ config: { ...setting.config, firstValue: e.target.value.trim() } });
                }}
              />
              {_.get(setting, 'config.basisField.basisFieldType') === 'date' && (
                <Tooltip
                  title={
                    <React.Fragment>
                      <div>{_l('YYYY 表示四位数的年份')}</div>
                      <div>{_l('MM 表示两位数的月份')}</div>
                      <div>{_l('DD 表示两位数的日')}</div>
                      <div>{_l('HH 表示两位数的小时（24小时制）')}</div>
                      <div>{_l('MI 表示两位数的分钟')}</div>
                      <div>{_l('SS 表示两位数的秒')}</div>
                    </React.Fragment>
                  }
                >
                  <Icon icon="info" className="mLeft8 Gray_bd Font16 pointer" />
                </Tooltip>
              )}
            </div>

            <div className="tipsText">
              {_.get(setting, 'config.basisField.basisFieldType') === 'date'
                ? _l('接受格式:YYYY-MM-DD HH:MI:SS。')
                : _l('默认值取自数据库数据。')}
            </div>
          </div>
        )}

        {setting.id && <div className="mask" />}
      </div>

      {setting.id && (
        <div className={cx('footer', { mTop20: !showInDrawer })}>
          {!showInDrawer ? (
            <div className="tipsBlock">
              <span>{_l('数据源的定时设置是共用的，可在')}</span>
              <span
                className="mLeft5 mRight5 ThemeColor3 ThemeHoverColor2 pointer"
                onClick={() => {
                  navigateTo(`/integration/sourceDetail/${sourceId}/timingSetting`);
                }}
              >
                {_l('数据源-定时配置')}
              </span>
              <span>{_l('查看。')}</span>
            </div>
          ) : (
            <div className="flexRow alignItemsCenter">
              <Button onClick={onSave}>{_l('保存')}</Button>
              <Button type="ghost" className="mLeft16" onClick={onClose}>
                {_l('取消')}
              </Button>
            </div>
          )}
        </div>
      )}
    </SettingWrapper>
  );
}

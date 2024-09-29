import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Input, Radio, Button, LoadDiv } from 'ming-ui';
import CommonSelect from '../CommonSelect';
import { useSetState } from 'react-use';
import cx from 'classnames';

const SettingWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .content {
    position: relative;
    .mask {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
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
      width: 100px;
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
  { key: 1, text: _l('每次读取全部数据'), value: 1 },
  { key: 2, text: _l('每次仅读取新增/修改的数据'), value: 2 },
];

export default function TimingSetting(props) {
  const { showInDrawer = true, sourceId, tableId, settingId, onClose = () => {} } = props;
  const [setting, setSetting] = useSetState({ interval: 60, readType: 1 });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimingSetting();
  }, [settingId]);

  const fetchTimingSetting = () => {
    setLoading(true);
    const tempSettingDetail = {
      id: 1,
      interval: 100,
      readType: 2,
    };
    setTimeout(() => {
      setSetting(tempSettingDetail);
      setLoading(false);
    }, 500);
  };

  const onSave = () => {
    showInDrawer && onClose();
  };

  const renderFooter = () => {
    if (!setting.id) return null;

    return (
      <div className={cx('footer', { mTop20: !showInDrawer })}>
        {!showInDrawer && !isEditing ? (
          <Button type="ghost" onClick={() => setIsEditing(true)}>
            {_l('编辑')}
          </Button>
        ) : (
          <React.Fragment>
            {!showInDrawer && (
              <div className="tipsBlock">
                <span>{_l('数据源的定时设置是共用的，也可以在')}</span>
                <span className="mLeft5 mRight5 ThemeColor3 ThemeHoverColor2 pointer" onClick={() => {}}>
                  {_l('数据源-定时配置')}
                </span>
                <span>{_l('调整。')}</span>
              </div>
            )}
            <div className="flexRow alignItemsCenter">
              <Button onClick={onSave}>{_l('保存')}</Button>
              <Button type="ghost" className="mLeft16" onClick={showInDrawer ? onClose : () => setIsEditing(false)}>
                {_l('取消')}
              </Button>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadDiv />;
  }

  return (
    <SettingWrapper>
      <div className={cx('content', { flex: showInDrawer })}>
        <div className="sectionTitle">{_l('读取数据间隔')}</div>
        <div className="flexRow alignItemsCenter mBottom24">
          <span>{_l('每')}</span>
          <Input
            className="intervalInput"
            value={setting.interval}
            onChange={interval => setSetting({ interval: parseInt(interval) })}
          />
          <span>{_l('秒钟，从数据源加载数据')}</span>
        </div>

        <div className="sectionTitle">{_l('读取方式')}</div>
        {RADIO_LIST.map((item, i) => {
          return (
            <React.Fragment key={i}>
              <Radio
                text={item.text}
                checked={setting.readType === item.value}
                onClick={() => setSetting({ readType: item.value })}
              />

              {item.value === 1 && (
                <div className="mLeft30 mBottom20 tipsText">
                  {_l('读取数据源完整数据覆盖写入目的地，如果数据量较多，不推荐此方式。')}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {setting.readType === 2 && (
          <div className="mLeft30">
            <div className="mBottom12 mTop16">{_l('依据字段')}</div>
            <CommonSelect
              width={100}
              placeholder={_l('请选择')}
              value={_.get(setting, 'basedField.id')}
              options={[]}
              onChange={(value, basedField) => setSetting({ basedField })}
            />
            {setting.basedField &&
              (setting.basedField.isPk ? (
                <React.Fragment>
                  .<div className="tipsText">{_l('例如，上次同步范围是1至100，本次将从大于100开始。')}</div>
                  <div>{_l('注意：此方式无法同步修改的数据')}</div>
                </React.Fragment>
              ) : (
                <div className="tipsText">{_l('例如，上次同步到2024年6月14日00:29:49，本次将从此时间点后开始。')}</div>
              ))}

            <div className="mBottom12 mTop16">{_l('首次读取开始值')}</div>
            <Input
              className="firstReadInput"
              value={setting.firstReadNum}
              onChange={firstReadNum => setSetting({ firstReadNum: parseInt(firstReadNum) })}
            />
            <div className="tipsText">{_l('默认值取自数据库数据。')}</div>
          </div>
        )}

        {!showInDrawer && !isEditing && <div className="mask" />}
      </div>

      {renderFooter()}
    </SettingWrapper>
  );
}

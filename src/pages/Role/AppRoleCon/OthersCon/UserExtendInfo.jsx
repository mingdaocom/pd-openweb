import React, { useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Support, SvgIcon } from 'ming-ui';
import { Dropdown as AntdDropdown, Button, Select, Tooltip } from 'ming-ui/antd-components';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

const OPTIONS = [
  { label: _l('或'), value: 0 },
  { label: _l('且'), value: 1 },
];

const UserInfoCon = styled.div`
  padding: 0 40px;
  overflow: auto;
  height: 100%;
  .worksheetInfoBox {
    height: 71px;
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 26px;
  }
  .checkbox-userinfo {
    width: fit-content;
    margin-bottom: 16px;
  }
  .tagList {
    display: flex;
    flex-direction: column;
    gap: 10px;
    li {
      height: 36px;
      line-height: 36px;
      .text {
        background: var(--color-background-secondary);
        border: 1px solid var(--color-border-primary);
        border-radius: 3px;
        padding: 0 15px;
      }
      .optionBox {
        width: 107px;
      }
      .removeBtn {
        width: 36px;
        height: 36px;
        display: inline-block;
        text-align: center;
        line-height: 36px;
        border-radius: 3px;
        border: 1px solid var(--color-border-primary);
        &:hover {
          border-color: var(--color-primary);
        }
      }
    }
  }
`;

export default function UserExtendInfo(props) {
  const { data, onChangeStep, appId } = props;
  const { worksheetId, extendAttrs, userControlId, status, extendAndAttrs = [] } = data.appExtendAttr;
  const optionsControls = [
    data.optionalControls.find(o => o.id === 'currentworkshet'),
    ...data.optionalControls.filter(o => o.id !== 'currentworkshet'),
  ];

  const maxCount = window.platformENV.isOverseas || window.platformENV.isLocal ? 5 : 3;
  const [checked, setChecked] = useState(extendAttrs || []);
  const [visible, setVisible] = useState(false);
  const [andChecked, setAndChecked] = useState(extendAndAttrs || []);

  const openWorksheet = () => {
    homeAppAjax.getAppSimpleInfo({ workSheetId: worksheetId }).then(({ appId, appSectionId }) => {
      window.open(pathCompletion(`/app/${appId}/${appSectionId}/${worksheetId}`));
    });
  };

  const saveFn = param => {
    worksheetAjax
      .saveAppExtendAttr({
        appId: appId,
        worksheetId: worksheetId,
        userControlId: userControlId,
        extendAttrs: checked,
        extendAndAttrs: andChecked,
        status: status,
        ...param,
      })
      .then(() => {})
      .catch(err => alertIfNotUnauthorized(err, err));
  };

  const handleChange = (id, value, isAnd) => {
    const currentValue = isAnd ? 1 : 0;

    if (value === currentValue) return;

    const newValue = isAnd ? andChecked.filter(l => l !== id) : andChecked.concat(id);
    setAndChecked(newValue);
    saveFn({ extendAndAttrs: newValue });
  };

  const handleSelectOption = id => {
    const newChecked = checked.concat(id);
    setChecked(newChecked);
    newChecked.length === maxCount && setVisible(false);
    saveFn({ extendAttrs: newChecked });
  };

  const onRemove = (id, isAnd) => {
    const param = { extendAttrs: checked.filter(l => l !== id) };

    if (isAnd) {
      param.extendAndAttrs = andChecked.filter(l => l !== id);
      setAndChecked(param.extendAndAttrs);
    }

    setChecked(param.extendAttrs);
    saveFn(param);
  };

  const renderSelectTag = () => {
    return (
      <AntdDropdown
        open={visible}
        onOpenChange={(open, info) => {
          if (!open && info.source === 'menu') {
            return;
          }

          setVisible(open);
        }}
        trigger={['click']}
        placement="bottomLeft"
        menu={{
          style: { width: 287 },
          items: optionsControls.map(item => ({
            key: `select-option-${item.id}`,
            disabled: checked.includes(item.id),
            label: (
              <div>
                {item.name} {item.id === 'currentworkshet' && _l('(本表)')}
              </div>
            ),
            onClick: () => handleSelectOption(item.id),
          })),
        }}
      >
        <Button className="mBottom32">{_l('+ 选择权限标签字段')}</Button>
      </AntdDropdown>
    );
  };

  const renderTagList = list => {
    return (
      <ul className="tagList">
        {list.map(item => {
          const isAnd = andChecked.includes(item.id);

          return (
            <li className="valignWrapper" key={`tag-item-${item.id}`}>
              <span className="mRight8 flex text overflow_ellipsis">
                {item.name} {item.id === 'currentworkshet' && _l('(本表)')}
              </span>
              <Select
                className="optionBox mRight8"
                value={isAnd ? 1 : 0}
                options={OPTIONS}
                onChange={value => handleChange(item.id, value, isAnd)}
              />
              <span className="removeBtn Hand" onClick={() => onRemove(item.id, isAnd)}>
                <Icon icon="trash" className="textTertiary" />
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <UserInfoCon>
      <h3 className="mTop35 Font17 Bold">{_l('用户扩展信息表')}</h3>
      <div className="userExtendInfo-desc textTertiary mTop13">
        {_l(
          '通过工作表管理应用成员额外的扩展信息字段，在角色权限、筛选器中可以使用用户的扩展信息字段来作为动态筛选条件',
        )}
        <Support className="help" type={3} href="https://help.mingdao.com/role/extended-info" text={_l('帮助')} />
      </div>
      <div className="worksheetInfoBox mTop16">
        <SvgIcon url={data.iconUrl} fill="var(--color-text-secondary)" className="mRight8" size={24} />
        {data.worksheetName || ''}
        <Icon
          icon="task-new-detail"
          className="mLeft8 textSecondary pointer hoverColorPrimary"
          onClick={openWorksheet}
        />
        <div className="flex" />
        <Button shape="round" onClick={() => onChangeStep(2)}>
          {_l('编辑')}
        </Button>
      </div>
      <div className="mTop30 Font14 Bold">{_l('作为权限标签的扩展信息字段')}</div>
      <div className="desc textSecondary mBottom25 mTop16">
        {_l(
          '选择扩展信息表中作为用户权限标签的字段，仅支持关联记录类型的字段（最多可设置%0个字段）。当其他工作表的记录也关联了和用户相同的标签时，可以在角色中设置为用户对此记录拥有权限',
          maxCount,
        )}
      </div>
      <div className="mBottom24">
        {!!_.difference(checked, andChecked).length && (
          <div className="Font13 textPrimary mBottom15">{_l('当匹配标签时拥有权限')}</div>
        )}
        {renderTagList(optionsControls.filter(l => checked.includes(l.id) && !andChecked.includes(l.id)))}
        {!!andChecked.length && (
          <div className="Font13 textPrimary mBottom15 mTop32 valignWrapper">
            {_l('必须同时匹配标签时才能拥有权限')}
            <Tooltip
              title={_l(
                '以下权限标签与其他权限的叠加方式为且。如设置权限标签【密级】，则表示必须密级同时也满足时才能拥有权限。当密级不匹配时，即使加入记录或满足其他标签时也没有权限。',
              )}
            >
              <Icon icon="info" className="textDisabled mLeft5 Font14" />
            </Tooltip>
          </div>
        )}
        {renderTagList(optionsControls.filter(l => andChecked.includes(l.id)))}
      </div>
      {checked.length < maxCount && renderSelectTag()}
    </UserInfoCon>
  );
}

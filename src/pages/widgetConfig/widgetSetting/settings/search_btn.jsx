import React, { Fragment } from 'react';
import { Tooltip } from 'antd';
import { Checkbox, Dropdown, RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import ApiSearchConfig from '../components/ApiSearchConfig';
import AttachmentConfig from '../components/AttachmentConfig';

const SEARCH_DISPLAY_OPTION = [
  {
    value: 0,
    text: _l('按钮'),
  },
  { value: 1, text: _l('下拉框') },
  { value: 2, text: _l('搜索下拉框') },
];

const SEARCH_TYPES = [
  {
    value: '0',
    text: _l('按钮搜索'),
  },
  {
    value: '1',
    title: _l('实时搜索'),
    text: (
      <span>
        {_l('实时搜索')}
        <Tooltip
          placement="bottom"
          autoCloseDelay={0}
          title={_l('无需点击按钮，在输入的同时执行请求。当查询付费API时会产生更多额外费用')}
        >
          <i className="icon-help Gray_9e Font16 mLeft5"></i>
        </Tooltip>
      </span>
    ),
  },
];

const SOURCE_TYPES = [
  { text: _l('已集成API'), value: 0 },
  { text: _l('封装业务流程'), value: 1 },
];

export default function SearchBtn(props) {
  const { data = {}, onChange } = props;
  const { type, enumDefault, controlId, enumDefault2 = 0 } = data;
  const { clicksearch = '0', searchfirst = '0' } = getAdvanceSetting(data);
  const isBtn = type === 49;
  const isSaved = controlId && !controlId.includes('-');
  const FILTER_SEARCH_DISPLAY_OPTION =
    isSaved && type === 50 ? SEARCH_DISPLAY_OPTION.filter(i => i.value) : SEARCH_DISPLAY_OPTION;

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <Dropdown
          border
          disabled={isBtn && isSaved}
          data={FILTER_SEARCH_DISPLAY_OPTION}
          value={enumDefault}
          onChange={value => {
            // 按钮
            if (!value) {
              onChange({
                ...handleAdvancedSettingChange(data, { itemsource: '', itemtitle: '', itemdesc: '', filterregex: '' }),
                hint: _l('查询'),
                enumDefault: value,
                type: 49,
                required: false,
              });
            } else {
              onChange({
                ...(value === 1
                  ? handleAdvancedSettingChange(data, { clicksearch: '', searchfirst: '', min: '', filterregex: '' })
                  : handleAdvancedSettingChange(data, { clicksearch: '0', searchfirst: '0', min: '1' })),
                enumDefault: value,
                type: 50,
                hint: _l('搜索关键字'),
              });
            }
          }}
        />
        <div className="mTop6 Gray_9e">
          {isBtn
            ? _l('在点击按钮时请求并获取返回参数')
            : _l('在激活下拉框时请求，将返回的多条数据列表作为下拉菜单的选项进行选择')}
        </div>
      </SettingItem>

      {!isBtn && enumDefault === 2 && (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('搜索方式')}</div>
            <RadioGroup
              size="middle"
              checkedValue={clicksearch}
              data={SEARCH_TYPES}
              onChange={value => onChange(handleAdvancedSettingChange(data, { clicksearch: value }))}
            />
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">
              {_l('最少字数')}
              <Tooltip
                placement="bottom"
                autoCloseDelay={0}
                title={_l('当输入满足了最小字数后才会发起请求。当API的搜索参数有字数限制时可以设置此配置')}
              >
                <i className="icon-help Gray_9e Font16 mLeft5"></i>
              </Tooltip>
            </div>
            <AttachmentConfig data={data} onChange={onChange} attr="min" />
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">
              {_l('预加载选项')}
              <Tooltip
                placement="bottom"
                autoCloseDelay={0}
                title={_l(
                  '勾选后，在激活搜索下拉框时先进行一次请求，此时向接口传入的搜索参数为空，并将返回结果作为预设的选项以供选择。当API的搜索参数支持传空时，可以勾许此项。',
                )}
              >
                <i className="icon-help Gray_9e Font16 mLeft5"></i>
              </Tooltip>
            </div>
            <Checkbox
              size="small"
              checked={searchfirst === '1'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { searchfirst: String(+!checked) }))}
            >
              <span>{_l('在搜索前先进行一次请求')}</span>
            </Checkbox>
          </SettingItem>
        </Fragment>
      )}

      <SettingItem>
        <div className="settingItemTitle">{_l('调用来源')}</div>
        <RadioGroup
          size="middle"
          checkedValue={enumDefault2}
          data={SOURCE_TYPES}
          onChange={value => {
            if (enumDefault2 === value) return;
            onChange({
              ...handleAdvancedSettingChange(data, {
                requestmap: '',
                responsemap: '',
                itemsource: '',
                itemtitle: '',
                itemdesc: '',
                authaccount: '',
              }),
              dataSource: '',
              enumDefault2: value,
            });
          }}
        />
      </SettingItem>

      <ApiSearchConfig {...props} fromOperationFlow={enumDefault2 === 1} />
    </Fragment>
  );
}

import React, { useState } from 'react';
import copy from 'copy-to-clipboard';
import { Button, Tabs, Typography } from 'ming-ui/antd-components';

export default function SynchronousContent({ url }) {
  const [activeKey, setActiveKey] = useState('1');
  const internetUrl = url.replace(/webcal:/, location.protocol);
  const instructions = {
    1: _l('"打开Outlook，在工具>账户设置>Internet日历中新建，并粘贴刚才获得的ICAL格式日历地址"'),
    2: _l('"打开Mac日历，在文件>新建日历订阅，粘贴刚才获得的Internet格式日历地址"'),
    3: _l('"登录Google Calendar，在其他日历>通过网址添加中，粘贴刚才获得的ICAL格式日历地址"'),
  };
  const items = [
    { key: '1', label: 'Microsoft Outlook' },
    { key: '2', label: _l('Mac日历') },
    { key: '3', label: 'Google Calendar' },
  ].map(item => ({
    ...item,
    children: (
      <div className="synchronousSteps">
        <div>1.{_l('在本页上方，复制ICAL格式日历网址')}</div>
        <div>2.{instructions[item.key]}</div>
      </div>
    ),
  }));

  const handleCopy = () => {
    copy(internetUrl);
    alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
  };

  return (
    <div className="synchronousMain">
      <Typography.Title level={4}>{_l('同步日程到您的outlook或其他应用')}</Typography.Title>
      <Typography.Paragraph className="synchronousMainDescription">
        {_l('请使用以下网址通过其他应用访问使用您的日历。可将其复制粘贴到任何支持iCal格式的日历产品中')}
      </Typography.Paragraph>
      <div className="synchronousActions">
        <Button type="primary" size="small" href={url}>
          {_l('添加订阅')}
        </Button>
        <Button type="link" onClick={handleCopy}>
          {_l('复制Internet日历地址')}
        </Button>
      </div>
      <Typography.Paragraph className="synchronousDescription" type="secondary">
        {_l('iCal又称iCalendar-使用这种格式可以从其他应用程序中查看您当前日历的只读版本')}
        <br />
        <Typography.Text type="success">{_l('请按下列步骤操作，来使用您的日历网址')}</Typography.Text>
      </Typography.Paragraph>
      <Tabs activeKey={activeKey} tabPlacement="left" items={items} onChange={setActiveKey} />
    </div>
  );
}

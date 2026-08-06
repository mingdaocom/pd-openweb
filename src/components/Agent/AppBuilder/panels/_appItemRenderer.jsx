// 应用项渲染器 —— 给「工作表」和「自定义页面」两个 tab 共用。
// 6 文件 schema 下 worksheets.json 和 custom-pages.json 的元素 schema 形态一致，差别只在 type 取值范围：
//   - worksheets.json:  type = 'worksheet'
//   - custom-pages.json: type ∈ { 'dashboard', 'workspace', 'aiAssistant' }
// 本 module 渲染一份 items 数组（已按 type 过滤），按 groupName 分组卡片化展示。
import React from 'react';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import { CardEditButton, PanelWrap, parseCompactList, parseCompactStr } from './_shared';

const TYPE_BADGE = {
  worksheet: {
    label: _l('工作表'),
    color: 'var(--color-warning)',
    border: 'var(--color-warning-border)',
    bg: 'var(--color-warning-bg)',
  },
  dashboard: {
    label: _l('仪表盘'),
    color: 'var(--color-info)',
    border: 'var(--color-info-border)',
    bg: 'var(--color-info-bg)',
  },
  workspace: {
    label: _l('工作台'),
    color: 'var(--color-success)',
    border: 'var(--color-success-border)',
    bg: 'var(--color-success-bg)',
  },
  aiAssistant: {
    label: _l('AI 助手'),
    color: 'var(--color-mingo-dark)',
    border: 'var(--color-mingo-light)',
    bg: 'var(--color-mingo-transparent-light)',
  },
};

const DEFAULT_ICON = {
  worksheet: 'bookmark',
  dashboard: 'dashboard',
  workspace: 'desktop_windows',
  aiAssistant: 'AI_Agent',
};

const DEFAULT_COLOR = {
  worksheet: '#277B2B',
  dashboard: '#3154EC',
  workspace: '#4CAF50',
  aiAssistant: '#732ED1',
};

// plan 阶段为元素挑的 icon 是 HAP customIcon 字体类（sys_ 前缀），按此 URL 渲染 SVG；
// 缺失时回退到 DEFAULT_ICON 的 ming-ui 字体 glyph。
const customIconUrl = fileName => `https://fp1.mingdaoyun.cn/customIcon/${fileName}.svg`;

// 统计图表类型 → HAP 图表图标（与 statistics/Charts/reportTypeIcons 对齐，均为 HAP iconfont 字体名）。
// 之前用的是 Material 图标名（pie_chart/show_chart 等），HAP 字体里没有对应 glyph 故不显示。
// plan 的 Column/Area/Ranking 等别名归一到 HAP 对应类型。
const CHART_ICONS = {
  NumberChart: 'stats_numerical_chart',
  BarChart: 'stats_bar_chart',
  ColumnChart: 'stats_bar_chart',
  LineChart: 'stats_line_chart',
  AreaChart: 'stats_line_chart',
  PieChart: 'stats_pie_chart',
  RadarChart: 'stats_radar_chart',
  FunnelChart: 'stats_funnel_chart',
  DualAxes: 'stats_biaxial_chart',
  ScatterChart: 'stats_bubble_chart',
  WordCloudChart: 'stats_word_cloud_chart',
  GaugeChart: 'stats_instrument_panel_chart',
  ProgressChart: 'stats_progress_bar_chart',
  RankingChart: 'stats_ranking_list_chart',
  TopChart: 'stats_ranking_list_chart',
  BidirectionalBarChart: 'stats_symmetric_graph_chart',
  PivotTable: 'table',
  CountryLayer: 'map',
  WorldMap: 'public',
};
const CHART_FALLBACK_ICON = 'stats_bar_chart';

// workspace.components 紧凑字符串 Type → 组件类型图标（与 customPage/enum widgets 对齐，HAP iconfont 字体名）。
const COMPONENT_ICONS = {
  Button: 'custom_actions',
  View: 'view_eye',
  Text: 'richtext',
  RichText: 'richtext',
  Filter: 'filter',
  Carousel: 'slideshow',
  Image: 'insert_photo_21',
  Embed: 'url',
  EmbedUrl: 'url',
  Section: 'divider',
  Tabs: 'tab_page',
  Card: 'page_card',
};
const COMPONENT_FALLBACK_ICON = 'custom_actions';

// worksheet 字段紧凑字符串 Type → 图标（对齐 HAP 控件图标 widgetConfig/config/widget.js）。
// Relation:目标表 这类带冒号的取冒号前的基础类型。
const FIELD_ICONS = {
  Text: 'text_bold2',
  Number: 'looks_six',
  Currency: 'amount_rmb',
  DateTime: 'event',
  Date: 'event',
  Time: 'access_time',
  SingleSelect: 'arrow_drop_down_circle',
  MultipleSelect: 'multi_select',
  Checkbox: 'checkbox_01',
  Email: 'email',
  PhoneNumber: 'call',
  Region: 'map',
  Attachment: 'attachment',
  RichText: 'rich_text',
  Relation: 'link_record',
  selfRelation: 'link_record',
  Collaborator: 'account_circle',
  Department: 'department',
  AutoNumber: 'auto_number',
  Formula: 'formula',
};

const FIELD_BORDER = 'var(--color-border-primary)';

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-title);
  line-height: 24px;
  margin-top: 4px;

  .icon {
    font-size: 20px !important;
    color: var(--color-text-tertiary);
  }
`;

const ItemCard = styled.div`
  position: relative;
  background: var(--color-background-card);
  border: 1px solid var(--color-border-secondary);
  border-radius: 13px;
  padding: 16px 20px;
  padding-right: 40px;
  box-shadow: var(--shadow-sm);

  /* 「修改」icon 默认隐藏，hover 卡片时显示（已写过修改意见的 pinned 态由按钮自身常驻） */
  &:hover .card-edit-btn {
    opacity: 1;
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ItemIcon = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${p => p.$color || 'var(--color-text-primary)'};

  /* SvgIcon 外层 ReactSVG 包了一层 div，统一压成 flex 居中、消除行高基线偏移 */
  > div {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }

  svg {
    display: block;
  }

  .icon {
    font-size: 24px !important;
    color: ${p => p.$color || 'var(--color-text-primary)'};
  }
`;

const ItemName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 24px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 11px;
  border: 1px solid ${p => p.$border || 'var(--color-border-secondary)'};
  /* 同色淡底：用类型语义色的浅底变量，胶囊与文字/描边色系统一 */
  background: ${p => p.$bg || 'transparent'};
  font-size: 12px;
  color: ${p => p.$color || 'var(--color-text-tertiary)'};
  white-space: nowrap;
  flex-shrink: 0;
`;

const Description = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 20px;
  margin-top: 8px;
`;

const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const FieldChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  border-radius: 5px;
  border: 1px solid ${FIELD_BORDER};
  /* 卡片内标签统一：12px + 灰底 */
  background: var(--color-background-secondary);
  font-size: 12px;
  color: var(--color-text-primary);
  white-space: nowrap;

  .icon {
    font-size: 14px !important;
    color: var(--color-text-tertiary);
  }
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

const RowLabel = styled.span`
  font-size: 13px;
  color: #707070;
  white-space: nowrap;
`;

const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  border-radius: 13px;
  background: var(--color-background-secondary);
  font-size: 12px;
  color: var(--color-text-title);
  white-space: nowrap;
`;

// 后端 schema 规约 name 字段就叫 name；防御性兜底兼容 LLM 偶发漂移
function getItemName(item) {
  if (!item || typeof item !== 'object') return '';
  return item.name || item.title || item.worksheetName || item.dashboardName || item.assistantName || '';
}

// 把元素按 groupName 首次出现顺序分组
function groupItems(items) {
  const groups = [];
  const map = new Map();

  items.forEach(item => {
    if (!item || typeof item !== 'object') return;
    const key = item.groupName || item.group || _l('未分组');

    if (!map.has(key)) {
      const group = { name: key, items: [] };

      map.set(key, group);
      groups.push(group);
    }

    map.get(key).items.push(item);
  });
  return groups;
}

function renderWorksheet(item) {
  const fields = parseCompactList(item.fields);
  const views = parseCompactList(item.views);

  return (
    <>
      {fields.length > 0 && (
        <ChipsRow>
          {fields.map((f, fi) => {
            const { name, type } = parseCompactStr(f);
            // Relation:目标表 取冒号前的基础类型
            const icon = FIELD_ICONS[(type || '').split(':')[0]];

            return (
              <FieldChip key={fi}>
                {icon && <Icon icon={icon} />}
                {name}
              </FieldChip>
            );
          })}
        </ChipsRow>
      )}
      {views.length > 0 && (
        <BottomRow>
          <RowLabel>{_l('视图：')}</RowLabel>
          {views.map((v, vi) => {
            const { name } = parseCompactStr(v);

            return <Pill key={vi}>{name}</Pill>;
          })}
        </BottomRow>
      )}
    </>
  );
}

// 图表/组件 chip 图标统一走 FieldChip 的中性灰（与其它卡片胶囊标签一致，不再用类型主色）
function renderDashboard(item) {
  const charts = parseCompactList(item.charts);

  if (charts.length === 0) return null;

  return (
    <ChipsRow>
      {charts.map((c, ci) => {
        const { name, type } = parseCompactStr(c);

        return (
          <FieldChip key={ci}>
            <Icon icon={CHART_ICONS[type] || CHART_FALLBACK_ICON} />
            {name}
          </FieldChip>
        );
      })}
    </ChipsRow>
  );
}

function renderWorkspace(item) {
  const components = parseCompactList(item.components);

  if (components.length === 0) return null;

  return (
    <ChipsRow>
      {components.map((c, ci) => {
        const { name, type } = parseCompactStr(c);
        // 统计图表组件用图表类型图标，其余组件用组件类型图标
        const icon = CHART_ICONS[type] || COMPONENT_ICONS[type] || COMPONENT_FALLBACK_ICON;

        return (
          <FieldChip key={ci}>
            <Icon icon={icon} />
            {name}
          </FieldChip>
        );
      })}
    </ChipsRow>
  );
}

// aiAssistant 元素只有 name / description / groupName，无 fields / charts / components；无 body 渲染
function renderItemBody(item) {
  if (item.type === 'worksheet') return renderWorksheet(item);
  if (item.type === 'dashboard') return renderDashboard(item);
  if (item.type === 'workspace') return renderWorkspace(item);
  return null;
}

// 通用应用项列表渲染器；调用方传入已按 type 过滤好的数组 + 默认 type fallback。
// fallbackType 用于流式 partial-json 阶段 type 字段还没到的占位元素，决定如何兜底渲染。
export default function AppItemListRenderer({ items, fallbackType = 'worksheet' }) {
  const list = Array.isArray(items) ? items : [];
  // 流式 partial-json 早期会给到 {} / {type:'worksheet'} 这种只有部分字段的占位元素，
  // 直接渲染会出现大量"未命名"骨架；只保留至少能识别（有名字）的元素。
  const ready = list.filter(item => item && typeof item === 'object' && getItemName(item));
  const groups = groupItems(ready);

  return (
    <PanelWrap>
      {groups.map((group, gi) => (
        <Group key={group.name || gi}>
          <GroupHeader>
            <Icon icon="expand_more" />
            {group.name}
          </GroupHeader>
          {group.items.map((item, i) => {
            const type = item.type || fallbackType;
            const badge = TYPE_BADGE[type] || TYPE_BADGE[fallbackType];
            const color = item.color || DEFAULT_COLOR[type] || '#999';
            const name = getItemName(item);

            return (
              <ItemCard key={name || `${gi}-${i}`}>
                <CardEditButton moduleLabel={badge.label} cardName={name} />
                <CardTop>
                  <ItemIcon $color={color}>
                    {item.icon ? (
                      <SvgIcon url={customIconUrl(item.icon)} fill={color} size={24} />
                    ) : (
                      <Icon icon={DEFAULT_ICON[type] || 'bookmark'} />
                    )}
                  </ItemIcon>
                  <ItemName title={name}>{name}</ItemName>
                  <TypeBadge $border={badge.border} $color={badge.color} $bg={badge.bg}>
                    {badge.label}
                  </TypeBadge>
                </CardTop>
                {item.description && <Description>{item.description}</Description>}
                {renderItemBody(item)}
              </ItemCard>
            );
          })}
        </Group>
      ))}
    </PanelWrap>
  );
}

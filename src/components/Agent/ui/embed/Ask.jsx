import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { Icon } from 'ming-ui';
import { useAgentBus } from '../../agentBus';

// mingo_embed_data_ask 渲染器：通用「向用户提问」卡片。尺寸/颜色严格对齐设计稿 ask-user frame（untangle 语义树）。
// 入参 { data, docked }：data = { appName?, questions:[{ id, title, multiple?, options:[{ label, isRecommended? }] }] }。
// docked=true：待回答态固定在底部输入区（由 ChatPanel 在最后一条未作答的 ask 上启用）。
// 单题：问题 + 选项 + 「其他」输入 + 跳过/提交；多题：右上分页器 ← n/N →，单选选中自动进下一题，末题按钮变「提交」。
// 单选末题（含单题）选中选项即自动提交；多选末题只高亮，仍需手动点「提交」。
// 提交：经 agentBus('ask:submit') 把作答交给 ChatPanel 打包成 ask_reply 用户消息发回。

// 设计 token：卡片 #fafafa / 边框 #cccccc / r12；选项 260x56 r5 / 边框 #eaeaea / 选中 mingo 边框 + mingo 透明浅底；
// 文字统一 14px（标题 weight 500、选项 400、按钮 700），徽标 11/400，分页计数 13/400。
const Card = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--color-border-tertiary);
  border-radius: 12px;
  background: var(--color-background-secondary);
  ${({ $docked }) => ($docked ? 'max-height: 100%;' : 'margin: 16px 0;')}
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  min-height: 20px;
  padding: 12px 12px 0;
`;

const HelpIcon = styled.i`
  font-size: 18px;
  color: var(--color-mingo);
`;

const Pager = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  line-height: 18px;
  color: var(--color-text-secondary);
  i {
    font-size: 18px;
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: color 0.18s ease;
    &:hover {
      color: var(--color-text-primary);
    }
  }
  i.disabled {
    color: var(--color-text-disabled);
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 12px;
  /* 切题滑入动画期间内容会短暂右移，禁掉横向滚动避免冒出横向滚动条 */
  overflow-x: hidden;
  /* docked：占满剩余高度，仅当题量过多撑破面板时才内部滚动（正常题量不出现滚动条） */
  ${({ $docked }) => $docked && 'flex: 1 1 auto; min-height: 0; overflow-y: auto;'}
`;

const Title = styled.div`
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: var(--color-text-primary);
  word-break: break-word;
`;

// 切题时答案列表整体淡入并向左滑入（ease-in），由调用处 key={current} 触发重挂载重放动画。
const optionsIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  animation: ${optionsIn} 0.24s ease-in;
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid ${({ $active }) => ($active ? 'var(--color-mingo)' : 'var(--color-border-secondary)')};
  border-radius: 5px;
  background: ${({ $active }) => ($active ? 'var(--color-mingo-transparent-light)' : 'var(--color-background-card)')};
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
  &:hover {
    border-color: var(--color-mingo);
  }
  .marker {
    flex-shrink: 0;
    font-size: 14px;
    line-height: 22px;
    color: var(--color-text-tertiary);
  }
  .label {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    line-height: 22px;
    color: var(--color-text-title);
    word-break: break-word;
  }
  .badge {
    flex-shrink: 0;
    align-self: center;
    height: 20px;
    padding: 0 6px;
    border-radius: 5px;
    font-size: 12px;
    line-height: 20px;
    color: var(--color-text-secondary);
    background: var(--color-background-tertiary);
  }
`;

const Custom = styled.textarea`
  box-sizing: border-box;
  display: block;
  margin-top: 8px;
  width: 100%;
  height: 36px;
  min-height: 36px;
  max-height: 100px;
  padding: 6px 12px;
  border: 1px solid ${({ $active }) => ($active ? 'var(--color-mingo)' : 'var(--color-border-secondary)')};
  border-radius: 5px;
  background: var(--color-background-card);
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 22px;
  resize: none;
  outline: none;
  overflow-y: auto;
  transition: border-color 0.18s ease;
  &::placeholder {
    color: var(--color-text-tertiary);
  }
  &:focus {
    border-color: var(--color-mingo);
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  /* 设计稿：跳过 + 主按钮右侧成组（非两端对齐），间距约 20px */
  justify-content: flex-end;
  gap: 20px;
  flex-shrink: 0;
  padding: 14px 12px;
`;

const SkipLink = styled.span`
  font-size: 14px;
  line-height: 20px;
  color: var(--color-text-secondary);
  cursor: pointer;
  &:hover {
    color: var(--color-text-primary);
  }
`;

const PrimaryButton = styled.button`
  height: 32px;
  padding: 0 20px;
  border: 0;
  border-radius: 999px;
  background: var(--color-mingo);
  color: var(--color-text-inverse);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s ease;
  &:hover {
    background: var(--color-mingo-dark);
  }
`;

function normalizeQuestions(data) {
  const list = data && Array.isArray(data.questions) ? data.questions : [];

  return list
    .filter(q => q && (q.title || (Array.isArray(q.options) && q.options.length)))
    .map((q, qi) => ({
      id: q.id || `q${qi + 1}`,
      title: q.title || '',
      multiple: !!q.multiple,
      options: (Array.isArray(q.options) ? q.options : [])
        .filter(o => o && o.label)
        // 推荐项：新字段 isRecommended，兼容旧 isDefault
        .map(o => ({ label: o.label, recommended: !!(o.isRecommended || o.isDefault) })),
    }));
}

export default function Ask({ data, docked = false }) {
  const questions = useMemo(() => normalizeQuestions(data), [data]);
  // appName 为可选上下文（卡片头不展示，沿用聊天窗标题），此处不消费
  const multi = questions.length > 1;

  const bus = useAgentBus();
  const [current, setCurrent] = useState(0);
  const submittedRef = useRef(false);
  // answers 按题目位置 index 键入（不用 q.id：上游数据可能给出重复 id，否则会多题共用同一份作答而串选）
  // answers: { [index]: { selected: string[](label), custom: string } }
  const [answers, setAnswers] = useState({});
  const advanceTimer = useRef(null);

  // 卸载时清掉未触发的自动翻页定时器，避免在已卸载组件上 setState（如选中后立即提交、dock 收起）
  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  if (!questions.length) return null;

  const q = questions[current];
  const ans = answers[current] || { selected: [], custom: '' };
  const isLast = current >= questions.length - 1;

  function patch(idx, next) {
    setAnswers(prev => ({ ...prev, [idx]: { selected: [], custom: '', ...prev[idx], ...next } }));
  }

  function goNext() {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }

    setCurrent(c => Math.min(c + 1, questions.length - 1));
  }

  function goPrev() {
    if (current > 0) setCurrent(c => c - 1);
  }

  function handlePick(option) {
    if (q.multiple) {
      // 多选：切换该项；保留已填的「其他」，不自动翻页
      const has = ans.selected.includes(option.label);

      patch(current, {
        selected: has ? ans.selected.filter(l => l !== option.label) : [...ans.selected, option.label],
      });
      return;
    }

    // 单选：选中互斥并清空「其他」
    patch(current, { selected: [option.label], custom: '' });

    if (!isLast) {
      // 非末题：自动进入下一题（留出选中态展示的过渡）
      advanceTimer.current = setTimeout(goNext, 220);
    } else {
      // 末题单选（单题或多题末题）：点选项即直接提交（仅手动输入「其他」才需点提交）；
      // 多选末题在函数开头已 return，不会走到这里。显式传入刚选结果，避免闭包旧值
      const answered = { ...answers, [current]: { selected: [option.label], custom: '' } };

      advanceTimer.current = setTimeout(() => submit(false, answered), 220);
    }
  }

  function handleCustom(value) {
    // 「其他」手动输入：单选时清掉预置项选中，且不自动翻页
    patch(current, q.multiple ? { custom: value } : { selected: [], custom: value });
  }

  // 收集回传：每题保留占位；无任何作答（未选且未填）视为跳过。
  // answersOverride 用于"点选即提交"等场景：setTimeout 里闭包的 answers 是旧值，需显式传入刚选的结果。
  function collect(skipCurrent, answersOverride) {
    const src = answersOverride || answers;

    return questions.map((item, idx) => {
      const a = src[idx] || { selected: [], custom: '' };
      const selected = Array.isArray(a.selected) ? a.selected : [];
      const custom = (a.custom || '').trim();
      const skipped = (skipCurrent && idx === current) || (!selected.length && !custom);

      return {
        id: item.id,
        title: item.title,
        selected: skipped ? [] : selected,
        custom: skipped ? '' : custom,
        skipped,
      };
    });
  }

  function submit(skipCurrent, answersOverride) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    bus.emit('ask:submit', { answers: collect(skipCurrent, answersOverride) });
  }

  function handleSkip() {
    // 单题 / 末题：跳过即提交；多题非末题：跳过当前并进入下一题
    if (isLast) {
      submit(true);
    } else {
      patch(current, { selected: [], custom: '' });
      goNext();
    }
  }

  return (
    <Card $docked={docked}>
      <Header>
        <HelpIcon className="icon icon-live_help" />
        {multi && (
          <Pager>
            <Icon icon="arrow_back" className={current === 0 ? 'disabled' : ''} onClick={goPrev} />
            <span>{`${current + 1}/${questions.length}`}</span>
            <Icon icon="arrow_forward" className={isLast ? 'disabled' : ''} onClick={() => !isLast && goNext()} />
          </Pager>
        )}
      </Header>

      <Body $docked={docked}>
        <Title>{multi ? `${current + 1}. ${q.title}` : q.title}</Title>

        <OptionList key={`options-${current}`}>
          {q.options.map((option, oi) => {
            const active = ans.selected.includes(option.label);

            return (
              <Option key={`${current}-${oi}`} $active={active} onClick={() => handlePick(option)}>
                <span className="marker">{oi + 1}</span>
                <span className="label">{option.label}</span>
                {option.recommended && <span className="badge">{_l('推荐')}</span>}
              </Option>
            );
          })}
        </OptionList>

        <Custom
          key={`custom-${current}`}
          $active={!!ans.custom}
          rows={1}
          value={ans.custom}
          placeholder={_l('其他（输入您的回答）')}
          onChange={e => {
            // 单行起（36px），随内容自增到 max-height 后内部滚动（对齐设计稿展开态）
            const el = e.target;

            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
            handleCustom(el.value);
          }}
        />
      </Body>

      <Footer>
        <SkipLink onClick={handleSkip}>{_l('跳过')}</SkipLink>
        <PrimaryButton type="button" onClick={() => (isLast ? submit(false) : goNext())}>
          {isLast ? _l('提交') : _l('下一个')}
        </PrimaryButton>
      </Footer>
    </Card>
  );
}

Ask.propTypes = {
  data: PropTypes.object,
  docked: PropTypes.bool,
};

// —— 流式骨架：ask 围栏一出现（JSON 还没流完）就先占住底部，给「提问卡即将到来」的结构反馈。
// 用「微光斜向扫过」做 shimmer：底色 tertiary、高光 card 在其上平移（纯主题变量，暗色主题安全）；
// 各块加错落延时形成自上而下的波浪感。复用提问卡的盒模型与尺寸，完成后无缝换真卡。
const shimmer = keyframes`
  0% {
    background-position: 150% 0;
  }
  100% {
    background-position: -150% 0;
  }
`;

const Skel = styled.div`
  flex-shrink: 0;
  height: ${p => p.$h}px;
  width: ${p => p.$w || '100%'};
  border-radius: ${p => (p.$r != null ? p.$r : 8)}px;
  background-color: var(--color-background-tertiary);
  background-image: linear-gradient(100deg, transparent 20%, var(--color-background-card) 50%, transparent 80%);
  background-size: 200% 100%;
  background-repeat: no-repeat;
  animation: ${shimmer} 1.4s ease-in-out infinite;
  animation-delay: ${p => p.$delay || 0}ms;
`;

export function AskSkeleton({ docked = true }) {
  return (
    <Card $docked={docked}>
      <Header>
        <HelpIcon className="icon icon-live_help" />
      </Header>
      <Body $docked={docked}>
        <Skel $h={22} $w="70%" $r={6} style={{ marginTop: 10 }} />
        <OptionList>
          <Skel $h={40} $delay={120} />
          <Skel $h={40} $delay={240} />
          <Skel $h={40} $delay={360} />
        </OptionList>
        <Skel $h={36} $delay={480} style={{ marginTop: 10 }} />
      </Body>
      <Footer>
        <Skel $h={20} $w="56px" $r={6} $delay={600} />
        <Skel $h={32} $w="82px" $r={999} $delay={600} />
      </Footer>
    </Card>
  );
}

AskSkeleton.propTypes = {
  docked: PropTypes.bool,
};

// —— ask_reply：用户作答回传后进入对话流，展示「问题 + 答案」总结卡（对齐设计稿作答后状态）。
// 与提问卡同款边框卡片：#fafafa / 边框 #cccccc / r12；每题 标题(14/500) + 答案(14/400)，条目间分隔线。
const SummaryCard = styled.div`
  width: 100%;
  margin: 6px 0;
  /* 不设水平内边距：内边距落到每个条目上，分隔线才能顶到卡片左右边（与设计稿满宽分隔线一致） */
  padding: 0;
  border: 1px solid var(--color-border-tertiary);
  border-radius: 12px;
  background: var(--color-background-card);
  overflow: hidden;
  .qa {
    padding: 12px;
  }
  .qa + .qa {
    border-top: 1px solid var(--color-border-primary);
  }
  .qa .q {
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    color: var(--color-text-primary);
    word-break: break-word;
  }
  .qa .a {
    margin-top: 2px;
    font-size: 14px;
    line-height: 22px;
    color: var(--color-text-secondary);
    word-break: break-word;
  }
`;

export function AskReply({ data }) {
  const items = data && Array.isArray(data.answers) ? data.answers : [];

  if (!items.length) return null;

  return (
    <SummaryCard>
      {items.map((item, idx) => {
        const parts = [...(Array.isArray(item.selected) ? item.selected : [])];

        if (item.custom) parts.push(item.custom);
        const answerText = item.skipped || !parts.length ? _l('跳过') : parts.join('、');

        return (
          <div className="qa" key={item.id || idx}>
            <div className="q">{item.title || ''}</div>
            <div className="a">{answerText}</div>
          </div>
        );
      })}
    </SummaryCard>
  );
}

AskReply.propTypes = {
  data: PropTypes.object,
};

import React from 'react';
import styled from 'styled-components';
import mingoHead from 'src/pages/chat/containers/ChatList/Mingo/images/mingo.png';
import setIconIcon from '../../assets/ai_creare_icon.svg';
import createRecordIcon from '../../assets/ai_create_date.svg';
import appendDataIcon from '../../assets/ai_padding_data.svg';
import worksheetIcon from '../../assets/table_c.svg';
import workflowIcon from '../../assets/workflow_c.svg';
import statisticIcon from '../../assets/worksheet_column_chart_c.svg';

const MingoFeatureEntryWrap = styled.div`
  padding: 0 16px;
  .mongoHead {
    width: 105px;
    height: 105px;
    border-radius: 50%;
    background: url(${mingoHead}) no-repeat center center;
    background-size: 100% 100%;
    border: 1px solid #eaeaea;
  }
  .hello {
    margin: 12px 0 5px;
    font-size: 30px;
    font-weight: bold;
  }
  .description {
    font-size: 16px;
    color: #757575;
  }
  .aiActions {
    .aiAction {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      color: #151515;
      padding: 0 10px;
      height: 48px;
      border-radius: 6px;
      border: 1px solid #eaeaea;
      margin-bottom: 6px;
      .actionIconCon {
        margin-right: 8px;
        width: 25px;
        display: flex;
        justify-content: center;
      }
      .actionIcon {
        max-width: 25px;
        max-height: 25px;
        &.isSetIcon {
          max-width: 21px;
          max-height: 21px;
        }
      }
      &.disabled {
        background: #f5f5f5;
      }
      &:not(.disabled) {
        cursor: pointer;
        &:hover {
          border-color: #ccc;
        }
      }
    }
  }
  .aiSkills {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    .aiSkill {
      display: flex;
      align-items: center;
      justify-content center;
      height: 100px;
      border-radius: 6px;
      border: 1px solid #eaeaea;
      font-size: 13px;
      color: #151515;
      gap: 10px;
      cursor: pointer;
      .skillIcon {
        max-width: 30px;
        max-height: 30px;
      }
      &:hover {
        border-color: #ccc;
      }
    }
  }
`;

// const AI_ACTIONS = [
//   {
//     name: _l('创建工作表'),
//     icon: worksheetIcon,
//   },
//   {
//     name: _l('创建统计图表'),
//     disabled: true,
//     icon: statisticIcon,
//   },
//   {
//     name: _l('创建自动化工作流'),
//     disabled: true,
//     icon: workflowIcon,
//   },
//   {
//     name: _l('设置图标'),
//     disabled: true,
//     icon: setIconIcon,
//   },
// ];

// const AI_SKILLS = [
//   {
//     name: _l('智能创建记录'),
//     icon: createRecordIcon,
//   },
//   {
//     name: _l('添加示例数据'),
//     icon: appendDataIcon,
//   },
// ];

function getHello() {
  const hour = new Date().getHours();

  if (hour >= 0 && hour < 6) {
    return _l('深夜了，注意休息🌙');
  } else if (hour >= 6 && hour < 9) {
    return _l('早上好🌅');
  } else if (hour >= 9 && hour < 12) {
    return _l('上午好🌞');
  } else if (hour >= 12 && hour < 14) {
    return _l('中午好☀️');
  } else if (hour >= 14 && hour < 19) {
    return _l('下午好🌤️');
  } else if (hour >= 19 && hour < 23) {
    return _l('晚上好🌛');
  } else {
    return _l('夜深了，早点休息哦✨');
  }
}

export default function MingoFeatureEntry() {
  return (
    <MingoFeatureEntryWrap className="t-flex-1 t-flex t-flex-col t-items-center t-justify-center">
      <div className="mongoHead"></div>
      <div className="hello">{getHello()}</div>
      <div className="description">{_l('我是您的AI助手Mingo')}</div>
      {/* <div className="sectionName">{_l('搭建任务')}</div>
      <div className="aiActions">
        {AI_ACTIONS.map((aiAction, i) => (
          <div
            className={cx('aiAction', {
              disabled: aiAction.disabled,
            })}
            key={i}
          >
            <div className="flexRow valignWrapper">
              <div className="actionIconCon">
                <img
                  className={cx('actionIcon', { isSetIcon: aiAction.icon === setIconIcon })}
                  src={aiAction.icon}
                  alt=""
                />
              </div>
              {aiAction.name}
            </div>
            {aiAction.disabled && <span className="Gray_bd">{_l('规划中...')}</span>}
          </div>
        ))}
      </div>
      <div className="sectionName">{_l('实用技能')}</div>
      <div className="aiSkills">
        {AI_SKILLS.map((aiSkill, i) => (
          <div className="aiSkill flexColumn" key={i}>
            <img className="skillIcon" src={aiSkill.icon} alt="" />
            {aiSkill.name}
          </div>
        ))}
      </div> */}
    </MingoFeatureEntryWrap>
  );
}

import React, { Fragment, cloneElement, Component } from 'react';
import { htmlDecode as decode } from 'js-htmlencode';
import { List } from 'antd-mobile';

const emotionPrefix = 'https://upwww.mingdao.com/www/images/emotion/default/';
const emotions = {
    '[呵呵]': 'wx_thumb.gif',
    '[哈哈]': 'hanx_thumb.gif',
    '[泪]': 'lei_thumb.gif',
    '[糗]': 'qiu_thumb.gif',
    '[偷笑]': 'tx_thumb.gif',
    '[可爱]': 'ka_thumb.gif',
    '[得意]': 'dy_thumb.gif',
    '[花心]': 'se_thumb.gif',
    '[失望]': 'ng_thumb.gif',
    '[鼓掌]': 'gz_thumb.gif',
    '[疑问]': 'yw_thumb.gif',
    '[吐]': 'tu_thumb.gif',
    '[顶]': 'qiao_thumb.gif',
    '[发怒]': 'fn_qq.gif',
    '[奋斗]': 'fd_qq.gif',
    '[害羞]': 'hx_qq.gif',
    '[抓狂]': 'zk_qq.gif',
    '[晕]': 'yun_qq.gif',
    '[衰]': 'shuai_qq.gif',
    '[抱拳]': 'bq_qq.gif',
    '[握手]': 'handshake.gif',
    '[耶]': 'yeah.gif',
    '[Good]': 'good.gif',
    '[差劲]': 'small.gif',
    '[OK]': 'ok.gif',
    '[鞭炮]': 'bp_qq.gif',
    '[钞票]': 'money_qq.gif',
    '[吃饭]': 'cf_qq.gif',
    '[灯泡]': 'dp_qq.gif',
    '[喝茶]': 'hc_qq.gif',
    '[猴]': 'monkey_qq.gif',
    '[熊猫]': 'panda_qq.gif',
    '[啤酒]': 'pj_qq.gif',
    '[闪电]': 'sd_qq.gif',
    '[双喜]': 'sx_qq.gif',
    '[雪花]': 'xh_qq.gif',
    '[夜晚]': 'yw_qq.gif',
    '[拥抱]': 'yb_qq.gif',
    '[蛋糕]': 'cake.gif',
    '[心]': 'heart.gif',
    '[心碎]': 'unheart.gif',
    '[玫瑰]': 'rose.gif',
    '[礼物]': 'gift.gif',
    '[太阳]': 'sun.gif',
    '[威武]': 'vw_thumb.gif',
    '[I LOVE MY TEAM]': 'team.gif',
};

const LinkText = (props) => {
  return (
    <a>{props.text}</a>
  );
}

const tags = [
  {
    // 用户
    start: '[aid]',
    end: '[/aid]',
    getRenderResult(aid, props) {
      const rUser = (props.rUserList || []).find((u) => u.accountId === aid) || {
        fullname: '用户不存在',
      };
      return {
        element: <LinkText to={`/user/${aid}`} text={'@' + rUser.fullname} />,
        length: rUser.fullname.length + 1,
      };
    },
  }, {
    // 群组
    start: '[gid]',
    end: '[/gid]',
    getRenderResult(gid, props) {
      const rGroup = (props.rGroupList || []).find((u) => u.groupID === gid) || {
        groupName: _l('群组不存在'),
      };
      return {
        element: (!rGroup.groupID || rGroup.isDelete)
            ? <span style={{ color: '#CAC8BB' }}>@{rGroup.groupName}</span>
            : <span>@{rGroup.groupName}</span>,
        length: rGroup.groupName + 1,
      };
    },
  }, {
    // 话题
    start: '[cid]',
    end: '[/cid]',
    getRenderResult(cid, props) {
      const cat = (props.categories || []).find((c) => c.catID === cid) || {
        catName: _l('话题不存在'),
      };
      return {
        element: <span>#{cat.catName}#</span>,
        length: cat.catName.length + 2,
      };
    },
  }, {
    // 全体成员
    start: '[all]',
    end: '[/all]',
    getRenderResult(str, props) {
      let { sourceType } = props;
      let name = _l('全体成员');
      switch (str) {
        case 'Task':
            name = _l('任务全体成员');
            break;
        case 'Folder':
            name = _l('项目全体成员');
            break;
        case 'Calendar':
            name = _l('日程全体成员');
            break;
        case 'Knowledge':
            name = _l('知识全体成员');
            break;
        case 'Approval':
            name = _l('审批全体成员');
            break;
        case 'Attendance':
            name = _l('考勤全体成员');
            break;
        case 'Post':
            name = _l('动态参与者');
            break;
      }
      switch (sourceType) {
        case 7:
          name = _l('工作表全体成员');
          break;
        case 8:
          name = _l('记录全体成员');
          break;
      }
      return {
        element: <a>@{name}</a>,
        length: name.length + 1,
      };
    },
  }, {
    // 任务
    start: '[tid]',
    end: '[/tid]',
    getRenderResult(str, props) {
      const id = str.split('|', 1)[0];
      const name = str.substring(id.length + 1);
      return {
        element: <LinkText to={`/task/detail/${id}`} text={name} />,
        length: name.length,
      };
    },
  }, {
  // 项目
  start: '[fid]',
  end: '[/fid]',
  getRenderResult(str, props) {
    const id = str.split('|', 1)[0];
    const name = str.substring(id.length + 1);
    return {
      element: <LinkText to={`/task/folder/detail/${id}`} text={name} />,
      length: name.length,
    };
  },
  }, {
    // 日程
    start: '[CALENDAR]',
    end: '[CALENDAR]',
    getRenderResult(str, props) {
      const id = str.split('|', 1)[0];
      const name = str.substring(id.length + 1);
      return {
        element: <span>{name}</span>,
        length: name.length,
      };
    },
  }, {
    // 问答
    start: '[STARTANSWER]',
    end: '[ENDANSWER]',
    getRenderResult(str, props) {
      const id = str.split('|', 1)[0];
      const name = str.substring(id.length + 1);
      return {
        element: <span>{name}</span>,
        length: name.length,
      };
    },
  }, {
    // 普通附件多版本
    start: '[docversion]',
    end: '[docversion]',
    getRenderResult(str, props) {
      const id = str.split('|', 1)[0];
      const name = str.substring(id.length + 1).split('|', 1)[0];
      return {
        element: <span>{name}</span>,
        length: name.length,
      };
    },
  },
];

export default class extends Component {
  constructor(props) {
    super(props);
  }
  split(message) {
    if (!message) { return message; }
    const divider = '\u0000';
    message = message.replace(/\[[^\]]+\]/g, divider + '$&' + divider);
    return message.split(divider).filter((s) => s);
  }
  buildTree(arr, remainLength = 99999) {
    if (!arr || !arr.length) { return null; }
    let result = [];
    let currentIndex = 0;
    while (currentIndex < arr.length) {
      const current = arr[currentIndex];
      const remain = arr.slice(currentIndex + 1);
      const tag = tags.find((t) => t.start === current);
      if (tag) {
        // 不支持嵌套，嵌套要用状态机做
        const endIndexOfRemain = remain.indexOf(tag.end);
        if (endIndexOfRemain !== -1) {
          const childArr = remain.slice(0, endIndexOfRemain);
          const childArrStr = childArr.join('');
          const renderResult = tag.getRenderResult(childArrStr, this.props);
          remainLength -= renderResult.length;
          if (remainLength < 0) { return result; }
          result.push(cloneElement(renderResult.element, { key: currentIndex }));
          currentIndex = currentIndex + 1 + endIndexOfRemain + 1;
          continue;
        }
      } else if (emotions[current]) {
        remainLength -= 1;
        if (remainLength < 0) { return result; }
        const fontSize = 14;
        result.push(
          <img
              key={currentIndex}
              style={{ width: fontSize, height: fontSize }}
              src={emotionPrefix + emotions[current]}
          />,
        );
      } else {
        let str = decode(current);
        remainLength -= str.length;
        if (remainLength < 0) {
          str = str.substring(0, str.length + remainLength - 3) + '...';
          result.push(<span key={currentIndex}>{str}</span>);
          break;
        } else {
          result.push(<span key={currentIndex}>{str}</span>);
        }
      }
      currentIndex += 1;
    }
    return result;
  }
  replyAccountMsg() {
    const { showReplyMessage, replyAccount } = this.props;
    if (!showReplyMessage) {
      return null;
    }
    return (
      <span>{_l('回复')}<span style={{ color: '#2196f3' }}>{replyAccount.fullname}</span>: </span>
    );
  }
  render() {
    const { message, maxLength } = this.props;
    return (
      <div>
        {this.replyAccountMsg()}
        {this.buildTree(this.split(message), maxLength)}
      </div>
    );
  }
}

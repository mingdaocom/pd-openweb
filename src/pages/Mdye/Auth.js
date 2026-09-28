import globalApi from 'src/api/global';
import { pathCompletion } from 'src/utils/platform/navigation/path';

// mdye-cli 的回调服务只监听本机端口，回调地址必须是回环地址。
// config 完全来自 URL 上的 ?p=，放行任意绝对外链等于把 md_pss_id 交给攻击者指定的域名。
const LOOPBACK_HOSTNAMES = ['127.0.0.1', 'localhost', '[::1]'];

/**
 * 校验 mdye-cli 传入的回调地址，只放行本机回环地址，其余一律返回空串。
 */
function getLocalCallbackUrl(url) {
  if (typeof url !== 'string') {
    return '';
  }

  try {
    const { protocol, hostname } = new URL(url);

    return (protocol === 'http:' || protocol === 'https:') && LOOPBACK_HOSTNAMES.includes(hostname) ? url : '';
  } catch {
    return '';
  }
}

function getConfig() {
  try {
    return safeParse(atob(new URL(location.href).searchParams.get('p') || '')) || {};
  } catch (err) {
    console.log(err);
    return {};
  }
}

function goLogin() {
  location.href = pathCompletion('/login?ReturnUrl=' + encodeURIComponent(location.href));
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  return element;
}

/**
 * 渲染授权卡片，lines 为正文段落，buttons 为底部操作按钮。
 */
function renderCard({ title, lines = [], buttons = [] }) {
  const app = document.getElementById('app');

  if (app) {
    app.style.display = 'none';
  }

  const card = createElement('div', 'con flex flex-col');
  const content = createElement('div', 'content flex-1');

  content.appendChild(createElement('div', 'title', title));
  lines.forEach(line => content.appendChild(createElement('div', line.className, line.text)));
  card.appendChild(content);

  if (buttons.length) {
    const footer = createElement('div', 'footer flex items-center');

    buttons.forEach(({ text, secondary, onClick }) => {
      const button = createElement('div', secondary ? 'button second' : 'button', text);

      button.addEventListener('click', onClick);
      footer.appendChild(button);
    });

    card.appendChild(footer);
  }

  const page = createElement('div', 'page flex items-center content-center');

  page.appendChild(card);
  document.body.appendChild(page);
}

function authorize(callbackUrl) {
  const matched = document.cookie.match(/md_pss_id=(\w+)/);

  if (!matched) {
    goLogin();
    return;
  }

  location.href = callbackUrl + '?t=' + btoa(matched[1]);
}

globalApi
  .getGlobalMeta()
  .then(res => {
    const account = res['md.global']?.Account || {};
    const config = getConfig();
    const callbackUrl = getLocalCallbackUrl(config.url);

    if (!account.accountId) {
      goLogin();
      return;
    }

    if (!callbackUrl) {
      renderCard({
        title: _l('无法完成授权'),
        lines: [
          {
            className: 'description m-top24',
            text: _l('回调地址不是本机地址，可能是被伪造的授权链接，已阻止跳转。'),
          },
          { className: 'url m-top12', text: config.url || '' },
        ],
      });
      return;
    }

    renderCard({
      title: _l('授权本地开发工具'),
      lines: [
        {
          className: 'description m-top24',
          text: _l('mdye-cli 将获得当前账号的登录凭证，用于在本地调试插件。请确认这次授权是你本人发起的。'),
        },
        { className: 'description m-top12', text: _l('当前账号：%0', account.fullname || '') },
        { className: 'url m-top12', text: callbackUrl },
      ],
      buttons: [
        { text: _l('取消'), secondary: true, onClick: () => window.close() },
        { text: _l('授权'), onClick: () => authorize(callbackUrl) },
      ],
    });
  })
  .catch(err => {
    console.log(err);
    goLogin();
  });

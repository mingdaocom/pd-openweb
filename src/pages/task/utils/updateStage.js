import React from 'react';
import { createRoot } from 'react-dom/client';
import Store from 'redux/configureStore';
import { Score } from 'ming-ui';
import { htmlEncodeReg } from 'src/utils/common';
import { returnCustonValue } from './utils';

// 更新阶段视图下的任务列表自定义数据自动更新
export default (taskId, controls) => {
  const { viewType, folderId } = Store.getState().task.taskConfig;

  if (viewType === 2 && folderId) {
    const $li = $('.singleTaskStage[data-taskid=' + taskId + ']');
    let content = '';

    controls.forEach(item => {
      item.value = returnCustonValue(item);

      if (item.type === 28 && item.value === '0') {
        item.value = '';
      }

      if (item.value) {
        content += '<div class="listStageCustomItem">';

        if (item.type !== 28) {
          content += `
          <div class="listStageCustomItemDesc Font12">
            <span class="listStageCustomItemColor">${item.controlName}：</span>
            ${htmlEncodeReg(item.value)}${item.type === 6 || item.type === 8 ? item.unit : ''}
          </div>
        `;
        } else {
          content += `
          <div class="flexRow Font12">
            <span class="mRight10">
              <span class="listStageCustomItemColor">
                <span class="overflow_ellipsis">${item.controlName}</span>：
              </span>
              ${item.enumDefault !== 1 ? item.value + '/10' : ''}
            </span>
            <span class="listStageCustomItemStar flex" data-type="score" data-enum="${item.enumDefault}" data-score="${
              item.value
            }"></span>
          </div>
        `;
        }

        content += '</div>';
      }
    });

    if ($li.find('.listStageCustomBox').length) {
      $li.find('.listStageCustomBox').html(content);
    } else {
      $li.find('.listStageDate').after(`<div class="listStageCustomBox">${content}</div>`);
    }

    if (!$li.find('.Score-wrapper').length) {
      const type = $li.find('.listStageCustomItemStar').data('enum');
      const score = $li.find('.listStageCustomItemStar').data('score');
      let foregroundColor = '#f44336';

      if (score === 6 || type === 1) {
        foregroundColor = '#fed156';
      } else if (score > 6) {
        foregroundColor = '#4caf50';
      }

      const root = createRoot($li.find('.listStageCustomItemStar')[0]);

      root.render(
        <Score
          type={type === 1 ? 'star' : 'line'}
          score={score}
          foregroundColor={foregroundColor}
          backgroundColor={type === 1 ? '#9e9e9e' : '#e0e0e0'}
          disabled
          count={type === 1 ? 5 : 10}
        />,
      );
    }
  }
};

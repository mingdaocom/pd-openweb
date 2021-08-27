import Score from 'ming-ui/components/Score';
import React from 'react';
import { render } from 'react-dom';

export default class CustomScore {
  constructor(hasAuth, ajaxPost) {
    this.hasAuth = hasAuth;
    this.ajaxPost = ajaxPost;
    this.init();
  }

  callback(index, evt) {
    let $target = $(evt.target);
    let $customScore = $target.closest('.customScore');

    $customScore.data('score', index).attr('score', index);
    $customScore.siblings('.customScoreLabel').html(index);

    this.render($customScore[0]);

    if ($.isFunction(this.ajaxPost)) {
      this.ajaxPost($target, index);
    }
  }

  getLineColor(score, evt = '') {
    if (
      evt &&
      $(evt.target)
        .closest('.customScore')
        .data('enum') === 1
    ) {
      return false;
    }

    let foregroundColor = '#f44336';
    if (score === 6) {
      foregroundColor = '#fed156';
    } else if (score > 6) {
      foregroundColor = '#4caf50';
    }

    return foregroundColor;
  }

  render(item) {
    let type = $(item).data('enum');
    let score = $(item).data('score');

    render(
      <Score
        type={type === 1 ? 'star' : 'line'}
        score={score}
        foregroundColor={type === 1 ? '#fed156' : this.getLineColor(score)}
        backgroundColor={type === 1 ? '#9e9e9e' : '#e0e0e0'}
        disabled={!this.hasAuth}
        hover={(index, evt) => this.getLineColor(index, evt)}
        callback={(index, evt) => this.callback(index, evt)}
        count={type === 1 ? 5 : 10}
      />,
      $(item)[0]
    );
  }

  init() {
    $('.customContentBox .customScore[data-type=score]').map((i, item) => {
      this.render(item);
    });
  }
}

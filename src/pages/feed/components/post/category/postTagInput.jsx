import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import _ from 'lodash';
import tagController from 'src/api/tag';
import { addTagSuccess, removeTagSuccess } from '../../../redux/postActions';
import { connect } from 'react-redux';
import { htmlEncodeReg } from 'src/util';
import 'src/components/textboxList/textboxList';

/**
 * 动态添加/删除标签
 */
class PostTagInput extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    postItem: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { postItem, dispatch } = this.props;
    const postId = postItem.postID;
    const el = ReactDom.findDOMNode(this.cat);
    const width = ReactDom.findDOMNode(this).clientWidth + 80;
    const andLink = true;
    const maxResults = 25;
    const $el = $(el);
    const presetValue = $el.val().split(',');
    $el.val('');
    const tblCategory = new $.TextboxList($el, {
      keysEnble: false,
      width: width || 300,
      showAddBtn: true,
      editableBitMarkText: _l('添加分类标签'),
      immediate: {
        enble: true,
        add: {
          // url: '/ajaxpage/UpdaterOperate.aspx',
          action: tagController.addPostTag,
          param: ['tagId', 'tagName'],
          extraParams: { postId },
          callback(data, bit) {
            dispatch(
              addTagSuccess({
                postId,
                tagId: data[0],
                tagName: data[1],
              }),
            );
            if (andLink) {
              const link = $('<a>')
                .css('cursor', 'pointer')
                .html(data[1]);
              bit.text.html(link);
              if ($('#hidden_isFeed').length > 0) {
                // link.bind('click', function () {
                //   // TODO: filter by category
                //   // Post.FilterByCategory(data[0]);
                // });
              } else {
                link.attr('onclick', `window.location.href="/feed?tagId=${data[0]}"`);
              }
            } else {
              bit.text.html(data[1]);
            }
            if (bit.close) {
              bit.close.show();
            }
            const tagId = data[0];
            const tagName = data[1];
            bit.data('textboxlist:bit').value = [tagId, tagName, tagName];
            if (document.getElementById('catTag_' + postId + '_' + tagId)) {
              bit.remove();
            }
          },
        },
        remove: {
          // url: '/ajaxpage/UpdaterOperate.aspx',
          action: tagController.removeSourceTag,
          param: ['tagId', 'tagName'],
          extraParams: { sourceId: postId },
          callback(tagId) {
            dispatch(removeTagSuccess({ postId, tagId }));
            $('#catTag_' + postId + '_' + tagId).remove();
          },
        },
      },
      plugins: {
        autocomplete: {
          maxResults,
          placeholder: _l('输入分类标签名称(回车提交)'),
          remote: {
            action: tagController.getUserCommonTag,
            resultFilter: result =>
              (result.list || []).map(tag => [
                tag.id,
                htmlEncodeReg(tag.value),
                htmlEncodeReg(tag.value),
                htmlEncodeReg(tag.value),
              ]),
            extraParams: { type: 'category' },
          },
        },
      },
    });
    for (let j = 0; j < presetValue.length; j++) {
      if ($.trim(presetValue[j]).length) {
        tblCategory.add(null, presetValue[j].split('|')[0], presetValue[j].split('|')[1], null, true, {
          deleteButton: true,
        });
      }
    }
    if (andLink) {
      tblCategory
        .getContainer()
        .find('.textboxlist-bit-box')
        .each(function() {
          const bitBoxEl = this;
          const cateItem = $('<a/>')
            .html(
              htmlEncodeReg(
                $(this)
                  .find('span')
                  .text(),
              ),
            )
            .css('cursor', 'pointer')
            .replaceAll($(this).find('span'));
          if ($('#hidden_isFeed').length > 0) {
            // cateItem.bind('click', function () {
            //   // TODO
            //   // Post.FilterByCategory($(bitBoxEl).attr('sign'));
            // });
          } else {
            cateItem.attr('href', '/feed?tagId=' + $(bitBoxEl).attr('sign'));
          }
        });
    }
    setTimeout(() => {
      tblCategory
        .getContainer()
        .find('.textboxlist-bit-editable-addtag')
        .click();
    }, 200);
  }

  render() {
    const postItem = this.props.postItem;
    let tagStr = '';
    if (postItem.tags && postItem.tags.length) {
      tagStr = _.map(postItem.tags, cItem => [cItem.tagId, cItem.tagName, cItem.createUser].join('|')).join(',');
    }
    return (
      <div className="postTagBox fadeIn ani600">
        <input
          type="hidden"
          ref={cat => {
            this.cat = cat;
          }}
          className="TextBox"
          defaultValue={tagStr}
        />
      </div>
    );
  }
}

export default connect(state => ({}))(PostTagInput);

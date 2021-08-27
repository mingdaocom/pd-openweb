import './style.css';

module.exports = (function ($) {
  $.fn.Pager = function (param) {
    new $Pager(this, param);
    return $(this);
  };
  var $Pager = function (el, settings) {
    var $this = this;

    var options = $.extend(
      {
        pageIndex: 1,
        pageSize: 20, // 每页显示多少条
        count: 0, // 总共多少条数据
        pageCount: 5, // 超过几页显示 ...
        align: 'center', // 页码呈现的位置
        prev: _l('上一页'),
        next: _l('下一页'),
        changePage: function (pageIndex) {},
      },
      settings
    );

    $this.init = function () {
      if ($(el).find('div.mdPager').length == 0) {
        var pagerObj = $('<div/>');
        if (options.className) {
          pagerObj.addClass(options.className);
        }
        pagerObj.addClass('mdPager');
        $(el).append(pagerObj);
      }
      $this.create();
    };
    $this.showPages = options.pageCount; // 最多展示几页
    $this.pageIndex = 1; // 当前数据的第几页
    if (options.pageIndex) $this.pageIndex = options.pageIndex;
    $this.pageCount = options.pageCount;

    $this.create = function () {
      var pageParent = $('<div/>').attr('align', options.align);
      var totalPages = Math.ceil(options.count / options.pageSize);
      var pageItem = '';
      if ($this.pageIndex != 1) {
        pageItem = $('<a/>')
          .addClass('pageBtn')
          .attr('href', 'javascript:void(0)')
          .text(options.prev)
          .click(function () {
            $this.changePage(null, $this.pageIndex - 1);
          });
      } else {
        pageItem = $('<span/>')
          .addClass('pageBtnDisable')
          .text(options.prev);
      }
      pageParent.append(pageItem);

      if (totalPages > $this.showPages + 1) {
        if ($this.pageIndex < $this.pageCount - 1) {
          for (var i = 1; i <= $this.showPages; i++) {
            if ($this.pageIndex == i) {
              pageItem = $('<span/>')
                .addClass('pageOn')
                .text(i);
            } else {
              pageItem = $('<a/>')
                .attr('href', 'javascript:void(0)')
                .text(i)
                .click(function () {
                  $this.changePage(this);
                });
            }
            pageParent.append(pageItem);
          }
          pageParent.append($('<span/>').text('...'));
          pageItem = $('<a/>')
            .attr('href', 'javascript:void(0)')
            .text(totalPages)
            .click(function () {
              $this.changePage(null, totalPages);
            });
          pageParent.append(pageItem);
        } else {
          pageItem = $('<a/>')
            .attr('href', 'javascript:void(0)')
            .text(1)
            .click(function () {
              $this.changePage(null, 1);
            });
          pageParent.append(pageItem);
          if ($this.pageIndex > $this.pageCount - 1) pageParent.append($('<span/>').text('...'));

          if (totalPages < $this.pageIndex + $this.pageCount - 1) {
            var startIndex = $this.pageIndex - 2;
            if (totalPages - startIndex < $this.pageCount - 1) startIndex = totalPages - ($this.pageCount - 1);
            for (var i = startIndex; i <= totalPages; i++) {
              if ($this.pageIndex == i) {
                pageItem = $('<span/>')
                  .addClass('pageOn')
                  .text(i);
              } else {
                pageItem = $('<a/>')
                  .attr('href', 'javascript:void(0)')
                  .text(i)
                  .click(function () {
                    $this.changePage(this);
                  });
              }
              pageParent.append(pageItem);
            }
          } else {
            var currentLeftRightCount = ($this.pageCount - 1) / 2;
            for (var i = $this.pageIndex - currentLeftRightCount; i <= $this.pageIndex + currentLeftRightCount; i++) {
              if ($this.pageIndex == i) {
                pageItem = $('<span/>')
                  .addClass('pageOn')
                  .text(i);
              } else {
                pageItem = $('<a/>')
                  .attr('href', 'javascript:void(0)')
                  .text(i)
                  .click(function () {
                    $this.changePage(this);
                  });
              }
              pageParent.append(pageItem);
            }
            pageParent.append($('<span/>').text('...'));
            pageItem = $('<a/>')
              .attr('href', 'javascript:void(0)')
              .text(totalPages)
              .click(function () {
                $this.changePage(null, totalPages);
              });
            pageParent.append(pageItem);
          }
        }
      } else {
        for (var i = 1; i <= totalPages; i++) {
          if ($this.pageIndex == i) {
            pageItem = $('<span/>')
              .addClass('pageOn')
              .text(i);
          } else {
            pageItem = $('<a/>')
              .attr('href', 'javascript:void(0)')
              .text(i)
              .click(function () {
                $this.changePage(this);
              });
          }
          pageParent.append(pageItem);
        }
      }

      if ($this.pageIndex != totalPages) {
        pageItem = $('<a/>')
          .addClass('pageBtn')
          .attr('href', 'javascript:void(0)')
          .text(options.next)
          .click(function () {
            $this.changePage(null, parseInt($this.pageIndex) + 1);
          });
      } else {
        pageItem = $('<span/>')
          .addClass('pageBtnDisable')
          .text(options.next);
      }
      pageParent.append(pageItem);

      if (options.count > options.pageSize) {
        $(el)
          .find('div.mdPager')
          .empty()
          .append(pageParent)
          .show();
      } else {
        $(el)
          .find('div.mdPager')
          .empty()
          .hide();
      }
    };
    $this.changePage = function (obj, pIndex) {
      if (obj) {
        $this.pageIndex = Number($(obj).text());
      } else $this.pageIndex = pIndex;
      options.changePage($this.pageIndex);
      $this.create();
    };
    $this.init();
  };
})(jQuery);

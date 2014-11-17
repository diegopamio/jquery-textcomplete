// NOTE: TextComplete plugin has contenteditable support but it does not work
//       fine especially on old IEs.
//       Any pull requests are REALLY welcome.

+function ($) {
  'use strict';

  // ContentEditable adapter
  // =======================
  //
  // Adapter for contenteditable elements.
  function ContentEditable (element, completer, option) {
    this.initialize(element, completer, option);
  }

  $.extend(ContentEditable.prototype, $.fn.textcomplete.Adapter.prototype, {
    // Public methods
    // --------------

    // Update the content with the given value and strategy.
    // When an dropdown item is selected, it is executed.
    select: function (value, strategy) {
      var pre = this.getContentFromHeadToCaret();
      var sel = window.getSelection()
      var range = sel.getRangeAt(0);
      var selection = range.cloneRange();
      selection.selectNodeContents(range.startContainer);
      var post = this.getContentFromCaretEnd();
      var newSubstr = strategy.replace(value);
      var outputIsArray = $.isArray(newSubstr);
        if (outputIsArray) {
        post = newSubstr[1] + post;
        newSubstr = newSubstr[0];
      }
      pre = pre.replace(strategy.match, newSubstr);
      range.selectNodeContents(range.startContainer);
      range.deleteContents();

      if (outputIsArray){
        var post_el = document.createElement("div");
        post_el.innerHTML = post;
        var post_html_node = document.createDocumentFragment();
        while ( (node = post_el.firstChild) ) {
            lastNode = post_html_node.appendChild(node);
        }
        range.insertNode(post_html_node);
      }

      var pre_el = document.createElement("div");
      pre_el.innerHTML = pre;
      var pre_html_node = document.createDocumentFragment(), node, lastNode;
      while ( (node = pre_el.firstChild) ) {
        lastNode = pre_html_node.appendChild(node);
      }
      range.insertNode(pre_html_node);

      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    },

    // Private methods
    // ---------------

    // Returns the caret's relative position from the contenteditable's
    // left top corner.
    //
    // Examples
    //
    //   this._getCaretRelativePosition()
    //   //=> { top: 18, left: 200, lineHeight: 16 }
    //
    // Dropdown's position will be decided using the result.
    _getCaretRelativePosition: function () {
      var range = window.getSelection().getRangeAt(0).cloneRange();
      var node = document.createElement('span');
      range.insertNode(node);
      range.selectNodeContents(node);
      range.deleteContents();
      var $node = $(node);
      var position = $node.offset();
      position.left -= this.$el.offset().left;
      position.top += $node.height() - this.$el.offset().top;
      position.lineHeight = $node.height();
      var dir = this.$el.attr('dir') || this.$el.css('direction');
      if (dir === 'rtl') { position.left -= this.listView.$el.width(); }
      return position;
    },

    // Returns the string between the first character and the caret.
    // Completer will be triggered with the result for start autocompleting.
    //
    // Example
    //
    //   // Suppose the html is '<b>hello</b> wor|ld' and | is the caret.
    //   this.getContentFromHeadToCaret()
    //   // If the "useInnerHTML option is on:
    //   // => '<b>hello</b> wor'
    //   // else
    //   // => ' wor'
    getContentFromHeadToCaret: function (onlyText) {
      var range = window.getSelection().getRangeAt(0),
          selection;
        if (this.option.useInnerHTML && !onlyText) {
          selection = rangy.getSelection();
          if (selection.rangeCount) {
            selection.getRangeAt(0).insertNode($("<caret />")[0]);
          }
          var innerHTML = this.el.innerHTML;
          $("caret").remove();
          return innerHTML.substr(0, innerHTML.indexOf('<caret>'));
        } else {
          selection = range.cloneRange();
          selection.selectNodeContents(range.startContainer);
          return selection.toString().substring(0, range.startOffset);
        }
    },
    // Returns the string between the caret and the last character.
    // Completer will be triggered with the result for start autocompleting.
    //
    // Example
    //
    //   // Suppose the html is '<span><b>hello</b> wor|ld</span>' and | is the caret.
    //   this.getContentFromCaretEnd()
    //   // If the "useInnerHTML option is on:
    //   // => 'ld</span>'
    //   // else
    //   // => 'la'
    getContentFromCaretEnd: function (onlyText) {
      var range = window.getSelection().getRangeAt(0),
          selection;
      if (this.option.useInnerHTML && !onlyText) {
          selection = rangy.getSelection();
          if (selection.rangeCount) {
              selection.getRangeAt(0).insertNode($("<caret />")[0]);
          }
          var innerHTML = this.el.innerHTML;
          $("caret").remove();
          return innerHTML.substr(innerHTML.indexOf('<caret>'), innerHTML.length);
      } else {
          selection = range.cloneRange();
          selection.selectNodeContents(range.startContainer);
          return selection.toString().substring(0, range.startOffset);
      }
    }

  });

  $.fn.textcomplete.ContentEditable = ContentEditable;
}(jQuery);

define(['../utils/util', '../utils/storage', './pagebase'], function(util, storage, pagebase) {
  var templates = {
    column: util.createElement('<div class="page"></div>'),
    item: util.createElement('<div class="item"></div>')
  };

  var pagebase_simple = function pagebase_simple() { };

  pagebase_simple.prototype = Object.create(pagebase.prototype);

  // Adds all the given HTML nodes to the DOM, in a naive way (top to bottom, left to right).
  // nodes: List of nodes to be added.
  pagebase_simple.prototype.addAllNodes = function addAllNodes(nodes) {
    if (nodes.length) {
      for (var i = 0; i < nodes.length; i++) {
          this.rootNode.appendChild(nodes[i]);
      }
    }
  };

  // Gets how much space to reserve when displaying items.
  pagebase_simple.prototype.getReservedItemCount = function getReservedItemCount() {
    // If the options are showing, account for sort options.
    if (this.showOptions) {
      // If its links page, account for add link options.
      if (this.name === 'links') {
        return 2;
      }

      return 1;
    }

    return 0;
  };

  return pagebase_simple;
});

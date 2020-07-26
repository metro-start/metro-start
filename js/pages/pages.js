define([
  "jquery",
  "jss",
  "../utils/storage",
  "../utils/defaults",
  "./todos",
  "./sessions",
  "./apps",
  "./bookmarks",
  "./themes",
  "metro-select",
], (
  jquery,
  jss,
  storage,
  defaults,
  todos,
  sessions,
  apps,
  bookmarks,
  themes
) => {
  let pages = {
    name: "pages",

    elems: {
      chooser: document.getElementById("pages-chooser"),
    },

    modules: [todos, sessions, apps, bookmarks, themes],

    init: function (document) {
      this.showOptions = false;
      this.page = storage.get("page", "todos");

      const that = this;
      chrome.permissions.getAll(function (perms) {
        console.log("perms", perms);
        if (perms.permissions.includes("management")) {
          jquery(".apps-option").removeClass("removed");
          apps.enabled = true;
        } else if (that.page == "apps") {
          that.page = "todos";
        }

        if (perms.permissions.includes("bookmarks")) {
          jquery(".bookmarks-option").removeClass("removed");
          console.log("bookmarks!");
          bookmarks.enabled = true;
        } else if (that.page == "bookmarks") {
          that.page = "todos";
        }

        if (perms.permissions.includes("sessions")) {
          jquery(".sessions-option").removeClass("removed");
          sessions.enabled = true;
        } else if (that.page == "sessions") {
          that.page = "todos";
        }

        that.modules.forEach((module) => {
          module.init(document);
        });

        jquery(that.elems.chooser).metroSelect({
          initial: that.page,
          add_text: "[+]",
          remove_text: "[x]",
          adder_remover_class: "addremove_button option options-color",
          parent_removed_class: "option disabled",
          onchange: that.changePage.bind(that),
          onvisibilitychange: that.visibilityChanged.bind(that),
        });

        // Set the initial page.
        that.changePage(that.page);
      });
    },

    /**
     * Change the currently selected page.
     *
     * @param {any} page The new page.
     */
    changePage: function changePage(page) {
      this.page = page;
      storage.save("page", page);

      let moduleIndex = this.modules
        .map((m) => {
          return m.name;
        })
        .indexOf(page);

      jss.set(".external .internal", {
        "margin-left": `${moduleIndex * -100}%`,
      });
    },

    visibilityChanged: function visibilityChanged(page, visibility, cb) {
      let modules = this.modules.filter((m) => {
        return m.name == page;
      });
      if (modules.length) {
        module = modules[0];
        if (!!module.setPermissionVisibility) {
          module.setPermissionVisibility(visibility, cb);
        }
      }
    },
  };

  return pages;
});

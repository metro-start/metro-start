define(['../pagebase/pagebase_grouped','../utils/storage', '../utils/defaults', '../utils/util'], function(pagebase_grouped, storage, defaults, util) {
    var todos = {
        name: 'todos',

        data: [],

        elems: {
            rootDom: document.getElementById('internal_selector_todos'),
            newTodo: document.getElementById('newTodo'),
            addTodo: document.getElementById('addTodo')
        },

        templates: {
            titleFragment: util.createElement('<span class="title clickable"></span>'),
            removeFragment: util.createElement('<span class="option options-color small-text clickable">remove</span>'),
            editFragment: util.createElement('<span class="edit option options-color small-text clickable">edit</span>'),
        },

        // Initialize this module.
        init: function(document) {
            this.elems.addTodo.addEventListener('submit', this.addTodo.bind(this));

            this.todos = new pagebase_grouped();
            this.todos.init(document, this.name, this.elems.rootDom, this.templateFunc.bind(this));
            this.loadTodos();
        },

        sortChanged: function (newSort) {
            this.todos.sortChanged(newSort, false);
        },

        // Loads the todos from storage into the DOM.
        loadTodos: function() {
          this.data = storage.get('todos', defaults.defaultTodos);

          this.todos.clear();
          this.todos.addAll({
              'heading': 'incoming',
              'data': this.data.filter(function(todo) { return !todo.done; })
          });
          this.todos.addAll({
              'heading': 'done',
              'data': this.data.filter(function(todo) { return !!todo.done; })
          });
        },


        templateFunc: function(todo) {
            var fragment = util.createElement('');
            
            var title = this.templates.titleFragment.cloneNode(true);
            title.firstElementChild.textContent = todo.name;
            title.firstElementChild.addEventListener('click', this.todoToggle.bind(this, todo));
            util.addClass(title.firstElementChild, !!todo.done ? 'done' : '');
            fragment.appendChild(title);
            
            var edit = this.templates.editFragment.cloneNode(true);
            edit.firstElementChild.addEventListener('click', this.editTodo.bind(this, todo));
            fragment.appendChild(edit);

            var remove = this.templates.removeFragment.cloneNode(true);
            remove.firstElementChild.addEventListener('click', this.removeTodo.bind(this, todo));
            fragment.appendChild(remove);

            return fragment;
        },

        // Adds a new todo, or completes editing an exiting todo.
        // event: Callback event data.
        addTodo: function(event) {
            event.preventDefault();
            var title = this.elems.newTodo.value.trim();
            if (title === '') {
                return;
            }

            // If a todo is currently being edited.
            if (this.todoToEdit) {
                this.todoToEdit.name = title;
            } else {
                this.data.push({
                    'name': title
                });
            }
            
            storage.save('todos', this.data);
            this.loadTodos();

            this.todoToEdit = null;
            this.elems.addTodo.reset();
        },

        // Begins editing a todo.
        // todo: The todo to be edited.
        todoToggle: function(todo) {
            todo.done = !todo.done;
            storage.save('todos', this.data);
            this.loadTodos();
        },

        // Begins editing a todo.
        // todo: The todo to be edited.
        editTodo: function(todo) {
            this.todoToEdit = todo;
            this.elems.newTodo.value = todo.name;
        },

        // Removes a todo from the app.
        // todo: The todo to be removed.
        removeTodo: function(todo){
            for(var i = 0; i < this.data.length; i++) {
                if (this.data[i] === todo) {
                    this.data.splice(i, 1);
                    break;
                }
            }

            storage.save('todos', this.data);
            this.loadTodos();
        }
    };

    return todos;
});

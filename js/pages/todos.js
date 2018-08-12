define(['../pagebase/pagebase_grouped', '../utils/storage', '../utils/defaults', '../utils/util'],
    (PagebaseGrouped, storage, defaults, util) => {
        let todos = {
            name: 'todos',

            data: [],

            elems: {
                rootDom: document.getElementById('internal-selector-todos'),
                newTodo: document.getElementById('newTodo'),
                saveTodo: document.getElementById('saveTodo'),
            },

            templates: {
                titleFragment: util.createElement('<span class="title clickable"></span>'),
                removeFragment: util.createElement('<span class="option options-color small-text clickable">remove</span>'),
                editFragment: util.createElement('<span class="edit option options-color small-text clickable">edit</span>'),
            },

            init: function(document) {
                this.elems.saveTodo.addEventListener('click', this.addTodo.bind(this));

                this.todos = new PagebaseGrouped();
                this.todos.init(document, this.name, this.elems.rootDom, this.templateFunc.bind(this));
                this.loadTodos();
            },

            /**
             * Called when the sort order has been changed.
             *
             * @param {any} newSort The new sort order.
             */
            sortChanged: function(newSort) {
                this.todos.sortChanged(newSort, false);
            },

            /**
             * Loads the todos from storage into the DOM.
             */
            loadTodos: function() {
                this.data = storage.get('todos', defaults.defaultTodos);

                this.todos.clear();
                this.todos.addAll({
                    'heading': 'incoming',
                    'data': this.data.filter((todo) => {
                        return !todo.done;
                    }),
                });
                this.todos.addAll({
                    'heading': 'done',
                    'data': this.data.filter((todo) => {
                        return !!todo.done;
                    }),
                });
            },

            /**
             * Templates a provided todo into an HTML element.
             *
             * @param {any} todo The todo that should be turned into an element.
             * @return {any} The HTML element.
             */
            templateFunc: function(todo) {
                let fragment = util.createElement('');

                let title = this.templates.titleFragment.cloneNode(true);
                title.firstElementChild.textContent = todo.name;
                title.firstElementChild.addEventListener('click', this.todoToggle.bind(this, todo));
                util.addClass(title.firstElementChild, todo.done ? 'done' : '');
                fragment.appendChild(title);

                let edit = this.templates.editFragment.cloneNode(true);
                edit.firstElementChild.addEventListener('click', this.editTodo.bind(this, todo));
                fragment.appendChild(edit);

                let remove = this.templates.removeFragment.cloneNode(true);
                remove.firstElementChild.addEventListener('click', this.removeTodo.bind(this, todo));
                fragment.appendChild(remove);

                return fragment;
            },

            /**
             * Adds a new todo, or completes editing an exiting todo.
             *
             * @param {any} event This parameter is unused.
             */
            addTodo: function(event) {
                event.preventDefault();
                let title = this.elems.newTodo.value.trim();
                if (title === '') {
                    return;
                }

                // If a todo is currently being edited.
                if (this.todoToEdit) {
                    this.todoToEdit.name = title;
                } else {
                    this.data.push({
                        'name': title,
                    });
                }

                storage.save('todos', this.data);
                this.loadTodos();

                this.todoToEdit = null;
                this.elems.addTodo.reset();
            },

            /**
             * Begins editing a todo.
             *
             * @param {any} todo The todo to be edited.
             */
            todoToggle: function(todo) {
                todo.done = !todo.done;
                storage.save('todos', this.data);
                this.loadTodos();
            },

            /**
             * Begins editing a todo.
             * The todo to be edited.
             * @param {any} todo
             */
            editTodo: function(todo) {
                this.todoToEdit = todo;
                this.elems.newTodo.value = todo.name;
            },

            /**
             * Removes a todo from the app.
             *
             * @param {any} todo The todo to be removed.
             */
            removeTodo: function(todo) {
                for (let i = 0; i < this.data.length; i++) {
                    if (this.data[i] === todo) {
                        this.data.splice(i, 1);
                        break;
                    }
                }

                storage.save('todos', this.data);
                this.loadTodos();
            },
        };

        return todos;
    });

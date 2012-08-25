var defaultTheme = {
	'title': 'metro start',
	'colors': {
		'options-color': '#ff0000',
		'main-color': '#ffffff',
		'title-color': '#4a4a4a',
		'background-color': '#000000'
	}
};

var saveTwice = function(key, value) {
	chrome.storage.sync.set({ key: value });
	if (angular.isObject(value)) {
		localStorage.setItem(key, JSON.stringify(value));
	} else {
		localStorage.setItem(key, value);
	}
}

var saveThrice = function(key, value, scope) {
	scope[key] = value;
	saveTwice(key, value);
}

var Pages = function(newRows) {
	this.rows = 4;
	this.pages = [[]];

	this.add = function(row) {
		if (this.pages[this.pages.length - 1].length >= this.rows) {
			this.pages.push([]);
		}
		this.pages[this.pages.length - 1].push(row);
	}

	this.remove = function(page, index) {
		this.pages[page].splice(index, 1);
		for (i = page; i < this.pages.length - 1; i++) {
			this.pages[i].push(this.pages[i + 1].shift());
		}
		if (this.pages.length > 1 && this.pages[this.pages.length - 1].length == 0)
			this.pages.pop();
	}

	this.addAll = function(newRows) {
		for (index = 0; index < newRows.length; index++) {
			this.add(newRows[index]);
		}
	}

	this.flatten = function() {
		return this.pages.reduce(function(a, b) { return a.concat(b) });
	}
	if (newRows) this.addAll(newRows);
}

var getLocalOrSync = function (key, defaultValue, scope, jsonify, callback) {
	if (localStorage.getItem(key)) {
		if (jsonify) {
			scope[key] = JSON.parse(localStorage.getItem(key));
		} else {
			scope[key] = localStorage.getItem(key);
		}
		if (callback) callback();
	} else {
		chrome.storage.sync.get(key, function(container) {
			if (container[key]) {
				console.log(container[key])
				if (jsonify) {
					localStorage.setItem(key, JSON.stringify(container[key]));
				} else {
					localStorage.setItem(key, container['key']);
				}
				scope[key] = container['key'];
			} else {
				if (jsonify) {
					localStorage.setItem(key, JSON.stringify(defaultValue));
				} else {
					localStorage.setItem(key, defaultValue);
				}
				scope[key] = defaultValue;
				chrome.storage.sync.set({ key: defaultValue });
			}
			if (callback) callback();
			updateStyle(false);
		});
	}
}
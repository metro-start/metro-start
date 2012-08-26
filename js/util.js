/**
	The default theme for metro start.
*/
var defaultTheme = {
	'title': 'metro start',
	'colors': {
		'options-color': '#ff0000',
		'main-color': '#ffffff',
		'title-color': '#4a4a4a',
		'background-color': '#000000'
	}
};

/**
	Saves the key, value pair to localStorage.
	
	key: The name of the value to be saved.
	value: The value to be saved.
*/
var saveOnce = function(key, value) {
	if (angular.isObject(value)) {
		localStorage.setItem(key, JSON.stringify(value));
	} else {
		localStorage.setItem(key, value);
	}
}

/**
	Saves the key, value pair to localStorage and chrome.storage.
	
	key: The name of the value to be saved.
	value: The value to be saved.
*/
var saveTwice = function(key, value) {
	chrome.storage.sync.set({ key: value });
	if (angular.isObject(value)) {
		localStorage.setItem(key, JSON.stringify(value));
	} else {
		localStorage.setItem(key, value);
	}
}

/**
	Saves the key, value pair to angularjs scope, localStorage and chrome.storage.
	
	key: The name of the value to be saved.
	value: The value to be saved.
	scope: The angularjs scope of the current app.
*/
var saveThrice = function(key, value, scope) {
	scope[key] = value;
	saveTwice(key, value);
}

/**
	A collection to handle organizing data in pages.
	
	newRows: An array of items to initialize the collection with.
*/
var Pages = function(newRows) {
	this.rows = 4;
	this.pages = [[]];

	/**
		Add an item to the collection.

		row: The item being added.
	*/
	this.add = function(row) {
		// If the last column is full, add a new column.
		if (this.pages[this.pages.length - 1].length >= this.rows) {
			this.pages.push([]);
		}
		// Add item to last column.
		this.pages[this.pages.length - 1].push(row);
	}

	/**
		Remove an item from the collection.

		page: The page/column where the item is located.
		index: The item's index in that page.
	*/
	this.remove = function(page, index) {
		this.pages[page].splice(index, 1);
		// Shift items back from forward pages to fill the hole.
		for (i = page; i < this.pages.length - 1; i++) {
			this.pages[i].push(this.pages[i + 1].shift());
		}
		// The the last page is now empty, pop it.
		if (this.pages.length > 1 && this.pages[this.pages.length - 1].length == 0)
			this.pages.pop();
	}

	this.addAll = function(newRows) {
		for (index = 0; index < newRows.length; index++) {
			this.add(newRows[index]);
		}
	}

	/**
		Flatten the collection and turn it into a 1D array.

		returns: The array in 2D format.
	*/
	this.flatten = function() {
		return this.pages.reduce(function(a, b) { return a.concat(b) });
	}

	/*
		Ininitializes the collection.
	*/
	if (newRows) this.addAll(newRows);
}

/**
	Tries to get the value from localStorage. 
	If it fails, checks chrome.storage.
	Retrieves the value and saves it to the angularjs scope.
	Does not return the value beacuse it might need to make an async call.

	key: The key to be retrieved.
	defaultValue: The value to initialize all storages if the key does not exist.
	scope: The angularjs scope where the value will be saved.
	jsonify: A flag to identify whether the returned value should be parsed as JSON.
		Only applicable to localStorage.
	callback: A callback function to run when value has been retrieved.

*/
var getLocalOrSync = function (key, defaultValue, scope, jsonify, callback) {
	// If the value is in localStorage, retieve from there.
	if (localStorage.getItem(key)) {
		if (jsonify) {
			scope[key] = JSON.parse(localStorage.getItem(key));
		} else {
			scope[key] = localStorage.getItem(key);
		}
		if (callback) callback();
	} else {
		chrome.storage.sync.get(key, function(container) {
			scope.$apply(function () {
				if (container[key]) {
					// Save retrieved data to localStorage and scope.
					if (jsonify) {
						localStorage.setItem(key, JSON.stringify(container[key]));
					} else {
						localStorage.setItem(key, container[key]);
					}
					scope[key] = container[key];
				} else {
					// Save defaultValue to all three storages.
					if (jsonify) {
						localStorage.setItem(key, JSON.stringify(defaultValue));
					} else {
						localStorage.setItem(key, defaultValue);
					}
					scope[key] = defaultValue;
					chrome.storage.sync.set({ key: defaultValue });
				}
				if (callback) callback();
			});
		});
	}
}
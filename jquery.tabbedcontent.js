/*
 * Tabs plugin for jQuery created by Òscar Casajuana < elboletaire at underave dot net > 
 * 
 * Copyright 2013 Òscar Casajuana
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function($) {
	"use strict";
	var Tabbedcontent = function(tabcontent, options)
	{
		var defaults = {
			links         : tabcontent.prev().find('a').length ? tabcontent.prev().find('a') : '.tabs a', // the tabs itself. By default it selects the links contained in the previous wrapper or the links inside ".tabs a" if there's no previous item
			errorSelector : '.error-message', // false to disable
			speed         : false, // speed of the show effect. Set to null or false to disable
			onSwitch      : false, // onSwitch callback
			onInit        : false, // onInit callback
			currentClass  : 'current', // current selected tab class (is set to the <a> element)
			historyState  : 'tabbed' // nothing to worry about..
		};
		var saveHistory = true;
		var firstTime = true;

		options = $.extend(defaults, options);

		var links = options.links;

		if (!links.version) {
			links = $(links);
		}

		var children = tabcontent.children(),
			_this = this;

		function init()
		{
			// Switch to "first" tab
			if (tabExists(document.location.hash))
			{
				this.switch(document.location.hash);
			}
			else if (options.errorSelector && children.find(options.errorSelector).length)
			{
				children.each(function() {
					if ($(this).find(options.errorSelector).length)
					{
						_this.switch("#" + $(this).attr("id"));
						return false;
					}
				});
			}
			else
			{
				this.switch("#" + tabcontent.children(":first-child").attr("id"));
			}

			// Bindings
			links.bind("click", function(e) {
				_this.switch($(this).attr('href'));
				if (typeof history != 'undefined' && ('pushState' in history)) {
					e.preventDefault();
				}
			});

			if ('onpopstate' in window) {
				window.onpopstate = hashSwitch;
			} else {
				$(window).bind('hashchange', hashSwitch);
			}

			// onInit callback
			if (options.onInit && typeof options.onInit == 'function') {
				options.onInit();
			}
		}

		function hashSwitch(e) {
			if (e.state == options.historyState) {
				saveHistory = false;
			}
			if (tabExists(document.location.hash)) {
				_this.switch(document.location.hash);
			}
		}

		function tabExists(tab) {
			return children.filter(tab).length ? true : false;
		}

		function onShow(tab) {
			if (saveHistory && typeof history != 'undefined' && ('pushState' in history)) {
				if (firstTime) {
					firstTime = false;
					setTimeout(function() {
						history.replaceState(options.historyState, '', tab);
					}, 100);
				} else {
					history.pushState(options.historyState, '', tab);
				}
			}
			// onSwitch callback
			if (options.onSwitch && typeof options.onSwitch == 'function') {
				options.onSwitch(tab);
			}
		}

		function getTabId(tabNum) {
			return '#' + children.eq(tabNum).attr('id');
		}

		this.switch = function(tab)
		{
			if (tab.toString().match(/^[0-9]+$/)) {
				tab = getTabId(tab);
			}
			if (!tabExists(tab)) {
				return false;
			}
			links.removeClass(options.currentClass);
			links.filter('a[href='+ tab +']').addClass(options.currentClass);
			children.hide();
			children.filter(tab).show(options.speed, function() {
				if (options.speed)
				{
					onShow(tab);
				}
			});
			if (!options.speed) {
				onShow(tab);
			}
			return true;
		};

		init.call(this);
	};

	$.fn.tabbedContent = function(options) {
		return this.each(function() {
			var tabs = new Tabbedcontent($(this), options);
			$(this).data('api', tabs);
		});
	};

})(jQuery);

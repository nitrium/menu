(function () { 

	var base_url;
	var html_content;
	var selected_class_name = 'selected';
	var last_class_name = 'last';
	var url_garbage_chars = new Array('#','$');
	var menu_item_selected_check; // tracks if a menu item was already marked in the current structure (to prevent selecting/marking two items at the same time)

	//$(window).load(function()
	//{
		$.ajax({
			url: "menu.xml",
			context: document.body,
			dataType: "xml",
			success: function(xml)
			{
				
				base_url = $('data', xml).attr('baseurl');
				current_url = "http://www3.pucrs.br/portal/page/portal/inscer/Capa/Apresentacao"; // DEBUG VAR
				//current_url = $(location).attr('href');

				// cleans up the URL and checks which page the user is at now
				var temp_url = current_url.substr(base_url.length); // truncates current URL at the browser
				
				// cleans garbage from the URL
				$.each(url_garbage_chars, function(_i, _e) {
					if (temp_url.indexOf(_e) != -1)
					{
						temp_url = temp_url.substring(0, temp_url.indexOf(_e));
					}
				});
				var current_level_array = temp_url.split("/"); // stores all the levels of this page in an array
				current_level_array.clean('');
				
				// builds menu
				html_content = "<ul>";
				html_content += iterateLevel($('data', xml), current_level_array, false, 1, false); // the level limit starts always at 1 (second level)
				html_content += "</ul>"; // closing of base 
				
				$("#menu").append(html_content);
				
			}
		});
	//});
	
	// iterates through each level of the XML (can be looped)
	var iterateLevel = function(_x, _lvl_arr, _sublvl_check, _lvl_limit, _last_level)
	{
		var lvl_limit = _lvl_limit; // stores internally the limit of leveling
		var lvl_check = _last_level; // stores internally if this is the last level
		
		var li_string;
		if (_sublvl_check)
		{
			li_string = "<ul>";
		} else
		{
			li_string = "";
		}
		
		// prepares a special array for this check, since there can be children items in this level
		// and, if there are, the parent level will not return true since the 'every' method checks
		// all items in the original array
		// this is not very effective, but setting temp_array = _lvl_arr changes the original array
		var temp_array = new Array();
		for (var i = 0; i <= lvl_limit; i++)
		{
			temp_array.push(_lvl_arr[i]);
		}
		//temp_array = _lvl_arr;
		//temp_array.splice(lvl_limit + 1, 2);
		//console.log(temp_array + "/" + lvl_limit);
		
		$(_x).children().each(function()
		{
			// checks if this li/id is the current page (compares to browser URL captured to the 'current_url' string
			var select_check = false;
			var parsed_level_array = $(this).attr('id').split('/');
			parsed_level_array.clean('');
			
			// checks if this menu level is the current URL
			//$._trace("## " + parsed_level_array);
			menu_item_selected_check = temp_array.every(function(_e, _i)
			{
				return (_e === parsed_level_array[_i]);
			});
			
			// builds the level (li)
			//$._trace(parsed_level_array + "/" + menu_item_selected_check);
			li_string += buildLi($(this), menu_item_selected_check, lvl_check);
			
			// there are sub-items in this level and opens only this level, since it's the one which has sub-levels
			if (($(this).children().length > 0) && menu_item_selected_check)
			{
				var _last_level = (lvl_limit + 1) == (_lvl_arr.length - 1); // adds a class to the 'selected' class name
				li_string += iterateLevel($(this), _lvl_arr, true, (lvl_limit + 1), _last_level); // loop through the function
			}
			
		});
		
		if (_sublvl_check)
		{
			li_string += "</ul>";
		}
		
		return li_string;
	 
	}
	
	// builds the LI and returns the HTML code
	var buildLi = function(_s, _check, _last)
	{
		var li_code;
		
		//var href_code = "<a href='" + (base_url + $(_s).attr('id')) + "'>" + $(_s).attr('name') + "</a></li>";
		var href_code = $(_s).attr('id').indexOf('http') == -1 ? "<a href='" + (base_url + $(_s).attr('id')) + "'>" + $(_s).attr('name') + "</a></li>" : "<a href='" + ($(_s).attr('id')) + "'>" + $(_s).attr('name') + "</a></li>";;
		
		switch (_check)
		{
			case true:
				switch (_last)
				{
					case true:
						li_code = "<li class='" + selected_class_name + " " + last_class_name + "'>";
						break;
					case false:
						li_code = "<li class='" + selected_class_name + "'>";
						break;
				}
				break;
			case false:
				li_code = "<li>";
				break;
		}
		return li_code + href_code;
	}

	// prototype method to clear array of supplied values - could've used $.grep, but this is cleaner for re-use
	Array.prototype.clean = function(_val)
	{
		var _array = [];
		$.each(this, function(_i, _e) {
			if (_e != _val)
			{
				_array.push(_e);
			}
		});
		this.splice(0); // clears current array
		return this.push.apply(this, _array); // returns the new, clean array
	};

	
	// code from http://www.java2s.com/Tutorial/JavaScript/0220__Array/UsingeverymethodfromzArrayLibrary.htm - creates "every" method for IE7 and other
	// browsers that don't support javascript 1.6
	if (!Array.prototype.every)
	{
		Array.prototype.every = function(_f)
		{
			
			if (typeof _f != "function")
			{
				throw new TypeError();
			}
		
			var thisp = arguments[1];
		
			var _l = this.length;
			for (var i = 0; i < _l; i++)
			{
				if (i in this && !_f.call(thisp, this[i], i, this))
				{
					return false;
				}
			}
		
			return true;
		};
	}
	
}());
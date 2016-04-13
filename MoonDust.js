!window.MoonDust && function()
{
	var functions = {};
	var options = {};

	// underscore functions
	var getValues = window._ ? _.values : function(obj)
	{
		var resp = [];
		for( var i in obj ) resp.push(obj[i]);
		return resp;
	};

	var isFunction = window._ ? _.isFunction : function(obj)
	{
		return typeof obj == 'function' || false;
	};

	var isString = window._ ? _.isString : function(obj)
	{
		return typeof obj == 'string' || false;
	};

	/* PROFILE */
	this.Profile = function(nameOrEmpty)
	{
		if( isString(nameOrEmpty) )
		{
			if( this.Profile.prototype.list.hasOwnProperty(nameOrEmpty) )
			{
				return this.Profile.prototype.list[nameOrEmpty];
			}

			this.Profile.prototype.list[nameOrEmpty] = new this.Profile();
			this.Profile.prototype.list[nameOrEmpty].name = nameOrEmpty;

			this.Profile.prototype.listSorted = false;

			return this.Profile.prototype.list[nameOrEmpty];
		}

		this.name = null;
		this.elements = [];
		this.constraints = [];
		this.prio = 0;

		var elements = this.elements;
		var constraints = this.constraints;

		this.refreshElement = function(element)
		{
			for( var y = 0; y < constraints.length; ++y )
			{
				constraints[y].applyOn(element);
			}
		};
		var refreshElement = this.refreshElement;

		this.removeElement = function(element)
		{
			elements[elements.indexOf(element)] = null;
		};
		var removeElement = this.removeElement;

		this.refresh = function()
		{
			for( var i = 0; i < this.elements.length; ++i )
			{
				for( var y = 0; y < this.constraints.length; ++y )
				{
					if( this.elements[i] )
					{
						this.constraints[y].applyOn(this.elements[i]);
					}
				}
			}
		};

		this.clean = function()
		{
			for( var i = 0; i < elements.length; ++i )
			{
				if( !elements[i] )
				{
					elements.splice(i, 1);
					i = 0;
				}
			}
		};

		this.add = function(elementOrConstraint)
		{
			this[elementOrConstraint.nodeName ? "elements" : "constraints"].push(elementOrConstraint);

			if( elementOrConstraint.nodeName )
			{
				if( !elementOrConstraint._o_ )
				{
					elementOrConstraint._o_ = 
					{
						refresh: function()
						{
							for( var i in elementOrConstraint._o_.refreshList )
							{
								elementOrConstraint._o_.refreshList[i](elementOrConstraint);
							}
						},
						remove: function(name)
						{
							if( elementOrConstraint._o_.removeList.hasOwnProperty(name) )
							{
								elementOrConstraint._o_.removeList[name](elementOrConstraint);
								delete elementOrConstraint._o_.removeList[name];
								delete elementOrConstraint._o_.refreshList[name];
							}
						},
						refreshList: {},
						removeList: {}
					};
				}

				elementOrConstraint._o_.refreshList[this.name] = function(){ refreshElement(elementOrConstraint); };
				elementOrConstraint._o_.removeList[this.name] = function(){ removeElement(elementOrConstraint); };
			}

			return this;
		};

		this.alive = function(notAlive)
		{
			if( notAlive )
			{
				_o_.Profile.prototype.aliveList.splice(_o_.Profile.prototype.aliveList.indexOf(this.name), 1);
			}
			else if( _o_.Profile.prototype.aliveList.indexOf(nameOrEmpty) < 0 )
			{
				_o_.Profile.prototype.aliveList.push(this.name);
			}

			return this;
		};

		this.wait = function()
		{
			return this.priority(100);
		};

		this.priority = function(priority)
		{
			this.prio = priority || 0;

			_o_.Profile.prototype.listSorted = false;

			return this;
		};
	};
	this.Profile.prototype.list = {};
	this.Profile.prototype.listSorted = false;
	this.Profile.prototype.aliveList = [];

	/* CONSTRAINT */
	this.Constraint = null;
	this.Constraint = function(init)
	{
		this.element = null;
		this.pass = true;

		this.applyOn = function(e)
		{
			this.element = e;
			this.pass = true;
			return (init ? init.apply(this) : this);
		};

		this.constraint = function()
		{
			return (new this()).applyOn(this.element);
		};

		this.if = function(fun)
		{
			var args = getValues(arguments);

			if( !args.length )
			{
				this.pass = false;
				return this;
			}

			var name = args.shift();

			// simple function
			if( typeof name == "function" )
			{
				return name.apply(this, args);
			}

			// named function
			if( name.charAt(0) == '!' )
			{
				name = name.substr(1).trim();

				if( !functions.hasOwnProperty(name) || functions[name].apply(this, args) )
				{
					this.pass = false;
				}
			}
			else
			{
				if( !functions.hasOwnProperty(name) || !functions[name].apply(this, args) )
				{
					this.pass = false;
				}
			}

			return this;
		};

		this.do = function(fun)
		{
			var args = getValues(arguments);
			if( typeof fun == "function" )
			{
				args.shift().apply(this, [this.pass].concat(args));
			}
			else if( functions.hasOwnProperty(args[0]) )
			{
				functions[args.shift()].apply(this, [this.pass].concat(args));
			}
			return this;
		};
	};

	/* FUNCTIONS */
	this.refresh = function()
	{
		var elements = document.querySelectorAll("["+options["MD"]+"], [data-"+options["MD"]+"]");
		for( var i = 0; i < elements.length; ++i )
		{
			var elementProfiles = elements[i].dataset.hasOwnProperty(options["MD"]) ? elements[i].dataset[options["MD"]].split(",") : elements[i].attributes[options["MD"]].value.split(",");

			for( var y = 0; y < elementProfiles.length; ++y )
			{
				this.Profile(elementProfiles[y].trim()).add(elements[i]);	
			}

			elements[i].attributes.getNamedItem(options["MD"]) && elements[i].attributes.removeNamedItem(options["MD"]);
			elements[i].dataset.hasOwnProperty(options["MD"]) && delete elements[i].dataset[options["MD"]];
		}

		if( !this.Profile.prototype.listSorted )
		{
			this.Profile.prototype.listSorted = getValues(this.Profile.prototype.list);
			this.Profile.prototype.listSorted.sort(function(a, b){ return a.prio - b.prio; });
		}

		for( var i in this.Profile.prototype.listSorted )
		{
			this.Profile.prototype.listSorted[i].refresh();
		}

		for( var i in this.Profile.prototype.listSorted )
		{
			this.Profile.prototype.listSorted[i].clean();
		}

		return this;
	};

	this.add = function(name, obj)
	{
		if( isFunction(obj) )
		{
			functions[name] = obj;
		}
		else
		{
			options[name] = obj;
		}

		return this;
	};

	this.if = function(name)
	{
		if( name.charAt(0) == '!' )
		{
			name = name.substr(1).trim();
			return functions.hasOwnProperty(name) && !functions[name]();
		}

		return functions.hasOwnProperty(name) && functions[name]();
	};

	this.option = function(name, val)
	{
		if( val )
		{
			options[name] = val;
			return val;
		}

		if( !options.hasOwnProperty(name) )
		{
			console.warn("MoonDust.options["+name+"] does not exist");
			return null;
		}

		return options[name];
	};

	this.getReference = function(target, ref)
	{
		if( isString(ref) )
		{
			if( ref == "parent" )
			{
				return target.parentNode;
			}

			if( ref.substr(0, 5) == "this(" )
			{
				return target.querySelector(ref.substr(5, ref.length-6));
			}

			if( ref.substr(0, 7) == "parent(" )
			{
				return target.parentNode.querySelector(ref.substr(7, ref.length-8));
			}

			return document.querySelector(ref);
		}
		else
		{
			return ref;
		}
	};

	this.onBeforeRefresh = [];
	this.onAfterRefresh = [];

	var run;
	run = function()
	{
		var scrolls = [_o_.screenRect.left, _o_.screenRect.top];
		_o_.screenRect = {
			left: window.scrollX,
			top: window.scrollY,
			width: window.innerWidth,
			height: window.innerHeight,
			right: window.scrollX+window.innerWidth,
			bottom: window.scrollY+window.innerHeight
		};

		if( window.innerWidth != _o_.precSizes[0] || window.innerHeight != _o_.precSizes[1] )
		{
			this.onBeforeRefresh.forEach(function(fun){ fun(); });
			
			_o_.precSizes = [window.innerWidth, window.innerHeight];
			_o_.prop = window.innerWidth/window.innerHeight;
			_o_.refresh();
			
			this.onAfterRefresh.forEach(function(fun){ fun(); });
		}
		else if( scrolls[0] != _o_.screenRect.left || scrolls[1] != _o_.screenRect.top )
		{
			// alives
			_o_.Profile.prototype.aliveList.forEach(function(key)
				{
					_o_.Profile.prototype.list[key].refresh();
				}
			);
		}

		setTimeout(run, options["refresh-time"]);
	};

	/********/

	window._o_ = this;
	_o_.precSizes = [window.innerWidth, window.innerHeight];
	_o_.prop = window.innerWidth/window.innerHeight;
	_o_.isMobile = false;
	_o_.screenRect = {
		left: window.scrollX,
		top: window.scrollY,
		width: window.innerWidth,
		height: window.innerHeight,
		right: window.scrollX+window.innerWidth,
		bottom: window.scrollY+window.innerHeight
	};
	// device detection
	if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
	    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) _o_.isMobile = true;

	this.option("refresh-time", 500);
	this.option("MD", "_o_");

	run();

	// init
	var scripts = document.querySelectorAll("script");
	var mdpath = "";
	for( var i = 0; i < scripts.length; ++i )
	{
		var scriptsrc = scripts[i].src.toLowerCase();
		if( scriptsrc.search(/\/moondust\./) >= 0 )
		{
			mdpath = scripts[i].src.substr(0, scriptsrc.search(/\/moondust\./))+'/';
			break;
		}
	}

	this.appendScript = function(path)
	{
		if( !document.body || document.readyState != "complete" )
		{
			setTimeout(function(){ _o_.appendScript(path); }, 50);
			return;
		}

		++this.appendScript.prototype.waiting;

		var script = document.createElement("script");
		script.src = path.charAt(0) == '/' || path.substr(0, 4) == "http" ? path : mdpath+path;
		script.type = "text/javascript";
		
		script.onload = function()
		{
			--_o_.appendScript.prototype.waiting;

			if( !_o_.appendScript.prototype.waiting )
			{
				_o_.refresh();
			}
		};
		
		document.body.appendChild(script);
	};
	_o_.appendScript.prototype.waiting = 0;
}();
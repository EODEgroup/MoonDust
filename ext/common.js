/* if */
_o_.add(">", function(a, b){ return a > b; });
_o_.add(">=", function(a, b){ return a >= b; });
_o_.add("<", function(a, b){ return a < b; });
_o_.add("<=", function(a, b){ return a <= b; });
_o_.add("==", function(a, b){ return a == b; });

/* actions */
_o_.add("class", function(valid, className)
	{
		this.element.classList[valid ? "add" : "remove"](className);
	}
);

_o_.add("remove", function(valid, name)
	{
		if( valid ) this.element._o_.remove(name);
	}
);

/* profile */
_o_.Profile("moondust-loaded")
	.add(new _o_.Constraint(function()
		{
			this.do("class", "moondust-loaded").do("remove", "moondust-loaded");
		})
	)
;
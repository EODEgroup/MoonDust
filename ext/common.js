/* if */
moondust.add(">", function(a, b){ return a > b; });
moondust.add(">=", function(a, b){ return a >= b; });
moondust.add("<", function(a, b){ return a < b; });
moondust.add("<=", function(a, b){ return a <= b; });
moondust.add("==", function(a, b){ return a == b; });

/* actions */
moondust.add("class", function(valid, className)
	{
		this.element.classList[valid ? "add" : "remove"](className);
	}
);

moondust.add("remove", function(valid, name)
	{
		if( valid ) this.element.moondust.remove(name);
	}
);

/* profile */
moondust.Profile("moondust-loaded")
	.add(new moondust.Constraint(function()
		{
			this.do("class", "moondust-loaded").do("remove", "moondust-loaded");
		})
	)
;
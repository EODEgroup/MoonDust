misc = window.misc || {};

misc.loadImages = function(elements, dataset, callback, percentLoaded)
{
	var obj = new (function(elements, dataset, callback, percentLoaded)
		{
			var loaded = elements.length;
			var loadTime = (new Date).getTime();

			var sizes = [];

			for( var i = 0; i < elements.length; ++i )
			{
				misc.loadImage(elements[i], dataset, function(e)
					{
						--loaded;

						var target = e.originalTarget || e.target || e.path[0];
						sizes.push({width: target.naturalWidth, height: target.naturalHeight});

						percentLoaded(Math.round((elements.length-loaded)*100/elements.length));

						if( loaded <= 0 && typeof callback == "function" ) callback((new Date).getTime()-loadTime, sizes);
					}
				);
			}
		}
	)(elements, dataset, callback, typeof percentLoaded == "function" ? percentLoaded : function(){});
};

misc.loadImage = function(elementOrUrl, dataset, callback)
{
	var img = new Image;

	if( typeof callback == "function" )
	{
		img.onload = callback;
	}

	img.src = elementOrUrl.dataset ? elementOrUrl.dataset[dataset] : elementOrUrl;
};

/**********************************/
/*           MoonDust             */
/**********************************/

/* if */

/* actions */
moondust.add("autoload-img", function(valid, background)
	{
		if( valid )
		{
			var element = this.element;
			misc.loadImages([this.element], "src", function()
				{
					if( background ) element.style.backgroundImage = "url(\""+element.dataset.src+"\")";
					else element.attributes.src.value = element.dataset.src;

					element.classList.add("visible");
				}
			);
		}
	}
);

moondust.add("autoload-imgs", function(valid)
	{
		if( valid )
		{
			var elements = this.element.querySelectorAll("[data-src]");
			misc.loadImages(elements, "src", function()
				{
					for( var i = 0; i < elements.length; ++i )
					{
						if( elements[i].tagName != "IMG" ) elements[i].style.backgroundImage = "url(\""+elements[i].dataset.src+"\")";
						else elements[i].attributes.src.value = elements[i].dataset.src;

						elements[i].classList.add("visible");
					}
				}
			);
		}
	}
);

/* profiles */
moondust.Profile("visibility-imgs")
	.add(new moondust.Constraint(function()
		{
			this
				.if("% visible", function(percent){ return percent > 20; })
				.do("autoload-imgs")
				.do("remove", "visibility-imgs")
			;
		})
	)
	.alive()
;

# MoonDust
Bibliothèque javascript de structuration des events "resize"

## Introduction
"resize", ce fameux événement que l'on essaie à chaque fois de se passer et qui reste pourtant malheureusement indispensable pour la plupart des sites. MoonDust est une bibliothèque javascript conçue dans le but de structurer ces événements et pousser le principe au delà du classique script appliqué à chaque changement de taille. Il permet de scripter des conditions et actions complexes sur le redimensionnement ou le scroll et les associer à un élément par la simple mise en place d'un ou de plusieurs profils.

## Concepts
Le but est de définir des comportements (Profil) et de pouvoir les appliquer sur n'importe quel Noeud directement dans le HTML :
```HTML
<div _o_="my profile">My test</div>
```
ou pour les plus respectueux des normes...
```HTML
<div data-_o_="my profile">My test</div>
```
L'élément subira alors les modifications comme défini dans "my profile".

Un profil est un ensemble de contraintes, ce sont ces contraintes qui déterminent les actions réalisées par le profil sur l'élément :
```javascript
_o_.Profile("my profile").add(myConstraint1).add(myConstraint2);
```

Une contrainte quant à elle est construite à partir de fonctions prédéfinies dans moondust.
Cela peut être une condition :
```javascript
_o_.add("my if", function(){
	return true;
});
```
Ou une action :
```javascript
_o_.add("my action", function(valid){
	this.element.style.color = valid ? "red" : "blue";
});
```
"valid" représentant le résultat des conditions de la contrainte.

On peut alors créer sa contrainte :
```javascript
new _o_.Constraint(function(){
	this.if("my if").do("my action");
})
```

On pourra donc créer le profil comme ceci :
```javascript
_o_.Profile("my profile")
	.add(new _o_.Constraint(function()
		{
			this.if("my if").do("my action");
		})
	)
;
```

## Exemple basique
```javascript
// add option
_o_.add("small-size", 800);

// add a function (condition)
_o_.add("mobile-portrait", function()
	{
		return _o_.isMobile && _o_.screenRect.width < _o_.option("small-size");
	}
);

// add a function (action)
_o_.add("class", function(valid, className)
	{
		this.element.classList[valid ? "add" : "remove"](className);
	}
);

// create a Profile
_o_.Profile("my-small-class")
	.add(new _o_.Constraint(function()
		{
			this.if("mobile-portrait").do("class", "small");
		})
	)
;
```

Maintenant vous pouvez utiliser le profil "my-small-class" sur n'importe quel élément de la page.
```HTML
<div _o_="my-small-class">My test</div>
```

=> largeur fenêtre >= 800px
```HTML
<div>My test</div>
```

=> largeur fenêtre < 800px
```HTML
<div class="small">My test</div>
```

## Négation
```javascript
_o_.Profile("my-small-class")
	.add(new _o_.Constraint(function()
		{
			this.if("!mobile-portrait").do("class", "big");
		})
	)
;
```

## local functions
```javascript
_o_.Profile("my-small-class")
	.add(new _o_.Constraint(function()
		{
			this.if(function()
				{
					return _o_.isMobile && _o_.screenRect.width < _o_.option("small-size");
				}
			).do(
				function(valid, arg1, arg2)
				{
					this.element.classList[valid ? "add" : "remove"]("small");
				},
				"arg1",
				"arg2"
			);
		})
	)
;
```

## Multiples contraintes
Permet de cumuler plusieurs comportements sur un même profil.
```javascript
_o_.Profile("my-small-class")
	.add(new _o_.Constraint(function()
		{
			this.if("mobile-portrait").do("class", "small");
		})
	)
	.add(new _o_.Constraint(function()
		{
			this.if("!mobile-portrait").do("class", "big");
		})
	)
;
```

## Multiples actions et conditions
```javascript
_o_.Profile("my test")
	.add(new _o_.Constraint(function()
		{
			this
				.if("!mobile-portrait")
				.if("test")
				.do(function(valid)
					{
						if( valid )
						{
							console.info("screen width > 800px and test is valid !");
						}
					}
				);
		})
	)
;
```

## Multiples profils
```HTML
<div _o_="my first profile, my second profile, my third...">My test</div>
```

## Profil s'appliquant aussi lors du scroll
```javascript
// add a class "visible" when element is visible > 50%
_o_.Profile("visibility-class")
	.add(new _o_.Constraint(function()
		{
			this
				.if("% visible", function(percent){ return percent > 50; })
				.do("class", "visible");
			;
		})
	)
	.alive()
;
```

## Priorités d'exécution
La priorité par défaut est de 0.
Plus elle est basse plus elle est prioritaire.
```javascript
_o_.Profile("visibility-class")
	.add(aConstraint)
	.priority(1)
;

_o_.Profile("visibility-class")
	.add(aConstraint)
	.wait() // alias : priotity(100)
;
```

## Suppression d'un profil
```javascript
// with node
document.querySelector("#myElement")._o_.remove("my profile");

// with action
_o_.add("remove", function(valid, name)
	{
		if( valid ) this.element._o_.remove(name);
	}
);

// add a class when MoonDust is loaded and remove profile
_o_.Profile("moondust-loaded")
	.add(new _o_.Constraint(function()
		{
			this.do("class", "moondust-loaded").do("remove", "moondust-loaded");
		})
	)
;
```

## Forcer le rafraîchissement d'un Node
```javascript
document.querySelector("#myElement")._o_.refresh();
```

## MoonDust variables
```javascript
_o_.precSizes = [window width, window height];
_o_.prop = proportion width / height;
_o_.isMobile = mobile hardware
_o_.screenRect = {
	left: window x with scroll,
	top: window y with scroll,
	width: window width,
	height: window height,
	right: window right position with scroll,
	bottom: window bottom position with scroll
};
```

## Charger une extension
```javascript
// from MoonDust folder
_o_.appendScript("ext/common.js");

// or direct link
_o_.appendScript("/my_moondust.js");
_o_.appendScript("http://my.site/my_moondust.js");
```

## Evénements
Appelés uniquement si la fenêtre a changé de taille.
```javascript
_o_.onBeforeRefresh.push(MyFunction);
_o_.onAfterRefresh.push(MyFunction);
```

## Autres fonctions
```javascript
// refresh all nodes
_o_.refresh();

// use if fonction in code
_o_.if("my-cond");

// options
_o_.option("my-option"); // get option value
_o_.option("my-option", "my value"); // set option value
_o_.add("my-option", "my value"); // alias of _o_.option


// get a node, just a helper
_o_.getReference(target, ref);
_o_.getReference(myNode, "this(.test)"); // get the first element with class test in myNode
_o_.getReference(myNode, "parent(.test)"); // get the first element with class test in parent of myNode
_o_.getReference(myNode, "parent"); // just get parent of myNode
_o_.getReference(notImportant, ".my-selector"); // alias : document.querySelector(".my-selector")
_o_.getReference(notImportant, imNotAString); // return imNotAString

```

## Options de base
```javascript
_o_.option("refresh-time", 500); // moondust refresh loop
_o_.option("MD", "_o_"); // moondust node selector (dataset or attribute).
```

## Autre utilisation possible
Initialisation de widgets :
```javascript
_o_.Profile("parallax")
	.add(new _o_.Constraint(function()
		{
			$(this.element).parallax({imageSrc: this.element.dataset.imageSrc});
			this.element._o_.remove("parallax");
		})
	)
;
```

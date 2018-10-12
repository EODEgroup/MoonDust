# MoonDust
Bibliothèque javascript de scripting des events "resize"

(
Désolé j'ai pas trop le temps de mettre à jour l'exemple... je sais même pas s'il fonctionne encore. <<
Mais j'ai mis les derniers scripts que j'ai utilisé dans `examples/examples_random_scripts`.
Fin septembre j'ai du faire un merge avec une autre version, une sorte de refonte à l'arrache mais ça a l'air de fonctionner correctement...
)

## Introduction
"resize", ce fameux événement que l'on essaie à chaque fois de se passer et qui reste pourtant malheureusement indispensable pour la plupart des sites. MoonDust est une bibliothèque javascript conçue dans le but de structurer ces événements et pousser le principe au delà du classique script appliqué à chaque changement de taille. Il permet de scripter des conditions et actions complexes sur le redimensionnement ou le scroll et les associer à un élément par la simple mise en place d'un ou de plusieurs profils.

## Concepts
Le but est de définir des comportements (Profil) et de pouvoir les appliquer sur n'importe quel Noeud directement dans le HTML :
```HTML
<div profile="my profile">My test</div>
<div data-profile="my profile">My test</div>
```
L'élément subira alors les modifications comme défini dans "my profile".

Un profil est un ensemble de contraintes, ce sont ces contraintes qui déterminent les actions réalisées par le profil sur l'élément :
```javascript
moondust.Profile("my profile").add(myConstraint1).add(myConstraint2);
```

Une contrainte quant à elle est construite à partir de fonctions prédéfinies dans moondust.
Cela peut être une condition :
```javascript
moondust.add("my if", function(){
	return true;
});
```
Ou une action :
```javascript
moondust.add("my action", function(valid){
	this.element.style.color = valid ? "red" : "blue";
});
```
"valid" représentant le résultat des conditions de la contrainte.

On peut alors créer sa contrainte :
```javascript
new moondust.Constraint(function(){
	this.if("my if").do("my action");
})
```

On pourra donc créer le profil comme ceci :
```javascript
moondust.Profile("my profile")
	.add(new moondust.Constraint(function()
		{
			this.if("my if").do("my action");
		})
	)
;
```

## Exemple basique
```javascript
// add option
moondust.add("small-size", 800);

// add a function (condition)
moondust.add("mobile-portrait", function()
	{
		return moondust.isMobile && moondust.screenRect.width < moondust.option("small-size");
	}
);

// add a function (action)
moondust.add("class", function(valid, className)
	{
		this.element.classList[valid ? "add" : "remove"](className);
	}
);

// create a Profile
moondust.Profile("my-small-class")
	.add(new moondust.Constraint(function()
		{
			this.if("mobile-portrait").do("class", "small");
		})
	)
;
```

Maintenant vous pouvez utiliser le profil "my-small-class" sur n'importe quel élément de la page.
```HTML
<div profile="my-small-class">My test</div>
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
moondust.Profile("my-small-class")
	.add(new moondust.Constraint(function()
		{
			this.if("!mobile-portrait").do("class", "big");
		})
	)
;
```

## local functions
```javascript
moondust.Profile("my-small-class")
	.add(new moondust.Constraint(function()
		{
			this.if(function()
				{
					return moondust.isMobile && moondust.screenRect.width < moondust.option("small-size");
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
moondust.Profile("my-small-class")
	.add(new moondust.Constraint(function()
		{
			this.if("mobile-portrait").do("class", "small");
		})
	)
	.add(new moondust.Constraint(function()
		{
			this.if("!mobile-portrait").do("class", "big");
		})
	)
;
```

## Multiples actions et conditions
```javascript
moondust.Profile("my test")
	.add(new moondust.Constraint(function()
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
<div profile="my first profile, my second profile, my third...">My test</div>
```

## Profil s'appliquant aussi lors du scroll
```javascript
// add a class "visible" when element is visible > 50%
moondust.Profile("visibility-class")
	.add(new moondust.Constraint(function()
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
moondust.Profile("visibility-class")
	.add(aConstraint)
	.priority(1)
;

moondust.Profile("visibility-class")
	.add(aConstraint)
	.wait() // alias : priotity(100)
;
```

## Suppression d'un profil
```javascript
// with node
document.querySelector("#myElement").moondust.remove("my profile");

// with action
moondust.add("remove", function(valid, name)
	{
		if( valid ) this.element.moondust.remove(name);
	}
);

// add a class when MoonDust is loaded and remove profile
moondust.Profile("moondust-loaded")
	.add(new moondust.Constraint(function()
		{
			this.do("class", "moondust-loaded").do("remove", "moondust-loaded");
		})
	)
;
```

## Forcer le rafraîchissement d'un Node
```javascript
document.querySelector("#myElement").moondust.refresh();
```

## MoonDust variables
```javascript
moondust.precSizes = [window width, window height];
moondust.prop = proportion width / height;
moondust.isMobile = mobile hardware
moondust.screenRect = {
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
// attr moonscript dans la balise script
<script type="text/javascript" src="/js/moondust.js" moonscript="ext/common, moon/box, moon/text"></script>

// from MoonDust folder
moondust.appendScript("ext/common.js");

// or direct link
moondust.appendScript("/my_moondust.js");
moondust.appendScript("http://my.site/my_moondust.js");
```

## Evénements
Appelés uniquement si la fenêtre a changé de taille.
```javascript
moondust.onBeforeRefresh.push(MyFunction);
moondust.onAfterRefresh.push(MyFunction);
```

## Autres fonctions
```javascript
// refresh all nodes
moondust.refresh();

// use if fonction in code
moondust.if("my-cond");

// options
moondust.option("my-option"); // get option value
moondust.option("my-option", "my value"); // set option value
moondust.add("my-option", "my value"); // alias of moondust.option


// get a node, just a helper
moondust.getReference(target, ref);
moondust.getReference(myNode, "this(.test)"); // get the first element with class test in myNode
moondust.getReference(myNode, "parent(.test)"); // get the first element with class test in parent of myNode
moondust.getReference(myNode, "parent"); // just get parent of myNode
moondust.getReference(notImportant, ".my-selector"); // alias : document.querySelector(".my-selector")
moondust.getReference(notImportant, imNotAString); // return imNotAString

// on a Node
element.moondust.getProfilesName(); // get active profiles

```

## Options de base
```javascript
moondust.option("refresh-time", 500); // moondust refresh loop
moondust.option("MD", "moondust"); // moondust node selector (dataset or attribute).
```

## Autre utilisation possible
Initialisation de widgets :
```javascript
moondust.Profile("parallax")
	.add(new moondust.Constraint(function()
		{
			$(this.element).parallax({imageSrc: this.element.dataset.imageSrc});
			this.element.moondust.remove("parallax");
		})
	)
;
```

Play/pause automatique dans un flux
```javascript
moondust.Profile("my-video")
	.add(new moondust.Constraint(function()
		{
			this.element.setPause(this.if("% visible", function(percent){ return percent < 50; }).pass);
		})
	)
	.alive()
;
```

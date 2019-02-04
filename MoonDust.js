/************************/
/*        DEBUGS        */
// debug undefined isConnected
if (!Node.prototype.hasOwnProperty("isConnected")) {
    Object.defineProperty(Node.prototype, "isConnected", {
        get:function(){ return this.getClientRects().length; },
        set:function(){}
    });
}

// edge classList
if (!DOMTokenList.prototype.hasOwnProperty("forEach")) {
    DOMTokenList.prototype.forEach = function(fun) {
        var classes = this.toString().split(" ");
        for (let c of classes) {
            fun(c);
        }
    };
}

// TMP debug webkit DOMStringMap hasOwnProperty
DOMStringMap.prototype.hasOwnProperty = function(prop) {
    return typeof this[prop] != "undefined";
};
/************************/

/************************/
/*        ADD funcs     */
var isFunction = window._ ? _.isFunction : function(obj) {
    return typeof obj == 'function';
};

var isString = window._ ? _.isString : function(obj) {
    return typeof obj == 'string';
};

var isNumber = window._ ? _.isNumber : function(obj) {
    return typeof obj == 'number';
};

var isNull = window._ ? _.isNull : function(obj) {
    return obj === null;
};

var isUndefined = window._ ? _.isNull : function(obj) {
    return typeof obj == "undefined";
};

var isArray = window._ ? _.isArray : function(obj) {
    return Array.prototype.isPrototypeOf(obj);
};

var values = window._ ? _.values : function(obj) {
    var response = [];
    for (let f in obj) {
        if (response.indexOf(f) < 0) {
            response.push(obj[f]);
        }
    }
    return response;
};

var filterfun = window._ ? _.filter : function(obj) {
    var response = [];
    for (let f of obj) {
        if (response.indexOf(f) < 0) {
            response.push(f);
        }
    }
    return response;
};

var datafun = function(obj, name, value) {
    if (!isArray(obj)) obj = [obj];

    if( !isUndefined(value) ) {
        if( isString(value) || isNumber(value) || isNull(value) ) {
            for (let node of obj) {
                node.dataset[name] = value;

                if( node.datasetObject && node.datasetObject.hasOwnProperty(name) ) {
                    delete node.datasetObject[name];
                }
            }
        }
        else {
            for (let node of obj) {
                node.dataset[name] = name;

                if( !node.datasetObject ) node.datasetObject = {};
                node.datasetObject[name] = value;
            }
        }
    }
    else {
        if( obj.length && obj[0].dataset.hasOwnProperty(name) ) {
            if( obj[0].datasetObject && obj[0].datasetObject.hasOwnProperty(name) ) {
                return obj[0].datasetObject[name];
            }

            return obj[0].dataset[name];
        }
    }

    return null;
};
/************************/

window.moondust = function(){};

var functions = {};
var options = {};

/* Profile */

moondust.Profile = function(nameOrEmpty)
{
    if( isString(nameOrEmpty) )
    {
        if( moondust.Profile.prototype.list.hasOwnProperty(nameOrEmpty) )
        {
            return moondust.Profile.prototype.list[nameOrEmpty];
        }

        moondust.Profile.prototype.list[nameOrEmpty] = new moondust.Profile();
        moondust.Profile.prototype.list[nameOrEmpty].name = nameOrEmpty;

        moondust.Profile.prototype.listSorted = false;

        return moondust.Profile.prototype.list[nameOrEmpty];
    }

    this.name = null;
    this.elements = [];
    this.constraints = [];
    this.prio = 0;

    var elements = this.elements;
    var constraints = this.constraints;
    var onRemoveFunc = null;

    this.refreshElement = function(element)
    {
        for( let y = 0; y < constraints.length; ++y )
        {
            constraints[y].applyOn(element);
        }
    };
    var refreshElement = this.refreshElement;

    this.removeElement = function(element)
    {
        elements[elements.indexOf(element)] = null;
        onRemoveFunc && onRemoveFunc.call(this, element);
    };
    var removeElement = this.removeElement;

    this.refresh = function()
    {
        for( var i = 0; i < this.elements.length; ++i )
        {
            for( var y = 0; y < this.constraints.length; ++y )
            {
                if( this.elements[i] && this.elements[i].isConnected )
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
            if( !elements[i] || !elements[i].isConnected )
            {
                var elem = elements[i];
                elements.splice(i, 1);
                onRemoveFunc && onRemoveFunc.call(this, elem);
                i = 0;
            }
        }
    };

    this.add = function(elementOrConstraint)
    {
        this[elementOrConstraint.nodeName ? "elements" : "constraints"].push(elementOrConstraint);

        if( elementOrConstraint.nodeName )
        {
            if( !elementOrConstraint.moondust )
            {
                elementOrConstraint.moondust =
                {
                    refresh: function()
                    {
                        let uid = Utils.uniqid;
                        for( let i in elementOrConstraint.moondust.refreshList )
                        {
                            elementOrConstraint.moondust.refreshList[i](elementOrConstraint);
                        }
                    },
                    remove: function(name)
                    {
                        if( elementOrConstraint.moondust.removeList.hasOwnProperty(name) )
                        {
                            elementOrConstraint.moondust.removeList[name](elementOrConstraint);
                            delete elementOrConstraint.moondust.removeList[name];
                            delete elementOrConstraint.moondust.refreshList[name];
                        }
                    },
                    refreshList: {},
                    removeList: {},
                    getProfilesName: () => {
                        let keys = [];
                        for (let k in elementOrConstraint.moondust.refreshList) {
                            keys.push(k);
                        }
                        return keys;
                    }
                };
            }

            elementOrConstraint.moondust.refreshList[this.name] = function(){ refreshElement(elementOrConstraint); };
            elementOrConstraint.moondust.removeList[this.name] = function(){ removeElement(elementOrConstraint); };
        }

        return this;
    };

    this.alive = function(notAlive)
    {
        if( notAlive )
        {
            moondust.Profile.prototype.aliveList.splice(moondust.Profile.prototype.aliveList.indexOf(this.name), 1);
        }
        else if( moondust.Profile.prototype.aliveList.indexOf(nameOrEmpty) < 0 )
        {
            moondust.Profile.prototype.aliveList.push(this.name);
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

        moondust.Profile.prototype.listSorted = false;

        return this;
    };

    this.removed = function(func) {
        onRemoveFunc = func;
    };
};
moondust.Profile.prototype.list = {};
moondust.Profile.prototype.listSorted = false;
moondust.Profile.prototype.aliveList = [];

/* Constraint */

moondust.Constraint = null;
moondust.Constraint = function(init)
{
    this.element = null;
    this.pass = true;

    this.applyOn = function(e)
    {
        let tmpConstraint = new moondust.Constraint;
        tmpConstraint.element = e;
        tmpConstraint.pass = true;

        return (init ? init.apply(tmpConstraint) : this);
    };

    this.constraint = function()
    {
        return (new this()).applyOn(this.element);
    };

    this.if = function(fun)
    {
        var args = values(arguments);

        if( !args.length )
        {
            this.pass = false;
            return this;
        }

        var name = args.shift();

        // simple function
        if( typeof name == "function" )
        {
            this.pass = name.apply(this, args);
            return this;
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
        var args = values(arguments);
        if( isFunction(fun) )
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

/* Others */

moondust.refresh = function()
{
    moondust.onBeforeRefresh.forEach(function(fun){ fun(); });

    var elements = document.querySelectorAll("["+options["MD"]+"], [data-"+options["MD"]+"]");
    for( var i = 0; i < elements.length; ++i )
    {
        var elementProfiles = datafun(elements[i], options["MD"]) || elements[i].getAttribute(options["MD"]) || "";
        elementProfiles = filterfun(elementProfiles.split(","));

        if (elementProfiles.length) {
            for( var y = 0; y < elementProfiles.length; ++y )
            {
                moondust.Profile(elementProfiles[y].trim()).add(elements[i]);
            }

            elements[i].attributes.getNamedItem(options["MD"]) && elements[i].attributes.removeNamedItem(options["MD"]);
            elements[i].dataset.hasOwnProperty(options["MD"]) && delete elements[i].dataset[options["MD"]];
        }
    }

    if( !moondust.Profile.prototype.listSorted )
    {
        // sort profiles
        moondust.Profile.prototype.listSorted = values(moondust.Profile.prototype.list);
        moondust.Profile.prototype.listSorted.sort(function(a, b){ return a.prio - b.prio; });

        // sort alive array
        moondust.Profile.prototype.aliveList.sort(function(a, b)
            {
                return moondust.Profile.prototype.list[a].prio - moondust.Profile.prototype.list[b].prio;
            }
        );
    }

    for( var i = 0; i < moondust.Profile.prototype.listSorted.length; ++i )
    {
        moondust.Profile.prototype.listSorted[i].refresh();
    }

    for( var i = 0; i < moondust.Profile.prototype.listSorted.length; ++i )
    {
        moondust.Profile.prototype.listSorted[i].clean();
    }

    moondust.onAfterRefresh.forEach(function(fun){ fun(); });

    return moondust;
};

moondust.onBeforeRefresh = [];
moondust.onAfterRefresh = [];

moondust.refreshNewProfiles = function() {
    var elements = document.querySelectorAll("["+options["MD"]+"], [data-"+options["MD"]+"]");
    for( var i = 0; i < elements.length; ++i )
    {
        var elementProfiles = datafun(elements[i], options["MD"]) || elements[i].getAttribute(options["MD"]) || "";
        elementProfiles = filterfun(elementProfiles.split(","));

        if (elementProfiles.length) {
            for( var y = 0; y < elementProfiles.length; ++y )
            {
                moondust.Profile(elementProfiles[y].trim()).add(elements[i]);
            }

            elements[i].attributes.getNamedItem(options["MD"]) && elements[i].attributes.removeNamedItem(options["MD"]);
            elements[i].dataset.hasOwnProperty(options["MD"]) && delete elements[i].dataset[options["MD"]];

            elements[i].moondust.refresh();
        }
    }
};

moondust.add = function(name, obj)
{
    if( isFunction(obj) )
    {
        functions[name] = obj;
    }
    else
    {
        options[name] = obj;
    }

    return moondust;
};

moondust.if = function(name)
{
    if( name.charAt(0) == '!' )
    {
        name = name.substr(1).trim();
        return functions.hasOwnProperty(name) && !functions[name]();
    }

    return functions.hasOwnProperty(name) && functions[name]();
};

moondust.do = function(name)
{
    if (functions.hasOwnProperty(name)) {
        return functions[name]();
    }

    return null;
};

moondust.option = function(name, val)
{
    if( typeof val != "undefined" )
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

moondust.getReference = function(target, ref)
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

var run;
run = function()
{
    var scrolls = [moondust.screenRect.left, moondust.screenRect.top];
    moondust.screenRect = {
        left: window.scrollX,
        top: window.scrollY,
        width: window.innerWidth,
        height: window.innerHeight,
        right: window.scrollX+window.innerWidth,
        bottom: window.scrollY+window.innerHeight
    };

    if( window.innerWidth != moondust.precSizes[0] || window.innerHeight != moondust.precSizes[1] )
    {
        moondust.precSizes = [window.innerWidth, window.innerHeight];
        moondust.prop = window.innerWidth/window.innerHeight;
        moondust.refresh();
    }
    else if( scrolls[0] != moondust.screenRect.left || scrolls[1] != moondust.screenRect.top )
    {
        // alives
        moondust.Profile.prototype.aliveList.forEach(function(key)
            {
                moondust.Profile.prototype.list[key].refresh();
            }
        );
    }

    setTimeout(run, options["refresh-time"]);
};

moondust.precSizes = [window.innerWidth, window.innerHeight];
moondust.prop = window.innerWidth/window.innerHeight;
moondust.isMobile = false;
moondust.scrollbarSize = 0;
moondust.screenRect = {
    left: window.scrollX,
    top: window.scrollY,
    width: window.innerWidth,
    height: window.innerHeight,
    right: window.scrollX+window.innerWidth,
    bottom: window.scrollY+window.innerHeight
};
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) moondust.isMobile = true;

moondust.option("refresh-time", 500);
moondust.option("MD", "profile");

// append scripts
moondust.appendScript = function(path) {
    if( !document.body || document.readyState != "complete" ) {
        setTimeout(function(){ moondust.appendScript(path); }, 50);
        return;
    }

    if (path.substr(path.length - 3) != ".js") path += ".js";

    ++moondust.appendScript.prototype.waiting;

    var script = document.createElement("script");
    script.src = path.charAt(0) == '/' || path.substr(0, 4) == "http" ? path : moondust.appendScript.prototype.mdpath+path;
    script.type = "text/javascript";

    script.onload = function()
    {
        --moondust.appendScript.prototype.waiting;

        if( !moondust.appendScript.prototype.waiting ) {
            moondust.refresh();
        }
    };

    document.head.appendChild(script);
};
moondust.appendScript.prototype.waiting = 0;
moondust.appendScript.prototype.mdpath = "";

// init
var initMoondust = function() {
    // get scrollbar size
    let element = document.createElement("div");
    let element2 = document.createElement("div");
    element.appendChild(element2);
    document.body.appendChild(element);
    element.style.height = "100px";
    element.style.visibility = "hidden";
    let prev = element2.width;
    element.style.overflowY = "scroll";
    moondust.scrollbarSize = prev-element2.width;
    element.remove();

    // start
    moondust.refresh();
    run();
};

// init scripts path
var scripts = document.querySelectorAll("script");
for( var i = 0; i < scripts.length; ++i ) {
    var scriptsrc = scripts[i].src.toLowerCase();
    if( scriptsrc.search(/\/moondust\./) >= 0 ) {
        moondust.appendScript.prototype.mdpath = scripts[i].src.substr(0, scriptsrc.search(/\/moondust\./))+'/';
        break;
    }
};

// get modules
var path = "";
var scriptNodes = document.getElementsByTagName("script");
for (var i = 0; i < scriptNodes.length; ++i) {
    if (scriptNodes[i].getAttribute("moonscript")) {
        var spl = scriptNodes[i].getAttribute("moonscript").split(",");
        for (let n of spl) {
            moondust.appendScript(n.trim());
        }
        break;
    }
}

var waitReadyState;
waitReadyState = function() {
    if (document.readyState == "complete") initMoondust();
    else setTimeout(waitReadyState, 50);
};

waitReadyState();
(function(){

    // RTB
    var RTB = window.RTB = {};

    // RTB.Utils
    var Utils = RTB.Utils = function(obj) {
        if (obj instanceof RTB.Utils) return obj;
        if (!(this instanceof RTB.Utils)) return new _(obj);
        this._wrapped = obj;
    };

    RTB.Utils.isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    // generate rand hex color
    RTB.Utils.getRandomColor = function() {
        var randColor = (Math.random() * 0xFFFFFF << 0).toString(16);
        while (randColor.length < 6) {
            randColor = '0' + randColor;
        }
        return '#' + randColor;
    };

    RTB.Utils.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    RTB.Utils.rgbToHex = function(r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    RTB.Utils.hexToRgb = function(hex) {
        hex = hex.replace('#', '');
        var bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    };

    RTB.Utils.extend = function(obj) {
        if (!RTB.Utils.isObject(obj)) return obj;
        var source, prop;
        for (var i = 1, length = arguments.length; i < length; i++) {
            source = arguments[i];
            for (prop in source) {
                if (Object.prototype.hasOwnProperty.call(source, prop)) {
                    obj[prop] = source[prop];
                }
            }
        }
        return obj;
    };

    // RTB.Events
    var Events = RTB.Events = {

    }

    // RTB.Canvas
    var Canvas = RTB.Canvas = function() {
        this.initialize.apply(this,arguments);
    };

    RTB.Utils.extend(Canvas.prototype, {
        initialize: function(ctx,canvasContainerElement) {
            this.ctx = ctx;
            this._isDrag = false;
            this._cachedCanvas = document.createElement('canvas');
            this._cachedContext = this._cachedCanvas.getContext('2d');
            this._canvas = canvasContainerElement;
            this._context = this.getCanvasElement().getContext('2d');
            this._beginCoordinates = {x: 0, y: 0};
            this.setAutoSize();
            this._addEventListeners();
            this._valid = false;
        },

        _addEventListeners: function() {
            this._canvas.addEventListener('mousedown',this._onMouseDown.bind(this),false);
            this._canvas.addEventListener('mouseup',this._onMouseUp.bind(this),false);
            this._canvas.addEventListener('mousemove',this._onMouseMove.bind(this),false);
            this._canvas.addEventListener('mouseover',this._onMouseOver.bind(this),false);
            setInterval(this._onUpdate.bind(this),30);
        },

        setWidth: function(width) {
            this.width = width;
        },

        setHeight: function(height) {
            this.height = height;
        },

        getHeight: function() {
            return this.getCanvasElement().height;
        },

        getWidth: function() {
            return this.getCanvasElement().width;
        },

        setAutoSize: function() {
            var canvas = this.getCanvasElement();
            var cachedCanvas = this.getCachedCanvasElement();

            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight;

            cachedCanvas.width = document.body.clientWidth;
            cachedCanvas.height = document.body.clientHeight;
        },

        getCanvasElement: function() {
            return this._canvas;
        },

        getCachedCanvasElement: function() {
            return this._cachedCanvas;
        },

        getContext: function() {
            return this._context;
        },

        getCachedContext: function(){
            return this._cachedContext;
        },

        // clear canvas
        clear: function(bounds) {
            var ctx = this.getContext();
            var cachedCtx = this.getCachedContext();

            if (bounds) {
                ctx.clearRect(bounds.x || 0, bounds.y || 0, bounds.width || 0, bounds.height || 0);
                cachedCtx.clearRect(bounds.x || 0, bounds.y || 0, bounds.width || 0, bounds.height || 0);
            }
            else {
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
                ctx.restore();

                cachedCtx.save();
                cachedCtx.setTransform(1, 0, 0, 1, 0, 0);
                cachedCtx.clearRect(0, 0, this.getWidth(), this.getHeight());
                cachedCtx.restore();
            }
        },

        _onMouseOver: function(ev) {
            ev.preventDefault();
        },

        _onMouseDown: function(ev) {
            ev.preventDefault();
            var mX,mY;
            mX = ev.clientX;
            mY = ev.clientY;

            this._isDrag = true;
            this._dragPointStart = {x: ev.clientX, y: ev.clientY};
            this._target = this.getIntersection({x: mX, y: mY});
            this._beginCoordinatesOld = {x: this._beginCoordinates.x, y: this._beginCoordinates.y};
        },

        _onMouseUp: function(ev) {
            ev.preventDefault();
            this._isDrag = false;
            this._target = null;
        },

        _onMouseMove: function(ev) {
            ev.preventDefault();

            var mX,mY;
            var cX = 0;
            var cY = 0;

            mX = ev.clientX;
            mY = ev.clientY;

            var debug = document.getElementById('debug-panel');
            debug.innerText = 'x: ' + mX + ', y: ' + mY;

            if(!this._isDrag) return;

            this._valid = false;

            if(this._target) {
                this._target.setDOMPosition({x: mX, y: mY});
                this._target.setPosition({x: (mX - this._beginCoordinates.x), y: (mY-this._beginCoordinates.y)});
            } else {

                if(mX > this._dragPointStart.x && (Math.abs(this._beginCoordinates.x - this._beginCoordinatesOld.x) < 320) ) {
                    cX = 7;
                }

                if(mX < this._dragPointStart.x && (Math.abs( this._beginCoordinates.x - this._beginCoordinatesOld.x) < 320)) {
                    cX = -7;
                }

                if(mY > this._dragPointStart.y && (Math.abs(this._beginCoordinates.y - this._beginCoordinatesOld.y) < 320)) {
                    cY = 7;
                }

                if(mY < this._dragPointStart.y && (Math.abs(this._beginCoordinates.y - this._beginCoordinatesOld.y) < 320)) {
                    cY = -7;
                }

                this.setBeginCoordinatesPosition({x: cX, y: cY});
            }
        },

        _onUpdate: function() {
            if(this._valid===false) {
                this.clear();
                this.ctx.render();
                this._valid = true;
            }
        },

        setBeginCoordinatesPosition: function(position) {
            console.log(this._beginCoordinates);
            var w, i;
            this.getContext().translate(position.x,position.y);
            this.getCachedContext().translate(position.x,position.y);
            this._beginCoordinates.x = this._beginCoordinates.x + position.x;
            this._beginCoordinates.y = this._beginCoordinates.y + position.y;

            for(i in this.ctx._widgets) {
                w = this.ctx._widgets[i];
                w.setDOMPosition({x: w.x + this._beginCoordinates.x, y: w.y + this._beginCoordinates.y});
                w.setPosition({x: (w.x + position.x), y: (w.y + position.y)});
            }
        },

        // get intersection between mouse position and widgets
        getIntersection: function(position) {
            var p = this.getCachedContext().getImageData(position.x,position.y,1,1).data,
                key;

            if(p[3]===255) {
                key = '#' + RTB.Utils.rgbToHex(p[0],p[1],p[2]);
                if(key in this.ctx._widgets) {
                    return this.ctx._widgets[key];
                }
            }
            return null;
        }
    });

    // RTB.Board
    var Board = RTB.Board = function() {
        this.initialize.apply(this,arguments);
    };

    RTB.Utils.extend(Board.prototype,{

        initialize: function(options) {
            var canvasContainerEl,
                domContainerEl;

            if(typeof options.id==='undefined') {
                throw new Error("ID board not specified");
            }

            this._currentZoomLevel = config.zoomLevel;
            this._widgets = [];
            this.id = options.id;

            if(options.canvasContainer!=='undefined') {
                canvasContainerEl = document.getElementById(options.canvasContainer);
                if(!canvasContainerEl) {
                    throw new Error('Container element for canvas not found');
                }
            } else {
                canvasContainerEl = document.createElement('canvas');
                document.body.appendChild(canvasContainerEl);
            }

            if(options.domContainer!=='undefined') {
                domContainerEl = document.getElementById(options.domContainer);
                if(!domContainerEl) {
                    throw new Error('Container element for DOM not found');
                }
            } else {
                domContainerEl = document.createElement('div');
                domContainerEl.style.display = 'none';
                document.body.appendChild(domContainerEl);
            }

            this._canvas = new RTB.Canvas(this,canvasContainerEl);
            this._dom = new RTB.DOMViever(this,domContainerEl);

            this.getData({
                success: function(response) {
                    this.reset(response.widgets);
                    this.render();
                }.bind(this),
                error: function(){
                    alert('Произошла ошибка, получить данные не удалось');
                }
            });

            this.toolsPanel = new RTB.ToolsPanel(this);
        },

        getZoomLevel: function() {
            return this._currentZoomLevel;
        },

        // makes a request to server and parsed response data
        getData: function(obj) {

            var xhr = new XMLHttpRequest();
            var url = (config.DEBUG) ? (config.debugURL + this.id + '.json') : (config.URL + this.id);
            xhr.open('GET', url, true);

            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onreadystatechange = function() {
                if (xhr.readyState===4) {
                    if(xhr.status===200) {
                        var response = JSON.parse(xhr.responseText);
                        obj.success(response,xhr);
                    } else
                        obj.error(xhr);
                }
            }

            xhr.send();
        },

        // Added new widgets collection to board
        reset: function(collection) {
            for(var i=0; i<collection.length;i++) {
                this.add(collection[i]);
            }
        },

        // render cancas
        render: function() {
            var key,
                widgets = this._widgets;
            for(key in widgets) {
                widgets[key].render();
                widgets[key].getElement().style.width = (Math.ceil(widgets[key].originalWidth/this.getZoomLevel()) + 'px');
                widgets[key].getElement().style.height = (Math.ceil(widgets[key].originalHeight/this.getZoomLevel()) + 'px');
            }
        },

        // Added new widget to board
        add: function(data) {
            new RTB.Widget(this,data);
        },

        // event handler for zoom in button
        onZoomIn: function(ev) {
            ev.preventDefault();
            if(this._currentZoomLevel===0.5) {
                alert("Максимальный масштаб");
                return;
            }
            this._currentZoomLevel -= 0.5;
            this.onChangeZoom();
        },

        onSwitchType: function(ev) {
            if(typeof this._type == 'undefined' || this._type == 'canvas') {
                this._type = 'dom';
                this._canvas.getCanvasElement().style.display = 'none';
                this._dom.getElement().style.display = 'block';
            } else {
                this._type = 'canvas';
                this._canvas.getCanvasElement().style.display = 'block';
                this._dom.getElement().style.display = 'none';
            }

            ev.preventDefault();
        },

        // event handler for zoom out button
        onZoomOut: function(ev) {
            ev.preventDefault();
            if(this._currentZoomLevel===4) {
                alert("Минимальный масштаб");
                return;
            }
            this._currentZoomLevel += 0.5;
            this.onChangeZoom();
        },

        onChangeZoom: function() {
            this.clear();
            this.render();
        },

        // event handler for window resize
        onResize: function() {
            this.getCanvas().setAutoSize();
            this.render();
        },

        // clear board
        clear: function(bounds) {
            this.getCanvas().clear(bounds);
        },

        getCanvas: function() {
            return this._canvas;
        }

    });

    // RTB.Widget
    var Widget = RTB.Widget = function() {
        this.initialize.apply(this,arguments);
    }

    RTB.Utils.extend(Widget.prototype,{

        initialize: function(ctx, attributes) {

            //if(attributes.type!=1) return null;

            if(attributes.type!=1 && attributes.type!==4 && attributes.type!==5) return null;

            console.log("Init widget " + attributes.id);

            var key,
                widgets = ctx._widgets;

            this.id = attributes.id;
            this.ctx = ctx;
            this.attributes = attributes || {};

            this.x = attributes.x;
            this.y = attributes.y;
            this.width = 0;
            this.originalWidth = (typeof attributes.width!=='undefined') ? attributes.width : 0;
            this.height = 0;
            this._inDOM = false;

            while(true) {
                key = RTB.Utils.getRandomColor();
                if(key && !( key in widgets)) {
                    break;
                }
            }

            this.colorKey = key;
            widgets[key] = this;

            if(this.attributes.type===1) {
                var el = document.createElement('img');
                this.el = el;
            }

            if(this.attributes.type===4) {
                var el = document.createElement('div');
                this.el = el;
                this.originalHeight = 200;
            }

            if(this.attributes.type===5) {
                var el = document.createElement('div');
                this.el = el;
                this.originalHeight = 200;
                this.originalWidth = 200;
            }
        },

        // render widget
        render: function() {
            if(this.attributes.type===1) {
                var img = new Image();
                if(config.DEBUG) {
                    img.src = 'images/image.png';
                } else {
                    img.src = this.attributes.url;
                }
                img.onload = function() {
                    this.originalWidth = img.width;
                    this.originalHeight = img.height;

                    this.width = img.width/this.ctx.getZoomLevel();
                    this.height = img.height/this.ctx.getZoomLevel();
                    this.ctx.getCanvas().getContext().drawImage(img,this.x,this.y,this.width,this.height);

                    this._fillShape();

                    if(!this._inDOM) {
                        this.el.src = img.src;
                        this.el.style.position = 'absolute';
                        this.el.style.left = this.x + 'px';
                        this.el.style.width = img.width + 'px';
                        this.el.style.height = img.height + 'px';
                        this.el.style.top = this.y + 'px';
                        this.el.style.zIndex = '9001';

                        this.el.id = 'w' + this.id;
                        this.ctx._dom.getElement().appendChild(this.el);
                        this._bindDOMElEvents();
                        this._inDOM = true;
                    }
                }.bind(this);
            }

            if(this.attributes.type===4) {

                this.width = this.originalHeight/this.ctx.getZoomLevel();
                this.height = this.originalHeight/this.ctx.getZoomLevel();

                this.ctx.getCanvas().getContext().font = 18/(this.ctx.getZoomLevel()*2) + 'pt Arial';
                this.el.style.font = 18/(this.ctx.getZoomLevel()*2) + 'pt Arial';

                this.ctx.getCanvas().getContext().beginPath();
                this.ctx.getCanvas().getContext().fillText(
                    this.attributes.text,
                    this.x + 20,
                    this.y + 20,
                    this.width
                );
                this.ctx.getCanvas().getContext().closePath();

                this._fillShape();

                if(!this._inDOM) {
                    this.el.innerHTML = this.attributes.text;
                    this.el.style.position = 'absolute';
                    this.el.style.left = this.x + 'px';
                    this.el.style.top = this.y + 'px';
                    this.el.style.zIndex = '9001';

                    this.el.id = 'w' + this.id;
                    this.ctx._dom.getElement().appendChild(this.el);
                    this._bindDOMElEvents();
                    this._inDOM = true;
                }
            }

            if(this.attributes.type===5) {

                this.height = this.originalWidth/this.ctx.getZoomLevel();
                this.width = this.originalHeight/this.ctx.getZoomLevel();
                this.ctx.getCanvas().getContext().font = 18/(this.ctx.getZoomLevel()*2) + 'pt Arial';
                this.el.style.font = 18/(this.ctx.getZoomLevel()*2) + 'pt Arial';

                this.ctx.getCanvas().getContext().fillStyle = '#FF9';
                this.ctx.getCanvas().getContext().beginPath();
                this.ctx.getCanvas().getContext().fillRect(
                    this.x,
                    this.y,
                    this.width,
                    this.height
                );

                this.ctx.getCanvas().getContext().fillStyle = '#000';
                this.ctx.getCanvas().getContext().fillText(
                    this.attributes.text,
                    this.x + (15/(this.ctx.getZoomLevel())),
                    this.y + (15/(this.ctx.getZoomLevel())),
                    this.width
                );
                this.ctx.getCanvas().getContext().closePath();

                this._fillShape();

                if(!this._inDOM) {
                    this.el.innerText = this.attributes.text;
                    this.el.style.position = 'absolute';
                    this.el.style.backgroundColor = '#FF9';
                    this.el.style.width = this.originalWidth/this.ctx.getZoomLevel() + 'px';
                    this.el.style.height = this.originalHeight/this.ctx.getZoomLevel() + 'px';
                    this.el.style.left = this.x + 'px';
                    this.el.style.top = this.y + 'px';
                    this.el.style.zIndex = '9001';

                    this.el.id = 'w' + this.id;
                    this._bindDOMElEvents();
                    this.ctx._dom.getElement().appendChild(this.el);
                    this._inDOM = true;
                }
            }
        },

        _bindDOMElEvents: function() {
            this.el.addEventListener('mousedown', this._onMouseDown.bind(this),false);
        },

        _onMouseDown: function(ev) {
            ev.stopPropagation();
            this.ctx._dom._isDrag = true;
            this.ctx._dom._target = this;
            ev.preventDefault();
        },

        setDOMPosition: function(position) {
            this.el.style.left = position.x + 'px';
            this.el.style.top = position.y + 'px';
        },

        setPosition: function(position) {
            this.x = position.x;
            this.y = position.y;
        },

        // attributes getter
        get: function(key) {
            return this.attributes[key];
        },

        // attributes setter
        set: function(obj) {
            for(var key in obj) {
                this.attributes[key] = obj[key];
            }
        },

        _fillShape: function() {
            this.ctx.getCanvas().getCachedContext().fillStyle = this.colorKey;
            this.ctx.getCanvas().getCachedContext().beginPath();
            this.ctx.getCanvas().getCachedContext().fillRect(this.x,this.y,this.width,this.height);
            this.ctx.getCanvas().getCachedContext().closePath();
        },

        getElement: function() {
            return this.el;
        }

    });

    // RTB.ToolsPanel
    var ToolsPanel = RTB.ToolsPanel = function() {
        this.initialize.apply(this,arguments);
    }

    RTB.Utils.extend(ToolsPanel.prototype, {
        initialize: function(ctx) {
            this.ctx = ctx;
            this._buildDOM();
            this._bindEventListeners();
        },

        _buildDOM: function() {

            var element = document.createElement('div');
            element.className = 'tools-panel';
            document.body.appendChild(element);

            var zoomInTool = document.createElement('div');
            zoomInTool.className = 'tool zoom_in';
            element.appendChild(zoomInTool);
            this._zoomInTool = zoomInTool;

            var zoomOutTool = document.createElement('div');
            zoomOutTool.className = 'tool zoom_out';
            element.appendChild(zoomOutTool);
            this._zoomOutTool = zoomOutTool;

            var switchTypeTool = document.createElement('div');
            switchTypeTool.className = 'tool switch';
            element.appendChild(switchTypeTool);
            this._switchTypeTool = switchTypeTool;
        },

        _bindEventListeners: function() {
            window.addEventListener('resize',this.ctx.onResize.bind(this.ctx),false);
            this._zoomInTool.addEventListener('click',this.ctx.onZoomIn.bind(this.ctx),false);
            this._zoomOutTool.addEventListener('click',this.ctx.onZoomOut.bind(this.ctx),false);
            this._switchTypeTool.addEventListener('click',this.ctx.onSwitchType.bind(this.ctx),false);
        }

    });

    // RTB.DomViewer
    var DomViewer = RTB.DOMViever = function() {
        this.initialize.apply(this,arguments);
    }

    RTB.Utils.extend(DomViewer.prototype,{
        initialize: function(ctx,element) {
            this.ctx = ctx;
            this.element = element;
            this._isDrag = false;
            this._target = null;
            this.setAutoSize();
            this.element.addEventListener('mousemove',this._onMouseMove.bind(this),false);
            this.element.addEventListener('mouseup',this._onMouseUp.bind(this),false);
            this.element.addEventListener('mousedown',this._onMouseDown.bind(this),false);
        },

        setAutoSize: function() {
            var el = this.element;
            el.style.width = document.body.clientWidth;
            el.style.height = document.body.clientHeight;
        },

        _onMouseUp: function(ev) {
            ev.preventDefault();
            this._isDrag = false;
            this._target = null;
            this.ctx._canvas._valid = true;
        },

        _onMouseDown: function(ev) {
            this._isDrag = true;
            this._dragPointStart = {x: ev.clientX, y: ev.clientY};
            this._target = null;
            this._beginCoordinatesOld = {x: this.ctx._canvas._beginCoordinates.x, y: this.ctx._canvas._beginCoordinates.y};
        },

        getElement: function() {
            return this.element;
        },

        _onMouseMove: function(ev) {
            console.log(2121);
            var mX, mY;
            var cX = 0;
            var cY = 0;
            mX = ev.clientX;
            mY = ev.clientY;

            if(!this._isDrag) return;

            this.ctx._canvas._valid = false;

            if(this._target) {
                this._target.setDOMPosition({x: mX , y: mY});
                this._target.setPosition({x: (mX - this.ctx._canvas._beginCoordinates.x), y: (mY-this.ctx._canvas._beginCoordinates.y)});
            } else {

                if(mX > this._dragPointStart.x && (Math.abs(this.ctx._canvas._beginCoordinates.x - this._beginCoordinatesOld.x) < 320) ) {
                    cX = 7;
                }

                if(mX < this._dragPointStart.x && (Math.abs( this.ctx._canvas._beginCoordinates.x - this._beginCoordinatesOld.x) < 320)) {
                    cX = -7;
                }

                if(mY > this._dragPointStart.y && (Math.abs(this.ctx._canvas._beginCoordinates.y - this._beginCoordinatesOld.y) < 320)) {
                    cY = 7;
                }

                if(mY < this._dragPointStart.y && (Math.abs(this.ctx._canvas._beginCoordinates.y - this._beginCoordinatesOld.y) < 320)) {
                    cY = -7;
                }

                this.ctx._canvas.setBeginCoordinatesPosition({x: cX, y: cY});
            }

            ev.preventDefault();
        }
     });

    return RTB;

})();
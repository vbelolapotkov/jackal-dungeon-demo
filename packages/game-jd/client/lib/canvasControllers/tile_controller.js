/**
 * Created by vbelolapotkov on 12/05/15.
 */
cTileController = function (canvas) {
    this.canvas = canvas;
};

cTileController.prototype.findById = function (id) {
    var canvas = this.canvas;
    var objects = canvas.getObjects('cTile');
    if(!objects) return;
    var tile = _.find(objects, function (obj) {
        return obj.tileId === id;
    });
    return tile;
};

cTileController.prototype.createContainer = function (coords) {
    //coordinates of tile center
    this.container = new EmptyTile(coords);
    this.canvas.add(this.container);
};

cTileController.prototype.createDeck = function (backUrl, callback) {
    //eHandler - eventHandler for mouse up event on deck
    var self = this;
    var backOptions = {
        url: backUrl,
        id: 0,
        left: self.container.getLeft(),
        top: self.container.getTop(),
        selectable: false
    };

    //create tile and add to canvas
    cTile.fromURL(backOptions, function (tile) {
        self.canvas.add(tile);
        callback(tile);
    });
};

cTileController.prototype.addNewTile = function (options, callback) {
    var self = this;
    if(!options.coords)
        options.coords = {
            left: self.container.getLeft(),
            top: self.container.getTop()
        };
    //if relative coords supplied with reference than convert to abs
    if(options.ref) options.coords = rel2abs(options.coords, options.ref);
    var tileOpts = {
        url:options.url,
        id: options.id,
        angle: options.angle || 0,
        left: options.coords.left,
        top: options.coords.top
    };
    cTile.fromURL(tileOpts, function (tile) {
        self.canvas.add(tile);
        if(callback) callback(tile);
    });
};

cTileController.prototype.removeTile = function (tile) {
    var t = this.getTile(tile);
    this.canvas.remove(t);
};

cTileController.prototype.addEventHandlers = function (tile,eventMap) {
    //add event handlers for tile
    //tile - id or tile object
    var t = this.getTile(tile);
    //set event maps on t
    _.forEach(eventMap, function (event) {
        t.on(event.name, event.handler);
    });
};

cTileController.prototype.getTile = function (tile) {
    //todo: add more checking on tile
    if (typeof tile === 'string') {
        return this.findById(tile);
    }
    else return tile;
};

cTileController.prototype.move = function (tile, newCoords, callback) {
    var self = this;
    var t = self.getTile(tile);
    var coords = self.getCoords(t);
    if(coords.left === newCoords.left && coords.top === newCoords.top) return;

    t.animate(newCoords, {
        onChange: self.canvas.renderAll.bind(self.canvas),
        onComplete: function () {
            if(callback) callback(t);
        }
    })
};

cTileController.prototype.moveRel = function (tile, rel, ref, callback) {
    //ref - reference point
    var newCoords = rel2abs(rel, ref);
    this.move(tile,newCoords,callback);
}

cTileController.prototype.rotate = function (tile, angle, callback) {
    var self = this;
    var t = self.getTile(tile);
    if(t.getAngle() === angle) return;

    t.animate('angle',angle, {
        onChange: self.canvas.renderAll.bind(self.canvas),
        onComplete: function () {
            //t.fire('modified', {action: 'rotate'});
            if(callback) callback(t);
        }
    });
};

cTileController.prototype.getId = function (tile) {
    return tile.id;
};

cTileController.prototype.getCoords = function (tile) {
    var t = this.getTile(tile);
    return {
        left: t.getLeft(),
        top: t.getTop()
    }
};

cTileController.prototype.getRelCoords = function (tile, ref) {
    //ref - reference point for relative coords
    var abs = this.getCoords(tile);
    return abs2rel(abs, ref);
};

cTileController.prototype.getSize = function (tile) {
    var t = this.getTile(tile);
    return {
        width: t.getWidth(),
        height: t.getHeight()
    }
};

cTileController.prototype.getCenterPoint = function (tile) {
    var t = this.getTile(tile);
    return {
        left: Math.round(t.getLeft() + t.getWidth()/2),
        top:  Math.round(t.getTop() + t.getHeight()/2)
    }
};

cTileController.prototype.getAngle = function (tile) {
    var t = this.getTile(tile);
    return t.getAngle();
};

cTileController.prototype.fireEvent = function (tile, event, options) {
    var t = this.getTile(tile);
    t.fire(event, options);
};

cTileController.prototype.remove = function (tile) {
    var t=this.getTile(tile);
    t.remove();
};

cTileController.prototype.set = function (tile, options) {
    var t=this.getTile(tile);
    t.set(options);
};

cTileController.prototype.setCoordsWithUpdate = function (tile, options) {
    var t=this.getTile(tile);
    t.set(options);
    t.setCoords();
};

cTileController.prototype.isTile = function (tile) {
    //checks if the object is tile
    if(!tile) return false;
    return tile.canvas && tile.type === 'cTile';
}

function rel2abs (rel, ref) {
    return {
        left: rel.left + ref.left,
        top: rel.top + ref.top
    };
};

function abs2rel (abs, ref) {
    return {
        left: abs.left - ref.left,
        top: abs.top - ref.top
    }
}
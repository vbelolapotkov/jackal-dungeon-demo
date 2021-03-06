/**
 * Created by vbelolapotkov on 06/05/15.
 */
Meteor.publish('dungeonMap', function (tableId) {
    var cursor = Tiles.find({tableId: tableId, location: 'onMap'});
    if(cursor.count()<1) {
        JD.initGameCollections(tableId);
    }
    return cursor;
});

Meteor.publish('tilesOnTable', function (tableId) {
   return Tiles.find({tableId: tableId, location: 'onTable'});
});

Meteor.publish('tilesDeck', function (tableId) {
    if(!this.userId) return;
    return Tiles.find({tableId: tableId, location: 'inDeck'},{
        fields:{
            location: 1,
            tableId: 1,
            dIndex: 1,
            backUrl: 1
        }
    });
});

Meteor.publish('dungeonPirates', function (tableId) {
    if(!this.userId) return;
    var user = GameTables.parseUserId(this.userId);
    if(!user || !user.name || user.tableId !== tableId) {
        console.log('Failed to subscribe to dungeon pirates. Not authorized');
        return;
    }
    return Pirates.find({tableId: tableId});
});

Meteor.publish('tableDice', function (tableId) {
    return Dice.find({tableId: tableId});
});

Pirates.allow({
    update: function (userId, doc, fieldName, modifier) {
        var user = GameTables.parseUserId(userId);
        if(!user || !user.tableId || !user.tableId===doc.tableId) return false;
        return true;
    }
});

Dice.allow({
    insert: function () {return false;},
    update: function () {return false;},
    remove: function (userId, doc) {
        var user = GameTables.parseUserId(userId);
        return user && user.tableId === doc.tableId;
    }
});

Tiles.allow({
    update: function (userId, doc, fieldNames) {
        var user = GameTables.parseUserId(userId);
        if(!user || !user.tableId || !user.tableId===doc.tableId) return false;
        //todo: think about location change restrictions
        var allowedFields = [
            'coords',
            'dCoords',
            'angle',
            'lastChange',
            'location',
            'ownerId',
            'hasGold'
        ];
        //check if each field in fieldNames is in allowed list
        return _.every(fieldNames, function (field) {
            return _.contains(allowedFields, field);
        });
    }
});



var map;

$(document).ready(function () {
    var maps = []
    var layers= [];
    var options = {};
    options.url = "/api/maps/1";
    options.type = "GET";
    options.dataType = "json";
    options.success = function (data) {
        var groups = _.groupBy(data, 'groupname');
        for(g in groups) {
            layers.push(new ol.layer.Tile({
                title: g,
                visible: true,
                source: new ol.source.TileWMS({
                    url: 'http://127.0.0.1:5050/appgiswms/basemap', //+ m.mapname,
                    params: { 'LAYERS': g, 'TILED': true, 'TRANSPARENT': false, 'username': 'yodeski', 'password': 'lolo' },
                    serverType: 'mapserver',
                    cacheSize: 3000,
                    wrapX: true
                })
            }));
        }

        //for (var i = 0; i < data.length; i++) {
        //    layers.push(new ol.layer.Tile({
        //        title: g,
        //        visible: true,
        //        source: new ol.source.TileWMS({
        //            url: 'http://127.0.0.1:5050/appgiswms/basemap', //+ m.mapname,
        //            params: { 'LAYERS': g, 'TILED': true, 'TRANSPARENT': false, 'username': 'yodeski', 'password': 'lolo' },
        //            serverType: 'mapserver',
        //            cacheSize: 3000,
        //            wrapX: true
        //        })
        //    }));
        //}

        maps.push(new ol.layer.Group({
            title: 'basemap',
            layers: layers
        }));

        map = new ol.Map({
            layers: maps[0],
            target: 'map',
            view: new ol.View({
                center: [0, 0],
                zoom: 2,

            }),
        });

        var layerSwitcher = new ol.control.LayerSwitcher({
            tipLabel: 'Layers' // Optional label for button
        });
        //map.addControl(layerSwitcher);
        //map.addControl(new ol.control.MousePosition());
        //layerSwitcher.showPanel();

    };



    options.error = function (err) {
        $("#msg").html("Error while calling the Web API!");
    };

    $.ajax(options);

    var tmsM = new ol.layer.Group({
        title: 'Base Layers',
        layers,
        /*layers: [
            new ol.layer.Image({
                name: "Countries",
                title: 'WMS - Countries',
                type: 'base',
                visible: false,
                source: getWMSSource('default')
            }),
            new ol.layer.Tile({
                title: 'Countries - Tiled WMS',
                visible: true,
                type: 'base',
                source: new ol.source.TileWMS({
                    url: 'http://127.0.0.1:5050/appgiswms/basemap',
                    params: { 'LAYERS': 'default', 'TILED': true, 'TRANSPARENT': false, 'username': 'yodeski', 'password': 'lolo' },
                    serverType: 'mapserver',
                    cacheSize: 3000,
                    //gutter: 10,
                    wrapX: true
                })
            }),
            new ol.layer.Tile({
                title: 'Terminator - Tiled WMS',
                visible: true,
                source: new ol.source.TileWMS({
                    url: 'http://127.0.0.1:5050/appgiswms/terminator',
                    params: { 'LAYERS': 'sunterminator', 'TILED': true, 'TRANSPARENT': true, 'username': 'yodeski', 'password': 'lolo' },
                    serverType: 'mapserver',
                    cacheSize: 3000,
                    //gutter: 10,
                    wrapX: true
                })
            }),
            new ol.layer.Tile({
                title: 'Times Zones - Tiled WMS',
                visible: false,
                source: new ol.source.TileWMS({
                    url: 'http://127.0.0.1:5050/appgiswms/terminator',
                    params: { 'LAYERS': 'timeszones', 'TILED': true, 'TRANSPARENT': true, 'username': 'yodeski', 'password': 'lolo' },
                    serverType: 'mapserver',
                    cacheSize: 3000,
                    wrapX: true
                })
            })
        ]*/
    });

});

function getWMSSource(lyrname) {
    return new ol.source.ImageWMS({
        url: 'http://127.0.0.1:5050/appgiswms/basemap',
        params: { 'LAYERS': lyrname, 'CRS': $('#cbbprj').val(), 'username': 'yodeski', 'password': 'lolo' },
        serverType: 'mapserver'
    });
}


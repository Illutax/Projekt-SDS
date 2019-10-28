/* eslint-disable no-unused-vars */

const Config = {
    clickCounter: {},
    footer: {
        visibility: true,
        urls: [
            {
                "bezeichnung": "Kartographie und Gestaltung: ",
                "url": "http://www.geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV"
            }
        ]
    },
    gfiWindow: "attached",
    ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
    layerConf: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/services-fhhnet-ALL.json",
    mouseHover: {
        numFeaturesToShow: 2,
        infoText: "(weitere Objekte. Bitte zoomen.)"
    },
    namedProjections: [
        // GK DHDN
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        // ETRS89 UTM
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        // LS 320: zusammen mit Detlef Koch eingepflegt und geprüft
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        // WGS84
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ],
    portalConf: "../../portal/master/",
    remoteInterface: {
        postMessageUrl: "https://localhost:9001"
    },
    proxyURL: "/cgi-bin/proxy.cgi",
    quickHelp: {
        imgPath: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/img/"
    },
    restConf: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/rest-services-fhhnet.json",
    scaleLine: true,
    simpleMap: false,
    styleConf: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/style_v2.json",
    wfsImgPath: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/img/",
    zoomToFeature: {
        attribute: "flaechenid",
        styleId: "location_eventlotse",
        wfsId: "4560"
    },
    startingMap3D: false,
    obliqueMap: true,
    cesiumParameter: {
        tileCacheSize: 20,
        enableLighting: true,
        fog: {
            enabled: true,
            density: 0.0002,
            screenSpaceErrorFactor: 2.0
        },
        maximumScreenSpaceError: 2,
        fxaa: true
    }
};

/* eslint-enable no-unused-vars */

import {Circle, LineString} from "ol/geom.js";
import Overlay from "ol/Overlay.js";
import Geolocation from "ol/Geolocation.js";
import proj4 from "proj4";
import * as Proj from "ol/proj.js";

const OrientationModel = Backbone.Model.extend({
    defaults: {
        zoomMode: "once", // once oder always entsprechend Config
        firstGeolocation: true, // Flag, ob es sich um die erste geolocation handelt, damit "once" abgebildet werden kann.
        marker: new Overlay({
            positioning: "center-center",
            stopEvent: false
        }),
        showPoi: false,
        tracking: false, // Flag, ob derzeit getrackt wird.
        geolocation: null, // ol.geolocation wird bei erstmaliger Nutzung initiiert.
        poiDistances: [500, 1000, 2000], // fallback values, if not defined in config
        position: "",
        isGeolocationDenied: false,
        isGeoLocationPossible: false,
        epsg: "EPSG:25832"
    },
    initialize: function (config) {
        var channel;

        if (_.has(config, "attr") && _.has(config.attr, "poiDistances") && _.isArray(config.attr.poiDistances)) {
            this.setPoiDistances(config.attr.poiDistances);
        }
        channel = Radio.channel("geolocation");

        channel.on({
            "removeOverlay": this.removeOverlay,
            "sendPosition": this.sendPosition
        }, this);

        channel.reply({
            "isGeoLocationPossible": function () {
                return this.get("isGeoLocationPossible");
            },
            "getPoiDistances": function () {
                return this.get("poiDistances");
            },
            "getFeaturesInCircle": this.getVectorFeaturesInCircle
        }, this);

        this.listenTo(this, {
            "change:isGeoLocationPossible": function () {
                channel.trigger("changedGeoLocationPossible", this.get("isGeoLocationPossible"));
            }
        }, this);

        this.listenTo(Radio.channel("ModelList"), {
            "updateVisibleInMapList": this.checkWFS
        });

        this.setConfig();
        this.setIsGeoLocationPossible();
    },

    /**
     * Fügt das Element der ol.Overview hinzu. Erst nach render kann auf document.getElementById zugegriffen werden.
     * @returns {void}
     */
    addElement: function () {
        this.get("marker").setElement(document.getElementById("geolocation_marker"));
    },

    /**
     * Übernimmt die Einträge der config.json
     * @returns {void}
     */
    setConfig: function () {
        if (this.get("poiDistances")) {
            if (_.isArray(this.get("poiDistances")) && this.get("poiDistances").length > 0) {
                this.setPoiDistances(this.get("poiDistances"));
                this.setShowPoi(true);
            }
            else if (this.get("poiDistances") === true) {
                this.setShowPoi(true);
            }
        }
    },

    /**
     * Triggert die Standpunktkoordinate auf Radio
     * @returns {void}
    */
    sendPosition: function () {
        if (this.get("zoomMode") === "once") {
            this.listenToOnce(this, "change:position", function () {
                Radio.trigger("geolocation", "position", this.get("position"));
            });
            this.track();
        }
        else {
            this.track();
            Radio.trigger("geolocation", "position", this.get("position"));
        }
    },
    removeOverlay: function () {
        Radio.trigger("Map", "removeOverlay", this.get("marker"));
    },
    untrack: function () {
        var geolocation = this.get("geolocation");

        geolocation.un("change", this.positioning.bind(this), this);
        geolocation.un("error", this.onError.bind(this), this);
        if (this.get("tracking") === false || this.get("firstGeolocation") === false) {
            this.removeOverlay();
        }
        this.set("firstGeolocation", true);
        this.set("tracking", false);
    },
    track: function () {
        var geolocation;

        if (this.get("isGeolocationDenied") === false) {
            Radio.trigger("Map", "addOverlay", this.get("marker"));
            if (this.get("geolocation") === null) {
                geolocation = new Geolocation({tracking: true, projection: Proj.get("EPSG:4326")});
                this.set("geolocation", geolocation);
            }
            else {
                geolocation = this.get("geolocation");
                this.positioning();
            }
            geolocation.on("change", this.positioning.bind(this), this);
            geolocation.on("error", this.onError.bind(this), this);
            this.set("tracking", true);
        }
        else {
            this.onError();
        }
    },
    positionMarker: function (position) {
        try {
            this.get("marker").setPosition(position);
        }
        catch (e) {
            console.error("Marker konnte nicht gesetzt werden");
        }
    },
    zoomAndCenter: function (position) {
        Radio.trigger("MapView", "setCenter", position, 6);
    },
    positioning: function () {
        var geolocation = this.get("geolocation"),
            position = geolocation.getPosition(),
            firstGeolocation = this.get("firstGeolocation"),
            zoomMode = this.get("zoomMode"),
            centerPosition = proj4(proj4("EPSG:4326"), proj4(this.get("epsg")), position);

        // speichere Position
        this.set("position", centerPosition);

        // Bildschirmnavigation
        if (zoomMode === "once") {
            if (firstGeolocation === true) {
                this.positionMarker(centerPosition);
                this.zoomAndCenter(centerPosition);
                this.set("firstGeolocation", false);
            }
            else {
                this.positionMarker(centerPosition);
            }
        }
        else {
            this.positionMarker(centerPosition);
            this.zoomAndCenter(centerPosition);
        }
    },
    onError: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>Lokalisierung nicht verfügbar: </strong>",
            kategorie: "alert-danger"
        });
        this.setIsGeolocationDenied(true);
        this.untrack();
    },
    onPOIError: function (evt) {
        Radio.trigger("Alert", "alert", {
            text: "<strong>'In meiner Nähe' nicht verfügbar: </strong>" + evt.message,
            kategorie: "alert-danger"
        });
        this.untrack();
        Radio.trigger("Util", "hideLoader");
    },
    trackPOI: function () {
        var geolocation;

        Radio.trigger("Map", "addOverlay", this.get("marker"));
        if (this.get("geolocation") === null) {
            geolocation = new Geolocation({tracking: true, projection: Proj.get("EPSG:4326")});
            this.set("geolocation", geolocation);
        }
        else {
            geolocation = this.get("geolocation");
            this.callGetPOI();
        }
        geolocation.once("change", this.callGetPOI, this);
        geolocation.once("error", this.onPOIError, this);
    },
    untrackPOI: function () {
        var geolocation = this.get("geolocation");

        geolocation.un("change", this.callGetPOI, this);
        geolocation.un("error", this.onPOIError, this);
    },
    callGetPOI: function () {
        Radio.trigger("POI", "showPOIModal");
    },

    /**
     * Ermittelt die Features aus Vektprlayern in einem Umkreis zur Position. Funktioniert auch mit Clusterlayern.
     * @param  {integer} distance Umkreis
     * @return {Array}          Array of ol.features
     */
    getVectorFeaturesInCircle: function (distance) {
        var geolocation = this.get("geolocation"),
            position = geolocation.getPosition(),
            centerPosition = proj4(proj4("EPSG:4326"), proj4(this.get("epsg")), position),
            circle = new Circle(centerPosition, distance),
            circleExtent = circle.getExtent(),
            visibleWFSLayers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"}),
            featuresAll = [],
            features = [];

        _.each(visibleWFSLayers, function (layer) {
            if (layer.has("layerSource") === true) {
                features = layer.get("layerSource").getFeaturesInExtent(circleExtent);
                _.each(features, function (feat) {
                    _.extend(feat, {
                        styleId: layer.get("styleId"),
                        layerName: layer.get("name"),
                        dist2Pos: this.getDistance(feat, centerPosition)
                    });
                }, this);
                featuresAll = _.union(features, featuresAll);
            }
        }, this);

        return featuresAll;
    },

    /**
     * Ermittelt die Entfernung des Features zur Geolocation auf Metergenauigkeit
     * @param  {ol.feature} feat Feature
     * @param {number[]} centerPosition -
     * @return {float}      Entfernung
     */
    getDistance: function (feat, centerPosition) {
        var closestPoint = feat.getGeometry().getClosestPoint(centerPosition),
            line = new LineString([closestPoint, centerPosition]),
            dist = Math.round(line.getLength());

        return dist;
    },

    setZoomMode: function (value) {
        this.set("zoomMode", value);
    },

    // setter für showPoi
    setShowPoi: function (value) {
        this.set("showPoi", value);
    },

    setIsGeolocationDenied: function (value) {
        this.set("isGeolocationDenied", value);
        this.set("isGeoLocationPossible", false);
    },

    setIsGeoLocationPossible: function () {
        this.set("isGeoLocationPossible", window.location.protocol === "https:" || _.contains(["localhost", "127.0.0.1"], window.location.hostname));
    },

    // setter for poiDistances
    setPoiDistances: function (value) {
        this.set("poiDistances", value);
    },

    // setter for marker
    setMarker: function (value) {
        this.set("marker", value);
    },

    // setter for tracking
    setTracking: function (value) {
        this.set("tracking", value);
    }
});

export default OrientationModel;

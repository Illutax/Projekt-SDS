import Tool from "../../core/modelList/tool/model";
import Overlay from "ol/Overlay.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import {GeoJSON} from "ol/format.js";
import {Stroke, Style} from "ol/style.js";

const RoutingModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        bkgSuggestURL: "",
        bkgGeosearchURL: "",
        viomRoutingURL: "",
        viomProviderID: "",
        description: "",
        endDescription: "",
        routingtime: "",
        routingdate: "",
        fromCoord: "",
        toCoord: "",
        fromList: [],
        toList: [],
        startAdresse: "",
        zielAdresse: "",
        bbox: "",
        routelayer: null,
        mhpOverlay: "",
        isGeolocationPossible: Radio.request("geolocation", "isGeoLocationPossible") === true,
        renderToWindow: true,
        glyphicon: "glyphicon-road"
    }),
    initialize: function () {
        this.superInitialize();

        Radio.on("geolocation", "position", this.setStartpoint, this); // asynchroner Prozess
        Radio.on("geolocation", "changedGeoLocationPossible", this.setIsGeolocationPossible, this);
    },
    setStartpoint: function (geoloc) {
        this.set("fromCoord", geoloc);
        this.setCenter(geoloc);
        this.set("startAdresse", "aktueller Standpunkt");
    },
    setParams: function () {
        var viomRoutingModel,
            bkgSuggestModel,
            bkgGeosearchModel,
            epsgCode,
            bbox;

        viomRoutingModel = Radio.request("RestReader", "getServiceById", this.get("viomRoutingID"));
        bkgSuggestModel = Radio.request("RestReader", "getServiceById", this.get("bkgSuggestID"));
        bkgGeosearchModel = Radio.request("RestReader", "getServiceById", this.get("bkgGeosearchID"));
        epsgCode = Radio.request("MapView", "getProjection").getCode() ? "&srsName=" + Radio.request("MapView", "getProjection").getCode() : "";
        bbox = this.get("bbox") && epsgCode !== "" ? "&bbox=" + this.get("bbox") + epsgCode : null;

        this.set("bkgSuggestURL", bkgSuggestModel.get("url"));
        this.set("bkgGeosearchURL", bkgGeosearchModel.get("url"));
        this.set("viomRoutingURL", viomRoutingModel.get("url"));
        this.set("viomProviderID", viomRoutingModel.get("providerID"));
        this.set("bbox", bbox);
        this.set("epsgCode", epsgCode);
    },
    deleteRouteFromMap: function () {
        if (this.get("routelayer") !== "") { // Funktion WÜRDE bei jeder Window-Aktion ausgeführt
            this.removeOverlay();
            Radio.trigger("Map", "removeLayer", this.get("routelayer"));
            this.set("routelayer", "");
            this.set("description", "");
            this.set("endDescription", "");
            this.set("sumLength", "");
            this.set("sumTime", "");
        }
    },
    suggestByBKG: function (value, target) {
        var arr = value.split(/,| /),
            plz = arr.filter(function (val) {
                return val.match(/^([0]{1}[1-9]{1}|[1-9]{1}[0-9]{1})[0-9]{3}$/);
            }),
            hsnr = arr.filter(function (val, index, list) {
                var patt = /^\D*$/,
                    preString = patt.test(list[index - 1]),
                    isHouseNr = false;

                if (index >= 1) {
                    if (preString) { // vorher ein String
                        isHouseNr = val.match(/^[0-9]{1,4}\D?$/);
                    }
                }
                return isHouseNr;
            }),
            query = "&query=" + _.without(arr, plz[0], hsnr[0]),
            bbox = _.isNull(this.get("bbox")) === false ? this.get("bbox") : "",
            filter = "";

        if (plz.length === 1 && hsnr.length === 1) {
            filter = "&filter=(plz:" + plz + ") AND (typ:Haus) AND haus:(" + hsnr + "*)";
        }
        else if (plz.length === 1 && hsnr.length !== 1) {
            filter = "&filter=(plz:" + plz + ") AND (typ:Strasse OR typ:Ort OR typ:Geoname)";
        }
        else if (plz.length !== 1 && hsnr.length === 1) {
            filter = "&filter=(typ:Haus) AND haus:(" + hsnr + "*)";
        }
        else {
            filter = "&filter=(typ:Strasse OR typ:Ort OR typ:Geoname)";
        }

        query = encodeURI(query);
        $.ajax({
            url: this.get("bkgSuggestURL"),
            data: "count=5" + query + bbox + filter,
            context: this, // das Model
            async: true,
            type: "GET",
            success: function (data) {
                var treffer = [];

                try {
                    _.each(data, function (strasse) {
                        treffer.push([strasse.suggestion, strasse.highlighted]);
                    });
                    if (target === "start") {
                        this.set("fromList", treffer);
                    }
                    else {
                        this.set("toList", treffer);
                    }
                }
                catch (error) {
                    Radio.trigger("Alert", "alert", {text: "Entschuldigung, die Adressabfrage konnte leider nicht verarbeitet werden. Bitte wenden sie sich an den Administrator.", kategorie: "alert-warning"});
                }
            },
            error: function (error) {
                Radio.trigger("Alert", "alert", {text: "Entschuldigung, die Adressabfrage ist leider fehlgeschlagen. Bitte wenden sie sich an den Administrator. Folgender Fehler ist aufgetreten:  " + error.statusText, kategorie: "alert-warning"});
            },
            timeout: 3000
        });
    },
    geosearchByBKG: function (value, target) {
        $.ajax({
            url: this.get("bkgGeosearchURL"),
            data: this.get("epsgCode") + "&count=1&outputformat=json&query=" + encodeURI(value),
            context: this, // das model
            async: true,
            type: "GET",
            success: function (data) {
                if (data.features[0] && data.features[0].geometry) {
                    if (target === "start") {
                        this.set("fromCoord", data.features[0].geometry.coordinates);
                        this.set("fromList", "");
                        this.set("startAdresse", data.features[0].properties.text);
                    }
                    else {
                        this.set("toCoord", data.features[0].geometry.coordinates);
                        this.set("toList", "");
                        this.set("zielAdresse", data.features[0].properties.text);
                    }
                    this.setCenter(data.features[0].geometry.coordinates);
                }
            },
            error: function (error) {
                Radio.trigger("Alert", "alert", {text: "Adressabfrage fehlgeschlagen: " + error.statusText, kategorie: "alert-warning"});
            },
            timeout: 3000
        });
    },
    setCenter: function (newCoord) {
        if (newCoord && newCoord.length === 2) {
            Radio.trigger("MapView", "setCenter", newCoord, 10);
        }
    },
    requestRoute: function () {
        var request = "PROVIDERID=" + this.get("viomProviderID") + "&REQUEST=VI-ROUTE&START-X=" + this.get("fromCoord")[0] + "&START-Y=" + this.get("fromCoord")[1] + "&DEST-X=" + this.get("toCoord")[0] + "&DEST-Y=" + this.get("toCoord")[1] + "&USETRAFFIC=TRUE",
            splitter,
            utcHour,
            utcMinute;

        // zählt das Anfordern einer Routenberechnung
        Radio.trigger("ClickCounter", "calcRoute");


        /* Erwartete Übergabeparameter:
        *  routingtime [hh:mm]
        *  routingdate [yyyy-mm-dd]
        */
        if (this.get("routingtime") !== "" && this.get("routingdate") !== "") {
            splitter = this.get("routingtime").split(":");
            utcHour = (parseFloat(splitter[0]) + (new Date().getTimezoneOffset() / 60)).toString();
            utcMinute = parseFloat(splitter[1]);

            request = request + "&STARTTIME=" + this.get("routingdate") + "T" + utcHour + ":" + utcMinute + ":00.000Z";
        }
        Radio.trigger("Util", "showLoader");
        $.ajax({
            url: this.get("viomRoutingURL"),
            data: request,
            async: true,
            context: this,
            success: function (data) {
                var geoJsonFormat = new GeoJSON(),
                    olFeature = geoJsonFormat.readFeature(data),
                    vectorlayer = new VectorLayer({
                        source: new VectorSource({
                            features: [olFeature]
                        }),
                        style: new Style({
                            stroke: new Stroke({
                                color: "blue",
                                width: 5
                            })
                        })
                    });

                Radio.trigger("Util", "hideLoader");
                vectorlayer.id = "routenplanerroute";
                this.set("routelayer", vectorlayer);
                Radio.trigger("Map", "addLayer", vectorlayer);
                this.set("endDescription", olFeature.get("EndDescription"));
                this.set("sumLength", (olFeature.get("Distance") / 1000).toFixed(1).toString().replace(".", ","));
                this.set("sumTime", Math.round(olFeature.get("Duration") / 60).toString());
                this.set("description", olFeature.get("RouteDescription"));
                Radio.trigger("Map", "zoomToExtent", olFeature.getGeometry().getExtent());
                this.addOverlay(olFeature);
            },
            error: function () {
                Radio.trigger("Util", "hideLoader");
                this.set("description", "");
                this.set("endDescription", "");
                Radio.trigger("Alert", "alert", {text: "Fehlermeldung bei Routenberechung", kategorie: "alert-warning"});
            }
        });
    },
    removeOverlay: function () {
        if (this.get("mhpOverlay") !== "") {
            Radio.trigger("Map", "removeOverlay", this.get("mhpOverlay"));
            this.set("mhpOverlay", "");
        }
    },
    addOverlay: function (olFeature) {
        var html = "<div id='routingoverlay' class=''>",
            position = olFeature.getGeometry().getLastCoordinate();

        html += "<span class='glyphicon glyphicon-flag'></span>";
        html += "<span>" + olFeature.get("EndDescription").substr(olFeature.get("EndDescription").indexOf(". ") + 1) + "</span>";
        html += "</div>";

        $("#map").append(html);
        this.set("mhpOverlay", new Overlay({element: $("#routingoverlay")[0]}));
        this.get("mhpOverlay").setPosition([position[0] + 7, position[1] - 7]);
        Radio.trigger("Map", "addOverlay", this.get("mhpOverlay"));
    },

    // setter for isGeolocationPossible
    setIsGeolocationPossible: function (value) {
        this.set("isGeolocationPossible", value);
    }
});

export default RoutingModel;

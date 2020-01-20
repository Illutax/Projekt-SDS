import {Circle, Fill, Stroke, Style, Icon} from "ol/style.js";
import Tool from "../../core/modelList/tool/model";
import Feature from "ol/Feature";
import {Point} from "ol/geom";
import {pointerMove} from "ol/events/condition.js";
import {Select, Modify, Draw, Snap} from "ol/interaction.js";
import RotateFeatureInteraction from "ol-rotate-feature";
import Translate from "ol/interaction/Translate";

const ElementTool = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defautls, {
        // ol.interaction.Draw
        drawInteraction: undefined,
        // ol.interaction.Snap
        snapInteraction: undefined,
        // ol.interaction.Select for the deleted features
        selectInteraction: undefined,
        // ol.interaction.select
        realselectInteraction: undefined,
        // ol-rotate-feature-interaction
        rotateInteraction: undefined,
        // ol.interaction.select fuer die rotateInteraction
        rotateSelectInteraction: undefined,
        // ol.interaction.Modify
        modifyInteraction: undefined,
        // destination layer for the drawn features
        translateInteraction: undefined,
        layer: undefined,
        color: [127, 127, 127, 1],
        width: 928,
        broad: 928,
        opacity: 1,
        radius: 6,
        strokeWidth: 6,
        button: "a",
        drawType: {
            geometry: "Point",
            text: "Element setzen",
            freehand: false,
            mode: undefined
        },
        freehand: undefined,
        formerOption: undefined, // Um mehrere Optionen anzubieten, die vorherige Speichern
        arrayOption1: undefined,
        arrayOption2: undefined,
        arrayOption3: undefined,
        renderToWindow: true, // Wenn man auf Element platzieren klickt, kommt links ein Menü
        deactivateGFI: true
        // glyphicon: "glyphicon-pencil"
    }),

    // Quasi Constructor von ElementTool
    initialize: function () {
        var channel = Radio.channel("Draw");
        this.formerOption = "Option 1";
        this.superInitialize();
        channel.reply({
            "getLayer": function () {
                return this.get("layer");
            }
        }, this);
        this.on("change:isActive", this.setStatus, this);

    },

    setStatus: function (model, value) {
        if (value) {
            if (this.get("layer") === undefined) {
                this.createLayer();
            }
            this.createDrawInteraction(this.get("drawType"), this.get("layer"));
        }
        else {
            Radio.trigger("Map", "removeInteraction", this.get("drawInteraction"));
            Radio.trigger("Map", "removeInteraction", this.get("selectInteraction"));
            Radio.trigger("Map", "removeInteraction", this.get("modifyInteraction"));
            Radio.trigger("Map", "removeInteraction", this.get("translateInteraction"));
        }
    },

    /**
     * Kreiert ein Vektorlayer für die gezeichneten Features und löscht den callback von change:istCurrentWin-Event,
     * weil nur ein Layer benötigt wird
     * @param {boolean} value - is tool active
     * @returns {void}
     */
    createLayer: function () {
        var layer = Radio.request("Map", "createLayerIfNotExists", "import_draw_layer");

        this.setLayer(layer);
    },

    /**
     * Erstellt und setzt eine Interaction, um Vektorfeatures auszuwählen
     * @param {ol.layer.Vector} layer - für die selektierten Features
     * @returns {void}
     */
    createSelectInteraction: function (layer) {
        var selectInteraction = new Select({
            layers: [layer]
        });

        selectInteraction.on("select", function (evt) {
            // remove feature from source
            layer.getSource().removeFeature(evt.selected[0]);
            // remove feature from interaction
            this.getFeatures().clear();
        });
        this.setSelectInteraction(selectInteraction);
    },

    /** 
     * Selektiert alle Features auf der aktuellen Layer
     * Erzeugt eine neue RotateFeatureInteraction und
     * setzt die beiden Variablen auf diese Interactions
     * @param {ol.layer.Vector} layer - für die selektierten Features
     * @returns {void}
     */
    createRotateInteraction: function (layer) {
        var select = new Select({
            layers: [layer],
            condition: pointerMove
        }),
            rotate = new RotateFeatureInteraction({
            features: select.getFeatures(),
            anchor: [0, 0],
            angle: -90 * Math.PI / 180
        });

        rotate.on("rotateend", evt => {
            this.replaceElement(evt, layer);
        });
        this.setRotateInteraction(rotate);
        this.setRotateSelectInteraction(select);
    },

    /** 
     * Erstellt einen neuen Punkt mit dem drawType und der Rotation des
     * jeweiligen features und fuegt diesen der Map hinzu
     * @param {*} evt - Das ausgewählte Feature
     * @param {ol.layer.Vector} layer - für die selektierten Features
     * @returns {void}
     */
    replaceElement: function (evt, layer) {
        var layers = Radio.request("Map", "getLayers"),
            button = this.get("button"),
            drawType = this.get("drawType"),
            point = new Feature({
            geometry: new Point(evt.anchor)
            // unterscheidung zum downloaden
        });

        point.setStyle(this.getDrawStyle(drawType.text, button, -1 * evt.angle, evt.features_.item(0).getStyle().getImage().getSrc()));
        layer.getSource().addFeature(point);
        layer.getSource().removeFeature(evt.features_.item(0));
        Radio.trigger("Map", "addLayerToIndex", [layer, layers.getArray().length]);
        this.setLayer(layer);
    },

    /**
     * Erstellt und setzt eine Interaction, um Vektorfeatures zu modifizieren
     * @param {ol.layer.Vector} layer - für die selektierten Features
     * @returns {void}
     */
    createModifyInteraction: function (layer) {
        this.set("modifyInteraction", new Modify({
            source: layer.getSource()
        }));
    },

    /**
     * Erstellt und setzt eine Interaction, um Vektorfeatures zu verschieben
     * @param {ol.layer.Vector} layer - für die selektierten Features
     * @returns {void}
     */
    createTranslateInteraction: function (layer) {
        this.set("translateInteraction", new Translate({
            source: layer.getSource(),
            hitTolerance: 0
        }));
    },

    /** 
     * Erstelle einen neuen Draw und packe sie in drawInteraction
     * Erstelle dann ein neues Feature auf der Map
     * @param {*} drawType - Der Drawtyp für die neue Drawinteraction
     * @param {ol.layer.Vector} - für die selektierten Features
     * @returns {void}
     */
    createDrawInteraction: function (drawType, layer) {
        var that = this,
            freehand = this.get("freehand") === "Freihand";
        Radio.trigger("Map", "removeInteraction", this.get("drawInteraction"));
        this.set("drawInteraction", new Draw({
            source: layer.getSource(),
            type: drawType.geometry,
            //++ abfrage fuer das setzen des Elements
            geometryName: drawType.text,
            style: this.getStyle(drawType.text),
            freehand: freehand
        }));
        // feature
        this.get("drawInteraction").on("drawend", function (evt) {
            evt.feature.set("styleId", _.uniqueId());
            evt.feature.setStyle(that.getStyle(drawType.text));
        }, this);
        Radio.trigger("Map", "addInteraction", this.get("drawInteraction"));

        if (drawType.geometry === "LineString") {
            this.addSnapInteraction(layer);
        }
    }
    ,

    addSnapInteraction: function (layer) {
        this.set("snapInteraction", new Snap({
            source: layer.getSource(),
            pixelTolerance: 10
        }));
        Radio.trigger("Map", "addInteraction", this.get("snapInteraction"));
    }
    ,

    /*
     * Prüfe den Style, der gerade ausgewählt ist und gibt ihn zurück.
     * Hier soll unterschieden werden zwischen Weg und Elemente
     */
    getStyle: function (arg) {
        if (arg === "Marker" || arg === "Weg setzen") {
            return this.getWegStyle(this.get("drawType").mode);
        }
        return this.getDrawStyle(this.get("drawType").text, this.get("button"), this.get("rotation"));
    },

    /** 
     * Style für Wege im Stile von LineStrings mit der Farbe color
     * Beim Zebrastreifen wird eine dicke Linie mit lineDash Pattern gezeichnet
     * @param {string} mode - Der ausgewählte Modus
     * @return {ol.style.Style} style
     */
    getWegStyle: function (mode) {
        var color = [this.get("color")[0], this.get("color")[1], this.get("color")[2], this.get("color")[3]];
        if (mode === "spurlinie") {
            var lineDash = [6, 18];
        }
        else if (mode === "green") {
            var miter = "miter";
        }
        return new Style({
            fill: new Fill({
                color: color
            }),
            stroke: new Stroke({
                color: color,
                width: this.get("strokeWidth"),
                lineCap: "square",
                lineDash: lineDash,
                miter: miter
            }),
            image: new Circle({
                radius: this.get("radius"),
                fill: new Fill({
                    color: color
                })
            })
        });
    },

    /**
     * Erstellt ein Feature Style für Punkte, Linien oder Flächen und gibt ihn zurück.
     * @param {string} text - Art des Elements
     * @param {string} button - Wert des Thumbnails im HTML
     * @param {*} rotation - Der Rotationsgrad
     * @param {*} source - Bild für das Feature
     * @return {ol.style.Style} style
     */
    getDrawStyle: function (text, button, rotation, source) {
        var laenge = this.get("width"),
            breite = this.get("broad"),
            offset = [25, 25],
            src;

        if (button === "d") {
            laenge = 524;
            breite = 524;
            offset = [0, 0];
        }
        if (source === undefined) {
            src = this.determineIconImage(text, button);
        }
        else {
            src = source;
        }

        return new Style({
            image:
                new Icon({
                    anchor: [0.5, 0.5],
                    size: [laenge, breite],
                    offset: offset,
                    opacity: this.get("opacity"),
                    scale: 0.15,
                    rotation: rotation,
                    src: src
                })
        });
    },


    /**
     * Löscht alle Geometrien vom Layer
     */
    deleteFeatures: function () {
        this.get("layer").getSource().clear();
    },

    /**
     * Entscheidet welches Bild (Auto, Bus, etc.) platziert werden soll, wenn man die Linke Maustaste
     * betätigt
     * @param {string} text - Ob es sich um ein Element oder ein Schild handelt 
     * @param {string} button - Welches Thumbnail gedrückt wurde
     */
    determineIconImage: function (text, button) {
        var s;

        if (text === "Element setzen") {
            switch (button) {
                case "a":
                    s = "https://i.imgur.com/Evb3ArU.png";
                    break;
                case "b":
                    s = "https://i.imgur.com/2Wgk3Cl.png";
                    break;
                case "c":
                    s = "https://i.imgur.com/5oLmn7T.png";
                    break;
                case "d":
                    s = "https://i.imgur.com/DOU6wM6.png";
                    break;
                case "e":
                    s = "https://i.imgur.com/SlEOl1Y.png";
                    break;
                case "f":
                    s = "https://i.imgur.com/sD6ilBP.png";
                    break;
                case "blauAuto":
                    s = "https://i.imgur.com/1D0carp.png";
                    break;
                case "orangeAuto":
                    s = "https://i.imgur.com/X4Vy8TQ.png";
                    break;
                case "truck":
                    s = "https://i.imgur.com/qymQPt0.png";
                    break;
                case "klTruck":
                    s = "https://i.imgur.com/rcPA2qk.png";
                    break;
                case "hecke":
                    s = "https://i.imgur.com/ZVA7GkP.png";
                    break;
                case "busch":
                    s = "https://i.imgur.com/fvTacgV.png";
                    break;
                case "kinderwagen":
                    s = "https://i.imgur.com/U2enWUn.png";
                    break;
                case "behinderter":
                    s = "https://i.imgur.com/pCYW3le.png";
                    break;
                case "bushalte":
                    s = "https://i.imgur.com/aW3sU5N.png";
                    break;
                case "parkplace":
                    s = "https://i.imgur.com/zRAaVp3.png";
                    break;
                case "bikehalt":
                    s = "https://i.imgur.com/X1sBbB0.png";
                    break;
                case "behindertpark":
                    s = "https://i.imgur.com/ZtL8EqX.png";
                    break;
            }
        }
        else if (text === "Schild setzen") {
            switch (button) {
                case "30":
                    s = "https://i.imgur.com/eFD61EQ.png";
                    break;
                case "50":
                    s = "https://i.imgur.com/37cQhVf.png";
                    break;
                case "70":
                    s = "https://i.imgur.com/njDhTYG.png";
                    break;
                case "halt":
                    s = "https://i.imgur.com/oWbLeKf.png";
                    break;
                case "keineEinfahrt":
                    s = "https://i.imgur.com/zYLbEEk.png";
                    break;
                case "ampel":
                    s = "https://i.imgur.com/HEKi7P3.png";
                    break;
                case "park":
                    s = "https://i.imgur.com/yjhEyhU.png";
                    break;
                case "stop":
                    s = "https://i.imgur.com/ah15Yht.png";
                    break;
                case "einzelVorfahrt":
                    s = "https://i.imgur.com/MJr2SJw.png";
                    break;
                case "vorfahrt":
                    s = "https://i.imgur.com/Nj7an5K.png";
                    break;
                case "vorfahrtGewaehr":
                    s = "https://i.imgur.com/gBFWO6D.png";
                    break;
                case "spurEng":
                    s = "https://i.imgur.com/9omt5uu.png";
                    break;
                case "parkverbot":
                    s = "https://i.imgur.com/3DG0vDm.png";
                    break;
                case "halteverbot":
                    s = "https://i.imgur.com/37ncHKw.png";
                    break;
                case "einbahn":
                    s = "https://i.imgur.com/3eh0npX.png";
                    break;
                case "behindert":
                    s = "https://i.imgur.com/cc8yYiQ.png";
                    break;
            }
        }
        return s;
    },

    /**
     * Hauptmethode um zu entscheiden, welche Interaction aktiviert/deaktiviert werden muss
     * @param {*} value - Die jeweilige Interaktion
     * @returns {void}
     */
    toggleInteraction: function (value) {
        if (value.hasClass("modify")) {
            this.toggleModifyInteraction(this.get("drawInteraction").getActive());
        }
        else if (value.hasClass("translate")) {
            this.toggletranslateInteraction(this.get("drawInteraction").getActive());
        }
        // falls Klasse 'rotate', dann gehe in Methode toggleRotateInteraction
        else if (value.hasClass("rotate")) {
            this.toggleRotateInteraction(this.get("drawInteraction").getActive());
        }
        else {
            this.toggleSelectInteraction(this.get("drawInteraction").getActive());
        }
    },

    /**
     * Aktiviert/Deaktiviert das Verschieben von Features
     * @param {boolean} value - Entscheidung, ob Interaktion aktiviert oder deaktiviert werden soll
     * @returns {void}
     */
    toggletranslateInteraction: function (value) {
        if (value) {
            Radio.trigger("Map", "addInteraction", this.get("translateInteraction"));
            this.get("drawInteraction").setActive(false);
            this.setGlyphToCursor("glyphicon glyphicon-wrench");
        }
        else {
            Radio.trigger("Map", "removeInteraction", this.get("translateInteraction"));
            this.get("drawInteraction").setActive(true);
            this.setGlyphToCursor("glyphicon glyphicon-pencil");
        }
    },

    /**
     * Aktiviert/Deaktiviert das Modifizieren von Features
     * @param {boolean} value - Entscheidung, ob Interaktion aktiviert oder deaktiviert werden soll
     * @returns {void}
     */ 
    toggleModifyInteraction: function (value) {
        if (value) {
            Radio.trigger("Map", "addInteraction", this.get("modifyInteraction"));
            this.get("drawInteraction").setActive(false);
            this.setGlyphToCursor("glyphicon glyphicon-wrench");
        }
        else {
            Radio.trigger("Map", "removeInteraction", this.get("modifyInteraction"));
            this.get("drawInteraction").setActive(true);
        }
    },

    /**
     * Aktiviert/Deaktiviert das Rotieren von Features
     * @param {boolean} value - Entscheidung, ob Interaktion aktiviert oder deaktiviert werden soll
     * @returns {void}
     */
    toggleRotateInteraction: function (value) {
        if (value) {
            Radio.trigger("Map", "addInteraction", this.get("rotateInteraction"));
            Radio.trigger("Map", "addInteraction", this.get("rotateSelectInteraction"));
            this.get("drawInteraction").setActive(false);
        }
        else {
            Radio.trigger("Map", "removeInteraction", this.get("rotateInteraction"));
            this.get("drawInteraction").setActive(true);
        }
    },

    /** 
     *  Aktiviert/Deaktiviert ol.interaction.select. Auf Click wird das Feature gelöscht.
     * @param {boolean} value - Entscheidung, ob Interaktion aktiviert oder deaktiviert werden soll
     * @returns {void}
     */
    toggleSelectInteraction: function (value) {
        if (value) {
            Radio.trigger("Map", "addInteraction", this.get("selectInteraction"));
            this.get("drawInteraction").setActive(false);
            this.setGlyphToCursor("glyphicon glyphicon-trash");
        }
        else {
            Radio.trigger("Map", "removeInteraction", this.get("selectInteraction"));
            this.get("drawInteraction").setActive(true);
        }
    },

    // Erstellt ein HTML-Element, legt dort das Glyphicon rein und klebt es an den Cursor
    setGlyphToCursor: function (glyphicon) {
        if (glyphicon.indexOf("trash") !== -1) {
            $("#map").removeClass("no-cursor");
            $("#map").addClass("cursor-crosshair");
        }
        else {
            $("#map").removeClass("cursor-crosshair");
            $("#map").addClass("no-cursor");
        }        $("#cursorGlyph").removeClass();
        $("#cursorGlyph").addClass(glyphicon);
    },

    /**
     * Startet das Downloadmodul
     * @returns {void}
     */
    downloadFeatures: function () {
        var features = this.get("layer").getSource().getFeatures();

        Radio.trigger("elementdownload", "start", {
            data: features,
            formats: ["kml"],
            caller: {
                name: "element",
                glyph: "glyphicon-pencil"
            }
        });
    },

    setDrawType: function (value1, value2, value3) {
        this.set("drawType", {geometry: value1, text: value2, freehand: value3});
    },

    setFont: function (value) {
        this.set("font", value);
    },

    /**
     * Speichert die aktuell auf dem Layer befindenlichen Vektorfeatures in den vorgesehenen Array
     * und lädt alle Features aus dem für die ausgewählte Option vorgesehenen Array
     * @param {string} chosen - Die ausgewählte Option
     */
    setItems: function (chosen) {
        var source = this.get("layer").getSource();
        var layer = this.get("layer");
        // Fuer die jeweilige gewaehlte Option: Pruefen, welche Option vorher gewaehlt wurde
        switch (chosen) {
            case "Option 1": {
                // Packe das Feature-Array in die dafuer vorgesehene Exemplarvariable
                if (this.formerOption === "Option 2") {
                    this.arrayOption2 = source.getFeatures();
                }
                else if (this.formerOption === "Option 3") {
                    this.arrayOption3 = source.getFeatures();
                }
                this.get("layer").getSource().clear();
                if (this.arrayOption1 !== undefined) {
                    source.addFeatures(this.arrayOption1);
                }
                // Loesche alle features vom Layer und setze formerOption auf das jetzt Gewaehlte
                this.formerOption = chosen;
                this.createDrawInteraction(this.get("drawType"), this.get("layer"));
                break;
            }
            case "Option 2": {
                if (this.formerOption === "Option 1") {
                    this.arrayOption1 = source.getFeatures();
                }
                else if (this.formerOption === "Option 3") {
                    this.arrayOption3 = source.getFeatures();
                }
                this.get("layer").getSource().clear();
                if (this.arrayOption2 !== undefined) {
                    source.addFeatures(this.arrayOption2);
                }
                this.formerOption = chosen;
                break;
            }
            case "Option 3": {
                if (this.formerOption === "Option 1") {
                    this.arrayOption1 = source.getFeatures();
                }
                else if (this.formerOption === "Option 2") {
                    this.arrayOption2 = source.getFeatures();
                }
                this.get("layer").getSource().clear();
                if (this.arrayOption3 !== undefined) {
                    source.addFeatures(this.arrayOption3);
                }
                this.formerOption = chosen;
                break;
            }
        }
    },

    setFontSize: function (value) {
        this.set("fontSize", value);
    },

    // Setzen der Farben im RGB-Format
    setColor: function (value) {
        var s;
        switch (value) {
            case "bicycle":
                s = [94, 32, 40, 0.8];
                break;
            case "spurlinie":
                s = [255, 255, 255, 0.9];
                break;
            case "street2":
                s = [50, 50, 50, 0.8];
                break;
            case "green":
                s = [34, 177, 76, 0.8];
                break;
            case "grenze":
                s = [0, 0, 0, 1];
                break;
            default:
                s = [127, 127, 127, 0.8];
        }
        this.set("color", s);
    },

    setOpacity: function (value) {
        this.set("opacity", value);
    },

    setBroadSize: function (value) {
        this.set("broad", value);
    },

    setWidthSize: function (value) {
        this.set("width", value);
    },

    setText: function (value) {
        this.set("text", value);
    },

    setRadius: function (value) {
        this.set("radius", parseInt(value, 10));
    },

    setStrokeWidth: function (value) {
        // this.set("strokeWidth", parseInt(value, 10));
        this.set("strokeWidth", value);
        this.set("radius", value / 2);
    },

    setSelectInteraction: function (value) {
        this.set("selectInteraction", value);
    },

    setRotateInteraction: function (value) {
        this.set("rotateInteraction", value);
    },

    setRotateSelectInteraction: function (value) {
        this.set("rotateSelectInteraction", value);
    },

    setRealselectInteraction: function (value) {
        this.set("selectInteraction", value);
    },

    setLayer: function (value) {
        this.set("layer", value);
    },

    setButtonClicked: function (value) {
        this.set("button", value);
    },

    setRotation: function (value) {
        this.set("rotation", value);
    },

    setWegSelected: function (value1, value2, value3) {
        this.setColor(value3);
        this.setStrokeWidth(value3);
        this.set("drawType", {text: value1, freehand: value2, geometry: "LineString", mode: value3});
    },

    setFreehand: function (value) {
        this.set("freehand", value);
    }
});

export default ElementTool;

import Overlay from "ol/Overlay.js";

const MouseHoverPopupModel = Backbone.Model.extend(/** @lends MouseHoverPopupModel.prototype */{
    defaults: {
        overlay: new Overlay({
            id: "mousehover-overlay"
        }),
        textPosition: null,
        textArray: null,
        minShift: 5,
        numFeaturesToShow: 2,
        infoText: "(weitere Objekte. Bitte zoomen.)"
    },

    /**
     * @class MouseHoverPopupModel
     * @extends Backbone.Model
     * @memberof MouseHover
     * @constructs
     * @property {Radio.channel} channel=Radio.channel("MouseHover") Radio channel for communication
     * @property {ol.Feature} overlay=newOverlay({id:"mousehover-overlay"}) New OpenLayers Overlay instance
     * @property {String} textPosition=null Position for the popup to open
     * @property {Array} textArray=null Array to hold the text for the popup
     * @property {Number} minShift=5 Minimum shift to check if the mouse position changed significantly
     * @property {Number} numFeaturesToShow=2 Maximum number of texts to show
     * @property {String} infoText="(weitereObjekte.Bittezoomen.)" Default info text to add to the popup
     * @fires MouseHover#render
     * @fires Map#RadioTriggerMapAddOverlay
     * @fires Map#RadioTriggerMapRegisterListener
     * @fires Parser#RadioRequestParserGetItemsByAttributes
     * @listens MouseHover#RadioTriggerMouseHoverHide
     */

    initialize: function () {
        var channel = Radio.channel("MouseHover");

        this.listenTo(channel, {
            "hide": this.destroyPopup
        });
        Radio.trigger("Map", "addOverlay", this.get("overlay"));
        Radio.trigger("Map", "registerListener", "pointermove", this.checkDragging.bind(this), this);
        this.getMouseHoverInfosFromConfig();
    },
    /**
    * Gets MouseHoverInfos from config.
    * @fires Parser#RadioRequestParserGetItemsByAttributes
    * @returns {void}
    */
    getMouseHoverInfosFromConfig: function () {
        var groupLayers = [],
            layerGroups = [],
            wfsLayers = [],
            geoJsonLayers = [],
            sensorThingsLayers = [],
            vectorLayers = [],
            mouseHoverLayers = [],
            mouseHoverInfos = [];

        // Extract relevant layer from grouped layers
        layerGroups = Radio.request("Parser", "getItemsByAttributes", {type: "layer", typ: "GROUP"});
        layerGroups.forEach(layerGroup => {
            layerGroup.children.forEach(layer => {
                if (["WFS", "GeoJSON", "SensorThings"].indexOf(layer.typ) !== -1) {
                    groupLayers.push(layer);
                }
            });
        });

        wfsLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "WFS"});
        geoJsonLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "GeoJSON"});
        sensorThingsLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "SensorThings"});

        // union all found layers
        vectorLayers = _.union(wfsLayers, geoJsonLayers, sensorThingsLayers, groupLayers);

        // now filter all layers with mouse hover functionality
        mouseHoverLayers = vectorLayers.filter(function (layer) {
            return _.has(layer, "mouseHoverField") && layer.mouseHoverField !== "";
        });
        mouseHoverInfos = _.map(mouseHoverLayers, function (layer) {
            return _.pick(layer, "id", "mouseHoverField");
        });

        this.setMouseHoverInfos(mouseHoverInfos);
    },

    /**
     * Destroy the Popup.
     * @returns {void}
     */
    destroyPopup: function () {
        this.setTextArray(null);
        this.setTextPosition(null);
        this.setOverlayPosition(undefined);
    },
    /**
     * Shows the Popup.
     * @fires MouseHover#render
     * @returns {void}
     */
    showPopup: function () {
        this.trigger("render", this.get("textArray"));
    },

    /**
     * Sets the position of the overlay
     * @param {ol.Coordinate | undefined} value - if the value is undefined the overlay is hidden
     * @returns {void}
     */
    setOverlayPosition: function (value) {
        this.get("overlay").setPosition(value);
    },

    /**
     * Gets the features at the pixel
     * @param {evt} evt PointerMoveEvent
     * @param {Array} mouseHoverInfos Array of mouseHoverInfos
     * @returns {Array} features Array of features at the pixel
     */
    getFeaturesAtPixel: function (evt, mouseHoverInfos) {
        var features = [],
            layerIds = _.pluck(mouseHoverInfos, "id");

        evt.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            if (layer !== null && _.contains(layerIds, layer.get("id"))) {
                features.push({
                    feature: feature,
                    layer: layer
                });
            }

        });
        return features;
    },
    /**
     * Checks if the feature is a cluster feature
     * @param {ol.Feature} feature feature at pixel
     * @returns {Boolean} boolean  True or False result of feature check
     */
    isClusterFeature: function (feature) {
        if (feature.getProperties().features) {
            return true;
        }
        return false;
    },
    /**
     * Create feature array
     * @param {ol.Feature} featureAtPixel feature at pixel
     * @returns {Array} pFeatureArray Array of features at pixel
     */
    fillFeatureArray: function (featureAtPixel) {
        var pFeatureArray = [],
            selFeature,
            list;

        // featuresAtPixel.layer !== null --> quick little hack to avoid showing the popup while drawing SD 01.09.2015
        if (!_.isUndefined(featureAtPixel) && featureAtPixel.layer !== null) {
            selFeature = featureAtPixel.feature;

            if (this.isClusterFeature(selFeature)) {
                list = selFeature.getProperties().features;

                _.each(list, function (element) {
                    pFeatureArray.push({
                        feature: element,
                        layerId: featureAtPixel.layer.get("id")
                    });
                });
            }
            else {
                pFeatureArray.push({
                    feature: selFeature,
                    layerId: featureAtPixel.layer.get("id")
                });
            }
        }
        return pFeatureArray;
    },

    /**
     * Checks Drag-Modus
     * @param  {evt} evt Event-Object
     * @returns {void}
     */
    checkDragging: function (evt) {
        if (evt.dragging) {
            return;
        }
        this.checkTextPosition(evt);
    },

    /**
     * Checks the features at the mouse position
     * @param  {evt} evt PointerMoveEvent
     * @returns {void}
     */
    checkForFeaturesAtPixel: function (evt) {
        var featuresArray = [],
            featureArray = [],
            featuresAtPixel = this.getFeaturesAtPixel(evt, this.get("mouseHoverInfos"));

        _.each(featuresAtPixel, function (featureAtPixel) {
            featureArray = this.fillFeatureArray(featureAtPixel);
            featuresArray = _.union(featuresArray, featureArray);
        }, this);

        this.checkAction(featuresArray, evt);
    },

    /**
     * Checks which MouseHover action needs to happen depending on the features to show
     * @param  {Array} featuresArray Array of the features to show
     * @param {evt} evt Event-Object
     * @returns {void}
     */
    checkAction: function (featuresArray, evt) {
        var textArray;

        // no Features at MousePosition
        if (featuresArray.length === 0) {
            this.destroyPopup();
            return;
        }
        textArray = this.checkTextArray(featuresArray);

        // no text at MousePosition
        if (textArray.length === 0) {
            this.destroyPopup();
            return;
        }

        // New positioning
        this.setOverlayPosition(evt.coordinate);
        // changing the text
        if (!this.isTextEqual(textArray, this.get("textArray"))) {
            this.setTextArray(textArray);
            this.showPopup();
        }
    },

    /**
     * Checks if both arrays are identical
     * @param  {Array}  array1 new text
     * @param  {Array}  array2 old text
     * @return {Boolean} boolean True or False result of the check
     */
    isTextEqual: function (array1, array2) {
        var diff1 = _.difference(array1, array2),
            diff2 = _.difference(array2, array1);

        if (diff1.length > 0 || diff2.length > 0) {
            return false;
        }
        return true;
    },

    /**
     * Checks if the mouse position significantly changed from Config value
     * @param  {evt} evt MouseHover
     * @returns {void}
     */
    checkTextPosition: function (evt) {
        var lastPixel = this.get("textPosition"),
            newPixel = evt.pixel,
            minShift = this.get("minShift");

        if (!lastPixel || newPixel[0] < lastPixel[0] - minShift || newPixel[0] > lastPixel[0] + minShift || newPixel[1] < lastPixel[1] - minShift || newPixel[1] > lastPixel[1] + minShift) {
            this.setTextPosition(evt.pixel);
            this.checkForFeaturesAtPixel(evt);
        }
    },

    /**
     * Return the string for the popup
     * @param  {String | Array} mouseHoverField Content for popup
     * @param  {Object} featureProperties       Properties of features
     * @returns {String} value String of popup content
     */
    pickValue: function (mouseHoverField, featureProperties) {
        var value = "";

        if (mouseHoverField && _.isString(mouseHoverField)) {
            if (_.has(featureProperties, mouseHoverField)) {
                value = value + _.values(_.pick(featureProperties, mouseHoverField))[0];
            }
        }
        else if (mouseHoverField && _.isArray(mouseHoverField)) {
            _.each(mouseHoverField, function (element, index) {
                var pickedString = "",
                    cssClass = "";

                if (index === 0) {
                    cssClass = "title";
                }

                pickedString = featureProperties[element];
                if (!_.isString(pickedString)) {
                    console.error("Parameter \"mouseHoverField\" in config.json mit Wert \"" + element + "\" gibt keinen String zurück!");
                    return;
                }

                value = value + "<span class='" + cssClass + "'>" + pickedString + "</span></br>";
            });
        }
        return value;
    },

    /**
     * This function examines the pFeatureArray and extracts the text to show
     * @param  {Array} featureArray Array of features at MousePosition
     * @returns {Array} textArrayBroken Array containing text to show
     */
    checkTextArray: function (featureArray) {
        var mouseHoverInfos = this.get("mouseHoverInfos"),
            textArray = [],
            textArrayCheckedLength,
            textArrayBroken;

        // for each hovered over Feature...
        _.each(featureArray, function (element) {
            var featureProperties = element.feature.getProperties(),
                layerInfos = _.find(mouseHoverInfos, function (mouseHoverInfo) {
                    return mouseHoverInfo.id === element.layerId;
                });

            if (!_.isUndefined(layerInfos)) {
                textArray.push(this.pickValue(layerInfos.mouseHoverField, featureProperties));
            }
        }, this);
        textArrayCheckedLength = this.checkMaxFeaturesToShow(textArray);
        textArrayBroken = this.addBreak(textArrayCheckedLength);

        return textArrayBroken;
    },

    /**
     * Adapt the number of texts to show to "numFeaturesToShow" through _.sample
     * @param  {Array} textArray Array containing all texts
     * @return {Array} Array Array containing correct number of texts
     */
    checkMaxFeaturesToShow: function (textArray) {
        var maxNum = this.get("numFeaturesToShow"),
            textArrayCorrected = [];

        if (textArray.length > maxNum) {
            textArrayCorrected = _.sample(textArray, maxNum);
            textArrayCorrected.push("<span class='info'>" + this.get("infoText") + "</span>");
        }
        else {
            textArrayCorrected = textArray;
        }

        return textArrayCorrected;
    },

    /**
     * add html br between every element in values
     * @param  {Array} textArray Array without html br
     * @return {Array} textArrayBroken Array with html br
     */
    addBreak: function (textArray) {
        var textArrayBroken = [];

        _.each(textArray, function (value, index) {
            textArrayBroken.push(value);
            if (index !== textArray.length - 1) {
                textArrayBroken.push("<br>");
            }
        });

        return textArrayBroken;
    },

    /**
     * setter for minShift
     * @param  {Number} value minShift value
     * @return {void}
     */
    setMinShift: function (value) {
        this.set("minShift", value);
    },

    /**
     * setter for textPosition
     * @param  {String} value textPosition value
     * @return {void}
     */
    setTextPosition: function (value) {
        this.set("textPosition", value);
    },

    /**
     * setter for textArray
     * @param  {String} value textArray value
     * @return {void}
     */
    setTextArray: function (value) {
        this.set("textArray", value);
    },

    /**
     * setter for mouseHoverInfos
     * @param  {String | Array} value mouseHoverInfos value
     * @return {void}
     */
    setMouseHoverInfos: function (value) {
        this.set("mouseHoverInfos", value);
    }
});

export default MouseHoverPopupModel;

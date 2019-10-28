const AttributionsModel = Backbone.Model.extend(/** @lends AttributionsModel.prototype */{
    defaults: {
        isContentVisible: true,
        isVisibleInMap: false,
        isInitOpenDesktop: true,
        isInitOpenMobile: false,
        attributionList: [],
        isOverviewmap: Boolean(Radio.request("Parser", "getItemByAttributes", {id: "overviewmap"}))
    },

    /**
     * @class AttributionsModel
     * @extends Backbone.Model
     * @memberof Controls.Attributions
     * @constructs
     * @property {Boolean} isContentVisible=true Flag if attributions copy is visible
     * @property {Boolean} isVisibleInMap=false true when the control is displayed on the map
     * @property {Boolean} isInitOpenDesktop=true Flag if module is initially activated upon load in desktop environment
     * @property {Boolean} isInitOpenMobile=false Flag if module is initially activated upon load in mobile environment
     * @property {Array} attributionList=[] Array of attributions of all layers
     * @property {Boolean} isOverviewmap=? todo
     * @listens Core.ModelList#RadioTriggerModelListUpdateVisibleInMapList
     * @listens Controls.Attributions#RadioTriggerAttributionsCreateAttribution
     * @listens Controls.Attributions#RadioTriggerAttributionsRemoveAttribution
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @fires Core#RadioRequestUtilIsViewMobile
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     */
    initialize: function () {
        this.listenTo(Radio.channel("ModelList"), {
            "updateVisibleInMapList": this.updateAttributions
        });
        this.listenTo(Radio.channel("Attributions"), {
            "createAttribution": this.onCreateAttribution,
            "removeAttribution": this.onRemoveAttribution
        });

        this.updateAttributions();

        if (Radio.request("Util", "isViewMobile")) {
            this.setIsContentVisible(this.get("isInitOpenMobile"));
        }
        else {
            this.setIsContentVisible(this.get("isInitOpenDesktop"));
        }
    },
    /**
     * Event listener function for "createAttribution" event. Activates and opens attribution pane.
     * @param {String} name Attribution name
     * @param {String} text Attribution copy
     * @param {String} type Attribution type
     * @returns {void}
     */
    onCreateAttribution: function (name, text, type) {
        this.setIsVisibleInMap(true);
        this.setIsContentVisible(true);
        this.createAttribution(name, text, type);
    },
    /**
     * Event listener function for "removeAttribution" event.
     * @param {String} name Attribution name
     * @param {String} text Attribution copy
     * @param {String} type Attribution type
     * @returns {void}
     */
    onRemoveAttribution: function (name, text, type) {
        this.removeAttribution(name, text, type);
    },
    /**
     * Creates a single attribution and pushes it into attributions array.
     * Sets module visibility to true and renders it.
     * @param {String} name Attribution name
     * @param {String} text Attribution copy
     * @param {String} type Attribution type
     * @fires  Attributions#AttributionsRenderAttributions
     * @returns {void}
     */
    createAttribution: function (name, text, type) {
        this.get("attributionList").push({
            type: type,
            name: name,
            text: text
        });
        this.setIsVisibleInMap(true);
        this.setIsContentVisible(true);

        this.trigger("renderAttributions");
    },
    /**
     * Removes a single attribution from attributions array.
     * Renders module.
     * @param {String} name Attribution name
     * @param {String} text Attribution copy
     * @param {String} type Attribution type
     * @fires  Controls.Attributions#AttributionsRenderAttributions
     * @returns {void}
     */
    removeAttribution: function (name, text, type) {
        var filteredAttributions = this.get("attributionList").filter(function (attribution) {
            return attribution.name !== name && attribution.text !== text && attribution.type !== type;
        });

        this.setAttributionList(filteredAttributions);
        if (filteredAttributions.length === 0) {
            this.setIsContentVisible(false);
        }

        this.trigger("renderAttributions");
    },
    /**
     * Updates attributions functionality data. Usually called upon layer visibility change.
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @returns {void}
     */
    updateAttributions: function updateAttributions () {
        const modelList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true}),
            filteredModelList = this.filterModelsWithLayerAttribution(modelList),
            attributionsAvailable = filteredModelList.length > 0;

        this.removeAllLayerAttributions();
        this.generateAttributions(filteredModelList);

        this.setIsVisibleInMap(attributionsAvailable);

        // Upon change of visible layers, attribution pane must be opened.
        // This is a requested feature.
        if (attributionsAvailable) {
            this.setIsContentVisible(true);
        }

        this.trigger("renderAttributions");
    },

    /**
     * filters the models from the modellist that have the layerAttribution parameters.
     * Childlayers of GroupLayer are also considered.
     * @param {Array} modelList list with all models
     * @returns {Array} models with configured layer attributions
     */
    filterModelsWithLayerAttribution: function (modelList) {
        const childModelsWithLayerAttributions = [],
            filteredModelList = modelList.filter(function (model) {
                if (model.get("typ") === "GROUP") {
                    model.get("layerSource").forEach(childLayerSource => {
                        if (childLayerSource.has("layerAttribution") && childLayerSource.get("layerAttribution") !== "nicht vorhanden") {
                            childModelsWithLayerAttributions.push(childLayerSource);
                        }
                    });
                }
                return model.has("layerAttribution") && model.get("layerAttribution") !== "nicht vorhanden";
            });

        return filteredModelList.concat(childModelsWithLayerAttributions);
    },

    /**
     * Removes all attributions of type "layer" from attributions array.
     * Renders module.
     * @fires  Controls.Attributions#AttributionsRenderAttributions
     * @returns {void}
     */
    removeAllLayerAttributions: function () {
        var attributions = this.get("attributionList"),
            filteredAttributions = attributions.filter(function (attribution) {
                return attribution.type !== "layer";
            });

        this.setAttributionList(filteredAttributions);
        this.trigger("renderAttributions");
    },
    /**
     * Retrieves the current layers visible in the map from the ModelList,
     * filter them out without attributions and writes them in "modelList".
     * @param {Model} filteredModelList ModelList
     * @returns {void}
     */
    generateAttributions: function (filteredModelList) {
        _.each(filteredModelList, function (model) {
            var name = model.get("name"),
                text = "",
                type = "layer";

            if (_.isObject(model.get("layerAttribution"))) {
                text = model.get("layerAttribution").text;
            }
            else {
                text = model.get("layerAttribution");
            }
            this.createAttribution(name, text, type);
        }, this);
    },
    /**
     * Setter for "isContentVisible"
     * @param {Boolean} value flag if attributions pane is visible
     * @returns {void}
     */
    setIsContentVisible: function (value) {
        this.set("isContentVisible", value);
    },
    /**
     * Setter for "isContentVisible"
     * @param {Boolean} value flag if attributions functionality (pane + control button) is visible
     * @returns {void}
     */
    setIsVisibleInMap: function (value) {
        this.set("isVisibleInMap", value);
    },
    /**
     * Setter for "attributionList"
     * @param {Boolean} value flag
     * @returns {void}
     */
    setAttributionList: function (value) {
        this.set("attributionList", value);
    },
    /**
     * Setter for "isInitOpenDesktop"
     * @param {Boolean} value flag
     * @returns {void}
     */
    setIsInitOpenDesktop: function (value) {
        this.set("isInitOpenDesktop", value);
    },

    /**
     * Setter for "isInitOpenMobile"
     * @param {Boolean} value flag
     * @returns {void}
     */
    setIsInitOpenMobile: function (value) {
        this.set("isInitOpenMobile", value);
    },

    /**
     * Toggle for Attribute "isContentVisible"
     * @returns {void}
     */
    toggleIsContentVisible: function () {
        if (this.get("isContentVisible") === true) {
            this.setIsContentVisible(false);
        }
        else {
            this.setIsContentVisible(true);
        }
    }

});

export default AttributionsModel;

const TreeModel = Backbone.Model.extend({
    /**
    *
    */
    defaults: {
        inUse: false,
        minChars: 3,
        layers: [],
        nodes: []
    },

    initialize: function (config) {
        if (config.minChars) {
            this.set("minChars", config.minChars);
        }

        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });
        this.listenTo(Radio.channel("ObliqueMap"), {
            "isActivated": this.controlListeningToSearchbar
        });

        if (_.isUndefined(Radio.request("ParametricURL", "getInitString")) === false) {
            // Führe die initiale Suche durch, da ein Suchparameter übergeben wurde.
            this.search(Radio.request("ParametricURL", "getInitString"));
        }

    },

    /**
     * Deactivates the topic search if the obliqueMap is activated.
     * Enables topic search when obliqueMap is disabled.
     * @param {boolean} value - includes whether the obliqueMap is active
     * @return {void}
     */
    controlListeningToSearchbar: function (value) {
        if (value) {
            this.stopListening(Radio.channel("Searchbar"), "search");
        }
        else {
            this.listenTo(Radio.channel("Searchbar"), {
                "search": this.search
            });
        }
    },

    search: function (searchString) {
        var searchStringRegExp;

        if (this.get("layers").length === 0) {
            this.getLayerForSearch();
        }
        if (this.get("inUse") === false && searchString.length >= this.get("minChars")) {
            this.set("inUse", true);
            searchStringRegExp = new RegExp(searchString.replace(/ /g, ""), "i"); // Erst join dann als regulärer Ausdruck
            this.searchInLayers(searchStringRegExp);
            this.searchInNodes(searchStringRegExp);
            Radio.trigger("Searchbar", "createRecommendedList", "tree");
            this.set("inUse", false);
        }
    },
    /**
     * @description Führt die Suche in der Nodesvariablen aus.
     * @param {string} searchStringRegExp - Suchstring als RegExp
     * @returns {void}
     */
    searchInNodes: function (searchStringRegExp) {
        var nodes = _.uniq(this.get("nodes"), function (node) {
            return node.name;
        });

        _.each(nodes, function (node) {
            var nodeName = node.name.replace(/ /g, "");

            if (nodeName.search(searchStringRegExp) !== -1) {
                Radio.trigger("Searchbar", "pushHits", "hitList", node);
            }
        }, this);
    },
    /**
     * Führt die Suche in der Layervariablen mit Suchstring aus und findet im Layernamen und im dataset name.
     * @param {string} searchStringRegExp - Suchstring als RegExp.
     * @returns {void}
     */
    searchInLayers: function (searchStringRegExp) {
        _.each(this.get("layers"), function (layer) {
            var searchString = "";

            if (!_.isUndefined(layer.metaName)) {
                searchString = layer.metaName.replace(/ /g, "");
            }
            else if (!_.isUndefined(layer.name)) {
                searchString = layer.name.replace(/ /g, "");
            }

            if (searchString.search(searchStringRegExp) !== -1) {
                Radio.trigger("Searchbar", "pushHits", "hitList", layer);
            }
        }, this);
    },

    getLayerForSearch: function () {
        // lightModels aus der itemList im Parser
        var layerModels = Radio.request("Parser", "getItemsByAttributes", {type: "layer"});

        this.set("layers", []);
        // Damit jeder Layer nur einmal in der Suche auftaucht, auch wenn er in mehreren Kategorien enthalten ist
        // und weiterhin mehrmals, wenn er mehrmals existiert mit je unterschiedlichen Datensätzen
        layerModels = _.uniq(layerModels, function (model) {
            return model.name + model.id;
        });
        _.each(layerModels, function (model) {
            this.get("layers").push({
                name: model.name,
                metaName: _.has(model, "datasets") && _.has(model.datasets[0], "md_name") ? model.name + " (" + model.datasets[0].md_name + ")" : model.name,
                type: "Thema",
                glyphicon: "glyphicon-list",
                id: model.id
            });
        }, this);
    }
});

export default TreeModel;

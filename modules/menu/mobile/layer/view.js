import Template from "text-loader!./template.html";
import SelectionTemplate from "text-loader!./templateSelection.html";
import SettingsTemplate from "text-loader!./templateSettings.html";

const LayerView = Backbone.View.extend(/** @lends LayerView.prototype */{
    events: {
        "click .layer-item": "toggleIsSelected",
        "click .layer-info-item > .glyphicon-info-sign": "showLayerInformation",
        "click .selected-layer-item > .glyphicon-remove": "removeFromSelection",
        "click .selected-layer-item > div": "toggleIsVisibleInMap",
        "click .layer-info-item > .glyphicon-cog": "toggleIsSettingVisible",
        "click .layer-sort-item > .glyphicon-triangle-top": "moveModelUp",
        "click .layer-sort-item > .glyphicon-triangle-bottom": "moveModelDown",
        "change select": "setTransparency",
        "click .glyphicon-tint": "openStyleWMS"
    },

    /**
     * @class LayerView
     * @extends Backbone.View
     * @memberOf Menu.Mobile.Layer
     * @constructs
     * @listens Layer#changeIsSelected
     * @listens Layer#changeIsSettingVisible
     * @listens Layer#changeIsVisibleInTree
     * @listens Layer#changeIsOutOfRange
     * @fires Map#RadioRequestMapGetMapMode
     * @fires BreadCrumb#RadioRequestBreadCrumbGetLastItem
     * @fires ModelList#RadioTriggerModelListSetIsSelectedOnParent
     * @fires StyleWMS#RadioTriggerStyleWMSOpenStyleWMS
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isSelected change:isVisibleInMap": this.render,
            "change:isSettingVisible": this.renderSetting,
            "change:isVisibleInTree": this.removeIfNotVisible,
            "change:isOutOfRange": this.toggleColor
        });

        this.toggleByMapMode(Radio.request("Map", "getMapMode"));
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },
    tagName: "li",
    className: "list-group-item",
    template: _.template(Template),
    templateSelected: _.template(SelectionTemplate),
    templateSetting: _.template(SettingsTemplate),

    /**
     * If the layer is outside its scale range,
     * if the view is grayed out and not clickable
     * @param {Backbone.Model} model - todo
     * @param {boolean} value - todo
     * @returns {void}
     */
    toggleColor: function (model, value) {
        if (model.has("minScale") === true) {
            if (value === true) {
                this.$el.addClass("disabled");
                this.$el.find("*").css("pointer-events", "none");
            }
            else {
                this.$el.removeClass("disabled");
                this.$el.find("*").css("pointer-events", "auto");
            }
        }
    },

    /**
     * todo
     * @returns {Backbone.View} todo
     */
    render: function () {
        var attr = this.model.toJSON();

        if (Radio.request("BreadCrumb", "getLastItem").get("id") === "SelectedLayer") {
            this.$el.html(this.templateSelected(attr));
            if (this.model.get("isSettingVisible") === true) {
                this.renderSetting();
            }
        }
        else {
            this.$el.html(this.template(attr));
        }

        return this;
    },

    /**
     * Draws the settings (transparency, metainfo, ...)
     * @returns {void}
     */
    renderSetting: function () {
        var attr = this.model.toJSON();

        // Animation Zahnrad
        this.$(".glyphicon-cog").toggleClass("rotate rotate-back");
        // Slide-Animation templateSetting
        if (this.model.get("isSettingVisible") === false) {
            this.$el.find(".item-settings").slideUp("slow", function () {
                this.remove();
            });
        }
        else {
            this.$el.append(this.templateSetting(attr));
            this.$el.find(".item-settings").hide();
            this.$el.find(".item-settings").slideDown();
        }
    },

    /**
     * todo
     * @fires ModelList#RadioTriggerModelListSetIsSelectedOnParent
     * @returns {void}
     */
    toggleIsSelected: function () {
        this.model.toggleIsSelected();
        Radio.trigger("ModelList", "setIsSelectedOnParent", this.model);
        this.render();
    },

    /**
     * todo
     * @returns {void}
     */
    removeFromSelection: function () {
        this.model.setIsSettingVisible(false);
        this.model.setIsSelected(false);
        this.$el.remove();
    },

    /**
     * todo
     * @returns {void}
     */
    toggleIsVisibleInMap: function () {
        this.model.toggleIsVisibleInMap();
    },

    /**
     * todo
     * @returns {void}
     */
    showLayerInformation: function () {
        this.model.showLayerInformation();
        // Navigation wird geschlossen
        this.$("div.collapse.navbar-collapse").removeClass("in");
    },

    /**
     * todo
     * @returns {void}
     */
    toggleIsSettingVisible: function () {
        this.model.toggleIsSettingVisible();
    },

    /**
     * todo
     * @param {*} evt - todo
     * @returns {void}
     */
    setTransparency: function (evt) {
        this.model.setTransparency(parseInt(evt.target.value, 10));
    },

    /**
     * todo
     * @returns {void}
     */
    moveModelDown: function () {
        this.model.moveDown();
    },

    /**
     * todo
     * @returns {void}
     */
    moveModelUp: function () {
        this.model.moveUp();
    },

    /**
     * todo
     * @returns {void}
     */
    removeIfNotVisible: function () {
        if (!this.model.get("isVisibleInTree")) {
            this.remove();
        }
    },

    /**
     * todo
     * @fires StyleWMS#RadioTriggerStyleWMSOpenStyleWMS
     * @returns {void}
     */
    openStyleWMS: function () {
        Radio.trigger("StyleWMS", "openStyleWMS", this.model);
        this.$(".navbar-collapse").removeClass("in");
    },

    /**
     * adds only layers to the tree that support the current mode of the map
     * e.g. 2D, 3D
     * @param {String} mapMode - current mode from map
     * @returns {void}
     */
    toggleByMapMode: function (mapMode) {
        if (this.model.get("supported").indexOf(mapMode) >= 0) {
            this.$el.show();
        }
        else {
            this.$el.hide();
        }
    }

});

export default LayerView;

import BackForwardTemplate from "text-loader!./template.html";
import BackForwardModel from "./model";
/**
 * @member BackForwardTemplate
 * @description Template used for backward and forward functionality
 * @memberof Controls.BackForward
 */
const BackForwardView = Backbone.View.extend(/** @lends BackForwardView.prototype */{
    events: {
        "click .forward": function () {
            this.setNextLastView("for");
        },
        "click .backward": function () {
            this.setNextLastView("back");
        }
    },
    /**
     * @class BackForwardView
     * @memberof Controls.BackForward
     * @extends Backbone.View
     * @constructs
     * @fires Map#RadioTriggerMapRegisterListenerMovenend
     * @fires MapView#RadioRequestMapViewGetOptions
     * @fires MapView#RadioRequestMapViewGetCenter
     * @fires MapView#RadioTriggerMapViewSetScale
     * @fires MapView#RadioTriggerMapViewSetCenter
     */
    initialize: function () {
        var channel = Radio.channel("BackForwardView"),
            template;

        this.model = new BackForwardModel();
        template = this.modifyTemplate(BackForwardTemplate);
        this.template = _.template(template);

        channel.reply({
            "getView": this
        }, this);

        Radio.trigger("Map", "registerListener", "moveend", this.updatePermalink.bind(this));
        this.render();
    },
    id: "backforward",

    /**
     * render the control backforward
     * @return {Backbone.View} BackForwardView
     */
    render: function () {
        this.$el.html(this.template());
        return this;
    },

    /**
     * modifies the template with the configured backforward glyphicons
     * @param {Backbone.Template} tpl BackForwardTemplate
     * @return {Backbone.Template} modified template
     */
    modifyTemplate: function (tpl) {
        var result,
            configData = this.model.get("config"),
            forwardGlyph = _.isUndefined(configData) === false ? configData.attr.glyphiconFor : configData,
            backwardGlyph = _.isUndefined(configData) === false ? configData.attr.glyphiconBack : configData,
            buttons,
            re;

        if (!forwardGlyph && !backwardGlyph) {
            result = tpl;
            return result;
        }
        else if (!forwardGlyph && Boolean(backwardGlyph)) {
            buttons = {
                "glyphicon-step-backward": backwardGlyph
            };
        }
        else if (Boolean(forwardGlyph) && !backwardGlyph) {
            buttons = {
                "glyphicon-step-forward": forwardGlyph
            };
        }
        else if (Boolean(forwardGlyph) && Boolean(backwardGlyph)) {
            buttons = {
                "glyphicon-step-forward": forwardGlyph,
                "glyphicon-step-backward": backwardGlyph
            };
        }

        re = new RegExp(Object.keys(buttons).join("|"), "gi");
        result = tpl.replace(re, function (matched) {
            return buttons[matched];
        });

        return result;
    },
    /**
     * Updates the permanent link in the map when backward or forward button is clicked.
     * @fires MapView#RadioRequestMapViewGetOptions
     * @fires MapView#RadioRequestMapViewGetCenter
     * @returns {void}
     */
    updatePermalink: function () {
        var forButton = document.getElementsByClassName("forward glyphicon")[0],
            backButton = document.getElementsByClassName("backward glyphicon")[0],
            centerScales = this.model.get("CenterScales"),
            currentPos = this.model.get("currentPos"),
            that = this,
            scale,
            center;

        if (centerScales.length === 0) {
            $(backButton).css("pointer-events", "none");
            $(forButton).css("pointer-events", "none");

            setTimeout(function () {
                scale = Radio.request("MapView", "getOptions").scale;
                center = Radio.request("MapView", "getCenter");
                centerScales.push([center, scale]);
            }, 100);
            this.model.setCenterScales(centerScales);
        }
        else if (centerScales.length > 0 && this.model.get("wentFor") === false) {
            $(backButton).css("pointer-events", "auto");
            $(forButton).css("pointer-events", "none");

            setTimeout(function () {
                if (currentPos < centerScales.length - 1) {
                    centerScales.splice(currentPos + 1);
                    that.model.setCurrentPos(currentPos);
                }
                else if (centerScales.length === 10) {
                    centerScales.shift(centerScales[0]);
                    that.model.setCurrentPos(currentPos - 1);
                }
                scale = Radio.request("MapView", "getOptions").scale;
                center = Radio.request("MapView", "getCenter");
                centerScales.push([center, scale]);
                that.model.setCurrentPos(that.model.get("currentPos") + 1);
            }, 100);
            this.model.setCenterScales(centerScales);
        }
        this.model.setWentFor(false);
    },

    /**
     * Setter for next and last view
     * @param {String} direction - indicates if backward or forward button was clicked
     * @fires MapView#RadioTriggerMapViewSetScale
     * @fires MapView#RadioTriggerMapViewSetCenter
     * @returns {void}
     */
    setNextLastView: function (direction) {
        var forButton = document.getElementsByClassName("forward glyphicon")[0],
            backButton = document.getElementsByClassName("backward glyphicon")[0],
            centerScales = this.model.get("CenterScales");

        this.model.setWentFor(true);

        if (direction === "for") {
            $(backButton).css("pointer-events", "auto");
            this.model.setCurrentPos(this.model.get("currentPos") + 1);
            Radio.trigger("MapView", "setScale", centerScales[this.model.get("currentPos")][1]);
            Radio.trigger("MapView", "setCenter", centerScales[this.model.get("currentPos")][0]);
            if (this.model.get("currentPos") === centerScales.length - 1) {
                $(forButton).css("pointer-events", "none");
            }
        }
        else if (direction === "back") {
            $(forButton).css("pointer-events", "auto");
            this.model.setCurrentPos(this.model.get("currentPos") - 1);
            Radio.trigger("MapView", "setScale", centerScales[this.model.get("currentPos")][1]);
            Radio.trigger("MapView", "setCenter", centerScales[this.model.get("currentPos")][0]);
            if (this.model.get("currentPos") === 0) {
                $(backButton).css("pointer-events", "none");
            }
        }
    }
});

export default BackForwardView;

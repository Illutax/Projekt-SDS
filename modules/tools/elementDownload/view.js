import ElementDownloadWin from "text-loader!./template.html";
import ElementDownloadModel from "./model";
import {Circle, Polygon} from "ol/geom.js";

const ElementDownloadView = Backbone.View.extend({
    events: {
        "click button.back": "back",
        "change .file-endings": "prepareData"
    },
    initialize: function () {
        var channel = Radio.channel("elementdownload");

        this.model = new ElementDownloadModel();
        this.template = _.template(ElementDownloadWin);

        this.listenTo(this.model, {
            "change:isActive": this.render
        });

        channel.on({
            "start": this.start
        }, this);
    },
    /**
     * Startet das Download modul
     * @param  {ol.feature} features die Features die heruntergeladen werden sollen
     * @returns {void}
     */
    start: function (features) {
        if (features.data.length === 0) {
            Radio.trigger("Alert", "alert", "Bitte verwenden sie vorher eine der Optionen des Tools!");
            return;
        }
        _.each(features.data, function (feature) {
            if (feature.getGeometry() instanceof Circle) {
            // creates a regular polygon from a circle with 32(default) sides
                feature.setGeometry(Polygon.fromCircle(feature.getGeometry()));
            }
        });

        this.model.setData(features.data);
        this.model.setFormats(features.formats);
        this.model.setCaller(features.caller);
        this.model.set("id", "download");
        this.model.set("name", "Download");
        this.model.set("glyphicon", "glyphicon-plus");
        // $(".win-heading .title").text("Download");
        Radio.request("ModelList", "getModelByAttributes", {id: "element"}).set("isActive", false);
        this.model.set("isActive", true);
    },
    /**
     * Ruft das Tool auf, das den Download gestartet hat
     * @returns {void}
     */
    back: function () {
        this.model.set("isActive", false);
        Radio.request("ModelList", "getModelByAttributes", {id: "element"}).set("isActive", true);
    },
    /**
     *
     * @return {[type]} [description]
     */
    prepareDownloadButton: function () {
        this.model.setSelectedFormat();
        if (this.model.prepareData() !== "invalid Format") {

            if (this.model.isInternetExplorer()) {
                this.model.prepareDownloadButtonIE();
            }
            else {
                this.model.prepareDownloadButtonNonIE();
            }
        }
    },
    /**
     * startet den Download, wenn auf den Button geklickt wird
     * @returns {void}
     */
    triggerDownload: function () {
        this.model.download();
    },
    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.appendOptions();
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }
        return this;
    },
    /**
     * Hängt die wählbaren Dateiformate als Option an das Formate-Dropdown
     * @returns {void}
     */
    appendOptions: function () {
        var options = this.model.getFormats(),
            that = this;

        _.each(options, function (option) {
            that.$(".file-endings").append($("<option>", {
                value: option,
                text: option
            }));
        });
        if (options.length === 1) {
            this.$(".file-endings").val(options[0]);
            this.prepareDownloadButton();
        }
    }
});

export default ElementDownloadView;

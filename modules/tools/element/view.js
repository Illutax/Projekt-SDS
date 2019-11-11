import ElementTemplate from "text-loader!./template.html";
import ElementDownloadView from "../elementDownload/view";

const PlaceToolView = Backbone.View.extend({
    events: {
        "change .option": "setItems",
        "change .interaction": "setDrawType",
        "keyup .text input": "setText",
        "change .font-size select": "setFontSize",
        "change .font select": "setFont",
        "change .radius select": "setRadius",
        "change .broad select": "setBroadSize",
        "change .width select": "setWidthSize",
        "change .stroke-width input": "setStrokeWidth",
        "change .opacity select": "setOpacity",
        "change .color select": "setColor",
        "change .rotation select": "setRotation",
        "change select": "createDrawInteraction",
        "keyup input": "createDrawInteraction",
        "click .delete": "deleteFeatures",
        "click .modify.once": "createModifyInteraction", // relevant für Geometrie ziehen
        "click .modify": "toggleInteraction", // same
        "click .translate.once": "createTranslateInteraction",
        "click .translate": "toggleInteraction",
        "click .trash.once": "createSelectInteraction",
        "click .trash": "toggleInteraction",
        "click .select.once": "createSelectInteraction",
        "click .select": "toggleInteraction",
        "click .rotate.once": "createRotateInteraction",
        "click .rotate": "toggleInteraction",
        "click .btn-primary": "enableAllElements",
        "click .downloadDrawing": "downloadFeatures",
        "click .elementpanel": "setSourceClicked",
        "click .schildpanel": "setSourceClicked",
        "click .wegpanel": "setWegClicked",
        "click .freehand": "setFreehand",
        "click. option": "setItems"
    },
    initialize: function () {
        this.template = _.template(ElementTemplate);

        new ElementDownloadView();

        this.listenTo(this.model, {
            "change:isActive": this.render
        });
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },
    render: function (model, value) {
        if (value) {

            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
            this.renderForm();
            this.renderGlyphicon();
        }
        else {
            $("#map").removeClass("no-cursor");
            $("#map").removeClass("cursor-crosshair");
            $("#cursorGlyph").remove();
            $("#map").off("mousemove");
            this.undelegateEvents();
        }
        return this;
    },

    renderForm: function () {
        var element = this.$el.find(".interaction")[0];
        switch (element.options[element.selectedIndex].text) {
            case "Element setzen": {
                this.$el.find(".elementpanel").toggle(true);
                this.$el.find(".wegpanel").toggle(false);
                this.$el.find(".schildpanel").toggle(false);
                this.$el.find(".freehand").toggle(false);
                this.$el.find(".stroke-width").toggle(false);
                this.$el.find(".modify.once").toggle(false);
                this.$el.find(".translate.once").toggle(true);
                break;
            }
            case "Weg setzen": {
                this.$el.find(".elementpanel").toggle(false);
                this.$el.find(".wegpanel").toggle(true);
                this.$el.find(".schildpanel").toggle(false);
                this.$el.find(".freehand").toggle(true);
                this.$el.find(".stroke-width").toggle(true);
                this.$el.find(".translate.once").toggle(true);
                this.$el.find(".modify.once").toggle(true);
                break;
            }
            case "Schild setzen": {
                this.$el.find(".elementpanel").toggle(false);
                this.$el.find(".wegpanel").toggle(false);
                this.$el.find(".schildpanel").toggle(true);
                this.$el.find(".freehand").toggle(false);
                this.$el.find(".stroke-width").toggle(false);
                this.$el.find(".translate.once").toggle(true);
                this.$el.find(".modify.once").toggle(false);
                break;
            }
            default: {
                this.$el.find(".elementpanel").toggle(true);
                this.$el.find(".wegpanel").toggle(true);
                this.$el.find(".freehand").toggle(false);
                this.$el.find(".broad").toggle(false);
                this.$el.find(".width").toggle(false);
                this.$el.find(".color").toggle(false);
                this.$el.find(".thickness").toggle(false);
                this.$el.find(".opacity").toggle(false);
                this.$el.find(".rotation").toggle(false);
                this.$el.find(".stroke-width").toggle(false);
                break;
            }
        }
        this.$el.find(".downloadDrawing").toggle(true);
    },

    renderGlyphicon: function () {
        $("#map").after("<span id='cursorGlyph' class='glyphicon glyphicon-pencil'></span>");

        $("#map").mousemove(function (e) {
            $("#cursorGlyph").css("left", e.offsetX + 5);
            $("#cursorGlyph").css("top", e.offsetY + 50 - 15); // absolute offset plus height of menubar (50)
        });
    },

    setDrawType: function (evt) {
        var element = evt.target,
            selectedElement = element.options[element.selectedIndex];
        this.model.setDrawType(selectedElement.value, selectedElement.text, selectedElement.dataset.freehand);
        this.renderForm();
    },

    createDrawInteraction: function () {
        this.model.createDrawInteraction(this.model.get("drawType"), this.model.get("layer"));
    },

    /**
     * ++
     * Funktion für Optionen
     */
    setItems: function(evt){
        this.model.setItems(evt.target.value);
    },
    /**
     * removes the class 'once' from target and
     * calls createTranslateInteraction in the model
     * @param {MouseEvent} evt -
     * @returns {void}
     */
    createTranslateInteraction: function (evt) {
        $(evt.target).removeClass("once");
        this.model.createTranslateInteraction(this.model.get("drawType"), this.model.get("layer"));
    },

    /**
     * removes the class 'once' from target and
     * calls createTranslateInteraction in the model
     * @param {MouseEvent} evt -
     * @returns {void}
     */
    createModifyInteraction: function (evt) {
        $(evt.target).removeClass("once");
        this.model.createModifyInteraction(this.model.get("drawType"), this.model.get("layer"));
    },

    /**
     * removes the class 'once' from target and
     * calls createSelectInteraction in the model
     * @param {MouseEvent} evt -
     * @returns {void}
     */
    createSelectInteraction: function (evt) {
        $(evt.target).removeClass("once");
        this.model.createSelectInteraction(this.model.get("layer"));
    },

    /*
     * lösche die Klasse 'once' vom target
     * rufe createRotateInteraction im model auf
     */
    createRotateInteraction: function (evt) {
        $(evt.target).removeClass("once");
        this.model.createRotateInteraction(this.model.get("layer"));
    },

    /**
     * removes the class 'once' from target and
     * calls createSelectInteraction in the model
     * @param {MouseEvent} evt -
     * @returns {void}
     */
    createRealselectInteraction: function (evt) {
        $(evt.target).removeClass("once");
        this.model.createRealselectInteraction(this.model.get("layer"));
    },

    toggleInteraction: function (evt) {
        $(evt.target).toggleClass("btn-primary");
        if ($(evt.target).hasClass("btn-primary") === true) {
            this.disableAllElements();
            $(evt.target).prop("disabled", false);
        }
        this.model.toggleInteraction($(evt.target));
    },

    enableAllElements: function () {
        this.$el.find("button:disabled, select:disabled").each(function () {
            $(this).prop("disabled", false);
        });
    },

    disableAllElements: function () {
        this.$el.find("button, select").each(function () {
            $(this).prop("disabled", true);
        });
    },

    deleteFeatures: function () {
        var r = confirm("Wollen Sie wirklich alle Elemente löschen?");
        if (r) {
            this.model.deleteFeatures();
        }
    },

    downloadFeatures: function () {
        this.model.downloadFeatures();
    },

    setFont: function (evt) {
        this.model.setFont(evt.target.value);
    },

    setText: function (evt) {
        this.model.setText(evt.target.value);
    },

    setFontSize: function (evt) {
        this.model.setFontSize(evt.target.value);
    },

    setBroadSize: function (evt) {
        this.model.setBroadSize(evt.target.value);
    },

    setWidthSize: function (evt) {
        this.model.setWidthSize(evt.target.value);
    },

    setColor: function (evt) {
        var colors = evt.target.value.split(","),
            newColor = [];

        colors.forEach(function (color) {
            newColor.push(parseInt(color, 10));
        });
        newColor.push(this.model.get("opacity"));
        this.model.setColor(newColor);
    },

    setRadius: function (evt) {
        this.model.setRadius(evt.target.value);
    },

    setStrokeWidth: function (evt) {
        this.model.setStrokeWidth(Number(evt.target.value));
        this.model.createDrawInteraction(this.model.get("drawType"), this.model.get("layer"));
    },

    setOpacity: function (evt) {
        var newColor = this.model.get("color");

        newColor[3] = parseFloat(evt.target.value);
        this.model.setColor(newColor);
        this.model.setOpacity(parseFloat(evt.target.value));
    },

    setRotation: function (evt) {
        this.model.setRotation(evt.target.value);
    },

    setSourceClicked: function (evt) {
        this.model.setButtonClicked(evt.target.value);
        this.model.createDrawInteraction(this.model.get("drawType"), this.model.get("layer"));
    },

    setWegClicked: function (evt) {
        this.model.setWegSelected(evt.target.dataset.mode, evt.target.dataset.freehand, evt.target.value);

        var s;
        switch (evt.target.value) {
            case "bicycle":
                s = 10;
                break;
            case "spurlinie":
                s = 3;
                break;
            case "street2":
                s = 30;
                break;
            case "green":
                s = 10;
                break;
            case "grenze":
                s = 2;
                break;
            default:
                s = 20;
        }
        this.model.setStrokeWidth(s);

        //set inputs slider/text to value
        document.getElementById('stroke-width-text').value = s;
        document.getElementById('stroke-width-slider').value = s;

        this.model.createDrawInteraction(this.model.get("drawType"), this.model.get("layer"));
        this.renderForm();
    },
    /*
     * neue drawInteraction für jeweiligen freehand-state
     */
    setFreehand: function (evt) {
        this.model.setFreehand(evt.target.value);
        this.model.createDrawInteraction(this.model.get("drawType"), this.model.get("layer"));
    }
});

export default PlaceToolView;

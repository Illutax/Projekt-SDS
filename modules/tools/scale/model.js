import Tool from "../../core/modelList/tool/model";

const ScaleModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        glyphicon: "glyphicon-resize-full",
        renderToWindow: true,
        scales: "",
        currentScale: ""
    }),
    // wird aufgerufen wenn das Model erstellt wird
    initialize: function () {
        console.log("Init vom model");
        this.superInitialize();
        this.listenTo(Radio.channel("MapView"), {
            // Wird ausgelöst wenn sich Zoomlevel, Center
            // oder Resolution der Karte ändert
            "changedOptions": function (value) {
                console.log(value.scale);
                this.setCurrentScale(value.scale);
            }
        });
        this.listenTo(this, {
            "change:currentScale": function () {
                // Sendet den neuen Maßstab an die MapView
                // Dadurch zoomt die Karte in diesen Maßstab
                console.log("currentScale changed", this.get("currentScale"));
                Radio.trigger("MapView", "setScale", this.get("currentScale"));
            }
        });
        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
                console.log("isReady");
                // initial alle Scales der Karte abfragen
                this.setScales(Radio.request("MapView", "getScales"));
                this.setCurrentScale(Radio.request("MapView", "getOptions").scale);
            }
        });
    },
    
    // Setter für alle verfügbaren Maßstäbe
    setScales: function (value) {
        this.set("scales", value);
    },
    // Setter für den aktuellen Maßstab
    setCurrentScale: function (value) {
        this.set("currentScale", value);
    }
});

export default ScaleModel;

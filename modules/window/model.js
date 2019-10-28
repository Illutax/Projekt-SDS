const Window = Backbone.Model.extend({
    defaults: {
        isCollapsed: false,
        isVisible: false,
        maxPosLeft: "",
        maxPosTop: "60px"
    },
    initialize: function () {
        var channel = Radio.channel("Window");

        this.listenTo(channel, {
            "setIsVisible": this.setIsVisible,
            "showTool": this.setParams
        }, this);

        channel.on({
            "collapseWin": this.collapseWindow
        }, this);
    },
    collapseWindow: function () {
        this.setCollapse(true);
    },
    setCollapse: function (value) {
        this.set("isCollapsed", value);
    },
    setIsVisible: function (value) {
        this.set("isVisible", value);
    },
    setParams: function (value) {
        this.set("title", value.get("name"));
        this.set("icon", value.get("glyphicon"));
        this.set("winType", value.get("id"));
    }
});

export default Window;

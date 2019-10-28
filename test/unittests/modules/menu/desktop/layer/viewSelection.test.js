import LayerView from "@modules/menu/desktop/layer/viewSelection.js";
import {expect} from "chai";

describe("menu/desktop/layer/viewSelection", function () {
    var fakeModel,
        CustomLayerView;

    before(function () {

        fakeModel = {
            getIsOutOfRange: function () {
                return 42;
            },

            isSettingVisible: false,
            isStyleable: false,
            showSettings: true,
            supported: ["2D"],
            isRemovable: false,

            setIsSettingVisible: function (value) {
                this.isSettingVisible = value;
            },

            get: function (value) {
                switch (value) {
                    case "isSettingVisible":
                        return this.isSettingVisible;
                    case "isStyleable":
                        return this.isStyleable;
                    case "showSettings":
                        return this.showSettings;
                    case "supported":
                        return this.supported;
                    case "isRemovable":
                        return this.isRemovable;
                    default:
                        return null;
                }
            },

            setIsStyleable: function (value) {
                this.isStyleable = value;
            },

            has: function () {
                return true;
            },

            toJSON: function () {
                return {
                    styleable: this.isStyleable,
                    supported: this.supported,
                    isSettingVisible: this.isSettingVisible,
                    showSettings: this.showSettings,
                    transparency: 42,
                    isVisibleInMap: true,
                    isRemovable: false
                };
            }
        };

        CustomLayerView = LayerView.extend({
            doGetSelectedLayerObject: function () {
                return $("<div></div>");
            }
        });
    });

    describe("The style-icon", function () {

        it("should be visible for stylable layers", function () {
            var layerView;

            fakeModel.setIsStyleable(true);
            fakeModel.setIsSettingVisible(true);
            layerView = new CustomLayerView({model: fakeModel});

            expect(layerView.$el.find(".pull-right").find(".glyphicon-tint").length).to.be.equal(1);

            layerView.rerender();

            expect(layerView.$el.find(".pull-right").find(".glyphicon-tint").length).to.be.equal(1);
        });

        it("should be hidden for other not styleable layers", function () {
            var layerView;

            fakeModel.setIsStyleable(false);
            fakeModel.setIsSettingVisible(true);
            layerView = new CustomLayerView({model: fakeModel});

            expect(layerView.$el.find(".glyphicon-tint").length).to.be.equal(0);

            layerView.rerender();

            expect(layerView.$el.find(".glyphicon-tint").length).to.be.equal(0);
        });
    });
});

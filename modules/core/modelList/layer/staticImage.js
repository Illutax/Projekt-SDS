import Layer from "./model";
import ImageLayer from "ol/layer/Image.js";
import Projection from "ol/proj/Projection.js";
import StaticImageSource from "ol/source/ImageStatic.js";

const StaticImageLayer = Layer.extend({

    defaults: _.extend({}, Layer.prototype.defaults, {
        supported: ["2D", "3D"]
    }),

    /**
     * Creates layer source for staticImage
     * @return {void}
     */
    createLayerSource: function () {
        var extent = this.get("extent"),
            projection = new Projection({
                code: "static-image",
                units: "pixels",
                extent: extent
            });

        this.setLayerSource(new StaticImageSource({
            url: this.get("url"),
            projection: projection,
            imageExtent: extent
        }));
    },

    /**
     * Creates Layer for staticImage
     * @return {void}
     */
    createLayer: function () {
        this.setLayer(new ImageLayer({
            source: this.get("layerSource"),
            name: this.get("name"),
            typ: "StaticImage",
            legendURL: this.get("legendURL"),
            transparency: this.get("transparency")
        }));
    },
    createLegendURL: function () {
        // this is a comment
    }
});

export default StaticImageLayer;

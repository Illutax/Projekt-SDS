import ScaleTemplate from "text-loader!./template.html";

const ScaleView = Backbone.View.extend({
  events: {
    // DOM Change Event führt this.setCurrentScale aus
    "change .form-control": "setCurrentScale"
  },
  // wird aufgerufen wenn die View erstellt wird
  initialize: function () {
    console.log("initialize");
    this.listenTo(this.model, {
      "change:isActive": this.render
    });
    
    this.render(this.model, this.model.get("isActive"));

    this.listenTo(this.model, {
      // Verändert sich der Maßstab der Karte und damit der currentScale
      // des Models, wird die View neu gezeichnet.
      "change:currentScale": this.render
    });
  },
  // underscore template Funktion
  template: _.template(ScaleTemplate),
  render: function (model, value) {
    console.log("render", value);
    // alle Model Attribute (currentScale, scales)
    var attr = model.toJSON();
    console.log(attr);

    if (value) {
      this.$el.html(this.template(attr));
      document.getElementsByClassName("orientationButtons")[0].appendChild(
        this.el
      );
    }

    return this;
  },
  setCurrentScale: function (evt) {
    console.log("Setting currentScale", parseInt(evt.target.value, 10));
    console.log(this.model);
    this.model.setCurrentScale(parseInt(evt.target.value, 10));
  }
});

export default ScaleView;

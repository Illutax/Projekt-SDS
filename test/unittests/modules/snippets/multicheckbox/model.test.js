import Model from "@modules/snippets/multicheckbox/model.js";
import {expect} from "chai";

describe("Multicheckbox Model", function () {
    var model;

    before(function () {
        model = new Model({
            values: ["Freizeit", "Freiraum und Grün"]
        });
    });


    describe("updateSelectedValues", function () {
        var initialValue, updatedValue;

        before(function () {
            initialValue = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Freizeit";
            })[0].get("isSelected");
        });

        it("should update Value", function () {

            model.updateSelectedValues("Freizeit", true);
            updatedValue = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Freizeit";
            })[0].get("isSelected");

            expect(initialValue).to.be.false;
            expect(updatedValue).to.be.true;
        });
    });

    describe("resetValues", function () {
        var initialValue, updatedValue;

        before(function () {
            var valueModel = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Freizeit";
            });

            valueModel[0].set("isSelectable", false);
            initialValue = valueModel[0].get("isSelectable");
        });

        it("should reset Value", function () {
            model.resetValues();
            updatedValue = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Freizeit";
            })[0].get("isSelectable");

            expect(initialValue).to.be.false;
            expect(updatedValue).to.be.true;
        });
    });

    describe("addValueModels", function () {
        var initialValue, updatedValue;

        before(function () {
            var countTest1, countTest2;

            countTest1 = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Test1";
            }).length;
            countTest2 = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Test2";
            }).length;

            initialValue = countTest1 + countTest2;
        });

        it("should add Value Models", function () {
            var countTest1, countTest2;

            model.addValueModels(["Test1", "Test2"]);

            countTest1 = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Test1";
            }).length;
            countTest2 = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Test2";
            }).length;

            updatedValue = countTest1 + countTest2;

            expect(initialValue).to.equal(0);
            expect(updatedValue).to.equal(2);
        });
    });

    describe("updateSelectableValues", function () {
        var initialValue, updatedValue;

        before(function () {
            var valueModel = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Freizeit";
            });

            valueModel[0].set("isSelected", false);

            initialValue = valueModel[0].get("isSelectable");
        });

        it("should update Selectable Values", function () {
            var valueModel;

            model.updateSelectableValues("Freizeit");

            valueModel = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Freizeit";
            });
            updatedValue = valueModel[0].get("isSelectable");

            expect(initialValue).to.be.true;
            expect(updatedValue).to.be.false;
        });
    });
});

import Model from "@modules/tools/einwohnerabfrage_hh/model.js";
import Util from "@modules/core/util.js";
import {expect} from "chai";

describe("tools/einwohnerabfrageModel", function () {
    var model;

    before(function () {
        model = new Model();
        new Util();
    });

    describe("isOwnMetaRequest", function () {
        it("should return true if uniqueId is in uniqueIdList", function () {
            expect(model.isOwnMetaRequest(["1234", "5678"], "1234")).to.be.true;
        });
        it("should return false if uniqueId is NOT in uniqueIdList", function () {
            expect(model.isOwnMetaRequest(["1234", "5678"], "91011")).to.be.false;
        });
        it("should return false if uniqueId is undefined", function () {
            expect(model.isOwnMetaRequest(["1234", "5678"], undefined)).to.be.false;
        });
        it("should return false if uniqueIdList is undefined", function () {
            expect(model.isOwnMetaRequest(undefined, "91011")).to.be.false;
        });
        it("should return false if uniqueIdList and uniqueId is undefined", function () {
            expect(model.isOwnMetaRequest(undefined, undefined)).to.be.false;
        });
    });
    describe("removeUniqueIdFromList", function () {
        it("should remove uniqueId from uniqueIdList if uniqueId in uniqueIdList", function () {
            model.removeUniqueIdFromList(["1234", "5678"], "1234");
            expect(model.get("uniqueIdList")).to.deep.equal(["5678"]);
        });
        it("should leave uniqueIdList if uniqueId not in uniqueIdList", function () {
            model.removeUniqueIdFromList(["1234", "5678"], "123456789");
            expect(model.get("uniqueIdList")).to.deep.equal(["1234", "5678"]);
        });
        it("should leave uniqueIdList if uniqueId is undefined", function () {
            model.removeUniqueIdFromList(["1234", "5678"], undefined);
            expect(model.get("uniqueIdList")).to.deep.equal(["1234", "5678"]);
        });
        it("should leave uniqueIdList if uniqueIdList is undefined", function () {
            model.removeUniqueIdFromList(undefined, "5678");
            expect(model.get("uniqueIdList")).to.be.an("array").that.is.empty;
        });
        it("should leave uniqueIdList if uniqueIdList and uniqueId is undefined", function () {
            model.removeUniqueIdFromList(undefined, undefined);
            expect(model.get("uniqueIdList")).to.be.an("array").that.is.empty;
        });
    });
    describe("chooseUnitAndPunctuate", function () {
        it("should return correct unit for value < 250000", function () {
            expect(model.chooseUnitAndPunctuate(567, 0)).to.have.string("m²");
        });
        it("should return correct unit for value > 250000 and value < 10000000", function () {
            expect(model.chooseUnitAndPunctuate(250000.1, 1)).to.have.string("ha");
        });
        it("should return correct unit for value >  250000", function () {
            expect(model.chooseUnitAndPunctuate(99999999, 0)).to.have.string("km²");
        });
        it("should return correctly formatted number with unit", function () {
            expect(model.chooseUnitAndPunctuate(1234567.123, 3)).to.equal("123,457 ha");
        });
        it("should return correctly formatted number with unit when number > 250000 and value < 10000000 maxlength === 0", function () {
            expect(model.chooseUnitAndPunctuate(1234567.123, 0)).to.equal("123 ha");
        });
        it("should return correctly formatted number with unit when value < 250000 && maxlength === 0", function () {
            expect(model.chooseUnitAndPunctuate(14567.123, 0)).to.equal("14.567 m²");
        });
        it("should return correctly formatted number with unit when value > 10000000 &&  maxlength === 1", function () {
            expect(model.chooseUnitAndPunctuate(99999999.999, 1)).to.equal("100,0 km²");
        });
    });

});

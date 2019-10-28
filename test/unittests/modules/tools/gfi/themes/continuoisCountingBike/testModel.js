import {expect} from "chai";
import Model from "@modules/tools/gfi/themes/continuousCountingBike/model.js";

var model;

before(function () {
    model = new Model();
});

describe("tools/gfi/themes/continuousCountingBike", function () {
    var dayLine = "13.02.2018,00:00:00,4|13.02.2018,00:15:00,5|13.02.2018,00:30:00,5|13.02.2018,00:45:00,0|13.02.2018,01:00:00,0|13.02.2018,01:15:00,0|13.02.2018,01:30:00,0|13.02.2018,01:45:00,0|13.02.2018,02:00:00,0|13.02.2018,02:15:00,2|13.02.2018,02:30:00,0|13.02.2018,02:45:00,1|13.02.2018,03:00:00,0|13.02.2018,03:15:00,0|13.02.2018,03:30:00,1|13.02.2018,03:45:00,0|13.02.2018,04:00:00,1|13.02.2018,04:15:00,2|13.02.2018,04:30:00,3|13.02.2018,04:45:00,1|13.02.2018,05:00:00,3|13.02.2018,05:15:00,8|13.02.2018,05:30:00,6|13.02.2018,05:45:00,12|13.02.2018,06:00:00,8|13.02.2018,06:15:00,20|13.02.2018,06:30:00,14|13.02.2018,06:45:00,33|13.02.2018,07:00:00,35|13.02.2018,07:15:00,37|13.02.2018,07:30:00,81|13.02.2018,07:45:00,77|13.02.2018,08:00:00,100|13.02.2018,08:15:00,120|13.02.2018,08:30:00,150|13.02.2018,08:45:00,166|13.02.2018,09:00:00,110|13.02.2018,09:15:00,81|13.02.2018,09:30:00,82|13.02.2018,09:45:00,59|13.02.2018,10:00:00,49|13.02.2018,10:15:00,42|13.02.2018,10:30:00,35|13.02.2018,10:45:00,31|13.02.2018,11:00:00,27|13.02.2018,11:15:00,40|13.02.2018,11:30:00,34|13.02.2018,11:45:00,27|13.02.2018,12:00:00,31|13.02.2018,12:15:00,40|13.02.2018,12:30:00,40|13.02.2018,12:45:00,42|13.02.2018,13:00:00,29|13.02.2018,13:15:00,56|13.02.2018,13:30:00,51|13.02.2018,13:45:00,54|13.02.2018,14:00:00,43|13.02.2018,14:15:00,48|13.02.2018,14:30:00,56|13.02.2018,14:45:00,51|13.02.2018,15:00:00,47|13.02.2018,15:15:00,58|13.02.2018,15:30:00,76|13.02.2018,15:45:00,64|13.02.2018,16:00:00,53|13.02.2018,16:15:00,62|13.02.2018,16:30:00,88|13.02.2018,16:45:00,75|13.02.2018,17:00:00,64|13.02.2018,17:15:00,88|13.02.2018,17:30:00,100|13.02.2018,17:45:00,100|13.02.2018,18:00:00,93|13.02.2018,18:15:00,86|13.02.2018,18:30:00,98|13.02.2018,18:45:00,79|13.02.2018,19:00:00,78|13.02.2018,19:15:00,43|13.02.2018,19:30:00,41|13.02.2018,19:45:00,41|13.02.2018,20:00:00,31|13.02.2018,20:15:00,30|13.02.2018,20:30:00,21|13.02.2018,20:45:00,20|13.02.2018,21:00:00,18|13.02.2018,21:15:00,23|13.02.2018,21:30:00,24|13.02.2018,21:45:00,30|13.02.2018,22:00:00,19|13.02.2018,22:15:00,17|13.02.2018,22:30:00,12|13.02.2018,22:45:00,7|13.02.2018,23:00:00,5|13.02.2018,23:15:00,16|13.02.2018,23:30:00,10|13.02.2018,23:45:00,8",
        lastSevenDaysLine = "7,12.02.2018,3103|7,13.02.2018,3778",
        yearLine = "2018,5,22200|2018,6,24896|2018,4,27518|2018,3,19464|2018,2,27534|2018,1,17096|2018,7,3103",
        dayDataset = [{
            class: "dot",
            style: "circle",
            date: "13.02.2018",
            timestamp: new Date("2018", "1", "13", "00", "00", "0", 0),
            total: "4",
            tableData: "4",
            r_in: null,
            r_out: null
        }],
        lastSevenDaysDataset = [{
            class: "dot",
            style: "circle",
            date: "13.02.2018",
            timestamp: new Date("2018", "1", "13", "00", "00", "0", 0),
            total: "4",
            tableData: "4",
            r_in: null,
            r_out: null
        }],
        yearDataset = [{
            class: "dot",
            style: "circle",
            date: "13.02.2018",
            timestamp: new Date("2018", "1", "13", "00", "00", "0", 0),
            total: "4",
            tableData: "4",
            r_in: null,
            r_out: null
        }],
        inspectData = {
            r_in: null,
            r_out: null
        },
        activeTab = "day",
        data = [{
            class: "dot",
            date: "11.03.2019",
            r_in: null,
            r_out: null,
            style: "circle",
            tableData: "8",
            timestamp: "00:00 Uhr",
            total: 8
        }],
        xThinning = 1;

    describe("splitDayDataset", function () {
        it("should return array with length of 96", function () {
            expect(model.splitDayDataset(dayLine)).to.be.an("array").to.have.lengthOf(96);
        });
        it("should return array that is empty", function () {
            expect(model.splitDayDataset(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return array that is empty", function () {
            expect(model.splitDayDataset()).to.be.an("array").that.is.empty;
        });
    });

    describe("splitLastSevenDaysDataset", function () {
        it("should return array with length of 2", function () {
            expect(model.splitLastSevenDaysDataset(lastSevenDaysLine)).to.be.an("array").to.have.lengthOf(2);
        });
        it("should return array that is empty", function () {
            expect(model.splitLastSevenDaysDataset(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return array that is empty", function () {
            expect(model.splitLastSevenDaysDataset()).to.be.an("array").that.is.empty;
        });
    });

    describe("splitYearDataset", function () {
        it("should return array with length of 7", function () {
            expect(model.splitYearDataset(yearLine)).to.be.an("array").to.have.lengthOf(7);
        });
        it("should return array that is empty", function () {
            expect(model.splitYearDataset(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return array that is empty", function () {
            expect(model.splitYearDataset()).to.be.an("array").that.is.empty;
        });
    });

    describe("prepareDayDataset", function () {
        it("should return object that have all keys", function () {
            expect(model.prepareDayDataset(dayDataset)).to.be.an("object").that.have.all.keys(["data", "xLabel", "yLabel", "graphArray", "xAxisTicks", "legendArray"]);
        });
        it("should return object that has empty keys", function () {
            expect(model.prepareDayDataset(undefined)).to.be.an("object").to.deep.include({
                data: "",
                xLabel: "Tagesverlauf am ",
                graphArray: "",
                xAxisTicks: {
                    unit: "Uhr",
                    values: []
                },
                legendArray: ""
            });
        });
        it("should return object that has empty keys", function () {
            expect(model.prepareDayDataset()).to.be.an("object").to.deep.include({
                data: "",
                xLabel: "Tagesverlauf am ",
                graphArray: "",
                xAxisTicks: {
                    unit: "Uhr",
                    values: []
                },
                legendArray: ""
            });
        });
    });

    describe("prepareLastSevenDaysDataset", function () {
        it("should return object that have all keys", function () {
            expect(model.prepareLastSevenDaysDataset(lastSevenDaysDataset)).to.be.an("object").that.have.all.keys(["data", "xLabel", "yLabel", "graphArray", "xAxisTicks", "legendArray"]);
        });
        it("should return object that has empty keys", function () {
            expect(model.prepareLastSevenDaysDataset(undefined)).to.be.an("object").to.deep.include({
                data: "",
                xLabel: "Woche vom  bis ",
                graphArray: "",
                xAxisTicks: {
                    values: []
                },
                legendArray: ""
            });
        });
        it("should return object that has empty keys", function () {
            expect(model.prepareLastSevenDaysDataset()).to.be.an("object").to.deep.include({
                data: "",
                xLabel: "Woche vom  bis ",
                graphArray: "",
                xAxisTicks: {
                    values: []
                },
                legendArray: ""
            });
        });
    });

    describe("prepareYearDataset", function () {
        it("should return object that have all keys", function () {
            expect(model.prepareYearDataset(yearDataset)).to.be.an("object").that.have.all.keys(["data", "xLabel", "yLabel", "graphArray", "xAxisTicks", "legendArray"]);
        });
        it("should return object that has empty keys", function () {
            expect(model.prepareYearDataset(undefined)).to.be.an("object").to.deep.include({
                data: "",
                xLabel: "KW im Jahr ",
                graphArray: "",
                xAxisTicks: {
                    unit: "Kw",
                    values: []
                },
                legendArray: ""
            });
        });
        it("should return object that has empty keys", function () {
            expect(model.prepareYearDataset()).to.be.an("object").to.deep.include({
                data: "",
                xLabel: "KW im Jahr ",
                graphArray: "",
                xAxisTicks: {
                    unit: "Kw",
                    values: []
                },
                legendArray: ""
            });
        });
    });

    describe("getDataAttributes", function () {
        it("should return array that is not empty", function () {
            expect(model.getDataAttributes(inspectData)).to.be.an("array").to.not.be.empty;
        });
        it("should return array that has length of 1", function () {
            expect(model.getDataAttributes(undefined)).to.be.an("array").to.have.lengthOf(1);
        });
        it("should return array that has length of 1", function () {
            expect(model.getDataAttributes()).to.be.an("array").to.have.lengthOf(1);
        });
    });

    describe("getLegendAttributes", function () {
        it("should return array that is not empty", function () {
            expect(model.getLegendAttributes(inspectData)).to.be.an("array").to.not.be.empty;
        });
        it("should return array that has length of 1", function () {
            expect(model.getLegendAttributes(undefined)).to.be.an("array").to.have.lengthOf(1);
        });
        it("should return array that has length of 1", function () {
            expect(model.getLegendAttributes()).to.be.an("array").to.have.lengthOf(1);
        });
    });

    describe("getDatasetByActiveTab", function () {
        it("should return object that is empty", function () {
            expect(model.getDatasetByActiveTab(activeTab)).to.be.an("object").that.is.empty;
        });
        it("should return undefined", function () {
            expect(model.getDatasetByActiveTab(undefined)).to.be.undefined;
        });
        it("should return undefined", function () {
            expect(model.getDatasetByActiveTab()).to.be.undefined;
        });
    });

    describe("createxAxisTickValues", function () {
        it("should return object that is empty", function () {
            expect(model.createxAxisTickValues(data, xThinning)).to.be.an("array").that.have.lengthOf(1);
        });
        it("should return array that is empty", function () {
            expect(model.createxAxisTickValues(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return array that is empty", function () {
            expect(model.createxAxisTickValues()).to.be.an("array").that.is.empty;
        });
    });
});

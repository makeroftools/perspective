/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

let yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const now = new Date();

const data = [
    {w: now, x: 1, y: "a", z: true},
    {w: now, x: 2, y: "b", z: false},
    {w: now, x: 3, y: "c", z: true},
    {w: yesterday, x: 4, y: "d", z: false}
];

const rdata = [
    {w: +now, x: 1, y: "a", z: true},
    {w: +now, x: 2, y: "b", z: false},
    {w: +now, x: 3, y: "c", z: true},
    {w: +yesterday, x: 4, y: "d", z: false}
];

// starting from 09/01/2018 to 12/01/2018
const date_range_data = [
    {w: new Date(1535778060000), x: 1, y: "a", z: true}, // Sat Sep 01 2018 01:01:00 GMT-0400
    {w: new Date(1538370060000), x: 2, y: "b", z: false}, // Mon Oct 01 2018 01:01:00 GMT-0400
    {w: new Date(1541048460000), x: 3, y: "c", z: true}, // Thu Nov 01 2018 01:01:00 GMT-0400
    {w: new Date(1543644060000), x: 4, y: "d", z: false} // Sat Dec 01 2018 01:01:00 GMT-0500
];

const r_date_range_data = [
    {w: +new Date(1535778060000), x: 1, y: "a", z: true},
    {w: +new Date(1538370060000), x: 2, y: "b", z: false},
    {w: +new Date(1541048460000), x: 3, y: "c", z: true},
    {w: +new Date(1543644060000), x: 4, y: "d", z: false}
];

// starting from 2020/03/01 to 2020/12/01
const datetime_range_data = [
    {w: new Date(2020, 2, 1, 12, 30, 55), x: 1, y: "a", z: true}, // 2020/03/01 12:30:55 GMT-0400
    {w: new Date(2020, 9, 1, 15, 30, 55), x: 2, y: "b", z: false}, // 2020/10/01 15:30:55 GMT-0400
    {w: new Date(2020, 10, 1, 19, 30, 55), x: 3, y: "c", z: true}, // 2020/11/01 19:30:55 GMT-0500
    {w: new Date(2020, 11, 1, 23, 30, 55), x: 4, y: "d", z: false} // 2020/12/01 23:30:55 GMT-0500
];

module.exports = perspective => {
    describe("Filters", function() {
        describe("GT & LT", function() {
            it("filters on long strings", async function() {
                var table = perspective.table([
                    {x: 1, y: "123456789012a", z: true},
                    {x: 2, y: "123456789012a", z: false},
                    {x: 3, y: "123456789012b", z: true},
                    {x: 4, y: "123456789012b", z: false}
                ]);
                var view = table.view({
                    filter: [["y", "contains", "123456789012a"]]
                });
                let json = await view.to_json();
                expect(json.length).toEqual(2);
                view.delete();
                table.delete();
            });

            it("x > 2", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["x", ">", 2.0]]
                });
                let json = await view.to_json();
                expect(json).toEqual(rdata.slice(2));
                view.delete();
                table.delete();
            });

            it("x < 3", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["x", "<", 3.0]]
                });
                let json = await view.to_json();
                expect(json).toEqual(rdata.slice(0, 2));
                view.delete();
                table.delete();
            });

            it("x > 4", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["x", ">", 4]]
                });
                let json = await view.to_json();
                expect(json).toEqual([]);
                view.delete();
                table.delete();
            });

            it("x < 0", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["x", ">", 4]]
                });
                let json = await view.to_json();
                expect(json).toEqual([]);
                view.delete();
                table.delete();
            });

            describe("Filter on datetime column", () => {
                it("w > date as string", async function() {
                    const table = perspective.table(date_range_data);
                    const view = table.view({
                        filter: [["w", ">", "10/01/2018"]]
                    });
                    const json = await view.to_json();
                    expect(json).toEqual(r_date_range_data.slice(1, 4));
                    view.delete();
                    table.delete();
                });

                it("w < date as string", async function() {
                    const table = perspective.table(date_range_data);
                    const view = table.view({
                        filter: [["w", "<", "10/01/2018"]]
                    });
                    const json = await view.to_json();
                    expect(json).toEqual([r_date_range_data[0]]);
                    view.delete();
                    table.delete();
                });

                it("w == datetime with time as string", async function() {
                    const table = perspective.table(datetime_range_data);
                    const filter = [["w", "==", "2020/12/01 23:30:55"]];
                    const valid = await table.is_valid_filter(filter[0]);
                    expect(valid).toEqual(true);
                    const view = table.view({
                        filter
                    });
                    const json = await view.to_json();
                    expect(json).toEqual(datetime_range_data[0]);
                    view.delete();
                    table.delete();
                });

                it("w > datetime with time as string", async function() {
                    const table = perspective.table(datetime_range_data);
                    const filter = [["w", ">", "2020/10/01 23:30:55"]];
                    const valid = await table.is_valid_filter(filter[0]);
                    expect(valid).toEqual(true);
                    const view = table.view({
                        filter
                    });
                    const json = await view.to_json();
                    expect(json).toEqual([datetime_range_data[0]]);
                    view.delete();
                    table.delete();
                });

                it("w < datetime with time as string", async function() {
                    const table = perspective.table(datetime_range_data);
                    const filter = [["w", "<", "2020/10/01 23:30:55"]];
                    const valid = await table.is_valid_filter(filter[0]);
                    expect(valid).toEqual(true);
                    const view = table.view({
                        filter
                    });
                    let json = await view.to_json();
                    expect(json).toEqual([datetime_range_data[0]]);
                    view.delete();
                    table.delete();
                });

                it("w == datetime with time as toLocaleString", async function() {
                    const table = perspective.table(datetime_range_data);
                    const filter = [["w", "==", new Date(2020, 2, 1, 12, 30, 55).toLocaleString()]];
                    const valid = await table.is_valid_filter(filter[0]);
                    expect(valid).toEqual(true);
                    const view = table.view({
                        filter
                    });
                    const json = await view.to_json();
                    expect(json).toEqual(datetime_range_data[0]);
                    view.delete();
                    table.delete();
                });

                it("w > datetime with time as toLocaleString", async function() {
                    const table = perspective.table(datetime_range_data);
                    const filter = [["w", ">", new Date(2020, 9, 1, 15, 30, 55).toLocaleString()]];
                    const valid = await table.is_valid_filter(filter[0]);
                    expect(valid).toEqual(true);
                    const view = table.view({
                        filter
                    });
                    const json = await view.to_json();
                    expect(json).toEqual([datetime_range_data[0]]);
                    view.delete();
                    table.delete();
                });

                it("w < datetime with time as toLocaleString", async function() {
                    const table = perspective.table(datetime_range_data);
                    const filter = [["w", "<", new Date(2020, 9, 1, 15, 30, 55).toLocaleString()]];
                    const valid = await table.is_valid_filter(filter[0]);
                    expect(valid).toEqual(true);
                    const view = table.view({
                        filter
                    });
                    let json = await view.to_json();
                    expect(json).toEqual([datetime_range_data[0]]);
                    view.delete();
                    table.delete();
                });

                it("w == datetime with time as Date()", async function() {
                    const table = perspective.table(datetime_range_data);
                    const filter = [["w", "==", new Date(2020, 2, 1, 12, 30, 55)]];
                    const valid = await table.is_valid_filter(filter[0]);
                    expect(valid).toEqual(true);
                    const view = table.view({
                        filter
                    });
                    const json = await view.to_json();
                    expect(json).toEqual(datetime_range_data[0]);
                    view.delete();
                    table.delete();
                });

                it("w > datetime with time as Date()", async function() {
                    const table = perspective.table(datetime_range_data);
                    const filter = [["w", ">", new Date(2020, 9, 1, 15, 30, 55)]];
                    const valid = await table.is_valid_filter(filter[0]);
                    expect(valid).toEqual(true);
                    const view = table.view({
                        filter
                    });
                    const json = await view.to_json();
                    expect(json).toEqual([datetime_range_data[0]]);
                    view.delete();
                    table.delete();
                });

                it("w < datetime with time as Date()", async function() {
                    const table = perspective.table(datetime_range_data);
                    const filter = [["w", "<", new Date(2020, 9, 1, 15, 30, 55)]];
                    const valid = await table.is_valid_filter(filter[0]);
                    expect(valid).toEqual(true);
                    const view = table.view({
                        filter
                    });
                    let json = await view.to_json();
                    expect(json).toEqual([datetime_range_data[0]]);
                    view.delete();
                    table.delete();
                });
            });

            describe("Filter on date column", function() {
                const schema = {
                    w: "date"
                };

                const date_results = [
                    {w: +new Date(1535760000000)}, // Fri Aug 31 2018 20:00:00 GMT-0400
                    {w: +new Date(1538352000000)}, // Sun Sep 30 2018 20:00:00 GMT-0400
                    {w: +new Date(1541030400000)}, // Wed Oct 31 2018 20:00:00 GMT-0400
                    {w: +new Date(1543622400000)} // Fri Nov 30 2018 19:00:00 GMT-0500
                ];

                it("w > date as string", async function() {
                    var table = perspective.table(schema);
                    table.update(date_results);
                    var view = table.view({
                        filter: [["w", ">", "10/02/2018"]]
                    });
                    let json = await view.to_json();
                    expect(json).toEqual(date_results.slice(2, 4));
                    view.delete();
                    table.delete();
                });

                it("w < date as string", async function() {
                    var table = perspective.table(schema);
                    table.update(date_results);
                    var view = table.view({
                        filter: [["w", "<", "10/02/2018"]]
                    });
                    let json = await view.to_json();
                    expect(json).toEqual(date_results.slice(0, 2));
                    view.delete();
                    table.delete();
                });
            });
        });

        describe("EQ", function() {
            it("x == 1", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["x", "==", 1]]
                });
                let json = await view.to_json();
                expect(json).toEqual(rdata.slice(0, 1));
                view.delete();
                table.delete();
            });

            it("x == 5", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["x", "==", 5]]
                });
                let json = await view.to_json();
                expect(json).toEqual([]);
                view.delete();
                table.delete();
            });

            it("y == 'a'", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["y", "==", "a"]]
                });
                let json = await view.to_json();
                expect(json).toEqual(rdata.slice(0, 1));
                view.delete();
                table.delete();
            });

            it("y == 'e'", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["y", "==", "e"]]
                });
                let json = await view.to_json();
                expect(json).toEqual([]);
                view.delete();
                table.delete();
            });

            it("z == true", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["z", "==", true]]
                });
                let json = await view.to_json();
                expect(json).toEqual([rdata[0], rdata[2]]);
                view.delete();
                table.delete();
            });

            it("z == false", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["z", "==", false]]
                });
                let json = await view.to_json();
                expect(json).toEqual([rdata[1], rdata[3]]);
                view.delete();
                table.delete();
            });

            it("w == yesterday", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["w", "==", yesterday]]
                });
                let json = await view.to_json();
                expect(json).toEqual([rdata[3]]);
                view.delete();
                table.delete();
            });

            it("w != yesterday", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["w", "!=", yesterday]]
                });
                let json = await view.to_json();
                expect(json).toEqual(rdata.slice(0, 3));
                view.delete();
                table.delete();
            });
        });

        describe("in", function() {
            it("y in ['a', 'b']", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["y", "in", ["a", "b"]]]
                });
                let json = await view.to_json();
                expect(json).toEqual(rdata.slice(0, 2));
                view.delete();
                table.delete();
            });
        });

        describe("not in", function() {
            it("y not in ['d']", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["y", "not in", ["d"]]]
                });
                let json = await view.to_json();
                expect(json).toEqual(rdata.slice(0, 3));
                view.delete();
                table.delete();
            });
        });

        describe("contains", function() {
            it("y contains 'a'", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [["y", "contains", "a"]]
                });
                let json = await view.to_json();
                expect(rdata.slice(0, 1)).toEqual(json);
                view.delete();
                table.delete();
            });
        });

        describe("multiple", function() {
            it("x > 1 & x < 4", async function() {
                var table = perspective.table(data);
                var view = table.view({
                    filter: [
                        ["x", ">", 1],
                        ["x", "<", 4]
                    ]
                });
                let json = await view.to_json();
                expect(json).toEqual(rdata.slice(1, 3));
                view.delete();
                table.delete();
            });

            it("y contains 'a' OR y contains 'b'", async function() {
                var table = perspective.table(data);
                // when `filter_op` is provided, perspective returns data differently. In this case, returned data should satisfy either/or of the filter conditions.
                var view = table.view({
                    filter_op: "or",
                    filter: [
                        ["y", "contains", "a"],
                        ["y", "contains", "b"]
                    ]
                });
                let json = await view.to_json();
                expect(json).toEqual(rdata.slice(0, 2));
                view.delete();
                table.delete();
            });
        });

        describe("is null", function() {
            it("returns the correct null cells for string column", async function() {
                const table = perspective.table([
                    {x: 1, y: null},
                    {x: 2, y: null},
                    {x: 3, y: "x"},
                    {x: 4, y: "x"},
                    {x: 1, y: "y"},
                    {x: 2, y: "x"},
                    {x: 3, y: "y"}
                ]);
                const view = table.view({
                    filter: [["y", "is null"]]
                });
                const answer = [
                    {x: 1, y: null},
                    {x: 2, y: null}
                ];
                const result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });

            it("returns the correct null cells for integer column", async function() {
                const table = perspective.table([
                    {x: 1, y: null},
                    {x: 2, y: null},
                    {x: 3, y: 1},
                    {x: 4, y: 2},
                    {x: 1, y: 3},
                    {x: 2, y: 4},
                    {x: 3, y: 5}
                ]);
                const view = table.view({
                    filter: [["y", "is null"]]
                });
                const answer = [
                    {x: 1, y: null},
                    {x: 2, y: null}
                ];
                const result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });

            it("returns the correct null cells for datetime column", async function() {
                const table = perspective.table([
                    {x: 1, y: null},
                    {x: 2, y: null},
                    {x: 3, y: "1/1/2019"},
                    {x: 4, y: "1/1/2019"},
                    {x: 1, y: "1/1/2019"},
                    {x: 2, y: "1/1/2019"},
                    {x: 3, y: "1/1/2019"}
                ]);
                const view = table.view({
                    filter: [["y", "is null"]]
                });
                const answer = [
                    {x: 1, y: null},
                    {x: 2, y: null}
                ];
                const result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });
        });

        describe("nulls", function() {
            it("x > 2", async function() {
                var table = perspective.table([
                    {x: 3, y: 1},
                    {x: 2, y: 1},
                    {x: null, y: 1},
                    {x: null, y: 1},
                    {x: 4, y: 2},
                    {x: null, y: 2}
                ]);
                var view = table.view({
                    filter: [["x", ">", 2]]
                });
                var answer = [
                    {x: 3, y: 1},
                    {x: 4, y: 2}
                ];
                let result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });

            it("x < 3", async function() {
                var table = perspective.table([
                    {x: 3, y: 1},
                    {x: 2, y: 1},
                    {x: null, y: 1},
                    {x: null, y: 1},
                    {x: 4, y: 2},
                    {x: null, y: 2}
                ]);
                var view = table.view({
                    filter: [["x", "<", 3]]
                });
                var answer = [{x: 2, y: 1}];
                let result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });

            it("x > 2", async function() {
                var table = perspective.table({x: "float", y: "integer"});
                table.update([
                    {x: 3.5, y: 1},
                    {x: 2.5, y: 1},
                    {x: null, y: 1},
                    {x: null, y: 1},
                    {x: 4.5, y: 2},
                    {x: null, y: 2}
                ]);
                var view = table.view({
                    filter: [["x", ">", 2.5]]
                });
                var answer = [
                    {x: 3.5, y: 1},
                    {x: 4.5, y: 2}
                ];
                let result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });

            it("x > null should be an invalid filter", async function() {
                var table = perspective.table({x: "float", y: "integer"});
                const dataSet = [
                    {x: 3.5, y: 1},
                    {x: 2.5, y: 1},
                    {x: null, y: 1},
                    {x: null, y: 1},
                    {x: 4.5, y: 2},
                    {x: null, y: 2}
                ];
                table.update(dataSet);
                var view = table.view({
                    filter: [["x", ">", null]]
                });
                var answer = dataSet;
                let result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });
        });

        describe("is_valid_filter", function() {
            it("x == 2", async function() {
                let table = perspective.table(data);
                let isValid = await table.is_valid_filter(["x", "==", 2]);
                expect(isValid).toBeTruthy();
                table.delete();
            });
            it("x < null", async function() {
                let table = perspective.table(data);
                let isValid = await table.is_valid_filter(["x", "<", null]);
                expect(isValid).toBeFalsy();
                table.delete();
            });
            it("x > undefined", async function() {
                let table = perspective.table(data);
                let isValid = await table.is_valid_filter(["x", ">", undefined]);
                expect(isValid).toBeFalsy();
                table.delete();
            });
            it('x == ""', async function() {
                let table = perspective.table(data);
                let isValid = await table.is_valid_filter(["x", "==", ""]);
                expect(isValid).toBeTruthy();
                table.delete();
            });
            it("valid date", async function() {
                const schema = {
                    x: "string",
                    y: "date"
                };
                let table = perspective.table(schema);
                let isValid = await table.is_valid_filter(["y", "==", "01-01-1970"]);
                expect(isValid).toBeTruthy();
                table.delete();
            });
            it("invalid date", async function() {
                const schema = {
                    x: "string",
                    y: "date"
                };
                let table = perspective.table(schema);
                let isValid = await table.is_valid_filter(["y", "<", "1234"]);
                expect(isValid).toBeFalsy();
                table.delete();
            });
            it("valid datetime", async function() {
                const schema = {
                    x: "string",
                    y: "datetime"
                };
                let table = perspective.table(schema);
                let isValid = await table.is_valid_filter(["y", "==", "2019-11-02 11:11:11.111"]);
                expect(isValid).toBeTruthy();
                table.delete();
            });
            it("invalid datetime", async function() {
                const schema = {
                    x: "string",
                    y: "datetime"
                };
                let table = perspective.table(schema);
                let isValid = await table.is_valid_filter(["y", ">", "2019-11-02 11:11:11:111"]);
                expect(isValid).toBeFalsy();
                table.delete();
            });
            it("ignores schema check if column is not in schema", async function() {
                let table = perspective.table(data);
                let isValid = await table.is_valid_filter(["not a valid column", "==", 2]);
                expect(isValid).toBeTruthy();
                table.delete();
            });
        });
    });
};

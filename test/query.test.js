/**
 * Created by jgerber on 3/23/15.
 */

var query = require("../lib/query.js");
var assert = require('assert');
var _ = require("underscore");
describe("query", function (){
    it("should expose a Component class, a Statement class, and a Compound class, as well as Relation and Operator Enums", function(){
        assert(query.hasOwnProperty("Component"));
        assert(query.hasOwnProperty("Statement"));
        assert(query.hasOwnProperty("Compound"));
        assert(query.hasOwnProperty("Relation"));
        assert(query.hasOwnProperty("Operator"));
    });
    describe("Component", function (){

        it("Should provide a static convenience method which returns a new instance of Component.", function (){
            //noinspection JSCheckFunctionSignatures
            var component = query.Component.create("department", query.Relation.like, "model");
            assert(component instanceof query.Component);
        });

        it("Should be able to serialize/de-serialize and reconstitute itself via the 'fromOL' static method", function () {
            //noinspection JSCheckFunctionSignatures
            var component = query.Component.create("department", query.Relation.like, "model");
            var new_c = query.Component.fromOL(JSON.parse(JSON.stringify(component)));
            assert(_.isEqual(component,new_c));
        });

        it("Should be able to convert to appropriate string format via the toString method for 'like' relations", function () {
            //noinspection JSCheckFunctionSignatures
            var component = query.Component.create("department", query.Relation.like, "model");
            var scomponent = component.toString();
            assert(typeof scomponent === 'string');
            assert(scomponent === "department:model");
        });

        it("Should be able to convert to appropriate string format via the toString method for 'is' relations", function () {
            //noinspection JSCheckFunctionSignatures
            var component = query.Component.create("department", query.Relation.is, "model");
            var scomponent = component.toString();
            assert(scomponent === 'department:"model"');

        });
    });
});
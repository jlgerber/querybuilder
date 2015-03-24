/**
 * Created by jgerber on 3/23/15.
 */

var query = require("../lib/query.js");
var assert = require('assert');
var _ = require("underscore");
describe("query", function (){
    it("Should expose a Component class, a Statement class, and a Compound class, as well as Relation and Operator Enums", function(){
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

        it("Should be able to convert to appropriate string format via the 'toString' method for 'like' relations", function () {
            //noinspection JSCheckFunctionSignatures
            var component = query.Component.create("department", query.Relation.like, "model");
            var scomponent = component.toString();
            assert(typeof scomponent === 'string');
            assert(scomponent === "department:model");
        });

        it("Should be able to convert to appropriate string format via the 'toString' method for 'is' relations", function () {
            //noinspection JSCheckFunctionSignatures
            var component = query.Component.create("department", query.Relation.is, "model");
            var scomponent = component.toString();
            assert(scomponent === 'department:"model"');

        });
    });
    describe("Statement", function (){

        it("Should provide a static convenience method which returns a new instance of Statement given a single component.", function (){
            //noinspection JSCheckFunctionSignatures
            var component = query.Component.create("department", query.Relation.like, "model");
            var statement = query.Statement.create(component);
            assert(statement instanceof query.Statement);
        });

        it("Should provide a static convenience method which returns a new instance of Statement given multiple components.", function (){
            //noinspection JSCheckFunctionSignatures
            var statement = query.Statement.create(
                query.Component.create("department",query.Relation.is,"model"),
                query.Component.create("name", query.Relation.like, "testcube"),
                query.Component.create("subcontext", query.Relation.is,["hi","md","lo"])
            );
            assert(statement instanceof query.Statement);
        });

        it("Should be able to serialize/de-serialize and reconstitute itself via the 'fromOLArray' static method", function () {
            //noinspection JSCheckFunctionSignatures
            var statement = query.Statement.create(
                query.Component.create("department",query.Relation.is,"model"),
                query.Component.create("name", query.Relation.like, "testcube"),
                query.Component.create("subcontext", query.Relation.is,["hi","md","lo"])
            );
            // serialize to JSON then parse.
            var ol = JSON.parse(JSON.stringify(statement));
            // convert object literal to statement
            var statement2 = query.Statement.fromOL(ol);
            // test equality via underscore isEqual, which does deep equality testing of objects.
            assert(_.isEqual(statement,statement2));
        });
        it("Should be able to convert to appropriate string format via the 'toString' method for 'like' relations", function () {
            //noinspection JSCheckFunctionSignatures
            var statement = query.Statement.create(
                new query.Component("department",query.Relation.like,"model"),
                query.Component.create("name", query.Relation.like, "testcube"),
                query.Component.create("subcontext", query.Relation.like,["hi","md","lo"])
            );
            console.log(statement);
            var sstatement = statement.toString();
            assert(typeof sstatement === 'string');
            assert(sstatement === 'department:model name:testcube subcontext:hi,md,lo');
        });
        it("Should be able to convert to appropriate string format via the 'toString' method for 'is' relations", function () {
            //noinspection JSCheckFunctionSignatures
            var statement = query.Statement.create(
                query.Component.create("department",query.Relation.is,"model"),
                query.Component.create("name", query.Relation.is, "testcube"),
                query.Component.create("subcontext", query.Relation.is,["hi","md","lo"])
            );
            var sstatement = statement.toString();
            assert(typeof sstatement === 'string');
            assert(sstatement === 'department:"model" name:"testcube" subcontext:"hi","md","lo"');
        });

    });
    describe("Compound", function(){
        it("Should provide a static convenience method which returns a new instance of Compound.", function (){
            //noinspection JSCheckFunctionSignatures
            var group =  query.Statement.create(query.Component.create("department", query.Relation.is, "anim"), query.Component.create("subcontext", query.Relation.is, ["hi","md"]));
            var group2 = query.Statement.create(query.Component.create("department",query.Relation.is,"integ"), query.Component.create("name", query.Relation.like, "cam"));
            var compound = new query.Compound(group, query.Operator.or, group2);

            assert(compound instanceof query.Compound);
        });

        it("Should be able to serialize/de-serialize and reconstitute itself via the 'fromOL' static method", function (){
            //noinspection JSCheckFunctionSignatures
            var group =  query.Statement.create(query.Component.create("department", query.Relation.is, "anim"), query.Component.create("subcontext", query.Relation.is, ["hi","md"]));
            //noinspection JSCheckFunctionSignatures
            var group2 = query.Statement.create(query.Component.create("department",query.Relation.is,"integ"), query.Component.create("name", query.Relation.like, "cam"));
            //noinspection JSCheckFunctionSignatures
            var compound = new query.Compound(group, query.Operator.or, group2);
            var ol = JSON.parse(JSON.stringify(compound));
            var compound2 = query.Compound.fromOL(ol);
            assert(_.isEqual(compound,compound2));
        });

        it("Should be able to convert to appropriate string format via the 'toString' method", function (){
            //noinspection JSCheckFunctionSignatures
            var group =  query.Statement.create(query.Component.create("department", query.Relation.is, "anim"),
                                                query.Component.create("subcontext", query.Relation.is, ["hi","md"]));
            //noinspection JSCheckFunctionSignatures
            var group2 = query.Statement.create(query.Component.create("department",query.Relation.is,"integ"),
                                                query.Component.create("name", query.Relation.like, "cam"));
            //noinspection JSCheckFunctionSignatures
            var compound = new query.Compound(group, query.Operator.or, group2);
            var str_compound = compound.toString();
            assert(_.isEqual(str_compound, '(department:"anim" subcontext:"hi","md") || (department:"integ" name:cam)'))
            console.log(str_compound);
            //assert(_.isEqual(compound,compound2));
        });
    });
});
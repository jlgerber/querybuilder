/**
 * Created by jgerber on 3/22/15.
 */


var Enum = // the name of the "class"
        function() // this is what the arguments are passed to
        {
            var values = arguments; // get the varargs and save them to a 'values' variable.
            var self = { // prepare a 'self' object to return, so we work with an object instead of a function
                all : [], // prepare a list of all indices
                keys : values, // create the list of all keys
                values: [],
                isa: function (value){return self.all.indexOf(value)>=0}
            };

            for(var i = 0; i < values.length; i++) // for all enum names given
            {
                self[values[i]] = i; // add the variable to this object
                self.values[i] = values[i];
                self.all[i] = i; // add the index to the list of all indices
            }
            return Object.freeze(self); // return the 'self' object, instead of this function
        }
    ;

var Relation = Enum("is","like"); // may decide to differentiate between is and in some day...
var Operator = Enum("and","or");

/**
 * @class Component
 * @desc Constructor function which returns a Component. The component represents an atom in the Query. It has a name,
 * a relation (is vs like ), and a value. The component instance has a toString method which renders the class as
 * expected by the REST interface.
 *
 * Example
 * =======
 * var dept = new Component("department", Relation.is, "model")
 *
 * @param {string} name. The name of the component.
 * @param {number} relation. An enum, either "is" or "like", which determines whether exact or glob matching will be
 * used when generating the string representation of the Component.
 * @param {string} value. The value of the component.
 * */
var Component = function (name, relation, value) {
    this.name = name;
    this.relation = relation;
    this.value=value;
};

/**
 * @static
 * @method create
 * @desc Alternative constructor which invokes new on the user's behalf, avoiding the common issue with accidentally
 * omitting "new" when attempting to invoke a constructor function.
 * */
Component.create = function (name, relation, value){
    return new Component(name, relation, value);
};
/**
 * @method fromOL
 * @static
 * @desc Alternate constructor function. Return a new Component from an object literal. The expectation is that
 * the class will be serialized / deserialized via JSON.stringify / JSON.parse. The resulting object literal may
 * be passed to Component.fromOL. eg.
 *
 * var c = new Component("department",Relation.is, "model");
 * var d = Component.fromOL(JSON.parse(JSON.stringify(c)));
 *
 * @param {Object} ol. An object literal with name, relation, and value variables.
 * @returns  An instance of Component.
 * */
Component.fromOL = function (ol){
    return new Component(ol.name, ol.relation, ol.value);
};

/**
 * @method toString
 * @returns {string} A string representation of the instance.
 * */
Component.prototype.toString = function () {
  var str = this.name + ":";

    var tmp = Array.isArray(this.value)=== true ? this.value : [this.value];

    if (this.relation === Relation.is){
        str += tmp.map(function (value) {
            return '"' + String(value) + '"';
        }).join();

    } else if (this.relation === Relation.like){
        str += tmp.join();
    }
    return str;
};

/**
 * @class Statement
 * @desc Constructor function which creates a Statement instance. A Statement consists of one or more Components.
 * The relationship between each is implicitly an AND relationship.
 * */
Statement = function(){
    this.components = [];
    for(var i =0;i<arguments.length;i++) {
        if(Array.isArray(arguments[i])) {
            arguments[i].forEach(function(argument){
                if (argument instanceof Component === false ){
                    throw new Error("arguments must be of type Component or Array of Components");
                }
            });
            this.components = this.components.concat(arguments[i]);
        } else if(arguments[i] instanceof Component === false){
            throw new Error("argument:"+arguments[i]+"is of type"+typeof arguments[i] + ", not Component");
        } else {
            this.components.push(arguments[i]);
        }
    }
};

/**
 * @static
 * @method create
 * @desc Alternate constructor function which returns a new instance of Statement.
 * */
 Statement.create = function () {
     // this guy is a bit tricky. First we convert the variadic args into an array
     var args = Array.prototype.slice.call(arguments, 0);
     // then we work around the need to call new on the constructor function with this trick
     // found on stackoverflow
     // http://stackoverflow.com/questions/8383323/passing-unknown-count-of-parameters-to-js-constructor-function
     function F() {
         return Statement.apply(this, args);
     }
     F.prototype = Statement.prototype;
     return new F();
};
 /**
 * @static
 * @method fromOLArray
 * @desc Generates a new Statement instance, given an array of object literals each compatible with Component.fromOL.
 * @param {array} ol_array. An array of object literals, each compatible with Component.fromOL.
 * @returns {Object}. A new instance of Statement.
 * */
Statement.fromOLArray = function(ol_array){
    return new Statement( ol_array.map(function(value){return Component.fromOL(value)}));
};

/**
 * @static
 * @method fromOL
 * @desc from Object Literal. Return a Statement instance given an object literal with appropriate structure. This
 * is used to convert a JSON.parsed string back into a Statement instance.
 * @param {object} ol. The source object literal.
 * @returns {object} Statement instance.
 * */
Statement.fromOL = function(ol){
    return Statement.fromOLArray(ol.components);
};
/**
 * @method toString
 * @returns {string} A string representation of the Statement instance.
 * */
Statement.prototype.toString = function () {
  return this.components.map(function (component){return component.toString()}).join(' ');
};

/**
 * @class Compound
 * @desc Constructor function taking left hand side and right hand side Statement instances, as well as an Operator
 * indicating their relationship ( and, or ).
 * @param {Statement} lhs. An instance of Statement.
 * @param {Operator} operator. An Operator Enum.
 * @param {Statement} rhs. An instance of Statement.
 * */
Compound = function(lhs, operator, rhs){
    if(lhs instanceof Statement === false && lhs instanceof Component === false ) {
        throw new Error("lhs must be Statement or Component");
    }

    if (Operator.isa(operator) === false) {
        throw new Error("Relation must be instance of operator enum.")
    }

    if( rhs instanceof Statement === false && rhs instanceof Component === false ) {
        throw new Error("rhs must be Statement or Component");
    }

    this.lhs = lhs;
    this.operator = operator;
    this.rhs = rhs;
};
/**
 * @static
 * @method create
 * @desc Alternate constructor function which returns an instance of Compound without the need to new it up explicitly.
 * */
Compound.create = function (lhs, operator, rhs) {
    return new Compound(lhs, operator, rhs);
};
 /**
 * @static
 * @method fromOL
 * @desc Alternative constructor returns a new Compound instance, given an object literal generated by the JSON
 * serialization / deserialization process.
 * @param {object} ol. The object literal discussed in the overview.
 * @returns {Compound}. Instance of Compound.
 * */
Compound.fromOL = function (ol){
    return new Compound(Statement.fromOLArray(ol.lhs.components), ol.operator, Statement.fromOLArray(ol.rhs.components))
};
/**
 * @method toString
 * @desc convert a Compound to its string representation
 * */
Compound.prototype.toString = function() {
    switch (this.operator) {
        case Operator.and:
            return "(" + this.lhs.toString() + ") && (" + this.rhs.toString() + ")";
        case Operator.or:
            return "(" + this.lhs.toString() + ") || (" + this.rhs.toString() + ")";
    }
};

/**
 * EXPORTS
 * */
module.exports = {
    Component:Component,
    Relation:Relation,
    Operator: Operator,
    Statement: Statement,
    Compound: Compound
};


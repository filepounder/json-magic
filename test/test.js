const assert = require('assert');
const $json=require('../index.js');
const $stream=require('stream');


describe('JSON Magic', function() {
    describe('parse path', function() {
        it('should parse a pointer path', function() {
            assert.deepEqual($json.Magic.parsePath('a/b/c'),['a','b','c'],'Invalid parse');
        });

        it('should parse a pointer path with leading slash', function() {
            assert.deepEqual($json.Magic.parsePath('/a/b/c'),['a','b','c'],'Invalid parse');
        });

        it('should parse a dot path', function() {
            assert.deepEqual($json.Magic.parsePath('a.b.c'),['a','b','c'],'Invalid parse');
        });

        it('should parse a dot path with leading dot', function() {
            assert.deepEqual($json.Magic.parsePath('.a.b.c'),['a','b','c'],'Invalid parse');
        });

        it('should parse unknown separator path', function() {
            assert.deepEqual($json.Magic.parsePath('/a.b.c'),['/a','b','c'],'Invalid parse');
        });

        it('should parse ua specified spearator', function() {
            assert.deepEqual($json.Magic.parsePath('a$$b$$c','$$'),['a','b','c'],'Invalid parse');
        });

    });

    describe('compile path', function() {

        it('should throw an error on invalid request', function() {
            assert.throws(()=>{$json.Magic.compilePath("a,b,c")},Error,'Invalid compile');
        });

        it('should compile a path', function() {
            assert.deepEqual($json.Magic.compilePath(['a','b','c']),'/a/b/c','Invalid compile');
        });

        it('should compile a path with dot', function() {
            assert.deepEqual($json.Magic.compilePath(['a','b','c'],'.'),'a.b.c','Invalid compile');
        });

        it('should compile a path with separator', function() {
            assert.deepEqual($json.Magic.compilePath(['a','b','c'],'$$',true),'a$$b$$c','Invalid compile');
        });
    });

    describe('has', function() {

        it('should check a defined path', function() {
            assert($json.Magic.has({a:{b:{c:1}}},'/a/b/c'),'Invalid defined check');
        });

        it('should check a path not defined', function() {
            assert(!$json.Magic.has({a:{b:null}},'/a/b/c'),'Invalid defined check');
        });

        it('should check a path defined array', function() {
            assert($json.Magic.has({a:{b:[{c:1},{c:2}]}},'/a/b/0/c'),'Invalid defined check');
        });

        it('should check a path not defined array', function() {
            assert(!$json.Magic.has({a:{b:[{d:1},{c:2}]}},'/a/b/0/c'),'Invalid defined check');
        });

        it('should check a path not defined array dot', function() {
            assert(!$json.Magic.has({a:{b:[{d:1},{c:2}]}},'a.b.0.c'),'Invalid defined check');
        });

        it('should has 1', function() {
            assert($json.Magic.has({a:{b:{c:1}}},'a.b'),'Invalid Has');
        });

        it('should has array', function() {
            assert($json.Magic.has([{a:{b:{c:1}}}],'0.a.b'),'Invalid Has');
        });

        it('should not has 1', function() {
            assert(!$json.Magic.has({a:{b:{c:1}}},'a.x'),'Invalid Has');
        });

        it('should has error null', function() {
            assert(!$json.Magic.has(null,'a.x'),'Invalid Has');
        });

        it('should has error string', function() {
            assert(!$json.Magic.has('a','a.x'),'Invalid Has');
        });

    });

    describe('get attribute', function() {
        it('should get a value 1 ', function() {
            assert.deepEqual($json.Magic.get({a:{b:{c:1}}},'.a.b.c'),1,'Invalid get');
        });

        it('should get a value 2', function() {
            assert.deepEqual($json.Magic.get({a:{b:{c:1}}},'a.b'),{c:1},'Invalid get');
        });

        it('should get a value 3', function() {
            assert.deepEqual($json.Magic.get({a:{b:{c:1}}},'/a/b'),{c:1},'Invalid get');
        });

        it('should error on get a value on string', function() {
            assert.throws(function(){
                $json.Magic.get('xxx','/')
            },Error,"Invalid Error thrown")
        });

        it('should error on get a value on null', function() {
            assert.throws(function(){
                $json.Magic.get(null,'/a/x/c')
            },Error,"Invalid Error thrown")
        });

        it('should throw an error on an invalid path', function() {
            assert.throws(function(){
                $json.Magic.get({a:{b:{c:1}}},'/a/x/c')
            },Error,"Invalid Error thrown")
        });
    });

    describe('set attribute', function() {

        it('should set a value 1 ', function() {
            let val={};
            $json.Magic.set(val,'.a.b.c',1)
            assert.deepEqual(val,{a:{b:{c:1}}},'Invalid set');
        });

        it('should set a value 2', function() {
            let val={};
            $json.Magic.set(val,'.a.b',{c:1})
            assert.deepEqual(val,{a:{b:{c:1}}},'Invalid set');
        });

        it('should set a value 3', function() {
            let val={};
            $json.Magic.set(val,'/a/b',{c:1})
            assert.deepEqual(val,{a:{b:{c:1}}},'Invalid set');
        });
        it('should set a value 4 ', function() {
            let val={};
            $json.Magic.set(val,'a','1')
            assert.deepEqual(val,{a:'1'},'Invalid set');
        });
        it('should set a value 5 ', function() {
            let val=[];
            $json.Magic.set(val,'/0','Val1')
            assert.deepEqual(val,['Val1'],'Invalid set');
        });



        it('should set a value 4', function() {
            let val={a:{b:{c:null}}};
            $json.Magic.set(val,'/a/b/c',1)
            assert.deepEqual(val,{a:{b:{c:1}}},'Invalid set');
        });

        it('should throw an error on a non object', function() {

            assert.throws(function(){
                let val='xxx';
                $json.Magic.set(val,{c:1},'/a/x')
            },Error,"Invalid Error thrown")

        });

        it('should not set a null object', function() {
            assert.throws(function(){
                let val=null;
                $json.Magic.set(val,{c:1},'/a/x')
            },Error,"Invalid Error thrown")
        });
    });


    describe('remove attribute', function() {
        it('should remove a value', function() {
            let val={a:{b:{c:1}}};
            $json.Magic.remove(val,'/a/b/c')
            assert.deepEqual(val,{a:{b:{}}},'Invalid remove');
        });

        it('should remove a value', function() {
            let val={a:{b:{c:1}}};
            $json.Magic.remove(val,'/a/b')
            assert.deepEqual(val,{a:{}},'Invalid remove');
        });
    });


    describe('path dictionary', function() {
        it('should get a pathDict', function() {
            let val={a:{b:{c:1,d:2}}};

            assert.deepEqual($json.Magic.pathDict(val),{'/a/b/c':1,'/a/b/d':2},'Invalid paths');
        });

        it('should get a pathDict with dot', function() {
            let val={a:{b:{c:1,d:2}}};
            assert.deepEqual($json.Magic.pathDict(val,'dot'),{'a.b.c':1,'a.b.d':2},'Invalid paths');
        });

        it('should get a pathDict with dot 2', function() {
            let val={a:{b:{c:1,d:2},x:'abc'}};
            assert.deepEqual($json.Magic.pathDict(val,'dot'),{'a.b.c':1,'a.b.d':2,'a.x':'abc'},'Invalid paths');
        });
    });

    describe('path array', function() {

        it('should get a pathArr', function() {
            let val={a:{b:{c:1,d:2}}};

            assert.deepEqual($json.Magic.pathArray(val),[{path:'/a/b/c',value:1},{path:'/a/b/d',value:2}],'Invalid paths');
        });

        it('should get a pathArr with dot', function() {
            let val={a:{b:{c:1,d:2}}};

            assert.deepEqual($json.Magic.pathArray(val,'dot'),[{path:'a.b.c',value:1},{path:'a.b.d',value:2}],'Invalid paths');
        });

        it('should get a pathArr with dot 2', function() {
            let val={a:{b:{c:1,d:2},x:'abc'}};
            assert.deepEqual($json.Magic.pathArray(val,'dot'),[{path:'a.b.c',value:1},{path:'a.b.d',value:2},{path:'a.x',value:'abc'}],'Invalid paths');
        });

    });

    describe('walk', function() {
        it('should walk', function() {
            let val={a:{b:{c:1,d:2},x:'abc'}};
            let walkedVals={};
            $json.Magic.walk(val,function(value,path){
                walkedVals[path]=value;
            });
            assert.deepEqual(walkedVals,{'/a/b/c':1,'/a/b/d':2,'/a/x':'abc'},'Invalid walk');
        });


        it('should walk dot', function() {
            let val={a:{b:{c:1,d:2},x:'abc'}};
            let walkedVals={};
            $json.Magic.walk(val,function(value,path){
                walkedVals[path]=value;
            },'.');
            assert.deepEqual(walkedVals,{'a.b.c':1,'a.b.d':2,'a.x':'abc'},'Invalid walk');
        });

        it('should walk string', function() {
            let val="abc";
            let walkedVals="";
            $json.Magic.walk(val,function(value,path){
                assert.equal(path,"/","Invalid path");
                assert.equal(value,"abc","invalid value")
            });
        });
    });


    describe('rename key', function() {
        it('should not rename key', function() {
            let val={a:{b:{c:1,d:2},x:'abc'}};

            val=$json.Magic.renameKey(val,(key,path)=>{
                return key;
            });
            assert.deepEqual(val,{a:{b:{c:1,d:2},x:'abc'}},'Invalid key rename');
        });

        it('should rename a key', function() {
            let val={a:{b:{c:1,d:2},x:'abc'}};

            val=$json.Magic.renameKey(val,(key,path)=>{
                if (key==="c")return "r";
            });
            assert.deepEqual(val,{a:{b:{r:1,d:2},x:'abc'}},'Invalid key rename');
        });

        it('should rename a key with array', function() {
            let val={a:{b:[{c:1,d:2},{c:4,d:5}],x:'abc'}};

            val=$json.Magic.renameKey(val,(key,path)=>{
                if (key==="c")return "r";
                else if (key==="x")return "x2";
            });
            assert.deepEqual(val,{a:{b:[{r:1,d:2},{r:4,d:5}],x2:'abc'}},'Invalid key rename');
        });

        it('should rename a string ', function() {
            let val="abc";

            val=$json.Magic.renameKey(val,(key,path)=>{
                if (key==="c")return "r";
                else if (key==="x")return "x2";
            });
            assert.deepEqual(val,'abc','Invalid key rename');
        });

    });

    describe('change value', function() {
        it('should not change value', function() {
            let val={a:{b:{c:1,d:2},x:'abc'}};

            val=$json.Magic.changeValue(val,(val,path)=>{
                return val;
            });
            assert.deepEqual(val,{a:{b:{c:1,d:2},x:'abc'}},'Invalid kchange val');
        });

        it('should change a value', function() {
            let val={a:{b:{c:1,d:2},x:'abc'}};

            val=$json.Magic.changeValue(val,(val,path)=>{
               if (val===2)return 20;
               else return val;
            });
            assert.deepEqual(val,{a:{b:{c:1,d:20},x:'abc'}},'Invalid key rename');
        });


        it('should change a value on array', function() {
            let val={a:{b:[{c:1,d:2},{c:2,d:5}],x:'abc'}};

            val=$json.Magic.changeValue(val,(val,path)=>{
                if (val===2)return 20;
                else return val;
            });
            assert.deepEqual(val,{a:{b:[{c:1,d:20},{c:20,d:5}],x:'abc'}},'Invalid key rename');
        });

        it('should change a string ', function() {
            let val="abc";

            val=$json.Magic.renameKey(val,(key,path)=>{
                if (val===2)return 20;
                else return val;
            });
            assert.deepEqual(val,'abc','Invalid key rename');
        });

    });

});

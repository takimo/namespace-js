

test('namespace',function(){
    ok(Namespace,'has Namespace');
    ok(Namespace('x'),'creation Namespace x');
    ok(Namespace('x.y'),'creation Namespace x.y');
    ok(Namespace('x.yy.zzz'),'creation Namespace x.yy.zzz');

});

test('self define',function(){
    Namespace('x.y').define(function(ns){
        ok(ns.CURRENT_NAMESPACE,'x.y','creation Namespace x.y');
        ns.provide({
            exportOne : true,
            exportTwo : false,
            exportObject : function(){}
        });
    });
    Namespace('x.y').define(function(ns){
        ok(ns.CURRENT_NAMESPACE,'x.y','creation Namespace x.y');
        equals( ns.exportOne , true , 'export true');
        equals( ns.exportTwo , false, 'export false');
        ok( ns.exportObject ,'export Object');
        ns.provide({
            exportThree : function(){}
        });
    });
    Namespace('x.y').apply(function(ns){
        equals( ns.exportOne , true , 'export true');
        equals( ns.exportTwo , false, 'export false');
        ok( ns.exportObject ,'export Object');
    });
});

test('use and define',function(){
    Namespace('test').define(function(ns){
        ok(ns.CURRENT_NAMESPACE,'test','creation Namespace x.y');
        ns.provide({
            Item : function(){this.id = 1}
        });
    });
    Namespace('test2').define(function(ns){
        ns.provide({
            Item : function(){this.id = 2;}
        });
    });
    Namespace('x.y')
    .use('test')
    .use('test2')
    .apply(function(ns){with(ns){
        var item1 = new test.Item;
        var item2 = new test2.Item;
        equals(item1.id,1,'item1 id');
        equals(item2.id,2,'item2 id');
    }});
    
    Namespace('x.y')
    .use('test *')
    .use('test2')
    .apply(function(ns){with(ns){
        var item1 = new Item;
        var item2 = new test2.Item;
        equals(item1.id,1,'item1 id');
        equals(item2.id,2,'item2 id');
    }});

    Namespace('x.y')
    .use('test *')
    .use('test2 *')
    .apply(function(ns){with(ns){
        var item1 = new Item;
        var item2 = new Item;
        equals(item1.id,2,'item1 id');
        equals(item2.id,2,'item2 id');
    }});
    
    Namespace('x.y')
    .use('test')
    .use('test2')
    .define(function(ns){with(ns){
        var item1 = new test.Item;
        var item2 = new test2.Item;
        equals(item1.id,1,'item1 id');
        equals(item2.id,2,'item2 id');
        provide({
            itemList : [item1,item2]
        });
    }});
    
    Namespace('x')
    .use('x.y')
    .apply(function(ns){
        ok(ns.x.y.itemList,'itemList ok');
    });
    
});


test('lazy export',function(){
    
    Namespace("org.example.net").define(function(ns){
        ok(true,'providing org.example.net');
        setTimeout(function(){
        ns.provide({
            HTTPRequest : function(){ },
            HTTPResponse : function(){ }
        });
        },10);
    });
    Namespace("org.example.system").define(function(ns){
        setTimeout(function(){
            ok(true,'providing org.example.system');
            start();
            ns.provide({
                Console : {
                    log : function(item){return true }
                }
            });
        },1000);
    });

    Namespace("org.example.application")
    .use('org.example.net *')
    .use('org.example.system Console')
    .apply(function(ns){with(ns){
        var req = new HTTPRequest;
        var res = new HTTPResponse;
        ok(req,'1st HTTPResponse');
        ok(res,'1st HTTPRequest');
        ok(Console.log("ok"),'1st Console.log');
    }});
    Namespace("org.example.application")
    .use('org.example.net *')
    .use('org.example.system Console')
    .apply(function(ns){with(ns){
        var req = new HTTPRequest;
        var res = new HTTPResponse;
        ok(req,'2nd HTTPResponse');
        ok(res,'2nd HTTPRequest')
        ok(Console.log("ok"),'2nd Console.log');
    }});
    stop();
});
const assert = require('assert');
const co = require('co');
const BlockRun = require('./index');

//Promise
BlockRun.run('testChannel1',()=>{
    return 1;
}).then((res)=>{
    assert.equal(res,1,'Promise failed');
}).catch((e)=>{
    throw e;
});


let p1 =(index,time)=>{
    return new Promise((res,rej)=>{
        setTimeout(()=>{
            res(index);
        },time)
    });
}

//co yield 
co(function*(){
    try{
        for(let i = 0;i<10;i++)
        {
            let res = yield BlockRun.run('testChannel2',function* (){
                return yield p1(i,2000);
            },3000);
            console.log(res)
            assert.equal(res,i,'co yield failed'+res);
        }
    } catch(e)
    {
        console.error(e.stack)
    }
});

// //async
(async () =>{
    try{
        for(let i = 0;i<10;i++)
        {
            let res = await BlockRun.run('testChannel2',async ()=>{
                return await p1(i,2000);
            },3000);
            console.log(res)
            assert.equal(res,i,'async failed'+res);
        }
    } catch(e)
    {
        console.error(e.stack)
    }
})();
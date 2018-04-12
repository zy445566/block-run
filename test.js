const assert = require('assert');
const co = require('co');
const BlockRun = require('./index');

//Promise
BlockRun.run('test',()=>{
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
            let res = yield BlockRun.run('test',function* (){
                return yield p1(i,1000);
            });
            assert.equal(res,i,'co yield failed'+res);
        }
    } catch(e)
    {
        throw e;
    }
});

//async
(async () =>{
    try{
        for(let i = 0;i<10;i++)
        {
            let res = await BlockRun.run('test',async ()=>{
                return await p1(i,1000);
            });
            assert.equal(res,i,'async failed'+res);
        }
    } catch(e)
    {
        throw e;
    }
})();
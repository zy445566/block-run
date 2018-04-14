# block-run
block run code
Execute code block in sequence by channels

# install
```sh
npm install block-run
```

# api
### run
-------------------------
* FunctionName  run
    * Return  anything
    * Description  run block code in channel
    * Param

name        | type |require |default    |Description
------------|------|--------|-----------|------------
channel   |string|must  |null   |block code channel
func |Function or GeneratorFunction or AsyncFunction|must  |null          |block code function
funTimeout |number|option  |-1         |function timeout 

### getQueue
-------------------------
* FunctionName  getQueue
    * Return  object
    * Description  get all channel queue
    * Param nothing

# base example
```js
const assert = require('assert');
const co = require('co');
const BlockRun = require('block-run');

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

// testChannel2 make two async function in sequence 

//co yield 
co(function*(){
    try{
        for(let i = 0;i<10;i++)
        {
            let res = yield BlockRun.run('testChannel2',function* (){
                return yield p1(i,2000);
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
            let res = await BlockRun.run('testChannel3',async ()=>{
                return await p1(i,2000);
            });
            assert.equal(res,i,'async failed'+res);
        }
    } catch(e)
    {
        throw e;
    }
})();
```
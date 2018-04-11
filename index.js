let BlockRun = require('./lib/BlockRun');

let p1 =(index,time)=>{
    return new Promise((res,rej)=>{
        setTimeout(()=>{
            res(index);
        },time)
    });
} 

(async () =>{
    let br = new BlockRun();
    for(let i = 0;i<10;i++)
    {
        // let res = await br.run('test',()=>{
        //     return i;
        // });
        let res = await br.run('test',async ()=>{
            await p1(i,Math.floor(Math.random()*1000+1));
            return await p1(i,Math.floor(Math.random()*1000+1));
        });
        console.log(res);
    }
})();

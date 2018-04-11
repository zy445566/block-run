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
            return await p1(i,Math.floor(Math.random()*3000+1));
        });
        console.log(res);
    }
})();

const EventEmitter = require('events').EventEmitter; 
const queue = {};
class BlockRun{
    getInfunc(func,event)
    {
        let tyepFunc = Object.prototype.toString.call(func);
        switch(tyepFunc)
        {
            case '[object GeneratorFunction]':
                return function *(){
                    let runRes = yield func();
                    event.emit("res",null,runRes);
                };
            break;
            case '[object AsyncFunction]':
                return async()=>{
                    let runRes = await func();
                    event.emit("res",null,runRes);
                };
            break;
            default:
                return ()=>{
                    let runRes = func();
                    event.emit("res",null,runRes);
                };
            break;
        }
    }

    runOutFunc(outFunc,reject)
    {
        let tyepFunc = Object.prototype.toString.call(outFunc);
        if (tyepFunc=='[object Function]')
        {
            outFunc();
        } else {
            outFunc().then(()=>{}).catch((error)=>{
                reject(error);
            })
        }
    }

    outQueueRun()
    {
        let outFunc = queue[name].shift();
        this.runOutFunc(outFunc,reject)
        if (queue[name].length==0)
        {
            delete queue[name];
        }
    }

    run (name,func)
    {
        return new Promise((reslove,reject)=>{
            if (!queue.hasOwnProperty(name))
            {
                queue[name] = []; 
            }
            let event = new EventEmitter();
            event.once("res",(error,res)=>{
                if(error)reject(error);
                reslove(res);
                this.outQueueRun();
            });

            queue[name].push(this.getInfunc(func,event));
            
        });
    }
}


module.exports = BlockRun;
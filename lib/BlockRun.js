const EventEmitter = require('events').EventEmitter; 
const queue = {};
class BlockRun{
    getInfunc(func,event,callBackInfo)
    {
        let tyepFunc = Object.prototype.toString.call(func);
        switch(tyepFunc)
        {
            case '[object GeneratorFunction]':
                return {
                    func:function *(){
                        let runRes = yield func();
                        event.emit("res",null,runRes);
                    },
                    callBackInfo:callBackInfo
                };
            break;
            case '[object AsyncFunction]':
            return {
                    func:async()=>{
                        let runRes = await func();
                        event.emit("res",null,runRes);
                    },
                    callBackInfo:callBackInfo
                };
            break;
            default:
                return {
                    func:()=>{
                        let runRes = func();
                        event.emit("res",null,runRes);
                    },
                    callBackInfo:callBackInfo
                };
            break;
        }
    }

    runOutQueue(outQueue)
    {
        let tyepFunc = Object.prototype.toString.call(outQueue.func);
        if (tyepFunc=='[object Function]')
        {
            outQueue.func();
        } else {
            outQueue.func().then(()=>{}).catch((error)=>{
                outQueue.callBackInfo.reject(error);
            })
        }
    }

    outQueueRun(name)
    {
        this.runOutQueue(queue[name][0])
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
                queue[name].shift();
                this.outQueueRun(name);
            });
            queue[name].push(this.getInfunc(func,event,{reslove,reject}));
            if(queue[name].length==1)
            {
                this.outQueueRun(name);
            }
        });
    }
}


module.exports = BlockRun;
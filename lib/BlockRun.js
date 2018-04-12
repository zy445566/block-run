const EventEmitter = require('events').EventEmitter; 
const co = require('co');
const queue = {};
class BlockRun{
    static getInfunc(func,event,callBackInfo)
    {
        let tyepFunc = Object.prototype.toString.call(func);
        switch(tyepFunc)
        {
            case '[object GeneratorFunction]':
                return {
                    func:function*(){
                        let runRes;
                        try{
                            runRes = yield func();
                        } catch(e) {
                            callBackInfo.reject(e)
                        } finally{
                            event.emit("res",null,runRes);
                        }
                    }
                };
            break;
            case '[object AsyncFunction]':
            return {
                    func:async()=>{
                        let runRes;
                        try{
                            runRes = await func();
                        } catch(e) {
                            callBackInfo.reject(e)
                        } finally{
                            event.emit("res",null,runRes);
                        }
                    }
                };
            break;
            default:
                return {
                    func:()=>{
                        let runRes;
                        try{
                            runRes = func();
                        } catch(e) {
                            callBackInfo.reject(e)
                        } finally{
                            event.emit("res",null,runRes);
                        }
                    }
                };
            break;
        }
    }

    static runOutQueue(outQueue)
    {
        let tyepFunc = Object.prototype.toString.call(outQueue.func);
        switch(tyepFunc)
        {
            case '[object GeneratorFunction]':
                co(outQueue.func);
            break;
            case '[object AsyncFunction]':
                outQueue.func().then(()=>{}).catch((e)=>{});
            break;
            default:
                outQueue.func();
            break;
        }
    }

    static outQueueRun(channel)
    {
        if (queue[channel].length==0)
        {
            delete queue[channel];
        } else {
            BlockRun.runOutQueue(queue[channel][0])
        }
    }

    static isFunc(func)
    {
        if(typeof func !='function'){return false;}
        let tyepFunc = Object.prototype.toString.call(func);
        return tyepFunc=='[object Function]' 
        || tyepFunc=='[object AsyncFunction]' 
        || tyepFunc=='[object GeneratorFunction]';
    }

    static run (channel,func)
    {
        if (typeof channel !='string')
        {
            throw new Error("first args only support string");
        }
        if (!BlockRun.isFunc(func))
        {
            throw new Error("second args only support Function|AsyncFunction|GeneratorFunction");
        }
        return new Promise((reslove,reject)=>{
            if (!queue.hasOwnProperty(channel))
            {
                queue[channel] = []; 
            }
            let event = new EventEmitter();
            event.once("res",(error,res)=>{
                if(error)reject(error);
                reslove(res);
                queue[channel].shift();
                BlockRun.outQueueRun(channel);
            });
            queue[channel].push(BlockRun.getInfunc(func,event,{reslove,reject}));
            if(queue[channel].length==1)
            {
                BlockRun.outQueueRun(channel);
            }
        });
    }

    static getQueue()
    {
        return queue;
    }
}


module.exports = BlockRun;
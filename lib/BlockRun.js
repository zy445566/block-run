const EventEmitter = require('events').EventEmitter; 
const co = require('co');
const queue = {};
class BlockRun{
    static getInfunc(func,channel,callBackInfo)
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
                            callBackInfo.reslove(runRes);
                            if(queue[channel]!=undefined)queue[channel].shift();
                            BlockRun.outQueueRun(channel);
                        }
                    },
                    callBackInfo:callBackInfo
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
                            callBackInfo.reslove(runRes);
                            if(queue[channel]!=undefined)queue[channel].shift();
                            BlockRun.outQueueRun(channel);
                        }
                    },
                    callBackInfo:callBackInfo
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
                            callBackInfo.reslove(runRes);
                            if(queue[channel]!=undefined)queue[channel].shift();
                            BlockRun.outQueueRun(channel);
                        }
                    },
                    callBackInfo:callBackInfo
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
        if (queue[channel]==undefined)return;
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

    static run (channel,func,checkTimeout=30000)
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
            queue[channel].push(BlockRun.getInfunc(func,channel,{
                reslove,
                reject,
                startTime:new Date().getTime()
            }));
            if(queue[channel].length==1)
            {
                BlockRun.outQueueRun(channel);
                // BlockRun.checkQueueTimeout(channel,checkTimeout)
            }
        });
    }
    static checkQueueTimeout(channel,checkTimeout)
    {
        let nowTime = new Date().getTime();
        if (queue[channel]!=undefined && queue[channel].length>0){
            BlockRun.outQueueRun(channel);
            setTimeout(()=>{
                BlockRun.checkQueueTimeout(channel,checkTimeout)
            },checkTimeout);
        }
    }

    static getQueue()
    {
        return queue;
    }
}


module.exports = BlockRun;
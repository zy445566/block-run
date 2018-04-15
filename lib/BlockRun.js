const EventEmitter = require('events').EventEmitter; 
const co = require('co');
const queue = {};
class BlockRun{
    static getInfunc(func,channel,callBackInfo)
    {
        let tyepFunc = Object.prototype.toString.call(func);
        let runRes;
        let timer;
        switch(tyepFunc)
        {
            case '[object GeneratorFunction]':
                return {
                    func:function*(){
                        try{
                            timer = BlockRun.checkFuncTimeout(channel,callBackInfo);
                            runRes = yield func();
                        } catch(e) {
                            callBackInfo.reject(e)
                        } finally{
                            BlockRun.finallyFunc(runRes,callBackInfo,channel,timer);
                        }
                    },
                    callBackInfo:callBackInfo
                };
            break;
            case '[object AsyncFunction]':
            return {
                    func:async()=>{
                        try{
                            timer = BlockRun.checkFuncTimeout(channel,callBackInfo);
                            runRes = await func();
                        } catch(e) {
                            callBackInfo.reject(e)
                        } finally{
                            BlockRun.finallyFunc(runRes,callBackInfo,channel,timer);
                        }
                    },
                    callBackInfo:callBackInfo
                };
            break;
            default:
                return {
                    func:()=>{
                        try{
                            timer = BlockRun.checkFuncTimeout(channel,callBackInfo);
                            runRes = func();
                        } catch(e) {
                            callBackInfo.reject(e)
                        } finally{
                            BlockRun.finallyFunc(runRes,callBackInfo,channel,timer);
                        }
                    },
                    callBackInfo:callBackInfo
                };
            break;
        }
    }

    static checkFuncTimeout(channel,callBackInfo)
    {
        if(callBackInfo.funTimeout<=-1)return;
        callBackInfo.startTime = new Date().getTime();
        return setTimeout(()=>{
            let nowTime = new Date().getTime();
            if(queue[channel]!=undefined && queue[channel].length>0)
            {
                if(queue[channel][0].callBackInfo.startTime<nowTime-queue[channel][0].callBackInfo.funTimeout)
                {
                    queue[channel][0].callBackInfo.reject(new Error('this function is timeout!'));
                    queue[channel][0].callBackInfo.is_out = true;
                    queue[channel].shift();
                    BlockRun.outQueueRun(channel);
                }
            }
        },callBackInfo.funTimeout);
    }

    static finallyFunc(runRes,callBackInfo,channel,timer)
    {
        if(!callBackInfo.is_out){
            callBackInfo.reslove(runRes);
            if(queue[channel]!=undefined)queue[channel].shift();
            BlockRun.outQueueRun(channel);
            clearTimeout(timer);
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

    static run (channel,func,funTimeout=-1)
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
                is_out:false,
                funTimeout:funTimeout
            }));
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
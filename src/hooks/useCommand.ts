import { Ref,getCurrentInstance,onUnmounted,ComputedRef } from 'vue';
import deepcopy from 'deepcopy';    // 深拷贝插件
// import { events } from "../utils/event";
import { dataInterface } from '../utils/dataJsonCheck';
import { blockInterface } from '../utils/dataJsonCheck';
import { focusDataInterface } from './useFocus';


interface commandInterface {
    name:string,
    keyboard?:string,
    pushQueue?:boolean,
    execute:Function,
    init?:Function,
    before?:blockInterface[] | null
} 
interface stateInterface {
    current:number,
    queue:{
        doIt:Function,
        undo?:Function
    }[],
    commands:{
        [propName:string]:Function
    },
    commandArray:commandInterface[],
    destoryArray:any
}
export function useCommand(data:Ref<dataInterface>,focusData:ComputedRef<focusDataInterface>){
    const curInstance = getCurrentInstance();
    const state:stateInterface = {
        current:-1,   // 前进后退的索引值
        queue:[],   // 获取所有操作命令
        commands:{},   // 命令和执行功能 映射表
        commandArray:[] as commandInterface[], // 存放所有命令
        destoryArray:[]
    }

    const registy = (command:commandInterface) => {
        state.commandArray.push(command);
        state.commands[command.name] = (...args) => {    // 命令名字 对应的 执行函数
            const {doIt,undo} = command.execute(...args);
            doIt();
            if(!command.pushQueue) return  // 不需要放到队列 直接跳过
            let {queue,current} = state;
            if(queue.length > 0){
                queue = queue.slice(0,current + 1);
                state.queue = queue;
            }
            queue.push({doIt,undo})   // 保存指令前进后退
            state.current = current + 1;
        }
    }

    // 注册命令
   
    registy({   // 重做(还原)
        name:"redo",    
        keyboard:'ctrl+y',
        execute(){
            return {
                doIt(){
                    let item = state.queue[state.current+1]; 
                    item && item.doIt && item.doIt();
                    state.current++; 
                }
            }
        }
    })
    registy({   // 撤销
        name:"undo",
        keyboard:'ctrl+z',
        execute(){
            return {
                doIt(){
                    if(state.current == -1) return    // 没有可以撤销的了
                    let item = state.queue[state.current];
                    item && item.undo && item.undo();
                    state.current--;
                }
            }
        }
    })
    registy({   // 如果希望将操作 放到队列中 可以增加一个属性标识
        name:"drag",
        pushQueue:true,
        init(){   // 默认执行
            this.before = null;
            // 监控拖拽开始事件 保存状态
            const start = () => this.before = deepcopy(data.value.blocks)
            // 拖拽之后 触发对应指令
            const end = () => state.commands.drag();
            
            curInstance?.proxy?.$Bus.on('start',start);
            curInstance?.proxy?.$Bus.on('end',end);
            return () => {  // 解绑(销毁)
                curInstance?.proxy?.$Bus.off('start',start);
                curInstance?.proxy?.$Bus.off('end',end);
            }
        },
        execute(){
            let before = this.before;   // 之前的状态
            let after = data.value.blocks;  // 之后的状态
            return {
                doIt(){
                    // 默认拖拽松手  存储当前的 
                    data.value = {...data.value,blocks:after}                    
                },
                undo(){
                    // 前一步
                    data.value = {...data.value,blocks:before as blockInterface[] }                    
                }
            }
        }
    });
    registy({
        name:'updateContainer',   // 更新整个容器
        pushQueue:true,
        execute(newVal){
            let state = {
                before:data.value,   // 当前值
                after:newVal    // 新值
            }
            return {
                doIt(){
                    data.value = state.after                    
                },
                undo(){
                    data.value = state.before                    
                }
            }

        }
    });
    registy({   // 置顶
        name:"placeTop",
        pushQueue:true,
        execute(){
            let before = deepcopy(data.value.blocks);   // 之前的数据保存
            let after = (() => {   // 置顶,所有blocks(组件) 找到zIndex 最大值
                let { focus,unfocus } = focusData.value;
                let maxZindex = unfocus.reduce((prev,block) => {
                    return Math.max(prev,block.zIndex); 
                },-Infinity);
                focus.forEach(block => block.zIndex = maxZindex+1);   // 将当前选中的组件添加 zIndex层级
                return data.value.blocks 
            })()
            return {
                doIt(){
                    data.value = {...data.value,blocks:after} 
                },
                undo(){
                    // 如果 当前 blocks 前后一致,则不会触发页面更新(深拷贝解决该问题)
                    data.value = {...data.value,blocks:before} 
                }
            }
        }
    });
    registy({   // 置底
        name:"placeBottom",
        pushQueue:true,
        execute(){
            let before = deepcopy(data.value.blocks);   // 之前的数据保存
            let after = (() => {   // 置顶,所有blocks(组件) 找到zIndex 最小值
                let { focus,unfocus } = focusData.value;
                let minZindex = unfocus.reduce((prev,block) => {
                    return Math.min(prev,block.zIndex); 
                },Infinity) - 1;
                if(minZindex < 0) {
                    const dur = Math.abs(minZindex);
                    minZindex = 0;
                    unfocus.forEach(block => block.zIndex += dur)
                }
                focus.forEach(block => block.zIndex = minZindex);   // 将当前选中的组件添加 zIndex层级
                // focus.forEach(block => block.zIndex = minZindex+1);   // 将当前选中的组件添加 zIndex层级
                return data.value.blocks 
            })()
            return {
                doIt(){
                    data.value = {...data.value,blocks:after} 
                },
                undo(){
                    // 如果 当前 blocks 前后一致,则不会触发页面更新(深拷贝解决该问题)
                    data.value = {...data.value,blocks:before} 
                }
            }
        }
    });

    registy({   // 删除
        name:'delete',
        pushQueue:true,
        execute(){
            let state = {
                before:deepcopy(data.value.blocks),   // 当前值
                after:focusData.value.unfocus    // 选中都删除掉,留下没选中的
            }
            return {
                doIt(){
                    data.value = {...data.value,blocks:state.after}                    
                },
                undo(){
                    data.value = {...data.value,blocks:state.before}                    
                }
            }

        }
    });



    const keyBoardEvent = (() => {   // 键盘事件
        const keyCodes = {
            90:'z',
            80:'y'
        }
        const onKeyDown = (e) => {
            const {ctrlKey,keyCode} = e; 
            let keyString:Array<string> | string = [];
            if(ctrlKey) keyString.push('ctrl');
            keyString.push(keyCodes[keyCode]);
            keyString = keyString.join('+'); 
            state.commandArray.forEach(({keyboard,name}) => {
                if(!keyboard) return   // 没有键盘事件
                if(keyboard === keyString){
                    state.commands[name]();
                    e.preventDefault()
                }
            })
        }
        const init = () => {  // 初始化事件
            window.addEventListener('keydown',onKeyDown);
            return () => {    //  销毁事件
                window.removeEventListener('keydown',onKeyDown);
            }
        }
        return init
    })()
    // 进入有页面就会执行
    ;(() => {
        // 监听 键盘事件
        state.destoryArray.push(keyBoardEvent());
        state.commandArray.forEach((command:commandInterface) => command.init && state.destoryArray.push(command.init()) )
    })();

    onUnmounted(() => {   // 销毁事件
        state.destoryArray.forEach((fn:Function) => fn&&fn())
    })

    return state
}
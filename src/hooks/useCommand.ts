import { Ref, onMounted } from 'vue';
import deepcopy from 'deepcopy';    // 深拷贝插件
import { events } from "@/utils/event";
import { dataInterface } from '../utils/dataJsonCheck';
import { blockInterface } from '../utils/dataJsonCheck';


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
    queue:[],
    commands:{
        [propName:string]:Function
    },
    commandArray:commandInterface[],
    destoryArray:any
}

export function useCommand(data:Ref<dataInterface>){
    const state:stateInterface = {
        current:-1,   // 前进后退的索引值
        queue:[],   // 获取所有操作命令
        commands:{},   // 命令和执行功能 映射表
        commandArray:[] as commandInterface[], // 存放所有命令
        destoryArray:[]
    }

    const registy = (command:commandInterface) => {
        state.commandArray.push(command);
        state.commands[command.name] = () => {    // 命令名字 对应的 执行函数
            const {doIt} = command.execute();
            doIt();
        }
    }

    // 注册命令
   
    registy({   // 重做
        name:"redo",    
        keyboard:'ctrl+y',
        execute(){
            return {
                doIt(){
                    console.log('重做');
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
                    console.log('撤销');
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
            events.on('start',start)   // 监控拖拽前
            events.on('end',end)   // 监控拖拽后

            return () => {  // 解绑(销毁)
                events.off('start',start)
                events.off('end',end)
            }
        },
        execute(){
            let befor = this.before;   // 之前的状态
            let after = data.value.blocks;  // 之后的状态
            return {
                doIt(){
                    // 默认拖拽松手  存储当前的 
                    data.value = {...data.value,...after}                    
                },
                undo(){
                    // 前一步
                    data.value = {...data.value,...befor}                    
                }
            }
        }
    });


    (() => {
        state.commandArray.forEach((command:commandInterface) => {
            command.init && state.destoryArray.push(command.init()) 
        })
    })()

    onMounted(() => {   // 清理绑定事件
        state.destoryArray.forEach((fn:Function) => fn&&fn())
    })
    return state
}
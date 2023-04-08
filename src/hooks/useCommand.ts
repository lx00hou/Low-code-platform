interface commandInterface {
    name:string,
    keyboard:string,
    execute:Function
} 
interface stateInterface {
    current:number,
    queue:[],
    commands:{
        [propName:string]:Function
    },
    commandArray:commandInterface[]
}

export function useCommand(){
    const state:stateInterface = {
        current:-1,   // 前进后退的索引值
        queue:[],   // 获取所有操作命令
        commands:{},   // 命令和执行功能 映射表
        commandArray:[] as commandInterface[] // 存放所有命令
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


    return state
}
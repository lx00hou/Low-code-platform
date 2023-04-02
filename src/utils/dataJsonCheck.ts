// dataJson block(画布组件)模板数据校验
export interface blockInterface {
    top:number,
    left:number,
    zIndex:number,
    key:string,
    focus?:boolean,
    alignCenter?:boolean
}

export interface dataInterface {
    container:{
        width:number,
        height:number
    },
    blocks:blockInterface[]
}
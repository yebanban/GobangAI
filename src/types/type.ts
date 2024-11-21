interface Board {
    state: 0 | 1 | 2,
    x: number,
    y: number
}
interface Foot {
    x: number,
    y: number,
    role: 1 | 2,
    footNum: number
}
export type{Board,Foot}
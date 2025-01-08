import { CHESS } from "../common/constant"

interface Board {
    state: 0 | 1 | 2,
    x: number,
    y: number,
    highLight: boolean
}
interface Foot {
    x: number,
    y: number,
    role: 1 | 2
}
interface MinMaxNode {
    x: number,
    y: number,
    score: number,
}
interface Score {
    [key:number]: number,
}
interface Word {
    str: string,
    score: CHESS
}

export type { Board, Foot, Score, MinMaxNode, Word }
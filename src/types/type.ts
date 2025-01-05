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
    depth: number
}
interface Score {
    score: number,
    depth: number
}
export type { Board, Foot, Score, MinMaxNode }
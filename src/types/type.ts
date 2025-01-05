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
interface Score {
    score: number,
    step: number
}
interface ScoreArrayModifyTheRecord {
    x: number,
    y: number,
    oldScore: number,
    newScore: number
}
export type { Board, Foot, Score,ScoreArrayModifyTheRecord }
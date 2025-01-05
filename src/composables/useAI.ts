import { Ref, ref } from "vue";
import { Board, Score, ScoreArrayModifyTheRecord } from "../types/type";

const useAI = (
    width: number, height: number, boards: Ref<Board[][]>,
    zobrist: Ref<number>, playRole: Ref<1 | 2>,
    fall: (x: number, y: number, state: 1 | 2) => void,
    undo: () => void
) => {
    const zobristHash = new Map<number, Score>()
    const direction = [[0, 1], [1, 0], [1, 1], [-1, 1]]
    let score = 0
    const rowScore = new Array(height).fill(0)
    const colScore = new Array(width).fill(0)
    const diagonals = new Array(width + height - 1).fill(0)
    const antiDiagonals = new Array(width + height - 1).fill(0)
    const calculate = (str: string) => {
        console.log(str)
        return 0
    }
    const getRowScore = (row: number) => {
        let str = '_'
        for (let i = 0; i < width; i++) {
            const state = boards.value[row][i].state
            str += state == playRole.value ? '2' : state == 0 ? '0' : '1'
        }
        str += '_'
        return calculate(str)
    }
    const getColScore = (col: number) => {
        let str = '_'
        for (let i = 0; i < height; i++) {
            const state = boards.value[i][col].state
            str += state == playRole.value ? '2' : state == 0 ? '0' : '1'
        }
        str += '_'
        return calculate(str)
    }
    const getDiaScore = (dia: number) => { //0~(width+height-1)
        let str = '_'
        for (let i = Math.min(dia, height - 1), j = dia - i; i >= 0 && j < width; i--, j++) {
            const state = boards.value[i][j].state
            str += state == playRole.value ? '2' : state == 0 ? '0' : '1'
        }
        str += '_'
        return calculate(str)
    }
    const getAntiDiaScore = (antiDia: number) => { // -width+1 ~ height-1
        let str = '_'
        for (let i = Math.max(antiDia, 0), j = -antiDia + i; i < height && j < width; i++, j++) {
            const state = boards.value[i][j].state
            str += state == playRole.value ? '2' : state == 0 ? '0' : '1'
        }
        str += '_'
        return calculate(str)
    }
    const getScore = () => {
        score = 0
        for (let i = 0; i < height; i++) {
            rowScore[i] = getRowScore(i)
            score += rowScore[i]
        }
        for (let i = 0; i < width; i++) {
            colScore[i] = getColScore(i)
            score += colScore[i]
        }
        for (let i = 0; i < height + width - 1; i++) {
            diagonals[i] = getDiaScore(i)
            score += diagonals[i]
        }
        for (let i = 0; i < height + width - 1; i++) {
            antiDiagonals[i] = getAntiDiaScore(i - width + 1)
            score += antiDiagonals[i]
        }
        return score
    }
    //返回指定坐标四个方向的得分
    const evaluationPosition = (x: number, y: number) => {
        return [getRowScore(x), getColScore(y), getDiaScore(x + y), getAntiDiaScore(x - y)]
    }

    const getAllCanFall = () => {
        return [[0, 0]]
    }
    const minimax = (x: number, y: number, depth: number, alpha: number, beta: number, b: Board[][], zobrist: number) => {
        const isMax = depth % 2 == 0
        if (depth === 0) {
            const newScore = score
            return newScore
        }
        const allCanFall = getAllCanFall()
        if (isMax) { //max层
            for (const [x, y] of allCanFall) {

            }
        }

    }
    const aiGo = () => {
        let x: number, y: number
        do {
            x = Math.floor(Math.random() * height)
            y = Math.floor(Math.random() * width)
        } while (boards.value[x][y].state !== 0)
        return [x, y]
    }

    return { aiGo }
}
export default useAI
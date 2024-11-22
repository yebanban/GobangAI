import { ref } from "vue";
import { Board, Score, ScoreArrayModifyTheRecord } from "../types/type";

const useAI = (width: number, height: number, boards: Board[][], role: 1 | 2) => {
    const zobristHash = new Map<number, Score>()
    const direction = [[0, 1], [1, 0], [1, 1], [-1, 1]]
    let score = 0
    let scoreArray = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => [0, 0, 0, 0]))
    const aiReset = (r: 1 | 2) => {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                scoreArray[i][j] = [0, 0, 0, 0]
            }
        }
        score = 0
        role = r
    }
    //修改指定坐标指定方向的得分,并返回该点的原分数
    const updateOneDirScore = (x: number, y: number, dirIndex: number, newScoreDir: number) => {
        const oldScoreDir = scoreArray[x][y][dirIndex]
        score -= oldScoreDir
        score += newScoreDir
        scoreArray[x][y][dirIndex] = newScoreDir
        return oldScoreDir
    }
    //评测某个点指定方向的得分
    const evaluation = (x: number, y: number, dirIndex: number, b: Board[][]) => {
        return 0
    }
    //落子后，修改受到影响的棋子的得分，并返回被修改的所有点的修改记录，后面可以按需求退回修改操作
    const updateScore = (x: number, y: number, b: Board[][]) => {
        let modifyTheRecord: ScoreArrayModifyTheRecord[] = []
        for (let i = 0; i < direction.length; i++) {
            const [dx, dy] = direction[i]
            let nx = x, ny = y
            while (0 > nx || nx >= height || 0 > ny || ny >= width || b[nx][ny].state == 0) {
                const scoreDir = evaluation(nx, ny, i, b)
                const oldScoreDir = updateOneDirScore(nx, ny, i, scoreDir)
                modifyTheRecord.push({ x: nx, y: ny, oldScore: oldScoreDir, newScore: scoreDir })
                nx += dx
                ny += dy
            }
            nx = x - dx, ny = x - dy
            while (0 > nx || nx >= height || 0 > ny || ny >= width || b[nx][ny].state == 0) {
                const scoreDir = evaluation(nx, ny, i, b)
                const oldScoreDir = updateOneDirScore(nx, ny, i, scoreDir)
                modifyTheRecord.push({ x: nx, y: ny, oldScore: oldScoreDir, newScore: scoreDir })
                nx -= dx
                ny -= dy
            }
        }
        return modifyTheRecord
    }
    const getAllCanFall = (b: Board[][]) => {
        return [[0, 0]]
    }
    const minimax = (x: number, y: number, depth: number, alpha: number, beta: number, b: Board[][], zobrist: number) => {
        const isMax = depth % 2 == 0
        if (depth === 0) {
            const modifyTheRecord = updateScore(x, y, b)
            const newScore=score
            return newScore
        }
        const allCanFall = getAllCanFall(b)
        if (isMax) { //max层
            for (const [x, y] of allCanFall) {

            }
        }

    }
    const aiGo = (zobrist: number) => {
        let x: number, y: number
        do {
            x = Math.floor(Math.random() * height)
            y = Math.floor(Math.random() * width)
        } while (boards[x][y].state !== 0)
        return [x, y]
    }

    return { aiGo, aiReset }
}
export default useAI
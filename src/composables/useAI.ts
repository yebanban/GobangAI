import { Ref } from "vue";
import { Board, MinMaxNode, Score } from "../types/type";
const MAX = 10 ** 9
const MIN = -(10 ** 9)
//如果自己或对手的上一步形成了冲四和活三以上的棋型，则只考虑这一步点位的周围位置，否则考虑所有可落点位置。
const useAI = (
    width: number, height: number, boards: Ref<Board[][]>,
    zobrist: Ref<number>, playRole: Ref<1 | 2>,
    fall: (x: number, y: number, state: 1 | 2) => void,
    undo: () => void
) => {
    const zobristHash = new Map<number, Score>()
    const direction = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]]
    let score = 0
    const rowScore = new Array<number>(height).fill(0)
    const colScore = new Array<number>(width).fill(0)
    const diagonals = new Array<number>(width + height - 1).fill(0)
    const antiDiagonals = new Array<number>(width + height - 1).fill(0)
    let cnt = 0
    const calculate = (str: string) => {
        let result = 0
        let flag = false
        let blocked = 1
        let number = 0
        for (let i = 0; i < str.length; i++) {
            cnt++
            if (str[i] == '1') {
                if (!flag) {
                    if (str[i - 1] != '0') {
                        blocked = 0.1
                    }
                    flag = true
                }
                number++
                if(number==5) return MAX
            } else {
                if (flag) {
                    if (str[i] != '0') {
                        blocked = blocked == 1 ? 0.1 : 0
                    }
                    result += Math.floor(10 ** (number - 1) * blocked)

                    flag = false
                    blocked = 1
                    number = 0
                }
            }
        }
        for (let i = 0; i < str.length; i++) {
            cnt++
            if (str[i] == '2') {
                if (!flag) {
                    if (str[i - 1] != '0') {
                        blocked = 0.1
                    }
                    flag = true
                }
                number++
                if(number==5) return MIN
            } else {
                if (flag) {
                    if (str[i] != '0') {
                        blocked = blocked == 1 ? 0.1 : 0
                    }
                    result -= Math.floor(10 ** (number - 1) * blocked)
                    flag = false
                    blocked = 1
                    number = 0
                }
            }
        }
        return result
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
        let positions = []
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (boards.value[i][j].state !== 0) continue
                for (const [dx, dy] of direction) {
                    let nx = i + dx, ny = j + dy
                    if (0 <= nx && nx < height && 0 <= ny && ny < width && boards.value[nx][ny].state !== 0) {
                        positions.push([i, j])
                        break
                    }
                    nx = i + 2 * dx, ny = j + 2 * dy
                    if (0 <= nx && nx < height && 0 <= ny && ny < width && boards.value[nx][ny].state !== 0) {
                        positions.push([i, j])
                        break
                    }
                }
            }
        }
        return positions
    }
    const updateScore = (x: number, y: number) => {
        const tempScores = [rowScore[x], colScore[y], diagonals[x + y], antiDiagonals[x - y + width - 1]]
        const scores = evaluationPosition(x, y)
        rowScore[x] = scores[0]
        colScore[y] = scores[1]
        diagonals[x + y] = scores[2]
        antiDiagonals[x - y + width - 1] = scores[3]
        score = score - tempScores.reduce((pre, score) => pre + score) + scores.reduce((pre, score) => pre + score)
        return tempScores
    }
    const undoScore = (x: number, y: number, tempScores: number[]) => {
        score = score + tempScores.reduce((pre, score) => pre + score) - (rowScore[x] + colScore[y] + diagonals[x + y] + antiDiagonals[x - y + width - 1])
        rowScore[x] = tempScores[0]
        colScore[y] = tempScores[1]
        diagonals[x + y] = tempScores[2]
        antiDiagonals[x - y + width - 1] = tempScores[3]
    }
    const minimax = (depth: number, alpha: number, beta: number, player: 1 | 2) => {
        const isMax = depth % 2 == 0
        if (depth === 0) {
            return { x: -1, y: -1, score, depth: 0 }
        }
        //获取可下点位
        let allCanFall = getAllCanFall().map(([x, y]) => ({ x, y, score: 0 }))

        //计算当前走一步的得分，并排序，max层按得分高到低，min层按低到高，这样剪枝的可能性会更大
        if (depth > 1) { //如果已经走到最后一步，则不需要排序
            for (const position of allCanFall) {
                fall(position.x, position.y, player)
                const [row, col, dia, antiDia] = evaluationPosition(position.x, position.y)
                position.score = row + col + dia + antiDia
                    - rowScore[position.x]
                    - colScore[position.y]
                    - diagonals[position.x + position.y]
                    - antiDiagonals[position.x - position.y + width - 1]
                undo()
            }
            allCanFall.sort((a, b) => isMax ? b.score - a.score : a.score - b.score)
            allCanFall = allCanFall.slice(0, 30)
        }

        if (isMax) {
            const maxNode = { x: 7, y: 7, score: MIN, depth }
            for (const position of allCanFall) {
                cnt++
                fall(position.x, position.y, player)
                const tempScores = updateScore(position.x, position.y)
                const hashvalue = zobristHash.get(zobrist.value)
                let node: MinMaxNode
                if (hashvalue !== undefined && hashvalue.depth >= depth - 1) {
                    node = { x: -1, y: -1, score: hashvalue.score, depth: depth - 1 }
                } else {
                    node = minimax(depth - 1, alpha, beta, player == 1 ? 2 : 1)
                    zobristHash.set(zobrist.value, { score: node.score, depth: depth - 1 })
                }
                undoScore(position.x, position.y, tempScores)
                undo()
                if (node.score > maxNode.score) {
                    maxNode.x = position.x
                    maxNode.y = position.y
                    maxNode.score = node.score
                    alpha = maxNode.score
                }
                if (node.score >= beta) {
                    break
                }
            }
            return maxNode
        }
        const minNode = { x: -1, y: -1, score: MAX, depth }
        for (const position of allCanFall) {
            cnt++
            fall(position.x, position.y, player)
            const tempScores = updateScore(position.x, position.y)
            const hashvalue = zobristHash.get(zobrist.value)
            let node: MinMaxNode
            if (hashvalue !== undefined && hashvalue.depth >= depth - 1) {
                node = { x: -1, y: -1, score: hashvalue.score, depth: depth - 1 }
            } else {
                node = minimax(depth - 1, alpha, beta, player == 1 ? 2 : 1)
                zobristHash.set(zobrist.value, { score: node.score, depth: depth - 1 })
            }
            undoScore(position.x, position.y, tempScores)
            undo()
            if (node.score < minNode.score) {
                minNode.x = position.x
                minNode.y = position.y
                minNode.score = node.score
                beta = minNode.score
            }
            if (node.score <= alpha) {
                break
            }
        }
        return minNode
    }
    const aiGo = () => {
        getScore()
        cnt = 0
        const maxNode = minimax(4, MIN, MAX, playRole.value == 1 ? 2 : 1)
        console.log(cnt)
        console.log(maxNode.score)
        console.log(zobristHash)
        return [maxNode.x, maxNode.y]
    }

    return { aiGo }
}
export default useAI
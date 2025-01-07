import { Ref } from "vue";
import { Board, MinMaxNode, Score } from "../types/type";
import { CHESS_TYPE, MAX, MIN } from "../common/constant";
import { ACAutomaton } from "../common/utils";

//如果自己或对手的上一步形成了冲四和活三以上的棋型，则只考虑这一步点位的周围位置，否则考虑所有可落点位置。
//获取可落子点时需要判断这个点是在进攻还是防守（同时进攻与防守的话，记为防守）判断方法：每次遍历到棋型后，得到棋型起点下标与棋型长度，如果这个点在棋型内
//根据棋型得分正负与该点的字符判断出是进攻或防守
//1.如果对手的上一步形成了活三，那么可落子点要么是防守并使得分增加（活三-冲三）以上，要么是进攻并使得分增加（冲四-冲三）（比活三-冲三得分要更高）以上
//2.如果对手的上一步形成了冲四，那么可落子点要么是防守并使得分增加冲四以上，要么是进攻并使得分增加（五-活四）以上
//3.如果对手的上一步形成了活四，那么可落子点要么是防守并使得分增加（活四-冲四）以上，要么是进攻并使得分增加（五-冲四）以上
//4.如果自己的上一步形成了活三，那么可落子点要么是防守并使得分增加冲四以上，要么是进攻并使得分增加（活四-活三）以上
//5.如果自己的上一步形成了冲四以上，只考虑得分增加（五-活四）以上
//满足14，只考虑4
//满足24，只考虑2
//满足34，只考虑3
//满足5，只考虑5
//新增一个判断函数，在每次递归搜索时都要判断自己与对手的上一步棋的周围是否形成活三冲四活四。
//方法：在ac自动机上的节点的score属性上新增一个棋型属性，判断函数使用ac自动机搜索时，只看自己的棋子棋型，不看对手的。


const useAI = (
    width: number, height: number, boards: Ref<Board[][]>,
    zobrist: Ref<number>, playRole: Ref<1 | 2>,
    fall: (x: number, y: number, state: 1 | 2) => void,
    undo: () => void
) => {
    const zobristHash = new Map<number, Score>()
    const direction = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]]

    const ac = new ACAutomaton(CHESS_TYPE)
    ac.buildQuickFail(['0', '1', '2', '_'])
    let score = 0
    const rowScore = new Array<number>(height).fill(0)
    const colScore = new Array<number>(width).fill(0)
    const diagonals = new Array<number>(width + height - 1).fill(0)
    const antiDiagonals = new Array<number>(width + height - 1).fill(0)
    let cnt = 0
    let pre = 0
    let cur = 0
    
    const calculate = (str: string) => {
        let result=0
        ac.quickQuery(str, (score: number) => {
            result+=score
        })
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
        //为了提高决策树最后一层的效率，该方法需要优化，优化方式：用Set存储可落子位置，每次落子后，都将落子位置从Set中删除，并把周围的16个点加入Set中
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
        pre += allCanFall.length
        //计算当前走一步的得分，并排序，max层按得分高到低，min层按低到高，这样剪枝的可能性会更大
        if (depth > 1) { //如果已经走到最后一步，则不需要计算并排序，因为计算成本过大，大于剪枝的优化
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
            if (score * (isMax ? -1 : 1) > 900) {
                allCanFall = allCanFall.filter(position => position.score * ((isMax ? 1 : -1)) >= 1000)
            }else if (score * (isMax ? -1 : 1) > 90) {
                allCanFall = allCanFall.filter(position => position.score * ((isMax ? 1 : -1)) >= 100)
            }
            allCanFall.sort((a, b) => isMax ? b.score - a.score : a.score - b.score)
            allCanFall = allCanFall.slice(0, 30)

        }
        cur += allCanFall.length
        if (depth == 4)
            console.log(allCanFall)
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
                if (alpha >= beta) {
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
            if (beta <= alpha) {
                break
            }
        }
        return minNode
    }
    const aiGo = () => {
        const startTime = performance.now()
        getScore()
        cnt = 0
        pre = 0
        cur = 0
        console.log(score)
        const maxNode = minimax(4, MIN, MAX, playRole.value == 1 ? 2 : 1)
        console.log(`pre=${pre},cur=${cur}`)
        const endTime = performance.now();
        console.log(endTime - startTime + 'ms')
        console.log(cnt)
        console.log(maxNode.score)
        console.log(zobristHash)
        return [maxNode.x, maxNode.y]
    }

    return { aiGo }
}
export default useAI
import { Board, Foot, MinMaxNode, MyBoard, Score } from "../types/type";
import { CHESS, CHESS_TYPE, MAX, MIN } from "../common/constant";
import { ACAutomaton } from "../common/utils";
import { Ref } from "vue";


//计算指定点位得分时，需要统计出现的活三冲四活四数量
//方法：将ac自动机上的节点的score属性改为枚举类型的棋型属性【0：无棋型，1：电脑方冲二。。。7：玩家方冲二】，
//      搜索时，传入自己的棋色，如果是电脑方，则若棋型属性大于等于活三小于玩家方冲二，指定棋型统计数+1，如果是玩家方，同理
//在每次递归搜索时都要通过计算指定点位得分函数，判断自己与对手的上一步棋的周围是否形成活三冲四活四。
//
//若己方有冲四以上，模拟落子后选择能形成活五的点位并返回最高评分
//否则若对方有活四，模拟落子后选择当前局面最佳的落子点，并返回最低评分
//否则若对方有冲四，进行方括号内操作
//否则若己方有活三，模拟落子后选择最佳落子点，并返回最高评分
//否则若对方有活三，进行方括号内操作
// 【对所有可落子：
//      模拟落子后再次判断对手上一步棋与自己这一步棋形成的棋型类型，
//      若对方无冲四以上
//          如果 己方有活四，直接返回该点，并返回最高评分
//          否则如果对方有活三时己方有冲四以上 或 对方无活三，则将该点位放入数组
//   若数组长度为0，则必输，直接返回当前局面最佳的落子点，并返回最低评分
//   否则对数组内的点位进行计算】
//
//否则，正常对每个可落子点进行局面计算与排序，过程中如果发现活四以上棋型，直接返回最高评分

//优化方向：（按顺序进行）
//1.ref响应式数据的get与set耗时过多，先把ai用到的所有ref都改掉
//2.获取所有可落子点的耗时过多，因为需要遍历整个15*15棋盘，并遍历18个点位，每次执行需要遍历4050个点位

const useAI = (
    width: number, height: number,
    zobrist: { value: number },
    allCanFall: Map<number, number>,
    curFootNum: Ref<number>,
    fall: (myBoards: MyBoard[][], x: number, y: number, state: 1 | 2, isLast: boolean) => void,
    undo: (myBoards: MyBoard[][], isLast: boolean) => void,
    getStackTop: () => Foot | undefined,
    getStackSecond: () => Foot | undefined,
    keyToPosition: (key: number) => number[]
) => {
    const zobristHashBlack = new Map<number, Score>()
    const zobristHashWhite = new Map<number, Score>()
    const CHESS_TO_SCORE = [0, 10, 100, 100, 1000, 1000, 10000, MAX, -10, -100, -100, -1000, -1000, -10000, MIN]
    const ac = new ACAutomaton(CHESS_TYPE)
    let playRole: 1 | 2
    let myBoards: MyBoard[][] = new Array(height).fill(0).map(() => new Array(width).fill(0).map(() => ({ state: 2 })))
    ac.buildQuickFail(['0', '1', '2', '_'])
    let score = 0
    const rowScore = new Array<number>(height).fill(0)
    const colScore = new Array<number>(width).fill(0)
    const diagonals = new Array<number>(width + height - 1).fill(0)
    const antiDiagonals = new Array<number>(width + height - 1).fill(0)

    const calculate = (str: string, isAI: boolean) => {
        let result = 0, chessType = CHESS.NULL

        ac.quickQuery(str, (score: CHESS) => {
            result += CHESS_TO_SCORE[score]
            if (isAI && score <= CHESS.MY_FIVE) {
                chessType = Math.max(chessType, score)
            } else if (!isAI && score >= CHESS.RIVAL_RUSH_TWO) {

                chessType = Math.max(chessType, score - CHESS.MY_FIVE)
            }
        })
        return { result, chessType }
    }
    calculate('_0001020200000_', false)

    const getRowScore = (row: number, isAI: boolean = true) => {
        let str = '_'
        for (let i = 0; i < width; i++) {
            const state = myBoards[row][i].state
            str += state == playRole ? '2' : state == 0 ? '0' : '1'
        }
        str += '_'
        const result = calculate(str, isAI)

        return result
    }
    const getColScore = (col: number, isAI: boolean = true) => {

        let str = '_'
        for (let i = 0; i < height; i++) {
            const state = myBoards[i][col].state
            str += state == playRole ? '2' : state == 0 ? '0' : '1'
        }
        str += '_'
        const result = calculate(str, isAI)

        return result
    }
    const getDiaScore = (dia: number, isAI: boolean = true) => { //0~(width+height-1)
        let str = '_'
        for (let i = Math.min(dia, height - 1), j = dia - i; i >= 0 && j < width; i--, j++) {
            const state = myBoards[i][j].state
            str += state == playRole ? '2' : state == 0 ? '0' : '1'
        }
        str += '_'
        const result = calculate(str, isAI)

        return result
    }
    const getAntiDiaScore = (antiDia: number, isAI: boolean = true) => { // -width+1 ~ height-1
        let str = '_'
        for (let i = Math.max(antiDia, 0), j = -antiDia + i; i < height && j < width; i++, j++) {
            const state = myBoards[i][j].state
            str += state == playRole ? '2' : state == 0 ? '0' : '1'
        }
        str += '_'
        const result = calculate(str, isAI)

        return result
    }
    const getScore = () => {
        score = 0
        for (let i = 0; i < height; i++) {
            rowScore[i] = getRowScore(i).result
            score += rowScore[i]
        }
        for (let i = 0; i < width; i++) {
            colScore[i] = getColScore(i).result
            score += colScore[i]
        }
        for (let i = 0; i < height + width - 1; i++) {
            diagonals[i] = getDiaScore(i).result
            score += diagonals[i]
        }
        for (let i = 0; i < height + width - 1; i++) {
            antiDiagonals[i] = getAntiDiaScore(i - width + 1).result
            score += antiDiagonals[i]
        }
        return score
    }
    //返回指定坐标四个方向的得分
    const evaluationPosition = (x: number, y: number, isAI: boolean) => {
        let row = getRowScore(x, isAI), col = getColScore(y, isAI), dia = getDiaScore(x + y, isAI), antiDia = getAntiDiaScore(x - y, isAI)
        const result = {
            scores: [row.result, col.result, dia.result, antiDia.result],
            chessType: Math.max(row.chessType, col.chessType, dia.chessType, antiDia.chessType)
        }
        return result
    }
    const getAllCanFall = () => {
        //为了提高决策树最后一层的效率，该方法需要优化，优化方式：用Set存储可落子位置，每次落子后，都将落子位置从Set中删除，并把周围的16个点加入Set中
        let positions = []
        for (const key of allCanFall.keys()) {
            positions.push(keyToPosition(key))
        }
        return positions
    }
    const updateScore = (x: number, y: number) => {
        const tempScores = [rowScore[x], colScore[y], diagonals[x + y], antiDiagonals[x - y + width - 1]]
        const { scores } = evaluationPosition(x, y, true)
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
    const minimax = (depth: number, alpha: number, beta: number, player: 1 | 2, target: number) => {
        const isMax = depth % 2 == 0
        if (depth === 0) {
            return { x: -1, y: -1, score }
        }
        const rivalPrePosition = getStackTop(), myPrePosition = getStackSecond()
        /* let rivalPreEvaResult: { scores: number[], chessType: number }
        if (rivalPrePosition) {
            rivalPreEvaResult = evaluationPosition(rivalPrePosition.x, rivalPrePosition.y, !isMax)
        }
        let myPreEvaResult: { scores: number[], chessType: number }
        if (myPrePosition) {
            myPreEvaResult = evaluationPosition(myPrePosition.x, myPrePosition.y, isMax)
        }
        const rivalPreChessType = rivalPrePosition ? rivalPreEvaResult!.chessType : 0
        const myPreChessType = myPrePosition ? myPreEvaResult!.chessType : 0 */

        const rivalPreChessType = rivalPrePosition ? evaluationPosition(rivalPrePosition.x, rivalPrePosition.y, !isMax).chessType : 0
        const myPreChessType = myPrePosition ? evaluationPosition(myPrePosition.x, myPrePosition.y, isMax).chessType : 0

        const nextRule = { rules: [{ rivalMaxChessType: CHESS.RIVAL_FIVE, myMinChessType: CHESS.NULL }], returnImmediately: false }   //下一步棋需要满足的条件
        if (myPreChessType >= CHESS.MY_RUSH_FOUR) {  //如果己方有冲四以上，下一步己方要有五连，并在接下来的当前局面判断中立刻返回最佳局面,返回最大值
            nextRule.rules[0].myMinChessType = CHESS.MY_FIVE
            nextRule.returnImmediately = true
        } else if (rivalPreChessType >= CHESS.MY_LIVE_FOUR) { //如果对方有活四以上,在接下来的当前局面判断中立刻返回最佳局面，返回最小值
            nextRule.returnImmediately = true
        } else if (rivalPreChessType == CHESS.MY_RUSH_FOUR) { //如果对方有冲四以上，下一步如果对方有活三，自己必须有冲四,否则对方不能有活三
            nextRule.rules[0].rivalMaxChessType = CHESS.MY_RUSH_THREE
            nextRule.rules.push({ rivalMaxChessType: CHESS.MY_LIVE_THREE, myMinChessType: CHESS.MY_RUSH_FOUR })
        } else if (myPreChessType == CHESS.MY_LIVE_THREE) {  //如果己方有活三，在接下来的当前局面判断中立刻返回最佳局面，返回最大值

            nextRule.returnImmediately = true
        } else if (rivalPreChessType == CHESS.MY_LIVE_THREE) { //如果对方有活三，下一步如果对方有活三，自己必须有冲四,否则对方不能有活三
            nextRule.rules[0].rivalMaxChessType = CHESS.MY_RUSH_THREE
            nextRule.rules.push({ rivalMaxChessType: CHESS.MY_LIVE_THREE, myMinChessType: CHESS.MY_RUSH_FOUR })
        }
        //获取可下点位
        let allCanFall = getAllCanFall().map(([x, y]) => ({ x, y, score: 0, retain: false, chessType: 0 }))

        //计算当前走一步的得分，并排序，max层按得分高到低，min层按低到高，这样剪枝的可能性会更大
        if (depth > 1) { //如果已经走到最后一步，则不需要计算并排序，因为计算成本过大，大于剪枝的优化
            for (const position of allCanFall) {
                fall(myBoards, position.x, position.y, player, depth == 1)
                const myResult = evaluationPosition(position.x, position.y, isMax)
                const rivalResult = evaluationPosition(rivalPrePosition!.x, rivalPrePosition!.y, !isMax)
                const { chessType: myChessType, scores: [row, col, dia, antiDia] } = myResult
                const { chessType: rivalChessType } = rivalResult
                position.chessType = myChessType

                for (const rule of nextRule.rules) {
                    if (rivalChessType <= rule.rivalMaxChessType && myChessType >= rule.myMinChessType) {
                        position.retain = true
                    }
                }
                position.score = row + col + dia + antiDia
                    - rowScore[position.x]
                    - colScore[position.y]
                    - diagonals[position.x + position.y]
                    - antiDiagonals[position.x - position.y + width - 1]
                undo(myBoards, depth == 1)
            }

            allCanFall.sort((a, b) => isMax ? b.score - a.score : a.score - b.score)

            let bestPositionNow = allCanFall[0]  //保存最好局面
            allCanFall = allCanFall.filter(position => position.retain)
            bestPositionNow = allCanFall.length > 0 ? allCanFall[0] : bestPositionNow
            const bestNode = { x: bestPositionNow.x, y: bestPositionNow.y, score: 0 } //当前最好节点

            if (allCanFall.length == 1 && depth == target) { //无需权衡
                fall(myBoards, bestNode.x, bestNode.y, player, depth == 1)
                bestNode.score = score
                undo(myBoards, depth == 1)
                return bestNode
            }
            if (allCanFall.length == 0) {  //如果没有可下子，返回最好局面，并返回最小值
                bestNode.score = isMax ? MIN : MAX
                return bestNode
            } else if (nextRule.returnImmediately) {  //需要立刻返回
                if (myPreChessType >= CHESS.MY_RUSH_FOUR) { //己方之前有冲四，返回最好局面，返回最大值
                    bestNode.score = isMax ? MAX : MIN
                    return bestNode
                } else if (rivalPreChessType >= CHESS.MY_LIVE_FOUR) {//对方之前有活四，返回最好局面，返回最小值
                    bestNode.score = isMax ? MIN : MAX
                    return bestNode
                } else {
                    bestNode.score = isMax ? MAX : MIN    //己方之前有活三，返回最好局面，返回最大值
                    return bestNode
                }
            }
            let i = 0
            for (; i < allCanFall.length; i++) {
                if (isMax) {
                    if (allCanFall[i].score < 50) {
                        break
                    }
                } else {
                    if (allCanFall[i].score > -50) {
                        break
                    }
                }
            }
            allCanFall = allCanFall.slice(0, Math.min(18, Math.max(5, i)))
        }
        if (isMax) {
            const maxNode = { x: -1, y: -1, score: MIN - 1, step: '' }
            for (const position of allCanFall) {
                fall(myBoards, position.x, position.y, player, depth == 1)
                const tempScores = updateScore(position.x, position.y)
                let hashvalue: Score | undefined
                let node: MinMaxNode
                if (playRole == 2) {
                    hashvalue = zobristHashBlack.get(zobrist.value)
                } else {
                    hashvalue = zobristHashWhite.get(zobrist.value)
                }
                if (hashvalue !== undefined && hashvalue.depth >= depth) {
                    node = { x: -1, y: -1, score: hashvalue.value }
                } else {
                    node = minimax(depth - 1, alpha, beta, player == 1 ? 2 : 1, target)
                    if (playRole == 2) {
                        zobristHashBlack.set(zobrist.value, { value: node.score, depth })
                    } else {
                        zobristHashWhite.set(zobrist.value, { value: node.score, depth })
                    }
                }
                undoScore(position.x, position.y, tempScores)
                undo(myBoards, depth == 1)

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
        const minNode = { x: -1, y: -1, score: MAX + 1 }
        for (const position of allCanFall) {
            fall(myBoards, position.x, position.y, player, depth == 1)
            const tempScores = updateScore(position.x, position.y)

            let hashvalue: Score | undefined
            let node: MinMaxNode
            if (playRole == 2) {
                hashvalue = zobristHashBlack.get(zobrist.value)
            } else {
                hashvalue = zobristHashWhite.get(zobrist.value)
            }
            if (hashvalue !== undefined && hashvalue.depth >= depth) {
                node = { x: -1, y: -1, score: hashvalue.value }
            } else {
                node = minimax(depth - 1, alpha, beta, player == 1 ? 2 : 1, target)
                if (playRole == 2) {
                    zobristHashBlack.set(zobrist.value, { value: node.score, depth })
                } else {
                    zobristHashWhite.set(zobrist.value, { value: node.score, depth })
                }
            }

            undoScore(position.x, position.y, tempScores)
            undo(myBoards, depth == 1)
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
    const deepCopyBoards = (boards: Board[][]) => {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                myBoards[i][j].state = boards[i][j].state
            }
        }
    }
    const aiGo = (boards: Board[][], p: 1 | 2) => {
        deepCopyBoards(boards)
        playRole = p
        getScore()
        let maxNode: MinMaxNode
        if (curFootNum.value < 8) {
            for (let i = 2; i <= 6; i += 2) {
                maxNode = minimax(i, MIN, MAX, playRole == 1 ? 2 : 1, i)
                if (maxNode.score >= 9000) {
                    break
                }
            }
        } else {
            for (let i = 2; i <= 8; i += 2) {
                maxNode = minimax(i, MIN, MAX, playRole == 1 ? 2 : 1, i)
                if (maxNode.score >= 9000) {
                    break
                }
            }
        }
        return [maxNode!.x, maxNode!.y]
    }

    return { aiGo }
}
export default useAI
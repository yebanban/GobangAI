import { ref } from "vue"
import useBoards from "./useBoards"
import useRound from "./useRound"
import useAI from "./useAI"
//接下来的工作需要将zobrist和每个点得分评价的初始化操作放到useAi中，在每次ai执棋时进行初始化
const useGame = (width: number, height: number, role: 1 | 2) => {
    const isOver = ref(false)
    const refRole = ref(role)
    const { boards, zobrist, allCanFall, fall, boardsReset, undo, getStackTop, getStackSecond, fallMyBoards, undoMyBoards, keyToPosition } = useBoards(width, height, refRole)
    const { curRole, curFootNum, roundConversion, roundBack, roundReset } = useRound()
    const { aiGo } = useAI(width, height, zobrist, allCanFall,curFootNum, fallMyBoards, undoMyBoards, getStackTop, getStackSecond, keyToPosition)
    const gameOver = (winer: 1 | 2) => {
        isOver.value = true
        if (winer == refRole.value) {
            setTimeout(() => {
                alert('你赢了')
            })
        } else {
            setTimeout(() => {
                alert('你输了')
            })
        }
    }
    const roleFall = (x: number, y: number, r: 1 | 2) => {
        fall(x, y, r, true)
        if (isWin(x, y, r)) {
            gameOver(r)
            return false
        }
        roundConversion()
        return true

    }
    const aiFall = () => {
        if (curFootNum.value == 1) {
            roleFall(7, 7, refRole.value == 1 ? 2 : 1)
            return
        }
        if (curFootNum.value == 2) {
            const position = getStackTop()!
            roleFall(position.x - 1, position.y - 1, refRole.value == 1 ? 2 : 1)
            return
        }
        const [x, y] = aiGo(boards.value, refRole.value)
        roleFall(x, y, refRole.value == 1 ? 2 : 1)
    }
    const playerFall = (x: number, y: number) => {
        if (boards.value[x][y].state !== 0 || curRole.value !== refRole.value || isOver.value) return
        if (roleFall(x, y, refRole.value)) {
            setTimeout(aiFall)
        }
    }
    const isWin = (x: number, y: number, r: 1 | 2) => {
        const direction = [[0, 1], [1, 0], [1, 1], [-1, 1]]
        for (const [dx, dy] of direction) {
            let cnt = 0
            let nx = x, ny = y
            while (nx >= 0 && ny >= 0 && nx < height && ny < width && boards.value[nx][ny].state == r) {
                cnt++
                nx += dx
                ny += dy
            }
            nx = x - dx, ny = y - dy
            while (nx >= 0 && ny >= 0 && nx < height && ny < width && boards.value[nx][ny].state == r) {
                cnt++
                nx -= dx
                ny -= dy
            }
            if (cnt >= 5) return true

        }
        return false
    }
    const gameReset = (r: 1 | 2) => {
        isOver.value = false
        refRole.value = r
        boardsReset()
        roundReset()
        if (r == 2) {
            aiFall()
        }
    }
    const repentance = () => {
        if (curFootNum.value <= 2) return
        undo()
        roundBack()
        undo()
        roundBack()
    }
    return { curRole, refRole, curFootNum, boards, isOver, repentance, playerFall, gameReset }
}
export default useGame
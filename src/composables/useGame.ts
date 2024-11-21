import { ref } from "vue"
import useBoards from "./useBoards"
import useRound from "./useRound"
import useAI from "./useAI"
const useGame = (width: number, height: number, role: 1 | 2) => {
    const isOver = ref(false)
    const refRole=ref(role)
    const { boards, fall, remove, zobrist } = useBoards(width, height)
    const { curRole, curFootNum, repentance, roundConversion } = useRound(refRole.value, remove)
    const { aiGo } = useAI(width, height, boards.value, zobrist.value, refRole.value == 1 ? 2 : 1)
    const gameOver = (winer: 1 | 2) => {
        isOver.value = true
        if (winer == refRole.value) {
            alert('你赢了')
        } else {
            alert('你输了')
        }
    }
    const roleFall = (x: number, y: number, r: 1 | 2) => {
        fall(x, y, r)
        if (isWin(x, y, r)) {
            gameOver(r)
            return false
        }
        roundConversion()
        return true

    }
    const aiFall = () => {
        const [x, y] = aiGo()
        roleFall(x,y,refRole.value==1?2:1)
    }
    const playerFall = (x: number, y: number) => {
        if(boards.value[x][y].state!==0) return
        if (roleFall(x, y, refRole.value)) {
            aiFall()
        }
    }
    const isWin = (x: number, y: number, r: 1 | 2) => {
        const direction = [[0, 1], [1, 0], [1, 1],[-1,1]]
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
    return { curRole, refRole, curFootNum, boards, isOver, repentance, playerFall }
}
export default useGame
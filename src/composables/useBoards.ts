import { ref } from 'vue'
import { Board, Foot, MyBoard } from '../types/type'
import useZobrist from './useZobrist'

const useBoards = (width: number, height: number, role: { value: 1 | 2 }) => {
    const boards = ref<Board[][]>(
        Array.from({ length: height }, (_, x) =>
            Array.from({ length: width }, (_, y) => ({
                state: 0,
                x,
                y,
                highLight: false
            }))
        ))

    const direction = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [0, 2], [2, 0], [2, 2], [-2, 2], [0, -2], [-2, 0], [-2, -2], [2, -2]]
    const BASE = Math.ceil(Math.sqrt(width))
    const allCanFall = new Map<number, number>()
    const positionToKey = (x: number, y: number) => {
        return x << BASE | y
    }
    const keyToPosition = (key: number) => {
        return [key >> BASE, key - (key >> BASE << BASE)]
    }
    const fallUpdateCanFall = (x: number, y: number, myBoards: MyBoard[][]) => {
        allCanFall.delete(positionToKey(x, y))
        for (const [dx, dy] of direction) {
            const nx = x + dx, ny = y + dy
            if (0 <= nx && nx < height && 0 <= ny && ny < width && myBoards[nx][ny].state === 0) {
                const key = positionToKey(nx, ny)
                allCanFall.set(key, (allCanFall.get(key) || 0) + 1)
            }
        }
    }
    const undoUpdateCanFall = (x: number, y: number, myBoards: MyBoard[][]) => {
        let cnt = 0
        for (const [dx, dy] of direction) {
            const nx = x + dx, ny = y + dy
            if (0 <= nx && nx < height && 0 <= ny && ny < width) {
                if (myBoards[nx][ny].state === 0) {
                    const key = positionToKey(nx, ny)
                    const num = allCanFall.get(key)!
                    if (num == 1) {
                        allCanFall.delete(key)
                    } else {
                        allCanFall.set(key, num - 1)
                    }
                } else {
                    cnt++
                }
            }
        }
        if (cnt > 0) {
            allCanFall.set(positionToKey(x, y), cnt)
        }
    }
    const { zobrist, zobristFall, zobristReset } = useZobrist(boards.value)
    const boardsReset = () => {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                boards.value[i][j].state = 0
                boards.value[i][j].highLight = false
            }
        }
        zobristReset()
        clearStack()
        allCanFall.clear()
    }
    const fall = (x: number, y: number, state: 1 | 2, isSetHighLight = false) => {
        if (isSetHighLight) {
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    boards.value[i][j].highLight = false
                }
            }
            setHighLight(x, y, true)
        }
        boards.value[x][y].state = state
        zobristFall(x, y, state == role.value ? 2 : 1)
        pushStack(x, y, state)
        fallUpdateCanFall(x, y, boards.value)
    }
    const setHighLight = (x: number, y: number, isHightLight = true) => {
        boards.value[x][y].highLight = isHightLight
    }
    const remove = (x: number, y: number) => {
        zobristFall(x, y, boards.value[x][y].state == role.value ? 2 : 1)
        boards.value[x][y].state = 0
        setHighLight(x, y, false)
    }
    const stack = { value: new Array<Foot>() }
    const pushStack = (x: number, y: number, role: 1 | 2) => {
        stack.value.push({ x, y, role })
    }
    const clearStack = () => {
        stack.value = []
    }
    const undo = () => {
        const foot = stack.value.pop()
        if (!foot) return
        remove(foot.x, foot.y)
        if (stack.value.length) {
            const top = stack.value[stack.value.length - 1]
            setHighLight(top.x, top.y, true)
        }
        undoUpdateCanFall(foot.x, foot.y, boards.value)
    }
    const fallMyBoards = (myBoards: MyBoard[][], x: number, y: number, state: 1 | 2, isLast: boolean) => {
        myBoards[x][y].state = state
        zobristFall(x, y, state == role.value ? 2 : 1)
        pushStack(x, y, state)
        if (!isLast) {
            fallUpdateCanFall(x, y, myBoards)
        }

    }
    const undoMyBoards = (myBoards: MyBoard[][], isLast: boolean = false) => {
        const foot = stack.value.pop()
        if (!foot) return
        zobristFall(foot.x, foot.y, myBoards[foot.x][foot.y].state == role.value ? 2 : 1)
        myBoards[foot.x][foot.y].state = 0
        if (!isLast) {
            undoUpdateCanFall(foot.x, foot.y, myBoards)
        }

    }
    const getStackByFootNum = (footNum: number) => {
        return stack.value.length >= footNum ? stack.value[stack.value.length - footNum] : undefined
    }
    return { boards, zobrist, allCanFall, fall, boardsReset, undo, getStackByFootNum, fallMyBoards, undoMyBoards, keyToPosition }
}
export default useBoards

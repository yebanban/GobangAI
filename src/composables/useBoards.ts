import { Ref, ref } from 'vue'
import { Board, Foot } from '../types/type'
import useZobrist from './useZobrist'

const useBoards = (width: number, height: number, role: Ref<1 | 2>) => {
    const boards = ref<Board[][]>(
        Array.from({ length: height }, (_, x) =>
            Array.from({ length: width }, (_, y) => ({
                state: 0,
                x,
                y,
                highLight: false
            }))
        ))
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
    }
    const setHighLight = (x: number, y: number, isHightLight = true) => {
        boards.value[x][y].highLight = isHightLight
    }
    const remove = (x: number, y: number) => {
        zobristFall(x, y, boards.value[x][y].state == role.value ? 2 : 1)
        boards.value[x][y].state = 0
        setHighLight(x, y, false)
    }
    const stack = ref(new Array<Foot>())
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
    }
    const getStackTop = () => {
        return stack.value.length >= 1 ? stack.value[stack.value.length - 1] : undefined
    }
    const getStackSecond = () => {
        return stack.value.length >= 2 ? stack.value[stack.value.length - 2] : undefined
    }
    return { boards, zobrist, fall, boardsReset, undo, getStackTop, getStackSecond }
}
export default useBoards

import { ref } from 'vue'
import useZobrist from './useZobrist'
import { Board } from '../types/type'

const useBoards = (width: number, height: number) => {
    const { zobrist, zobristFall, zobristReset } = useZobrist(width, height)
    const boards = ref<Board[][]>(
        Array.from({ length: height }, (_, x) =>
            Array.from({ length: width }, (_, y) => ({
                state: 0,
                x,
                y,
                highLight: false
            }))
        ))

    const boardsReset = () => {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                boards.value[i][j].state = 0
                boards.value[i][j].highLight = false
            }
        }
        zobristReset()
    }
    const fall = (x: number, y: number, state: 1 | 2) => {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                boards.value[i][j].highLight = false
            }
        }
        boards.value[x][y].state = state
        boards.value[x][y].highLight = true
        zobristFall(x, y, state)
    }
    const remove = (x: number, y: number) => {
        zobristFall(x, y, boards.value[x][y].state)
        boards.value[x][y].state = 0
    }
    return { boards, fall, remove, zobrist, boardsReset }
}
export default useBoards

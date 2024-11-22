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
                y
            }))
        ))

    const boardsReset = () => {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                boards.value[i][j].state = 0
            }
        }
        zobristReset()
    }
    const fall = (x: number, y: number, state: 1 | 2) => {
        boards.value[x][y].state = state
        zobristFall(x, y, state)
    }
    const remove = (x: number, y: number) => {
        zobristFall(x, y, boards.value[x][y].state)
        boards.value[x][y].state = 0
    }
    return { boards, fall, remove, zobrist, boardsReset }
}
export default useBoards

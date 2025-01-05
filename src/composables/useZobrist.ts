import { MersenneTwister19937, Random } from "random-js"
import { ref } from "vue"
import { Board } from "../types/type"

const useZobrist = (boards: Board[][]) => {
    const random = new Random(MersenneTwister19937.autoSeed())
    const height = boards.length
    const width = boards[0].length
    const randoms = Array.from({ length: height }, () => // 0为空，1为ai，2为玩家
        Array.from({ length: width }, () => (
            [
                random.integer(1, 1000000000),
                random.integer(1, 1000000000),
                random.integer(1, 1000000000)
            ]
        ))
    )
    const zobrist = ref(0)
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            zobrist.value ^= randoms[i][j][0]
            if (boards[i][j].state !== 0) {
                zobrist.value ^= randoms[i][j][boards[i][j].state]
            }
        }
    }
    const initialValue = zobrist.value
    const zobristReset = () => {
        zobrist.value = initialValue
    }
    const zobristFall = (x: number, y: number, state: 0 | 1 | 2) => {
        zobrist.value ^= randoms[x][y][state]
    }
    return { zobrist, zobristFall,zobristReset }
}
export default useZobrist
import { MersenneTwister19937, Random } from "random-js"
import { ref } from "vue"

const useZobrist=(width: number, height: number)=>{
    const random = new Random(MersenneTwister19937.autoSeed())
    const randoms = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => (
            [
                random.integer(1, 1000000000),
                random.integer(1, 1000000000),
                random.integer(1, 1000000000)
            ]
        ))
    )
    const zobrist = ref(randoms.reduce((pre, cur) => pre ^ cur.reduce((p, c) => p ^ c[0], 0), 0))
    const zobristFall = (x: number, y: number, state:0|1|2)=>{
        zobrist.value^=randoms[x][y][state]
    }
    return {zobrist,zobristFall}
}
export default useZobrist
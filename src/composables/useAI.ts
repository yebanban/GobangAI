import { Board } from "../types/type";

const useAI = (width: number, height: number, boards: Board[][], zobrist: number, role: 1 | 2) => {
    const aiGo = () => {
        let x:number,y:number
        do {
            x = Math.floor(Math.random() * height)
            y = Math.floor(Math.random() * width)
        } while (boards[x][y].state !== 0)
        return [x, y]
    }
    return { aiGo }
}
export default useAI
import { ref } from "vue"
import { Foot } from "../types/type"

const useRound = (role: 1 | 2, remove: (x: number, y: number) => void) => {
    const curRole = ref<1 | 2>(1)
    const curFootNum = ref(0)
    const stack = ref(new Array<Foot>())
    const repentance = () => {
        if (curRole.value == role) { //如果是玩家回合，则需要悔棋两步
            stack.value.pop()
        }
        const foot = stack.value.pop()
        if (!foot) return
        remove(foot.x, foot.y)
        curFootNum.value = foot.footNum
        curRole.value = role
    }

    const roundConversion = () => {
        curRole.value = curRole.value == 1 ? 2 : 1
    }
    return { curRole, curFootNum, repentance, roundConversion }
}
export default useRound
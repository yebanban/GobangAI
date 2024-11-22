import { ref } from "vue"
import { Foot } from "../types/type"

const useRound = (role: 1 | 2, remove: (x: number, y: number) => void) => {
    const curRole = ref<1 | 2>(1)
    const curFootNum = ref(1)
    const stack = ref(new Array<Foot>())
    const repentance = () => {
        if (role == 2 && curFootNum.value == 2) return
        if (curRole.value == role) { //如果是玩家回合，则需要悔棋两步
            const foot1 = stack.value.pop()
            if (!foot1) return
            remove(foot1.x, foot1.y)
        }
        const foot2 = stack.value.pop()
        if (!foot2) return
        remove(foot2.x, foot2.y)
        curFootNum.value = foot2.footNum
        curRole.value = role
    }
    const pushStack = (x: number, y: number, role: 1 | 2, footNum: number) => {
        stack.value.push({ x, y, role, footNum })
    }
    const roundConversion = () => {
        curRole.value = curRole.value == 1 ? 2 : 1
        curFootNum.value++
    }
    const roundReset = (newRole: 1 | 2) => {
        curRole.value = 1
        curFootNum.value = 1
        role = newRole
        while (stack.value.length) {
            stack.value.pop()
        }
    }
    return { curRole, curFootNum, repentance, pushStack, roundConversion, roundReset }
}
export default useRound
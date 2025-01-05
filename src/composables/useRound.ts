import { ref } from "vue"

const useRound = () => {
    const curRole = ref<1 | 2>(1)
    const curFootNum = ref(1)
    /*  const repentance = () => {
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
         if (stack.value.length) {
             const top = stack.value[stack.value.length - 1]
             setHighLight(top.x, top.y)
         }
     } */
    const roundConversion = () => {
        curRole.value = curRole.value == 1 ? 2 : 1
        curFootNum.value++
    }
    const roundBack = () => {
        curRole.value = curRole.value == 1 ? 2 : 1
        curFootNum.value--
    }
    const roundReset = () => {
        curRole.value = 1
        curFootNum.value = 1
    }
    return { curRole, curFootNum, roundConversion, roundBack, roundReset }
}
export default useRound
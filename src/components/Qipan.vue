<template>
    <div class="qipan">
        <div v-for="row in boards" flex="~">
            <div v-for="board in row" :class="boardClass(board)" class="gezi" @click="playerFall(board.x,board.y)">
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import useGame from '../composables/useGame';
interface Board {
    state: 0 | 1 | 2,
    x: number,
    y: number
}


const Height = 15
const Width = 15
const { curRole, refRole:role, curFootNum, boards, isOver, repentance, playerFall } = useGame(Width, Height, 1)
const boardClass = (board: Board) => {
    if (board.state === 1) return 'heiqi'
    else if(board.state === 2) return 'baiqi'
    else if (!isOver.value&&curRole.value == role.value) {
        if (role.value == 1) return 'blank_hover_black'
        return 'blank_hover_white'
    } 
    return ''
}
</script>

<style lang='scss' scoped>
.qipan {
    background-image: url('./qipan.jpg');
    width: 532px;
    height: 532px;
    border-radius: 3px;
    padding-left: 3px;
    padding-top: 3px;

    .gezi {
        width: 35px;
        height: 35px;
    }
}

.heiqi {
    background-image: url('./heiqi.png');
}

.baiqi {
    background-image: url('./baiqi.png');
}

.blank_hover_black:hover {
    cursor: pointer;
    background-image: url('./heiqi.png');
}

.blank_hover_white:hover {
    cursor: pointer;
    background-image: url('./baiqi.png');
}
</style>
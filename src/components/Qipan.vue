<template>
    <div class="qipan">
        <div v-for="row in boards" flex="~">
            <div v-for="board in row" :class="boardClass(board)" class="gezi" @click="playerFall(board.x, board.y)">
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'

import { Board } from '../types/type';
type GameInfo = {
    boards: Board[][],
    playerFall: (x: number, y: number) => void,
    isOver: boolean,
    role: 1 | 2,
    curRole: 1 | 2
}
interface Props{
    gameInfo:GameInfo
}
const props = defineProps<Props>()
const {boards,isOver,role,curRole,playerFall}=props.gameInfo
//
const boardClass = (board: Board) => {
    if (board.state === 1) return 'heiqi'
    else if(board.state === 2) return 'baiqi'
    else if (!props.gameInfo.isOver&&props.gameInfo.curRole == props.gameInfo.role) {
        if (props.gameInfo.role == 1) return 'blank_hover_black'
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
    box-shadow: 1px -1px 1px #777;
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
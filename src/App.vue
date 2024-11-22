<script setup lang="ts">
import Qipan from './components/Qipan.vue'
import useGame from './composables/useGame';
const Width = 15
const Height = 15
const { curRole, refRole: role, curFootNum, boards, isOver, repentance, playerFall,gameReset } = useGame(Width, Height, 1)

</script>

<template>
    <qipan class="board" :game-info="{curRole,role,boards,isOver,playerFall}"/>
    <div class="sidebar">
        <div class="roundInfo">第{{curFootNum}}步</div>
        <div class="button" @click="gameReset(1)">黑棋开始</div>
        <div class="button" @click="gameReset(2)">白棋开始</div>
        <div class="button" @click="repentance">悔棋</div>
    </div>
</template>

<style scoped>
.board {
    margin: 50px 100px;
}
.sidebar{
    width:150px;
    margin: 100px 100px;
    .roundInfo{
        text-align: center;
        font-weight: bold;
        font-size: 24px;
    }
    .button{
        margin: 20px auto;
        padding: 8px 10px;
        width:80px;
        text-align: center;
        border: 1px solid #ddd;
        border-radius: 8px;
        color:#fff;
        background: #e67e22;
        user-select: none;
        cursor: pointer;
        &:hover{
            background: #d35400;
        }
        &:active{
            background: linear-gradient(to top,#d35400,#e67e22);
        }
    }
}
</style>

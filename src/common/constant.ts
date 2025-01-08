export const MAX = 10 ** 9
export const MIN = -(10 ** 9)
export enum CHESS {
    NULL,
    MY_RUSH_TWO, MY_LIVE_TWO, MY_RUSH_THREE, MY_LIVE_THREE, MY_RUSH_FOUR, MY_LIVE_FOUR, MY_FIVE,
    RIVAL_RUSH_TWO, RIVAL_LIVE_TWO, RIVAL_RUSH_THREE, RIVAL_LIVE_THREE, RIVAL_RUSH_FOUR, RIVAL_LIVE_FOUR, RIVAL_FIVE
}
export const CHESS_TYPE = [
    { str: "11111", score: CHESS.MY_FIVE },
    { str: "011110", score: CHESS.MY_LIVE_FOUR },
    { str: "011112", score: CHESS.MY_RUSH_FOUR },
    { str: "211110", score: CHESS.MY_RUSH_FOUR },
    { str: "01111_", score: CHESS.MY_RUSH_FOUR },
    { str: "_11110", score: CHESS.MY_RUSH_FOUR },
    { str: "10111", score: CHESS.MY_RUSH_FOUR },
    { str: "11101", score: CHESS.MY_RUSH_FOUR },
    { str: "11011", score: CHESS.MY_RUSH_FOUR },
    { str: "01110", score: CHESS.MY_LIVE_THREE },
    { str: "010110", score: CHESS.MY_LIVE_THREE },
    { str: "011010", score: CHESS.MY_LIVE_THREE },

    { str: "001112", score: CHESS.MY_LIVE_TWO },
    { str: "211100", score: CHESS.MY_LIVE_TWO },
    { str: "00111_", score: CHESS.MY_LIVE_TWO },
    { str: "_11100", score: CHESS.MY_LIVE_TWO },
    { str: "010112", score: CHESS.MY_LIVE_TWO },
    { str: "211010", score: CHESS.MY_LIVE_TWO },
    { str: "01011_", score: CHESS.MY_LIVE_TWO },
    { str: "_11010", score: CHESS.MY_LIVE_TWO },
    { str: "01101_", score: CHESS.MY_LIVE_TWO },
    { str: "_10110", score: CHESS.MY_LIVE_TWO },
    { str: "011012", score: CHESS.MY_LIVE_TWO },
    { str: "210110", score: CHESS.MY_LIVE_TWO },
    { str: "11001", score: CHESS.MY_LIVE_TWO },
    { str: "10011", score: CHESS.MY_LIVE_TWO },
    { str: "10101", score: CHESS.MY_LIVE_TWO },
    { str: "2011102", score: CHESS.MY_LIVE_TWO },
    { str: "_01110_", score: CHESS.MY_LIVE_TWO },
    { str: "_011102", score: CHESS.MY_LIVE_TWO },
    { str: "201110_", score: CHESS.MY_LIVE_TWO },

    { str: "001100", score: CHESS.MY_LIVE_TWO },
    { str: "01010", score: CHESS.MY_LIVE_TWO },
    { str: "010010", score: CHESS.MY_LIVE_TWO },
    { str: "000112", score: CHESS.MY_RUSH_TWO },
    { str: "211000", score: CHESS.MY_RUSH_TWO },
    { str: "00011_", score: CHESS.MY_RUSH_TWO },
    { str: "_11000", score: CHESS.MY_RUSH_TWO },
    { str: "001012", score: CHESS.MY_RUSH_TWO },
    { str: "210100", score: CHESS.MY_RUSH_TWO },
    { str: "00101_", score: CHESS.MY_RUSH_TWO },
    { str: "_10100", score: CHESS.MY_RUSH_TWO },
    { str: "010012", score: CHESS.MY_RUSH_TWO },
    { str: "210010", score: CHESS.MY_RUSH_TWO },
    { str: "01001_", score: CHESS.MY_RUSH_TWO },
    { str: "_10010", score: CHESS.MY_RUSH_TWO },
    { str: "10001", score: CHESS.MY_RUSH_TWO },
    { str: "_01010_", score: CHESS.RIVAL_RUSH_TWO },
    { str: "_010102", score: CHESS.RIVAL_RUSH_TWO },
    { str: "201010_", score: CHESS.RIVAL_RUSH_TWO },
    { str: "2010102", score: CHESS.RIVAL_RUSH_TWO },

    { str: "22222", score: CHESS.RIVAL_FIVE },
    { str: "022220", score: CHESS.RIVAL_LIVE_FOUR },
    { str: "022221", score: CHESS.RIVAL_RUSH_FOUR },
    { str: "122220", score: CHESS.RIVAL_RUSH_FOUR },
    { str: "02222_", score: CHESS.RIVAL_RUSH_FOUR },
    { str: "_22220", score: CHESS.RIVAL_RUSH_FOUR },
    { str: "20222", score: CHESS.RIVAL_RUSH_FOUR },
    { str: "22202", score: CHESS.RIVAL_RUSH_FOUR },
    { str: "22022", score: CHESS.RIVAL_RUSH_FOUR },
    { str: "02220", score: CHESS.RIVAL_LIVE_THREE },
    { str: "020220", score: CHESS.RIVAL_LIVE_THREE },
    { str: "022020", score: CHESS.RIVAL_LIVE_THREE },
    { str: "002221", score: CHESS.RIVAL_LIVE_TWO },
    { str: "122200", score: CHESS.RIVAL_LIVE_TWO },
    { str: "00222_", score: CHESS.RIVAL_LIVE_TWO },
    { str: "_22200", score: CHESS.RIVAL_LIVE_TWO },
    { str: "020221", score: CHESS.RIVAL_LIVE_TWO },
    { str: "122020", score: CHESS.RIVAL_LIVE_TWO },
    { str: "02022_", score: CHESS.RIVAL_LIVE_TWO },
    { str: "_22020", score: CHESS.RIVAL_LIVE_TWO },
    { str: "02202_", score: CHESS.RIVAL_LIVE_TWO },
    { str: "_20220", score: CHESS.RIVAL_LIVE_TWO },
    { str: "022021", score: CHESS.RIVAL_LIVE_TWO },
    { str: "120220", score: CHESS.RIVAL_LIVE_TWO },
    { str: "22002", score: CHESS.RIVAL_LIVE_TWO },
    { str: "20022", score: CHESS.RIVAL_LIVE_TWO },
    { str: "20202", score: CHESS.RIVAL_LIVE_TWO },
    { str: "1022201", score: CHESS.RIVAL_LIVE_TWO },
    { str: "_02220_", score: CHESS.RIVAL_LIVE_TWO },
    { str: "_022201", score: CHESS.RIVAL_LIVE_TWO },
    { str: "102220_", score: CHESS.RIVAL_LIVE_TWO },

    { str: "002200", score: CHESS.RIVAL_LIVE_TWO },
    { str: "02020", score: CHESS.RIVAL_LIVE_TWO },
    { str: "020020", score: CHESS.RIVAL_LIVE_TWO },
    { str: "000221", score: CHESS.RIVAL_RUSH_TWO },
    { str: "122000", score: CHESS.RIVAL_RUSH_TWO },
    { str: "00022_", score: CHESS.RIVAL_RUSH_TWO },
    { str: "_22000", score: CHESS.RIVAL_RUSH_TWO },
    { str: "002021", score: CHESS.RIVAL_RUSH_TWO },
    { str: "120200", score: CHESS.RIVAL_RUSH_TWO },
    { str: "00202_", score: CHESS.RIVAL_RUSH_TWO },
    { str: "_20200", score: CHESS.RIVAL_RUSH_TWO },
    { str: "020021", score: CHESS.RIVAL_RUSH_TWO },
    { str: "120020", score: CHESS.RIVAL_RUSH_TWO },
    { str: "02002_", score: CHESS.RIVAL_RUSH_TWO },
    { str: "_20020", score: CHESS.RIVAL_RUSH_TWO },
    { str: "_02020_", score: CHESS.RIVAL_RUSH_TWO },
    { str: "102020_", score: CHESS.RIVAL_RUSH_TWO },
    { str: "_020201", score: CHESS.RIVAL_RUSH_TWO },
    { str: "1020201", score: CHESS.RIVAL_RUSH_TWO },
    { str: "20002", score: CHESS.RIVAL_RUSH_TWO }]
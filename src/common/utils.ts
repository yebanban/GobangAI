import { Word } from "../types/type"

class ACTrieNode {
    next: { [key: string]: ACTrieNode } = {}
    fail: ACTrieNode | null = null
    score?: number
}

export class ACAutomaton {
    private root = new ACTrieNode()
    constructor(words: Word[]) {
        for (const word of words) {
            this.insert(word)
        }
        this.buildFail()
    }
    private insert(word: Word) {
        let p = this.root
        for (const s of word.str) {
            if (!p.next[s]) {
                p.next[s] = new ACTrieNode()
            }
            p = p.next[s]
        }
        p.score = word.score
    }
    private buildFail() {
        let queue: ACTrieNode[] = []
        queue.push(this.root)
        let head = 0
        while (head < queue.length) {
            let father = queue[head++]
            for (const key in father.next) {
                if (father == this.root) {
                    father.next[key].fail = this.root
                } else {
                    let p = father.fail
                    while (!p!.next[key]) {
                        p = p!.fail
                    }
                    father.next[key].fail = p ? p.next[key] : this.root
                }
                queue.push(father.next[key])
            }
        }
    }
    buildQuickFail(characterSet: string[]) {
        let queue: ACTrieNode[] = []
        queue.push(this.root)
        let head = 0
        while (head < queue.length) {
            let cur = queue[head++]
            for (const char of characterSet) {
                if (cur.next[char]) {
                    queue.push(cur.next[char])
                } else {
                    cur.next[char] = cur.fail ? cur.fail.next[char] : this.root
                }
            }
        }
    }
    query(target: string, todo: (score: number) => unknown) {
        const n = target.length
        let cur = this.root
        for (let i = 0; i < n; i++) {
            const s = target[i]
            while (cur.fail && !cur.next[s]) {
                cur = cur.fail
            }
            if (cur.next[s]) {
                cur = cur.next[s]
                if (cur.score !== undefined) {
                    todo(cur.score)
                }
            }
        }
    }
    quickQuery(target: string, todo: (score: number) => unknown) {
        const n = target.length
        let cur = this.root
        for (let i = 0; i < n; i++) {
            const s = target[i]
            cur = cur.next[s]
            if (cur.score !== undefined) {
                todo(cur.score)
            }
        }
    }
}
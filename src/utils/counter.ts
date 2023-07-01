export function getCounter(weight = Infinity) {
    let i = 0;
    const free: number[] = [];
    return {
        get() {
            return free.length > 0 ? free.pop()! : i++;
        },
        remove(j: number) {
            if (free.length < weight) free.push(j);
        },
    };
}

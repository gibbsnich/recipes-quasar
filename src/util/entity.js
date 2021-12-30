export const nextId = (arr) => {
    return arr.reduce((s, e) => e.id > s ? e.id : s, 0) + 1;
}
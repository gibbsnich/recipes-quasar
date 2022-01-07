export const nextId = (arr) => {
    const nextId = arr.reduce((s, e) => e.id > s ? e.id : s, 0) + 1;
    return nextId ? nextId : 1;
}
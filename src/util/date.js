
function padZero(d) {
    return (d < 10) ? `0${d}` : d;
}

export const dateStringToReadableString = (d) => {
    var m = d.match(/(\d+)\-(\d+)\-(\d+)/);
    return `${m[3]}.${m[2]}.${m[1]}`;
};

export const dateToString = (d) => {
    return `${d.getYear()+1900}-${padZero(d.getMonth()+1)}-${padZero(d.getDate())}`
};

export const dateToTimeString = (d) => {
    return `${dateToString(d)}T${padZero(d.getHours())}:${padZero(d.getMinutes())}`;
};

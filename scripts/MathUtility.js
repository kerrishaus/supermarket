export function getRandomInt(max)
{
    return Math.floor(Math.random() * max);
}

// https://stackoverflow.com/a/47837835
export function clamp(val, min, max)
{
    return val > max ? max : val < min ? min : val;
}
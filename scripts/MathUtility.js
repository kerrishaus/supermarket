// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
export function getRandomInt(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

// https://stackoverflow.com/a/47837835
export function clamp(val, min, max)
{
    return val > max ? max : val < min ? min : val;
}

export function angleToPoint(a, b)
{
    return Math.atan2( b.y - a.y, b.x - a.x ) - 1.5708;
}
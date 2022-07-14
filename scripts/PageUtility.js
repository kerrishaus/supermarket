const loadedStyles = new Map();

export function addStyle(filename)
{
    const style = document.createElement("link");
    style.setAttribute("rel", "stylesheet");
    style.setAttribute("href", `./styles/${filename}.css`);
    document.head.appendChild(style);

    loadedStyles.set(filename, style);
}

export function removeStyle(filename)
{
    loadedStyles.delete(filename);
}
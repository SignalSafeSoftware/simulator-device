/** Vite inlines `?inline` imports as data URLs; the demo fixtures import their photos that way. */
declare module '*?inline' {
    const dataUrl: string;
    export default dataUrl;
}

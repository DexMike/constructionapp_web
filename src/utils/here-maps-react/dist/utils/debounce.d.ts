declare function debounce(func: (...args: any[]) => void, delay: number, immediate?: boolean): (...args: any[]) => void;
export default debounce;

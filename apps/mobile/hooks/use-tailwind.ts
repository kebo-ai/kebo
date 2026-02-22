// tailwind.js
import { create } from 'twrnc';

// Create your Tailwind configuration here
const tw = create(require(`../tailwind.config`));

export const useTailwind = () => tw;
export default tw;

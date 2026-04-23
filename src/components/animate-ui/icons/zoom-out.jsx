import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { ChevronRight } from '@/components/animate-ui/icons/chevron-right.js';
import { ChevronLeft } from '@/components/animate-ui/icons/chevron-left.js';

export default function ZoomOut() {
    return (
        <AnimateIcon className="relative w-5 h-5 gap-2" animateOnHover>
            <ChevronRight className="absolute bottom-0 left-[10px]  rotate-[-50deg] h-5 w-5" />
            <ChevronLeft className="absolute top-[10px] right-0 rotate-[-50deg] h-5 w-5" />
        </AnimateIcon>
    );
}

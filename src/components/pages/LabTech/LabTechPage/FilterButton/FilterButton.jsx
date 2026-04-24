import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu.js';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.js';
import { SlidersHorizontal } from '@/components/animate-ui/icons/sliders-horizontal.js';
import { BE_URL } from '@/lib/constans.js';

export default function FilterButton({
    filters,
    setFilters,
    fetchDataFilter,
    side = 'top' | 'bottom' | 'left' | 'right',
    sideOffset,
    align = 'start' | 'center' | 'end',
    alignOffset,
}) {
    const [position, setPosition] = useState('ALL');
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <AnimateIcon
                    animateOnHover
                    className="flex gap-1.5 border-2 p-1.5 rounded-lg items-center cursor-pointer shadow-xs transition-all duration-300 hover:shadow-sm hover:scale-[1.01] group"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="font-semibold text-sm group-hover:scale-[1.01] transition-all duration-300 select-none">
                        Bộ lọc
                    </span>
                </AnimateIcon>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-56"
                align={align}
                alignOffset={alignOffset}
                side={side}
                sideOffset={sideOffset}
            >
                <DropdownMenuLabel className="text-sm font-bold">Bộ lọc</DropdownMenuLabel>
                <DropdownMenuSeparator style={{ height: '2px' }} />
                <DropdownMenuLabel className="text-sm text-gray-400 font-medium">Trạng thái</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                    value={position}
                    onValueChange={async (value) => {
                        if (value === filters.status) return;

                        setPosition(value);
                        const updated = { ...filters, status: value };
                        setFilters(updated);
                        fetchDataFilter(updated);
                    }}
                >
                    <DropdownMenuRadioItem className="text-sm font-semibold cursor-pointer" value="ALL">
                        Tất cả
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="text-sm font-semibold cursor-pointer" value="CREATED">
                        Chờ Kết quả
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="text-sm font-semibold cursor-pointer" value="HAS_RESULT">
                        Đã có kết quả
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';

import { ArrowUpDown } from '@/components/animate-ui/icons/arrow-up-down';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { RadioGroupItem } from '@/components/animate-ui/components/radix/radio-group.js';
import { RadioGroup } from 'radix-ui';
import { BE_URL } from '@/lib/constans.js';

export default function SortButton({
    filters,
    setFilters,
    fetchDataFilter,
    side = 'top' | 'bottom' | 'left' | 'right',
    sideOffset,
    align = 'start' | 'center' | 'end',
    alignOffset,
}) {
    const [position, setPosition] = useState('new');
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <AnimateIcon
                    animateOnHover
                    className="flex gap-1.5 border-2 p-1.5 rounded-lg items-center cursor-pointer shadow-xs transition-all duration-300 hover:shadow-sm hover:scale-[1.01] group"
                >
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="font-semibold text-sm group-hover:scale-[1.01] transition-all duration-300 select-none">
                        Sắp xếp
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
                <DropdownMenuLabel className="text-sm font-bold">Sắp xếp</DropdownMenuLabel>
                <DropdownMenuSeparator style={{ height: '2px' }} />
                <DropdownMenuLabel className="text-sm text-gray-400 font-medium">Ngày tạo</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                    value={position}
                    onValueChange={async (value) => {
                        const sort = value === 'new' ? 'desc' : 'asc';

                        if (sort === filters.sort) return;
                        setPosition(value);
                        const updated = { ...filters, sort };
                        setFilters(updated);
                        fetchDataFilter(updated);
                    }}
                >
                    <DropdownMenuRadioItem className="text-sm font-semibold cursor-pointer" value="new">
                        Mới nhất
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="text-sm font-semibold cursor-pointer" value="old">
                        Cũ nhất
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
